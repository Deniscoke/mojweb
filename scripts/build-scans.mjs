/**
 * Real point-cloud scans for the point-scan engine (src/motion/ambient/).
 *
 *   node scripts/build-scans.mjs                      # kasna.ply, the hero scan
 *   node scripts/build-scans.mjs --src "<file>.ply" --id <id> --own-capture
 *   node scripts/build-scans.mjs --preview scan.png   # also render a check image
 *
 * Reads a binary PLY straight from Denis's machine (the source is never
 * committed — 148 MB of mesh for 68 KB of points), keeps ONLY captured
 * vertices, and writes two hashed files to public/assets/scans/:
 *
 *   <id>-<hash>-desktop.bin   ≤ 70 000 bytes  (~10k points)
 *   <id>-<hash>-mobile.bin    ≤ 28 000 bytes  (~4k points)
 *
 * Every shipped point is a real vertex from the capture. Decimation picks,
 * per voxel, the vertex nearest the voxel's centroid; it never averages,
 * interpolates or invents a position. Luminance comes from the capture's own
 * vertex colours (or its diffuse texture, sampled at the vertex UV); with
 * neither, a constant is written and the scan is honest monochrome geometry.
 *
 * FILE FORMAT (little-endian), read by pointScan.ts with typed-array views
 * and no parse step:
 *
 *   0   char[4]    "DMS1"
 *   4   uint32     count
 *   8   float32×3  bounds min (x, y, z), metres, Y up, centred on x/z
 *   20  float32×3  bounds max
 *   32  uint32     flags   bit 0  first ⌈count/2⌉ points are a uniform subsample
 *                          bit 1  luminance is measured (colour or texture)
 *   36  int16×3×count  positions, normalised to bounds: p = mid + q/32767·half
 *   ..  uint8×count    luminance
 *
 * Bit 0 is what lets the governor halve the point count by drawing a prefix:
 * the points are written as two levels of detail, each Morton-sorted, so the
 * first half is spatially even rather than "the left half of the object".
 *
 * Provenance: the default source is kasna.ply, a RealityScan capture Denis
 * made and already publishes as evidence (digital-space-pointcloud.webp).
 * Any PLY whose header does not say RealityScan needs --own-capture, which is
 * Denis confirming he captured it. `Michel Rodange monument.ply` in the same
 * folder is an Artec Group export under CC-BY 3.0 — not his capture, and not
 * evidence under rule 1 of docs/motion-depth-plan.md.
 *
 * After a run, the generated block for <id> in src/data/scans.ts is rewritten
 * (files, counts, bounds). Captions, links and approval stay hand-written.
 */
import { createHash } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

// ------------------------------------------------------------------ options

const DEFAULT_SRC = 'C:/Users/Admin/Desktop/reality scan/kasna.ply';
const OUT_DIR = 'public/assets/scans';
const MANIFEST = 'src/data/scans.ts';

/** Raw byte caps from the plan (§5.3). Counted raw: octet-stream may not be gzipped. */
const BUDGET = { desktop: 70_000, mobile: 28_000 };
const TARGET = { desktop: 10_000, mobile: 4_000 };
const HEADER_BYTES = 36;
const BYTES_PER_POINT = 7; // int16×3 + uint8

