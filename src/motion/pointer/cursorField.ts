import { clamp, createLoop, hasFinePointer, prefersReducedMotion, renderScale } from '../utils/env';

/**
 * CURSOR FIELD (desktop enhancement)
 * =================================
 * A small mark that trails the pointer, answers a click with a ring, and then
 * coasts to a stop.
 *
 * The behaviour has three states, and the point of the whole module is the
 * relationship between them:
 *
 *   TRACKING  the mark follows the pointer, eased, quietly.
 *   IMPACT    a click throws a ring outward and shoves the mark, which then
 *             carries its own momentum and decelerates under friction.
 *   SETTLED   for a few seconds after the impact the trail is damped down, so
 *             moving the mouse right after a click reads as much quieter than
 *             normal. It fades back up on its own.
 *
 * It is decoration, so it gives up easily: no fine pointer, reduced motion, or
 * no 2D context, and the module simply never mounts. It draws nothing until
 * the pointer actually moves, and the loop stops itself once everything has
 * come to rest, so an idle tab costs zero frames.
 */

/** How hard a click shoves the mark, in px/frame. */
const IMPACT_IMPULSE = 5.2;
/** Velocity retained per frame while coasting. */
const FRICTION = 0.86;
/** How long the trail stays damped after a click. */
const CALM_MS = 2600;
/** Below this the mark is at rest and the loop may stop. */
const REST = 0.05;

interface Ring {
  x: number;
  y: number;
  /** 0 → 1, drives radius and fade together. */
  life: number;
}

export function initCursorField(): () => void {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-field';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  document.body.appendChild(canvas);

  let dpr = renderScale();
  let w = 0;
  let h = 0;

  const resize = () => {
    dpr = renderScale();
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  // Pointer target, the eased mark, and the mark's own velocity.
  let tx = -100;
  let ty = -100;
  let x = -100;
  let y = -100;
  let vx = 0;
  let vy = 0;
  let seen = false;
  let calmUntil = 0;
  const rings: Ring[] = [];

  /** 1 = normal, 0 = fully damped. Eases back up over CALM_MS after a click. */
  const calmness = (now: number) => {
    if (now >= calmUntil) return 1;
    const t = 1 - (calmUntil - now) / CALM_MS;
    return 0.32 + 0.68 * t * t; // quiet at first, normal again by the end
  };

  const accent = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--c-signal').trim() || '#ff4a1c';
  let signal = accent();

  const loop = createLoop((dt, now) => {
    ctx.clearRect(0, 0, w, h);

    const step = clamp(dt / 16.7, 0.5, 2);
    const calm = calmness(now);

    // Spring toward the pointer, then coast: the click impulse lives in the
    // velocity, so the mark overshoots and decelerates instead of snapping.
    vx += (tx - x) * 0.12 * step;
    vy += (ty - y) * 0.12 * step;
    vx *= FRICTION;
    vy *= FRICTION;
    x += vx * step;
    y += vy * step;

    const speed = Math.hypot(vx, vy);

    if (seen) {
      // The dot is constant; the halo is what reacts, and it is what the calm
      // period suppresses.
      const halo = (6 + Math.min(speed * 2.2, 14)) * calm;
      if (halo > 0.5) {
        ctx.beginPath();
        ctx.arc(x, y, halo, 0, Math.PI * 2);
        ctx.fillStyle = signal;
        ctx.globalAlpha = 0.1 * calm;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = signal;
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }

    for (let i = rings.length - 1; i >= 0; i--) {
      const ring = rings[i]!;
      ring.life += (dt / 620) * 1;
      if (ring.life >= 1) {
        rings.splice(i, 1);
        continue;
      }
      const ease = 1 - (1 - ring.life) ** 3; // fast out, slow stop
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, 8 + ease * 46, 0, Math.PI * 2);
      ctx.strokeStyle = signal;
      ctx.globalAlpha = (1 - ring.life) * 0.5;
      ctx.lineWidth = 1.5 * (1 - ring.life) + 0.4;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Nothing moving and nothing to draw: stop until the pointer returns.
    const atRest = speed < REST && Math.hypot(tx - x, ty - y) < REST;
    if (atRest && rings.length === 0 && now >= calmUntil) return false;
    return true;
  });

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX;
    ty = e.clientY;
    if (!seen) {
      seen = true;
      x = tx;
      y = ty;
    }
    loop.start();
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    rings.push({ x: e.clientX, y: e.clientY, life: 0 });

    // Shove the mark away from the click point, or straight down if the click
    // landed exactly on it, so there is always a visible coast.
    const dx = x - e.clientX;
    const dy = y - e.clientY;
    const d = Math.hypot(dx, dy) || 1;
    vx += (dx / d) * IMPACT_IMPULSE;
    vy += (dy / d) * IMPACT_IMPULSE || IMPACT_IMPULSE;

    calmUntil = performance.now() + CALM_MS;
    loop.start();
  };

  const onLeave = () => {
    tx = -100;
    ty = -100;
  };

  const onThemeOrResize = () => {
    resize();
    signal = accent();
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  window.addEventListener('resize', onThemeOrResize);

  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('resize', onThemeOrResize);
    loop.destroy();
    canvas.remove();
  };
}
