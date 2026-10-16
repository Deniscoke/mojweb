/**
 * Image variants for evidence and photographs.
 *
 *   npm run images                                  evidence variants + photo manifest
 *   npm run images -- --photo <file|folder> ...     add or replace photographs
 *   npm run images -- --evidence <file|folder> ...  add a case-study photo as evidence
 *
 * EVIDENCE: writes `name-640w.webp` and `name-960w.webp` next to each raster
 * in public/media/evidence/. Originals are never touched. MediaFigure only
 * offers a variant in `srcset` if the file exists, so running this is an
 * optimisation, never a requirement.
 *
 * PHOTOGRAPHS: each master passed with `--photo` is read from wherever Denis
 * keeps it — never copied into the repository, because a camera or phone
 * original carries EXIF, often including GPS, and anything under public/ is
 * deployed as-is. From it the script writes, into public/media/photos/:
 *
 *   <stem>-640w.webp, -960w.webp, -1440w.webp   auto-oriented, sRGB,
 *                                               every byte of metadata stripped
 *
 * and records each image's intrinsic size and a 24 px blurred placeholder
 * (a data: URI, which the CSP's img-src already allows) in
 * src/data/generated/photos.json. `<stem>` is the master's file name in kebab
 * case: `Circus Juggling.JPG` becomes `circus-juggling`, which is the `src`
 * an entry in src/data/photos.ts refers to.
 *
 * `--evidence` takes the same kind of master through the same clean
 * re-encode, but writes one 1440 px `<stem>.webp` into public/media/evidence/
 * for a case study, where the evidence pass above adds its variants.
 *
 * Every run rebuilds the manifest from what is in public/media/photos/, so
 * deleting a photo's variants and running `npm run images` removes it.
 * The brief for Denis is public/media/photos/README.md.
 */
import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const RASTER = /\.(webp|png|jpe?g|tiff?|heic|heif|avif)$/i;
const VARIANT = /-(\d+)w\.webp$/;

/* --------------------------------------------------------------- evidence */

const EVIDENCE_DIR = 'public/media/evidence';
const EVIDENCE_WIDTHS = [640, 960];

async function buildEvidence() {
  const files = (await readdir(EVIDENCE_DIR)).filter(
    (f) => /\.(webp|png|jpe?g)$/i.test(f) && !VARIANT.test(f),
  );

  for (const file of files) {
    const src = join(EVIDENCE_DIR, file);
    const { width } = await sharp(src).metadata();
    for (const w of EVIDENCE_WIDTHS) {
      if (!width || w >= width) continue;
      const out = join(EVIDENCE_DIR, file.replace(/\.(webp|png|jpe?g)$/i, `-${w}w.webp`));
      await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(out);
      const { size } = await stat(out);
      console.log(`  ${out}  ${Math.round(size / 1024)} KB`);
    }
  }
}

/* ------------------------------------------------------------ photographs */

const PHOTO_DIR = 'public/media/photos';
const MANIFEST = 'src/data/generated/photos.json';
const PHOTO_WIDTHS = [640, 960, 1440];
/** The brief asks for this much on the long edge; less still works, with a warning. */
const MIN_LONG_EDGE = 2400;
const LQIP_WIDTH = 24;

/** `Cirkus – Žonglování 02.JPG` → `cirkus-zonglovani-02` */
const stemOf = (file) =>
  basename(file, extname(file))
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * `--photo a.jpg b.jpg --evidence c.jpg --photo folder/` →
 * `{ photo: [a, b, …folder], evidence: [c] }`, folders expanded.
 */
async function mastersFromArgs(argv) {
  const named = { photo: [], evidence: [] };
  let mode = null;
  for (const arg of argv) {
    if (arg === '--photo' || arg === '--photos') mode = 'photo';
    else if (arg === '--evidence') mode = 'evidence';
    else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else if (mode) named[mode].push(arg);
    else throw new Error(`Say what ${arg} is for: --photo or --evidence`);
  }
  return { photo: await expand(named.photo), evidence: await expand(named.evidence) };
}

async function expand(paths) {
  const masters = [];
  for (const path of paths) {
    if (!existsSync(path)) throw new Error(`No such file or folder: ${path}`);
    if ((await stat(path)).isDirectory()) {
      for (const f of (await readdir(path)).sort()) if (RASTER.test(f)) masters.push(join(path, f));
    } else {
      masters.push(path);
    }
  }
  return masters;
}

/**
 * A placeholder that is only ever seen for the moment before the real image
 * decodes: the photo's own colours, 24 px wide, softened so the browser's
 * upscale reads as blur rather than as blocks.
 */
