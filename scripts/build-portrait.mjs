#!/usr/bin/env node
/**
 * BUILD THE HERO PORTRAIT DENSITY MAP
 * ===================================
 * The living scene (src/motion/scene) draws Denis's portrait out of its own
 * points. It does not ship the photograph: this script turns the photo into
 * a small grey map whose brightness is how densely points gather there, and
 * only that map is committed. The original stays outside the repository,
 * like every original (public/media/photos/README.md).
 *
 *   node scripts/build-portrait.mjs <photo.jpg> [--preview out.png]
 *
 * Steps, all on the photo's own pixels:
 *   1. turn upright (EXIF), scale to MAP_W wide;
 *   2. remove the wall: flood fill from the top and side edges over pixels
 *      close to the wall's colour, plus the two framed pictures beside the
 *      head (PICTURES, in source-photo fractions), which are not wall-coloured;
 *   3. density = a floor (so dark clothes still read as a silhouette) plus
 *      the figure's own brightness, contrast-stretched within the figure;
 *   4. feather the figure's edge and fade the bottom out, so the bust ends
 *      softly instead of on a cut.
 *
 * Writes public/assets/portrait/portrait-<hash>.png (white, density as
 * alpha) and prints
 * its URL for src/components/hero/Hero.astro.
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const MAP_W = 180;
/** Fraction of the source the bust is cut from: [left, top, right, bottom]. */
const CROP = [0.02, 0.08, 0.98, 1];
/** The two pictures on the wall, as [left, top, right, bottom] of the source photo. */
const PICTURES = [
  [0.12, 0.24, 0.3, 0.45],
  [0.86, 0.44, 1, 0.64],
];
/** Region growing: a step to a neighbour this close (RGB) stays on the wall... */
const STEP_TOLERANCE = 13;
/** ...as long as the pixel is still this close to the wall's own colour. */
const WALL_TOLERANCE = 95;
/** Share of the density that comes from edges (features), the rest from brightness. */
const EDGES = 0;
/** Local contrast: brightness minus its own blur (radius in map px), times AMOUNT. */
const LOCAL_RADIUS = 7;
const LOCAL_AMOUNT = 1.6;
/** The head is the top share of the map: tones are stretched over it alone. */
const HEAD = 0.6;
/** Points on the darkest part of the figure, as a share of the brightest. */
const FLOOR = 0.03;
/** The bottom share of the map fades to nothing. */
const FADE = 0.5;
const OUT_DIR = 'public/assets/portrait';

const [src, ...rest] = process.argv.slice(2);
if (!src) {
  console.error('usage: node scripts/build-portrait.mjs <photo.jpg> [--preview out.png]');
  process.exit(1);
}
const previewAt = rest.indexOf('--preview');
const preview = previewAt >= 0 ? rest[previewAt + 1] : null;

const upright = sharp(src).rotate();
const { width: SW, height: SH } = await upright.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
const crop = {
  left: Math.round(CROP[0] * SW),
  top: Math.round(CROP[1] * SH),
  width: Math.round((CROP[2] - CROP[0]) * SW),
  height: Math.round((CROP[3] - CROP[1]) * SH),
};
const { data, info } = await upright
  .clone()
  .extract(crop)
  .resize({ width: MAP_W })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];

// Wall colour: the median of the top row.
const top = Array.from({ length: W }, (_, x) => px(x));
const median = [0, 1, 2].map((c) => top.map((p) => p[c]).sort((a, b) => a - b)[W >> 1]);
const nearWall = (i) => {
  const [r, g, b] = px(i);
  return Math.hypot(r - median[0], g - median[1], b - median[2]) < WALL_TOLERANCE;
};

// 1 = background.
const bg = new Uint8Array(W * H);
// The pictures, mapped from source fractions into the map.
for (const [l, t, r, b] of PICTURES) {
  const x0 = Math.floor(((l - CROP[0]) / (CROP[2] - CROP[0])) * W);
  const x1 = Math.ceil(((r - CROP[0]) / (CROP[2] - CROP[0])) * W);
  const y0 = Math.floor(((t - CROP[1]) / (CROP[3] - CROP[1])) * H);
  const y1 = Math.ceil(((b - CROP[1]) / (CROP[3] - CROP[1])) * H);
  for (let y = Math.max(0, y0); y < Math.min(H, y1); y++)
    for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) {
      // Keep the figure: a picture pixel darker than the wall's shadow but
      // skin-toned would be the ear; the pictures are saturated, the ear is not.
      bg[y * W + x] = 1;
    }
}
// Grow the wall from the top row and the upper sides, step by small step,
// so it follows its own shading down into the shadow beside the shoulders.
const stack = [];
const seed = (i) => nearWall(i) && stack.push([i, i]);
for (let x = 0; x < W; x++) seed(x);
for (let y = 0; y < H * 0.75; y++) seed(y * W), seed(y * W + W - 1);
const close = (a, b) => {
  const [r1, g1, b1] = px(a);
  const [r2, g2, b2] = px(b);
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2) < STEP_TOLERANCE;
};
while (stack.length) {
  const [i, from] = stack.pop();
  if (bg[i] === 2) continue;
  if (bg[i] !== 1 && !(nearWall(i) && close(i, from))) continue;
  bg[i] = 2;
  const x = i % W;
  if (x > 0) stack.push([i - 1, i]);
  if (x < W - 1) stack.push([i + 1, i]);
  if (i >= W) stack.push([i - W, i]);
  if (i < W * (H - 1)) stack.push([i + W, i]);
}
const figure = Float32Array.from(bg, (v) => (v === 2 ? 0 : 1));

