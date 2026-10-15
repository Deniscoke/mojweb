import { inflateSync } from 'node:zlib';
import { test, type Page, type TestInfo } from '@playwright/test';

/**
 * SHARED HARNESS FOR THE MOTION-DEPTH SUITE
 * =========================================
 * Three things every spec needs:
 *
 * 1. `instrument(page)` — an init script that runs before any page script and
 *    counts what the plan's rules are about: requestAnimationFrame calls
 *    (rule 2, "stops when input stops"), WebGL contexts (and whether they were
 *    released), the state of <html> at the moment <body> first exists (i.e.
 *    before first paint), layout shifts and long tasks.
 *
 * 2. `pending(...)` — the depth work lands in parallel items (W1–W7). A test
 *    for markup that is not on this build yet is SKIPPED with a reason naming
 *    the item, so the suite runs green on any branch. With `E2E_STRICT=1`
 *    (CI on feat/motion-depth after integration) the same condition FAILS:
 *    a feature that should exist and does not is a regression, not a skip.
 *
 * 3. A tiny PNG decoder, so contrast can be measured from real pixels without
 *    a dependency.
 */

export const STRICT = process.env.E2E_STRICT === '1';

/** Skip (default) or fail (strict) when a planned feature is not built. */
export function pending(present: boolean, item: string, what: string): void {
  if (present) return;
  const reason = `[pending ${item}] ${what} is not on this build yet`;
  if (STRICT) throw new Error(`${reason} (E2E_STRICT=1)`);
  test.skip(true, reason);
}

/**
 * For a planned check at the END of a test whose earlier assertions are
 * regressions that must run today: annotates instead of skipping, and
 * returns whether the rest can run. Strict mode still fails.
 */
export function pendingTail(present: boolean, item: string, what: string): boolean {
  if (present) return true;
  const reason = `[pending ${item}] ${what} is not on this build yet`;
  if (STRICT) throw new Error(`${reason} (E2E_STRICT=1)`);
  test.info().annotations.push({ type: 'pending', description: reason });
  return false;
}

export interface Probe {
  raf: number;
  gl: number;
  glLive: number;
  atBody: { calm: boolean; entering: boolean; js: boolean } | null;
  cls: number;
  longTasks: Array<{ start: number; duration: number }>;
  /** Long animation frames that blocked input, with script attribution. */
  frames: LongFrame[];
  revealedAt: number | null;
}

export interface LongFrame {
  start: number;
  duration: number;
  scripts: Array<{ source: string; invoker: string; duration: number }>;
}

/**
 * Install before `goto`. Everything is stored on `window.__probe` in the
 * page's main world, where the page's own modules call rAF and getContext.
 */
export async function instrument(page: Page): Promise<void> {
  await page.addInitScript(() => {
    type GL = WebGLRenderingContext | WebGL2RenderingContext;
    const contexts: GL[] = [];
    const probe = {
      raf: 0,
      contexts,
      atBody: null as null | { calm: boolean; entering: boolean; js: boolean },
      cls: 0,
      longTasks: [] as Array<{ start: number; duration: number }>,
      frames: [] as LongFrame[],
      revealedAt: null as number | null,
    };
    Object.defineProperty(window, '__probe', { value: probe });

    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      probe.raf += 1;
      return raf(cb);
    };

    const getContext = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, type: string, options?: unknown) => unknown;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, options?: unknown) {
      const ctx = getContext.call(this, type, options);
      if (ctx && /webgl/i.test(type)) contexts.push(ctx as GL);
      return ctx;
    } as typeof HTMLCanvasElement.prototype.getContext;

    // <body> cannot be painted before it exists, so the state of <html> when
    // it first appears is the state of the first paint.
    new MutationObserver((_, observer) => {
      if (!document.body) return;
      const root = document.documentElement;
      probe.atBody = {
        calm: root.hasAttribute('data-calm'),
        entering: root.hasAttribute('data-entering'),
        js: root.classList.contains('js'),
      };
      observer.disconnect();
    }).observe(document, { childList: true, subtree: true });

    document.addEventListener('irl:revealed', () => (probe.revealedAt = performance.now()));

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
          if (!entry.hadRecentInput) probe.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) probe.longTasks.push({ start: entry.startTime, duration: entry.duration });
      }).observe({ type: 'longtask', buffered: true });
      // Long animation frames say WHICH script made a frame long; a long
      // task alone cannot tell the page's own work from style and layout.
      new PerformanceObserver((list) => {
        type Loaf = PerformanceEntry & { blockingDuration: number; scripts: Array<{ sourceURL: string; invoker: string; duration: number }> };
        for (const entry of list.getEntries() as Loaf[]) {
          if (entry.blockingDuration <= 0) continue;
          probe.frames.push({
            start: entry.startTime,
            duration: entry.duration,
            scripts: entry.scripts.map((s) => ({ source: s.sourceURL.split('/').pop() ?? '', invoker: s.invoker, duration: s.duration })),
          });
        }
      }).observe({ type: 'long-animation-frame', buffered: true });
    } catch {
      // Older engines: the related assertions read zero.
    }
  });
}

