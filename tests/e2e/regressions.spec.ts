import { expect, test, type Locator, type Page } from '@playwright/test';
import { PAGES, frames, instrument, pending, pendingTail, placeTop, readProbe, settle } from './support';

/**
 * WHAT ALREADY WORKS MUST STILL WORK (docs/motion-depth-plan.md §8, §11)
 * =====================================================================
 * The depth work touches the most delicate parts of the site: the
 * cursor-carried plate (a fixed layer under a transformed ancestor would
 * stop following the hand), the plate transition (five bursts, three ways to
 * start one), the language hand-over, the Splatoo embed. Every test here
 * passes on the pre-change site; the depth work has to keep it that way.
 */

test.beforeEach(async ({ page }) => {
  await instrument(page);
});

type Family = 'grid' | 'strata' | 'flux' | 'orbit' | 'scan';
const FAMILIES: Family[] = ['grid', 'strata', 'flux', 'orbit', 'scan'];

/** The first Selected Work row drawing each plate family. */
async function rowOf(page: Page, family: Family): Promise<{ row: Locator; link: Locator; href: string; index: number }> {
  const index = await page.evaluate(
    (f) => [...document.querySelectorAll('#work .project')].findIndex((r) => r.querySelector(`svg[data-visual="${f}"]`)),
    family,
  );
  expect(index, `a row with a ${family} plate`).toBeGreaterThanOrEqual(0);
  const row = page.locator('#work .project').nth(index);
  const link = row.locator('.project__link');
  return { row, link, href: (await link.getAttribute('href'))!, index };
}

/** Puts the row at 40% of the viewport and the pointer on its title. */
async function hoverRow(page: Page, index: number): Promise<{ x: number; y: number }> {
  await placeTop(page, `#work .project:nth-child(${index + 1})`, 0.4);
  const box = (await page.locator('#work .project').nth(index).boundingBox())!;
  const x = Math.round(box.x + Math.min(360, box.width / 3));
  const y = Math.round(box.y + box.height / 2);
  await page.mouse.move(x - 40, y - 10);
  await page.mouse.move(x, y, { steps: 4 });
  return { x, y };
}

/** Holds the navigation the transition starts, so its first frame can be read. */
async function holdNavigation(page: Page, href: string): Promise<() => void> {
  let release = () => {};
  const gate = new Promise<void>((r) => (release = r));
  await page.route(`**${href}`, async (route) => {
    if (route.request().isNavigationRequest()) await gate;
    await route.continue();
  });
  return release;
}

/**
 * Freezes every running time-based animation at its start, as the first frame
 * paints it. Scroll-driven animations (the phone card dioramas) are left
 * alone: they are progress-based, reject an absolute currentTime, and are
 * already pinned by the scroll position the test does not change.
 */
async function freezeAtStart(page: Page): Promise<void> {
  await page.evaluate(() =>
    document.getAnimations().forEach((a) => {
      if (!(a.timeline instanceof DocumentTimeline)) return;
      a.pause();
      a.currentTime = 0;
    }),
  );
  await frames(page);
}

const HIDE_CURSOR = '.cursor-field{display:none!important}';

/**
 * The preview eases towards the pointer and stops within 0.4 px of it, so
 * where it rests differs by a sub-pixel from run to run. For a pixel
 * comparison it is put on the pointer once the loop has stopped, on whole
 * device pixels: the plate is centred on the pointer with `-50%`, and an
 * odd height would otherwise leave it on a half pixel.
 */
async function pinPreview(page: Page, x: number, y: number): Promise<void> {
  await page.evaluate(
    ([px, py]) => {
      const work = document.querySelector<HTMLElement>('[data-work]');
      const plate = work?.querySelector<HTMLElement>('[data-preview-active] .project__plate');
      if (!work || !plate) return;
      const { offsetWidth: w, offsetHeight: h } = plate;
      work.style.setProperty('--preview-x', `${Math.round(px - w / 2) + w / 2}px`);
      work.style.setProperty('--preview-y', `${Math.round(py - h / 2) + h / 2}px`);
    },
    [x, y] as const,
  );
  await frames(page);
}