// Feather: a 3×3 box blur of the figure mask, twice.
const blur = (m) => {
  const o = new Float32Array(m.length);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let s = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          s += m[yy * W + xx];
          n++;
        }
      o[y * W + x] = s / n;
    }
  return o;
};
const soft = blur(blur(figure));

// Brightness within the figure, stretched between its 2nd and 98th percentiles.
const lum = Float32Array.from({ length: W * H }, (_, i) => {
  const [r, g, b] = px(i);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
});
// Local contrast (an unsharp mask with a wide radius): features stand out
// from the face around them, whatever the light falling on the whole head.
const wide = (() => {
  let m = Float32Array.from(lum);
  const pass = (src) => {
    const o = new Float32Array(src.length);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let s2 = 0;
        let n2 = 0;
        for (let d = -LOCAL_RADIUS; d <= LOCAL_RADIUS; d++) {
          const xx = x + d;
          if (xx < 0 || xx >= W) continue;
          s2 += src[y * W + xx];
          n2++;
        }
        o[y * W + x] = s2 / n2;
      }
    const o2 = new Float32Array(src.length);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let s2 = 0;
        let n2 = 0;
        for (let d = -LOCAL_RADIUS; d <= LOCAL_RADIUS; d++) {
          const yy = y + d;
          if (yy < 0 || yy >= H) continue;
          s2 += o[yy * W + x];
          n2++;
        }
        o2[y * W + x] = s2 / n2;
      }
    return o2;
  };
  m = pass(m);
  return m;
})();
for (let i = 0; i < lum.length; i++) lum[i] = Math.min(1, Math.max(0, lum[i] + LOCAL_AMOUNT * (lum[i] - wide[i])));

const inside = [...lum].filter((_, i) => figure[i] > 0).sort((a, b) => a - b);
const head = [...lum].filter((_, i) => figure[i] > 0 && i < W * H * HEAD).sort((a, b) => a - b);
const lo = head[Math.floor(head.length * 0.12)];
const hi = head[Math.floor(head.length * 0.97)];

// Edges: Sobel magnitude of the brightness, normalised at its 98th percentile
// inside the figure. Eyes, glasses, mouth and the hair line live here.
const edge = new Float32Array(W * H);
for (let y = 1; y < H - 1; y++)
  for (let x = 1; x < W - 1; x++) {
    const L = (dx, dy) => lum[(y + dy) * W + x + dx];
    const gx = L(1, -1) + 2 * L(1, 0) + L(1, 1) - L(-1, -1) - 2 * L(-1, 0) - L(-1, 1);
    const gy = L(-1, 1) + 2 * L(0, 1) + L(1, 1) - L(-1, -1) - 2 * L(0, -1) - L(1, -1);
    edge[y * W + x] = Math.hypot(gx, gy) * figure[y * W + x] * (soft[y * W + x] > 0.99 ? 1 : 0);
  }
const edges = [...edge].filter((v) => v > 0).sort((a, b) => a - b);
const edgeHi = edges[Math.floor(edges.length * 0.98)] || 1;

const out = Buffer.alloc(W * H);
for (let y = 0; y < H; y++) {
  const fade = Math.min(1, (1 - y / H) / FADE);
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const t = Math.min(1, Math.max(0, (lum[i] - lo) / (hi - lo)));
    const e = Math.min(1, edge[i] / edgeHi);
    const s = t * t * (3 - 2 * t);
    const tone = (1 - EDGES) * Math.pow(s, 1.9) + EDGES * e;
    const density = (FLOOR + (1 - FLOOR) * tone) * soft[i] * fade;
    out[i] = Math.round(density * 255);
  }
}

// White, with the density as alpha: the scene reads the alpha channel.
const ga = Buffer.alloc(W * H * 2, 255);
for (let i = 0; i < W * H; i++) ga[i * 2 + 1] = out[i];
const png = await sharp(ga, { raw: { width: W, height: H, channels: 2 } }).png({ compressionLevel: 9 }).toBuffer();
const hash = createHash('sha256').update(png).digest('hex').slice(0, 8);
await mkdir(OUT_DIR, { recursive: true });
for (const f of await readdir(OUT_DIR)) if (/^portrait-.*\.png$/.test(f)) await rm(join(OUT_DIR, f));
const file = `portrait-${hash}.png`;
await writeFile(join(OUT_DIR, file), png);
console.log(`/assets/portrait/${file}  ${W}×${H}  ${png.length} B  (figure ${Math.round((inside.length / (W * H)) * 100)}% of the map)`);

if (preview) {
  // Light points on the page's ink, the way the scene will draw them.
  const scale = 4;
  const img = Buffer.alloc(W * scale * H * scale * 3, 10);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let k = 0; k < 16000; k++) {
    let i;
    do i = Math.floor(rnd() * W * H);
    while (rnd() * 255 > out[i]);
    const x = Math.floor(((i % W) + rnd()) * scale);
    const y = Math.floor((Math.floor(i / W) + rnd()) * scale);
    const o = (y * W * scale + x) * 3;
    img[o] = 233;
    img[o + 1] = 228;
    img[o + 2] = 218;
  }
  await sharp(img, { raw: { width: W * scale, height: H * scale, channels: 3 } }).png().toFile(preview);
  console.log(`preview → ${preview}`);
}
