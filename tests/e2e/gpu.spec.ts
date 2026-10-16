import { expect, test } from '@playwright/test';
import { PAGES, instrument, pending, readProbe, settle, textContrast } from './support';

/**
 * REAL-GPU CHECKS (§5.5, §7 Contrast, §11 Long tasks)
 * ===================================================
 * Only in the `gpu` project: headed system Chrome with `--use-gl=angle`, run
 * with E2E_GPU=1. Headless and Lighthouse rasterise in software, where the
 * engine's `failIfMajorPerformanceCaveat` correctly refuses to draw — so a
 * green Lighthouse says nothing about the scan. These do.
 */

test.beforeEach(async ({ page }) => {
  await instrument(page);
});

/**
 * The plan's gate reads "no long task over 50 ms". On the pre-change site
 * this exact scroll already produces long tasks — 0 to 6 per run, up to
 * 331 ms (docs/motion-depth-qa.md, "Baseline") — and Long Animation Frame
 * attribution puts them in style, layout and paint as rows pass under the
 * pointer, not in the depth layer's kind of work. A page-wide bound would be
 * noise. So the gate holds the depth code to it exactly: no script from a
 * depth chunk runs 50 ms or more in one go — shader compile and point upload
 * included, which is the plan's own reason for the rule. Every long task and
 * long script is still listed on the result, for the merge review.
 */
const DEPTH_SOURCES = /^(?:tilt|mount|pointScan|gl|depthPhoto|scene|morph|shapes|points|timeline|scanData|glyphs|fallback)\.[\w-]+\.js$/;

test('no depth script runs 50 ms while scrolling the homepage at 6× CPU throttle, scene init included @gpu', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto(PAGES.home);
  await settle(page);
  const from = (await readProbe(page)).revealedAt ?? 0;

  // Let the scene arrive (REVEAL → idle → shapes built), then scroll the
  // whole page the way a thumb does: short flicks, short pauses.
  await page.waitForTimeout(4000);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 240) {
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1000);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  const probe = await readProbe(page);
  const frames = probe.frames.filter((f) => f.start >= from);
  const scripts = frames.flatMap((f) => f.scripts.map((s) => ({ ...s, frame: f.duration })));
  const list = (items: string[]) => items.join(', ') || 'none';
  test.info().annotations.push(
    {
      type: 'long tasks',
      description: list(probe.longTasks.filter((t) => t.start >= from && t.duration > 50).map((t) => `${Math.round(t.duration)} ms`)),
    },
    {
      type: 'long scripts',
      description: list(scripts.filter((s) => s.duration >= 50).map((s) => `${s.invoker} ${s.source || '(inline)'} ${Math.round(s.duration)} ms`)),
    },
  );

  const depth = scripts.filter((s) => DEPTH_SOURCES.test(s.source) && s.duration >= 50);
  expect(depth.map((s) => `${s.invoker} ${s.source} ${Math.round(s.duration)} ms`), 'a depth script ran ≥ 50 ms').toEqual([]);
});

test('statement and intro keep AA contrast with the living scene drawn behind them @gpu', async ({ page }) => {
  await page.goto(PAGES.home);
  await settle(page);
  await page.mouse.move(12, 12); // the scene arrives with the first input
  await expect(page.locator('html'), 'the scene runs on WebGL on this GPU').toHaveAttribute('data-scene-tier', 'desktop', { timeout: 10_000 });
  // The name has arrived (1.8 s), then a little scroll sets the points travelling.
  await page.waitForTimeout(3500);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(800);

  const targets = [
    { selector: '.hero__statement', min: 3 }, // large text
    { selector: '.hero__intro', min: 4.5 },
  ];
  for (const { selector, min } of targets) {
    expect(await textContrast(page, selector), `${selector} contrast`).toBeGreaterThanOrEqual(min);
  }
});

test('the living scene stops drawing when input stops, and releases on calm @gpu', async ({ page }) => {
  await page.goto(PAGES.home);
  await settle(page);
  await page.mouse.move(12, 12); // the scene arrives with the first input
  await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'desktop', { timeout: 10_000 });
  await page.waitForTimeout(3500);
  const before = (await readProbe(page)).raf;
  await page.waitForTimeout(2000);
  expect((await readProbe(page)).raf - before, 'zero rAF 2 s after input stops').toBe(0);
  expect((await readProbe(page)).glLive).toBeLessThanOrEqual(1);

  const toggle = page.locator('footer [data-motion-toggle]');
  pending((await toggle.count()) > 0, 'W5', 'the footer [data-motion-toggle]');
  await toggle.click();
  await page.waitForTimeout(500);
  expect((await readProbe(page)).glLive, 'calm releases the context').toBe(0);
  await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static');
});
