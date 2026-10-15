import '~/styles/global.css';
import './harness.css';
import { getScan } from '~/data/scans';
import { liveContexts } from '~/motion/ambient/gl';
import { mount as scheduled } from '~/motion/ambient/mount';
import { mount as direct, type ScanHandle, type ScanOptions } from '~/motion/ambient/pointScan';
import { REVEAL_EVENT } from '~/motion/language/enterReveal';

/**
 * SCAN HARNESS
 * ============
 * Drives the real engine against the real scan files, outside the site, so
 * every promise in src/motion/ambient/README.md can be watched or measured:
 *
 *   - live contexts (gl.ts counter) and engine rAF callbacks, counted by
 *     wrapping requestAnimationFrame before anything runs;
 *   - frame time of the frames the engine actually drew;
 *   - a 30 Hz cap (steady 33 ms frames) and jittery slowness, made by burning
 *     main-thread time inside rAF, to watch the governor's two verdicts;
 *   - context loss and restore, calm on/off, teardown.
 *
 * `window.harness` exposes the same handles to Playwright.
 */

// ------------------------------------------------- rAF accounting

const nativeRaf = window.requestAnimationFrame.bind(window);
const frames: number[] = [];
let rafCalls = 0;
window.requestAnimationFrame = (cb) =>
  nativeRaf((t) => {
    rafCalls++;
    frames.push(t);
    if (frames.length > 90) frames.shift();
    cb(t);
  });

// ---------------------------------------------------------- setup

const scan = getScan('hero');
if (!scan) throw new Error('No approved hero scan in src/data/scans.ts');

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel)!;
const panel = $<HTMLElement>('.panel');
const hosts = {
  hero: $<HTMLElement>('[data-scan-host]'),
  stage: $<HTMLElement>('[data-stage-host]'),
  poster: $<HTMLElement>('[data-poster-host]'),
};
const caption = $<HTMLElement>('[data-scan-caption]');
const value = (name: string) =>
  (panel.querySelector<HTMLInputElement>(`[name="${name}"]:checked`) ??
    panel.querySelector<HTMLInputElement>(`[name="${name}"]`))!;

let handle: ScanHandle | null = null;
let host: HTMLElement = hosts.hero;
let events: string[] = [];
const log = (e: string) => {
  events.push(`${(performance.now() / 1000).toFixed(2)}s ${e}`);
  events = events.slice(-6);
};

function mountScan() {
  teardown();
  const target = value('target').value as keyof typeof hosts;
  const via = value('via').value;
  const still = value('still').checked;
  host = hosts[target];
  const opts: ScanOptions = {
    src: scan!.files,
    mode: target === 'poster' ? 'poster' : 'hero',
    sweep: true,
    still,
    masks: target === 'hero' ? [...document.querySelectorAll('[data-scan-mask]')] : [],
    anchor: target === 'hero' ? $('[data-scan-anchor]') : undefined,
    inputs:
      target === 'poster'
        ? { pointer: true, drag: true }
        : { pointer: target === 'hero', scroll: target === 'hero' ? $('#hero') : true },
    onReady: () => {
      log('ready (first frame)');
      if (target === 'hero') caption.hidden = false;
    },
    onFail: () => log('fail: nothing will draw'),
    onRelease: () => log('context released'),
  };
  log(`mount ${via} ${target}${still ? ' still' : ''}`);
  handle = via === 'direct' ? direct(host, opts) : scheduled(host, opts);
  applySliders();
}

function teardown() {
  if (!handle) return;
  handle.teardown();
  handle = null;
  caption.hidden = true;
  log('teardown');
}

function applySliders() {
  handle?.setYaw(Number(value('yaw').value));
  handle?.setPitch(Number(value('pitch').value));
  handle?.setDolly(Number(value('dolly').value));
}

/** The GL context of the live canvas, if there is one (a still is a 2D canvas). */
function liveGL(): WebGL2RenderingContext | null {
  const canvas = host.querySelector('canvas');
  return (canvas?.getContext('webgl2') as WebGL2RenderingContext | null) ?? null;
}
let loseExt: WEBGL_lose_context | null = null;

panel.addEventListener('click', (e) => {
  const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
  if (act === 'mount') mountScan();
  if (act === 'teardown') teardown();
  if (act === 'lose') {
    loseExt = liveGL()?.getExtension('WEBGL_lose_context') ?? null;
    loseExt?.loseContext();
    log(loseExt ? 'context lost (simulated)' : 'no live context to lose');
  }
  if (act === 'restore') {
    loseExt?.restoreContext();
    log('restore requested');
  }
  if (act === 'calm') {
    document.documentElement.toggleAttribute('data-calm');
    document.dispatchEvent(new CustomEvent('irl:motionchange'));
    log(`data-calm ${document.documentElement.hasAttribute('data-calm') ? 'on' : 'off'}`);
  }
});
panel.addEventListener('input', applySliders);

// ------------------------------------------------- stress + spin

let burnUntil = 0;
const burn = (ms: number) => {
  burnUntil = performance.now() + ms;
  while (performance.now() < burnUntil);
};
const harnessTick = (t: number) => {
  const load = value('load').value;
  if (load === 'cap') burn(21);
  if (load === 'slow') burn(12 + Math.random() * 30);
  if (value('spin').checked) handle?.setYaw(Math.sin(t / 900) * 30);
  nativeRaf(harnessTick);
};
nativeRaf(harnessTick);

// ----------------------------------------------------------- stats

function median(xs: number[]): number {
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
}

setInterval(() => {
  const gaps = frames.slice(1).map((t, i) => t - frames[i]).filter((g) => g < 100);
  const canvas = host.querySelector('canvas');
  const kind = !canvas ? 'none' : canvas.getContext('2d') ? '2d still' : 'webgl2';
  $<HTMLElement>('[data-stats]').textContent = [
    `live contexts  ${liveContexts()}`,
    `canvas         ${kind}`,
    `engine rAF     ${rafCalls}`,
    `frame median   ${gaps.length ? median(gaps).toFixed(1) : '–'} ms (${gaps.length})`,
    `calm           ${document.documentElement.hasAttribute('data-calm') ? 'on' : 'off'}`,
    '',
    ...events,
  ].join('\n');
}, 250);

// ------------------------------------------------------------ boot

// ?bare hides the panel (screenshots); ?target=, ?via=, ?still preset it.
const params = new URLSearchParams(location.search);
if (params.has('bare')) document.documentElement.setAttribute('data-bare', '');
for (const name of ['target', 'via']) {
  const v = params.get(name);
  const radio = v && panel.querySelector<HTMLInputElement>(`[name="${name}"][value="${v}"]`);
  if (radio) radio.checked = true;
}
if (params.has('still')) value('still').checked = true;

// The site announces the reveal two frames after first paint; so does this.
nativeRaf(() => nativeRaf(() => document.dispatchEvent(new CustomEvent(REVEAL_EVENT))));
mountScan();

declare global {
  interface Window {
    harness: unknown;
  }
}
window.harness = {
  liveContexts,
  rafCalls: () => rafCalls,
  mount: mountScan,
  teardown,
  handle: () => handle,
  set(name: string, v: string | boolean) {
    const el = panel.querySelector<HTMLInputElement>(`[name="${name}"][value="${v}"]`) ??
      panel.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
    if (typeof v === 'boolean') el.checked = v;
    else if (el.type === 'radio') el.checked = true;
    else el.value = v;
    applySliders();
  },
  canvasKind: () => {
    const c = host.querySelector('canvas');
    return !c ? 'none' : c.getContext('2d') ? '2d' : 'webgl2';
  },
  events: () => events.slice(),
};
