import { createLoop, hasFinePointer, lerp, prefersReducedMotion } from '../utils/env';

/**
 * HERO POINTER FIELD (desktop enhancement)
 * ========================================
 * The hero drifts very slightly with the pointer. Deliberately small: the
 * hero must be fully legible and complete without ever moving the mouse,
 * because on touch it never will.
 *
 * The loop is not permanent. It starts on pointer movement and shuts itself
 * down once the eased value has settled, so an idle tab costs zero frames.
 */

interface Layer {
  el: HTMLElement;
  depth: number;
}

export function initHeroPointerField(root: HTMLElement): () => void {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const layers: Layer[] = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]')).map(
    (el) => ({ el, depth: Number(el.dataset.parallax) || 0.2 }),
  );
  if (layers.length === 0) return () => {};

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const loop = createLoop(() => {
    currentX = lerp(currentX, targetX, 0.08);
    currentY = lerp(currentY, targetY, 0.08);

    for (const { el, depth } of layers) {
      el.style.transform = `translate3d(${(currentX * depth).toFixed(2)}px, ${(
        currentY * depth
      ).toFixed(2)}px, 0)`;
    }

    // Settled — stop burning frames until the pointer moves again.
    const settled = Math.abs(currentX - targetX) < 0.05 && Math.abs(currentY - targetY) < 0.05;
    return !settled;
  });

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    // Normalised to a fixed maximum travel rather than to viewport size, so
    // the effect does not get more dramatic on a bigger monitor.
    targetX = ((event.clientX / window.innerWidth) * 2 - 1) * 22;
    targetY = ((event.clientY / window.innerHeight) * 2 - 1) * 14;
    loop.start();
  };

  const onLeave = () => {
    targetX = 0;
    targetY = 0;
    loop.start();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onLeave);
    loop.destroy();
    layers.forEach(({ el }) => (el.style.transform = ''));
  };
}
