/**
 * MOTION ENVIRONMENT
 * ==================
 * Every motion module asks these questions before it does anything. Keeping
 * them in one place is what stops "reduced motion" from being remembered in
 * four modules and forgotten in the fifth.
 */

const REDUCED = '(prefers-reduced-motion: reduce)';
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED).matches;
}

/** True only for real pointing devices. Never used to gate access to content. */
export function hasFinePointer(): boolean {
  return window.matchMedia(FINE_POINTER).matches;
}

export function onReducedMotionChange(handler: (reduced: boolean) => void): () => void {
  const mq = window.matchMedia(REDUCED);
  const listener = (e: MediaQueryListEvent) => handler(e.matches);
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
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