const args = parseArgs(process.argv.slice(2));
const SRC = args.src ?? DEFAULT_SRC;
const ID = args.id ?? basename(SRC).replace(/\.ply$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
/**
 * Per-scan settings, so a bare `node scripts/build-scans.mjs` reproduces the
 * committed files byte for byte. Flags override them.
 *
 *   up         the source's up axis (RealityScan exports Z-up)
 *   yaw        degrees about the new up axis, so the resting view faces the
 *              side worth seeing
 *   trim       percent of vertices clipped per horizontal axis side (strays)
 *   radius     optional horizontal crop, metres from the centre (0 = none)
 *   focus      metres from the centre where sampling is densest (0 = even)
 *   focusGain  how much coarser the voxels are outside `focus`
 *
 * kasna: the fountain house is a hexagon about 5.2 m to its corners, on a
 * lawn that runs out to 14 m. Kept whole, the lawn set the object's size
 * (the engine scales the widest horizontal extent to the box it stands in),
 * so the building was drawn at a third of the width, inside a disc of
 * sparse ground points that spilled onto the readout under it. Cropped at
 * 5.9 m, the scan is the building on its own plinth of ground, drawn twice
 * the size from the same 10k points, and the site's floor is the ground
 * around it. The thin ring past 5.2 m is sampled coarser, so the plinth
 * stays the honest edge of the capture without becoming a disc of noise.
 */
const PRESETS = {
  kasna: { up: 'z', yaw: 35, trim: 0.5, radius: 5.9, focus: 5.2, focusGain: 1.5 },
};
const preset = { up: 'z', yaw: 0, trim: 0.5, radius: 0, focus: 0, focusGain: 1, ...PRESETS[ID] };
const UP = args.up ?? preset.up;
const YAW = Number(args.yaw ?? preset.yaw);
const TRIM = Number(args.trim ?? preset.trim);
const RADIUS = Number(args.radius ?? preset.radius);
const FOCUS = Number(args.focus ?? preset.focus);
const FOCUS_GAIN = Number(args['focus-gain'] ?? preset.focusGain);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else out[key] = argv[++i];
  }
  return out;
}

function fail(msg) {
  console.error(`\n  build-scans: ${msg}\n`);
  process.exit(1);
}

if (!existsSync(SRC)) fail(`source not found: ${SRC}\n  Pass --src "<path to .ply>".`);

// ------------------------------------------------------------------- header

const TYPES = {
  char: ['getInt8', 1], int8: ['getInt8', 1],
  uchar: ['getUint8', 1], uint8: ['getUint8', 1],
  short: ['getInt16', 2], int16: ['getInt16', 2],
  ushort: ['getUint16', 2], uint16: ['getUint16', 2],
  int: ['getInt32', 4], int32: ['getInt32', 4],
  uint: ['getUint32', 4], uint32: ['getUint32', 4],
  float: ['getFloat32', 4], float32: ['getFloat32', 4],
  double: ['getFloat64', 8], float64: ['getFloat64', 8],
};

const fd = openSync(SRC, 'r');
const probe = Buffer.alloc(64 * 1024);
readSync(fd, probe, 0, probe.length, 0);
const endTag = probe.indexOf('end_header');
if (endTag < 0) fail('no end_header in the first 64 KB — not a PLY file?');
const dataStart = probe.indexOf(0x0a, endTag) + 1;
const headerLines = probe.subarray(0, dataStart).toString('latin1').split(/\r?\n/);

let format = '';
const comments = [];
const elements = [];
for (const line of headerLines) {
  const p = line.trim().split(/\s+/);
  if (p[0] === 'format') format = p[1];
  else if (p[0] === 'comment') comments.push(p.slice(1).join(' '));
  else if (p[0] === 'element') elements.push({ name: p[1], count: Number(p[2]), props: [] });
  else if (p[0] === 'property') {
    const el = elements.at(-1);
    if (p[1] === 'list') el.props.push({ name: p[4], list: true });
    else el.props.push({ name: p[2], type: p[1] });
  }
}

if (format !== 'binary_little_endian' && format !== 'binary_big_endian') {
  fail(`format "${format}" is not supported; export the PLY as binary.`);
}
const littleEndian = format === 'binary_little_endian';

const vIndex = elements.findIndex((e) => e.name === 'vertex');
if (vIndex < 0) fail('the PLY has no vertex element.');
let vertexOffset = dataStart;
for (const el of elements.slice(0, vIndex)) {
  if (el.props.some((p) => p.list)) fail(`element "${el.name}" before the vertices has list properties.`);
  vertexOffset += el.count * el.props.reduce((s, p) => s + TYPES[p.type][1], 0);
}
const vertex = elements[vIndex];
if (vertex.props.some((p) => p.list)) fail('vertex element has list properties.');

