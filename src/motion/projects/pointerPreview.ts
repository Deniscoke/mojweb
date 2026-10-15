import { clamp, createLoop, hasFinePointer, lerp, prefersReducedMotion } from '../utils/env';

/**
 * PROJECT INTERACTION (desktop enhancement)
 * =========================================
 * On a fine pointer, Selected Work is a list of oversized typographic rows
 * and the hovered project's generated plate follows the cursor.
 *
 * On touch, this module never runs. The same markup is laid out by CSS as
 * cards with the plate shown inline — not a hover effect the finger cannot
 * reach, and not a cropped desktop layout either. Both interaction models
 * lead to the same link, and the row is a plain <a> in both cases, so it is
 * reachable by keyboard and by screen reader regardless.
 *
 * THE CARRY (motion depth plan §3.4)
 * The plate is not dragged rigidly. The loop already eases the plate towards
 * the pointer, so the distance it trails behind — the lag — is its momentum.
 * That lag leans the plate's inner stage (`.project__plate-tilt`) away from
 * the direction of travel and floats its accent sheet forward, through a
 * second, softer spring, so the plate swings rather than twitches. When the
 * hand stops, the lag closes, the plate settles flat, `data-tilting` comes off
 * and the stage is `transform: none`: at rest it is the flat plate it always
 * was.
 *
 * Three things the carry never does:
 * - write anywhere but the active row's stage (no inherited custom
 *   properties on the section, which would restyle the whole list per frame);
 * - lean the outer `.project__plate`, the box the plate transition measures;
 * - lean into a click: a press zeroes and snaps the lean before the click can
 *   start the plate transition, so the plate always grows from a flat plate.
 */

/** Trailing distance, in px, that reads as a full lean (10° across, 6° up/down). */
const LEAN_RANGE = 160;
/** How quickly the lean follows the lag: the second, softer spring. */
const LEAN_EASE = 0.2;
/** A lean below this is not worth a 3D layer; one this small is "settled". */
const LEAN_START = 0.01;
const LEAN_REST = 0.004;

/** The plate is a carried preview only in this layout (see SelectedWork). */
const CARRIED_LAYOUT = '(min-width: 62rem) and (hover: hover) and (pointer: fine)';

/** How long a plate that was let go takes to fade out (--d-fast, plus a frame). */
const RELEASE_MS = 260;

/** A keyboard-anchored plate sits in the row and never leans. */
function isAnchored(row: HTMLElement): boolean {
  try {
    return row.querySelector(':focus-visible') !== null;
  } catch {
    return false;
  }
}

function stageOf(row: HTMLElement | null): HTMLElement | null {
  return row?.querySelector<HTMLElement>('.project__plate-tilt') ?? null;
}

function flatten(stage: HTMLElement): void {
  stage.removeAttribute('data-tilting');
  stage.style.removeProperty('--lean-x');
  stage.style.removeProperty('--lean-y');
  stage.style.removeProperty('--lean-lift');
}

