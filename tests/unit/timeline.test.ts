import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeAnchors, layoutFor, resolve, retarget, type SceneEntry } from '../../src/motion/scene/timeline.ts';

const VH = 800;
// Sections 1000 px tall, stacked: centres at 500, 1500, 2500 → anchors at 100, 1100, 2100.
const entries: SceneEntry[] = [
  { id: 'name', top: 0, height: 1000, side: 'right' },
  { id: 'credo', top: 1000, height: 1000, side: 'center' },
  { id: 'scan', top: 2000, height: 1000, side: 'right' },
];

test('anchors merge consecutive equal ids', () => {
  const a = computeAnchors(
    [
      { id: 'drift', top: 0, height: 1000, side: 'left' },
      { id: 'drift', top: 1000, height: 1000, side: 'left' },
      { id: 'drift', top: 2000, height: 1000, side: 'left' },
    ],
    VH,
  );
  assert.equal(a.length, 1);
  assert.equal(a[0].id, 'drift');
});

test('resolve holds at anchor', () => {
  const a = computeAnchors(entries, VH);
  const p = resolve(a, a[1].at);
  assert.deepEqual([p.from, p.to, p.t], ['credo', 'credo', 0]);
});

test('resolve interpolates between anchors', () => {
  const a = computeAnchors(entries, VH);
  const start = a[0].at + a[0].hold;
  const end = a[1].at - a[1].hold;
  const p = resolve(a, (start + end) / 2);
  assert.equal(p.from, 'name');
  assert.equal(p.to, 'credo');
  assert.ok(Math.abs(p.t - 0.5) < 1e-6);
});

test('resolve clamps before first and after last', () => {
  const a = computeAnchors(entries, VH);
  const before = resolve(a, -500);
  const after = resolve(a, 99999);
  assert.deepEqual([before.from, before.to, before.t], ['name', 'name', 0]);
  assert.deepEqual([after.from, after.to, after.t], ['scan', 'scan', 0]);
});

test('retarget keeps adjacent transitions', () => {
  const shown = { from: 'name', to: 'credo', t: 0.9, side: 'center' as const };
  const target = { from: 'credo', to: 'scan', t: 0.1, side: 'center' as const };
  assert.deepEqual(retarget(shown, target), target);
});

test('retarget skips intermediate states', () => {
  const shown = { from: 'name', to: 'credo', t: 0.2, side: 'right' as const };
  const target = { from: 'work:a', to: 'lab', t: 0.7, side: 'right' as const };
  assert.deepEqual(retarget(shown, target), { from: 'name', to: 'lab', t: 0, side: 'right' });
});

test('layoutFor collapses to center below 992px', () => {
  for (const side of ['left', 'right', 'center'] as const) {
    assert.deepEqual(layoutFor(side, 991), { cx: 0, scale: 0.9, dim: 0.55 });
  }
  assert.equal(layoutFor('right', 1440).cx, 0.5);
  assert.equal(layoutFor('left', 1440).cx, -0.5);
});