let stride = 0;
const field = {};
for (const p of vertex.props) {
  const t = TYPES[p.type];
  if (!t) fail(`unknown property type "${p.type}"`);
  field[p.name] = { offset: stride, get: t[0], type: p.type };
  stride += t[1];
}
for (const k of ['x', 'y', 'z']) if (!field[k]) fail(`vertex has no "${k}" property.`);

const provenance = comments.join(' / ') || '(no header comment)';
if (!/realityscan|realitycapture/i.test(provenance) && !args['own-capture']) {
  fail(
    `header says "${provenance}".\n` +
      `  Only Denis's own captures may ship (plan §1, rule 1). If he captured this,\n` +
      `  re-run with --own-capture.`,
  );
}

const N = vertex.count;
console.log(`  source     ${SRC}`);
console.log(`  provenance ${provenance}`);
console.log(`  vertices   ${N.toLocaleString('en')}  (${vertex.props.map((p) => p.name).join(' ')}, ${stride} B each)`);

// --------------------------------------------------------- stream vertices

/**
 * The vertex block is read in bounded chunks that hold whole records, so the
 * 148 MB file is never in memory at once; the faces after it are never read.
 * What is kept: positions (float32) and a luminance byte per vertex.
 */
const hasRGB = !!(field.red && field.green && field.blue);
const hasUV = !!((field.s && field.t) || (field.u && field.v) || (field.texture_u && field.texture_v));
const uName = field.s ? 's' : field.u ? 'u' : 'texture_u';
const vName = field.s ? 't' : field.v ? 'v' : 'texture_v';

const pos = new Float32Array(N * 3);
const lum = new Uint8Array(N);
const uv = !hasRGB && hasUV ? new Float32Array(N * 2) : null;

const colourScale = hasRGB ? (/float|double/.test(field.red.type) ? 255 : field.red.type.includes('short') ? 1 / 257 : 1) : 0;
const RECORDS_PER_CHUNK = Math.floor((4 * 1024 * 1024) / stride);
const chunk = Buffer.alloc(RECORDS_PER_CHUNK * stride);

for (let done = 0; done < N; ) {
  const take = Math.min(RECORDS_PER_CHUNK, N - done);
  const bytes = readSync(fd, chunk, 0, take * stride, vertexOffset + done * stride);
  if (bytes < take * stride) fail('file ended inside the vertex block.');
  const view = new DataView(chunk.buffer, chunk.byteOffset, bytes);
  for (let r = 0; r < take; r++) {
    const o = r * stride;
    const i = done + r;
    pos[i * 3] = view[field.x.get](o + field.x.offset, littleEndian);
    pos[i * 3 + 1] = view[field.y.get](o + field.y.offset, littleEndian);
    pos[i * 3 + 2] = view[field.z.get](o + field.z.offset, littleEndian);
    if (hasRGB) {
      const R = view[field.red.get](o + field.red.offset, littleEndian) * colourScale;
      const G = view[field.green.get](o + field.green.offset, littleEndian) * colourScale;
      const B = view[field.blue.get](o + field.blue.offset, littleEndian) * colourScale;
      lum[i] = clampByte(0.2126 * R + 0.7152 * G + 0.0722 * B);
    } else if (uv) {
      uv[i * 2] = view[field[uName].get](o + field[uName].offset, littleEndian);
      uv[i * 2 + 1] = view[field[vName].get](o + field[vName].offset, littleEndian);
    }
  }
  done += take;
}
closeSync(fd);

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

// ---------------------------------------------------------------- luminance

