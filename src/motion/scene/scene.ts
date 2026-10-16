/**
 * THE LIVING SCENE — runtime
 * ==========================
 * One canvas behind the whole homepage, one loop, one scroll source. Every
 * `[data-scene]` section names the shape the points take while it is in the
 * middle of the screen (timeline.ts); this module measures the sections,
 * builds the shapes when the main thread is idle, and drives a painter:
 * the WebGL morph, or the 2D fallback on weak devices, in calm, or when the
 * GPU says no. The choreography runs the same on every tier.
 *
 * Loaded lazily by the depth runtime after the reveal, never before LCP.
 * Contract and rules: ./README.md.
 */
import { createGL, type GL } from '../ambient/gl';
import { canAffordGL, createLoop, fontsReady, hasFinePointer, idle, onMotionPreferenceChange, prefersReducedMotion, renderScale } from '../utils/env';
import { CREDO, QUESTION } from './glyphs.ts';
import { createMorph, type MorphUniforms } from './morph.ts';
import { scatter } from './points.ts';
import { imageShape, pathsShape, rasterize, svgShape, textShape, type Raster } from './shapes.ts';
import { blendLayout, computeAnchors, follow, layoutFor, resolve, type Anchor, type Layout, type Pose, type SceneEntry, type Side } from './timeline.ts';

export type Tier = 'desktop' | 'mobile' | 'static';

/** What draws the points. The WebGL morph and the 2D fallback both are one. */
export interface Painter {
  setShapes(from: Float32Array, to: Float32Array): void;
  draw(u: MorphUniforms): void;
  dispose(): void;
}

const COUNT = { desktop: 16000, mobile: 4000, static: 4000 } as const;
/** Raster detail for text and marks: fewer points need fewer pixels. */
const DETAIL = { desktop: 1, mobile: 0.5, static: 0.5 } as const;
const ARRIVAL_MS = 1800;
const FLIGHT_MS = 900;
const EASE_MS = 120;
const FONT_TIMEOUT_MS = 3000;
const SIDES: readonly Side[] = ['left', 'right', 'center', 'full'];

export function pickTier(): Tier {
  if (prefersReducedMotion() || !canAffordGL()) return 'static';
  return hasFinePointer() ? 'desktop' : 'mobile';
}

