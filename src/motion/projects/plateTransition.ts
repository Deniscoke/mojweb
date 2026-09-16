import { prefetch } from 'astro:prefetch';
import { clearEnterIntent, setEnterIntent } from '~/i18n/memory';
import { prefersReducedMotion } from '../utils/env';

/**
 * PROJECT PLATE TRANSITION — Selected Work → project page
 * =======================================================
 * Clicking a project grows its generated plate from wherever it is on screen
 * (the cursor preview on desktop, the inline card plate on touch, the anchored
 * plate for keyboard focus) to the full viewport, like a loading screen. While
 * it grows, the plate comes apart in its own language — what it draws decides
 * how it leaves:
 *
 *   grid   → the cells become 3D cubes and tumble out in a ripple from the centre
 *   strata → the bars stretch across the screen like loading bars and run out
 *   flux   → the curves run off along their own paths; the origin point flares
 *   orbit  → the rings spin outward; the core floods the screen with the accent
 *   scan   → a scanner line sweeps down and the scan lines fall away behind it
 *
 * It settles on the void with the project title and hands over through the
 * same enter intent the language gate uses, so the project page opens with
 * the panel reveal: one continuous gesture across a real document navigation.
 *
 * Rules kept from the rest of the motion system:
 * - Progressive: without JS, or with reduced motion, the row is a plain link.
 * - Never trap: a second click, Escape, Enter or Space navigates at once, and
 *   navigation runs on a timer, never on Animation.finished (frozen timelines).
 * - Modifier and middle clicks keep their browser meaning (new tab etc.).
 * - Motion stays on transform, opacity, clip-path and stroke-dashoffset; the
 *   one exception is stroke-width on nine flux curves.
 */

type Visual = 'strata' | 'orbit' | 'grid' | 'scan' | 'flux';

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN = 'cubic-bezier(0.5, 0, 0.75, 0)';
const EASE_IN_OUT = 'cubic-bezier(0.76, 0, 0.24, 1)';

const EXPAND_MS = 640;
/** The plate starts coming apart while it is still growing. */
const BURST_AT = 280;
const VEIL_AT = 980;
const NAVIGATE_AT = 1400;

/** Plate viewBox — see ProjectVisual.astro. */
const VB_W = 320;
const VB_H = 220;
const SVG_NS = 'http://www.w3.org/2000/svg';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The 320:220 box that covers `target`, centred on it (what `slice` renders). */
function coverBox(target: Box): Box {
  const ratio = VB_W / VB_H;
  const width = target.width / target.height > ratio ? target.width : target.height * ratio;
  const height = width / ratio;
  return {
    left: target.left + (target.width - width) / 2,
    top: target.top + (target.height - height) / 2,
    width,
    height,
  };
}

function num(el: Element, name: string): number {
  return Number.parseFloat(el.getAttribute(name) ?? '0') || 0;
}

/** Accent shapes are the only ones not painted in the bone tints. */
function isAccent(color: string | null): boolean {
  return !!color && !color.startsWith('rgba') && !color.startsWith('var(');
}

// ------------------------------------------------------------------ bursts

/** Loading bars: each stretches past the right edge, then runs out. */
function burstStrata(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGRectElement>('rect[data-fade-in]').forEach((bar, i) => {
    const x = num(bar, 'x');
    const w = Math.max(num(bar, 'width'), 1);
    const reach = (VB_W + 16 - x) / w;
    bar.style.transformBox = 'fill-box';
    bar.style.transformOrigin = '0% 50%';
    bar.animate(
      [
        { transform: 'translateX(0px) scaleX(1)', easing: EASE_OUT },
        { transform: `translateX(0px) scaleX(${reach})`, offset: 0.45, easing: EASE_IN },
        { transform: `translateX(${VB_W - x + 24}px) scaleX(${reach})` },
      ],
      { duration: 900, delay: BURST_AT + i * 36, fill: 'forwards' },
    );
  });
}

/**
 * Cubes: the grid cells are rebuilt as HTML boxes with a top face and a side
 * face extruded backwards, so the front face sits exactly where the flat cell
 * was. Lit cells tumble out as cubes; the faint background cells just drop.
 */