let lumSource = 'constant';
if (hasRGB) {
  lumSource = 'vertex colour';
} else if (uv) {
  const tex = typeof args.texture === 'string' ? args.texture : findTexture(SRC);
  if (tex) {
    const { default: sharp } = await import('sharp');
    const { data, info } = await sharp(tex, { limitInputPixels: false }).greyscale().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < N; i++) {
      const u = uv[i * 2] - Math.floor(uv[i * 2]);
      const v = uv[i * 2 + 1] - Math.floor(uv[i * 2 + 1]);
      const px = Math.min(info.width - 1, Math.floor(u * info.width));
      const py = Math.min(info.height - 1, Math.floor((1 - v) * info.height)); // PLY UVs are bottom-up
      lum[i] = data[(py * info.width + px) * info.channels];
    }
    lumSource = `texture ${basename(tex)}`;
  }
}
if (lumSource === 'constant') lum.fill(200);
console.log(`  luminance  ${lumSource}`);

function findTexture(src) {
  const dir = dirname(src);
  const stem = basename(src).replace(/\.ply$/i, '');
  const hit = readdirSync(dir).find((f) => f.startsWith(stem) && /diffuse\.(png|jpe?g)$/i.test(f));
  return hit ? join(dir, hit) : null;
}

// ------------------------------------------------------- orient and trim

/**
 * Rotate into the engine's frame (Y up), then yaw. Z-up → Y-up is the same
 * rot_x(-90°) scripts/render-pointcloud.py uses for the published render.
 */
const yawR = (YAW * Math.PI) / 180;
const cy = Math.cos(yawR);
const sy = Math.sin(yawR);
for (let i = 0; i < N; i++) {
  let x = pos[i * 3];
  let y = pos[i * 3 + 1];
  let z = pos[i * 3 + 2];
  switch (UP) {
    case 'z': [y, z] = [z, -y]; break;
    case '-z': [y, z] = [-z, y]; break;
    case '-y': [y, z] = [-y, -z]; break;
    case 'x': [x, y] = [-y, x]; break;
    case 'y': break;
    default: fail(`--up must be one of x, y, -y, z, -z (got "${UP}")`);
  }
  pos[i * 3] = x * cy + z * sy;
  pos[i * 3 + 1] = y;
  pos[i * 3 + 2] = -x * sy + z * cy;
}

/**
 * Photogrammetry leaves stray vertices far from the subject (sky, reflections,
 * a passer-by). Clip TRIM% per horizontal axis side, measured on an even
 * sample. Height is clipped far more gently (a hundredth of that at the top):
 * the highest vertices are the roof, and a percentile cut would flatten it.
 */
const lo = [0, 0, 0];
const hi = [0, 0, 0];
{
  const step = Math.max(1, Math.floor(N / 250_000));
  for (let a = 0; a < 3; a++) {
    const sample = [];
    for (let i = 0; i < N; i += step) sample.push(pos[i * 3 + a]);
    sample.sort((p, q) => p - q);
    const tLo = a === 1 ? TRIM / 4 : TRIM;
    const tHi = a === 1 ? TRIM / 100 : TRIM;
    lo[a] = sample[Math.floor((sample.length - 1) * (tLo / 100))];
    hi[a] = sample[Math.ceil((sample.length - 1) * (1 - tHi / 100))];
  }
}
const cx = (lo[0] + hi[0]) / 2;
const cz = (lo[2] + hi[2]) / 2;

let kept = [];
for (let i = 0; i < N; i++) {
  const x = pos[i * 3];
  const y = pos[i * 3 + 1];
  const z = pos[i * 3 + 2];
  if (x < lo[0] || x > hi[0] || y < lo[1] || y > hi[1] || z < lo[2] || z > hi[2]) continue;
  if (RADIUS > 0 && Math.hypot(x - cx, z - cz) > RADIUS) continue;
  kept.push(i);
}
kept = Uint32Array.from(kept);
// Centre on x/z and stand the object on y = 0, so "base" means the lowest
// captured point and the engine can place it on the hero floor.
for (let i = 0; i < N; i++) {
  pos[i * 3] -= cx;
  pos[i * 3 + 1] -= lo[1];
  pos[i * 3 + 2] -= cz;
}
const trimNote = [`${TRIM}% per side`];
if (RADIUS) trimNote.push(`radius ${RADIUS} m`);
if (FOCUS) trimNote.push(`focus ${FOCUS} m ×${FOCUS_GAIN}`);
console.log(`  trimmed    ${kept.length.toLocaleString('en')} kept (${trimNote.join(', ')})`);

