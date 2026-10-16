/**
 * THE KINETIC LAYER
 * =================
 * Type that moves the way the living scene's points do. Loaded with the
 * scene on the visitor's first input (src/motion/depth/index.ts), never on
 * the load path, never under reduced motion.
 *
 *   gather   a heading coming into view splits into letters, scattered,
 *            and they fly together into the word (GSAP SplitText);
 *   decode   a mono label or number coming into view resolves out of
 *            scrambled glyphs, like a readout (GSAP ScrambleText);
 *   hover    navigation links decode again under the pointer or focus.
 *
 * Targets are chosen here by selector, not marked up in each component, so
 * no page carries a byte more HTML for it (on the case studies a few dozen
 * bytes cost LCP a round trip). `data-kinetic="off"` opts an element out.
 *
 * The letters move by transform and opacity only, as Web Animations.
 *
 * Rules (spec §4): what the visitor has already seen is never hidden or
 * replayed; one gather plays at a time; every split is reverted to the
 * original DOM when it lands; scrambles always end on the original text.
 */
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { idle, prefersReducedMotion } from '../utils/env';
import { createGate, seen } from './pick.ts';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);
// The ticker sleeps soon after the last tween (default: 120 idle frames, ~2 s
// of rAF): when the page stops moving, nothing runs (WCAG 2.2.2).
gsap.config({ autoSleep: 20 });

const GATHER = 'main h2:not(.mono):not(.entry__title), main .project__title, .project-page__next-title';
const DECODE = [
  '.section__index',
  '.project__index',
  '.what__index',
  '.about__step-num',
  '.lab__num',
  '.entry__num',
  '.entry__tag',
  '.lab__tag',
  '.readout__value',
  '.block__label',
  '.project-page__section-label',
  '.project-page__evidence-label',
  '.note__section-label',
].join(', ');
const HOVER = '.nav__link, .footer__top';
const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#/·';

/** Only plain text can be scrambled: markup inside would be flattened. */
const isLeaf = (el: Element) => el.children.length === 0 && (el.textContent ?? '').trim().length > 0;
const off = (el: Element) => el.closest('[data-kinetic="off"]') !== null;

