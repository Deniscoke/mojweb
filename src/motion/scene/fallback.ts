/**
 * The living scene without WebGL: weak devices, calm, or a GPU that said no.
 * Same Painter contract as the morph, drawn in 2D: no travel, no breathing,
 * the outgoing shape fades out while the incoming one fades in. The loop in
 * scene.ts only runs while that crossfade moves, so a still page costs nothing.
 */
import type { MorphUniforms } from './morph.ts';
import type { Painter } from './scene.ts';

export function createFallback(canvas: HTMLCanvasElement): Painter {
  const ctx = canvas.getContext('2d');
  let from: Float32Array = new Float32Array(0);
  let to: Float32Array = new Float32Array(0);

  const plot = (c: CanvasRenderingContext2D, pts: Float32Array, u: MorphUniforms, alpha: number) => {
    if (alpha <= 0.01) return;
    const w = canvas.width;
    const h = canvas.height;
    const asp = w / Math.max(h, 1);
    const s = Math.max(1, u.size * 0.7);
    c.globalAlpha = alpha * 0.6 * (1 - u.dim);
    for (let i = 0; i < pts.length; i += 3) {
      const x = (u.cx * asp + pts[i] * u.scale) / asp;
      const y = (u.cy ?? 0) + pts[i + 1] * u.scale;
      c.fillRect(((x + 1) / 2) * w, ((1 - y) / 2) * h, s, s);
    }
  };

  return {
    setShapes(a, b) {
      from = a;
      to = b;
    },
    draw(u) {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${u.color.map((v) => Math.round(v * 255)).join(',')})`;
      plot(ctx, from, u, 1 - u.progress);
      plot(ctx, to, u, u.progress);
      ctx.globalAlpha = 1;
    },
    dispose() {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
