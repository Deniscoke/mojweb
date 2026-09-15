/**
 * BUILD-TIME MEDIA SNAPSHOT
 *
 * The problem this solves: Payload serves uploads from its own origin. A
 * static build that pointed <img src> at that origin would break the moment
 * the CMS was offline, and would make every visitor depend on the admin
 * server. Neither is acceptable for a static site.
 *
 * So at the end of a build, every published Media document is downloaded into
 * `dist/media/` under a deterministic name, and the pages reference that local
 * copy instead. The deployed site then carries its own images and needs
 * nothing from Payload at runtime.
 *
 * The filename scheme MUST stay identical to `localMediaPath()` in
 * `src/lib/cms/normalize.ts` — that is the one place the two halves have to
 * agree, and it is deliberately trivial: `<id>-<filename>`.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Keep in sync with localMediaPath() in src/lib/cms/normalize.ts. */
function localName(id, filename) {
  const safe = String(filename).replace(/[^a-zA-Z0-9._-]/g, '-');
  return `${id}-${safe}`;
}

export default function mediaSnapshot() {
  return {
    name: 'media-snapshot',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const cmsUrl = process.env.PUBLIC_CMS_URL || 'http://localhost:3000';
        const required = process.env.CMS_REQUIRED === 'true';

        let docs = [];
        try {
          const res = await fetch(`${cmsUrl}/api/media?limit=500&depth=0`, {
            signal: AbortSignal.timeout(5000),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          docs = (await res.json()).docs ?? [];
        } catch (err) {
          // No CMS means the build ran on fallback data, which references no
          // uploads at all — so there is nothing to snapshot and nothing broken.
          logger.info(`no media to snapshot (${err.message})`);
          return;
        }

        if (docs.length === 0) {
          logger.info('no media in CMS — nothing to snapshot');
          return;
        }

        const outDir = join(dir.pathname.replace(/^\/([A-Za-z]:)/, '$1'), 'media');
        await mkdir(outDir, { recursive: true });

        const failed = [];
        let written = 0;
        let bytes = 0;

        for (const doc of docs) {
          if (!doc.filename || !doc.url) continue;
          const name = localName(doc.id, doc.filename);
          const src = doc.url.startsWith('http') ? doc.url : `${cmsUrl}${doc.url}`;

          try {
            const r = await fetch(src, { signal: AbortSignal.timeout(20000) });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const buf = Buffer.from(await r.arrayBuffer());
            await writeFile(join(outDir, name), buf);
            written++;
            bytes += buf.length;
          } catch (err) {
            failed.push(`${name} (${err.message})`);
          }
        }

        logger.info(`snapshotted ${written} media file(s), ${(bytes / 1024).toFixed(0)} KB`);

        /**
         * A referenced upload that could not be fetched would ship as a broken
         * image. That is exactly the silent failure this iteration set out to
         * remove, so the build stops instead.
         */
        if (failed.length > 0) {
          const msg =
            `[media] ${failed.length} media file(s) could not be snapshotted:\n` +
            failed.map((f) => `  - ${f}`).join('\n');
          if (required) throw new Error(msg);
          logger.warn(`${msg}\n[media] pages referencing these will have broken images.`);
        }
      },
    },
  };
}