async function lqipOf(input) {
  const buf = await sharp(input)
    .rotate()
    .resize({ width: LQIP_WIDTH })
    .blur(0.6)
    .toColourspace('srgb')
    .webp({ quality: 50 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

async function removeVariants(stem) {
  for (const f of await readdir(PHOTO_DIR)) {
    const m = f.match(VARIANT);
    if (m && f.slice(0, -m[0].length) === stem) await rm(join(PHOTO_DIR, f));
  }
}

/**
 * Opens a master the right way up. `rotate()` with no angle applies the EXIF
 * orientation before the metadata is dropped, so portrait phone photos stay
 * portrait; the size returned is the size as displayed.
 */
async function openMaster(path) {
  const stem = stemOf(path);
  if (!stem) throw new Error(`Cannot derive a name from ${path}`);
  const oriented = sharp(path, { failOn: 'error' }).rotate();
  const meta = await sharp(path).metadata();
  // EXIF orientations 5–8 are quarter turns: the stored width is the height.
  const turned = (meta.orientation ?? 1) >= 5;
  const width = turned ? meta.height : meta.width;
  const height = turned ? meta.width : meta.height;
  if (Math.max(width, height) < MIN_LONG_EDGE) {
    console.warn(`  ! ${basename(path)} is ${width}×${height}; the brief asks for ${MIN_LONG_EDGE} px on the long edge.`);
  }
  return { stem, oriented, width, height };
}

/** sharp writes no metadata unless asked to: no EXIF, no GPS, no XMP. */
const cleanWebp = (oriented, w) =>
  oriented
    .clone()
    .resize({ width: w })
    .toColourspace('srgb')
    .webp({ quality: 80, smartSubsample: true, effort: 5 });

/**
 * A case-study photo is evidence: it goes to public/media/evidence/ as one
 * clean 1440 px WebP (the evidence pass then adds its -640w/-960w), and is
 * registered in src/data/evidence.ts as `kind: 'photo'` with the size printed.
 */
async function importEvidence(path) {
  const { stem, oriented, width, height } = await openMaster(path);
  const w = Math.min(1440, width);
  const out = join(EVIDENCE_DIR, `${stem}.webp`);
  await cleanWebp(oriented, w).toFile(out);
  console.log(`  ${out}  →  evidence.ts: file: '${stem}.webp', width: ${w}, height: ${Math.round((height * w) / width)}`);
}

/** Writes one master's variants and returns its placeholder. */
async function processMaster(path) {
  const { stem, oriented, width } = await openMaster(path);

  await removeVariants(stem);
  const widths = PHOTO_WIDTHS.filter((w) => w <= width);
  if (!widths.length) widths.push(width);

  for (const w of widths) {
    const out = join(PHOTO_DIR, `${stem}-${w}w.webp`);
    await cleanWebp(oriented, w).toFile(out);
    const { size } = await stat(out);
    console.log(`  ${out}  ${Math.round(size / 1024)} KB`);
  }

  return { stem, lqip: await lqipOf(path) };
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

/** Rebuilds the manifest from the variants actually on disk. */
async function writeManifest(fresh) {
  const previous = await readManifest();
  const groups = new Map();
  for (const f of await readdir(PHOTO_DIR)) {
    const m = f.match(VARIANT);
    if (!m) continue;
    const stem = f.slice(0, -m[0].length);
    const list = groups.get(stem) ?? [];
    list.push({ width: Number(m[1]), file: f });
    groups.set(stem, list);
  }

  const manifest = {};
  for (const stem of [...groups.keys()].sort()) {
    const variants = groups.get(stem).sort((a, b) => a.width - b.width);
    const largest = join(PHOTO_DIR, variants.at(-1).file);
    const { width, height } = await sharp(largest).metadata();
    const lqip = fresh.get(stem) ?? previous[stem]?.lqip ?? (await lqipOf(join(PHOTO_DIR, variants[0].file)));
    manifest[stem] = { width, height, variants, lqip };
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`  ${MANIFEST}  ${Object.keys(manifest).length} photo(s)`);
}

/** A master left inside public/ would ship with its EXIF. Say so, loudly. */
async function warnAboutMastersInPublic() {
  for (const f of await readdir(PHOTO_DIR)) {
    if (RASTER.test(f) && !VARIANT.test(f) && !/-depth\.webp$/.test(f)) {
      console.warn(
        `  ! ${join(PHOTO_DIR, f)} looks like a master. Everything in public/ is deployed as-is, ` +
          `metadata included. Move it out of the repository and run: npm run images -- --photo <path>`,
      );
    }
  }
}

async function buildPhotos(masters) {
  const fresh = new Map();
  for (const path of masters) {
    const { stem, lqip } = await processMaster(path);
    fresh.set(stem, lqip);
  }
  await warnAboutMastersInPublic();
  await writeManifest(fresh);
}

const masters = await mastersFromArgs(process.argv.slice(2));
for (const path of masters.evidence) await importEvidence(path);
await buildEvidence();
await buildPhotos(masters.photo);
