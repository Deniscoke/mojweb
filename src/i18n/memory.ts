/**
 * LANGUAGE MEMORY (client only)
 * =============================
 * Deliberately passive. The site remembers which language you chose and
 * highlights it on the gate, but it never redirects you automatically —
 * a silent redirect makes the entry experience unreachable and breaks the
 * back button, which is a bad trade for one saved click.
 *
 * Two separate stores, on purpose:
 *   localStorage   — the long-lived preference.
 *   sessionStorage — the one-shot "I just chose a language, play the reveal"
 *                    handoff between the gate and the destination page.
 */

const PREF_KEY = 'irl:locale';
const ENTER_KEY = 'irl:enter';
/** An enter intent older than this is stale (reload, bookmark, back button). */
const ENTER_TTL_MS = 8000;

function safeGet(store: Storage | undefined, key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null; // Private mode, disabled storage, cross-origin sandbox.
  }
}

function safeSet(store: Storage | undefined, key: string, value: string): void {
  try {
    store?.setItem(key, value);
  } catch {
    /* Preference memory is a nicety; never let it break navigation. */
  }
}

export function rememberLocale(code: string): void {
  safeSet(window.localStorage, PREF_KEY, code);
}

export function recallLocale(): string | null {
  return safeGet(window.localStorage, PREF_KEY);
}

export interface EnterIntent {
  code: string;
  label: string;
}

export function setEnterIntent(intent: EnterIntent): void {
  safeSet(window.sessionStorage, ENTER_KEY, JSON.stringify({ ...intent, at: Date.now() }));
}

/** Reads and clears the intent. Returns null if absent or stale. */
export function takeEnterIntent(): EnterIntent | null {
  const raw = safeGet(window.sessionStorage, ENTER_KEY);
  try {
    window.sessionStorage?.removeItem(ENTER_KEY);
  } catch {
    /* ignore */
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as EnterIntent & { at: number };
    if (Date.now() - parsed.at > ENTER_TTL_MS) return null;
    return { code: parsed.code, label: parsed.label };
  } catch {
    return null;
  }
}

/**
 * Inlined in <head> on locale pages so the cover is painted before first
 * paint. Kept as a string next to the logic it mirrors, rather than pasted
 * into a template where it would drift.
 */
export const ENTER_FLAG_SNIPPET =
  `try{var r=sessionStorage.getItem('${ENTER_KEY}');if(r){var d=JSON.parse(r);` +
  `if(Date.now()-d.at<${ENTER_TTL_MS}){var e=document.documentElement;e.setAttribute('data-entering','');` +
  // Dead man's switch: if the reveal module fails to load or throws, the
  // cover must not be allowed to trap the visitor on a blank screen.
  `setTimeout(function(){e.removeAttribute('data-entering')},2600)}}}catch(e){}`;
