/**
 * Shape builders for the living scene: text, stroked marks, project plates
 * and the scan, each as exactly n points in the [-1, 1] box.
 *
 * Text and marks go through a small offscreen raster; the raster is a
 * parameter so `npm run test:unit` can hand in a fake one. Plates are
 * sampled from their own geometry instead: their colours are CSS custom
 * properties, which an isolated SVG image would not resolve.
 */
import { fitCount, rng, sampleMask, sampleWeighted, scatter } from './points.ts';
import { scanPositions } from './scanData.ts';

/** Most points ever sampled from one plate's geometry. */
const SAMPLES = 1500;

export type Raster = (
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  w?: number,
  h?: number,
) => { alpha: Uint8ClampedArray; w: number; h: number };

/** Draw into a w × h canvas and keep only its alpha channel. */
export const rasterize: Raster = (draw, w = 512, h = 256) => {
  const canvas: HTMLCanvasElement | OffscreenCanvas =
    typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | null;
  const alpha = new Uint8ClampedArray(w * h);
  if (!ctx) return { alpha, w, h };
  draw(ctx, w, h);
  const rgba = ctx.getImageData(0, 0, w, h).data;
  for (let i = 0; i < alpha.length; i++) alpha[i] = rgba[i * 4 + 3];
  return { alpha, w, h };
};

/** Lines of text (split on \n), centred, shrunk to fit the raster. */
export function textShape(text: string, font: string, n: number, seed: number, raster: Raster = rasterize): Float32Array {
  const lines = text.split('\n');
  const { alpha, w, h } = raster((ctx, w, h) => {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width), 1);
    const lineH = h / lines.length;
    const k = Math.min((w * 0.94) / widest, 1);
    ctx.setTransform(k, 0, 0, k, w / 2, 0);
    lines.forEach((l, i) => ctx.fillText(l, 0, (lineH * (i + 0.5)) / k));
  });
  return sampleMask(alpha, w, h, n, seed);
}

/** Stroked 100 × 100 marks, side by side in one row. */
export function pathsShape(paths: readonly string[], n: number, seed: number, raster: Raster = rasterize): Float32Array {
  const { alpha, w, h } = raster(
    (ctx, w, h) => {
      const cell = w / paths.length;
      const k = (Math.min(cell, h) * 0.8) / 100;
      ctx.lineWidth = 6;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      paths.forEach((d, i) => {
        ctx.setTransform(k, 0, 0, k, cell * (i + 0.5) - 50 * k, h / 2 - 50 * k);
        ctx.stroke(new Path2D(d));
      });
    },
    256 * paths.length,
    256,
  );
  return sampleMask(alpha, w, h, n, seed);
}

/**
 * Points along the stroked geometry of a project plate (`svg[data-visual]`),
 * in proportion to each element's length. The plate's full-bleed backdrop
 * is skipped: it would turn the whole shape into a solid block.
 */
export function svgShape(svg: SVGSVGElement, n: number, seed: number): Float32Array {
  const box = svg.viewBox.baseVal;
  const W = box?.width || 100;
  const H = box?.height || 100;
  const els = [...svg.querySelectorAll<SVGGeometryElement>('path, line, polyline, polygon, circle, ellipse, rect')].filter((el) => {
    try {
      const b = el.getBBox();
      return !(b.width >= W * 0.9 && b.height >= H * 0.9);
    } catch {
      return false;
    }
  });
  const lengths = els.map((el) => {
    try {
      return el.getTotalLength();
    } catch {
      return 0;
    }
  });
  const total = lengths.reduce((a, b) => a + b, 0);
  if (total <= 0) return scatter(n, seed);

  // getPointAtLength walks the path on every call: sample at most SAMPLES
  // points and let fitCount repeat them up to n.
  const m0 = Math.min(n, SAMPLES);
  const r = rng(seed);
  const long = Math.max(W, H);
  const out = new Float32Array(m0 * 3);
  let k = 0;
  els.forEach((el, e) => {
    const m = toSvg(el, svg);
    const count = e === els.length - 1 ? m0 - k : Math.round((lengths[e] / total) * m0);
    for (let i = 0; i < count && k < m0; i++, k++) {
      const p = el.getPointAtLength(r() * lengths[e]);
      // By hand: Chrome's legacy SVGPoint.matrixTransform refuses a DOMMatrix.
      const x = m ? m.a * p.x + m.c * p.y + m.e : p.x;
      const y = m ? m.b * p.x + m.d * p.y + m.f : p.y;
      out[k * 3] = (((x - box.x) / W) * 2 - 1) * (W / long);
      out[k * 3 + 1] = (1 - ((y - box.y) / H) * 2) * (H / long);
      out[k * 3 + 2] = (r() * 2 - 1) * 0.05;
    }
  });
  return k === n ? out : fitCount(out.subarray(0, k * 3), n, seed);
}

/** The element's transforms up to (not including) the root svg, as one matrix. */
function toSvg(el: SVGGraphicsElement, svg: SVGSVGElement): DOMMatrix | null {
  let m: DOMMatrix | null = null;
  for (let node: Element | null = el; node && node !== svg; node = node.parentElement) {
    const t = (node as SVGGraphicsElement).transform?.baseVal?.consolidate();
    if (t) m = m ? t.matrix.multiply(m) : DOMMatrix.fromMatrix(t.matrix);
  }
  return m;
}

/**
 * A portrait from a density map (scripts/build-portrait.mjs): white, with
 * how densely points gather as alpha. Points follow the alpha.
 */
export function imageShape(
  img: CanvasImageSource,
  w: number,
  h: number,
  n: number,
  seed: number,
  raster: Raster = rasterize,
): Float32Array {
  const { alpha, w: rw, h: rh } = raster((ctx, cw, ch) => ctx.drawImage(img, 0, 0, cw, ch), w, h);
  return sampleWeighted(alpha, rw, rh, n, seed);
}

/** The scan at exactly n points; a file that fails to parse gives the scatter. */
export function scanShape(buf: ArrayBuffer, n: number, seed: number): Float32Array {
  return fitCount(scanPositions(buf) ?? scatter(n, seed), n, seed);
}