function burstGrid(svg: SVGSVGElement, stage: HTMLElement, stageWidth: number) {
  const layer = document.createElement('div');
  layer.className = 'pt__cubes';
  stage.append(layer);

  const cx = VB_W / 2;
  const cy = VB_H / 2;
  const maxDist = Math.hypot(cx, cy);
  const unit = stageWidth / VB_W;

  svg.querySelectorAll<SVGRectElement>('rect[data-fade-in]').forEach((cell) => {
    const x = num(cell, 'x');
    const y = num(cell, 'y');
    const w = num(cell, 'width');
    const h = num(cell, 'height');
    const fill = cell.getAttribute('fill') ?? 'transparent';
    const lit = !fill.includes('0.09');

    const dx = (x + w / 2 - cx) / maxDist;
    const dy = (y + h / 2 - cy) / maxDist;
    const dist = Math.hypot(dx, dy);
    const side = dx >= 0 ? 1 : -1;

    const cube = document.createElement('span');
    cube.className = 'pt__cube';
    cube.style.left = `${(x / VB_W) * 100}%`;
    cube.style.top = `${(y / VB_H) * 100}%`;
    cube.style.width = `${(w / VB_W) * 100}%`;
    cube.style.height = `${(h / VB_H) * 100}%`;
    cube.style.setProperty('--cube', fill);
    cube.style.setProperty('--depth', `${w * unit}px`);
    if (lit) cube.dataset.lit = '';
    if (isAccent(fill)) cube.dataset.accent = '';
    // The side face that turns towards the viewer is the one facing the centre.
    cube.dataset.side = side > 0 ? 'left' : 'right';
    layer.append(cube);
    cell.style.opacity = '0';

    const delay = BURST_AT + dist * 300;
    if (!lit) {
      cube.animate(
        [
          { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
          { transform: `translate3d(0, ${6 + dy * 10}vmax, -120px) scale(0.6)`, opacity: 0 },
        ],
        { duration: 620, delay, easing: EASE_IN, fill: 'forwards' },
      );
      return;
    }

    // Transform only: an opacity keyframe here would flatten the cube (see
    // .pt__cube[data-lit] in motion.css). They leave by flying off screen,
    // and the veil is over them by the time it matters.
    cube.animate(
      [
        { transform: 'translate3d(0,0,0) rotateX(0deg) rotateY(0deg)', easing: EASE_OUT },
        {
          transform: `translate3d(0,0,80px) rotateX(-42deg) rotateY(${side * 38}deg)`,
          offset: 0.32,
          easing: EASE_IN,
        },
        {
          transform: `translate3d(${dx * 70}vmax, ${dy * 70 + 14}vmax, 320px) rotateX(-150deg) rotateY(${side * 120}deg)`,
        },
      ],
      { duration: 760, delay, fill: 'forwards' },
    );
  });
}

/** Flow lines: the curves run off along themselves; the origin flares. */
function burstFlux(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGPathElement>('path[data-draw]').forEach((line, i) => {
    const sw = num(line, 'stroke-width') || 1.2;
    line.animate(
      [
        { strokeDashoffset: 0, strokeWidth: `${sw}px` },
        { strokeDashoffset: -1, strokeWidth: `${sw * 2.4}px` },
      ],
      { duration: 780, delay: BURST_AT + i * 55, easing: EASE_IN, fill: 'forwards' },
    );
  });

  // The origin point sends out a shockwave: hairline rings that grow by radius,
  // not by transform. Chrome composites SVG transform animations as a bitmap
  // rasterised at the start size, so a scaled-up dot turns into a blurred
  // disc; animating `r` repaints a crisp line on every frame for one element.
  svg.querySelectorAll<SVGCircleElement>('circle').forEach((origin) => {
    const color = origin.getAttribute('fill') ?? 'currentColor';
    [0, 140].forEach((lag) => {
      const ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('cx', origin.getAttribute('cx') ?? '0');
      ring.setAttribute('cy', origin.getAttribute('cy') ?? '0');
      ring.setAttribute('r', '4');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', color);
      ring.setAttribute('stroke-width', '0.8');
      svg.append(ring);
      ring.animate(
        [
          { r: '4px', opacity: 1 },
          { r: `${VB_W * 1.1}px`, opacity: 0 },
        ] as Keyframe[],
        { duration: 820, delay: BURST_AT + 100 + lag, easing: EASE_OUT, fill: 'forwards' },
      );
    });
    origin.style.transformBox = 'fill-box';
    origin.style.transformOrigin = '50% 50%';
    origin.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(2.2)', opacity: 1, offset: 0.3 },
        { transform: 'scale(0)', opacity: 0 },
      ],
      { duration: 520, delay: BURST_AT + 60, easing: EASE_IN_OUT, fill: 'forwards' },
    );
  });

  svg.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }], {
    duration: 1000,
    delay: BURST_AT,
    easing: EASE_IN_OUT,
    fill: 'forwards',
  });
}

