/**
 * Shared choreography for the transition panels.
 *
 * Both halves of the language transition drive the same six elements, so the
 * ordering lives in one place. Panels closest to the centre move first, which
 * makes the sweep read as opening from the middle rather than sliding in from
 * an edge.
 */

export const PANEL_STEP_MS = 55;

/** Delay for each panel, ordered centre-outwards. */
export function panelDelays(count: number, step = PANEL_STEP_MS): number[] {
  const centre = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => Math.round(Math.abs(i - centre) * step));
}

export function panelsOf(cover: HTMLElement): HTMLElement[] {
  return Array.from(cover.querySelectorAll<HTMLElement>('.transition-cover__panel'));
}

/** Longest delay plus the animation itself — how long the sweep really takes. */
export function panelDuration(count: number, duration: number, step = PANEL_STEP_MS): number {
  return duration + Math.max(...panelDelays(count, step));
}
