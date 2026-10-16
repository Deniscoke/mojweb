import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitCount, rng, sampleMask, scatter } from '../../src/motion/scene/points.ts';

test('rng is deterministic', () => {
  const a = rng(7);
  const b = rng(7);
  for (let i = 0; i < 5; i++) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1);
  }
});

test('scatter has n*3 values in range', () => {
  const s = scatter(1000, 1);
  assert.equal(s.length, 3000);
  for (let i = 0; i < 1000; i++) {
    assert.ok(Math.abs(s[i * 3]) <= 1);
    assert.ok(Math.abs(s[i * 3 + 1]) <= 1);
  }
});

test('fitCount repeats and subsamples', () => {
  const src = scatter(100, 3);
  const has = (x: number, y: number, z: number) => {
    for (let i = 0; i < 100; i++) if (src[i * 3] === x && src[i * 3 + 1] === y && src[i * 3 + 2] === z) return true;
    return false;
  };
  for (const n of [250, 40]) {
    const out = fitCount(src, n, 5);
    assert.equal(out.length, n * 3);
    for (let i = 0; i < n; i++) assert.ok(has(out[i * 3], out[i * 3 + 1], out[i * 3 + 2]));
  }
});

test('sampleMask only picks opaque pixels', () => {
  const w = 10;
  const h = 10;
  const alpha = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) alpha[y * w] = 255;
  const out = sampleMask(alpha, w, h, 50, 9);
  assert.equal(out.length, 150);
  for (let i = 0; i < 50; i++) assert.ok(Math.abs(out[i * 3] + 1) <= 0.21, `x=${out[i * 3]}`);
});

test('sampleMask on empty mask returns scatter', () => {
  const out = sampleMask(new Uint8ClampedArray(100), 10, 10, 30, 4);
  assert.deepEqual(out, scatter(30, 4));
});
