import { expect, test } from '@playwright/test';
import { PAGES, settle } from './support';

/**
 * CALM AND THE BACK/FORWARD CACHE
 *
 * Playwright launches Chrome with --disable-back-forward-cache, which hides
 * exactly this bug: a page restored from bfcache never re-runs its boot
 * script, so it has to re-read the stored choice on `pageshow` itself. This
 * file turns the cache back on; launch options must be set at file level,
 * because they need a worker of their own.
 */
test.use({ launchOptions: { ignoreDefaultArgs: ['--disable-back-forward-cache'] } });


test('a restored page follows the stored choice', async ({ page }) => {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ps = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addEventListener('pageshow', (e) => (window as any).__ps.push(e.persisted));
  });
  await page.goto(PAGES.home);
  await settle(page);
  await page.evaluate(() => (location.href = '/en/lab/'));
  await page.waitForURL('**/en/lab/');
  await settle(page);
  await page.locator('footer [data-motion-toggle]').click();
  await page.goBack({ waitUntil: 'commit' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restored = await expect.poll(() => page.evaluate(() => (window as any).__ps.at(-1)), { timeout: 8000 }).toBe(true).then(() => true, () => false);
  // If this Chrome did not keep the page in bfcache, the reload path is
  // covered by the stored-calm tests above; nothing to prove here.
  test.skip(!restored, 'the page was not restored from bfcache in this run');
  await expect(page.locator('html')).toHaveAttribute('data-calm', '');
  for (const t of await page.locator('[data-motion-toggle]').all()) await expect(t).toHaveAttribute('aria-pressed', 'true');
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running' && a.timeline && !(a.timeline instanceof DocumentTimeline)).length,
    ),
  ).toBe(0);
});

test('the page has exactly one status region, outside the language menu', async ({ page }) => {
  await page.goto(PAGES.home);
  await settle(page);
  await expect(page.locator('[role=status]')).toHaveCount(1);
  expect(await page.locator('details [role=status]').count()).toBe(0);
});
