/**
 * Trigger a site rebuild after content is published.
 *
 * If SITE_REBUILD_HOOK_URL is set, POST to it. Otherwise no-op.
 * This is a prepared abstraction for future Vercel/Netlify deploy hooks.
 * It does NOT debounce — that belongs in the deployment platform or in a
 * future queue layer. For now, it is intentionally not wired into any
 * collection hook. Wire it when a deployment target exists.
 */
export async function triggerSiteRebuild(): Promise<void> {
  const hookUrl = process.env.SITE_REBUILD_HOOK_URL

  if (!hookUrl) return

  try {
    const res = await fetch(hookUrl, { method: 'POST' })
    if (!res.ok) {
      console.error(`[rebuild] Hook responded ${res.status}`)
    } else {
      console.info('[rebuild] Site rebuild triggered')
    }
  } catch (err) {
    console.error('[rebuild] Failed to trigger:', err)
  }
}