export async function readProbe(page: Page): Promise<Probe> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (window as any).__probe;
    const contexts = (p?.contexts ?? []) as Array<WebGLRenderingContext>;
    return {
      raf: p?.raf ?? 0,
      gl: contexts.length,
      glLive: contexts.filter((c) => !c.isContextLost()).length,
      atBody: p?.atBody ?? null,
      cls: p?.cls ?? 0,
      longTasks: p?.longTasks ?? [],
      frames: p?.frames ?? [],
      revealedAt: p?.revealedAt ?? null,
    };
  });
}

/** rAF calls during `ms` of doing nothing at all. */
export async function rafDuring(page: Page, ms: number): Promise<number> {
  const before = (await readProbe(page)).raf;
  await page.waitForTimeout(ms);
  return (await readProbe(page)).raf - before;
}

/**
 * Waits until no animation frame has been requested for `quietMs`, and returns
 * how long that took (from the call) and how many frames were requested on
 * the way. Returns `quietAt: null` if the page never went quiet before
 * `timeoutMs`. Use this instead of one fixed rAF window wherever something
 * mounts late on purpose (the hero scan waits for load, idle and visibility).
 */
export async function untilQuiet(
  page: Page,
  { quietMs = 1500, timeoutMs = 9000 } = {},
): Promise<{ quietAt: number | null; frames: number }> {
  const start = Date.now();
  const first = (await readProbe(page)).raf;
  let last = first;
  let lastChange = Date.now();
  while (Date.now() - start < timeoutMs) {
    await page.waitForTimeout(100);
    const now = (await readProbe(page)).raf;
    if (now !== last) {
      last = now;
      lastChange = Date.now();
    } else if (Date.now() - lastChange >= quietMs) {
      return { quietAt: lastChange - start, frames: last - first };
    }
  }
  return { quietAt: null, frames: last - first };
}

/**
 * Persisted calm, exactly as the toggle stores it (§5.2). Set in an init
 * script so it is in storage before the boot snippet reads it.
 */
export async function useStoredCalm(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('irl:motion', 'calm');
    } catch {
      // Storage blocked: the test then sees no calm and reports it.
    }
  });
}

/**
 * Loaded, revealed (the `irl:revealed` signal every module waits for), and
 * every time-based transition finished — scroll-driven animations are left
 * alone, they are a function of position, not of time.
 */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('load');
  await page.waitForFunction(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (window as any).__probe;
    // The gate plays its own sequence and never announces a reveal.
    if (!p || document.querySelector('[data-gate]')) return true;
    return p.revealedAt !== null || !document.querySelector('[data-transition-cover]');
  });
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .filter((a) => a.timeline === document.timeline)
        .every((a) => a.playState !== 'running' || (a.effect?.getComputedTiming().iterations ?? 1) === Infinity),
    undefined,
    { timeout: 10_000 },
  );
}

/** Scroll-driven animations currently attached to anything in the document. */
export async function scrollDrivenAnimations(page: Page): Promise<number> {
  return page.evaluate(
    () => document.getAnimations().filter((a) => a.timeline !== null && a.timeline !== document.timeline).length,
  );
}

/** Two frames: long enough for a scroll timeline to reflect a new position. */
export async function frames(page: Page, n = 2): Promise<void> {
  await page.evaluate(
    (count) =>
      new Promise<void>((done) => {
        let left = count;
        const tick = () => (--left <= 0 ? done() : requestAnimationFrame(tick));
        requestAnimationFrame(tick);
      }),
    n,
  );
}

/**
 * Is this element, and every ancestor up to <html>, at identity: no
 * transform, translate, scale or rotate, and opacity 1? Returns the first
 * offender, or null.
 */
export async function identityOffender(page: Page, selector: string): Promise<string | null> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return `${sel}: not found`;
    const identityTransform = (v: string) => v === 'none' || v === 'matrix(1, 0, 0, 1, 0, 0)';
    const zero = (v: string) => v === 'none' || /^0(px)?( 0(px)?)*( 0(px)?)?$/.test(v.trim());
    const one = (v: string) => v === 'none' || /^1( 1)*$/.test(v.trim());
    const nodes = [...el.querySelectorAll('[data-depth], [data-tilt], [data-lift]'), el];
    for (let a = el.parentElement; a; a = a.parentElement) nodes.push(a);
    for (const node of nodes) {
      const cs = getComputedStyle(node);
      const label = `${node.tagName.toLowerCase()}${node.className && typeof node.className === 'string' ? `.${node.className.trim().split(/\s+/).join('.')}` : ''}`;
      if (!identityTransform(cs.transform)) return `${label} transform: ${cs.transform}`;
      if (!zero(cs.translate)) return `${label} translate: ${cs.translate}`;
      if (!one(cs.scale)) return `${label} scale: ${cs.scale}`;
      if (cs.rotate !== 'none' && !/^0deg$|^[xyz] 0deg$/.test(cs.rotate)) return `${label} rotate: ${cs.rotate}`;
      if (Number.parseFloat(cs.opacity) < 1) return `${label} opacity: ${cs.opacity}`;
    }
    return null;
  }, selector);
}

