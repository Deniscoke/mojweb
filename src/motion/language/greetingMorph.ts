import { prefersReducedMotion } from '../utils/env';

/**
 * LANGUAGE MORPH — signature moment 1 of 2
 * ========================================
 * HELLO → AHOJ → HOLA → ZDRAVO → MERHABA, then the chooser.
 *
 * Every greeting is rendered server-side, absolutely positioned in the same
 * box, and only ever animated with transform/opacity/filter. Nothing here
 * changes layout, so however different the word widths are, the morph never
 * reflows the page — which is also why it stays smooth on a cheap phone.
 *
 * THREE TIERS (adapted from motion reference 04 — the principle, not the code)
 *
 *   reduced   — no morph. Jump to the final state, show the chooser.
 *   baseline  — per-glyph displacement and blur. Works everywhere.
 *   enhanced  — the same displacement under an SVG alpha-threshold filter,
 *               so blurred glyphs fuse and separate like liquid instead of
 *               cross-fading.
 *
 * The threshold filter is attached only for the ~400 ms of each morph and
 * removed during the holds. That keeps the letterforms clean while a word is
 * being read, and it bounds the cost of the most expensive effect on the
 * first screen to the moments it is actually doing something.
 */

export interface MorphOptions {
  /** How long each greeting stays legible before the next one starts. */
  holdMs?: number;
  /** Cross-fade duration between two greetings. */
  morphMs?: number;
  /** Per-glyph stagger. */
  stepMs?: number;
}

export interface MorphController {
  play(): Promise<void>;
  /** Jump straight to the end. Safe to call at any time, including twice. */
  skip(): void;
  destroy(): void;
  /** Which tier actually ran. Useful for reporting and for tests. */
  readonly tier: 'reduced' | 'baseline' | 'enhanced';
}

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN = 'cubic-bezier(0.5, 0, 0.75, 0)';

/**
 * The enhanced tier needs SVG filter support in CSS and a device with enough
 * headroom to composite a filtered, full-width text layer at 60fps. Both
 * checks are cheap and both fail safely into the baseline morph.
 */
export function supportsGooeyMorph(): boolean {
  if (prefersReducedMotion()) return false;
  if (typeof CSS === 'undefined' || !CSS.supports?.('filter', 'url(#x)')) return false;
  const cores = navigator.hardwareConcurrency;
  return cores === undefined || cores >= 4;
}

export function createGreetingMorph(root: HTMLElement, options: MorphOptions = {}): MorphController {
  const { holdMs = 460, morphMs = 420, stepMs = 24 } = options;

  const words = Array.from(root.querySelectorAll<HTMLElement>('[data-word]'));
  const live = new Set<Animation>();
  const gooey = supportsGooeyMorph();
  const tier: MorphController['tier'] = prefersReducedMotion()
    ? 'reduced'
    : gooey
      ? 'enhanced'
      : 'baseline';

  // Under the threshold filter the glyphs must blur enough to actually touch,
  // otherwise the effect is just a blurry cross-fade.
  const blurPx = gooey ? 11 : 5;
  const shift = gooey ? '0.16em' : '0.5em';

  let skipped = false;
  let resolveSkip: (() => void) | null = null;

  const glyphsOf = (word: HTMLElement) =>
    Array.from(word.querySelectorAll<HTMLElement>('[data-glyph]'));

  function track(anim: Animation) {
    live.add(anim);
    anim.finished.catch(() => {}).finally(() => live.delete(anim));
    return anim;
  }

  function setActive(index: number) {
    words.forEach((word, i) => {
      word.toggleAttribute('data-active', i === index);
      word.style.opacity = i === index ? '1' : '0';
    });
  }

  function animateOut(word: HTMLElement) {
    return glyphsOf(word).map((glyph, i) =>
      track(
        glyph.animate(
          [
            { transform: 'translate3d(0,0,0)', opacity: 1, filter: 'blur(0px)' },
            { transform: `translate3d(0,-${shift},0)`, opacity: 0, filter: `blur(${blurPx}px)` },
          ],
          { duration: morphMs, delay: i * stepMs, easing: EASE_IN, fill: 'forwards' },
        ),
      ),
    );
  }

  function animateIn(word: HTMLElement) {
    return glyphsOf(word).map((glyph, i) =>
      track(
        glyph.animate(
          [
            { transform: `translate3d(0,${shift},0)`, opacity: 0, filter: `blur(${blurPx}px)` },
            { transform: 'translate3d(0,0,0)', opacity: 1, filter: 'blur(0px)' },
          ],
          {
            duration: morphMs,
            // Trails the outgoing word by two glyphs so the two words overlap
            // rather than swap — that overlap is the whole effect.
            delay: i * stepMs + stepMs * 2,
            easing: EASE_OUT,
            fill: 'both',
          },
        ),
      ),
    );
  }

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      if (skipped) return resolve();
      const id = window.setTimeout(resolve, ms);
      const prev = resolveSkip;
      resolveSkip = () => {
        window.clearTimeout(id);
        prev?.();
        resolve();
      };
    });

  async function play(): Promise<void> {
    if (words.length === 0) return;

    // Reduced motion gets the destination, not a slower version of the trip.
    if (prefersReducedMotion()) {
      skip();
      return;
    }

    root.dataset.morphTier = tier;
    setActive(0);

    for (let i = 0; i < words.length - 1; i += 1) {
      if (skipped) break;
      await wait(holdMs);
      if (skipped) break;

      const current = words[i]!;
      const next = words[i + 1]!;
      next.style.opacity = '1';
      next.toggleAttribute('data-active', true);

      if (gooey) root.classList.add('is-gooey');

      const animations = [...animateOut(current), ...animateIn(next)];

      /**
       * Raced against a wall clock, never awaited outright.
       *
       * `Animation.finished` stalls whenever the document timeline is frozen
       * (backgrounded tab, occluded window, some embedded webviews). Awaiting
       * it alone means a visitor who tabs away during the intro comes back to
       * a gate that never revealed its language chooser.
       */
      const longestDelay = Math.max(glyphsOf(current).length, glyphsOf(next).length) * stepMs;
      await Promise.race([
        Promise.all(animations.map((a) => a.finished.catch(() => {}))),
        new Promise((resolve) => window.setTimeout(resolve, morphMs + longestDelay + 120)),
      ]);

      // Clean letterforms while the word is being read.
      root.classList.remove('is-gooey');

      if (skipped) break;
      current.style.opacity = '0';
      current.removeAttribute('data-active');
    }

    if (!skipped) {
      setActive(words.length - 1);
      await wait(holdMs);
    }
    finish();
  }

  function finish() {
    root.classList.remove('is-gooey');
    root.setAttribute('data-morph-state', 'done');
    root.dispatchEvent(new CustomEvent('morph:done', { bubbles: true }));
  }

  function skip() {
    if (skipped) return;
    skipped = true;
    live.forEach((anim) => {
      try {
        anim.finish();
      } catch {
        anim.cancel();
      }
    });
    live.clear();
    resolveSkip?.();
    resolveSkip = null;
    setActive(words.length - 1);
    finish();
  }

  function destroy() {
    live.forEach((anim) => anim.cancel());
    live.clear();
    resolveSkip = null;
    root.classList.remove('is-gooey');
  }

  return { play, skip, destroy, tier };
}
