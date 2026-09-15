/**
 * Payload REST API client for Astro build-time fetching.
 *
 * Every request made here is an anonymous, public read. No admin credentials
 * are used or stored on the Astro side, and `_status=published` is forced on
 * every collection query so a draft can never reach the built site.
 */

import { CMS_URL, usingPayload } from './source';

export interface CmsQueryOptions {
  locale?: string;
  depth?: number;
  limit?: number;
  where?: Record<string, unknown>;
  sort?: string;
}

/**
 * Payload's REST layer expects `where` as bracket-notation query params.
 * Passing a JSON blob under a bare `where` key alongside bracket params makes
 * the parse ambiguous, so every clause is flattened into brackets instead.
 */
function appendWhere(params: URLSearchParams, where: Record<string, unknown>, prefix = 'where'): void {
  for (const [key, value] of Object.entries(where)) {
    const path = `${prefix}[${key}]`;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      appendWhere(params, value as Record<string, unknown>, path);
    } else {
      params.set(path, String(value));
    }
  }
}

export async function cmsGet<T>(path: string, options: CmsQueryOptions = {}): Promise<T | null> {
  if (!(await usingPayload())) return null;

  const params = new URLSearchParams();

  if (options.locale) params.set('locale', options.locale);
  if (options.depth !== undefined) params.set('depth', String(options.depth));
  if (options.limit !== undefined) params.set('limit', String(options.limit));
  if (options.sort) params.set('sort', options.sort);

  // Published-only is not caller-overridable: it is the security boundary.
  appendWhere(params, { ...options.where, _status: { equals: 'published' } });

  try {
    const res = await fetch(`${CMS_URL}/api/${path}?${params.toString()}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function cmsGetGlobal<T>(slug: string, locale?: string): Promise<T | null> {
  if (!(await usingPayload())) return null;

  const params = new URLSearchParams();
  if (locale) params.set('locale', locale);

  try {
    const res = await fetch(`${CMS_URL}/api/globals/${slug}?${params.toString()}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
