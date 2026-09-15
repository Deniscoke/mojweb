import { createLoop, hasFinePointer, lerp, prefersReducedMotion } from '../utils/env';

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
 */

export function initProjectPointerPreview(section: HTMLElement): () => void {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const rows = Array.from(section.querySelectorAll<HTMLElement>('[data-project-row]'));
  if (rows.length === 0) return () => {};

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let active: HTMLElement | null = null;

  const loop = createLoop(() => {
    currentX = lerp(currentX, targetX, 0.14);
    currentY = lerp(currentY, targetY, 0.14);
    section.style.setProperty('--preview-x', `${currentX.toFixed(1)}px`);
    section.style.setProperty('--preview-y', `${currentY.toFixed(1)}px`);

    const settled = Math.abs(currentX - targetX) < 0.4 && Math.abs(currentY - targetY) < 0.4;
    // Keep running while a row is hovered even once settled would be waste;
    // the next pointermove restarts it.
    return !settled;
  });

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    targetX = event.clientX;
    targetY = event.clientY;
    loop.start();
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
    loop.start();
  };

  const deactivate = () => {
    active?.removeAttribute('data-preview-active');
    active = null;
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
  section.addEventListener('pointerleave', deactivate);

  return () => {
    section.removeEventListener('pointermove', onPointerMove);
    section.removeEventListener('pointerleave', deactivate);
    loop.destroy();
    deactivate();
    section.removeAttribute('data-preview-warm');
  };
}
