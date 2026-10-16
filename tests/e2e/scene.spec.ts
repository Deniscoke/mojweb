import { expect, test, type Page } from '@playwright/test';
import { PAGES, settle, useStoredCalm } from './support';

/**
 * THE LIVING SCENE (docs/superpowers/specs/2026-10-16-living-scene-design.md)
 *
 * One canvas behind the homepage, loaded with the visitor's first input; the
 * shape on screen follows the section in the middle of the viewport. The choreography runs on every tier, so these
 * checks read `data-scene-state` and hold in headless Chrome too, where
 * `failIfMajorPerformanceCaveat` refuses WebGL and the scene draws in 2D.
 */

const state = (page: Page) => page.locator('canvas.scene').getAttribute('data-scene-state');

async function centre(page: Page, selector: string): Promise<void> {
  await page.evaluate((s) => document.querySelector(s)!.scrollIntoView({ block: 'center', behavior: 'instant' }), selector);
}

async function expectState(page: Page, id: string): Promise<void> {
  await expect.poll(() => state(page), { timeout: 10_000 }).toBe(id);
}

/** The scene arrives with the first input; a small mouse move is one. */
async function wake(page: Page): Promise<void> {
  await page.mouse.move(12, 12);
  await page.mouse.move(24, 24);
}

test.describe('living scene', () => {
  test('home has exactly one scene canvas', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expect(page.locator('canvas.scene')).toHaveCount(1, { timeout: 10_000 });
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', /^(desktop|mobile|static)$/);
  });

  test('the name arrives first', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expectState(page, 'name');
  });

  test('scrolling to Lab sets state scan', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await centre(page, '[data-scene="scan"]');
    await expectState(page, 'scan');
  });

  test('scene keeps the right state after resize', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await centre(page, '[data-scene="credo"]');
    await expectState(page, 'credo');
    await page.setViewportSize({ width: 1024, height: 700 });
    await centre(page, '[data-scene="credo"]');
    await expectState(page, 'credo');
  });

  test('nothing loads before the first input, and subpages never get it', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await page.waitForTimeout(3000);
    await expect(page.locator('canvas.scene')).toHaveCount(0);
    await page.goto(PAGES.laby);
    await settle(page);
    await wake(page);
    await page.waitForTimeout(1500);
    await expect(page.locator('canvas.scene')).toHaveCount(0);
  });

  test('calm mode creates no WebGL context', async ({ page }) => {
    await useStoredCalm(page);
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static');
    // A canvas that ever held a WebGL context cannot give a 2D one.
    expect(await page.evaluate(() => document.querySelector<HTMLCanvasElement>('canvas.scene')!.getContext('2d') !== null)).toBe(true);
    await expectState(page, 'name');
  });

  test('toggling calm at runtime switches to static', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await page.locator('footer [data-motion-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static');
    await centre(page, '[data-scene="credo"]');
    await expectState(page, 'credo');
  });

  test('context loss falls back to 2D @gpu', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', /^(desktop|mobile)$/);
    await page.evaluate(() =>
      document.querySelector<HTMLCanvasElement>('canvas.scene')!.getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext(),
    );
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static');
    await expect(page.locator('canvas.scene')).toHaveCount(1);
    await centre(page, '[data-scene="scan"]');
    await expectState(page, 'scan');
  });

  test('old layers are gone from home', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    for (const sel of ['.hero__floor', '.hero__ground', '.hero__rules', '.hero__scan', 'canvas.cursor-field', '[data-preview-on]', '.contact__stroke']) {
      await expect(page.locator(sel), sel).toHaveCount(0);
    }
    expect(await page.evaluate(() => getComputedStyle(document.body, '::after').content)).toBe('none');
  });

  test('scene anchors exist in every language', async ({ page }) => {
    await page.goto('/en/');
    await settle(page);
    const ids = await page.locator('[data-scene]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.scene));
    for (const lang of ['sk', 'sr', 'tr']) {
      await page.goto(`/${lang}/`);
      await settle(page);
      await wake(page);
      expect(await page.locator('[data-scene]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.scene)), lang).toEqual(ids);
      await expectState(page, 'name');
    }
  });

  test('the 2D tier does not redraw while the shape holds', async ({ page }) => {
    await useStoredCalm(page);
    await page.addInitScript(() => {
      const proto = CanvasRenderingContext2D.prototype;
      const fill = proto.fillRect;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__rects = 0;
      proto.fillRect = function (...args: Parameters<typeof fill>) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__rects++;
        return fill.apply(this, args);
      };
    });
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await centre(page, '[data-scene="credo"]');
    await expectState(page, 'credo');
    await page.waitForTimeout(600);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.evaluate(() => ((window as any).__rects = 0));
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 8);
      await page.waitForTimeout(80);
    }
    await expectState(page, 'credo');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await page.evaluate(() => (window as any).__rects)).toBe(0);
  });

  test('plates are built once a narrow window grows wide @desktop-only', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expect(page.locator('canvas.scene')).toHaveCount(1, { timeout: 10_000 });
    await page.waitForTimeout(2500);
    const before = Number(await page.locator('canvas.scene').getAttribute('data-scene-shapes'));
    const rows = await page.locator('[data-scene^="work:"]').count();
    await page.setViewportSize({ width: 1440, height: 900 });
    await centre(page, '[data-scene^="work:"]');
    await expect
      .poll(async () => Number(await page.locator('canvas.scene').getAttribute('data-scene-shapes')), { timeout: 10_000 })
      .toBeGreaterThanOrEqual(before + rows);
  });

  test('turning calm off brings the WebGL scene back @gpu', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'desktop', { timeout: 10_000 });
    const toggle = page.locator('footer [data-motion-toggle]');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'desktop', { timeout: 10_000 });
    await centre(page, '[data-scene="credo"]');
    await expectState(page, 'credo');
  });
});

