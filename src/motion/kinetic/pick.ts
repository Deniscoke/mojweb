/**
 * The kinetic layer's two decisions, pure so `npm run test:unit` can hold
 * them: what the visitor has already seen (never hidden, never replayed),
 * and how many gathers may run at once.
 */

/**
 * Seen = its top has already reached the screen (on it now, or scrolled
 * past). Rects are viewport-relative, as getBoundingClientRect gives them.
 */
export function seen(rects: { top: number; bottom: number }[], viewportH: number): boolean[] {
  return rects.map((r) => r.top < viewportH);
}

/**
 * One gather at a time. A fast scroll that brings several headings in at
 * once plays the first and shows the rest as they are: a page full of
 * flying letters is noise, not motion.
 */
export function createGate(): { tryStart(): boolean; end(): void } {
  let busy = false;
  return {
    tryStart() {
      if (busy) return false;
      busy = true;
      return true;
    },
    end() {
      busy = false;
    },
  };
}
