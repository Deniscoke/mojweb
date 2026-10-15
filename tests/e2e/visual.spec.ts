import { expect, test } from '@playwright/test';
import { PAGES, instrument, settle } from './support';

/**
 * "PIXEL-IDENTICAL TO TODAY" (W3, W4 acceptance)
 * ==============================================
 * The reference images in __screenshots__/ were taken from the commit before
 * any depth work. Depth may add things (the scan, the floor as you scroll)
 * but at rest it must not change a single pixel of what was there.
 *
 * Regenerate them ONLY from the pre-change commit:
 *   npx playwright test visual --update-snapshots
 */

/** Things that are allowed to be new, or that differ from run to run. */
const NEW_LAYERS = '.hero__scan, .hero__scan-cap, .cursor-field { visibility: hidden !important; }';

test.beforeEach(async ({ page }) => {
  await instrument(page);
});

test('desktop hero at scroll 0 @desktop-only', async ({ page }) => {
  await page.goto(PAGES.home);
  await settle(page);
  await page.addStyleTag({ content: NEW_LAYERS });
  await page.waitForTimeout(600);
  await expect(page).toHaveScreenshot('hero-desktop.png');
});

test.describe('phone plates under calm are exactly today’s @mobile-only', () => {
  test.use({ reducedMotion: 'reduce' });

  test('every Selected Work plate', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    const plates = page.locator('#work .project__plate');
    const count = await plates.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const plate = plates.nth(i);
      await plate.scrollIntoViewIfNeeded();
      const slug = await page.locator('#work .project__link').nth(i).getAttribute('href');
      await expect(plate).toHaveScreenshot(`plate-calm-${slug!.split('/').filter(Boolean).pop()}.png`);
    }
  });
});
