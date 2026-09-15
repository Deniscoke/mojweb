/**
 * CONTENT SOURCE RESOLUTION — the single decision for a whole build.
 *
 * A build is either fully Payload-sourced or fully fallback-sourced. Mixing
 * the two produces an inconsistent site: routes from one dataset, content
 * from another. The mode is resolved once, cached for the process, and every
 * fetcher and every getStaticPaths() respects the same answer.
 */

/**
 * Astro only surfaces `PUBLIC_`-prefixed variables on `import.meta.env`, so
 * unprefixed build-time flags are read from `process.env` as well. These
 * modules only ever run in Node during the build, never in the browser.
 */
function env(key: string): string | undefined {
  const raw = (import.meta.env as Record<string, unknown>)[key] ?? process.env[key];
  // Astro coerces `import.meta.env` values, so a shell `CMS_REQUIRED=true`
  // arrives here as the boolean true rather than the string 'true'.
  return raw === undefined || raw === null ? undefined : String(raw);
}

const CMS_URL = env('PUBLIC_CMS_URL') || 'http://localhost:3000';

/**
 * When true, a production build MUST reach Payload or it fails rather than
 * silently shipping stale local content. Default false for this iteration.
 */
const CMS_REQUIRED = env('CMS_REQUIRED') === 'true';

export type ContentSource = 'payload' | 'fallback';

let _source: Promise<ContentSource> | null = null;

async function probe(): Promise<ContentSource> {
  let reachable = false;

  try {
    const res = await fetch(`${CMS_URL}/api/projects?limit=0`, {
      signal: AbortSignal.timeout(3000),
    });
    reachable = res.ok;
  } catch {
    reachable = false;
  }

  if (reachable) {
    console.info('[CMS] Source: Payload');
    return 'payload';
  }

  if (CMS_REQUIRED) {
    throw new Error(
      `[CMS] CMS_REQUIRED=true but Payload was unreachable at ${CMS_URL}. ` +
        'Refusing to build from stale local fallback data.',
    );
  }

  console.warn('[CMS] Payload unavailable — using local fallback data');
  return 'fallback';
}

/**
 * Resolves the content source for this build. The promise is cached, so
 * concurrent callers share one probe rather than each firing their own.
 */
export function resolveContentSource(): Promise<ContentSource> {
  _source ??= probe();
  return _source;
}

export async function usingPayload(): Promise<boolean> {
  return (await resolveContentSource()) === 'payload';
}

export { CMS_URL };
