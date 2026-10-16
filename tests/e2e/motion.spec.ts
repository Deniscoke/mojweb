import { expect, test, type Page } from '@playwright/test';
import {
  PAGES,
  frames,
  identityOffender,
  instrument,
  isDesktop,
  pending,
  pendingTail,
  placeTop,
  rafDuring,
  readProbe,
  scrollDrivenAnimations,
  settle,
  textContrast,
  useStoredCalm,
  untilQuiet,
} from './support';

/**
 * THE DEPTH LAYER'S OWN PROMISES (docs/motion-depth-plan.md §1, §6, §7, §11)
 * =========================================================================
 * What the new motion must do, and above all what it must never do: hide
 * content without JS, run when nobody is touching the page, move text inside
 * the reading band, ignore calm, or push the layout sideways on a phone.
 *
 * Tests that need markup from a work item not merged yet go through
 * `pending()`: skipped with "[pending Wn]" by default, failed under
 * E2E_STRICT=1.
 */

test.beforeEach(async ({ page }) => {
  await instrument(page);
});

/** The homepage section heads a reader actually reads (§3). */
const HEADS = [
  '#pro-skoly .schools__title',
  '#work .section__head',
  '#what .section__head',
  '#lab .section__head',
  '#about .section__head',
  '#currently .currently__head',
  '#contact .contact__title',
];

const DEPTH_SELECTOR = '[data-depth], [data-scrub], [data-tilt], [data-lift], .hero__rules, .hero__name .line';

/** Everything the depth layer may animate, and what it is animating now. */
async function depthAnimationNames(page: Page): Promise<string[]> {
  return page.evaluate((sel) => {
    const names = new Set<string>();
    for (const el of document.querySelectorAll(sel)) {
      for (const target of [el, ...el.children]) {
        for (const pseudo of [null, '::before', '::after']) {
          const name = getComputedStyle(target, pseudo).animationName;
          if (name && name !== 'none') names.add(`${target.tagName.toLowerCase()}${pseudo ?? ''} ${name}`);
        }
      }
    }
    return [...names];
  }, DEPTH_SELECTOR);
}

// ──────────────────────────────────────────────────────────────── no-JS

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [name, path] of Object.entries(PAGES)) {
    if (name === 'gate') continue;
    test(`${name}: all content is visible, no canvas, no leaked caption`, async ({ page }) => {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.classList.contains('js'))).toBe(false);
      expect(await page.locator('canvas').count()).toBe(0);
      await expect(page.locator('.hero__scan-cap')).toBeHidden();

      // Every visible piece of text and every image paints at full opacity.
      // Effective opacity multiplies down the tree, so a faded wrapper counts.
      const faded = await page.evaluate(() => {
        const out: string[] = [];
        const effective = (el: Element | null): number => {
          let o = 1;
          for (let a = el; a; a = a.parentElement) o *= Number.parseFloat(getComputedStyle(a).opacity);
          return o;
        };
        const candidates = document.querySelectorAll('main h1, main h2, main h3, main p, main li, main figcaption, main img, main a');
        for (const el of candidates) {
          if (el.closest('[aria-hidden="true"]')) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
          if (!ownText && el.tagName !== 'IMG') continue;
          const o = effective(el);
          if (o < 0.99) out.push(`${el.tagName.toLowerCase()}.${el.className} (${o.toFixed(2)})`);
        }
        return out;
      });
      expect(faded, 'content dimmed or hidden without JS').toEqual([]);
    });
  }
});

// ─────────────────────────────────────────────── reduced motion and calm

const CALM_MODES = [
  { name: 'prefers-reduced-motion', setup: (page: Page) => page.emulateMedia({ reducedMotion: 'reduce' }) },
  { name: 'stored data-calm', setup: (page: Page) => useStoredCalm(page) },
] as const;

