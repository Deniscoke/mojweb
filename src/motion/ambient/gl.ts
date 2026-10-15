import { idle } from '../utils/env';

/**
 * GL — one WebGL2 context, held carefully
 * =======================================
 * The smallest wrapper that keeps the promises in ./README.md: a context
 * that refuses to exist on software or blocklisted GPUs, shader linking that
 * never stalls the main thread on a status query, a way to leave a still
 * image behind, and a destroy that really gives the context back.
 *
 * No library. Everything here is a few calls on the raw API, and every
 * shader arrives as a string literal: no eval, no blob: URLs, no workers.
 */

const ATTRIBUTES: WebGLContextAttributes = {
  alpha: true,
  premultipliedAlpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  preserveDrawingBuffer: false,
  // SwiftShader, blocklisted drivers and remote desktops return null here
  // instead of a context that renders at 4 fps. No scan beats a slow scan.
  failIfMajorPerformanceCaveat: true,
  powerPreference: 'low-power',
};

let live = 0;

/** Contexts created here that are neither lost nor destroyed. Read by tests and the harness. */
export const liveContexts = (): number => live;

export interface GLHooks {
  /** The browser took the context. The caller stops drawing and hides the canvas. */
  lost(): void;
  /** It came back empty. Everything must be rebuilt: programs, buffers, uniforms. */
  restored(): void;
}

export interface GL {
  readonly gl: WebGL2RenderingContext;
  readonly canvas: HTMLCanvasElement;
  /** Size the drawing buffer to CSS size × scale. */
  resize(cssWidth: number, cssHeight: number, scale: number): void;
  /** Compile and link without a synchronous status query in the same task. */
  program(vertex: string, fragment: string): Promise<WebGLProgram>;
  /**
   * Copy what was drawn IN THIS TASK into a 2D canvas, put that canvas where
   * the GL canvas was, and return it. Call right after the last draw: without
   * preserveDrawingBuffer the pixels are gone once the frame is presented.
   */
  snapshotTo2D(): HTMLCanvasElement;
  /** Lose the context on purpose. Idempotent. The canvas stays in the DOM. */
  destroy(): void;
}

export function createGL(canvas: HTMLCanvasElement, hooks: GLHooks): GL | null {
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', ATTRIBUTES);
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const ctx = gl;
  let counted = true;
  let destroyed = false;
  live++;

  const onLost = (event: Event) => {
    if (counted) live--;
    counted = false;
    if (destroyed) return;
    // Without preventDefault the browser never offers the context back.
    event.preventDefault();
    hooks.lost();
  };
  const onRestored = () => {
    if (destroyed) return;
    live++;
    counted = true;
    hooks.restored();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  return {
    gl: ctx,
    canvas,

    resize(cssWidth, cssHeight, scale) {
      const w = Math.round(cssWidth * scale);
      const h = Math.round(cssHeight * scale);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      ctx.viewport(0, 0, w, h);
    },

    program(vertex, fragment) {
      const program = ctx.createProgram();
      const attach = (type: GLenum, source: string) => {
        const shader = ctx.createShader(type)!;
        ctx.shaderSource(shader, source);
        ctx.compileShader(shader);
        ctx.attachShader(program, shader);
        // Only flagged: an attached shader lives until its program is deleted.
        ctx.deleteShader(shader);
      };
      attach(ctx.VERTEX_SHADER, vertex);
      attach(ctx.FRAGMENT_SHADER, fragment);
      ctx.linkProgram(program);

      // With KHR_parallel_shader_compile the driver compiles off-thread and
      // COMPLETION_STATUS is a cheap poll, so ask once per frame. Without it
      // (Safari), a status query blocks until the compile finishes — so it is
      // deferred to the next idle task, by which time the work is done.
      const parallel = ctx.getExtension('KHR_parallel_shader_compile');

      return new Promise<WebGLProgram>((resolve, reject) => {
        const settle = () => {
          // A lost context reports completion and a failed link, so losing
          // it mid-compile ends here too instead of polling forever.
          if (parallel && !ctx.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
            requestAnimationFrame(settle);
            return;
          }
          if (ctx.getProgramParameter(program, ctx.LINK_STATUS)) return resolve(program);
          reject(ctx.getProgramInfoLog(program));
          ctx.deleteProgram(program);
        };
        if (parallel) requestAnimationFrame(settle);
        else idle(settle, 500);
      });
    },

    snapshotTo2D() {
      const still = document.createElement('canvas');
      still.width = canvas.width;
      still.height = canvas.height;
      still.style.cssText = canvas.style.cssText;
      still.setAttribute('aria-hidden', 'true');
      still.getContext('2d')?.drawImage(canvas, 0, 0);
      canvas.replaceWith(still);
      return still;
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (counted) live--;
      counted = false;
      canvas.removeEventListener('webglcontextrestored', onRestored);
      // Browsers cap live contexts per page (and evict the oldest silently),
      // so dropping the reference is not enough. Give it back explicitly.
      ctx.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.width = canvas.height = 1;
    },
  };
}