export function initScene(): () => void {
  const root = document.documentElement;
  const sections = [...document.querySelectorAll<HTMLElement>('[data-scene]')];
  if (sections.length === 0) return () => {};

  // A loaded embed (a 3D site in an iframe) keeps the GPU: the scene draws in 2D.
  let tier: Tier = document.querySelector('[data-embed][data-loaded]') ? 'static' : pickTier();
  const n = COUNT[tier];
  const fine = tier === 'desktop';
  root.dataset.sceneTier = tier;

  // The canvas style and the grain switch-off arrive with the scene, so no
  // page carries their bytes in its HTML (on the case studies a few dozen
  // bytes cost LCP a round trip). style-src allows inline styles.
  const style = document.createElement('style');
  style.textContent =
    '.scene{position:fixed;inset:0;inline-size:100%;block-size:100%;z-index:-1;pointer-events:none}' +
    'html[data-scene-tier] body::after{content:none}';
  document.head.append(style);

  let canvas = document.createElement('canvas');
  canvas.className = 'scene';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  let disposed = false;

  // ------------------------------------------------------------ shapes
  const fallbackShape = scatter(n, 1);
  const shapes = new Map<string, Float32Array>([['scatter', fallbackShape]]);
  const drift = scatter(n, 2);
  for (let i = 0; i < n; i++) drift[i * 3] *= 2;
  shapes.set('drift', drift);
  let version = 0;
  const put = (id: string, s: Float32Array) => {
    shapes.set(id, s);
    version++;
    loop.start();
  };
  // On a phone the project cards show their own plates; the scene drifts behind them.
  // A project without a plate (a photo or an embed leads its page) drifts.
  const shape = (id: string) =>
    (id.startsWith('work:') && (innerWidth < 992 || !shapes.has(id)) ? drift : shapes.get(id)) ?? fallbackShape;

  const detail = DETAIL[tier];
  const raster: Raster = (draw, w = 512, h = 256) => rasterize(draw, Math.round(w * detail), Math.round(h * detail));

  const cancels: Array<() => void> = [];
  /**
   * One shape per idle slice, never all of them in one task: on a throttled
   * phone a single slice is a few ms, the whole set at once was a long task.
   * Phones skip the project plates (they show the cards' own).
   */
  const queue: Array<() => void> = [
    () => put('credo', pathsShape(Object.values(CREDO), n, 3, raster)),
    () => put('question', pathsShape([QUESTION], n, 4, raster)),
  ];
  let cancelSlice = () => {};
  let slicing = false;
  const nextSlice = () => {
    const job = queue.shift();
    slicing = !!job && !disposed;
    if (!job || !slicing) return;
    cancelSlice = idle(() => {
      job();
      nextSlice();
    });
  };
  const enqueue = (job: () => void) => {
    queue.push(job);
    if (!slicing) nextSlice();
  };
  cancels.push(() => cancelSlice());
  /** Plates are wide-screen shapes: queued the first time the window is wide, at load or later. */
  let platesQueued = false;
  /** Each plate's half-size in shape units: its viewBox, as svgShape normalised it. */
  const plateBox = new Map<string, [number, number]>();
  const queuePlates = () => {
    if (platesQueued || innerWidth < 992) return;
    platesQueued = true;
    sections.forEach((el, i) => {
      const id = el.dataset.scene!;
      // `data-scene-source`: the plate lives in another element (the case
      // study's head draws the plate shown below it).
      const host = el.dataset.sceneSource ? document.querySelector(el.dataset.sceneSource) : el;
      const svg = host?.querySelector<SVGSVGElement>('svg[data-visual]');
      if (!id.startsWith('work:') || !svg) return;
      const box = svg.viewBox.baseVal;
      const long = Math.max(box.width, box.height) || 1;
      plateBox.set(id, [box.width / long, box.height / long]);
      enqueue(() => {
        try {
          put(id, svgShape(svg, n, 10 + i));
        } catch {
          /* An unreadable plate keeps the scatter; the other shapes still build. */
        }
      });
    });
  };
  nextSlice();
  queuePlates();
  // The hero's portrait: Denis, drawn by the points from a density map of
  // his photo (`data-portrait`). If the map cannot load, the points spell
  // the name from the h1 instead.
  const nameShape = () => {
    const h1 = document.querySelector<HTMLElement>('h1');
    if (!h1) return;
    const timeout = new Promise<void>((r) => setTimeout(r, FONT_TIMEOUT_MS));
    Promise.race([fontsReady(), timeout]).then(() => {
      if (disposed) return;
      const words = (h1.textContent ?? '').trim().split(/\s+/).join('\n');
      const font = getComputedStyle(h1);
      put('portrait', textShape(words, `${font.fontWeight} ${Math.round(120 * detail)}px ${font.fontFamily}`, n, 5, raster));
    });
  };
  const portraitUrl = sections.find((el) => el.dataset.scene === 'portrait')?.dataset.portrait;
  if (portraitUrl) {
    const img = new Image();
    img.src = portraitUrl;
    img
      .decode()
      .then(() => !disposed && put('portrait', imageShape(img, img.naturalWidth, img.naturalHeight, n, 5, raster)))
      .catch(nameShape);
  } else nameShape();

  // ------------------------------------------------------------ anchors
  let anchors: Anchor[] = [];
  /** Per-section placement overrides (`data-scene-x`, `data-scene-scale`), wide screens only. */
  const placement = new Map<string, { cx?: number; cy?: number; scale?: number }>();
  const sideOf = new Map<string, Side>();
  const dotOf = new Map<string, number>();
  for (const el of sections) {
    const dot = parseFloat(el.dataset.sceneDot ?? '');
    if (isFinite(dot)) dotOf.set(el.dataset.scene!, dot);
    const cx = parseFloat(el.dataset.sceneX ?? '');
    const sc = parseFloat(el.dataset.sceneScale ?? '');
    const side = el.dataset.sceneSide as Side;
    const cy = parseFloat(el.dataset.sceneY ?? '');
    placement.set(el.dataset.scene!, { ...(isFinite(cx) && { cx }), ...(isFinite(cy) && { cy }), ...(isFinite(sc) && { scale: sc }) });
    if (!sideOf.has(el.dataset.scene!)) sideOf.set(el.dataset.scene!, SIDES.includes(side) ? side : 'center');
  }
  /** Where shape `id` stands on this screen. */
  const layoutOf = (id: string): Layout => {
    // A project that drifts (no plate, or a phone) drifts across the whole
    // screen, not squeezed into the plate's corner.
    if (id.startsWith('work:') && (innerWidth < 992 || !shapes.has(id))) return layoutFor('full', innerWidth);
    const side = sideOf.get(id) ?? 'center';
    const place = side !== 'full' ? placement.get(id) : undefined;
    // Wide screens take the whole placement; phones only its size (the shape
    // stays centred behind the text there, but never larger than asked).
    const l = { ...layoutFor(side, innerWidth), ...(innerWidth >= 992 ? place : place?.scale !== undefined ? { scale: Math.min(place.scale * 1.6, 0.9) } : undefined) };
    // A shape never spills past the screen's sides (the drifting field may).
    if (side !== 'full') l.scale = Math.min(l.scale, (innerWidth / innerHeight) * 0.92);
    const dot = dotOf.get(id);
    return dot === undefined ? l : { ...l, dot };
  };
  const measure = () => {
    const y = window.scrollY;
    const entries: SceneEntry[] = sections.map((el) => {
      const r = el.getBoundingClientRect();
      const side = el.dataset.sceneSide as Side;
      return { id: el.dataset.scene!, top: r.top + y, height: r.height, side: SIDES.includes(side) ? side : 'center' };
    });
    anchors = computeAnchors(entries, window.innerHeight);
  };
  measure();
  let measureTimer = 0;
  const ro = new ResizeObserver(() => {
    clearTimeout(measureTimer);
    measureTimer = window.setTimeout(() => {
      measure();
      size();
      queuePlates();
      loop.start();
    }, 150);
  });
  ro.observe(document.body);
  cancels.push(() => ro.disconnect());

  // ------------------------------------------------------------ painter
  let painter: Painter | null = null;
  let ctx: GL | null = null;
  const scale = () => (fine ? renderScale() : Math.min(renderScale(), 1.5));
  const size = () => {
    const s = scale();
    canvas.width = Math.round(innerWidth * s);
    canvas.height = Math.round(innerHeight * s);
    ctx?.resize(innerWidth, innerHeight, s);
  };

  const useFallback = () => {
    painter?.dispose();
    painter = null;
    ctx?.destroy();
    ctx = null;
    tier = 'static';
    root.dataset.sceneTier = tier;
    // A canvas that ever held a WebGL context can never give a 2D one.
    const fresh = canvas.cloneNode() as HTMLCanvasElement;
    canvas.replaceWith(fresh);
    canvas = fresh;
    size();
    import('./fallback.ts')
      .then(({ createFallback }) => {
        if (disposed || painter) return;
        painter = createFallback(canvas);
        uploaded = drawn = '';
        loop.start();
      })
      .catch(() => {
        /* No fallback chunk: the page stays without the scene. */
      });
  };

  const useGL = () => {
    if (disposed || tier === 'static') return;
    ctx = createGL(canvas, { lost: () => useFallback(), restored: () => {} });
    if (!ctx) {
      console.warn('[scene] WebGL2 unavailable or refused; drawing in 2D.');
      return useFallback();
    }
    size();
    const mine = ctx;
    new Promise<void>((r) => cancels.push(idle(r)))
      .then(() => createMorph(mine, n))
      .then(
      (m) => {
        if (disposed || ctx !== mine) return m.dispose();
        painter = m;
        uploaded = '';
        loop.start();
      },
      (err) => {
        if (ctx !== mine) return;
        console.warn('[scene] shader setup failed; drawing in 2D.', err);
        useFallback();
      },
    );
  };

  size();
  // Context creation and shader compile each get an idle slice of their own:
  // together with the chunk's own evaluation they were one long task.
  if (tier === 'static') useFallback();
  else cancels.push(idle(() => !disposed && useGL()));

  // ------------------------------------------------------------ the loop
  const started = performance.now();
  let mode: 'arrival' | 'flight' | 'scroll' = prefersReducedMotion() ? 'scroll' : 'arrival';
  let modeStart = started;
  let shown: Pose = { from: 'scatter', to: 'portrait', t: 0, side: 'right' };
  let uploaded = '';
  let drawn = '';
  let lastY = window.scrollY;
  let velocity = 0;
  const pointer: [number, number, number] = [0, 0, 0];
  let lastPointer = 0;
  // `--scene-ink` lets a page tint its points (a lab in its own colour).
  const ink = parseColor(getComputedStyle(sections[0]).getPropertyValue('--scene-ink').trim() || getComputedStyle(document.body).color);

  const loop = createLoop((dt, now) => {
    const target = resolve(anchors, window.scrollY);
    // Calm, and the 2D fallback (weak devices): the shape simply is the
    // section's, at once. One frame per change, no travel, no breathing.
    const still = prefersReducedMotion() || tier === 'static';
    const k = 1 - Math.exp(-dt / EASE_MS);

    if (still) {
      // One shape at a time: the section's, switched at the midpoint.
      mode = 'scroll';
      const id = target.t >= 0.5 ? target.to : target.from;
      shown = { from: id, to: id, t: 0, side: target.side };
    } else if (mode === 'arrival') {
      const t = Math.min((now - modeStart) / ARRIVAL_MS, 1);
      shown = { from: 'scatter', to: target.from, t, side: target.side };
      if (t >= 1) mode = 'scroll';
    } else if (mode === 'flight') {
      shown = { ...shown, t: Math.min((now - modeStart) / FLIGHT_MS, 1) };
      if (shown.t >= 1) {
        mode = 'scroll';
        shown = { from: shown.to, to: shown.to, t: 0, side: shown.side };
      }
    } else {
      const step = follow(shown, target, k);
      shown = step.pose;
      if (step.flight) {
        mode = 'flight';
        modeStart = now;
      }
    }

    const y = window.scrollY;
    velocity = still ? 0 : velocity + (Math.min(Math.abs(y - lastY) / innerHeight / 0.05, 1) - velocity) * k;
    lastY = y;
    if (now - lastPointer > 500) pointer[2] += (0 - pointer[2]) * k;

    const key = `${shown.from}>${shown.to}#${version}${innerWidth < 992 ? "n" : "w"}`;
    if (painter && key !== uploaded) {
      painter.setShapes(shape(shown.from), shape(shown.to));
      uploaded = key;
    }
    canvas.dataset.sceneState = shown.t >= 0.5 ? shown.to : shown.from;
    canvas.dataset.sceneShapes = String(shapes.size);

    // The arrival starts from the scatter, which stands where its target does.
    const layout = blendLayout(layoutOf(shown.from === 'scatter' ? shown.to : shown.from), layoutOf(shown.to), shown.t);
    // Where the project's plate stands on screen, drawn by the points: the
    // plate transition (projects/plateTransition.ts) grows from exactly here.
    const shownId = shown.t >= 0.5 ? shown.to : shown.from;
    const half = innerWidth >= 992 ? plateBox.get(shownId) : undefined;
    if (half) {
      const w = (half[0] * layout.scale * innerHeight) / 2;
      const h = (half[1] * layout.scale * innerHeight) / 2;
      const x = ((layout.cx + 1) / 2) * innerWidth;
      const y = ((1 - (layout.cy ?? 0)) / 2) * innerHeight;
      canvas.dataset.sceneRect = [x - w, y - h, 2 * w, 2 * h].map(Math.round).join(',');
    } else delete canvas.dataset.sceneRect;
    // A still painter draws only when what it shows has changed.
    const frame = `${key}@${innerWidth}x${innerHeight}`;
    if (still && frame === drawn) return false;
    drawn = still && painter ? frame : '';
    painter?.draw({
      ...layout,
      progress: shown.t,
      time: still ? 0 : (now - started) / 1000,
      velocity: still ? 0 : velocity,
      pointer,
      color: ink,
      size: (fine ? 1.6 : 1.8) * scale() * (layout.dot ?? 1),
    });

    const settled = mode === 'scroll' && shown.from === target.from && shown.to === target.to && Math.abs(target.t - shown.t) < 0.001 && velocity < 0.001 && pointer[2] < 0.001;
    // A live painter breathes; keep a slow heartbeat only while points travel.
    return !settled;
  });

  const kick = () => loop.start();
  const onPointer = (e: PointerEvent) => {
    pointer[0] = (e.clientX / innerWidth) * 2 - 1;
    pointer[1] = 1 - (e.clientY / innerHeight) * 2;
    pointer[2] = 1;
    lastPointer = performance.now();
    loop.start();
  };
  const onHide = () => loop.stop();
  // createLoop stops in a hidden tab; coming back, points mid-flight carry on.
  const onVisible = () => {
    if (!document.hidden) loop.start();
  };
  // A phone's URL bar changes the window's height without resizing the body.
  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      size();
      loop.start();
    }, 150);
  };
  const onShow = (e: PageTransitionEvent) => {
    if (!e.persisted) return;
    measure();
    loop.start();
  };
  addEventListener('scroll', kick, { passive: true });
  if (fine) addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pagehide', onHide);
  addEventListener('pageshow', onShow);
  document.addEventListener('visibilitychange', onVisible);
  addEventListener('resize', onResize, { passive: true });
  // A loaded embed (Splatoo's 3D viewer) gets the GPU to itself: the scene
  // goes on in 2D.
  const onEmbed = () => tier !== 'static' && useFallback();
  document.addEventListener('irl:embed', onEmbed);
  const offPreference = onMotionPreferenceChange((calm) => {
    if (calm && tier !== 'static') useFallback();
    else if (!calm && tier === 'static' && pickTier() !== 'static' && !document.querySelector('[data-embed][data-loaded]')) {
      // Calm off: back to WebGL, on a canvas that never held a 2D context.
      painter?.dispose();
      painter = null;
      const fresh = canvas.cloneNode() as HTMLCanvasElement;
      canvas.replaceWith(fresh);
      canvas = fresh;
      tier = pickTier();
      root.dataset.sceneTier = tier;
      useGL();
    }
    loop.start();
  });
  loop.start();

  return () => {
    disposed = true;
    cancels.forEach((c) => c());
    clearTimeout(measureTimer);
    offPreference();
    removeEventListener('scroll', kick);
    removeEventListener('pointermove', onPointer);
    removeEventListener('pagehide', onHide);
    removeEventListener('pageshow', onShow);
    document.removeEventListener('visibilitychange', onVisible);
    removeEventListener('resize', onResize);
    document.removeEventListener('irl:embed', onEmbed);
    clearTimeout(resizeTimer);
    loop.destroy();
    painter?.dispose();
    ctx?.destroy();
    canvas.remove();
    style.remove();
    delete root.dataset.sceneTier;
  };
}

/** `#rrggbb` or `rgb(r, g, b)` / `rgba(...)` → 0 … 1 channels; bone white if unparseable. */
export function parseColor(css: string): [number, number, number] {
  const hex = css.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16) / 255) as [number, number, number];
  const m = css.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return [0.91, 0.89, 0.85];
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255];
}
