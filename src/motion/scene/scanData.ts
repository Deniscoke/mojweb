/**
 * The packed scan format written by `scripts/build-scans.mjs`:
 *
 *   0   u32  magic "DMS1"
 *   4   u32  point count
 *   8   f32×3 bounds low,  20  f32×3 bounds high
 *   32  u32  flags (bit 0: progressive order)
 *   36  int16×3 per point, normalised to the bounds, then one luminance byte per point
 *
 * Read by the living scene. Import-free so `npm run test:unit` can load it.
 */

const MAGIC = 0x31534d44; // "DMS1", little-endian
const HEADER = 36;

export interface ScanHeader {
  count: number;
  lo: [number, number, number];
  hi: [number, number, number];
  progressive: boolean;
}

/** The header, or null when the magic is wrong or the body is shorter than the count says. */
export function parseScanHeader(buf: ArrayBuffer): ScanHeader | null {
  if (buf.byteLength < HEADER) return null;
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== MAGIC) return null;
  const count = dv.getUint32(4, true);
  if (buf.byteLength < HEADER + count * 7) return null;
  const f = (at: number) => dv.getFloat32(at, true);
  return {
    count,
    lo: [f(8), f(12), f(16)],
    hi: [f(20), f(24), f(28)],
    progressive: (dv.getUint32(32, true) & 1) === 1,
  };
}

/**
 * Positions as n × (x, y, z) floats, centred on the bounds and divided by
 * the largest half-extent, so the whole object fits the scene's [-1, 1] box.
 */
export function scanPositions(buf: ArrayBuffer): Float32Array | null {
  const h = parseScanHeader(buf);
  if (!h) return null;
  // The int16s are already relative to the bounds' centre: q × half-extent.
  const half = h.lo.map((v, i) => (h.hi[i] - v) / 2);
  const inv = 1 / Math.max(half[0], half[1], half[2], 1e-6);
  const q = new Int16Array(buf, HEADER, h.count * 3);
  const out = new Float32Array(h.count * 3);
  for (let i = 0; i < out.length; i++) out[i] = Math.max(q[i] / 32767, -1) * half[i % 3] * inv;
  return out;
}