/** Rings: spin outward and thin out; the core floods the screen. */
function burstOrbit(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGEllipseElement>('ellipse').forEach((ring, i) => {
    // Each ring carries its own SVG `transform="rotate(...)"`. A CSS transform
    // would replace it, so the ring is wrapped and the wrapper moves instead.
    const wrap = document.createElementNS(SVG_NS, 'g');
    ring.replaceWith(wrap);
    wrap.append(ring);
    wrap.style.transformBox = 'view-box';
    wrap.style.transformOrigin = `${VB_W / 2}px ${VB_H / 2}px`;
    wrap.animate(
      [
        { transform: 'rotate(0deg) scale(1)', opacity: 1 },
        { transform: `rotate(${60 + i * 24}deg) scale(${2.8 + i * 0.7})`, opacity: 0 },
      ],
      { duration: 940, delay: BURST_AT + i * 70, easing: EASE_OUT, fill: 'forwards' },
    );
  });

  svg.querySelectorAll<SVGCircleElement>('circle').forEach((core) => {
    core.style.transformBox = 'fill-box';
    core.style.transformOrigin = '50% 50%';
    core.animate(
      [
        { transform: 'scale(1)', opacity: 1, easing: EASE_OUT },
        { transform: 'scale(4)', opacity: 1, offset: 0.25, easing: EASE_IN },
        // Floods as a tint, not a white-hot flash across the whole screen.
        { transform: 'scale(72)', opacity: 0.42, offset: 0.7 },
        { transform: 'scale(72)', opacity: 0 },
      ],
      { duration: 860, delay: BURST_AT + 100, fill: 'forwards' },
    );
  });
}

/** Scanner: an accent line sweeps down; the scan lines fall away behind it. */
function burstScan(svg: SVGSVGElement) {
  const lines = Array.from(svg.querySelectorAll<SVGPathElement>('path[data-draw]'));
  const accent = lines.map((l) => l.getAttribute('stroke')).find(isAccent) ?? 'currentColor';

  const scanner = document.createElementNS(SVG_NS, 'rect');
  scanner.setAttribute('x', '0');
  scanner.setAttribute('y', '0');
  scanner.setAttribute('width', String(VB_W));
  scanner.setAttribute('height', '1.4');
  scanner.setAttribute('fill', accent);
  svg.append(scanner);
  scanner.animate([{ transform: 'translateY(-4px)' }, { transform: `translateY(${VB_H + 4}px)` }], {
    duration: 720,
    delay: BURST_AT,
    easing: EASE_IN_OUT,
    fill: 'forwards',
  });

  lines.forEach((line, i) => {
    const y = 20 + i * 8.5;
    // Each line lets go as the scanner passes it.
    const passes = BURST_AT + 720 * (y / VB_H) * 0.85;
    line.animate(
      [
        { transform: 'translateY(0px)', strokeDashoffset: 0, opacity: 1 },
        { transform: `translateY(${VB_H - y + 12}px)`, strokeDashoffset: -1, opacity: 0 },
      ],
      { duration: 560, delay: passes, easing: EASE_IN, fill: 'forwards' },
    );
  });
}

// --------------------------------------------------------------- transition

interface Run {
  overlay: HTMLElement;
  href: string;
  lang: string;
  title: string;
  timers: number[];
  navigating: boolean;
}

/** How long the overlay may wait for a navigation that may never commit. */
const ABANDON_MS = 6000;

let current: Run | null = null;

function cleanup() {
  if (!current) return;
  current.timers.forEach((id) => window.clearTimeout(id));
  current.overlay.getAnimations({ subtree: true }).forEach((anim) => anim.cancel());
  current.overlay.remove();
  document.documentElement.removeAttribute('data-plate-transition');
  // The intent was a promise about a page this visitor is no longer going to;
  // left behind, it would paint the next page they open with the wrong title.
  clearEnterIntent();
  current = null;
}

