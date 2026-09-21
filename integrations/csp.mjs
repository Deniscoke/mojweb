/**
 * CONTENT SECURITY POLICY, per page, from the built HTML.
 * ======================================================
 * After the build, every page gets a `<meta http-equiv="Content-Security-
 * Policy">` whose script-src lists the SHA-256 of each inline script on that
 * page and nothing else. No `'unsafe-inline'` for scripts: an injected
 * `<script>` would have no matching hash and would not run.
 *
 * WHY NOT ASTRO'S OWN `experimental.csp`
 * It hashes styles as well, and once style-src carries a hash, browsers ignore
 * `'unsafe-inline'` for it. This site sets 4,795 inline `style=""` attributes
 * (reveal delays, project hues, title sizing), which a hashed style-src
 * blocks — and the `style-src-attr` directive that would exempt them is not on
 * Astro's allowlist. So styles keep `'unsafe-inline'` here, deliberately: the
 * protection that matters against injection is on scripts.
 *
 * WHY HASHES AND NOT A NONCE
 * The site is static. A nonce has to be fresh per response, which a static
 * file cannot be; a hash of content that never changes after the build is
 * exactly as strong.
 *
 * WHAT CANNOT GO IN A META TAG
 * `frame-ancestors` (clickjacking protection) is ignored in a meta policy, so
 * it is sent as a header from vercel.json, together with the other response
 * headers.
 *
 * The policy only exists in `astro build` output. The dev server has none.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EMBED_ORIGINS } from '../src/data/embeds.ts';

/** `<script>` types that are data, not code. CSP does not govern them. */
const DATA_TYPES = /type\s*=\s*["']?application\/(?:ld\+)?json/i;

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

/**
 * Vercel injects its toolbar and Comments into preview deployments (never
 * production), from these origins — see Vercel's "Using a Content Security
 * Policy" note in the toolbar docs. Production keeps the strict policy.
 */
const PREVIEW = {
  script: ['https://vercel.live'],
  style: ['https://vercel.live'],
  img: ['https://vercel.live', 'https://vercel.com', 'blob:'],
  font: ['https://vercel.live', 'https://assets.vercel.com'],
  connect: ['https://vercel.live', 'wss://ws-us3.pusher.com'],
  frame: ['https://vercel.live'],
};

function policyFor(html, preview) {
  const extra = (kind) => (preview ? PREVIEW[kind] : []);
  const hashes = new Set();
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(attrs) || DATA_TYPES.test(attrs)) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }

  return [
    "default-src 'self'",
    ["script-src 'self'", ...extra('script'), ...hashes].join(' '),
    ["style-src 'self' 'unsafe-inline'", ...extra('style')].join(' '),
    ["img-src 'self' data:", ...extra('img')].join(' '),
    ["font-src 'self'", ...extra('font')].join(' '),
    ["connect-src 'self'", ...extra('connect')].join(' '),
    "media-src 'self'",
    ['frame-src', ...EMBED_ORIGINS, ...extra('frame')].join(' '),
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/** `vercelEnv` is VERCEL_ENV at build time: 'production', 'preview' or unset. */
export default function csp({ vercelEnv } = {}) {
  const preview = vercelEnv === 'preview';
  return {
    name: 'csp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let pages = 0;

        for await (const file of htmlFiles(root)) {
          const html = await readFile(file, 'utf8');

          // The policy only governs what comes after it, so it goes directly
          // after <meta charset>, ahead of every script in the document.
          const charset = /<meta charset="utf-8"\s*\/?>/i.exec(html);
          if (!charset) throw new Error(`[csp] No <meta charset> to anchor the policy in ${file}`);

          const meta = `<meta http-equiv="Content-Security-Policy" content="${policyFor(html, preview)}">`;
          const at = charset.index + charset[0].length;
          await writeFile(file, html.slice(0, at) + meta + html.slice(at));
          pages += 1;
        }

        logger.info(`Content-Security-Policy written into ${pages} pages${preview ? ' (preview: Vercel toolbar allowed)' : ''}`);
      },
    },
  };
}
