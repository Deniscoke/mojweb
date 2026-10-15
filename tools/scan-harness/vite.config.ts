import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

/**
 * The scan harness is a standalone Vite page outside Astro's routes, so it
 * never ships. It serves the real engine from src/ and the real scan files
 * from public/.
 *
 *   npx vite --config tools/scan-harness/vite.config.ts
 */
const at = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: at('.'),
  publicDir: at('../../public'),
  resolve: { alias: { '~': at('../../src') } },
  server: { port: 4612, strictPort: true },
  preview: { port: 4612, strictPort: true },
  // A build is only ever for measuring chunk sizes; keep it out of the repo.
  build: { outDir: join(tmpdir(), 'scan-harness-dist'), emptyOutDir: true },
});