function go(run: Run) {
  // location.assign is not a point of no return: the visitor can press Stop,
  // the server can hang, the request can fail. So this is written to be
  // survivable — it runs once, and if the page is still here afterwards the
  // overlay takes itself away instead of sitting on top of a working page.
  if (run.navigating) return;
  run.navigating = true;
  run.timers.forEach((id) => window.clearTimeout(id));
  run.timers = [];

  /**
   * The intent is written here, one step before the navigation, rather than
   * when the animation starts. Between the click and this moment the visitor
   * may have reloaded or gone back, and an intent written early would have
   * been picked up by whatever page loaded next.
   */
  setEnterIntent({
    code: run.lang,
    label: run.title,
    kind: 'project',
    path: new URL(run.href, window.location.href).pathname,
  });

  run.timers.push(window.setTimeout(cleanup, ABANDON_MS));
  window.location.assign(run.href);
}

/** Where the plate is on screen right now, whichever layout is showing it. */
function sourceBox(row: HTMLElement): Box {
  const plate = row.querySelector<HTMLElement>('.project__plate');
  if (plate) {
    const rect = plate.getBoundingClientRect();
    const shown = Number.parseFloat(getComputedStyle(plate).opacity) > 0.05;
    if (shown && rect.width > 8 && rect.height > 8) {
      return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    }
  }
  // No visible plate (the hover preview had already faded): grow from the
  // right end of the row, where the anchored plate would sit.
  const r = row.getBoundingClientRect();
  const height = Math.min(r.height * 0.8, 176);
  const width = height * (VB_W / VB_H);
  return { left: r.right - width, top: r.top + (r.height - height) / 2, width, height };
}

