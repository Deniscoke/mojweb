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
  /**
   * What is being entered. The cover is laid out differently for each: a
   * language name is one short word, so the accent rule runs across the
   * screen behind it; a project title is a whole phrase, so the rule sits
   * under it as a short mark instead of striking through the words.
   */
  kind?: 'language' | 'project';
  /**
   * The path the intent was written for. An intent is a promise about one
   * specific page: "the page at this path is about to open, and it already
   * knows what it will say". Any other page that happens to load inside the
   * TTL — a reload, the back button, an abandoned transition — must ignore
   * it rather than paint itself as somewhere it is not.
   */
  path?: string;
}

/** Trailing slashes are a server's business, not the intent's. */
function samePath(a: string | undefined, b: string): boolean {
  if (!a) return true; // Written before paths were recorded: trust the TTL.
  return a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
}

export function setEnterIntent(intent: EnterIntent): void {
  safeSet(window.sessionStorage, ENTER_KEY, JSON.stringify({ ...intent, at: Date.now() }));
}

/** Drops an intent that is not going to be used after all. */
export function clearEnterIntent(): void {
  try {
    window.sessionStorage?.removeItem(ENTER_KEY);
  } catch {
    /* ignore */
  }
}

/** Reads and clears the intent. Returns null if absent, stale or elsewhere. */
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
    if (!samePath(parsed.path, window.location.pathname)) return null;
    return { code: parsed.code, label: parsed.label, kind: parsed.kind ?? 'language' };
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
  // Mirrors samePath(): only the page the intent was written for may paint
  // the cover. Without this, a reload or a back button inside the TTL opens
  // covered, under a title belonging to a page it never went to.
  `var t=function(s){return String(s).replace(/\\/+$/,'')};` +
  `if(Date.now()-d.at<${ENTER_TTL_MS}&&(!d.path||t(d.path)===t(location.pathname))){` +
  `var e=document.documentElement;e.setAttribute('data-entering','');` +
  // The cover's layout depends on what is being entered, and it is painted
  // before this module's logic runs, so the kind has to be on the root too.
  `if(d.kind)e.setAttribute('data-enter-kind',d.kind);` +
  // Dead man's switch: if the reveal module fails to load or throws, the
  // cover must not be allowed to trap the visitor on a blank screen.
  `setTimeout(function(){e.removeAttribute('data-entering')},2600)}}}catch(e){}`;
