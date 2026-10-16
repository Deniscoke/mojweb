/**
 * MOTION-DEPTH BUDGETS AND GUARDS, checked on the built site.
 * ===========================================================
 *
 *   npm run build && npm run budget
 *
 *   node scripts/check-budget.mjs                   dist/ against scripts/budget-baseline.json
 *   node scripts/check-budget.mjs --write-baseline  measure dist/ into the baseline (pre-change only)
 *   node scripts/check-budget.mjs --self-test       seed one violation of each kind; each must fail
 *
 * Options: `--dist <dir>` (default dist), `--baseline <file>`.
 *
 * WHY IT READS THE BUILD, NOT THE SOURCE
 * The plan's rules (docs/motion-depth-plan.md §1) are about what reaches the
 * browser: which element carries which attribute, which CSS rule lands on
 * which ancestor, how many bytes every page inlines. Astro inlines every
 * stylesheet (`inlineStylesheets: 'always'`), so one careless line in a
 * shared file is paid by all 152 pages — only the built HTML says so honestly.
 *
 * WHAT IT CHECKS
 *   budget    inline CSS and initial-path JS per page, gzipped, against the
 *             pre-change baseline: homepage +5 KB CSS, every other page +3 KB;
 *             initial JS +2 KB (§5.4); the gate and 404 get no new JS at all,
 *             beyond the shared env helpers they already load.
 *   chunks    the lazy chunks of §5.4 against their own caps, and the total
 *             JS growth against the sum of those caps. A lazy chunk found on
 *             any page's initial import graph is an error, not a size.
 *   depth.css the core primitives file, minified and gzipped, ≤ 2.5 KB.
 *   lint      the owner rule, forbidden ancestors (attributes, inline styles
 *             and CSS rules), the triple gate around `animation-timeline`, the
 *             3D flattening rule, attribute vocabulary, the gate/404 staying
 *             depth-free, the hidden scan caption, and the CSP promises
 *             (no eval, no `new Function`, no blob: workers, no CDN scripts).
 *
 * Units: 1 KB = 1024 bytes. Sizes are gzip level 9, each file on its own,
 * the way they travel. Exit code 1 on any error; warnings never fail.
 */
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '..');
const KB = 1024;

// ─────────────────────────────────────────────────────────────────── caps

/**
 * Growth allowed over the baseline, in KB gz, per page type (§5.4, §10 W8).
 * The gate and the 404 run no depth code (§3.15); the 0.6 KB they may grow is
 * the env.ts additions (calm-aware `prefersReducedMotion`, `idle`, …) that
 * land in the env chunk every page already shares.
 *
 * Home is 2.6, not the plan's 2: the plan priced the depth runtime without
 * Vite's dynamic-import preload helper (~0.6 KB gz), which Vite injects with
 * the first lazy `import()` on the initial path and which neither
 * `build.modulePreload: false` nor an `astro:build:setup` override removes
 * (both measured, 2026-10-15). Every other page type stays inside 2 with the
 * helper included; home alone also carries Selected Work's plate carry
 * (+0.53 KB), which is the feature, not overhead. Lighthouse ≥ 95 remains the
 * gate that decides whether any of this is too much.
 *
 * Home is 2.65 since the final-review fixes (2026-10-16), measured to the
 * byte: +36 B in the depth runtime to re-read Calm when a page comes back
 * from the back/forward cache (a visitor who chose Calm got full motion
 * after Back), and +36 B in Selected Work so a still pointer under scrolling
 * rows does not summon the cursor preview over the band. Both are behaviour
 * the page needs, not overhead; the other page types stay inside 2.1.
 *
 * The other site pages are 2.1, not 2: the hero scan is scheduled from the
 * shared depth runtime, and Rollup then places the env helpers the scan
 * engine shares (whenVisible and friends) in the env chunk every page loads.
 * Measured both placements on 2026-10-17 — scheduled from the Hero chunk:
 * home +2.79 KB, others +2.08; from the runtime: home +2.56, others +2.02.
 * The runtime is cheaper everywhere; the 0.1 is the price of that sharing.
 *
 * Living scene (2026-10-16): the hero scan, the cursor field, the hero
 * parallax and the Work cursor preview left the homepage, and the scene is
 * scheduled from the same runtime in their place. Home measured +1.33 KB, so
 * the 2.65 cap stands untouched (the spec allowed up to 3.0).
 */
const PAGE_CAPS = {
  home: { css: 5, js: 2.65 },
  case: { css: 3, js: 2.1 },
  laby: { css: 3, js: 2.1 },
  'laby-detail': { css: 3, js: 2.1 },
  lab: { css: 3, js: 2.1 },
  note: { css: 3, js: 2.1 },
  gate: { css: 3, js: 0.6 },
  404: { css: 3, js: 0.6 },
  other: { css: 3, js: 2.1 },
};

/**
 * Lazy chunks from §5.4, recognised by the name Vite gives a dynamically
 * imported module (`tilt.ts` → `_astro/tilt.<hash>.js`). If gl.ts is shared
 * and split into its own chunk, it counts towards the engine.
 */
const LAZY_CHUNKS = [
  { id: 'depth/tilt', match: /^tilt\./, cap: 1.3 },
  // The living scene (docs/superpowers/specs/2026-10-16-living-scene-design.md):
  // runtime, morph, shapes and the shared gl.ts; measured 6.4 KB at landing.
  { id: 'scene', match: /^(?:scene|morph|shapes|points|timeline|glyphs|gl)\./, cap: 9 },
  { id: 'scene/fallback', match: /^fallback\./, cap: 1.5 },
  // The kinetic type (docs/superpowers/specs/2026-10-16-kinetic-site-design.md):
  // GSAP core + SplitText + ScrambleText + our module, after the first input.
  // Measured 35.2 KB at landing.
  { id: 'kinetic', match: /^kinetic\./, cap: 40 },
  { id: 'media/depthPhoto', match: /^depthPhoto\./, cap: 2.0 },
];

