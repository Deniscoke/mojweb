/**
 * Narrow WebP siblings for the evidence images, so phones download a file
 * sized for their screen instead of the full desktop capture.
 *
 *   npm run images
 *
 * Writes `name-640w.webp` and `name-960w.webp` next to each raster in
 * public/media/evidence/. Originals are never touched. MediaFigure only
 * offers a variant in `srcset` if the file exists, so running this is an
 * optimisation, never a requirement.
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const DIR = 'public/media/evidence';
const WIDTHS = [640, 960];
const VARIANT = /-\d+w\.webp$/;

const files = (await readdir(DIR)).filter((f) => /\.(webp|png|jpe?g)$/i.test(f) && !VARIANT.test(f));

for (const file of files) {
  const src = join(DIR, file);
  const { width } = await sharp(src).metadata();
  for (const w of WIDTHS) {
    if (!width || w >= width) continue;
    const out = join(DIR, file.replace(/\.(webp|png|jpe?g)$/i, `-${w}w.webp`));
    await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(out);
    const { size } = await stat(out);
    console.log(`  ${out}  ${Math.round(size / 1024)} KB`);
  }
}
