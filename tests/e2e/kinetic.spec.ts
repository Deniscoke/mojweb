import { expect, test, type Page } from '@playwright/test';
import { PAGES, settle } from './support';

/**
 * THE KINETIC LAYER (docs/superpowers/specs/2026-10-16-kinetic-site-design.md §4)
 * GSAP SplitText / ScrambleText, loaded with the scene on the first input.
 */

async function wake(page: Page): Promise<void> {
  await page.mouse.move(12, 12);
  await page.mouse.move(24, 24);
}

async function loaded(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/kinetic\.[\w-]+\.js$/.test(r.name))), {
      timeout: 10_000,
    })
    .toBe(true);
  await page.waitForTimeout(400);
}

async function centre(page: Page, selector: string): Promise<void> {
  await page.evaluate((s) => document.querySelector(s)!.scrollIntoView({ block: 'center', behavior: 'instant' }), selector);
}

test.describe('kinetic type', () => {
  test('a heading gathers and lands as the original markup', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    const before = await page.locator('#lab-title').evaluate((el) => el.innerHTML);
    await wake(page);
    await loaded(page);
    await centre(page, '#lab-title');
    // While it gathers, it is split; once landed, it is the original again.
    await expect.poll(() => page.locator('#lab-title').evaluate((el) => el.innerHTML), { timeout: 8000 }).toBe(before);
    await expect(page.locator('#lab-title')).toBeVisible();
  });

  test('a heading already seen is never hidden or split', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    // The scroll is the first input: the heading is on screen before the layer loads.
    await centre(page, '#work-title');
    await loaded(page);
    for (let i = 0; i < 5; i++) {
      expect(await page.locator('#work-title div').count()).toBe(0);
      expect(await page.locator('#work-title').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
      await page.waitForTimeout(150);
    }
  });

  test('a mono number decodes back to itself', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await loaded(page);
    const num = page.locator('.lab__num').first();
    const text = (await num.textContent())!;
    await centre(page, '.lab__num');
    await expect.poll(() => num.textContent(), { timeout: 5000 }).toBe(text);
  });

  test('a heading in Serbian and Turkish lands with its exact text', async ({ page }) => {
    for (const lang of ['sr', 'tr']) {
      await page.goto(`/${lang}/`);
      await settle(page);
      const before = await page.locator('#contact-title').evaluate((el) => el.innerHTML);
      await wake(page);
      await loaded(page);
      await centre(page, '#contact-title');
      await expect.poll(() => page.locator('#contact-title').evaluate((el) => el.innerHTML), { timeout: 8000 }).toBe(before);
    }
  });

  test('reduced motion never downloads the layer', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await centre(page, '#lab-title');
    await page.waitForTimeout(2000);
    expect(requested.filter((u) => /\/kinetic\.[\w-]+\.js$/.test(u))).toEqual([]);
  });

  test('subpages get the layer too', async ({ page }) => {
    await page.goto(PAGES.case);
    await settle(page);
    await wake(page);
    await loaded(page);
  });

  test('a prepared heading that is jumped past is shown, never left hidden', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await loaded(page);
    // Just below the screen: the layer prepares (splits and hides) it.
    await page.evaluate(() => {
      const el = document.querySelector('#lab-title')!;
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * 1.2, behavior: 'instant' });
    });
    await expect.poll(() => page.locator('#lab-title div').count(), { timeout: 5000 }).toBeGreaterThan(0);
    // A jump to the end skips its intersecting moment entirely.
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await expect.poll(() => page.locator('#lab-title div').count(), { timeout: 5000 }).toBe(0);
  });

  test('a heading resting in the bottom band of the screen lands', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await wake(page);
    await loaded(page);
    await page.evaluate(() => {
      const el = document.querySelector('#lab-title')!;
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * 1.3, behavior: 'instant' });
    });
    await expect.poll(() => page.locator('#lab-title div').count(), { timeout: 5000 }).toBeGreaterThan(0);
    // Bring it to the last 5% of the screen and stop there.
    await page.evaluate(() => {
      const el = document.querySelector('#lab-title')!;
      window.scrollBy({ top: el.getBoundingClientRect().top - innerHeight * 0.96, behavior: 'instant' });
    });
    await expect.poll(() => page.locator('#lab-title div').count(), { timeout: 5000 }).toBe(0);
  });
});

