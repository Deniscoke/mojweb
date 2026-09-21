/**
 * Raster icons from public/favicon.svg.
 *
 *   npm run icons
 *
 * The SVG favicon is the source and stays the one modern browsers use. These
 * are for everything that cannot read it:
 *
 *   favicon.ico            16 + 32 px, for older browsers, feed readers and
 *                          anything that requests /favicon.ico blindly
 *   apple-touch-icon.png   180 px, for "Add to Home Screen" on iOS, which
 *                          ignores SVG and shows a blank tile without it
 *   icon-192/512.png       for the web manifest (Android home screen)
 *   icon-maskable-512.png  the same mark inside the maskable safe zone, so an
 *                          Android launcher that crops to a circle does not
 *                          cut the monogram
 *
 * An authoring step like `npm run og`: the PNGs are committed.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const INK = '#08080a';

const svg = await readFile(resolve(root, 'public/favicon.svg'));

/** The monogram, rasterised square at `size`, edge to edge. */
function render(size: number): Promise<Buffer> {
  return sharp(svg, { density: Math.ceil((size / 32) * 72) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * The monogram at 70% on an ink square. Maskable icons may be cropped to any
 * shape inside the central 80% circle; 70% keeps every stroke inside it.
 */
async function renderMaskable(size: number): Promise<Buffer> {
  const inner = Math.round(size * 0.7);
  const offset = Math.round((size - inner) / 2);
  return sharp({ create: { width: size, height: size, channels: 4, background: INK } })
    .composite([{ input: await render(inner), top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * ICO with PNG payloads (supported since Windows Vista and by every browser).
 * Layout: 6-byte header, one 16-byte directory entry per image, then the PNGs.
 */
function ico(images: Array<{ size: number; png: Buffer }>): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

async function write(name: string, data: Buffer): Promise<void> {
  await writeFile(resolve(root, 'public', name), data);
  console.info(`public/${name} written (${(data.length / 1024).toFixed(1)} kB)`);
}

await write('favicon.ico', ico([
  { size: 16, png: await render(16) },
  { size: 32, png: await render(32) },
]));
await write('apple-touch-icon.png', await render(180));
await write('icon-192.png', await render(192));
await write('icon-512.png', await render(512));
await write('icon-maskable-512.png', await renderMaskable(512));
