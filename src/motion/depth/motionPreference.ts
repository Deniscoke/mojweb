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
 * transitions) obey it from the next page, so the hint is shown then.
 *
 * Under the system setting the site has no say: the toggles show pressed,
 * say why, and are `aria-disabled` rather than `disabled`, so they stay in
 * the tab order and a screen reader can still explain the state.
 */

const TOGGLE = '[data-motion-toggle]';

export function initMotionToggles(): () => void {
  const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>(TOGGLE));
  if (toggles.length === 0) return () => {};

  const root = document.documentElement;
  /** Each label's own text, so it can be restored if the system setting lifts. */
  const own = new Map<HTMLElement, string>();
  let changedHere = false;

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

    if (changedHere) {
      document.querySelectorAll<HTMLElement>('[data-motion-hint]').forEach((hint) => (hint.hidden = false));
    }
  };

  const onPress = () => {
    if (systemPrefersReducedMotion()) return;
    const calm = !root.hasAttribute(CALM_ATTRIBUTE);
    root.toggleAttribute(CALM_ATTRIBUTE, calm);
    try {
      if (calm) localStorage.setItem(MOTION_STORAGE_KEY, 'calm');
      else localStorage.removeItem(MOTION_STORAGE_KEY);
    } catch {
      /* Private mode or blocked storage: Calm still holds for this page. */
    }
    changedHere = true;
    document.dispatchEvent(new CustomEvent(MOTION_CHANGE_EVENT, { detail: { calm } }));
  };

  toggles.forEach((button) => button.addEventListener('click', onPress));
  const offPreference = onMotionPreferenceChange(render);
  render();

  return () => {
    offPreference();
    toggles.forEach((button) => button.removeEventListener('click', onPress));
  };
}
