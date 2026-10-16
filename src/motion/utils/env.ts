/**
 * MOTION ENVIRONMENT
 * ==================
 * Every motion module asks these questions before it does anything. Keeping
 * them in one place is what stops "reduced motion" from being remembered in
 * four modules and forgotten in the fifth.
 */

const REDUCED = '(prefers-reduced-motion: reduce)';
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/**
 * CALM
 * The site's own reduced-motion switch (the "Calm motion" toggles in the nav
 * and footer). It is an attribute on <html>, set before first paint by the
 * boot script in BaseLayout from the stored preference, so CSS and every
 * module see the same answer from the first frame.
 */
export const CALM_ATTRIBUTE = 'data-calm';
/** Dispatched on `document` when a toggle changes Calm. `detail: { calm }`. */
export const MOTION_CHANGE_EVENT = 'irl:motionchange';
/** localStorage key. The only value ever stored is `'calm'`. */
export const MOTION_STORAGE_KEY = 'irl:motion';

/**
 * True under the system setting OR the site's Calm toggle. Every module that
 * already asks this question obeys Calm with no wiring of its own.
 */
export function prefersReducedMotion(): boolean {
  return systemPrefersReducedMotion() || document.documentElement.hasAttribute(CALM_ATTRIBUTE);
}

/** The operating-system setting alone. Only the toggles need the difference. */
export function systemPrefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED).matches;
}

/** True only for real pointing devices. Never used to gate access to content. */
export function hasFinePointer(): boolean {
  return window.matchMedia(FINE_POINTER).matches;
}

/** The system setting only. Prefer `onMotionPreferenceChange`, which also hears Calm. */
export function onReducedMotionChange(handler: (reduced: boolean) => void): () => void {
  const mq = window.matchMedia(REDUCED);
  const listener = (e: MediaQueryListEvent) => handler(e.matches);
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
}

/**
 * Fires with the combined answer (`prefersReducedMotion()`) whenever either
 * the system setting or the Calm toggle changes. Modules that can tear down
 * live (depth, tilt, the scan engine) listen here; the older ones read the
 * preference once at init and apply it on the next page.
 */
export function onMotionPreferenceChange(handler: (calm: boolean) => void): () => void {
  const mq = window.matchMedia(REDUCED);
  const listener = () => handler(prefersReducedMotion());
  mq.addEventListener('change', listener);
  document.addEventListener(MOTION_CHANGE_EVENT, listener);
  return () => {
    mq.removeEventListener('change', listener);
    document.removeEventListener(MOTION_CHANGE_EVENT, listener);
  };
}

/** Native scroll-driven animations. Without them the depth layer is simply absent. */
export function supportsScrollTimeline(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');
}

interface DeviceHints {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

/**
 * Whether this device should be asked to run WebGL at all. A cheap, honest
 * pre-filter, run before any context exists: WebGL2, no data saver, and
 * enough memory and cores where the browser says. The engine still asks for
 * its context with `failIfMajorPerformanceCaveat`, which is the real test.
 */
export function canAffordGL(): boolean {
  if (typeof WebGL2RenderingContext === 'undefined') return false;
  const nav = navigator as Navigator & DeviceHints;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return false;
  return true;
}

/**
 * Runs `callback` when the main thread is idle, and no later than `timeout`
 * ms. Safari has no `requestIdleCallback`; there the nearest honest stand-in
 * is "the task after the next painted frame". Returns a cancel function.
 */
export function idle(callback: () => void, timeout = 2000): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => callback(), { timeout });
    return () => window.cancelIdleCallback(id);
  }

  let done = false;
  let after = 0;
  const cancel = () => {
    done = true;
    cancelAnimationFrame(frame);
    clearTimeout(after);
    clearTimeout(deadline);
  };
  const run = () => {
    if (done) return;
    cancel();
    callback();
  };
  const frame = requestAnimationFrame(() => (after = window.setTimeout(run, 0)));
  // rAF never fires in a background tab; the deadline still does.
  const deadline = window.setTimeout(run, timeout);
  return cancel;
}

/**
 * A rAF loop that refuses to run when it cannot be seen.
 *
 * It stops on `visibilitychange`, and `stop()` is idempotent, so callers can
 * wire it to an IntersectionObserver without tracking state themselves. No
 * module in this codebase starts a bare `requestAnimationFrame` recursion.
 */
export function createLoop(tick: (dt: number, now: number) => boolean | void) {
  let raf = 0;
  let last = 0;
  let running = false;

  const frame = (now: number) => {
    const dt = last ? Math.min(now - last, 50) : 16.7;
    last = now;
    const keepGoing = tick(dt, now);
    if (keepGoing === false) {
      stop();
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  function start() {
    if (running || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  }

  const onVisibility = () => (document.hidden ? stop() : undefined);
  document.addEventListener('visibilitychange', onVisibility);

  return {
    start,
    stop,
    get running() {
      return running;
    },
    destroy() {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}

/** Fires once, when the element first enters the viewport. Self-disconnecting. */
export function whenVisible(
  el: Element,
  onEnter: () => void,
  options: IntersectionObserverInit = { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
): () => void {
  if (!('IntersectionObserver' in window)) {
    onEnter();
    return () => {};
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        onEnter();
        io.disconnect();
      }
    }
  }, options);
  io.observe(el);
  return () => io.disconnect();
}

/** Runs while the element is on screen, pauses when it leaves. */
export function whileVisible(el: Element, loop: { start(): void; stop(): void }): () => void {
  if (!('IntersectionObserver' in window)) {
    loop.start();
    return () => loop.stop();
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.isIntersecting ? loop.start() : loop.stop();
    }
  });
  io.observe(el);
  return () => {
    io.disconnect();
    loop.stop();
  };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Capped device pixel ratio. 2 is already past the point of visible return. */
export function renderScale(max = 1.75): number {
  return Math.min(window.devicePixelRatio || 1, max);
}

/** Resolves after the web fonts are ready, or immediately if that is unknown. */
export async function fontsReady(): Promise<void> {
  if (!('fonts' in document)) return;
  await document.fonts.ready;
}
