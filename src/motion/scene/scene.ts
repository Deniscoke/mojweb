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
import { ARROW, CREDO } from './glyphs.ts';
import { createMorph, type MorphUniforms } from './morph.ts';
import { scatter } from './points.ts';
import { pathsShape, scanShape, svgShape, textShape } from './shapes.ts';
import { computeAnchors, layoutFor, resolve, retarget, type Anchor, type Pose, type SceneEntry, type Side } from './timeline.ts';

export type Tier = 'desktop' | 'mobile' | 'static';

/** What draws the points. The WebGL morph and the 2D fallback both are one. */
export interface Painter {
  setShapes(from: Float32Array, to: Float32Array): void;
  draw(u: MorphUniforms): void;
  dispose(): void;
}

const COUNT = { desktop: 16000, mobile: 4000, static: 4000 } as const;
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

  let tier = pickTier();
  const n = COUNT[tier];
  const fine = tier === 'desktop';
  root.dataset.sceneTier = tier;

  let canvas = document.createElement('canvas');
  canvas.className = 'scene';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

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
  const shape = (id: string) =>
    (innerWidth < 992 && id.startsWith('work:') ? drift : shapes.get(id)) ?? fallbackShape;

  const cancels: Array<() => void> = [];
  cancels.push(
    idle(() => {
      put('credo', pathsShape(Object.values(CREDO), n, 3));
      put('arrow', pathsShape([ARROW], n, 4));
      sections.forEach((el, i) => {
        const id = el.dataset.scene!;
        const svg = el.querySelector<SVGSVGElement>('svg[data-visual]');
        if (!id.startsWith('work:') || !svg) return;
        try {
          put(id, svgShape(svg, n, 10 + i));
        } catch {
          /* An unreadable plate keeps the scatter; the other shapes still build. */
        }
      });
    }),
  );
  const h1 = document.querySelector<HTMLElement>('h1');
  if (h1) {
    const timeout = new Promise<void>((r) => setTimeout(r, FONT_TIMEOUT_MS));
    Promise.race([fontsReady(), timeout]).then(() => {
      if (disposed) return;
      const words = (h1.textContent ?? '').trim().split(/\s+/).join('\n');
      const font = getComputedStyle(h1);
      put('name', textShape(words, `${font.fontWeight} 120px ${font.fontFamily}`, n, 5));
    });
  }
  const lab = sections.find((el) => el.dataset.scene === 'scan');
  const scanUrl = lab?.dataset[fine ? 'desktop' : 'mobile'];
  if (lab && scanUrl && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        fetch(scanUrl, { priority: 'low' } as RequestInit)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
          .then((buf) => !disposed && put('scan', scanShape(buf, n, 6)))
          .catch(() => {
            /* No scan: the Lab keeps the scatter. */
          });
      },
      { rootMargin: '200% 0px' },
    );
    io.observe(lab);
    cancels.push(() => io.disconnect());
  }

  // ------------------------------------------------------------ anchors
  let anchors: Anchor[] = [];
  /** Per-section placement overrides (`data-scene-x`, `data-scene-scale`), wide screens only. */
  const placement = new Map<string, { cx?: number; scale?: number }>();
  for (const el of sections) {
    const cx = parseFloat(el.dataset.sceneX ?? '');
    const sc = parseFloat(el.dataset.sceneScale ?? '');
    placement.set(el.dataset.scene!, { ...(isFinite(cx) && { cx }), ...(isFinite(sc) && { scale: sc }) });
  }
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
      loop.start();
    }, 150);
  });
  ro.observe(document.body);
  cancels.push(() => ro.disconnect());

  // ------------------------------------------------------------ painter
  let painter: Painter | null = null;
  let ctx: GL | null = null;
  let disposed = false;
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
        uploaded = '';
        loop.start();
      })
      .catch(() => {
        /* No fallback chunk: the page stays without the scene. */
      });
  };

  const useGL = () => {
    ctx = createGL(canvas, { lost: () => useFallback(), restored: () => {} });
    if (!ctx) return useFallback();
    size();
    const mine = ctx;
    createMorph(mine, n).then(
      (m) => {
        if (disposed || ctx !== mine) return m.dispose();
        painter = m;
        uploaded = '';
        loop.start();
      },
      () => useFallback(),
    );
  };

  size();
  if (tier === 'static') useFallback();
  else useGL();

  // ------------------------------------------------------------ the loop
  const started = performance.now();
  let mode: 'arrival' | 'flight' | 'scroll' = prefersReducedMotion() ? 'scroll' : 'arrival';
  let modeStart = started;
  let shown: Pose = { from: 'scatter', to: 'name', t: 0, side: 'right' };
  let uploaded = '';
  let lastY = window.scrollY;
  let velocity = 0;
  const pointer: [number, number, number] = [0, 0, 0];
  let lastPointer = 0;
  const ink = parseColor(getComputedStyle(document.body).color);

  const loop = createLoop((dt, now) => {
    const target = resolve(anchors, window.scrollY);
    const k = 1 - Math.exp(-dt / EASE_MS);

    if (mode === 'arrival') {
      const t = Math.min((now - modeStart) / ARRIVAL_MS, 1);
      shown = { from: 'scatter', to: target.from, t, side: target.side };
      if (t >= 1) mode = 'scroll';
    } else if (mode === 'flight') {
      shown = { ...shown, t: Math.min((now - modeStart) / FLIGHT_MS, 1) };
      if (shown.t >= 1) {
        mode = 'scroll';
        shown = { from: shown.to, to: shown.to, t: 0, side: shown.side };
      }
    } else if (shown.from !== target.from || shown.to !== target.to) {
      const next = retarget(shown, target);
      if (next === target) {
        const t = target.from === shown.to ? 0 : target.to === shown.from ? 1 : shown.t;
        shown = { ...target, t };
      } else {
        shown = next;
        mode = 'flight';
        modeStart = now;
      }
    } else {
      shown = { ...target, t: shown.t + (target.t - shown.t) * k };
    }

    const y = window.scrollY;
    velocity += (Math.min(Math.abs(y - lastY) / innerHeight / 0.05, 1) - velocity) * k;
    lastY = y;
    if (now - lastPointer > 500) pointer[2] += (0 - pointer[2]) * k;

    const key = `${shown.from}>${shown.to}#${version}${innerWidth < 992 ? "n" : "w"}`;
    if (painter && key !== uploaded) {
      painter.setShapes(shape(shown.from), shape(shown.to));
      uploaded = key;
    }
    canvas.dataset.sceneState = shown.t >= 0.5 ? shown.to : shown.from;

    const calm = prefersReducedMotion();
    const layout = {
      ...layoutFor(shown.side, innerWidth),
      ...(innerWidth >= 992 && shown.side !== 'full' ? placement.get(shown.t >= 0.5 ? shown.to : shown.from) : undefined),
    };
    // A shape never spills past the screen's sides (the drifting field may).
    if (shown.side !== 'full') layout.scale = Math.min(layout.scale, (innerWidth / innerHeight) * 0.92);
    painter?.draw({
      ...layout,
      progress: shown.t,
      time: calm ? 0 : (now - started) / 1000,
      velocity: calm ? 0 : velocity,
      pointer,
      color: ink,
      size: (fine ? 1.6 : 1.8) * scale(),
    });

    const settled = mode === 'scroll' && Math.abs(target.t - shown.t) < 0.001 && velocity < 0.001 && pointer[2] < 0.001;
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
  const onShow = (e: PageTransitionEvent) => {
    if (!e.persisted) return;
    measure();
    loop.start();
  };
  addEventListener('scroll', kick, { passive: true });
  if (fine) addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pagehide', onHide);
  addEventListener('pageshow', onShow);
  const offPreference = onMotionPreferenceChange((calm) => {
    if (calm && tier !== 'static') useFallback();
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
    loop.destroy();
    painter?.dispose();
    ctx?.destroy();
    canvas.remove();
    delete root.dataset.sceneTier;
  };
}

/** `rgb(r, g, b)` / `rgba(...)` → 0 … 1 channels; bone white if unparseable. */
function parseColor(css: string): [number, number, number] {
  const m = css.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return [0.91, 0.89, 0.85];
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255];
}