export function initProjectPointerPreview(section: HTMLElement): () => void {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const rows = Array.from(section.querySelectorAll<HTMLElement>('[data-project-row]'));
  if (rows.length === 0) return () => {};

  const carriedLayout = window.matchMedia(CARRIED_LAYOUT);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let active: HTMLElement | null = null;

  let leanX = 0;
  let leanY = 0;
  /** The stage currently leaning, if any. Only ever the active row's. */
  let tilting: HTMLElement | null = null;
  /** A mouse button is down: the lean is held at zero until it comes up. */
  let held = false;
  /** Plates that were let go mid-lean keep it while they fade, then go flat. */
  const releasing = new Map<HTMLElement, number>();

  /** Lets go of the leaning stage: at once, or after the plate has faded. */
  const letGo = (later: boolean) => {
    const stage = tilting;
    if (!stage) return;
    tilting = null;
    if (!later) {
      flatten(stage);
      return;
    }
    window.clearTimeout(releasing.get(stage));
    releasing.set(
      stage,
      window.setTimeout(() => {
        releasing.delete(stage);
        if (stage !== tilting) flatten(stage);
      }, RELEASE_MS),
    );
  };

  /** Writes the current lean on the active row's stage, or keeps it flat. */
  const lean = () => {
    const stage = active && !held && carriedLayout.matches && !isAnchored(active) ? stageOf(active) : null;
    if (stage !== tilting) letGo(stage !== null);
    if (!stage) return;

    const lift = Math.min(1, Math.hypot(leanX, leanY));
    if (!tilting) {
      // Hovered again while it was still fading out: it is ours again, and
      // must not keep the lean it was let go with.
      const pending = releasing.get(stage);
      if (pending !== undefined) {
        window.clearTimeout(pending);
        releasing.delete(stage);
        if (lift < LEAN_START) flatten(stage);
      }
      if (lift < LEAN_START) return;
      tilting = stage;
      stage.setAttribute('data-tilting', '');
    }
    stage.style.setProperty('--lean-x', leanX.toFixed(4));
    stage.style.setProperty('--lean-y', leanY.toFixed(4));
    stage.style.setProperty('--lean-lift', lift.toFixed(4));
  };

  /**
   * The position eases exactly as it always has: every frame until it is
   * within 0.4px, then it stops where it is. The lean may need a few frames
   * more to settle, and must not drag the plate on by a sub-pixel meanwhile,
   * or the resting plate would land a fraction of a pixel somewhere new.
   */
  let placed = false;

  const loop = createLoop(() => {
    if (!placed) {
      currentX = lerp(currentX, targetX, 0.14);
      currentY = lerp(currentY, targetY, 0.14);
      section.style.setProperty('--preview-x', `${currentX.toFixed(1)}px`);
      section.style.setProperty('--preview-y', `${currentY.toFixed(1)}px`);
      placed = Math.abs(currentX - targetX) < 0.4 && Math.abs(currentY - targetY) < 0.4;
    }

    // The plate leans the way it is carried: away from where it is heading,
    // in proportion to how far it trails the hand.
    const lagX = held ? 0 : clamp((targetX - currentX) / LEAN_RANGE, -1, 1);
    const lagY = held ? 0 : clamp((targetY - currentY) / LEAN_RANGE, -1, 1);
    leanX = held ? 0 : lerp(leanX, lagX, LEAN_EASE);
    leanY = held ? 0 : lerp(leanY, lagY, LEAN_EASE);

    const settled = placed && Math.abs(leanX) < LEAN_REST && Math.abs(leanY) < LEAN_REST;

    if (settled) {
      leanX = 0;
      leanY = 0;
      letGo(false);
    } else {
      lean();
    }
    // Keep running while a row is hovered even once settled would be waste;
    // the next pointermove restarts it.
    return !settled;
  });

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    targetX = event.clientX;
    targetY = event.clientY;
    placed = false;
    loop.start();
  };

  /**
   * A press lands the plate. The lean is zeroed and the stage flattened here,
   * synchronously, so by the time the click handler measures the plate and
   * clones it into the transition, what is on screen is the flat plate.
   */
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    held = true;
    leanX = 0;
    leanY = 0;
    letGo(false);
  };

  const onPointerUp = () => {
    held = false;
  };

  const activate = (row: HTMLElement) => {
    if (active === row) return;
    active?.removeAttribute('data-preview-active');
    active = row;
    row.setAttribute('data-preview-active', '');
    // The plate draws itself in the first time it is summoned.
    row.classList.add('is-drawn');
    section.setAttribute('data-preview-on', '');
    // Snap on first entry so the plate does not fly in from the last position.
    if (!section.hasAttribute('data-preview-warm')) {
      currentX = targetX;
      currentY = targetY;
      section.setAttribute('data-preview-warm', '');
    }
    placed = false;
    loop.start();
  };

  const deactivate = () => {
    active?.removeAttribute('data-preview-active');
    active = null;
    held = false;
    leanX = 0;
    leanY = 0;
    letGo(true);
    section.removeAttribute('data-preview-on');
    loop.stop();
  };

  rows.forEach((row) => {
    row.addEventListener('pointerenter', (e) => {
      if ((e as PointerEvent).pointerType !== 'mouse') return;
      activate(row);
    });
    // Focus is not hover, but a keyboard user deserves the same information.
    row.addEventListener('focusin', () => row.setAttribute('data-preview-focus', ''));
    row.addEventListener('focusout', () => row.removeAttribute('data-preview-focus'));
  });

  section.addEventListener('pointermove', onPointerMove, { passive: true });
  section.addEventListener('pointerdown', onPointerDown, { passive: true });
  section.addEventListener('pointerup', onPointerUp, { passive: true });
  section.addEventListener('pointercancel', onPointerUp, { passive: true });
  section.addEventListener('pointerleave', deactivate);

  return () => {
    section.removeEventListener('pointermove', onPointerMove);
    section.removeEventListener('pointerdown', onPointerDown);
    section.removeEventListener('pointerup', onPointerUp);
    section.removeEventListener('pointercancel', onPointerUp);
    section.removeEventListener('pointerleave', deactivate);
    loop.destroy();
    deactivate();
    releasing.forEach((timer, stage) => {
      window.clearTimeout(timer);
      flatten(stage);
    });
    releasing.clear();
    section.removeAttribute('data-preview-warm');
  };
}
