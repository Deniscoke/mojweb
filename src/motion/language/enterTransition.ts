import { rememberLocale, setEnterIntent } from '~/i18n/memory';
import { prefersReducedMotion } from '../utils/env';
import { panelDelays, panelDuration, panelsOf } from './panels';

/**
 * LANGUAGE TRANSITION — the gate half
 * ===================================
 * The brief's hard requirement was: no "click → blank → new page".
 *
 * Four things together buy that:
 *  1. The destination is prefetched on hover/focus, so the document is
 *     usually already in cache when the click lands.
 *  2. The other five languages scatter outward rather than fading — the
 *     chosen one is not merely kept, the rest are actively dismissed.
 *  3. The chosen label flies to the centre of the screen at the exact size
 *     the destination page will paint it.
 *  4. Navigation is deferred until the panels own the viewport, and the
 *     destination re-paints those same panels before its own first paint.
 *
 * The result is one continuous move across a real document navigation — no
 * SPA router, no framework, no client-side routing to maintain.
 */

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const PANEL_MS = 460;

interface Options {
  root: HTMLElement;
  cover: HTMLElement;
}

export function initEnterTransition({ root, cover }: Options): () => void {
  const coverLabel = cover.querySelector<HTMLElement>('.transition-cover__label');
  const coverRule = cover.querySelector<HTMLElement>('.transition-cover__rule');
  let navigating = false;

  async function run(anchor: HTMLAnchorElement) {
    if (navigating) return;
    navigating = true;

    const code = anchor.dataset.langOption ?? '';
    const label = anchor.dataset.langLabel ?? anchor.textContent?.trim() ?? '';

    rememberLocale(code);
    setEnterIntent({ code, label });
    if (coverLabel) coverLabel.textContent = label;

    const go = () => window.location.assign(anchor.href);

    if (prefersReducedMotion()) {
      cover.dataset.state = 'in';
      panelsOf(cover).forEach((p) => (p.style.transform = 'scaleY(1)'));
      cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: 'forwards' });
      window.setTimeout(go, 130);
      return;
    }

    const mark = anchor.querySelector<HTMLElement>('[data-lang-mark]') ?? anchor;
    const rect = mark.getBoundingClientRect();

    // The cover label is styled at --t-gate; measuring it is how the flying
    // label learns the exact scale the next page will render at.
    const targetSize = coverLabel
      ? parseFloat(getComputedStyle(coverLabel).fontSize)
      : rect.height * 3;
    const currentSize = parseFloat(getComputedStyle(mark).fontSize) || rect.height;
    const scale = Math.max(targetSize / currentSize, 1);

    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);

    /**
     * The unchosen languages scatter away from the chosen one. Direction is
     * derived from their actual position relative to it, so the movement
     * always reads as "these are being pushed aside", never as a canned
     * animation played on a list.
     */
    root.querySelectorAll<HTMLElement>('[data-lang-option]').forEach((other) => {
      if (other === anchor) return;
      const r = other.getBoundingClientRect();
      const away = Math.sign(r.left + r.width / 2 - (rect.left + rect.width / 2)) || 1;
      other.animate(
        [
          { opacity: 1, transform: 'translate3d(0,0,0)' },
          { opacity: 0, transform: `translate3d(${away * 5}rem, 1rem, 0)` },
        ],
        { duration: 420, easing: EASE_OUT, fill: 'forwards' },
      );
    });

    root.querySelectorAll<HTMLElement>('[data-transition-fade]').forEach((el, i) => {
      if (el === anchor || el.contains(anchor)) return;
      el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 240,
        delay: i * 16,
        easing: 'ease-in',
        fill: 'forwards',
      });
    });

    mark.style.willChange = 'transform';
    const fly = mark.animate(
      [
        { transform: 'translate3d(0,0,0) scale(1)' },
        { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})` },
      ],
      { duration: 660, delay: 40, easing: EASE_OUT, fill: 'forwards' },
    );

    // Panels close from the centre outwards.
    cover.dataset.state = 'in';
    const panels = panelsOf(cover);
    const delays = panelDelays(panels.length);
    panels.forEach((panel, i) => {
      panel.animate(
        [
          { transform: 'scaleY(0)', transformOrigin: 'bottom center' },
          { transform: 'scaleY(1)', transformOrigin: 'bottom center' },
        ],
        { duration: PANEL_MS, delay: 300 + (delays[i] ?? 0), easing: EASE_OUT, fill: 'forwards' },
      );
    });

    coverRule?.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
      duration: 620,
      delay: 260,
      easing: EASE_OUT,
      fill: 'forwards',
    });

    // The flying label hands over to the cover label mid-sweep. Both sit dead
    // centre at the same size, so the swap is invisible.
    coverLabel?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 220,
      delay: 520,
      easing: 'linear',
      fill: 'forwards',
    });

    /**
     * Never let navigation depend on an animation finishing.
     *
     * `Animation.finished` does not settle while the document timeline is
     * frozen — a backgrounded tab, an occluded window, some embedded
     * webviews. Without this race, a visitor who switches tabs mid-transition
     * comes back to a gate that has swallowed their click. The timer is the
     * contract; the animation is just what happens to be on screen.
     */
    const sweep = 300 + panelDuration(panels.length, PANEL_MS);
    await Promise.race([
      fly.finished.catch(() => {}),
      new Promise((resolve) => window.setTimeout(resolve, sweep)),
    ]);
    window.setTimeout(go, 120);
  }

  const onClick = (event: MouseEvent) => {
    // Let people open a language in a new tab the normal way.
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
      '[data-lang-option]',
    );
    if (!anchor) return;
    event.preventDefault();
    void run(anchor);
  };

  root.addEventListener('click', onClick);

  // Keyboard: anchors already emit a synthetic click on Enter, so the handler
  // above covers keyboard users without a second code path.
  return () => root.removeEventListener('click', onClick);
}
