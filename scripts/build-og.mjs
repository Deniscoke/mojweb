/**
 * Rasterises the Open Graph SVG sources in src/assets/ to PNGs in
 * public/assets/.
 *
 * Social platforms do not render SVG Open Graph images, so the SVG is the
 * editable source and the PNG is the artefact. `sharp` is a devDependency —
 * nothing in this pipeline ships to the browser.
 *
 *   npm run og
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');

/** [source SVG, target PNG] */
const IMAGES = [
  ['src/assets/og.svg', 'public/assets/og-default.png'],
  ['src/assets/og-laby.svg', 'public/assets/og-laby.png'],
];

for (const [from, to] of IMAGES) {
  const svg = await readFile(resolve(root, from));
  const png = await sharp(svg, { density: 144 })
    .resize(1200, 630, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const target = resolve(root, to);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, png);

  console.info(`${to} written (${(png.length / 1024).toFixed(1)} kB)`);
}