// ──────────────────────────────────────────────── cursor-carried preview

test.describe('Selected Work preview @desktop-only', () => {
  test('the plate follows the pointer, and stays fixed to the viewport when the page scrolls', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    const { row, index } = await rowOf(page, 'grid');
    const { x, y } = await hoverRow(page, index);
    const plate = row.locator('.project__plate');
    await expect(plate).toHaveCSS('position', 'fixed');
    await expect(plate).toHaveCSS('opacity', '1');
    await page.waitForTimeout(700);
    const a = (await plate.boundingBox())!;

    await page.mouse.move(x + 120, y + 6, { steps: 6 });
    await page.waitForTimeout(700);
    const b = (await plate.boundingBox())!;
    expect(b.x - a.x).toBeCloseTo(120, -0.5);
    expect(b.y - a.y).toBeCloseTo(6, -0.5);

    // A transformed ancestor would turn `fixed` into "fixed to the ancestor":
    // after a scroll the plate would sit somewhere else for the same pointer.
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(150);
    await page.mouse.move(x + 121, y + 6);
    await page.mouse.move(x + 120, y + 6);
    await page.waitForTimeout(700);
    if (await row.evaluate((el) => el.hasAttribute('data-preview-active'))) {
      const c = (await plate.boundingBox())!;
      expect(Math.abs(c.x - b.x)).toBeLessThanOrEqual(2);
      expect(Math.abs(c.y - b.y)).toBeLessThanOrEqual(2);
    }
  });

  test('the keyboard-anchored plate does not lean', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    const { link } = await rowOf(page, 'orbit');
    await link.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    const tilt = link.locator('.project__plate-tilt');
    pending((await tilt.count()) > 0, 'W4', 'the .project__plate-tilt stage');
    await page.waitForTimeout(400);
    expect(await tilt.evaluate((el) => [el.hasAttribute('data-tilting'), getComputedStyle(el).transform])).toEqual([false, 'none']);
  });
});

// ──────────────────────────────────────────────────── plate transition

test.describe('plate transition', () => {
  for (const family of FAMILIES) {
    test(`${family}: pointer click grows the plate and lands on the project, cover up @desktop-only`, async ({ page }) => {
      await page.goto(PAGES.home);
      await settle(page);
      const { href, index, row } = await rowOf(page, family);
      await hoverRow(page, index);
      await expect(row).toHaveAttribute('data-preview-active', '');
      const started = Date.now();
      await page.mouse.down();
      await page.mouse.up();
      await expect(page.locator('.pt')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.hasAttribute('data-plate-transition'))).toBe(true);
      await page.waitForURL(`**${href}`, { waitUntil: 'commit' });
      expect(Date.now() - started).toBeGreaterThan(1000);
      // The destination paints its cover before the first frame, then reveals.
      await page.waitForLoadState('domcontentloaded');
      expect((await readProbe(page)).atBody?.entering).toBe(true);
      await settle(page);
      await expect(page.locator('main h1')).toBeVisible();
    });

    test(`${family}: touch tap on the card plays the transition @mobile-only`, async ({ page }) => {
      await page.goto(PAGES.home);
      await settle(page);
      const { link, href } = await rowOf(page, family);
      await link.scrollIntoViewIfNeeded();
      await link.tap();
      await expect(page.locator('.pt')).toHaveCount(1);
      await page.waitForURL(`**${href}`, { waitUntil: 'commit' });
      await settle(page);
      await expect(page.locator('main h1')).toBeVisible();
    });

    test(`${family}: keyboard Enter on a focused row plays the transition @desktop-only`, async ({ page }) => {
      await page.goto(PAGES.home);
      await settle(page);
      const { link, href } = await rowOf(page, family);
      await link.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(link).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('.pt')).toHaveCount(1);
      await page.waitForURL(`**${href}`, { waitUntil: 'commit' });
    });
  }

  for (const key of ['Escape', 'Enter', 'Space'] as const) {
    test(`${key} skips the transition and navigates at once @desktop-only`, async ({ page }) => {
      await page.goto(PAGES.home);
      await settle(page);
      const { href, index } = await rowOf(page, 'flux');
      await hoverRow(page, index);
      await page.mouse.down();
      await page.mouse.up();
      await expect(page.locator('.pt')).toHaveCount(1);
      const pressed = Date.now();
      await page.keyboard.press(key === 'Space' ? ' ' : key);
      await page.waitForURL(`**${href}`, { waitUntil: 'commit' });
      // The transition itself navigates at 1400 ms; a skip is well inside that.
      expect(Date.now() - pressed).toBeLessThan(900);
    });
  }
});