/**
 * Initial 2.0 + tilt 1.3 + depthPhoto 2.0 + scene 9 + fallback 1.5 + kinetic 40.
 * (The scan engine's mount and gl + pointScan left with the hero scan.)
 */
const TOTAL_NEW_JS_CAP = 55.8;

const DEPTH_CSS = 'src/styles/depth.css';
const DEPTH_CSS_CAP = 2.5;

/**
 * Strings only the depth runtime contains: the class `initDepth` sets and
 * the toggle selector `initMotionToggles` queries (§5.2). Neither may reach
 * the gate or the 404.
 */
const DEPTH_MARKERS = ['depth-ready'];

// ───────────────────────────────────────────────────── vocabulary (§1, §5.1)

const DEPTH_VALUES = new Set(['rise', 'recede', 'drift', 'approach', 'window']);
const SCRUB_VALUES = new Set(['rule']);

/** Rule 5: elements that already have an owner for transform or translate. */
const DEPTH_EXCLUSIVE = ['data-reveal', 'data-reveal-lines', 'data-magnetic', 'data-parallax'];
/** Tilt owns `transform` on a stage that has no other owner. */
const TILT_EXCLUSIVE = ['data-reveal', 'data-reveal-lines', 'data-magnetic', 'data-parallax'];
/** The lift owns `translate`, as do depth and the pointer field. */
const LIFT_EXCLUSIVE = ['data-depth', 'data-parallax'];

/** Rule 6. Ancestors of the fixed layers are derived per page on top of these. */
const FORBIDDEN_TAGS = new Set(['html', 'body', 'main']);
const FORBIDDEN_CLASSES = ['wrap', 'work__list', 'project', 'project__link'];
/** Fixed layers that exist in the markup. `.pt` and `.cursor-field` are added
 *  to <body> at runtime, so their only ancestors are body and html. */
const FIXED_LAYERS = ['project__plate', 'transition-cover'];
/**
 * `.project__plate` is position: fixed only in the cursor-preview layout
 * (SelectedWork: min-width 62rem, hover, fine pointer). Under the negation of
 * that query it is an ordinary in-flow card plate, so a transform on its
 * ancestors there cannot re-scope a fixed layer — the phone card's :active
 * press lives exactly there. The exemption covers only the plate's own
 * ancestors below `.wrap`; html, body, main and `.wrap` stay forbidden in every
 * layout, because the transition cover and the runtime layers sit under them.
 */
const PLATE_ONLY_ANCESTORS = new Set(['work__list', 'project', 'project__link']);
const OUTSIDE_PREVIEW_LAYOUT =
  /^@media\s*not\s+all\s+and\s*\(min-width:\s*62rem\)\s*and\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/i;
/** Attributes that put a transform-family property on their element. */
const TRANSFORMING_ATTRS = ['data-depth', 'data-tilt', 'data-lift', 'data-parallax'];

// ─────────────────────────────────────────────────────────────── helpers

const gz = (text) => gzipSync(typeof text === 'string' ? Buffer.from(text, 'utf8') : text, { level: 9 }).length;
const kb = (bytes) => bytes / KB;
const fmt = (bytes) => `${kb(bytes).toFixed(2)} KB`;
const signed = (bytes) => `${bytes >= 0 ? '+' : '−'}${kb(Math.abs(bytes)).toFixed(2)} KB`;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const toPosix = (p) => p.split(sep).join('/');

