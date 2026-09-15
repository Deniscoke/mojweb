/**
 * Rasterises src/assets/og.svg to public/assets/og-default.png.
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
const source = resolve(root, 'src/assets/og.svg');
const target = resolve(root, 'public/assets/og-default.png');

const svg = await readFile(source);
const png = await sharp(svg, { density: 144 }).resize(1200, 630, { fit: 'fill' }).png({ compressionLevel: 9 }).toBuffer();

await mkdir(dirname(target), { recursive: true });
await writeFile(target, png);

console.info(`og-default.png written (${(png.length / 1024).toFixed(1)} kB)`);
