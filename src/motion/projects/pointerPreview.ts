import { clamp, createLoop, hasFinePointer, lerp, prefersReducedMotion } from '../utils/env';
import { shownPlate } from './plateTransition';

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
 *
 * THE HAND, NOT THE SCROLL (the band, SelectedWork.astro)
 * While the list is only being scrolled, each row presents its own plate in
 * the band, in CSS. Rows sliding under a still mouse fire `pointerenter` but
 * never `pointermove`, so the preview is first summoned by a real move over
 * a row, not by the page passing under the cursor. Once it is up, rows
 * entering under the pointer take it over exactly as before, until the
 * pointer leaves the section. A plate that is standing in the band when the
 * hand arrives is picked up from where it stands: the carry starts at its
 * centre, a little quicker than the follow, and the lean swings it over.
 */

/** Trailing distance, in px, that reads as a full lean (10° across, 6° up/down). */
const LEAN_RANGE = 160;
/** How quickly the lean follows the lag: the second, softer spring. */
const LEAN_EASE = 0.2;
/** A lean below this is not worth a 3D layer; one this small is "settled". */
const LEAN_START = 0.01;
const LEAN_REST = 0.004;

/** The plate is a carried preview only in this layout (see SelectedWork). */
const CARRIED_LAYOUT = '(min-width:62rem) and (hover) and (pointer:fine)';

/** How long a plate that was let go takes to fade out (--d-fast, plus a frame). */
const RELEASE_MS = 260;

/** How quickly the carried plate follows the pointer, per frame. */
const FOLLOW = 0.14;
/** A plate picked up from the band starts at this, relaxing to FOLLOW. */
const PICK_UP = 0.3;

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
  // The stage's inline style is only ever the lean (see lean()).
  stage.removeAttribute('style');
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
  /** The plate has been shown once: later entries ease from where it was. */
  let warm = false;

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
    stage.style.cssText = `--lean-x:${leanX.toFixed(4)};--lean-y:${leanY.toFixed(4)};--lean-lift:${lift.toFixed(4)}`;
  };

  /**
   * The position eases exactly as it always has: every frame until it is
   * within 0.4px, then it stops where it is. The lean may need a few frames
   * more to settle, and must not drag the plate on by a sub-pixel meanwhile,
   * or the resting plate would land a fraction of a pixel somewhere new.
   */
  let placed = false;
  /** The follow's ease. A pick-up starts quicker and relaxes back to it. */
  let ease = FOLLOW;

  const loop = createLoop(() => {
    if (!placed) {
      currentX = lerp(currentX, targetX, ease);
      currentY = lerp(currentY, targetY, ease);
      ease = Math.max(FOLLOW, ease * 0.96);
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
    // The hand has moved: the first move over a row summons its plate.
    const row = active ? null : (event.target as Element).closest<HTMLElement>('[data-project-row]');
    if (row) activate(row);
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

  function activate(row: HTMLElement): void {
    if (active === row) return;
    // Summoned while the row's plate stands in the band: pick it up from
    // there. Read before the attributes below send the band away.
    const box = active ? null : shownPlate(row);
    if (box) {
      currentX = box.x + box.width / 2;
      currentY = box.y + box.height / 2;
      ease = PICK_UP;
    } else if (!warm) {
      // Snap on first entry so the plate does not fly in from the last position.
      currentX = targetX;
      currentY = targetY;
    }
    warm = true;
    active?.removeAttribute('data-preview-active');
    active = row;
    row.setAttribute('data-preview-active', '');
    // The plate draws itself in the first time it is summoned.
    row.classList.add('is-drawn');
    section.setAttribute('data-preview-on', '');
    placed = false;
    loop.start();
  }

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
    // Once the preview is up, a row arriving under the pointer takes it over
    // (also when the page scrolls it there). Before that, only a move does.
    row.addEventListener('pointerenter', (e) => {
      if ((e as PointerEvent).pointerType !== 'mouse' || !active) return;
      activate(row);
    });
    // Focus is not hover, but a keyboard user deserves the same information:
    // that is pure CSS (`.project:has(:focus-visible)`, the anchored plate).
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
  };
}
