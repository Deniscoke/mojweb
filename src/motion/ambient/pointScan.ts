import { clamp, createLoop, hasFinePointer, renderScale } from '../utils/env';
import { createGL, type GL } from './gl';

/**
 * POINT SCAN — a real capture, drawn as light
 * ===========================================
 * Draws one of Denis's own point-cloud captures (src/data/scans.ts) as soft
 * bone-coloured points: one program, one buffer, one draw call. It turns
 * only when something drives it — scroll, the pointer, a drag, or the
 * caller's setters — and the loop stops as soon as nothing is changing.
 * The one exception is the arrival: a single scan plane sweeps up through
 * the object once, in under two seconds, and never again.
 *
 * This module does not decide WHEN it runs. ./mount.ts does that (reveal,
 * load, idle, visible, context budget, calm), then imports this chunk. Call
 * `mount` from here directly only in the harness.
 */

export type ScanMode = 'hero' | 'poster';

export interface ScanInputs {
  /** Mouse looks around the object a few degrees. Ignored on touch. */
  pointer?: boolean;
  /**
   * Scroll turns the turntable as an element leaves the viewport (`true` =
   * the host): 0 → 120° with a fine pointer, 0 → 90° on touch, plus up to 8%
   * dolly with a fine pointer only.
   */
  scroll?: boolean | Element;
  /** Horizontal touch drag turns the object (poster). Vertical stays scrolling. */
  drag?: boolean;
}

export interface ScanOptions {
  /** One URL, or both tiers; the desktop file is never fetched without a fine pointer. */
  src: string | { desktop: string; mobile: string };
  mode: ScanMode;
  /** Play the one-off arrival sweep. Ignored when `still`. */
  sweep?: boolean;
  /** Up to three elements whose boxes dim the points behind them by 80%. */
  masks?: Element[];
  /** Built-in input mappings. All off by default; the setters always work. */
  inputs?: ScanInputs;
  /** The box the object stands in: its centre, its width, and its bottom as the ground. */
  anchor?: Element;
  /** Calm: draw one frame, keep it as a 2D image, give the context back. */
  still?: boolean;
  /** The first frame is on screen (live or still). Reveal the caption here. */
  onReady?: () => void;
  /** Nothing will be drawn: no context, no data, or a failed link. */
  onFail?: () => void;
  /** The GL context is gone for good (still frame, freeze, failure or teardown). */
  onRelease?: () => void;
}

export interface ScanHandle {
  /** Turntable angle in degrees, added to whatever the built-in inputs set. */
  setYaw(deg: number): void;
  /** Camera elevation offset in degrees from the mode's resting angle (±15). */
  setPitch(deg: number): void;
  /** Move closer by a fraction of the distance (0 – 0.15). */
  setDolly(amount: number): void;
  teardown(): void;
}

/** What the scheduler sees in addition to the public handle. */
export interface ScanEngine extends ScanHandle {
  /** Keep the current frame as a still image and release the context. */
  freeze(): void;
  /** Stop drawing (page transitions); resumes on false and catches up. */
  pause(paused: boolean): void;
}

// --------------------------------------------------------------- tuning

interface ModeSpec {
  /** Default placement as fractions of the host: centre x, width, ground y. */
  place: [number, number, number];
  /** Resting camera elevation, degrees. */
  pitch: number;
  /** Pointer look range, degrees: yaw, pitch. */
  look: [number, number];
}

const MODES: Record<ScanMode, ModeSpec> = {
  // Without an anchor: about columns 7–11 of the 12-column hero, standing at
  // half its height (the site passes an anchor; this is for the harness).
  hero: { place: [0.71, 0.37, 0.5], pitch: 21, look: [6, 3] },
  poster: { place: [0.5, 0.7, 0.66], pitch: 24, look: [15, 6] },
};

/**
 * A host shorter than this is the mobile hero's stage band (11rem): the
 * object stands centred in it, as wide as the band's height allows. Ground
 * disc to roof, the scan is about half as tall as it is wide.
 */
const BAND_MAX_PX = 260;
const BAND: ModeSpec['place'] = [0.5, 0.72, 0.55];

// Per-point alpha cap [touch, fine]. The object now stands clear of every
// line of text (and the mask rects keep 20% of this behind any it nears), so
// the cap is set for the object to read as a lit thing, not as a smudge.
const ALPHA = [0.4, 0.44];
/**
 * Scroll turntable, degrees over the hero's whole exit [touch, fine]. On a
 * desk the object is gone a little past half the exit, so a third of a turn
 * shows about 65° of it; on a phone the stage crosses the whole screen, so a
 * quarter turn shows almost all of itself. Either way a full face of the
 * building comes round under the thumb.
 */
