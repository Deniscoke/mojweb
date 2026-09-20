/**
 * Rasterises the Open Graph images in public/assets/.
 *
 * Social platforms do not render SVG Open Graph images, so an SVG is the
 * editable source and the PNG is the artefact. `sharp` is a devDependency —
 * nothing in this pipeline ships to the browser.
 *
 *   npm run og
 *
 * Two kinds of output:
 *
 *   1. The hand-authored cards (og-default, og-laby), rasterised from
 *      src/assets/*.svg.
 *   2. One card per project, in public/assets/og/<slug>.png, composed here
 *      from the project's own evidence.
 *
 * WHY THE PROJECT CARDS ARE BUILT, NOT DRAWN
 * Every project page used to share og-default.png, so sending someone a link
 * to one specific project previewed exactly like sending them the homepage.
 * Drawing five cards by hand would have worked once and then drifted the
 * first time a title changed. Composing them from the same data the site
 * renders means a card cannot disagree with its page.
 *
 * WHAT GOES ON A CARD
 * The project's first real artefact, if it has one — the same screenshot or
 * diagram the case study shows. A project with no evidence gets a field in
 * its own accent colour instead. That is deliberately not a picture of
 * anything: there is no photograph of the circus or snowboard work yet, and
 * inventing one for a share card would be the exact spectacle the rest of
 * this site refuses.
 *
 * This is an authoring step, not part of `astro build`. The PNGs are
 * committed, so the deploy has nothing to rasterise and no fonts to find.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { EVIDENCE, type EvidenceSpec } from '../src/data/evidence.ts';
import { projectsData } from '../src/data/generated/projects.data.ts';

const root = resolve(import.meta.dirname, '..');

const W = 1200;
const H = 630;

/** Site palette, from src/styles/tokens.css. */
const INK = '#08080a';
const BONE = '#ebe7de';
const BONE_DIM = '#a7a29a';
const BONE_FAINT = '#85817a';
const LINE = '#23232b';

// ──────────────────────────────────────────────────────────── hand-authored

/** [source SVG, target PNG] */
const STATIC_IMAGES: Array<[string, string]> = [
  ['src/assets/og.svg', 'public/assets/og-default.png'],
  ['src/assets/og-laby.svg', 'public/assets/og-laby.png'],
];

// ───────────────────────────────────────────────────────────────── helpers

/**
 * oklch(L C H) to sRGB hex.
 *
 * The site expresses every project accent as `oklch(0.74 0.18 <hue>)`, which
 * librsvg cannot parse. Converting here rather than hand-picking a hex per
 * project keeps the card the same colour as the plate on the homepage, for
 * free, forever.
 */
function oklchToHex(L: number, C: number, hueDeg: number): string {
  const h = (hueDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return `#${linear
    .map((v) => {
      const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(v, 0) ** (1 / 2.4) - 0.055;
      return Math.round(Math.min(1, Math.max(0, srgb)) * 255)
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
}

/** SVG is XML: an unescaped `&` in "Web & Digital Work" is a parse error. */
function xml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Greedy wrap against an estimated advance width.
 *
 * There is no text metrics API out here, so the width is estimated from the
 * font size. Arial Bold averages a little under 0.6em across mixed-case Latin;
 * 0.58 errs on the side of wrapping one word early, which costs a little
 * space and never overflows the card.
 */
function wrap(text: string, fontSize: number, maxWidth: number): string[] {
  const perChar = fontSize * 0.58;
  const lines: string[] = [];
  let line = '';

  // A separator is not a word. Left alone, "Moodpack / Director" wraps onto
  // three lines with a solitary slash stranded in the middle of the card, so
  // punctuation-only tokens are folded back onto the word before them.
  const words = text.split(/\s+/).reduce<string[]>((acc, word) => {
    if (acc.length > 0 && /^[^\p{L}\p{N}]+$/u.test(word)) {
      acc[acc.length - 1] += ` ${word}`;
    } else {
      acc.push(word);
    }
    return acc;
  }, []);

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length * perChar > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Shrinks the title until it fits the text column in at most three lines. */
function fitTitle(text: string, maxWidth: number): { size: number; lines: string[] } {
  for (let size = 84; size >= 44; size -= 4) {
    const lines = wrap(text, size, maxWidth);
    if (lines.length <= 3) return { size, lines };
  }
  return { size: 44, lines: wrap(text, 44, maxWidth) };
}

function englishOf(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'en' in value) {
    return String((value as { en: unknown }).en);
  }
  return '';
}

// ────────────────────────────────────────────────────────── the card itself

const TEXT_COLUMN = 480;

/** The framed artefact on the right of the card. */
const PLATE = { x: 640, y: 132, w: 500, h: 366 };

/**
 * The ground: ink, the site's vertical rules, and — only when the project has
 * no artefact to show — a field in its own accent colour.
 */
function buildGround(accent: string, hasPlate: boolean): Buffer {
  const glow = hasPlate
    ? ''
    : `<rect width="${W}" height="${H}" fill="url(#glow)"/>`;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <radialGradient id="glow" cx="0.76" cy="0.44" r="0.6">
          <stop offset="0" stop-color="${accent}" stop-opacity="0.38"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="${INK}"/>
      ${glow}
      <g stroke="${LINE}" stroke-width="1">
        <path d="M80 0v630M380 0v630M680 0v630M980 0v630"/>
      </g>
    </svg>`);
}