// ─────────────────────────────────────────────────── language hand-over

test('the gate hands over to the homepage with the cover already up', async ({ page }) => {
  await page.goto(PAGES.gate);
  // The greeting plays first; the chooser is ready when it ends.
  await expect(page.locator('[data-gate]')).toHaveAttribute('data-ready', '', { timeout: 20_000 });
  await page.locator('[data-lang-option][href="/en/"]').click();
  await page.waitForURL('**/en/', { waitUntil: 'commit' });
  await page.waitForLoadState('domcontentloaded');
  expect((await readProbe(page)).atBody?.entering, 'cover painted before first frame').toBe(true);
  await settle(page);
  expect((await readProbe(page)).revealedAt).not.toBeNull();
  await expect(page.locator('html')).not.toHaveAttribute('data-entering', '');
  await expect(page.locator('[data-transition-cover]')).toHaveCSS('visibility', 'hidden');
});

test('a direct visit announces the reveal without a cover', async ({ page }) => {
  await page.goto(PAGES.home);
  expect((await readProbe(page)).atBody?.entering).toBe(false);
  await settle(page);
  expect((await readProbe(page)).revealedAt).not.toBeNull();
});

// ───────────────────────────────────────────────────────────────── 404

test('the 404 is served, localised and unchanged', async ({ page }) => {
  const response = await page.goto('/sk/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('.not-found__title')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk');
  await expect(page.locator('[data-nf-home]')).toHaveAttribute('href', '/sk/');
  expect(await page.locator('[data-depth], [data-tilt], [data-motion-toggle], .hero__scan').count()).toBe(0);
});

// ───────────────────────────────────────────────────── Splatoo embed

test('Splatoo click-to-load inserts the sandboxed iframe, focuses it, leaves no GL context', async ({ page, baseURL }) => {
  // The scene is someone else's site: keep the test offline and private.
  await page.route((url) => !url.href.startsWith(baseURL!), (route) => route.abort());
  await page.goto(PAGES.splatoo);
  await settle(page);
  const load = page.locator('[data-embed-load]');
  await load.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await load.click();
  const frame = page.locator('[data-embed] iframe');
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute(
    'sandbox',
    'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-pointer-lock',
  );
  await expect(frame).toHaveAttribute('src', /^https:\/\//);
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('IFRAME');
  expect(await page.locator('[data-embed-poster]').count()).toBe(0);
  expect((await readProbe(page)).glLive, 'no live GL context after the click').toBe(0);
  // W7: the loaded figure strips every transform so the iframe is never in 3D.
  const loaded = await page.locator('[data-embed]').evaluate((el) => el.hasAttribute('data-loaded'));
  if (!pendingTail(loaded, 'W7', 'figure[data-loaded] after click-to-load')) return;
  const flat = await page.locator('[data-embed]').evaluate((figure) =>
    [figure, ...figure.querySelectorAll('*')].every((el) => {
      const cs = getComputedStyle(el);
      return cs.transform === 'none' && cs.translate === 'none' && cs.rotate === 'none' && cs.scale === 'none';
    }),
  );
  expect(flat, 'the iframe must never sit in a 3D context').toBe(true);
  expect(await page.locator('[data-embed] [data-tilt]').count()).toBe(0);
});

// ─────────────────────────────────────────────── pointer layers on top

test.describe('pointer layers @desktop-only', () => {
  test('the cursor field is a fixed, inert, full-viewport canvas on <body>', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await page.mouse.move(300, 300);
    await page.mouse.move(500, 420, { steps: 5 });
    const field = page.locator('canvas.cursor-field');
    await expect(field).toHaveCount(1);
    await expect(field).toHaveAttribute('aria-hidden', 'true');
    await expect(field).toHaveCSS('position', 'fixed');
    await expect(field).toHaveCSS('pointer-events', 'none');
    expect(await field.evaluate((el) => el.parentElement === document.body)).toBe(true);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(300);
    const box = (await field.boundingBox())!;
    expect([box.x, box.y, box.width, box.height]).toEqual([0, 0, 1440, 900]);
  });

  test('hero pointer parallax still moves its layers and composes with the reveal', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    await page.mouse.move(200, 200);
    await page.mouse.move(1200, 700, { steps: 10 });
    await page.waitForTimeout(400);
    const moved = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-parallax]')].map((el) => ({
        offset: el.style.translate || el.style.transform,
        opacity: getComputedStyle(el).opacity,
      })),
    );
    expect(moved.length).toBeGreaterThan(0);
    for (const layer of moved) {
      expect(layer.offset).not.toBe('');
      expect(layer.opacity).toBe('1');
    }
  });
});