const TURN = [90, 120];
const SWEEP_MS = 1800;
const FADE_MS = 900;
const DISTANCE = 4.5; // camera distance in object radii: gentle perspective
const EASE_MS = 90; // time constant of every eased value
const MAGIC = 0x31534d44; // "DMS1", little-endian
const HEADER = 36;

// ------------------------------------------------------------- shaders

/**
 * Every uniform travels in one vec4 array, uploaded with one call per frame:
 *
 *   U[0]  xyz bounds centre / radius        w  height / radius
 *   U[1]  xyz bounds half-size / radius     w  sweep plane (0 base → 1 top)
 *   U[2]  cos yaw, sin yaw, cos pitch, sin pitch
 *   U[3]  ground centre in clip space (xy), clip units per radius (zw)
 *   U[4]  distance at rest, distance now, point size (device px), alpha cap
 *   U[5–7] mask rects in device px: x0, y0, x1, y1 (gl_FragCoord space)
 *   U[8]  rgb: --c-bone
 *
 * The vertex shader turns the object (yaw), raises the camera (pitch),
 * projects with perspective and sizes each point by its distance. Depth fog
 * dims the far side; the sweep reveals points below the plane and lights a
 * thin band at it.
 */
const VERTEX = `#version 300 es
layout(location=0) in vec3 P;
layout(location=1) in float L;
uniform vec4 U[9];
out float A;
void main(){
vec3 m=U[0].xyz+P*U[1].xyz;
float h=m.y/U[0].w;
vec4 r=U[2];
vec3 q=vec3(m.x*r.x+m.z*r.y,m.y,m.z*r.x-m.x*r.y);
q=vec3(q.x,q.y*r.z-q.z*r.w,q.y*r.w+q.z*r.z);
float k=U[4].x/(U[4].y-q.z);
gl_Position=vec4(U[3].xy+q.xy*k*U[3].zw,0.,1.);
float s=U[1].w;
float band=exp(-pow((h-s)*18.,2.));
float fog=mix(.3,1.,smoothstep(-1.,.9,q.z));
A=fog*(U[4].w*mix(.3,1.,smoothstep(.06,.8,L))*(1.-smoothstep(s-.01,s+.01,h))+.45*band);
gl_PointSize=clamp(U[4].z*k*(1.+.6*band),1.,48.);
}`;

/**
 * Gaussian falloff, premultiplied (blend ONE, ONE_MINUS_SRC_ALPHA). Inside a
 * mask rect, feathered over 14 device px, a point keeps 20% of its alpha, so
 * text over the scan never loses contrast.
 */
const FRAGMENT = `#version 300 es
precision mediump float;
uniform highp vec4 U[9];
in float A;
out vec4 o;
void main(){
vec2 d=gl_PointCoord*2.-1.;
float r=dot(d,d);
if(r>1.)discard;
float a=A*exp(-3.2*r);
for(int i=5;i<8;i++){
vec2 e=min(gl_FragCoord.xy-U[i].xy,U[i].zw-gl_FragCoord.xy);
a*=1.-.8*smoothstep(0.,14.,min(e.x,e.y));
}
o=vec4(U[8].rgb*a,a);
}`;

// -------------------------------------------------------------- engine