/** `en/projects/splatoo/index.html` → `/en/projects/splatoo/`. */
function routeOf(file) {
  const rel = toPosix(file);
  if (rel.endsWith('index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

export function pageType(route) {
  if (route === '/') return 'gate';
  if (route === '/404.html') return '404';
  const parts = route.split('/').filter(Boolean);
  if (parts.length === 1) return 'home';
  const [, section, slug] = parts;
  if (section === 'projects') return 'case';
  if (section === 'laby') return slug ? 'laby-detail' : 'laby';
  if (section === 'lab') return slug ? 'note' : 'lab';
  return 'other';
}

// ─────────────────────────────────────────────────────────────────── HTML

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW_TEXT = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
const TAG = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parseAttrs(source) {
  const attrs = new Map();
  for (const [, name, dq, sq, bare] of source.matchAll(ATTR)) {
    attrs.set(name.toLowerCase(), (dq ?? sq ?? bare ?? '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  }
  return attrs;
}

/**
 * Enough of an HTML parser for Astro's output, which closes what it opens:
 * raw-text elements are lifted out first (so markup inside a script string
 * never becomes an element), then start and end tags build a tree.
 */
export function parseHtml(html) {
  const styles = [];
  const scripts = [];
  const stripped = html.replace(/<!--[\s\S]*?-->/g, '').replace(RAW_TEXT, (_, tag, attrs, body) => {
    if (tag.toLowerCase() === 'style') styles.push(body);
    else scripts.push({ attrs: parseAttrs(attrs), body });
    return `<${tag}${attrs}></${tag}>`;
  });

  const elements = [];
  const stack = [];
  for (const [, closing, rawName, attrSource, selfClosing] of stripped.matchAll(TAG)) {
    const tag = rawName.toLowerCase();
    if (closing) {
      const at = stack.findLastIndex((el) => el.tag === tag);
      if (at !== -1) stack.length = at;
      continue;
    }
    const attrs = parseAttrs(attrSource);
    const el = {
      tag,
      attrs,
      classes: new Set((attrs.get('class') ?? '').split(/\s+/).filter(Boolean)),
      parent: stack.at(-1) ?? null,
    };
    elements.push(el);
    if (!VOID.has(tag) && !selfClosing) stack.push(el);
  }
  return { styles, scripts, elements };
}

/** `<li class="project">` — short, recognisable, enough to find it again. */
function describe(el) {
  const cls = [...el.classes].slice(0, 2).map((c) => `.${c}`).join('');
  const id = el.attrs.get('id') ? `#${el.attrs.get('id')}` : '';
  const marks = [...el.attrs.keys()].filter((a) => a.startsWith('data-') && !a.startsWith('data-astro-cid')).slice(0, 3);
  return `<${el.tag}${id}${cls}${marks.length ? ` ${marks.join(' ')}` : ''}>`;
}

// ──────────────────────────────────────────────────────────────────── CSS

/**
 * Walks a stylesheet into rules, each with the chain of at-rule and parent
 * selector preludes it sits in. Tolerates nesting, strings and `;` inside
 * `url(...)`; it is a linter's parser, not a browser's.
 */
export function parseCss(css) {
  const rules = [];
  const stack = [];
  let buf = '';
  let quote = '';
  let parens = 0;
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');

  const pushDecl = () => {
    const text = buf.trim();
    buf = '';
    if (!text || !stack.length) return;
    const colon = text.indexOf(':');
    if (colon < 1) return;
    stack.at(-1).decls.push({
      prop: text.slice(0, colon).trim().toLowerCase(),
      value: text.slice(colon + 1).trim().replace(/\s*!important$/i, ''),
    });
  };

  for (const ch of src) {
    if (quote) {
      buf += ch;
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
    } else if (ch === '(') {
      parens += 1;
      buf += ch;
    } else if (ch === ')') {
      parens = Math.max(0, parens - 1);
      buf += ch;
    } else if (parens > 0) {
      buf += ch;
    } else if (ch === '{') {
      stack.push({ prelude: buf.trim(), decls: [] });
      buf = '';
    } else if (ch === ';') {
      pushDecl();
    } else if (ch === '}') {
      pushDecl();
      const block = stack.pop();
      if (block) rules.push({ prelude: block.prelude, decls: block.decls, context: stack.map((b) => b.prelude) });
    } else {
      buf += ch;
    }
  }
  return rules;
}

/** Splits on a separator at depth 0, outside brackets, parens and strings. */
function splitTop(text, isSep) {
  const parts = [];
  let depth = 0;
  let quote = '';
  let cur = '';
  for (const ch of text) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    if (ch === '(' || ch === '[') depth += 1;
    if (ch === ')' || ch === ']') depth -= 1;
    if (depth === 0 && isSep(ch, cur)) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

const selectorList = (prelude) => splitTop(prelude, (ch) => ch === ',');

/** Full selectors for a rule, with nesting resolved (`&` or descendant). */
function resolveSelectors(rule) {
  let parents = [''];
  for (const prelude of rule.context) {
    if (prelude.startsWith('@')) continue;
    parents = parents.flatMap((p) =>
      selectorList(prelude).map((s) => (s.includes('&') ? s.replaceAll('&', p) : `${p} ${s}`.trim())),
    );
  }
  return parents.flatMap((p) =>
    selectorList(rule.prelude).map((s) => (s.includes('&') ? s.replaceAll('&', p) : `${p} ${s}`.trim())),
  );
}

/** The compound a selector styles: `.a > .b:hover` → `.b:hover`. */
function subjectOf(selector) {
  const compounds = splitTop(selector.replace(/\s*([>+~])\s*/g, ' $1 '), (ch) => /\s/.test(ch));
  return compounds.filter((c) => !/^[>+~]$/.test(c)).at(-1) ?? '';
}

/** Tag, classes, ids and :root of a compound, ignoring anything inside :not() etc. */
function compoundParts(compound) {
  let top = '';
  let depth = 0;
  for (const ch of compound) {
    if (ch === '(' || ch === '[') depth += 1;
    if (depth === 0) top += ch;
    if (ch === ')' || ch === ']') depth -= 1;
  }
  return {
    tag: /^([a-zA-Z][\w-]*)/.exec(top)?.[1]?.toLowerCase() ?? '',
    classes: [...top.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]),
    ids: [...top.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]),
    root: /:root\b/.test(top),
    pseudoElement: /::|:(?:before|after|first-line|first-letter)\b/.test(top),
  };
}

const unprefixed = (prop) => prop.replace(/^-(?:webkit|moz|ms)-/, '');
const NONE = /^(?:none|initial|unset|revert|revert-layer)$/i;

/**
 * Declarations that make an element the containing block of its fixed
 * descendants. That is the failure rule 6 exists to prevent: the cursor
 * preview, `.pt` and the transition cover would be positioned against the
 * ancestor instead of the viewport.
 */
function containingBlockDecl({ prop, value }) {
  const p = unprefixed(prop);
  if (['transform', 'perspective', 'filter', 'backdrop-filter', 'translate', 'rotate', 'scale'].includes(p)) {
    return !NONE.test(value);
  }
  if (p === 'will-change') {
    return /\b(?:transform|perspective|filter|backdrop-filter|translate|rotate|scale|contain)\b/.test(value);
  }
  if (p === 'contain') return /\b(?:paint|layout|strict|content)\b/.test(value);
  if (p === 'content-visibility') return /\b(?:auto|hidden)\b/.test(value);
  return false;
}

/** Declarations that flatten a `preserve-3d` stage (rule 7). */
function flattensDecl({ prop, value }) {
  const p = unprefixed(prop);
  if (p === 'opacity') return Number.parseFloat(value) !== 1;
  if (p === 'overflow' || p === 'overflow-x' || p === 'overflow-y' || p === 'overflow-clip-margin') {
    return !/^(?:visible|initial|unset)$/i.test(value);
  }
  if (p === 'filter' || p === 'clip-path' || p.startsWith('mask')) return !NONE.test(value);
  return false;
}

// ────────────────────────────────────────────────────────────── the site

/**
 * Everything the checks need, read once: each page's inline CSS and scripts,
 * its element tree, and the import graph of every chunk in _astro/.
 */
async function readSite(dist) {
  const pages = [];
  const chunks = new Map();

  for await (const file of walk(dist)) {
    const rel = toPosix(relative(dist, file));
    if (rel.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      const route = routeOf(rel);
      const parsed = parseHtml(html);
      // Same-origin stylesheets the page links: not inline CSS (no inline
      // budget), but every rule in them is linted like inline CSS.
      const linked = [];
      for (const [, href] of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="(\/[^"]+\.css)"/g)) {
        try {
          linked.push(await readFile(join(dist, href.slice(1)), 'utf8'));
        } catch {
          // A missing file is reported by the link checks, not here.
        }
      }
      pages.push({ route, type: pageType(route), html, ...parsed, linkedStyles: linked });
    } else if (rel.startsWith('_astro/') && rel.endsWith('.js')) {
      const text = await readFile(file, 'utf8');
      chunks.set(`/${rel}`, { name: posix.basename(rel), text, gz: gz(text), ...importsOf(text, `/${rel}`) });
    }
  }
  pages.sort((a, b) => a.route.localeCompare(b.route));
  return { pages, chunks };
}

/**
 * Static and dynamic imports of a module, as absolute site paths. Static:
 * `from"./x.js"` and the bare `import"./x.js"`; dynamic: `import("./x.js")`.
 * Vite's preload helper lists dependencies as strings in an array, which
 * matches neither — those are fetched only when the dynamic import runs.
 */
function importsOf(text, from) {
  const resolveSpec = (spec) => (spec.startsWith('/') ? spec : posix.join(posix.dirname(from), spec));
  const staticImports = [...text.matchAll(/(?:\bfrom|\bimport)\s*["']([^"']+\.js)["']/g)].map((m) => resolveSpec(m[1]));
  const dynamicImports = [...text.matchAll(/\bimport\s*\(\s*["']([^"']+\.js)["']\s*\)/g)].map((m) => resolveSpec(m[1]));
  return { staticImports, dynamicImports };
}

/** The JS a page runs without waiting for anything: inline scripts plus the
 *  static import closure of its module scripts. */
function initialJs(page, chunks) {
  const seen = new Set();
  const visit = (path) => {
    if (seen.has(path)) return;
    seen.add(path);
    chunks.get(path)?.staticImports.forEach(visit);
  };
  let inline = '';
  for (const { attrs, body } of page.scripts) {
    if (/application\/(?:ld\+)?json/i.test(attrs.get('type') ?? '')) continue;
    const src = attrs.get('src');
    if (src) {
      if (src.startsWith('/_astro/')) visit(src);
      continue;
    }
    inline += body;
    importsOf(body, '/').staticImports.forEach(visit);
  }
  const files = [...seen].filter((p) => chunks.has(p));
  const bytes = files.reduce((sum, p) => sum + chunks.get(p).gz, 0) + (inline ? gz(inline) : 0);
  return { files, bytes, text: inline + files.map((p) => chunks.get(p).text).join('\n') };
}

function measurePage(page, chunks) {
  const css = page.styles.join('\n');
  return {
    type: page.type,
    css: css ? gz(css) : 0,
    js: initialJs(page, chunks).bytes,
    html: gz(page.html),
  };
}

/** A whitespace-and-comment minifier: close to what Vite emits for depth.css. */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

// ──────────────────────────────────────────────────────────────── checks

/**
 * Runs every check. Returns errors, warnings and the measured numbers, so the
 * self-test can drive it against seeded fixtures exactly as CI drives it.
 */
export async function runChecks({ dist, baseline, depthCss = join(root, DEPTH_CSS) }) {
  const site = await readSite(dist);
  const errors = [];
  const warnings = [];
  const error = (rule, where, message) => errors.push({ rule, where, message });
  const warn = (rule, where, message) => warnings.push({ rule, where, message });

  if (site.pages.length === 0) error('build', dist, 'no HTML pages found — run `npm run build` first');

  // ── budgets per page type
  const measured = Object.fromEntries(site.pages.map((p) => [p.route, measurePage(p, site.chunks)]));
  const byType = {};
  for (const [route, m] of Object.entries(measured)) {
    const cap = PAGE_CAPS[m.type] ?? PAGE_CAPS.other;
    const base = baseline.pages[route] ?? typeMax(baseline, m.type);
    const row = (byType[m.type] ??= { pages: 0, css: { delta: -Infinity }, js: { delta: -Infinity } });
    row.pages += 1;
    for (const kind of ['css', 'js']) {
      if (!base) continue;
      const delta = m[kind] - base[kind];
      if (delta > row[kind].delta) row[kind] = { delta, route };
      if (delta > cap[kind] * KB) {
        error(`budget-${kind}`, route, `${kind === 'css' ? 'inline CSS' : 'initial JS'} ${signed(delta)} gz over baseline (cap +${cap[kind]} KB for ${m.type})`);
      }
    }
  }

  // ── lazy chunks and total JS
  const initialByPage = new Map(site.pages.map((p) => [p.route, initialJs(p, site.chunks)]));
  const lazy = LAZY_CHUNKS.map((spec) => {
    const files = [...site.chunks.entries()].filter(([, c]) => spec.match.test(c.name));
    const bytes = files.reduce((sum, [, c]) => sum + c.gz, 0);
    if (files.length && bytes > spec.cap * KB) {
      error('chunk-cap', spec.id, `${fmt(bytes)} gz (cap ${spec.cap} KB) — ${files.map(([, c]) => c.name).join(', ')}`);
    }
    for (const [path, c] of files) {
      const on = site.pages.filter((p) => initialByPage.get(p.route).files.includes(path));
      if (on.length) {
        error('lazy-on-initial', spec.id, `${c.name} is statically imported on ${on.length} page(s), e.g. ${on[0].route} — it must be a dynamic import()`);
      }
    }
    return { ...spec, files: files.map(([, c]) => c.name), bytes };
  });

  const totalJs = [...site.chunks.values()].reduce((sum, c) => sum + c.gz, 0);
  const totalDelta = totalJs - baseline.js.total;
  if (totalDelta > TOTAL_NEW_JS_CAP * KB) {
    error('total-js', '_astro/', `all JS ${signed(totalDelta)} gz over baseline (cap +${TOTAL_NEW_JS_CAP} KB, the §5.4 table)`);
  }


  // ── depth.css core
  let depthCssBytes = null;
  if (existsSync(depthCss)) {
    depthCssBytes = gz(minifyCss(await readFile(depthCss, 'utf8')));
    if (depthCssBytes > DEPTH_CSS_CAP * KB) {
      error('depth-css', DEPTH_CSS, `${fmt(depthCssBytes)} gz minified (cap ${DEPTH_CSS_CAP} KB)`);
    }
  }

  // ── lint, page by page
  for (const page of site.pages) lintPage(page, initialByPage.get(page.route), { error, warn });
  lintChunks(site, { error });

  return { errors, warnings, measured, byType, lazy, totalJs, totalDelta, depthCssBytes, pages: site.pages.length };
}

function typeMax(baseline, type) {
  const t = baseline.types[type];
  return t ? { css: t.css.max, js: t.js.max } : null;
}

function lintPage(page, initial, { error, warn }) {
  const where = page.route;
  const { elements } = page;

  // Rule 5, the owner rule, plus the attribute vocabulary.
  for (const el of elements) {
    const has = (a) => el.attrs.has(a);
    if (has('data-depth')) {
      const clash = DEPTH_EXCLUSIVE.filter(has);
      if (clash.length) error('owner', where, `${describe(el)}: data-depth with ${clash.join(', ')} — put depth on a wrapper or child`);
      if (!DEPTH_VALUES.has(el.attrs.get('data-depth'))) {
        error('vocabulary', where, `${describe(el)}: data-depth="${el.attrs.get('data-depth')}" is not one of ${[...DEPTH_VALUES].join(', ')}`);
      }
    }
    if (has('data-tilt')) {
      const clash = TILT_EXCLUSIVE.filter(has);
      if (clash.length) error('owner', where, `${describe(el)}: data-tilt with ${clash.join(', ')} — tilt needs a stage with no other owner`);
    }
    if (has('data-lift')) {
      const clash = LIFT_EXCLUSIVE.filter(has);
      if (clash.length) error('owner', where, `${describe(el)}: data-lift with ${clash.join(', ')} — both own translate`);
    }
    if (has('data-scrub') && !SCRUB_VALUES.has(el.attrs.get('data-scrub'))) {
      error('vocabulary', where, `${describe(el)}: data-scrub="${el.attrs.get('data-scrub')}" is not one of ${[...SCRUB_VALUES].join(', ')}`);
    }
    if (el.classes.has('line__inner') && TRANSFORMING_ATTRS.some(has)) {
      error('owner', where, `${describe(el)}: .line__inner belongs to the line reveal (and is the LCP h1)`);
    }
  }

  // Rule 6, forbidden ancestors: this page's fixed layers decide which
  // elements may never transform, on top of the plan's fixed list.
  const forbidden = new Set();
  for (const el of elements) {
    if (FORBIDDEN_TAGS.has(el.tag) || FORBIDDEN_CLASSES.some((c) => el.classes.has(c))) forbidden.add(el);
    if (FIXED_LAYERS.some((c) => el.classes.has(c))) {
      for (let a = el.parent; a; a = a.parent) forbidden.add(a);
    }
  }
  const forbiddenClasses = new Set(FORBIDDEN_CLASSES);
  const forbiddenIds = new Set();
  for (const el of forbidden) {
    el.classes.forEach((c) => forbiddenClasses.add(c));
    if (el.attrs.get('id')) forbiddenIds.add(el.attrs.get('id'));
    const attrs = TRANSFORMING_ATTRS.filter((a) => el.attrs.has(a));
    if (attrs.length) error('forbidden-ancestor', where, `${describe(el)} carries ${attrs.join(', ')} but is an ancestor of a fixed layer`);
    const style = el.attrs.get('style');
    if (style) {
      for (const decl of style.split(';')) {
        const colon = decl.indexOf(':');
        if (colon < 1) continue;
        const d = { prop: decl.slice(0, colon).trim().toLowerCase(), value: decl.slice(colon + 1).trim() };
        if (containingBlockDecl(d)) error('forbidden-ancestor', where, `${describe(el)} has inline ${d.prop}: ${d.value}`);
      }
    }
    if (el.classes.has('press')) {
      warn('forbidden-ancestor', where, `${describe(el)} has .press: its :active scale must be confined to touch (hover: none), or a desktop click moves the fixed plate`);
    }
  }

  for (const css of [...page.styles, ...(page.linkedStyles ?? [])]) {
    for (const rule of parseCss(css)) {
      if (rule.prelude.startsWith('@') || rule.context.some((c) => /^@(?:-\w+-)?keyframes\b/i.test(c))) continue;
      const selectors = resolveSelectors(rule);

      // Rule 6 in CSS.
      const bad = rule.decls.filter(containingBlockDecl);
      if (bad.length) {
        const outsidePreview = rule.context.some((c) => OUTSIDE_PREVIEW_LAYOUT.test(c));
        for (const selector of selectors) {
          const s = compoundParts(subjectOf(selector));
          if (s.pseudoElement) continue;
          if (
            outsidePreview &&
            !FORBIDDEN_TAGS.has(s.tag) &&
            !s.root &&
            s.ids.length === 0 &&
            s.classes.length > 0 &&
            s.classes.every((c) => PLATE_ONLY_ANCESTORS.has(c) || !forbiddenClasses.has(c))
          ) continue;
          const hit =
            FORBIDDEN_TAGS.has(s.tag) ||
            s.root ||
            s.classes.some((c) => forbiddenClasses.has(c)) ||
            s.ids.some((i) => forbiddenIds.has(i));
          if (hit) {
            error('forbidden-ancestor', where, `\`${selector}\` sets ${bad.map((d) => `${d.prop}: ${d.value}`).join('; ')} on an ancestor of a fixed layer`);
          }
        }
      }

      // The triple gate (§5.1): every scroll-driven animation is inside
      // @supports, the no-preference media query and :not([data-calm]).
      const timeline = rule.decls.find((d) => d.prop === 'animation-timeline' && !/^(?:auto|none|initial|unset)$/i.test(d.value));
      if (timeline) {
        const supports = rule.context.some((c) => /^@supports\b/i.test(c) && /animation-timeline/i.test(c) && !/\bnot\b/i.test(c));
        const media = rule.context.some((c) => /^@media\b/i.test(c) && /prefers-reduced-motion\s*:\s*no-preference/i.test(c));
        const ungated = selectors.filter((s) => !/:not\(\s*\[\s*data-calm\s*\]\s*\)/.test(s));
        const missing = [!supports && '@supports (animation-timeline)', !media && '@media (prefers-reduced-motion: no-preference)', ungated.length && ':not([data-calm])'].filter(Boolean);
        if (missing.length) {
          error('triple-gate', where, `\`${selectors[0]}\` sets animation-timeline: ${timeline.value} outside ${missing.join(' + ')}`);
        }
      }

      // Rule 7: a preserve-3d stage never carries what flattens it.
      if (rule.decls.some((d) => d.prop === 'transform-style' && /preserve-3d/i.test(d.value))) {
        const flat = rule.decls.filter(flattensDecl);
        if (flat.length) {
          error('flatten', where, `\`${selectors[0]}\` is preserve-3d but sets ${flat.map((d) => `${d.prop}: ${d.value}`).join('; ')}`);
        }
      }
    }
  }

  // §3.15: the gate and the 404 run no depth code.
  if (page.type === 'gate' || page.type === '404') {
    for (const marker of DEPTH_MARKERS) {
      if (initial.text.includes(marker)) error('gate-js', where, `initial JS contains "${marker}": the depth runtime must not load here`);
    }
  }

  // CSP: scripts come from 'self' only.
  for (const { attrs } of page.scripts) {
    const src = attrs.get('src');
    if (src && /^(?:https?:)?\/\//i.test(src)) error('csp', where, `external script ${src} — no CDN`);
  }
}

/** The CSP promises of the plan: no string-to-code, no blob: workers. */
function lintChunks(site, { error }) {
  for (const [path, chunk] of site.chunks) {
    if (/(?<![\w$.])eval\s*\(/.test(chunk.text)) error('csp', path, 'calls eval()');
    if (/\bnew\s+Function\s*\(/.test(chunk.text)) error('csp', path, 'calls new Function()');
    if (/["'`]blob:/.test(chunk.text)) error('csp', path, 'references a blob: URL');
    if (/\bnew\s+(?:Shared)?Worker\s*\(/.test(chunk.text)) error('csp', path, 'starts a Worker');
  }
}

// ───────────────────────────────────────────────────────────── baseline

async function writeBaseline({ dist, file }) {
  const site = await readSite(dist);
  if (site.pages.length === 0) throw new Error(`No pages in ${dist} — build first.`);
  const pages = {};
  const types = {};
  for (const page of site.pages) {
    const m = measurePage(page, site.chunks);
    pages[page.route] = m;
    const t = (types[m.type] ??= { pages: 0, css: { min: Infinity, max: 0 }, js: { min: Infinity, max: 0 }, html: { min: Infinity, max: 0 } });
    t.pages += 1;
    for (const k of ['css', 'js', 'html']) {
      t[k].min = Math.min(t[k].min, m[k]);
      t[k].max = Math.max(t[k].max, m[k]);
    }
  }
  let commit = null;
  try {
    commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    // Not a checkout: the numbers stand on their own.
  }
  const baseline = {
    $comment:
      'Pre-change measurements for scripts/check-budget.mjs. Bytes, gzip level 9, each file on its own. ' +
      'css = every inline <style> on the page; js = inline scripts + the static import closure of its module scripts. ' +
      'Regenerate ONLY from the commit before the motion-depth work: node scripts/check-budget.mjs --write-baseline',
    measuredAt: new Date().toISOString().slice(0, 10),
    commit,
    pages: site.pages.length,
    js: { total: [...site.chunks.values()].reduce((s, c) => s + c.gz, 0), files: site.chunks.size },
    types,
    routes: pages,
  };
  await writeFile(file, `${JSON.stringify(baseline, null, 2)}\n`);
  return baseline;
}

/** The file stores per-route numbers under `routes`; checks read `pages`. */
function loadBaseline(json) {
  return { ...json, pages: json.routes ?? {} };
}

// ─────────────────────────────────────────────────────────────── report

function printReport(result, baseline) {
  const out = [];
  out.push(`motion-depth budget — ${result.pages} pages against the baseline from ${baseline.commit ?? 'unknown commit'} (${baseline.measuredAt})`);
  out.push('');
  out.push('  page type     pages   inline CSS gz Δ   cap    initial JS gz Δ   cap    worst page');
  for (const [type, row] of Object.entries(result.byType).sort()) {
    const cap = PAGE_CAPS[type] ?? PAGE_CAPS.other;
    const worst = row.css.delta / cap.css >= row.js.delta / cap.js ? row.css.route : row.js.route;
    out.push(
      `  ${type.padEnd(13)} ${String(row.pages).padStart(5)}   ${signed(row.css.delta).padStart(15)}   ${String(cap.css).padStart(3)}    ${signed(row.js.delta).padStart(15)}   ${String(cap.js).padStart(3)}    ${worst ?? ''}`,
    );
  }
  out.push('');
  for (const l of result.lazy) {
    out.push(`  lazy ${l.id.padEnd(24)} ${l.files.length ? `${fmt(l.bytes)} gz / ${l.cap} KB  (${l.files.join(', ')})` : `not built yet (cap ${l.cap} KB)`}`);
  }
  out.push(`  all JS                        ${fmt(result.totalJs)} gz, ${signed(result.totalDelta)} / +${TOTAL_NEW_JS_CAP} KB`);
  out.push(`  depth.css                     ${result.depthCssBytes === null ? `not built yet (cap ${DEPTH_CSS_CAP} KB)` : `${fmt(result.depthCssBytes)} gz / ${DEPTH_CSS_CAP} KB`}`);
  out.push('');
  for (const w of result.warnings) out.push(`  warn  [${w.rule}] ${w.where}: ${w.message}`);
  for (const e of result.errors) out.push(`  FAIL  [${e.rule}] ${e.where}: ${e.message}`);
  out.push(
    result.errors.length
      ? `\n✗ ${result.errors.length} error(s), ${result.warnings.length} warning(s).`
      : `✓ within budget; lint clean${result.warnings.length ? ` (${result.warnings.length} warning(s))` : ''}.`,
  );
  console.log(out.join('\n'));
}

// ──────────────────────────────────────────────────────────── self-test

/**
 * `npm run budget` must fail on a seeded violation of each kind (W8
 * acceptance). A minimal site is built in a temp directory, measured into a
 * baseline, then broken one way at a time.
 */
async function selfTest() {
  const noise = (bytes) => randomBytes(bytes).toString('base64');
  const GATED =
    '@supports (animation-timeline: view()){@media (prefers-reduced-motion:no-preference){' +
    ':root:not([data-calm]) [data-depth=drift]{animation:d linear both;animation-timeline:view();animation-range:cover}}}';

  const homeBody = (extra = '') => `
    <div class="transition-cover" data-transition-cover></div>
    <main id="main"><section class="hero"><div class="hero__rules"><span data-depth="drift"></span></div>
      <p data-reveal>Statement</p>${extra}</section>
      <section class="work"><div class="wrap"><ul class="work__list">
        <li class="project" data-reveal><a class="project__link" href="/en/projects/x/">
          <span class="project__plate"><span class="project__plate-tilt" data-tilt><svg data-visual="grid"></svg></span></span>
        </a></li></ul></div></section></main>`;

  const page = ({ css = '', scripts = '', body = '' }) =>
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style>${scripts}</head><body>${body}</body></html>`;

  async function fixture(dir, mutate = {}) {
    const f = {
      'index.html': page({ css: 'body{margin:0}', scripts: '<script type="module" src="/_astro/gate.js"></script>', body: '<main></main>' }),
      '404.html': page({ css: 'body{margin:0}', scripts: '<script type="module" src="/_astro/gate.js"></script>', body: '<main></main>' }),
      'en/index.html': page({
        css: `.hero{position:relative}${GATED}`,
        scripts: '<script>document.documentElement.classList.add("js")</script><script type="module" src="/_astro/home.js"></script>',
        body: homeBody(),
      }),
      'en/projects/x/index.html': page({ css: '.case{display:grid}', scripts: '<script type="module" src="/_astro/home.js"></script>', body: '<main><h1>x</h1></main>' }),
      'en/lab/index.html': page({ css: '.lab{display:grid}', scripts: '<script type="module" src="/_astro/home.js"></script>', body: '<main></main>' }),
      '_astro/env.js': `export const r=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;`,
      '_astro/gate.js': `import{r}from"./env.js";r();`,
      '_astro/home.js': `import{r}from"./env.js";r()||import("./later.js");`,
      '_astro/later.js': `export const later=1;`,
      ...mutate,
    };
    for (const [rel, content] of Object.entries(f)) {
      if (content === null) continue;
      const path = join(dir, rel);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content);
    }
  }

  const work = await mkdtemp(join(tmpdir(), 'budget-self-test-'));
  const smallDepthCss = join(work, 'depth-small.css');
  await writeFile(smallDepthCss, GATED);

  const clean = join(work, 'clean');
  await fixture(clean);
  const baselineFile = join(work, 'baseline.json');
  const baseline = loadBaseline(await writeBaseline({ dist: clean, file: baselineFile }));

  const home = (opts) => ({ 'en/index.html': page({ css: `.hero{position:relative}${GATED}`, scripts: '<script type="module" src="/_astro/home.js"></script>', body: homeBody(), ...opts }) });

  const cases = [
    ['budget-css', home({ css: `.hero{position:relative}/*${noise(9000)}*/` })],
    ['budget-js', { '_astro/big.js': `export const b="${noise(4000)}";`, '_astro/home.js': `import"./big.js";import("./later.js");` }],
    ['chunk-cap', { '_astro/tilt.AbC123.js': `export const t="${noise(2600)}";`, '_astro/home.js': `import("./tilt.AbC123.js");` }],
    ['lazy-on-initial', { '_astro/tilt.AbC123.js': `export const t=1;`, '_astro/home.js': `import"./tilt.AbC123.js";` }],
    ['total-js', { '_astro/unreferenced.js': `export const u="${noise(80000)}";` }],
    ['depth-css', {}, { depthCss: join(work, 'depth-big.css') }],
    ['owner', home({ body: homeBody('<p data-reveal data-depth="rise">x</p>') })],
    ['owner', home({ body: homeBody('<div data-tilt data-magnetic>x</div>') })],
    ['owner', home({ body: homeBody('<span class="line__inner" data-depth="rise">x</span>') })],
    ['vocabulary', home({ body: homeBody('<div data-depth="rize">x</div>') })],
    ['forbidden-ancestor', home({ body: homeBody().replace('class="project__link"', 'class="project__link" data-tilt') })],
    ['forbidden-ancestor', home({ css: '.wrap{will-change:transform}' })],
    ['forbidden-ancestor', home({ css: '.work{filter:blur(1px)}' })],
    ['forbidden-ancestor', home({ css: 'main{contain:paint}' })],
    // The card-layout exemption must not reach `.wrap`: the transition cover sits under it in every layout.
    ['forbidden-ancestor', home({ css: '@media not all and (min-width:62rem) and (hover:hover) and (pointer:fine){.wrap:active{scale:.98}}' })],
    ['triple-gate', home({ css: '.x{animation:a linear;animation-timeline:view()}' })],
    ['triple-gate', home({ css: '@supports (animation-timeline:view()){.x{animation-timeline:scroll(root)}}' })],
    ['flatten', home({ css: '.stage{transform-style:preserve-3d;overflow:hidden}' })],
    ['gate-js', { '_astro/gate.js': `import{r}from"./env.js";document.documentElement.classList.add("depth-ready");` }],
    ['csp', { '_astro/later.js': `export const f=new Function("return 1");` }],
    ['csp', home({ scripts: '<script src="https://cdn.example.com/x.js"></script>' })],
  ];
  await writeFile(join(work, 'depth-big.css'), `.x{content:"${noise(4000)}"}`);

  let failures = 0;
  const report = (ok, label) => {
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}`);
    if (!ok) failures += 1;
  };

  const cleanResult = await runChecks({ dist: clean, baseline, depthCss: smallDepthCss });
  report(cleanResult.errors.length === 0, `clean fixture passes${cleanResult.errors.length ? ` — ${cleanResult.errors.map((e) => `[${e.rule}] ${e.message}`).join('; ')}` : ''}`);

  // The phone card's press lives outside the cursor-preview layout, where the
  // plate is in flow, not fixed: it must not be reported.
  const cardPress = join(work, 'card-press');
  await fixture(cardPress, home({ css: `.hero{position:relative}${GATED}@media not all and (min-width:62rem) and (hover:hover) and (pointer:fine){.project__link:active{scale:.985}}` }));
  const cardPressResult = await runChecks({ dist: cardPress, baseline, depthCss: smallDepthCss });
  const cardPressErrors = cardPressResult.errors.filter((e) => e.rule === 'forbidden-ancestor');
  report(cardPressErrors.length === 0, `card-layout press on .project__link is allowed${cardPressErrors.length ? ` — ${cardPressErrors.map((e) => e.message).join('; ')}` : ''}`);

  for (const [i, [rule, files, opts = {}]] of cases.entries()) {
    const dir = join(work, `case-${i}`);
    await fixture(dir, files);
    const result = await runChecks({ dist: dir, baseline, depthCss: opts.depthCss ?? smallDepthCss });
    const hit = result.errors.some((e) => e.rule === rule);
    report(hit, `seeded ${rule.padEnd(18)} → ${hit ? result.errors.find((e) => e.rule === rule).message.slice(0, 90) : `not caught (got ${result.errors.map((e) => e.rule).join(', ') || 'nothing'})`}`);
  }

  await rm(work, { recursive: true, force: true });
  console.log(failures ? `\n✗ self-test: ${failures} check(s) did not behave.` : `\n✓ self-test: every seeded violation fails the build, the clean site passes.`);
  return failures === 0;
}

// ───────────────────────────────────────────────────────────────── main

/** Runs only as a script, so the parsers and checks can also be imported. */
async function main(args) {
  const option = (name, fallback) => {
    const at = args.indexOf(name);
    return at === -1 ? fallback : args[at + 1];
  };
  const dist = resolve(root, option('--dist', 'dist'));
  const baselineFile = resolve(root, option('--baseline', 'scripts/budget-baseline.json'));

  if (args.includes('--self-test')) return (await selfTest()) ? 0 : 1;

  if (args.includes('--write-baseline')) {
    const b = await writeBaseline({ dist, file: baselineFile });
    console.log(`Baseline written: ${b.pages} pages, ${fmt(b.js.total)} JS gz, commit ${b.commit ?? 'unknown'} → ${relative(root, baselineFile)}`);
    return 0;
  }

  if (!existsSync(baselineFile)) {
    console.error(`No baseline at ${relative(root, baselineFile)}.`);
    return 1;
  }
  const baseline = loadBaseline(JSON.parse(await readFile(baselineFile, 'utf8')));
  const result = await runChecks({ dist, baseline });
  printReport(result, baseline);
  return result.errors.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
