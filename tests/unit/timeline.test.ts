import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blendLayout, computeAnchors, follow, layoutFor, resolve, retarget, type SceneEntry } from '../../src/motion/scene/timeline.ts';

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
    assert.deepEqual(layoutFor(side, 991), { cx: 0, scale: 0.9, dim: 0.5 });
  }
  assert.equal(layoutFor('right', 1440).cx, 0.5);
  assert.equal(layoutFor('left', 1440).cx, -0.5);
  assert.deepEqual(layoutFor('full', 400), { cx: 0, scale: 1, dim: 0.6 });
});

test('blendLayout eases placement across the whole transition', () => {
  const a = { cx: 0.62, scale: 0.34, dim: 0 };
  const b = { cx: 0, scale: 0.92, dim: 0.35 };
  assert.deepEqual(blendLayout(a, b, 0), a);
  assert.deepEqual(blendLayout(a, b, 1), b);
  const mid = blendLayout(a, b, 0.5);
  assert.ok(Math.abs(mid.cx - 0.31) < 1e-9 && Math.abs(mid.scale - 0.63) < 1e-9);
  const early = blendLayout(a, b, 0.1);
  assert.ok(early.cx < 0.62 && early.cx > 0.55, `no jump early: ${early.cx}`);
});

test('blendLayout blends the dot size only when a side sets one', () => {
  const a = { cx: 0, scale: 1, dim: 0 };
  assert.equal(blendLayout(a, a, 0.5).dot, undefined);
  assert.equal(blendLayout({ ...a, dot: 0.5 }, a, 1).dot, 1);
  assert.equal(blendLayout({ ...a, dot: 0.5 }, a, 0).dot, 0.5);
});

test('follow finishes the shown morph before switching to the next pair', () => {
  const shown = { from: 'a', to: 'b', t: 0.4, side: 'right' as const };
  const step = follow(shown, { from: 'b', to: 'c', t: 0.1, side: 'right' }, 0.2);
  assert.equal(step.flight, false);
  assert.deepEqual([step.pose.from, step.pose.to], ['a', 'b']);
  assert.ok(Math.abs(step.pose.t - 0.52) < 1e-9);
  const done = follow({ ...shown, t: 0.9995 }, { from: 'b', to: 'c', t: 0.1, side: 'right' }, 0.2);
  assert.deepEqual([done.pose.from, done.pose.to, done.pose.t], ['b', 'c', 0]);
});

test('follow unwinds backwards before switching to the previous pair', () => {
  const shown = { from: 'b', to: 'c', t: 0.3, side: 'right' as const };
  const step = follow(shown, { from: 'a', to: 'b', t: 0.9, side: 'right' }, 0.5);
  assert.deepEqual([step.pose.from, step.pose.to], ['b', 'c']);
  assert.ok(Math.abs(step.pose.t - 0.15) < 1e-9);
  const done = follow({ ...shown, t: 0.0005 }, { from: 'a', to: 'b', t: 0.9, side: 'right' }, 0.5);
  assert.deepEqual([done.pose.from, done.pose.to, done.pose.t], ['a', 'b', 1]);
});

test('follow eases within a pair and flies past non-neighbours', () => {
  const shown = { from: 'a', to: 'b', t: 0.2, side: 'right' as const };
  const same = follow(shown, { from: 'a', to: 'b', t: 0.6, side: 'right' }, 0.5);
  assert.ok(Math.abs(same.pose.t - 0.4) < 1e-9);
  const far = follow(shown, { from: 'x', to: 'y', t: 0.7, side: 'left' }, 0.5);
  assert.equal(far.flight, true);
  assert.deepEqual([far.pose.from, far.pose.to, far.pose.t], ['a', 'y', 0]);
});