function play(row: HTMLElement, link: HTMLAnchorElement): Run | null {
  const original = row.querySelector<SVGSVGElement>('svg[data-visual]');
  if (!original) return null;

  const visual = (original.dataset.visual ?? 'flux') as Visual;
  const title = row.dataset.title ?? link.textContent?.trim() ?? '';
  const lang = document.body.dataset.lang ?? 'en';

  // Measured before the overlay hides the plate it grows from.
  const from = sourceBox(row);
  const fromCover = coverBox(from);

  // ---- build the overlay
  const overlay = document.createElement('div');
  overlay.className = 'pt is-drawn';
  overlay.dataset.visual = visual;
  // Same layout mode the destination will paint: title, then a short accent
  // mark under it — never a rule through the middle of the words.
  overlay.dataset.kind = 'project';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.append(overlay);
  document.documentElement.setAttribute('data-plate-transition', '');

  /**
   * The viewport, as this overlay actually sees it.
   *
   * `.pt` is 100vw wide, which includes the classic scrollbar — and so is the
   * destination's cover, because the page it belongs to has its scrollbar
   * suppressed while the cover is up. Measuring with anything narrower (the
   * scrolled homepage's fixed-position box) would centre the title half a
   * scrollbar to the left of where the next page paints it, and the title
   * would jump sideways at the hand-over.
   */
  const box = overlay.getBoundingClientRect();
  const vw = box.width;
  const vh = box.height;
  const toCover = coverBox({ left: 0, top: 0, width: vw, height: vh });

  const clip = document.createElement('div');
  clip.className = 'pt__clip';

  const stage = document.createElement('div');
  stage.className = 'pt__stage';
  stage.style.left = `${toCover.left}px`;
  stage.style.top = `${toCover.top}px`;
  stage.style.width = `${toCover.width}px`;
  stage.style.height = `${toCover.height}px`;

  const svg = original.cloneNode(true) as SVGSVGElement;
  svg.setAttribute('class', 'pt__svg');
  stage.append(svg);
  clip.append(stage);

  const veil = document.createElement('div');
  veil.className = 'pt__veil';

  const rule = document.createElement('span');
  rule.className = 'pt__rule';

  const label = document.createElement('p');
  label.className = 'pt__label';
  label.textContent = title;
  label.style.setProperty('--label-len', String(title.length));

  overlay.append(clip, veil, rule, label);
  // The page under the overlay must not scroll away mid-transition. The
  // non-passive listeners live on the overlay, which only exists for these
  // 1.4s, so normal scrolling on the page never waits on the main thread.
  const hold = (event: Event) => event.preventDefault();
  overlay.addEventListener('wheel', hold, { passive: false });
  overlay.addEventListener('touchmove', hold, { passive: false });

  // Published before the animations are built: if one of them throws, the
  // caller's cleanup still knows about the overlay it has to take away.
  const run: Run = { overlay, href: link.href, lang, title, timers: [], navigating: false };
  current = run;

  // Impatience is answered on the overlay itself, not through a delegated
  // document listener: iOS Safari only synthesises a click for a tap on a
  // node it considers interactive, and a bare div with `cursor: progress`
  // is not one — the second tap would be swallowed.
  overlay.addEventListener('click', () => go(run));

  // ---- 1. expand: the stage flies from the source plate to cover the screen
  // while the clip opens from the plate's visible rectangle to the viewport.
  const scale = fromCover.width / toCover.width;
  stage.animate(
    [
      { transform: `translate(${fromCover.left - toCover.left}px, ${fromCover.top - toCover.top}px) scale(${scale})` },
      { transform: 'translate(0px, 0px) scale(1)' },
    ],
    { duration: EXPAND_MS, easing: EASE_IN_OUT, fill: 'forwards' },
  );
  clip.animate(
    [
      { clipPath: `inset(${from.top}px ${vw - from.left - from.width}px ${vh - from.top - from.height}px ${from.left}px)` },
      { clipPath: 'inset(0px 0px 0px 0px)' },
    ],
    { duration: EXPAND_MS, easing: EASE_IN_OUT, fill: 'forwards' },
  );

  // ---- 2. the plate comes apart in its own language
  if (visual === 'grid') burstGrid(svg, stage, toCover.width);
  else if (visual === 'strata') burstStrata(svg);
  else if (visual === 'orbit') burstOrbit(svg);
  else if (visual === 'scan') burstScan(svg);
  else burstFlux(svg);

  // ---- 3. settle on the void and name the destination, in exactly the state
  // the project page paints its cover in before its first frame.
  veil.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: NAVIGATE_AT - VEIL_AT - 60,
    delay: VEIL_AT,
    easing: EASE_IN_OUT,
    fill: 'forwards',
  });
  rule.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
    duration: 420,
    delay: VEIL_AT - 40,
    easing: EASE_OUT,
    fill: 'forwards',
  });
  label.animate(
    [
      { opacity: 0, transform: 'translateY(0.2em)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: 340, delay: VEIL_AT + 80, easing: EASE_OUT, fill: 'forwards' },
  );

  // go() writes the enter intent and leaves; the destination picks the
  // transition up from there (src/motion/language/enterReveal.ts).
  run.timers.push(window.setTimeout(() => go(run), NAVIGATE_AT));
  return run;
}

export function initPlateTransition(section: HTMLElement): () => void {
  const rows = Array.from(section.querySelectorAll<HTMLElement>('[data-project-row]'));
  if (rows.length === 0) return () => {};

  const linkOf = (row: HTMLElement) => row.querySelector<HTMLAnchorElement>('.project__link');

  const onClick = (event: MouseEvent) => {
    const row = event.currentTarget as HTMLElement;
    const link = linkOf(row);
    if (!link || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;
    if (prefersReducedMotion()) return;

    event.preventDefault();
    // Already running: a second click is an impatient one. Go now.
    if (current) {
      go(current);
      return;
    }
    prefetch(link.href, { ignoreSlowConnection: true });
    /**
     * The click has already been swallowed by preventDefault, so anything that
     * throws in here would strand the visitor on the page they tried to leave.
     * Whatever the reason — an engine without some part of the Web Animations
     * API, a plate shape this build has never seen — the link still works.
     */
    try {
      current = play(row, link);
    } catch {
      cleanup();
    }
    if (!current) window.location.assign(link.href);
  };

  const onIntent = (event: Event) => {
    const link = linkOf(event.currentTarget as HTMLElement);
    if (link) prefetch(link.href);
  };

  const onKey = (event: KeyboardEvent) => {
    if (!current) return;
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      go(current);
    }
  };

  // Back/forward cache: a restored homepage must not come back mid-transition.
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) cleanup();
  };

  rows.forEach((row) => {
    row.addEventListener('click', onClick);
    row.addEventListener('pointerenter', onIntent, { passive: true });
    row.addEventListener('focusin', onIntent);
  });
  document.addEventListener('keydown', onKey);
  window.addEventListener('pageshow', onPageShow);

  return () => {
    rows.forEach((row) => {
      row.removeEventListener('click', onClick);
      row.removeEventListener('pointerenter', onIntent);
      row.removeEventListener('focusin', onIntent);
    });
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('pageshow', onPageShow);
    cleanup();
  };
}
