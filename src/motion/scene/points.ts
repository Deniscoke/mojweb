/**
 * Point clouds for the living scene, as flat `Float32Array`s of n × (x, y, z).
 * Shapes live in a [-1, 1] box (y up); the renderer places and scales them.
 *
 * Pure and import-free on purpose: `npm run test:unit` loads this file
 * straight into Node, and the scene chunk stays small.
 */

/** mulberry32: a tiny seeded generator. Same seed, same sequence, in [0, 1). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** n points spread over the whole box, a little depth for the point size. */
export function scatter(n: number, seed: number): Float32Array {
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = r() * 2 - 1;
    out[i * 3 + 1] = r() * 2 - 1;
    out[i * 3 + 2] = (r() * 2 - 1) * 0.3;
  }
  return out;
}

/**
 * Exactly n points from `src`: an even, seeded stride when there are more,
 * repeats when there are fewer. Every state of the scene has the same count,
 * so the GPU can mix any two of them point for point.
 */
export function fitCount(src: Float32Array, n: number, seed: number): Float32Array {
  const m = Math.floor(src.length / 3);
  if (m === 0) return scatter(n, seed);
  const out = new Float32Array(n * 3);
  const offset = rng(seed)();
  for (let i = 0; i < n; i++) {
    const j = m >= n ? Math.min(m - 1, Math.floor((i + offset) * (m / n))) : i % m;
    out[i * 3] = src[j * 3];
    out[i * 3 + 1] = src[j * 3 + 1];
    out[i * 3 + 2] = src[j * 3 + 2];
  }
  return out;
}

/**
 * n points on the opaque pixels (alpha > 127) of a w × h mask, normalised
 * by the longer side so the shape keeps its proportions. An empty mask (a
 * font that never loaded, an image that failed) gives the scatter instead.
 */
export function sampleMask(alpha: Uint8ClampedArray, w: number, h: number, n: number, seed: number): Float32Array {
  const lit: number[] = [];
  for (let i = 0; i < w * h; i++) if (alpha[i] > 127) lit.push(i);
  if (lit.length === 0) return scatter(n, seed);

  const r = rng(seed);
  const long = Math.max(w, h);
  const sx = w / long;
  const sy = h / long;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = lit[Math.floor(r() * lit.length)];
    const px = (p % w) + r();
    const py = Math.floor(p / w) + r();
    out[i * 3] = ((px / w) * 2 - 1) * sx;
    out[i * 3 + 1] = (1 - (py / h) * 2) * sy;
    out[i * 3 + 2] = (r() * 2 - 1) * 0.05;
  }
  return out;
}
