import { hasFinePointer, prefersReducedMotion } from './utils/env';

/**
 * LEVEL 3 — magnetic interaction
 * ==============================
 * A small pull toward the cursor on a handful of primary controls. No rAF:
 * the element is moved directly on pointermove and released with a CSS
 * transition, which is both cheaper and snappier than easing it in script.
 *
 * Applied to at most a couple of elements per page. A magnetic everything is
 * the kind of effect that exists only because it is possible.
 */

export function initMagnetic(scope: ParentNode = document, strength = 0.28): () => void {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const targets = Array.from(scope.querySelectorAll<HTMLElement>('[data-magnetic]'));
  const cleanups: (() => void)[] = [];

  targets.forEach((el) => {
    const power = Number(el.dataset.magnetic) || strength;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.transition = 'none';
      el.style.transform = `translate3d(${dx * power}px, ${dy * power}px, 0)`;
    };

    const onLeave = () => {
      el.style.transition = 'transform var(--d-base) var(--e-out)';
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.style.transform = '';
      el.style.transition = '';
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
