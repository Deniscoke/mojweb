import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseScanHeader, scanPositions } from '../../src/motion/scene/scanData.ts';

const MAGIC = 0x31534d44;

/** Three points in bounds lo (-2, 0, -1) … hi (2, 4, 1), then a luminance byte each. */
function sample(opts: { magic?: number; truncate?: number } = {}): ArrayBuffer {
  const count = 3;
  const buf = new ArrayBuffer(36 + count * 7 - (opts.truncate ?? 0));
  const dv = new DataView(buf);
  dv.setUint32(0, opts.magic ?? MAGIC, true);
  dv.setUint32(4, count, true);
  [-2, 0, -1, 2, 4, 1].forEach((v, i) => dv.setFloat32(8 + i * 4, v, true));
  dv.setUint32(32, 1, true);
  if (opts.truncate) return buf;
  const q = [32767, 0, 0, 0, -32767, 0, 0, 0, 32767];
  q.forEach((v, i) => dv.setInt16(36 + i * 2, v, true));
  return buf;
}

test('parses header', () => {
  const h = parseScanHeader(sample());
  assert.deepEqual(h, { count: 3, lo: [-2, 0, -1], hi: [2, 4, 1], progressive: true });
});

test('rejects wrong magic', () => {
  assert.equal(parseScanHeader(sample({ magic: 1 })), null);
});

test('rejects truncated body', () => {
  assert.equal(parseScanHeader(sample({ truncate: 4 })), null);
  assert.equal(scanPositions(sample({ truncate: 4 })), null);
});

test('decodes int16 positions to normalised floats', () => {
  const p = scanPositions(sample())!;
  const expected = [1, 0, 0, 0, -1, 0, 0, 0, 0.5];
  assert.equal(p.length, 9);
  expected.forEach((v, i) => assert.ok(Math.abs(p[i] - v) < 1e-3, `${i}: ${p[i]} != ${v}`));
});