export function initKinetic(): () => void {
  if (prefersReducedMotion()) return () => {};
  // Letters flying in from the side must never widen the page (a phone at
  // 360 px would scroll sideways for the length of a gather). `clip` on the
  // headings' <main> keeps their overflow from reaching the page at all, and
  // makes no scroll container, so sticky labels inside keep working.
  document.querySelectorAll<HTMLElement>('main').forEach((m) => (m.style.overflowX = 'clip'));
  const gate = createGate();
  const cleanups: Array<() => void> = [];
  const splits = new Set<SplitText>();

  const unseen = <T extends Element>(els: T[]) => {
    const flags = seen(
      els.map((el) => el.getBoundingClientRect()),
      innerHeight,
    );
    return els.filter((el, i) => !flags[i] && !off(el));
  };

  // ---------------------------------------------------------- gather
  const gatherTargets = unseen([...document.querySelectorAll<HTMLElement>(GATHER)]);
  const prepared = new Map<HTMLElement, SplitText>();

  /** Where a letter waits before it gathers: off its place, turned, unseen. */
  const scatter = () =>
    `translate(${gsap.utils.random(-40, 40, 1)}px, ${gsap.utils.random(-40, 40, 1)}px) rotate(${gsap.utils.random(-12, 12, 1)}deg)`;
  const starts = new WeakMap<Element, string>();

  /** Below the fold, before it shows: split, and scatter the letters. */
  const prepare = (el: HTMLElement) => {
    if (prepared.has(el)) return;
    // Its own reveal (or its header's) is done off screen, so only the
    // letters move when it arrives.
    el.closest('[data-reveal]')?.classList.add('is-revealed');
    const split = SplitText.create(el, { type: 'words,chars', aria: 'auto' });
    splits.add(split);
    prepared.set(el, split);
    for (const c of split.chars as HTMLElement[]) {
      const t = scatter();
      starts.set(c, t);
      c.style.opacity = '0';
      c.style.transform = t;
    }
  };

  /**
   * The flight itself is the browser's own (Web Animations): transform and
   * opacity on the compositor, nothing read back. Driving it through a GSAP
   * tween made the scroll callback recalculate the page's style (~60 ms at
   * 6x); GSAP's part is the split and the decode.
   */
  /** Back to the original markup at once, letters and all. */
  const show = (el: HTMLElement) => {
    const split = prepared.get(el);
    if (!split) return;
    prepared.delete(el);
    split.revert();
    splits.delete(split);
  };

  const land = (el: HTMLElement) => {
    const split = prepared.get(el);
    if (!split) return;
    prepared.delete(el);
    const done = () => {
      split.revert();
      splits.delete(split);
    };
    if (!gate.tryStart()) {
      // Another heading is gathering: this one is simply there.
      done();
      return;
    }
    const chars = split.chars as HTMLElement[];
    const flights = chars.map((c, i) =>
      c.animate(
        [
          { opacity: 0, transform: starts.get(c) ?? 'none' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 700, delay: i * 18, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' },
      ),
    );
    // Finished or cancelled, the heading ends as its original markup.
    const finish = () => {
      done();
      gate.end();
    };
    Promise.all(flights.map((f) => f.finished)).then(finish, finish);
  };

  // Splitting is the costly part: it runs in idle time, one heading per
  // slice, never inside a scroll callback. A heading that arrives before it
  // was prepared is simply shown.
  const pending: HTMLElement[] = [];
  let slicing = false;
  const nextSlice = () => {
    const el = pending.shift();
    slicing = !!el;
    if (!el) return;
    cleanups.push(
      idle(() => {
        // Never hide what is already on screen: if it got there first, it stays.
        if (!landed.has(el) && el.getBoundingClientRect().top >= innerHeight) prepare(el);
        nextSlice();
      }, 600),
    );
  };
  const landed = new WeakSet<HTMLElement>();

  if (gatherTargets.length && 'IntersectionObserver' in window) {
    // Prepared ahead, within 60% of a screen either side. A prepared heading
    // that leaves that band without landing (a jump: End, an anchor, a
    // restored scroll) is shown as it is: nothing is ever left hidden.
    const near = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (landed.has(el)) return;
          if (e.isIntersecting) {
            if (!prepared.has(el) && !pending.includes(el)) {
              pending.push(el);
              if (!slicing) nextSlice();
            }
          } else if (prepared.has(el)) {
            landed.add(el);
            near.unobserve(el);
            inView.unobserve(el);
            show(el);
          }
        }),
      { rootMargin: '60% 0px 60% 0px' },
    );
    const inView = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          near.unobserve(el);
          inView.unobserve(el);
          landed.add(el);
          land(el);
        }),
      // Any part on screen lands it: a heading resting at the screen's
      // bottom edge must not wait there, unseen.
      { rootMargin: '0px' },
    );
    gatherTargets.forEach((el) => {
      near.observe(el);
      inView.observe(el);
    });
    cleanups.push(() => {
      near.disconnect();
      inView.disconnect();
    });
  }

  // ---------------------------------------------------------- decode
  const original = new WeakMap<Element, string>();
  const decode = (el: HTMLElement, duration = 0.6, onComplete?: () => void) => {
    if (gsap.isTweening(el)) return;
    const text = original.get(el) ?? el.textContent ?? '';
    original.set(el, text);
    gsap.to(el, { duration, scrambleText: { text, chars: GLYPHS, revealDelay: 0.1, speed: 0.6 }, onComplete });
  };

  const decodeTargets = unseen([...document.querySelectorAll<HTMLElement>(DECODE)].filter(isLeaf));
  if (decodeTargets.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          decode(e.target as HTMLElement);
        }),
      { rootMargin: '0px 0px -10% 0px' },
    );
    decodeTargets.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());
  }

  // ---------------------------------------------------------- hover
  const hoverTargets = [...document.querySelectorAll<HTMLElement>(HOVER)].filter((el) => isLeaf(el) && !off(el));
  const onEnter = (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    if (gsap.isTweening(el)) return;
    // While the glyphs scramble, the link's name stays its text; after, the
    // text is the name again (and in-browser translation sees it).
    const owned = !el.hasAttribute('aria-label');
    if (owned) el.setAttribute('aria-label', (original.get(el) ?? el.textContent ?? '').trim());
    decode(el, 0.45, () => owned && el.removeAttribute('aria-label'));
  };
  hoverTargets.forEach((el) => {
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('focus', onEnter);
  });
  cleanups.push(() =>
    hoverTargets.forEach((el) => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('focus', onEnter);
    }),
  );

  return () => {
    cleanups.forEach((c) => c());
    splits.forEach((s) => s.revert());
    splits.clear();
  };
}
