import { clamp, createLoop } from '../utils/env';

/**
 * POINTER TILT (desktop enhancement)
 * ==================================
 * A `[data-tilt]` stage leans away from a real mouse by a few degrees, and
 * any `[data-lift]` inside it floats toward the viewer, so a flat plate reads
 * as a small layered object. The geometry is CSS (styles/depth.css); this
 * module only writes three numbers on the stage under the pointer:
 *
 *   --tilt-x   -1 (pointer at the left edge) … 1 (right edge)
 *   --tilt-y   -1 (top edge) … 1 (bottom edge)
 *   --tilt-z    0 (flat) … 1 (fully engaged: drives the lift)
 *
 * The rules that keep it honest:
 *   - One delegated listener for every stage on the page, mouse only. Touch
 *     never tilts, and the module is never even loaded on a touch device.
 *   - The stage rect is read once, when the pointer enters it, at rest. It is
 *     never re-read mid-tilt, when the box is rotated and the numbers lie;
 *     page scroll is compensated arithmetically instead.
 *   - `data-tilting` and `will-change` exist only while a stage is moving.
 *     Settled, the stage is `transform: none` again and its layer is freed.
 *   - The loop runs only while something is still easing, then stops.
 *   - Focus is ignored entirely, and so is a loaded embed (`[data-loaded]`):
 *     an iframe must never sit in a 3D context.
 */

const STAGE = '[data-tilt]';
/** Time constants (ms). Leans in quickly, settles slowly: the house expo-out. */
const TRACK_MS = 110;
const RELEASE_MS = 200;
/** Below this (0.03°, a tenth of a pixel of lift) the stage is at rest and may go flat. */
const REST = 0.005;

interface Stage {
  el: HTMLElement;
  /** Page coordinates of the box at rest, read once. */
  left: number;
  top: number;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
}

export function initTilt(): () => void {
  const stages = new Map<HTMLElement, Stage>();
  let active: Stage | null = null;

  const write = (s: Stage) => {
    s.el.style.setProperty('--tilt-x', s.x.toFixed(4));
    s.el.style.setProperty('--tilt-y', s.y.toFixed(4));
    s.el.style.setProperty('--tilt-z', s.z.toFixed(4));
  };

  const flatten = (s: Stage) => {
    s.el.removeAttribute('data-tilting');
    s.el.style.removeProperty('--tilt-x');
    s.el.style.removeProperty('--tilt-y');
    s.el.style.removeProperty('--tilt-z');
    s.el.style.willChange = '';
    stages.delete(s.el);
  };

  const loop = createLoop((dt) => {
    let moving = false;

    for (const s of stages.values()) {
      const k = 1 - Math.exp(-dt / (s === active ? TRACK_MS : RELEASE_MS));
      s.x += (s.tx - s.x) * k;
      s.y += (s.ty - s.y) * k;
      s.z += (s.tz - s.z) * k;

      const easing =
        Math.abs(s.tx - s.x) > REST || Math.abs(s.ty - s.y) > REST || Math.abs(s.tz - s.z) > REST;

      if (!easing && s !== active) {
        // Back at zero and nobody is pointing at it: flat, crisp, de-promoted.
        flatten(s);
        continue;
      }
      write(s);
      if (easing) moving = true;
    }

    return moving;
  });

  const engage = (el: HTMLElement): Stage => {
    const known = stages.get(el);
    if (known) return known; // still springing back: keep the rect read at rest

    const rect = el.getBoundingClientRect();
    const s: Stage = {
      el,
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width || 1,
      height: rect.height || 1,
      x: 0,
      y: 0,
      z: 0,
      tx: 0,
      ty: 0,
      tz: 0,
    };
    stages.set(el, s);
    el.style.willChange = 'transform';
    el.setAttribute('data-tilting', '');
    return s;
  };

  const letGo = () => {
    if (!active) return;
    active.tx = 0;
    active.ty = 0;
    active.tz = 0;
    active = null;
    loop.start();
  };

  const stageOf = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof Element)) return null;
    const el = target.closest<HTMLElement>(STAGE);
    return el && !el.closest('[data-loaded]') ? el : null;
  };

  /** Pointer position over the stage's box AT REST, 0…1 on each axis. */
  const local = (s: Stage, event: PointerEvent) => ({
    u: (event.clientX + window.scrollX - s.left) / s.width,
    v: (event.clientY + window.scrollY - s.top) / s.height,
  });

  /**
   * Hysteresis. A leaning stage pulls its far edge in by a few pixels, so a
   * pointer resting near that edge would fall off the rotated box, let go,
   * land on the flat box again and re-engage, forever. Membership is decided
   * against the box at rest instead, which does not move.
   */
  const within = (s: Stage, event: PointerEvent) => {
    const { u, v } = local(s, event);
    return u >= 0 && u <= 1 && v >= 0 && v <= 1;
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    let el = stageOf(event.target);
    if (!el && active && within(active, event)) el = active.el;

    if (el !== active?.el) {
      letGo();
      if (el) active = engage(el);
    }
    if (!active) return;

    const { u, v } = local(active, event);
    active.tx = clamp(u * 2 - 1, -1, 1);
    active.ty = clamp(v * 2 - 1, -1, 1);
    active.tz = 1;
    loop.start();
  };

  // Leaving the stage, or the window, lets it settle back. `relatedTarget` is
  // where the pointer went; null means it left the document altogether.
  const onOut = (event: PointerEvent) => {
    if (!active || event.pointerType !== 'mouse') return;
    const to = event.relatedTarget;
    if (!(to instanceof Node)) return letGo();
    if (!active.el.contains(to) && !within(active, event)) letGo();
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });
  window.addEventListener('blur', letGo);

  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerout', onOut);
    window.removeEventListener('blur', letGo);
    loop.destroy();
    active = null;
    // Torn down (Calm switched on): every stage goes flat now, not eased.
    for (const s of [...stages.values()]) flatten(s);
  };
}