for (const mode of CALM_MODES) {
  test.describe(`calm via ${mode.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await mode.setup(page);
    });

    test('homepage: no scroll-driven animation, no loop, no live GL context', async ({ page }) => {
      await page.goto(PAGES.home);
      if (mode.name === 'stored data-calm') {
        pending((await readProbe(page)).atBody?.calm === true, 'W1', 'the boot-script read of irl:motion');
      }
      await settle(page);

      expect(await depthAnimationNames(page), 'depth.css must not exist under calm').toEqual([]);
      expect(await scrollDrivenAnimations(page)).toBe(0);

      // Half-way down the page nothing has started either.
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'instant' }));
      await frames(page);
      expect(await scrollDrivenAnimations(page)).toBe(0);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

      // The living scene mounts late on purpose and, under calm, draws its
      // shape once in 2D per change of section: a handful of frames, never a loop.
      await expect(page.locator('html')).toHaveAttribute('data-scene-tier', 'static', { timeout: 10_000 });
      const calmQuiet = await untilQuiet(page, { quietMs: 1500, timeoutMs: 9000 });
      expect(calmQuiet.quietAt, 'something keeps animating under calm').not.toBeNull();
      expect(calmQuiet.frames, 'more than one static frame was drawn under calm').toBeLessThanOrEqual(12);
      expect(await rafDuring(page, 1000), 'a loop restarted under calm').toBe(0);
      expect((await readProbe(page)).glLive, 'a GL context is still alive under calm').toBe(0);
    });

    test('a project row is a plain link @desktop-only', async ({ page }) => {
      await page.goto(PAGES.home);
      if (mode.name === 'stored data-calm') {
        pending((await readProbe(page)).atBody?.calm === true, 'W1', 'the boot-script read of irl:motion');
      }
      await settle(page);
      const link = page.locator('#work .project__link').first();
      await link.scrollIntoViewIfNeeded();
      await link.hover();
      const href = await link.getAttribute('href');
      await Promise.all([page.waitForURL(`**${href}`, { waitUntil: 'commit', timeout: 1200 }), link.click()]);
      expect(await page.evaluate(() => document.querySelector('.pt'))).toBeNull();
    });
  });
}

test('calm is applied before first paint and survives reload', async ({ page }) => {
  await useStoredCalm(page);
  await page.goto(PAGES.home);
  pending((await readProbe(page)).atBody?.calm === true, 'W1', 'the boot-script read of irl:motion');
  await page.reload();
  expect((await readProbe(page)).atBody?.calm).toBe(true);
  for (const path of [PAGES.case, PAGES.laby, PAGES.lab]) {
    await page.goto(path);
    expect((await readProbe(page)).atBody?.calm, path).toBe(true);
  }
});

// ──────────────────────────────────────────────────────────────── idle

test.describe('idle (WCAG 2.2.2)', () => {
  test('no input for 3 s after load: zero rAF', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    // The living scene waits for the first input: without one, nothing on
    // the page moves on its own.
    const idle = await untilQuiet(page, { quietMs: 1500, timeoutMs: 9000 });
    expect(idle.quietAt, 'the page never stopped animating on its own').not.toBeNull();
    expect(idle.quietAt!, 'autonomous motion ran longer than 5 s (WCAG 2.2.2)').toBeLessThanOrEqual(5000);
    expect(await rafDuring(page, 1500), 'motion restarted without input').toBe(0);
  });

  test('after scrolling stops, every loop stops within 2 s', async ({ page }) => {
    await page.goto(PAGES.home);
    await settle(page);
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(2000);
    expect(await rafDuring(page, 1000)).toBe(0);
  });
});

// ───────────────────────────────────────────────────────── reading band

test.describe('reading band (rule 4)', () => {
  for (const head of HEADS) {
    test(`${head} is at identity between 30% and 70% of the viewport`, async ({ page }) => {
      await page.goto(PAGES.home);
      await settle(page);
      for (const at of [0.7, 0.5, 0.3]) {
        await placeTop(page, head, at);
        await settle(page);
        expect(await identityOffender(page, head), `${head} with its top at ${at * 100}%`).toBeNull();
      }
    });
  }

  for (const [hash, target] of [
    ['#work', '#work .section__head'],
    ['#hero', '.hero__name'],
    ['#contact', '#contact .contact__title'],
  ] as const) {
    test(`anchor ${hash} lands on identity`, async ({ page }) => {
      await page.goto(`${PAGES.home}${hash}`);
      await settle(page);
      await frames(page);
      expect(await identityOffender(page, target)).toBeNull();
    });
  }

  test('case-study h1 is never hidden and sits at identity', async ({ page }) => {
    await page.goto(PAGES.case);
    await settle(page);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await identityOffender(page, 'main h1')).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────── toggles

test.describe('calm toggles (§3.10, §3.11)', () => {
  test('both toggles are real 44 px buttons and reachable by keyboard', async ({ page }, info) => {
    await page.goto(PAGES.home);
    const toggles = page.locator('[data-motion-toggle]');
    pending((await toggles.count()) > 0, 'W5', 'the [data-motion-toggle] buttons');
    expect(await toggles.count()).toBe(2);
    for (const toggle of await toggles.all()) {
      expect(await toggle.evaluate((el) => el.tagName)).toBe('BUTTON');
      await expect(toggle).toHaveAttribute('aria-pressed', /^(true|false)$/);
    }
    const footer = page.locator('footer [data-motion-toggle]');
    await footer.scrollIntoViewIfNeeded();
    const box = await footer.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    if (isDesktop(info)) {
      const nav = page.locator('[data-nav] [data-motion-toggle]');
      const navBox = await nav.boundingBox();
      expect(navBox!.width).toBeGreaterThanOrEqual(44);
      expect(navBox!.height).toBeGreaterThanOrEqual(44);
    }
    await footer.focus();
    await expect(footer).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-calm', '');
  });

  test('toggling persists across reload and pages, and toggles back', async ({ page }) => {
    await page.goto(PAGES.home);
    const footer = page.locator('footer [data-motion-toggle]');
    pending((await footer.count()) > 0, 'W5', 'the footer [data-motion-toggle]');
    await settle(page);
    await footer.click();
    await expect(page.locator('html')).toHaveAttribute('data-calm', '');
    for (const toggle of await page.locator('[data-motion-toggle]').all()) {
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    }
    expect(await page.evaluate(() => localStorage.getItem('irl:motion'))).toBe('calm');

    await page.reload();
    expect((await readProbe(page)).atBody?.calm, 'applied before first paint').toBe(true);
    await page.goto(PAGES.lab);
    expect((await readProbe(page)).atBody?.calm).toBe(true);

    await page.goto(PAGES.home);
    await settle(page);
    await page.locator('footer [data-motion-toggle]').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-calm', '');
    await page.reload();
    expect((await readProbe(page)).atBody?.calm).toBe(false);
  });

  test('under OS reduce both toggles show pressed and disabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGES.home);
    const toggles = page.locator('[data-motion-toggle]');
    pending((await toggles.count()) > 0, 'W5', 'the [data-motion-toggle] buttons');
    await settle(page);
    for (const toggle of await toggles.all()) {
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      expect(await toggle.evaluate((el) => (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true')).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────── loading rules

test.describe('what loads where (§5.2, §5.3)', () => {
  test('touch never requests the tilt module or a desktop scan file @mobile-only', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => requested.push(new URL(r.url()).pathname));
    await page.goto(PAGES.home);
    await settle(page);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(3500);
    expect(requested.filter((p) => /\/_astro\/tilt\./.test(p))).toEqual([]);
    expect(requested.filter((p) => /\/assets\/scans\/.*-desktop\.bin$/.test(p))).toEqual([]);
  });

  test('a fine pointer gets the tilt module after idle @desktop-only', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => requested.push(new URL(r.url()).pathname));
    await page.goto(PAGES.home);
    await settle(page);
    await page.mouse.move(400, 400);
    await page.waitForTimeout(3000);
    pending(await page.evaluate(() => document.documentElement.classList.contains('depth-ready')), 'W1', 'initDepth (html.depth-ready)');
    // §5.2: the tilt loads only where a [data-tilt] stage exists. Selected
    // Work's carry is driven by pointerPreview itself, so until a stage ships
    // on the page (the About photo, W5/W6) the correct outcome is no tilt.
    const hasStage = (await page.locator('[data-tilt]').count()) > 0;
    expect(requested.some((p) => /\/_astro\/tilt\./.test(p))).toBe(hasStage);
  });

  for (const path of [PAGES.gate, PAGES.notFound]) {
    test(`${path} loads no depth code`, async ({ page }) => {
      const requested: string[] = [];
      page.on('request', (r) => requested.push(new URL(r.url()).pathname));
      await page.goto(path);
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000);
      expect(await page.evaluate(() => document.documentElement.classList.contains('depth-ready'))).toBe(false);
      expect(requested.filter((p) => /\/_astro\/(?:tilt|mount|pointScan|gl|depthPhoto)\./.test(p))).toEqual([]);
      expect(await page.locator('canvas:not(.cursor-field)').count()).toBe(0);
    });
  }
});

// ───────────────────────────────────────────────────────────── hero (W3)

test.describe('hero (§3.1)', () => {
  test('statement and intro meet AA, sampled from pixels', async ({ page }) => {
    // The same measurement the gpu project makes with the scan drawn; here it
    // proves the sampler and holds today's numbers.
    await page.goto(PAGES.home);
    await settle(page);
    for (const { selector, min } of [
      { selector: '.hero__statement', min: 3 },
      { selector: '.hero__intro', min: 4.5 },
    ]) {
      expect(await textContrast(page, selector), selector).toBeGreaterThanOrEqual(min);
    }
  });
});

// ───────────────────────────────────────────────────────── footer (W5)

test('footer bookend: 12 rules on desktop, 4 on a phone', async ({ page }, info) => {
  await page.goto(PAGES.home);
  const rules = page.locator('footer .footer__rules > span');
  pending((await rules.count()) > 0, 'W5', 'the footer bookend rules (.footer__rules)');
  await page.locator('footer').scrollIntoViewIfNeeded();
  expect(await page.locator('footer .footer__rules > span:visible').count()).toBe(isDesktop(info) ? 12 : 4);
});

// ───────────────────────────────────────────────────────────── layout

test.describe('layout', () => {
  test.describe('at 360 px', () => {
    test.use({ viewport: { width: 360, height: 740 } });

    for (const [name, path] of Object.entries(PAGES)) {
      test(`${name}: no horizontal overflow, top to bottom`, async ({ page }) => {
        await page.goto(path);
        await settle(page);
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y <= height; y += 600) {
          await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
          await frames(page);
          const width = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
          expect(width, `scrollWidth at scrollY ${y}`).toBeLessThanOrEqual(360);
        }
      });
    }
  });

  for (const path of [PAGES.home, PAGES.case, PAGES.splatoo, PAGES.laby]) {
    test(`${path}: CLS ≤ 0.01 through load and a full scroll`, async ({ page }) => {
      await page.goto(path);
      await settle(page);
      await page.waitForTimeout(1000);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= height; y += 500) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
        await frames(page);
      }
      await page.waitForTimeout(500);
      expect((await readProbe(page)).cls).toBeLessThanOrEqual(0.01);
    });
  }
});
