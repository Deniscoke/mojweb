import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGate, seen } from '../../src/motion/kinetic/pick.ts';

test('seen: anything that reached the screen already counts as seen', () => {
  const vh = 800;
  // above the screen, on it, just below it, far below it
  const rects = [
    { top: -400, bottom: -100 },
    { top: 300, bottom: 400 },
    { top: 801, bottom: 900 },
    { top: 3000, bottom: 3100 },
  ];
  assert.deepEqual(seen(rects, vh), [true, true, false, false]);
});

test('gate: one gather at a time, the rest go straight through', () => {
  const gate = createGate();
  assert.equal(gate.tryStart(), true);
  assert.equal(gate.tryStart(), false);
  gate.end();
  assert.equal(gate.tryStart(), true);
});