// ---------------------------------------------------------------- decimate

/**
 * Voxel-grid decimation. Every occupied voxel contributes ONE real vertex,
 * chosen by a fixed hash of its index: deterministic, so builds reproduce,
 * but not the vertex nearest the voxel centre, which on flat ground lines up
 * into a visible lattice. Outside the focus radius the voxels are FOCUS_GAIN
 * times larger. The size is found by bisection so the count lands at or just
 * under the target.
 */
function voxelPick(indices, size) {
  const inv = 1 / size;
  const best = new Map();
  for (const i of indices) {
    const k = voxelKey(i, inv);
    const prev = best.get(k);
    if (prev === undefined || rank(i) < rank(prev)) best.set(k, i);
  }
  return Uint32Array.from(best.values());
}

/** A 32-bit integer hash (lowbias32), used as a stable random rank. */
function rank(i) {
  let x = (i + 0x9e3779b9) | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

function voxelKey(i, inv) {
  const outer = FOCUS > 0 && Math.hypot(pos[i * 3], pos[i * 3 + 2]) > FOCUS;
  const s = outer ? inv / FOCUS_GAIN : inv;
  // The bisection never goes below span/4096, so cell coordinates stay within
  // ±2^16. Offset to positive and pack three 17-bit fields plus the region
  // bit into one number: 2^52 < 2^53, so the key is an exact integer.
  const x = Math.floor(pos[i * 3] * s) + 65536;
  const y = Math.floor(pos[i * 3 + 1] * s) + 65536;
  const z = Math.floor(pos[i * 3 + 2] * s) + 65536;
  return ((outer ? 131072 : 0) + x) * 17179869184 + y * 131072 + z;
}

function countVoxels(indices, size) {
  const inv = 1 / size;
  const seen = new Set();
  for (const i of indices) seen.add(voxelKey(i, inv));
  return seen.size;
}

function decimate(indices, target) {
  let span = 0;
  for (let a = 0; a < 3; a++) {
    let mn = Infinity;
    let mx = -Infinity;
    for (const i of indices) {
      const v = pos[i * 3 + a];
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    span = Math.max(span, mx - mn);
  }
  if (indices.length <= target) return indices;
  let small = span / 4096; // too many voxels
  let large = span; // one voxel
  for (let iter = 0; iter < 32; iter++) {
    const mid = Math.sqrt(small * large);
    if (countVoxels(indices, mid) > target) small = mid;
    else large = mid;
    if (large / small < 1.002) break;
  }
  return voxelPick(indices, large);
}

/** Interleave the low 10 bits of three integers into a 30-bit Morton code. */
function morton3(x, y, z) {
  const spread = (v) => {
    v &= 0x3ff;
    v = (v | (v << 16)) & 0x030000ff;
    v = (v | (v << 8)) & 0x0300f00f;
    v = (v | (v << 4)) & 0x030c30c3;
    v = (v | (v << 2)) & 0x09249249;
    return v;
  };
  return spread(x) | (spread(y) << 1) | (spread(z) << 2);
}

function mortonSort(indices, bmin, bmax) {
  const q = (v, a) => Math.min(1023, Math.max(0, Math.floor(((v - bmin[a]) / (bmax[a] - bmin[a] || 1)) * 1024)));
  const codes = new Map();
  for (const i of indices) codes.set(i, morton3(q(pos[i * 3], 0), q(pos[i * 3 + 1], 1), q(pos[i * 3 + 2], 2)));
  return Uint32Array.from(indices).sort((a, b) => codes.get(a) - codes.get(b));
}

function boundsOf(indices) {
  const mn = [Infinity, Infinity, Infinity];
  const mx = [-Infinity, -Infinity, -Infinity];
  for (const i of indices) {
    for (let a = 0; a < 3; a++) {
      const v = pos[i * 3 + a];
      if (v < mn[a]) mn[a] = v;
      if (v > mx[a]) mx[a] = v;
    }
  }
  return [mn, mx];
}

/**
 * Two levels of detail: a coarser voxel pick of exactly half, then the rest.
 * Drawing the first half is then an even thinning, which is what the
 * governor does when frames are slow.
 */
function progressiveOrder(indices) {
  const half = Math.ceil(indices.length / 2);
  let lod0 = decimate(indices, half);
  if (lod0.length < half) {
    const inLod0 = new Set(lod0);
    const rest = indices.filter((i) => !inLod0.has(i));
    const need = half - lod0.length;
    const extra = [];
    for (let k = 0; k < need; k++) extra.push(rest[Math.floor((k * rest.length) / need)]);
    lod0 = Uint32Array.from([...lod0, ...extra]);
  }
  const inLod0 = new Set(lod0);
  const lod1 = indices.filter((i) => !inLod0.has(i));
  const [bmin, bmax] = boundsOf(indices);
  return Uint32Array.from([...mortonSort(lod0, bmin, bmax), ...mortonSort(lod1, bmin, bmax)]);
}

// -------------------------------------------------------------------- write

function encode(indices) {
  const count = indices.length;
  const [bmin, bmax] = boundsOf(indices);
  const buf = new ArrayBuffer(HEADER_BYTES + count * BYTES_PER_POINT);
  const dv = new DataView(buf);
  dv.setUint8(0, 0x44); // D
  dv.setUint8(1, 0x4d); // M
  dv.setUint8(2, 0x53); // S
  dv.setUint8(3, 0x31); // 1
  dv.setUint32(4, count, true);
  for (let a = 0; a < 3; a++) {
    dv.setFloat32(8 + a * 4, bmin[a], true);
    dv.setFloat32(20 + a * 4, bmax[a], true);
  }
  const flags = 1 | (lumSource === 'constant' ? 0 : 2);
  dv.setUint32(32, flags, true);
  const q = new Int16Array(buf, HEADER_BYTES, count * 3);
  const l = new Uint8Array(buf, HEADER_BYTES + count * 6, count);
  // Quantise against the float32 bounds actually stored, so decode is exact.
  const fmin = [dv.getFloat32(8, true), dv.getFloat32(12, true), dv.getFloat32(16, true)];
  const fmax = [dv.getFloat32(20, true), dv.getFloat32(24, true), dv.getFloat32(28, true)];
  indices.forEach((i, k) => {
    for (let a = 0; a < 3; a++) {
      const mid = (fmin[a] + fmax[a]) / 2;
      const half = (fmax[a] - fmin[a]) / 2 || 1;
      q[k * 3 + a] = Math.max(-32767, Math.min(32767, Math.round(((pos[i * 3 + a] - mid) / half) * 32767)));
    }
    l[k] = lum[i];
  });
  return { bytes: new Uint8Array(buf), bounds: { min: fmin, max: fmax }, count };
}

/** Largest point count whose file fits the raw byte budget. */
const fitCount = (budget) => Math.floor((budget - HEADER_BYTES) / BYTES_PER_POINT);

const results = {};
let pool = kept;
for (const tier of ['desktop', 'mobile']) {
  const target = Math.min(TARGET[tier], fitCount(BUDGET[tier]));
  // Mobile is decimated from the desktop pick, so both tiers are the same
  // object at two densities, never two different samplings.
  const picked = decimate(pool, target);
  const ordered = progressiveOrder(picked);
  const enc = encode(ordered);
  if (enc.bytes.length > BUDGET[tier]) fail(`${tier} file is ${enc.bytes.length} B, over the ${BUDGET[tier]} B budget.`);
  results[tier] = enc;
  pool = picked;
}

// The hash covers both files so a pair can never be mixed across builds.
const hash = createHash('sha256').update(results.desktop.bytes).update(results.mobile.bytes).digest('hex').slice(0, 8);

mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) {
  if (new RegExp(`^${ID}-[0-9a-f]{8}-(desktop|mobile)\\.bin$`).test(f)) unlinkSync(join(OUT_DIR, f));
}
const files = {};
for (const tier of ['desktop', 'mobile']) {
  const name = `${ID}-${hash}-${tier}.bin`;
  writeFileSync(join(OUT_DIR, name), results[tier].bytes);
  files[tier] = `/assets/scans/${name}`;
  console.log(`  ${tier.padEnd(10)} ${files[tier]}  ${results[tier].count.toLocaleString('en')} points, ${results[tier].bytes.length.toLocaleString('en')} B`);
}

// ------------------------------------------------------------ manifest block

const round = (v) => Math.round(v * 1000) / 1000;
const b = results.desktop.bounds;
const block = [
  `  /* build-scans:begin ${ID} — generated by scripts/build-scans.mjs, do not edit */`,
  `  files: { desktop: '${files.desktop}', mobile: '${files.mobile}' },`,
  `  pointCount: { source: ${N}, desktop: ${results.desktop.count}, mobile: ${results.mobile.count} },`,
  `  bounds: { min: [${b.min.map(round).join(', ')}], max: [${b.max.map(round).join(', ')}] },`,
  `  luminance: '${lumSource === 'constant' ? 'constant' : 'measured'}',`,
  `  /* build-scans:end ${ID} */`,
].join('\n');

if (existsSync(MANIFEST)) {
  const src = readFileSync(MANIFEST, 'utf8');
  const re = new RegExp(`[ \\t]*/\\* build-scans:begin ${ID}\\b[\\s\\S]*?/\\* build-scans:end ${ID} \\*/`);
  if (re.test(src)) {
    writeFileSync(MANIFEST, src.replace(re, block));
    console.log(`  manifest   ${MANIFEST} (${ID} block updated)`);
  } else {
    console.log(`\n  No "${ID}" block in ${MANIFEST}. Add an entry containing:\n\n${block}\n`);
  }
}

// ------------------------------------------------------------- preview (opt)

/**
 * --preview out.png renders the DESKTOP file as shipped (decoded from its
 * int16 grid) from the hero's resting angle, so orientation and density can
 * be judged without starting the site.
 */
if (typeof args.preview === 'string') {
  const { default: sharp } = await import('sharp');
  const W = 900;
  const H = 900;
  const img = new Uint8Array(W * H);
  const { bytes, bounds, count } = results.desktop;
  const q = new Int16Array(bytes.buffer, HEADER_BYTES, count * 3);
  const l = new Uint8Array(bytes.buffer, HEADER_BYTES + count * 6, count);
  const pitch = (-24 * Math.PI) / 180;
  const span = Math.max(...[0, 1, 2].map((a) => bounds.max[a] - bounds.min[a]));
  for (let k = 0; k < count; k++) {
    const p = [0, 1, 2].map((a) => (bounds.min[a] + bounds.max[a]) / 2 + (q[k * 3 + a] / 32767) * ((bounds.max[a] - bounds.min[a]) / 2));
    const y = p[1] - (bounds.min[1] + bounds.max[1]) / 2;
    const yy = y * Math.cos(pitch) - p[2] * Math.sin(pitch);
    const px = Math.round(W / 2 + (p[0] / span) * W * 0.85);
    const py = Math.round(H / 2 - (yy / span) * W * 0.85);
    if (px < 0 || py < 0 || px >= W || py >= H) continue;
    img[py * W + px] = Math.min(255, img[py * W + px] + 40 + l[k] * 0.6);
  }
  await sharp(Buffer.from(img), { raw: { width: W, height: H, channels: 1 } }).png().toFile(args.preview);
  console.log(`  preview    ${args.preview}`);
}
