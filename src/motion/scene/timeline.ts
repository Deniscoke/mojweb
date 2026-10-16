/**
 * The scene's choreography: which shape is on screen for a scroll position.
 *
 * Every `[data-scene]` section is an anchor at the scroll position where its
 * centre meets the viewport's centre. Around an anchor the shape holds;
 * between two anchors the points travel from one to the next. Pure and
 * import-free, so `npm run test:unit` runs it without a DOM.
 */

/** `full`: spread over the whole screen, dimmed (the drifting field between shapes). */
export type Side = 'left' | 'right' | 'center' | 'full';

/** A `[data-scene]` element measured in document pixels. */
export interface SceneEntry {
  id: string;
  top: number;
  height: number;
  side: Side;
}

/** `at`: the scrollY at which the section is centred; the shape holds for ±`hold` around it. */
export interface Anchor {
  id: string;
  at: number;
  hold: number;
  side: Side;
}

/** Points travelling from shape `from` to shape `to`, `t` of the way. */
export interface Pose {
  from: string;
  to: string;
  t: number;
  side: Side;
}

export interface Layout {
  /** Horizontal centre in clip space (-1 … 1). */
  cx: number;
  /** Shape size as a fraction of the viewport height. */
  scale: number;
  /** How much to fade the points so text over them stays readable (0 … 1). */
  dim: number;
}

/** Below this width the text runs full width, so shapes sit behind it, dimmed. */
const NARROW_PX = 992;

export function computeAnchors(entries: SceneEntry[], viewportH: number): Anchor[] {
  const anchors: Anchor[] = [];
  let first = 0;
  let last = 0;
  for (const e of entries) {
    const at = e.top + e.height / 2 - viewportH / 2;
    const hold = Math.min(0.25 * e.height, 0.3 * viewportH);
    const prev = anchors[anchors.length - 1];
    if (prev && prev.id === e.id) {
      // A run of sections with one shape is one long hold, centred on the run.
      last = at;
      prev.at = (first + last) / 2;
      prev.hold = (last - first) / 2 + hold;
      continue;
    }
    first = last = at;
    anchors.push({ id: e.id, at, hold, side: e.side });
  }
  return anchors;
}

export function resolve(anchors: Anchor[], scrollY: number): Pose {
  const still = (a: Anchor): Pose => ({ from: a.id, to: a.id, t: 0, side: a.side });
  if (anchors.length === 0) return { from: 'drift', to: 'drift', t: 0, side: 'center' };
  if (scrollY <= anchors[0].at + anchors[0].hold) return still(anchors[0]);
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const start = a.at + a.hold;
    const end = b.at - b.hold;
    if (scrollY >= b.at - b.hold && scrollY <= b.at + b.hold) return still(b);
    if (scrollY > start && scrollY < end) {
      const t = (scrollY - start) / (end - start);
      return { from: a.id, to: b.id, t, side: t >= 0.5 ? b.side : a.side };
    }
  }
  return still(anchors[anchors.length - 1]);
}

/**
 * The renderer shows `shown` and the scroll now asks for `target`. A step to
 * the neighbouring pair carries on as is. Anything further (an anchor link,
 * a jump back in history) flies straight from what is on screen to where
 * the page is, skipping the shapes in between.
 */
export function retarget(shown: Pose, target: Pose): Pose {
  const adjacent =
    (shown.from === target.from && shown.to === target.to) ||
    shown.to === target.from ||
    shown.from === target.to;
  if (adjacent) return target;
  return {
    from: shown.t >= 0.5 ? shown.to : shown.from,
    to: target.t >= 0.5 ? target.to : target.from,
    t: 0,
    side: target.side,
  };
}

export function layoutFor(side: Side, viewportW: number): Layout {
  if (side === 'full') return { cx: 0, scale: 1, dim: 0.6 };
  if (viewportW < NARROW_PX) return { cx: 0, scale: 0.9, dim: 0.35 };
  if (side === 'center') return { cx: 0, scale: 0.6, dim: 0.35 };
  return { cx: side === 'left' ? -0.5 : 0.5, scale: 0.45, dim: 0 };
}