// ─────────────────────────────────────────── the transition's first frame

test.describe('transition start frame is unchanged (W4)', () => {
  for (const family of FAMILIES) {
    test(`${family}: pointer @desktop-only`, async ({ page }) => {
      await page.goto(PAGES.home);
      await settle(page);
      await page.addStyleTag({ content: HIDE_CURSOR });
      const { row, href, index } = await rowOf(page, family);
      const { x, y } = await hoverRow(page, index);
      await page.waitForTimeout(900);
      await pinPreview(page, x, y);
      await settle(page);
      const clip = (await row.locator('.project__plate').boundingBox())!;
      // A layer that has just finished a scale/rotate transition is
      // occasionally re-rastered a few anti-aliased pixels differently (seen:
      // 9 px in 1 of 75 runs). A misregistered lift or a visible 40 % base
      // accent changes hundreds.
      const carried = { clip, maxDiffPixels: 24 };
      await expect(page).toHaveScreenshot(`rest-pointer-${family}.png`, carried);
      const release = await holdNavigation(page, href);
      await page.mouse.down();
      await page.mouse.up();
      await freezeAtStart(page);
      await expect(page).toHaveScreenshot(`start-pointer-${family}.png`, carried);
      release();
    });

    test(`${family}: touch @mobile-only`, async ({ page }) => {
      await page.goto(PAGES.home);
      await settle(page);
      const { row, href, index } = await rowOf(page, family);
      await placeTop(page, `#work .project:nth-child(${index + 1})`, 0.15);
      await settle(page);
      const clip = (await row.locator('.project__plate').boundingBox())!;
      const release = await holdNavigation(page, href);
      // A tap on the plate itself: a locator tap would scroll the row first.
      await page.touchscreen.tap(Math.round(clip.x + clip.width / 2), Math.round(clip.y + clip.height / 2));
      await freezeAtStart(page);
      await expect(page).toHaveScreenshot(`start-touch-${family}.png`, { clip });
      release();
    });

    test(`${family}: keyboard @desktop-only`, async ({ page }) => {
      await page.goto(PAGES.home);
      await settle(page);
      await page.addStyleTag({ content: HIDE_CURSOR });
      const { link, row, href, index } = await rowOf(page, family);
      await placeTop(page, `#work .project:nth-child(${index + 1})`, 0.4);
      await link.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(link).toBeFocused();
      // Moving focus may have scrolled; put the row back where it was.
      await placeTop(page, `#work .project:nth-child(${index + 1})`, 0.4);
      await settle(page);
      const clip = (await row.locator('.project__plate').boundingBox())!;
      await expect(page).toHaveScreenshot(`rest-keyboard-${family}.png`, { clip });
      const release = await holdNavigation(page, href);
      await page.keyboard.press('Enter');
      await freezeAtStart(page);
      await expect(page).toHaveScreenshot(`start-keyboard-${family}.png`, { clip });
      release();
    });
  }
});
