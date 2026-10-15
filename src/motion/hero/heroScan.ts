import { mount } from '../ambient/mount';

/**
 * HERO SCAN — the real place, standing on the grid
 * ================================================
 * Denis's own point-cloud capture (src/data/scans.ts) stands in the empty
 * right side of the hero on desktop, and in the stage band under the readout
 * on a phone. It is the one 3D object on the homepage, and it is evidence,
 * not decoration: the caption under it links to the lab note it came from.
 *
 * This module only wires the hero to the engine. Everything about WHEN the
 * scan may run (reveal, load, idle, on screen, a GPU that can afford it,
 * the context budget, calm) is decided by ../ambient/mount, and everything
 * about HOW it moves is the engine's built-in inputs:
 *
 *   - scroll: one passive listener while the hero is on screen; as the hero
 *     leaves, the turntable turns 0 → 24° (30° on touch) and, with a fine
 *     pointer, dollies in up to 8%. Applied directly, so it keeps step with
 *     the CSS floor lying down underneath it.
 *   - pointer: a real mouse looks around it, ±6° yaw and ±3° pitch, the same
 *     sign as the [data-parallax] layers. Never on touch.
 *
 * It is loaded with a dynamic import() once the hero has revealed itself, so
 * neither this file nor the scheduler is on the homepage's initial path. The
 * scheduler is therefore imported after REVEAL_EVENT has fired, and must
 * take an uncovered page as a revealed one; it then still waits for `load`,
 * an idle moment and the host on screen before the engine chunk is fetched.
 *
 * The caption ships `hidden`. It is shown only once a frame is on screen,
 * live or (calm) still, and hidden again if the scan fails, so a caption
 * never describes nothing.
 */

export function initHeroScan(hero: HTMLElement): () => void {
  const host = hero.querySelector<HTMLElement>('.hero__scan');
  const caption = hero.querySelector<HTMLElement>('.hero__scan-cap');
  const { desktop, mobile } = host?.dataset ?? {};
  if (!host || !desktop || !mobile) return () => {};

  const show = (on: boolean) => {
    if (caption) caption.hidden = !on;
  };

  const scan = mount(host, {
    src: { desktop, mobile },
    mode: 'hero',
    sweep: true,
    // Statement, aside and cue: the points behind them keep 20% of their
    // alpha. The rects are hero-relative and the canvas scrolls with the
    // hero, so a mask can never swim away from its text during a fling.
    masks: [...hero.querySelectorAll('[data-scan-mask]')],
    inputs: { pointer: true, scroll: hero },
    // Where it stands is the grid's decision, in Hero.astro's CSS.
    anchor: host.querySelector('.hero__scan-anchor') ?? undefined,
    onReady: () => show(true),
    onFail: () => show(false),
  });

  return () => {
    scan.teardown();
    show(false);
  };
}
