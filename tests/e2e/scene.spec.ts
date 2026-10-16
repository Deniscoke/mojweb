import { expect, test, type Page } from '@playwright/test';
import { PAGES, settle, useStoredCalm } from './support';

/**
 * THE LIVING SCENE (docs/superpowers/specs/2026-10-16-living-scene-design.md)
 *
 * One canvas behind the homepage; the shape on screen follows the section in
 * the middle of the viewport. The choreography runs on every tier, so these
 * checks read `data-scene-state` and hold in headless Chrome too, where
 * `failIfMajorPerformanceCaveat` refuses WebGL and the scene draws in 2D.
 */

const state = (page: Page) => page.locator('canvas.scene').getAttribute('data-scene-state');

async function centre(page: Page, selector: string): Promise<void> {
  await page.evaluate((s) => document.querySelector(s)!.scrollIntoView({ block: 'center', behavior: 'instant' }), selector);
}

async function expectState(page: Page, id: string): Promise<void> {
  await expect.poll(() => state(page), { timeout: 8000 }).toBe(id);
}

test.describe('living scene', () => {
  test('home has exactly one scene canvas', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await expect(page.locator('canvas.scene')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', /^(desktop|mobile|static)$/);
  });

  test('the name arrives first', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
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

  test('subpages have no scene canvas', async ({ page }) => {
    await page.goto(PAGES.laby);
    await settle(page);
    await expect(page.locator('canvas.scene')).toHaveCount(0);
  });

  test('calm mode creates no WebGL context', async ({ page }) => {
    await useStoredCalm(page);
    await page.goto(PAGES.home);
    await settle(page);
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
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', /^(desktop|mobile)$/);
    await page.evaluate(() =>
      document.querySelector<HTMLCanvasElement>('canvas.scene')!.getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext(),
    );
    await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static');
    await expect(page.locator('canvas.scene')).toHaveCount(1);
    await centre(page, '[data-scene="scan"]');
    await expectState(page, 'scan');
  });
});
