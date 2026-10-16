import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathsShape, textShape, type Raster } from '../../src/motion/scene/shapes.ts';
import { scatter } from '../../src/motion/scene/points.ts';

/** A raster that ignores the drawing and returns a fully opaque (or empty) mask. */
const fake =
  (opaque: boolean): Raster =>
  (_draw, w = 64, h = 32) => ({ alpha: new Uint8ClampedArray(w * h).fill(opaque ? 255 : 0), w, h });

test('textShape uses raster alpha', () => {
  const out = textShape('Denis\nMitrović', '600 100px sans-serif', 200, 3, fake(true));
  assert.equal(out.length, 600);
  for (let i = 0; i < 200; i++) {
    assert.ok(Math.abs(out[i * 3]) <= 1);
    assert.ok(Math.abs(out[i * 3 + 1]) <= 1);
  }
});

test('textShape falls back to scatter on empty mask', () => {
  assert.deepEqual(textShape('Denis', '600 100px sans-serif', 50, 8, fake(false)), scatter(50, 8));
});

test('pathsShape returns exactly n points', () => {
  assert.equal(pathsShape(['M0 0L100 100', 'M0 100L100 0'], 321, 2, fake(true)).length, 963);
});
