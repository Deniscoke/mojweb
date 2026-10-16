import { expect, test, type Page } from '@playwright/test';
import { PAGES, settle } from './support';

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

  test('the portrait arrives first', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expectState(page, 'portrait');
  });

  test('scrolling to Lab sets state question', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await centre(page, '[data-scene="question"]');
    await expectState(page, 'question');
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

  test('nothing loads before the first input', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await page.waitForTimeout(3000);
    await expect(page.locator('canvas.scene')).toHaveCount(0);
  });

  test('reduced motion creates no WebGL context', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static');
    // A canvas that ever held a WebGL context cannot give a 2D one.
    expect(await page.evaluate(() => document.querySelector<HTMLCanvasElement>('canvas.scene')!.getContext('2d') !== null)).toBe(true);
    await expectState(page, 'portrait');
  });

  test('reduced motion switched on at runtime goes static', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expect(page.locator('canvas.scene')).toHaveCount(1, { timeout: 10_000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
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
    await centre(page, '[data-scene="question"]');
    await expectState(page, 'question');
  });

  test('old layers are gone from home', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    for (const sel of ['.hero__floor', '.hero__ground', '.hero__rules', '.hero__scan', 'canvas.cursor-field', '[data-preview-on]', '.contact__stroke', '[data-motion-toggle]']) {
      await expect(page.locator(sel), sel).toHaveCount(0);
    }
    await wake(page);
    await expect(page.locator('canvas.scene')).toHaveCount(1, { timeout: 10_000 });
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
      await expectState(page, 'portrait');
    }
  });

  test('the 2D tier does not redraw while the shape holds', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
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

  test('reduced motion switched off brings the WebGL scene back @gpu', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'desktop', { timeout: 10_000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'desktop', { timeout: 10_000 });
    await centre(page, '[data-scene="credo"]');
    await expectState(page, 'credo');
  });

  test('a project opens from where its points stand @desktop-only', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    const row = page.locator('[data-scene^="work:"]').nth(2);
    const id = await row.getAttribute('data-scene');
    await centre(page, `[data-scene="${id}"]`);
    await expectState(page, id!);
    await expect(page.locator('canvas.scene')).toHaveAttribute('data-scene-rect', /\d/, { timeout: 10_000 });
    const [left, top, width, height] = (await page.locator('canvas.scene').getAttribute('data-scene-rect'))!.split(',').map(Number);
    // The overlay's plate, measured the moment it is inserted, before it grows.
    await page.evaluate(() => {
      new MutationObserver((records, mo) => {
        for (const r of records)
          for (const n of r.addedNodes)
            if (n instanceof HTMLElement && n.classList.contains('pt')) {
              // Freeze the flight at its first frame and measure the plate there.
              n.getAnimations({ subtree: true }).forEach((an) => {
                an.pause();
                an.currentTime = 0;
              });
              const stage = n.querySelector('.pt__stage') as HTMLElement | null;
              const b = (stage ?? n).getBoundingClientRect();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).__start = [b.left + b.width / 2, b.top + b.height / 2];
              mo.disconnect();
            }
      }).observe(document.body, { childList: true });
    });
    await row.locator('a').click();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const start = await page.evaluate(() => (window as any).__start as [number, number] | undefined);
    expect(start, 'the plate overlay was inserted').toBeTruthy();
    expect(Math.abs(start![0] - (left + width / 2))).toBeLessThan(24);
    expect(Math.abs(start![1] - (top + height / 2))).toBeLessThan(24);
  });

  test('home never requests a scan file', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await centre(page, '#lab');
    await page.waitForTimeout(1500);
    expect(requested.filter((u) => u.endsWith('.bin'))).toEqual([]);
    await expect(page.locator('.lab__scan-cap')).toHaveCount(0);
  });

  for (const [path, hero] of [
    ['/en/lab/', 'question'],
    ['/en/laby/', 'credo'],
    ['/en/lab/digital-space/', 'question'],
  ] as const) {
    test(`${path} has its own scene: ${hero}`, async ({ page }) => {
      await page.goto(path);
      await settle(page);
      expect(await page.evaluate(() => getComputedStyle(document.body, '::after').content)).not.toBe('none');
      await wake(page);
      await expect(page.locator('canvas.scene')).toHaveCount(1, { timeout: 10_000 });
      await expectState(page, hero);
      expect(await page.evaluate(() => getComputedStyle(document.body, '::after').content)).toBe('none');
    });
  }

  test('a case study draws its own plate beside the title @desktop-only', async ({ page }) => {
    await page.goto(PAGES.case);
    await settle(page);
    await wake(page);
    await expectState(page, 'work:circus-movement');
  });

  test('a lab tints its points in its own colour', async ({ page }) => {
    await page.goto(PAGES.labyDetail);
    await settle(page);
    const ink = await page.locator('[data-scene]').first().evaluate((el) => getComputedStyle(el).getPropertyValue('--scene-ink').trim());
    expect(ink).toMatch(/^#[0-9a-f]{6}$/i);
    await wake(page);
    await expect(page.locator('canvas.scene')).toHaveCount(1, { timeout: 10_000 });
  });
});

