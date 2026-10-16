import { REVEAL_EVENT } from '../language/enterReveal';
import { hasFinePointer, idle, onMotionPreferenceChange, prefersReducedMotion } from '../utils/env';

/**
 * DEPTH RUNTIME
 * =============
 * Almost all of the depth layer is CSS (styles/depth.css), driven by native
 * scroll timelines on the compositor. This module is the small remainder that
 * needs script, and it is deliberately late: it waits for the page to reveal
 * itself (`irl:revealed`), then for an idle moment, so nothing it does can
 * compete with first paint, the enter transition or LCP.
 *
 * Then it:
 *   - marks `html.depth-ready` (live depth is running and not calm);
 *   - loads the pointer tilt, but only for a real mouse, only when not calm,
 *     and only on a page that has a `[data-tilt]` stage. A phone never
 *     downloads it.
 *
 * Calm switched on mid-visit tears the tilt down at once; switched off, it
 * comes back. Nothing here runs on the language gate or the 404.
 */

/** If a page never announces its reveal, depth still starts, but never under a raised cover. */
const REVEAL_FALLBACK_MS = 4000;
/** Any of these is a visitor's first input. */
const INPUTS = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'];
const IDLE_TIMEOUT_MS = 2000;

/** Calls `run` once the page has revealed itself. Returns a cancel function. */
export function afterReveal(run: () => void): () => void {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    cancel();
    run();
  };
  const fallback = window.setTimeout(() => {
    if (!document.documentElement.hasAttribute('data-entering')) go();
  }, REVEAL_FALLBACK_MS);
  const cancel = () => {
    done = true;
    clearTimeout(fallback);
    document.removeEventListener(REVEAL_EVENT, go);
  };
  document.addEventListener(REVEAL_EVENT, go);
  return cancel;
}

export function initDepth(): () => void {
  const root = document.documentElement;
  let booted = false;
  let disposed = false;
  let loading = false;
  let teardownTilt: (() => void) | null = null;
  // The living scene arrives with the visitor's first input after the
  // reveal (a mouse move, a touch, a scroll, a key), never on load: nothing
  // moves on its own, and none of it is on the load path LCP and TBT are
  // measured on. The imports live here because this is the one entry with
  // lazy imports, so Vite's preload helper stays inside this chunk.
  const wake = () => {
    INPUTS.forEach((t) => removeEventListener(t, wake));
    import('../scene/scene.ts').then((m) => m.initScene(), () => {});
  };
  let cancelIdle = () => {};

  const wantsTilt = () =>
    hasFinePointer() && !prefersReducedMotion() && document.querySelector('[data-tilt]') !== null;

  const mountTilt = () => {
    if (teardownTilt || loading || !wantsTilt()) return;
    loading = true;
    import('./tilt')
      .then(({ initTilt }) => {
        // The preference may have changed while the chunk was in flight.
        if (!disposed && !teardownTilt && wantsTilt()) teardownTilt = initTilt();
      })
      .catch(() => {
        /* Tilt is an enhancement. A failed chunk leaves flat stages. */
      })
      .finally(() => (loading = false));
  };

  const sync = () => {
    const calm = prefersReducedMotion();
    root.classList.toggle('depth-ready', !calm);
    if (calm) {
      teardownTilt?.();
      teardownTilt = null;
    } else {
      mountTilt();
    }
  };

  // iOS Safari only applies `:active` (the `.press` depth cue) once a touch
  // listener exists. A passive no-op never delays or intercepts a scroll.
  const noop = () => {};
  const press = document.querySelector('.press') !== null;

  const cancelReveal = afterReveal(() => {
    if (document.querySelector('[data-scene]')) INPUTS.forEach((t) => addEventListener(t, wake, { passive: true }));
    cancelIdle = idle(() => {
      booted = true;
      if (press) document.addEventListener('touchstart', noop, { passive: true });
      sync();
    }, IDLE_TIMEOUT_MS);
  });

  const offPreference = onMotionPreferenceChange(() => {
    if (booted) sync();
  });

  return () => {
    disposed = true;
    cancelReveal();
    cancelIdle();
    offPreference();
    document.removeEventListener('touchstart', noop);
    teardownTilt?.();
    teardownTilt = null;
    root.classList.remove('depth-ready');
  };
}
