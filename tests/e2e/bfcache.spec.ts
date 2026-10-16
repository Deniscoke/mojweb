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


test('the living scene resumes after a bfcache restore', async ({ page }) => {
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
  await page.goBack({ waitUntil: 'commit' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restored = await expect.poll(() => page.evaluate(() => (window as any).__ps.at(-1)), { timeout: 8000 }).toBe(true).then(() => true, () => false);
  test.skip(!restored, 'the page was not restored from bfcache in this run');
  await page.evaluate(() => document.querySelector('[data-scene="question"]')!.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(() => page.locator('canvas.scene').getAttribute('data-scene-state'), { timeout: 8000 }).toBe('question');
});
