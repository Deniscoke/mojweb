/**
 * The living scene's renderer: n points, two shapes, one draw call.
 *
 * Each point has a position in the shape it leaves (`aFrom`) and in the shape
 * it is heading for (`aTo`); the vertex shader mixes them by `progress`, each
 * point a little later than the last (its seed), with a lift off the line
 * while it travels. The CPU only uploads a new pair when the scroll crosses
 * into another section. Grain is a hash in the fragment shader, so the scene
 * needs no separate overlay.
 */
import type { GL } from '../ambient/gl';
import { rng } from './points.ts';

export interface MorphUniforms {
  /** 0 = the `from` shape, 1 = the `to` shape. */
  progress: number;
  /** Seconds, for the breathing and the travel noise. */
  time: number;
  /** Scroll speed, smoothed, 0 … 1: travelling points scatter wider when it is high. */
  velocity: number;
  /** Pointer in clip space (x, y) and whether it is active (1) or not (0). */
  pointer: [number, number, number];
  /** From `layoutFor`. */
  cx: number;
  scale: number;
  dim: number;
  /** Ink colour, 0 … 1. */
  color: [number, number, number];
  /** Point size in device px. */
  size: number;
}

export interface Morph {
  setShapes(from: Float32Array, to: Float32Array): void;
  draw(u: MorphUniforms): void;
  dispose(): void;
}

/**
 * U[0] progress, time, velocity, size
 * U[1] pointer x, y, active, aspect
 * U[2] cx, scale, dim, —
 * U[3] colour rgb, —
 */
const VERTEX = `#version 300 es
layout(location=0) in vec3 F;
layout(location=1) in vec3 T;
layout(location=2) in float S;
uniform vec4 U[4];
out float A;
void main(){
float t=U[0].y,asp=U[1].w;
float lt=smoothstep(0.,1.,clamp(U[0].x*1.4-S*.4,0.,1.));
vec3 p=mix(F,T,lt);
float fl=sin(lt*3.14159)*(.12+.5*U[0].z);
p.xy+=fl*vec2(sin(S*91.+t*.6),cos(S*57.+t*.5));
p.xy+=.006*vec2(sin(t*.4+S*12.),cos(t*.3+S*7.));
vec2 c=vec2(U[2].x*asp,0.)+p.xy*U[2].y;
vec2 d=c-vec2(U[1].x*asp,U[1].y);
c+=U[1].z*normalize(d+1e-5)*.08*smoothstep(.18,0.,length(d));
gl_Position=vec4(c.x/asp,c.y,0.,1.);
gl_PointSize=max(U[0].w*(1.+p.z*.6),1.);
A=(.3+.35*fract(S*13.))*(1.-U[2].z);
}`;

const FRAGMENT = `#version 300 es
precision mediump float;
uniform highp vec4 U[4];
in float A;
out vec4 o;
void main(){
vec2 d=gl_PointCoord*2.-1.;
if(dot(d,d)>1.)discard;
float g=fract(sin(dot(gl_FragCoord.xy+U[0].y,vec2(12.9898,78.233)))*43758.5453);
float a=A*(.96+.08*g);
o=vec4(U[3].rgb*a,a);
}`;

export async function createMorph(ctx: GL, n: number): Promise<Morph> {
  const gl = ctx.gl;
  const program = await ctx.program(VERTEX, FRAGMENT);
  const loc = gl.getUniformLocation(program, 'U');
  const U = new Float32Array(16);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buffer = (index: number, size: number, data: Float32Array, usage: number) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
    return b;
  };
  const empty = new Float32Array(n * 3);
  const from = buffer(0, 3, empty, gl.DYNAMIC_DRAW);
  const to = buffer(1, 3, empty, gl.DYNAMIC_DRAW);
  const r = rng(1);
  const seeds = buffer(2, 1, Float32Array.from({ length: n }, r), gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  return {
    setShapes(a, b) {
      gl.bindBuffer(gl.ARRAY_BUFFER, from);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, a);
      gl.bindBuffer(gl.ARRAY_BUFFER, to);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, b);
    },
    draw(u) {
      const aspect = ctx.canvas.width / Math.max(ctx.canvas.height, 1);
      U.set([u.progress, u.time, u.velocity, u.size, ...u.pointer, aspect, u.cx, u.scale, u.dim, 0, ...u.color, 0]);
      gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform4fv(loc, U);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.POINTS, 0, n);
    },
    dispose() {
      gl.deleteBuffer(from);
      gl.deleteBuffer(to);
      gl.deleteBuffer(seeds);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}
