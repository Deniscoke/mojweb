import { prefersReducedMotion, whenVisible } from './utils/env';

/**
 * LEVEL 3 — scroll reveal
 * =======================
 * The cheapest possible implementation on purpose: one IntersectionObserver
 * per element, disconnected the moment it fires. No scroll listener, no rAF,
 * no layout reads. A page full of reveals costs nothing once they have played.
 *
 * The hidden state lives in CSS behind `html.js`, so this module failing to
 * load degrades to "everything is visible", never to a blank page.
 */

const SELECTOR = '[data-reveal], [data-reveal-lines]';

export function initScrollReveal(scope: ParentNode = document): void {
  const items = Array.from(scope.querySelectorAll<HTMLElement>(SELECTOR));
  if (items.length === 0) return;

  /**
   * Elements marked `data-draw-group` also start the SVG line-drawing motif
   * when they arrive. Keeping that here rather than in a second observer
   * means one IntersectionObserver per element, not two.
   */
  const show = (el: HTMLElement) => {
    el.classList.add('is-revealed');
    if (el.hasAttribute('data-draw-group')) el.classList.add('is-drawn');
  };

  if (prefersReducedMotion()) {
    items.forEach(show);
    return;
  }

  items.forEach((el) => {
    whenVisible(el, () => show(el));
  });
}
