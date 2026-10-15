import { REVEAL_EVENT } from '../language/enterReveal';
import {
  canAffordGL,
  hasFinePointer,
  idle,
  onMotionPreferenceChange,
  prefersReducedMotion,
  whenVisible,
} from '../utils/env';
import type { ScanEngine, ScanHandle, ScanOptions } from './pointScan';

export type { ScanHandle, ScanInputs, ScanMode, ScanOptions } from './pointScan';

/**
 * AMBIENT MOUNT — when a GL layer may run, and for how long
 * =========================================================
 * The scheduler and contract enforcer for everything in this folder. It is
 * small and loads with the page's module script; the engine it guards
 * (pointScan + gl, ~4 KB gz) is a separate chunk imported only once all of
 * this is true, in this order:
 *
 *   1. the page has revealed itself (REVEAL_EVENT), so nothing starts under
 *      the language cover;
 *   2. `load` has fired, so the scan never competes with the page's own bytes;
 *   3. the main thread is idle (or 2.5 s have passed);
 *   4. the host is on screen;
 *   5. the device can afford it (canAffordGL: WebGL2, no Save-Data, enough
 *      memory and cores) and the context budget has room.
 *
 * Calm (OS reduce or html[data-calm]) still shows the scan: one still frame,
 * kept as a 2D image, with the context given back. Switching calm on live
 * freezes the scan where it is; switching it off brings it back to life.
 */

// -------------------------------------------------------------- context pool

/**
 * Browsers allow few live WebGL contexts per page and evict the oldest
 * silently. The site allows itself fewer: one on touch devices, two with a
 * fine pointer. A holder that has scrolled off screen is asked to give its
 * context up (snapshot, then loseContext) before a new claim is refused.
 * pointScan and depthPhoto both claim here.
 */
export interface ContextClaim {
  release(): void;
}

interface Holder {
  el: Element;
  evict: () => void;
}

const holders = new Set<Holder>();

export function claimContext(el: Element, evict: () => void): ContextClaim | null {
  if (holders.size >= (hasFinePointer() ? 2 : 1)) {
    const away = [...holders].find((h) => !onScreen(h.el));
    if (!away) return null;
    holders.delete(away);
    away.evict();
  }
  const holder = { el, evict };
  holders.add(holder);
  return { release: () => holders.delete(holder) };
}

function onScreen(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
}

// ---------------------------------------------------------------- start gate

// Recorded at import, so a mount() called after the event still knows.
let revealed = false;
document.addEventListener(REVEAL_EVENT, () => (revealed = true), { once: true });

function afterReveal(): Promise<void> {
  return new Promise((resolve) => {
    if (revealed) return resolve();
    document.addEventListener(REVEAL_EVENT, () => resolve(), { once: true });
    // Imported late, after the event already fired: an uncovered page is a
    // revealed page.
    setTimeout(() => !document.documentElement.hasAttribute('data-entering') && resolve(), 3000);
  });
}

const afterLoad = (): Promise<void> =>
  new Promise((resolve) =>
    document.readyState === 'complete' ? resolve() : addEventListener('load', () => resolve(), { once: true }),
  );

// --------------------------------------------------------------------- mount

/**
 * Same signature and handle as pointScan's `mount`, scheduled. The handle is
 * returned at once; setters called before the engine exists are kept and
 * applied when it arrives, so callers never wait or check.
 */
export function mount(host: HTMLElement, opts: ScanOptions): ScanHandle {
  const values = { yaw: 0, pitch: 0, dolly: 0 };
  const offs: Array<() => void> = [];
  let engine: ScanEngine | null = null;
  let claim: ContextClaim | null = null;
  let dead = false;
  let calmStill = false; // a still frame made BECAUSE of calm, so it may come back to life

  const handle: ScanHandle = {
    setYaw: (deg) => engine?.setYaw((values.yaw = deg)),
    setPitch: (deg) => engine?.setPitch((values.pitch = deg)),
    setDolly: (amount) => engine?.setDolly((values.dolly = amount)),
    teardown,
  };

  if (!canAffordGL()) {
    opts.onFail?.();
    return handle;
  }

  const releaseClaim = () => {
    claim?.release();
    claim = null;
  };

  function start(sweep: boolean) {
    if (dead || engine) return;
    claim = claimContext(host, () => engine?.freeze());
    if (!claim) return opts.onFail?.();
    calmStill = prefersReducedMotion();
    import('./pointScan').then(({ mount: scan }) => {
      if (dead || engine) return releaseClaim();
      engine = scan(host, {
        ...opts,
        sweep: sweep && opts.sweep,
        still: opts.still || calmStill,
        onRelease() {
          releaseClaim();
          opts.onRelease?.();
        },
        onFail() {
          engine = null;
          opts.onFail?.();
        },
      });
      engine.setYaw(values.yaw);
      engine.setPitch(values.pitch);
      engine.setDolly(values.dolly);
      engine.pause(transitioning());
    }, releaseClaim);
  }

  function stop() {
    engine?.teardown();
    engine = null;
    releaseClaim();
  }

  function teardown() {
    dead = true;
    stop();
    offs.forEach((off) => off());
  }

  afterReveal()
    .then(afterLoad)
    .then(() => new Promise<void>((resolve) => idle(resolve, 2500)))
    .then(() => !dead && offs.push(whenVisible(host, () => start(true))));

  // Page transitions own the screen while they play.
  const transitioning = () => {
    const html = document.documentElement;
    return html.hasAttribute('data-entering') || html.hasAttribute('data-plate-transition');
  };
  const mo = new MutationObserver(() => engine?.pause(transitioning()));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-entering', 'data-plate-transition'] });
  offs.push(() => mo.disconnect());

  // Calm on: keep this frame, give the context back. Calm off: live again.
  offs.push(
    onMotionPreferenceChange(() => {
      if (prefersReducedMotion()) {
        calmStill = true;
        engine?.freeze();
      } else if (engine && calmStill) {
        stop();
        start(false);
      }
    }),
  );

  // A still frame is pinned to its pixel size; when the host is resized,
  // draw a new one rather than leave the old one misplaced.
  let size = '';
  let timer = 0;
  const ro = new ResizeObserver(([entry]) => {
    const next = `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`;
    if (size && next !== size && engine && calmStill) {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        stop();
        start(false);
      }, 300);
    }
    size = next;
  });
  ro.observe(host);
  offs.push(() => ro.disconnect());

  // bfcache: nothing GL survives a hidden page; a restored page remounts.
  const onHide = () => stop();
  const onShow = (e: PageTransitionEvent) => e.persisted && start(false);
  addEventListener('pagehide', onHide);
  addEventListener('pageshow', onShow);
  offs.push(() => {
    clearTimeout(timer);
    removeEventListener('pagehide', onHide);
    removeEventListener('pageshow', onShow);
  });

  return handle;
}