export function mount(host: HTMLElement, opts: ScanOptions): ScanEngine {
  const fine = hasFinePointer();
  const mode = MODES[opts.mode];
  const url = typeof opts.src === 'string' ? opts.src : fine ? opts.src.desktop : opts.src.mobile;
  const scale = renderScale(fine ? 1.5 : 1.25);
  const still = !!opts.still;

  let canvas: HTMLCanvasElement | null = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0';
  let stillCanvas: HTMLCanvasElement | null = null;

  let ctx: GL | null = null;
  let program: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let loc: WebGLUniformLocation | null = null;
  const U = new Float32Array(36);
  U.set(boneColour(host), 32);

  let count = 0;
  let drawCount = 0;
  let progressive = false;

  let dead = false;
  let ready = false;
  let paused = false;
  let lost = false;
  let released = false;
  let layoutDirty = true;
  const abort = new AbortController();
  const cleanups: Array<() => void> = [];

  // Driven values. `target` holds what the setters and the pointer asked
  // for, and `now` eases towards it. Scroll and drag are `parts`, applied
  // directly: they already move continuously with the page or the finger,
  // and easing them would make the scan trail the compositor-driven floor.
  const target = { yaw: 0, pitch: 0, dolly: 0, lookYaw: 0, lookPitch: 0 };
  const now = { ...target };
  const parts = { scrollYaw: 0, scrollDolly: 0, dragYaw: 0 };
  // When the sweep started: 0 = on the next frame; -Infinity = never (already over).
  let sweepStart = opts.sweep && !still ? 0 : -Infinity;

  // ---------------------------------------------------------- lifecycle

  const release = () => {
    if (released) return;
    released = true;
    ctx?.destroy();
    ctx = null;
    opts.onRelease?.();
  };

  const fail = () => {
    if (dead) return;
    teardown();
    opts.onFail?.();
  };

  function teardown() {
    if (dead) return;
    dead = true;
    abort.abort();
    loop.destroy();
    cleanups.forEach((fn) => fn());
    release();
    canvas?.remove();
    stillCanvas?.remove();
    canvas = stillCanvas = null;
  }

  const loop = createLoop((dt, t) => {
    if (dead || paused || lost || !program) return false;
    const k = 1 - Math.exp(-dt / EASE_MS);
    let moving = false;
    for (const key of ['yaw', 'pitch', 'dolly', 'lookYaw', 'lookPitch'] as const) {
      const d = target[key] - now[key];
      if (Math.abs(d) > (key === 'dolly' ? 1e-4 : 0.01)) {
        now[key] += d * k;
        moving = true;
      } else now[key] = target[key];
    }
    if (sweepStart === 0) sweepStart = t;
    const sweeping = t - sweepStart < SWEEP_MS;
    draw(sweeping ? (t - sweepStart) / SWEEP_MS : 2);
    if (!ready) firstFrame();
    if (still) {
      freeze();
      return false;
    }
    governor(t);
    return moving || sweeping;
  });

  const kick = () => {
    if (!paused && !dead) loop.start();
  };

  function firstFrame() {
    ready = true;
    if (!canvas) return;
    canvas.style.transition = still ? '' : `opacity ${FADE_MS}ms var(--e-out)`;
    canvas.style.opacity = '1';
    opts.onReady?.();
  }

  /** Snapshot in the same task as the last draw, then give the context back. */
  function freeze() {
    if (!ctx || !canvas || dead || released) return;
    if (ready && !lost) {
      if (!still) draw(2);
      stillCanvas = ctx.snapshotTo2D();
      // Pin the still to its pixel size so a later resize cannot stretch it.
      stillCanvas.style.width = `${stillCanvas.width / scale}px`;
      stillCanvas.style.height = `${stillCanvas.height / scale}px`;
      stillCanvas.style.transition = '';
      canvas = null;
    }
    loop.stop();
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
    release();
  }

  // ------------------------------------------------------------- GL

  ctx = createGL(canvas, {
    lost() {
      lost = true;
      loop.stop();
      if (canvas) canvas.style.visibility = 'hidden';
    },
    restored() {
      program = null;
      build().then(() => {
        lost = false;
        if (canvas) canvas.style.visibility = '';
        kick();
      }, fail);
    },
  });
  if (!ctx) {
    canvas = null;
    released = true;
    queueMicrotask(fail);
    return handle();
  }
  host.append(canvas);

  /** Compile, then upload in its own task. Also the whole of a context restore. */
  async function build() {
    const gl = ctx!.gl;
    const p = await ctx!.program(VERTEX, FRAGMENT);
    loc = gl.getUniformLocation(p, 'U');
    const body = await loaded;
    await new Promise((r) => setTimeout(r));
    if (dead || !ctx) throw 0;
    // One upload of the file body. Positions are int16 normalised to the
    // bounds, luminance a byte: the GPU reads both straight from the file
    // layout, so there is no parse step and no float copy.
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(body, HEADER), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.SHORT, true, 6, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.UNSIGNED_BYTE, true, 1, count * 6);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    layoutDirty = true;
    program = p;
  }

  function draw(sweep: number) {
    if (!ctx || !program) return;
    const gl = ctx.gl;
    if (layoutDirty) layout();
    const yaw = rad(now.yaw + parts.scrollYaw + now.lookYaw + parts.dragYaw);
    const pitch = rad(mode.pitch + clamp(now.pitch + now.lookPitch, -15, 15));
    U[7] = sweep * 1.25 - 0.1;
    U.set([Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch)], 8);
    U[17] = DISTANCE * (1 - clamp(now.dolly + parts.scrollDolly, 0, 0.15));
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform4fv(loc, U);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, drawCount);
  }

  /** Canvas size, anchor and mask rects. Measured on resize, never per frame. */
  function layout() {
    layoutDirty = false;
    const box = host.getBoundingClientRect();
    if (!ctx || box.width < 2 || box.height < 2) return;
    ctx.resize(box.width, box.height, scale);
    const a = opts.anchor?.getBoundingClientRect();
    const band = box.height < BAND_MAX_PX;
    const place = band ? BAND : mode.place;
    const cx = a ? a.left + a.width / 2 - box.left : place[0] * box.width;
    const w = a ? a.width : Math.min(place[1] * box.width, band ? box.height * 1.2 : Infinity);
    const base = a ? a.bottom - box.top : place[2] * box.height;
    U.set([(cx / box.width) * 2 - 1, 1 - (base / box.height) * 2, w / box.width, w / box.height], 12);
    // About the spacing between neighbouring points on screen, so density
    // reads the same at any size; halving the count enlarges points by √2.
    U[16] = DISTANCE;
    U[18] = (1.7 / Math.sqrt(drawCount || 1)) * (w / 2) * scale;
    U[19] = ALPHA[+fine];
    U.fill(0, 20, 32);
    (opts.masks ?? []).slice(0, 3).forEach((el, i) => {
      // The text, not the box: a paragraph's box runs to its max width, far
      // past its last word, and would cut a dark slab out of the object.
      const range = document.createRange();
      range.selectNodeContents(el);
      const t = range.getBoundingClientRect();
      const r = t.width && t.height ? t : el.getBoundingClientRect();
      const x = (v: number) => (v - box.left) * scale;
      const y = (v: number) => (box.bottom - v) * scale;
      U.set([x(r.left - 10), y(r.bottom + 10), x(r.right + 10), y(r.top - 10)], 20 + i * 4);
    });
  }

  // -------------------------------------------------------- governor

  /**
   * Judges only frames that drew, in runs of consecutive frames (a gap over
   * 100 ms means the loop had stopped, which is not slowness). A steady
   * ~33 ms cadence with little spread is a refresh cap — iOS Low Power Mode,
   * 30 Hz Android panels — and moves the bar from 22 ms to 40 ms instead of
   * counting as slow. Slow once: draw half the points. Slow again: freeze.
   */
  const samples: number[] = [];
  let lastFrame = 0;
  let capped = false;
  let strikes = 0;
  let warmup = 3;

  function governor(t: number) {
    const gap = t - lastFrame;
    lastFrame = t;
    if (gap > 100 || warmup-- > 0) return;
    samples.push(gap);
    if (samples.length < 45) return;
    const median = samples.slice().sort((a, b) => a - b)[22];
    // Spread as mean absolute deviation from the median, in ms.
    const spread = samples.reduce((s, v) => s + Math.abs(v - median), 0) / 45;
    samples.length = 0;
    if (median > 28 && median < 38 && spread < 3) capped = true;
    if (median <= (capped ? 40 : 22)) return;
    if (++strikes === 1 && progressive) {
      drawCount = Math.ceil(count / 2);
      layoutDirty = true;
    } else queueMicrotask(freeze);
  }

  // ---------------------------------------------------------- inputs

  const inputs = opts.inputs ?? {};
  if (!still) {
    if (inputs.pointer && fine) cleanups.push(pointerLook());
    if (inputs.scroll) cleanups.push(scrollTurn(inputs.scroll === true ? host : inputs.scroll));
    if (inputs.drag) cleanups.push(dragTurn());
  }

  /** Hero: anywhere in the viewport. Poster: over the host only. Back to rest on leave. */
  function pointerLook(): () => void {
    const local = opts.mode === 'poster';
    const surface: EventTarget = local ? host : window;
    const exit: EventTarget = local ? host : document;
    const move = (e: Event) => {
      const p = e as PointerEvent;
      if (p.pointerType !== 'mouse') return;
      const r = local ? host.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
      target.lookYaw = clamp(((p.clientX - r.left) / r.width) * 2 - 1, -1, 1) * mode.look[0];
      target.lookPitch = clamp(((p.clientY - r.top) / r.height) * 2 - 1, -1, 1) * mode.look[1];
      kick();
    };
    const leave = () => {
      target.lookYaw = target.lookPitch = 0;
      kick();
    };
    surface.addEventListener('pointermove', move, { passive: true });
    exit.addEventListener('pointerleave', leave);
    return () => {
      surface.removeEventListener('pointermove', move);
      exit.removeEventListener('pointerleave', leave);
    };
  }

  /**
   * One passive scroll listener, attached only while the driver element is
   * on screen. Progress is how far it has left the viewport, 0 → 1. The
   * driver's document position is measured when the listener attaches and on
   * resize, so a scroll event reads `scrollY` and nothing else.
   */
  function scrollTurn(driver: Element): () => void {
    let top = 0;
    let height = 1;
    const onScroll = () => {
      const progress = clamp((scrollY - top) / height, 0, 1);
      parts.scrollYaw = progress * TURN[+fine];
      parts.scrollDolly = fine ? progress * 0.08 : 0;
      kick();
    };
    const onResize = () => {
      const r = driver.getBoundingClientRect();
      top = r.top + scrollY;
      height = Math.max(1, r.height);
      onScroll();
    };
    const listen = (on: boolean) => {
      if (on) {
        addEventListener('scroll', onScroll, { passive: true });
        addEventListener('resize', onResize, { passive: true });
      } else {
        removeEventListener('scroll', onScroll);
        removeEventListener('resize', onResize);
      }
    };
    const io = new IntersectionObserver((entries) => {
      const on = entries[entries.length - 1].isIntersecting;
      listen(on);
      if (on) onResize();
    });
    io.observe(driver);
    return () => {
      io.disconnect();
      listen(false);
    };
  }

  /** Horizontal drag only; `touch-action: pan-y` leaves vertical scrolling to the browser. */
  function dragTurn(): () => void {
    let id = -1;
    let x0 = 0;
    let yaw0 = 0;
    const on: Record<string, (e: PointerEvent) => void> = {
      pointerdown(e) {
        if (e.pointerType === 'mouse' || (e.target as Element).closest('a, button')) return;
        id = e.pointerId;
        x0 = e.clientX;
        yaw0 = parts.dragYaw;
      },
      pointermove(e) {
        if (e.pointerId !== id) return;
        parts.dragYaw = clamp(yaw0 + ((e.clientX - x0) / host.clientWidth) * 90, -40, 40);
        kick();
      },
      pointerup: () => (id = -1),
      pointercancel: () => (id = -1),
    };
    host.style.touchAction = 'pan-y';
    for (const type in on) host.addEventListener(type, on[type] as EventListener, { passive: true });
    return () => {
      host.style.touchAction = '';
      for (const type in on) host.removeEventListener(type, on[type] as EventListener);
    };
  }

  // ---------------------------------------------------------- startup

  const ro = new ResizeObserver(() => {
    layoutDirty = true;
    if (ready) kick();
  });
  ro.observe(host);
  (opts.masks ?? []).forEach((el) => ro.observe(el));
  cleanups.push(() => ro.disconnect());

  // Compile and fetch run side by side; build() waits for both, and keeps
  // the 70 KB body so a context restore can re-upload without a request.
  const loaded = fetch(url, { priority: 'low', signal: abort.signal } as RequestInit)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
    .then((buf) => {
      const dv = new DataView(buf);
      count = buf.byteLength >= HEADER && dv.getUint32(0, true) === MAGIC ? dv.getUint32(4, true) : -1;
      if (count < 0 || buf.byteLength < HEADER + count * 7) throw 0;
      const f = (at: number) => dv.getFloat32(at, true);
      const lo = [f(8), f(12), f(16)];
      const hi = [f(20), f(24), f(28)];
      // Normalise to the object's horizontal radius, so every scan arrives
      // at the same size and the anchor alone decides how big it is drawn.
      const inv = 1 / Math.max(-lo[0], hi[0], -lo[2], hi[2], 1e-6);
      U.set([...lo.map((v, i) => ((v + hi[i]) / 2) * inv), Math.max(hi[1] * inv, 1e-3)], 0);
      U.set(lo.map((v, i) => ((hi[i] - v) / 2) * inv), 4);
      progressive = (dv.getUint32(32, true) & 1) === 1;
      drawCount = count;
      return buf;
    });
  loaded.catch(fail);

  build().then(kick, fail);

  return handle();

  function handle(): ScanEngine {
    return {
      setYaw(deg) {
        target.yaw = deg;
        kick();
      },
      setPitch(deg) {
        target.pitch = clamp(deg, -15, 15);
        kick();
      },
      setDolly(amount) {
        target.dolly = clamp(amount, 0, 0.15);
        kick();
      },
      teardown,
      freeze,
      pause(p) {
        paused = p;
        if (p) loop.stop();
        else if (ready) kick();
      },
    };
  }
}

// ------------------------------------------------------------- helpers

const rad = (deg: number) => (deg * Math.PI) / 180;

/** `--c-bone` from the page as 0–1 RGB, so the token stays the one source of the colour. */
function boneColour(el: Element): number[] {
  const m = /^#([0-9a-f]{6})$/i.exec(getComputedStyle(el).getPropertyValue('--c-bone').trim());
  const n = m ? parseInt(m[1], 16) : 0xebe7de;
  return [n >> 16, (n >> 8) & 255, n & 255].map((c) => c / 255);
}
