import { takeEnterIntent } from '~/i18n/memory';
import { prefersReducedMotion } from '../utils/env';
import { panelDelays, panelsOf } from './panels';

/**
 * LANGUAGE TRANSITION — the destination half
 * ==========================================
 * Runs on every locale page. If the visitor arrived through the gate, the
 * panels are already painted (an inline <head> snippet set `data-entering`
 * before first paint, so there is never a white flash) and this module plays
 * them off. If they arrived by link, bookmark or search engine, it does
 * nothing except announce that the page is ready to reveal itself.
 *
 * Either way it ends by dispatching `irl:revealed`, the single signal every
 * other motion module waits for.
 */

export const REVEAL_EVENT = 'irl:revealed';

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const PANEL_MS = 620;

export function playEnterReveal(cover: HTMLElement | null): void {
  const root = document.documentElement;
  const entering = root.hasAttribute('data-entering');

  const announce = () => {
    root.removeAttribute('data-entering');
    document.dispatchEvent(new CustomEvent(REVEAL_EVENT));
  };

  const settle = () => {
    if (cover) {
      cover.dataset.state = '';
      panelsOf(cover).forEach((p) => (p.style.transform = ''));
    }
  };

  if (!entering || !cover) {
    // Give the browser one frame so first paint is the page, not the reveal.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        announce();
        settle();
      }),
    );
    return;
  }

  const intent = takeEnterIntent();
  const label = cover.querySelector<HTMLElement>('.transition-cover__label');
  const rule = cover.querySelector<HTMLElement>('.transition-cover__rule');
  if (label && intent) label.textContent = intent.label;

  cover.dataset.state = 'out';

  if (prefersReducedMotion()) {
    cover
      .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' })
      .finished.catch(() => {})
      .finally(() => {
        announce();
        settle();
      });
    return;
  }

  label?.animate(
    [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(1.06)' },
    ],
    { duration: 320, easing: 'ease-in', fill: 'forwards' },
  );

  rule?.animate(
    [
      { transform: 'scaleX(1)', transformOrigin: 'right center' },
      { transform: 'scaleX(0)', transformOrigin: 'right center' },
    ],
    { duration: 420, easing: EASE_OUT, fill: 'forwards' },
  );

  /**
   * The panels retract upward, uncovering the page from the top down — the
   * same direction the reader is about to move. The stagger runs
   * centre-outwards to match the way they closed on the gate, so the two
   * halves of the transition read as one gesture.
   */
  const panels = panelsOf(cover);
  const delays = panelDelays(panels.length);
  panels.forEach((panel, i) => {
    panel.animate(
      [
        { transform: 'scaleY(1)', transformOrigin: 'top center' },
        { transform: 'scaleY(0)', transformOrigin: 'top center' },
      ],
      { duration: PANEL_MS, delay: 200 + (delays[i] ?? 0), easing: EASE_OUT, fill: 'forwards' },
    );
  });

  // Content starts revealing while the panels are still moving, and both the
  // announcement and the cleanup run on timers rather than on `finished`,
  // for the frozen-timeline reasons documented in enterTransition.ts.
  window.setTimeout(announce, 380);
  window.setTimeout(settle, 200 + PANEL_MS + Math.max(...delays) + 80);
}