/**
 * The artefact, letterboxed into the plate rather than cropped.
 *
 * `contain`, not `cover`, and that is the whole point: a screenshot is itself
 * a composition with its own headline and its own navigation. Cropping it to
 * fill a panel throws away the part that identifies it, and overlaying type
 * on top of it puts two typographic compositions in one frame, which reads as
 * neither. The letterbox bars are ink, so they vanish into the card.
 */
async function buildPlate(evidence: EvidenceSpec): Promise<Buffer | null> {
  const file = resolve(root, 'public/media/evidence', evidence.file);
  if (!existsSync(file)) return null;

  return sharp(file, { density: 200 })
    .resize(PLATE.w, PLATE.h, { fit: 'contain', background: INK })
    .toBuffer();
}

/** Every piece of type, plus the hairline around the plate. */
function buildOverlay(
  title: string,
  category: string,
  accent: string,
  hasPlate: boolean,
): Buffer {
  const { size, lines } = fitTitle(title, TEXT_COLUMN);

  // The title block is bottom-aligned to a fixed baseline, so a one-line and
  // a three-line title both sit against the same horizontal rule instead of
  // drifting up and down the card.
  const leading = size * 1.06;
  const lastBaseline = 420;
  const firstBaseline = lastBaseline - (lines.length - 1) * leading;

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="76" y="${Math.round(firstBaseline + i * leading)}">${xml(line)}</tspan>`,
    )
    .join('');

  const frame = hasPlate
    ? `<rect x="${PLATE.x}" y="${PLATE.y}" width="${PLATE.w}" height="${PLATE.h}"
             fill="none" stroke="${LINE}" stroke-width="1"/>`
    : '';

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <g stroke="${LINE}" stroke-width="1">
        <path d="M0 96h1200M0 534h1200"/>
      </g>

      <text x="80" y="66" font-family="Consolas, 'DejaVu Sans Mono', monospace" font-size="20"
            letter-spacing="6" fill="${BONE_FAINT}">DENIS MITROVIĆ</text>

      <text font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="${size}"
            letter-spacing="-3" fill="${BONE}">${tspans}</text>

      <path d="M80 462h84" stroke="${accent}" stroke-width="3"/>

      <text x="80" y="586" font-family="Consolas, 'DejaVu Sans Mono', monospace" font-size="20"
            letter-spacing="5" fill="${BONE_DIM}">${xml(category.toUpperCase())}</text>

      ${frame}
    </svg>`);
}

async function writePng(target: string, png: Buffer): Promise<void> {
  const path = resolve(root, target);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, png);
  console.info(`${target} written (${(png.length / 1024).toFixed(1)} kB)`);
}

// ───────────────────────────────────────────────────────────────────── run

for (const [from, to] of STATIC_IMAGES) {
  const svg = await readFile(resolve(root, from));
  const png = await sharp(svg, { density: 144 })
    .resize(W, H, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writePng(to, png);
}

for (const project of projectsData) {
  const accent = oklchToHex(0.74, 0.18, project.hue);

  // The first artefact in display order, so the card leads with whatever the
  // case study leads with.
  const evidence = EVIDENCE.filter((spec) => spec.project === project.slug).sort(
    (a, b) => a.order - b.order,
  )[0];

  const plate = evidence ? await buildPlate(evidence) : null;
  const layers = [
    ...(plate ? [{ input: plate, top: PLATE.y, left: PLATE.x }] : []),
    {
      input: buildOverlay(
        englishOf(project.title),
        englishOf(project.category),
        accent,
        Boolean(plate),
      ),
      top: 0,
      left: 0,
    },
  ];

  const png = await sharp(buildGround(accent, Boolean(plate)))
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writePng(`public/assets/og/${project.slug}.png`, png);
}
