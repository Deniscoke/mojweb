import {
  CALM_ATTRIBUTE,
  MOTION_CHANGE_EVENT,
  MOTION_STORAGE_KEY,
  onMotionPreferenceChange,
  systemPrefersReducedMotion,
} from '../utils/env';

/**
 * CALM MOTION TOGGLES
 * ===================
 * Every `[data-motion-toggle]` on the page (one in the nav, so the control is
 * reachable before any motion is met, and one in the footer) is wired here,
 * and they always agree with each other.
 *
 * Markup contract (the components own the words, in all six locales):
 *
 *   <button type="button" data-motion-toggle aria-pressed="false"
 *           data-label-system="Calm (system setting)">
 *     <span data-motion-label>Calm motion</span>
 *   </button>
 *   <span data-motion-hint hidden>Takes full effect on the next page</span>
 *
 * Pressed means calm. A press toggles `html[data-calm]`, remembers it, and
 * announces `irl:motionchange`, which tears the live depth modules down at
 * once. Modules that read the preference when they start (reveals, the
 * transitions) obey it from the next page, so the hint is shown then. Exactly
 * one hint on the page sits in a `role="status"` region (SiteNav's, outside
 * the language menu, so it is in the accessibility tree at every width); the
 * other copies are plain visible text, so a press is announced once.
 *
 * Under the system setting the site has no say: the toggles show pressed,
 * say why, and are `aria-disabled` rather than `disabled`, so they stay in
 * the tab order and a screen reader can still explain the state.
 *
 * BACK/FORWARD CACHE. A page restored from the cache does not run the boot
 * script that read the stored choice before first paint, so it would come
 * back as it was left, even if Calm changed on a later page. On a restore
 * the stored choice is read again; if it differs, `html[data-calm]` is
 * brought in line and `irl:motionchange` is announced, so the toggles, the
 * depth runtime and the scan follow exactly as they do after a press. The
 * hint stays hidden: nobody pressed anything on this page.
 */

const TOGGLE = '[data-motion-toggle]';

/** Sets Calm on <html> and tells every live module, if it actually changes. */
function applyCalm(calm: boolean): void {
  const root = document.documentElement;
  if (root.hasAttribute(CALM_ATTRIBUTE) === calm) return;
  root.toggleAttribute(CALM_ATTRIBUTE, calm);
  document.dispatchEvent(new CustomEvent(MOTION_CHANGE_EVENT, { detail: { calm } }));
}

/** On a back/forward-cache restore, the stored choice wins again. */
function onPageShow(event: PageTransitionEvent): void {
  if (!event.persisted) return;
  try {
    applyCalm(localStorage.getItem(MOTION_STORAGE_KEY) === 'calm');
  } catch {
    /* Storage cannot be read: the page keeps what it has. */
  }
}

export function initMotionToggles(): () => void {
  // For the life of the page, toggles or not. Capture: at the window,
  // capture listeners run first, so Calm is already right when the scan's
  // remount and the plate transition's cleanup (their own `pageshow`
  // handlers) ask for it.
  addEventListener('pageshow', onPageShow, true);

  const toggles = document.querySelectorAll<HTMLButtonElement>(TOGGLE);
  const root = document.documentElement;
  /** Each label's own text, so it can be restored if the system setting lifts. */
  const own = new Map<HTMLElement, string>();

  const render = () => {
    const system = systemPrefersReducedMotion();
    const calm = system || root.hasAttribute(CALM_ATTRIBUTE);

    for (const button of toggles) {
      button.setAttribute('aria-pressed', String(calm));
      if (system) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');

      const label = button.querySelector<HTMLElement>('[data-motion-label]');
      if (!label) continue;
      if (!own.has(label)) own.set(label, label.textContent ?? '');
      const text = system && button.dataset.labelSystem ? button.dataset.labelSystem : own.get(label)!;
      if (label.textContent !== text) label.textContent = text;
    }
  };

  const onPress = () => {
    if (systemPrefersReducedMotion()) return;
    const calm = !root.hasAttribute(CALM_ATTRIBUTE);
    try {
      if (calm) localStorage.setItem(MOTION_STORAGE_KEY, 'calm');
      else localStorage.removeItem(MOTION_STORAGE_KEY);
    } catch {
      /* Private mode or blocked storage: Calm still holds for this page. */
    }
    applyCalm(calm);
    // Only a press shows the hint, and once shown it stays.
    document.querySelectorAll<HTMLElement>('[data-motion-hint]').forEach((hint) => (hint.hidden = false));
  };

  toggles.forEach((button) => button.addEventListener('click', onPress));
  const offPreference = onMotionPreferenceChange(render);
  render();

  // Unwires the toggles. The restore listener stays: it keeps the page
  // honest with or without them.
  return () => {
    offPreference();
    toggles.forEach((button) => button.removeEventListener('click', onPress));
  };
}