/** Puts the element's top edge at `fraction` of the viewport height. */
export async function placeTop(page: Page, selector: string, fraction: number): Promise<void> {
  await page.evaluate(
    ([sel, f]) => {
      const el = document.querySelector(sel as string);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - innerHeight * (f as number)), behavior: 'instant' });
    },
    [selector, fraction] as const,
  );
  await frames(page);
}

export function isDesktop(info: TestInfo): boolean {
  return info.project.name === 'desktop' || info.project.name === 'gpu';
}

// ─────────────────────────────────────────────────────────── pixels

export interface Bitmap {
  width: number;
  height: number;
  /** RGBA, 8 bits per channel. */
  data: Uint8Array;
}

/** Decodes the 8-bit, non-interlaced RGB(A) PNGs Chrome screenshots produce. */
export function decodePng(png: Buffer): Bitmap {
  let at = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat: Buffer[] = [];
  while (at < png.length) {
    const length = png.readUInt32BE(at);
    const type = png.toString('ascii', at + 4, at + 8);
    const body = png.subarray(at + 8, at + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      if (body[8] !== 8 || body[12] !== 0) throw new Error('decodePng: only 8-bit, non-interlaced');
      colorType = body[9]!;
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    at += 12 + length;
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`decodePng: colour type ${colorType} not supported`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = new Uint8Array(width * height * 4);
  const prev = new Uint8Array(stride);
  const line = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]!;
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels]! : 0;
      const b = prev[i]!;
      const c = i >= channels ? prev[i - channels]! : 0;
      let v = src[i]!;
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      line[i] = v & 0xff;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      out[o] = line[x * channels]!;
      out[o + 1] = line[x * channels + 1]!;
      out[o + 2] = line[x * channels + 2]!;
      out[o + 3] = channels === 4 ? line[x * channels + 3]! : 255;
    }
    prev.set(line);
  }
  return { width, height, data: out };
}

/** WCAG relative luminance of an sRGB colour. */
export function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export const contrast = (l1: number, l2: number) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

/**
 * Worst-case contrast of an element's text over whatever is behind it.
 *
 * The background is photographed with the text made transparent, so no
 * anti-aliased glyph edge is ever mistaken for background, and anything drawn
 * behind it (the scan canvas) is captured exactly as it is. It is read at the
 * 98th luminance percentile for light text (2nd for dark): the brightest
 * points of a scan behind bone text are what threaten it, not the average.
 */
export async function textContrast(page: Page, selector: string): Promise<number> {
  const el = page.locator(selector).first();
  const text = parseRgb(await el.evaluate((node) => getComputedStyle(node).color));
  await el.evaluate((node) => {
    for (const n of [node, ...node.querySelectorAll('*')] as HTMLElement[]) {
      n.style.setProperty('color', 'transparent', 'important');
      n.style.setProperty('text-shadow', 'none', 'important');
      n.style.setProperty('text-decoration-color', 'transparent', 'important');
    }
  });
  await frames(page);
  const bitmap = decodePng(await el.screenshot({ animations: 'allow' }));
  await el.evaluate((node) => {
    for (const n of [node, ...node.querySelectorAll('*')] as HTMLElement[]) {
      n.style.removeProperty('color');
      n.style.removeProperty('text-shadow');
      n.style.removeProperty('text-decoration-color');
    }
  });
  const bg: number[] = [];
  for (let i = 0; i < bitmap.data.length; i += 4) bg.push(luminance(bitmap.data[i]!, bitmap.data[i + 1]!, bitmap.data[i + 2]!));
  bg.sort((a, b) => a - b);
  const lt = luminance(...text);
  const worst = lt > 0.18 ? bg[Math.floor((bg.length - 1) * 0.98)]! : bg[Math.floor((bg.length - 1) * 0.02)]!;
  return contrast(lt, worst);
}

export function parseRgb(css: string): [number, number, number] {
  const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(css);
  if (!m) throw new Error(`parseRgb: ${css}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Pages every structural check walks: one of each page type. */
export const PAGES = {
  gate: '/',
  home: '/en/',
  case: '/en/projects/circus-movement/',
  splatoo: '/en/projects/splatoo/',
  laby: '/en/laby/',
  labyDetail: '/en/laby/unreal/',
  lab: '/en/lab/',
  note: '/en/lab/digital-space/',
  notFound: '/404.html',
} as const;
