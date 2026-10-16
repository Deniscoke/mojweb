/**
 * PHOTOGRAPHS — Denis's own frames, and the rules they ship under.
 * ================================================================
 * The registry for every photograph that is not project evidence: the About
 * frames (circus, snowboard) and the workshop photos on the laby pages.
 * Case-study photos are evidence and live in `evidence.ts` as `kind: 'photo'`.
 *
 * A photograph is evidence, so the same rules hold as for evidence:
 *
 *   - `alt` is written by Denis, who was there. It is never generated and
 *     never derived from a filename. A photo without alt is rendered
 *     `aria-hidden`, which is honest; an invented description is not.
 *   - Nothing is shown that has not been registered here. An empty registry
 *     renders nothing at all: no grey box, no "photo coming soon".
 *   - Consent is recorded per photo, and the build refuses a photo of
 *     children that breaks the policy below (see `assertPolicy`).
 *
 * The image files themselves are produced by `npm run images -- --photo <file>`
 * (scripts/build-image-variants.mjs), which writes EXIF-free WebP variants
 * into public/media/photos/ and their sizes and placeholder into
 * src/data/generated/photos.json. The brief Denis follows is
 * public/media/photos/README.md.
 *
 * Build-time only: this module reads the file system.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import manifest from './generated/photos.json';

/** Photo text exists in EN/CS/SK, like the case studies; other locales read EN. */
type PhotoText = { en: string; cs?: string; sk?: string };

/**
 * Who agreed to this photo being published.
 *
 * - `adult` — everyone identifiable in the frame is an adult who agreed.
 * - `guardian-consent-on-file` — minors appear, and written consent from
 *   their guardians is on file with Denis.
 * - `non-identifiable` — nobody in the frame can be recognised (from behind,
 *   at a distance, hands at work).
 */
export type PhotoConsent = 'adult' | 'guardian-consent-on-file' | 'non-identifiable';

/** Where a photo appears. One slot per page region, each with a designed ratio. */
export type PhotoPlacement = 'about' | `laby:${string}`;

export interface PhotoSpec {
  /** Unique per registry entry. */
  id: string;
  /**
   * Name of the processed image: the stem `npm run images` gave it, i.e. the
   * master's file name in kebab case without extension (`circus-juggling`).
   * Two entries may share one image, e.g. with a different focal point.
   */
  src: string;
  /** Written by Denis. Missing = the image is treated as undescribed. */
  alt?: PhotoText;
  /**
   * The point that must stay in frame, as [x%, y%] of the image. Drives
   * `object-position`, so the subject survives both the 4:5 and 3:2 crops
   * and the window parallax scales around it.
   */
  focal: readonly [number, number];
  /** The mono line under the frame: place · year · discipline. All optional. */
  readout?: { place?: string; year?: number; discipline?: PhotoText };
  placement: PhotoPlacement;
  /** Display order within the placement. */
  order: number;
  consent: PhotoConsent;
  /** True when anyone in the frame is under 18. Stated explicitly, never assumed. */
  minors: boolean;
  /**
   * Request the Tier 1 depth-map treatment. Honoured only for `consent: 'adult'`
   * with a `<src>-depth.webp` map present — see `depthMapFor`.
   */
  depth?: boolean;
  /** Overrides the placement's designed frame ratio, e.g. `'3 / 2'`. */
  ratio?: string;
}

/**
 * The registry. Empty until Denis hands the photographs over: every slot
 * that reads from it renders nothing until then.
 *
 * An entry has this shape (angle brackets are Denis's to fill in):
 *
 *   {
 *     id: 'about-circus',
 *     src: 'circus-juggling',
 *     alt: {
 *       en: '<what is actually visible, in one or two sentences>',
 *       cs: '<…>',
 *       sk: '<…>',
 *     },
 *     focal: [42, 30],
 *     readout: { place: '<town>', year: <year>, discipline: { en: 'Circus', cs: 'Cirkus', sk: 'Cirkus' } },
 *     placement: 'about',
 *     order: 1,
 *     consent: 'adult',
 *     minors: false,
 *   },
 */
export const PHOTOS: PhotoSpec[] = [];

/* ------------------------------------------------------------------ slots */

/**
 * The designed frame for each placement. About is a vertical 4:5 beside the
 * pull quote; the laby pages show workshops as horizontal 3:2.
 */
export const SLOT_RATIO: Record<'about' | 'laby', string> = {
  about: '4 / 5',
  laby: '3 / 2',
};

/** `sizes` for each slot, matched to where the slot sits in the grid. */
export const SLOT_SIZES: Record<'about' | 'laby', string> = {
  // Columns 8–12 of the 92rem grid on desktop; full bleed below 62rem.
  about: '(min-width: 62rem) 36vw, 100vw',
  laby: '(min-width: 62rem) 60vw, 100vw',
};

const slotOf = (placement: PhotoPlacement): 'about' | 'laby' =>
  placement === 'about' ? 'about' : 'laby';

/* ----------------------------------------------------------------- policy */

/**
 * The consent policy, enforced at build time so it cannot be forgotten:
 *
 *   1. Photos of minors need written guardian consent on file.
 *   2. Photos of minors are never given the depth-map treatment, which
 *      re-synthesises the image — Tier 0 (the CSS window) only.
 *   3. The depth-map treatment needs every identifiable person to be an adult
 *      who agreed.
 *
 * Framing is the one rule code cannot check: children are photographed so
 * they cannot be recognised — from behind, at a distance, hands at work.
 * The brief in public/media/photos/README.md says so to the photographer.
 */
function assertPolicy(photos: readonly PhotoSpec[]): void {
  const seen = new Set<string>();
  for (const p of photos) {
    const where = `photos.ts › ${p.id}`;
    if (seen.has(p.id)) throw new Error(`${where}: duplicate id.`);
    seen.add(p.id);
    if (p.minors && p.consent !== 'guardian-consent-on-file') {
      throw new Error(`${where}: a photo of minors needs consent 'guardian-consent-on-file'.`);
    }
    if (p.minors && p.depth) {
      throw new Error(`${where}: photos of minors never get the depth-map treatment.`);
    }
    if (p.depth && p.consent !== 'adult') {
      throw new Error(`${where}: the depth-map treatment needs consent 'adult'.`);
    }
    if (p.focal.some((v) => !(v >= 0 && v <= 100))) {
      throw new Error(`${where}: focal must be two percentages between 0 and 100.`);
    }
  }
}

assertPolicy(PHOTOS);

/* --------------------------------------------------------------- resolving */

interface PhotoAsset {
  /** Intrinsic size of the largest variant. */
  width: number;
  height: number;
  /** Ascending by width. */
  variants: { width: number; file: string }[];
  /** A 24 px blurred WebP as a data: URI, painted behind the image while it loads. */
  lqip: string | null;
}

const ASSETS = manifest as Record<string, PhotoAsset>;
const PUBLIC_DIR = join(process.cwd(), 'public');
const URL_BASE = '/media/photos/';

/** Everything a component needs to draw one photo, already localised. */
export interface ResolvedPhoto {
  id: string;
  /** Fallback `src`: the variant nearest 960 px. */
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
  /** `null` = undescribed: rendered with empty alt and `aria-hidden`. */
  alt: string | null;
  focal: readonly [number, number];
  ratio: string;
  placeholder: string | null;
  /** The readout parts in order, empty when nothing was recorded. */
  readout: string[];
  /** Tier 1 hook; see `depthMapFor`. */
  depthMap: string | null;
}

const pick = (text: PhotoText | undefined, locale: string): string | null =>
  text ? ((text as Record<string, string | undefined>)[locale] ?? text.en) : null;

/**
 * TIER 1 HOOK — the depth-map shader.
 *
 * A photo qualifies when Denis asked for it (`depth: true`), consent is
 * `adult`, and a depth map `<src>-depth.webp` sits beside its variants (the
 * same existence convention as the `-640w` variants). The map generator
 * (scripts/build-depth-maps.py, Depth-Anything-V2-Small, run offline) and the
 * runtime (src/motion/media/depthPhoto.ts) arrive with the photo phase; until
 * a map exists this returns null and the photo is Tier 0, which is a
 * complete design on its own. Components expose a non-null result as
 * `data-depth-map` on the frame, which is the attribute that runtime reads.
 */
export function depthMapFor(photo: PhotoSpec): string | null {
  if (!photo.depth || photo.consent !== 'adult' || photo.minors) return null;
  const url = `${URL_BASE}${photo.src}-depth.webp`;
  return existsSync(join(PUBLIC_DIR, url)) ? url : null;
}

function resolve(photo: PhotoSpec, locale: string): ResolvedPhoto | null {
  const asset = ASSETS[photo.src];
  const present = asset?.variants.filter((v) => existsSync(join(PUBLIC_DIR, URL_BASE, v.file)));
  if (!asset || !present?.length) {
    // Registered but not processed: say so at build time instead of
    // shipping a broken image. The slot simply renders without it.
    console.warn(
      `[photos] "${photo.id}" is registered but public/media/photos/ has no variants for "${photo.src}". ` +
        `Run: npm run images -- --photo <path-to-master>`,
    );
    return null;
  }

  const fallback = present.reduce((best, v) =>
    Math.abs(v.width - 960) < Math.abs(best.width - 960) ? v : best,
  );
  const slot = slotOf(photo.placement);
  const discipline = pick(photo.readout?.discipline, locale);

  return {
    id: photo.id,
    src: `${URL_BASE}${fallback.file}`,
    srcset: present.map((v) => `${URL_BASE}${v.file} ${v.width}w`).join(', '),
    sizes: SLOT_SIZES[slot],
    width: asset.width,
    height: asset.height,
    alt: pick(photo.alt, locale),
    focal: photo.focal,
    ratio: photo.ratio ?? SLOT_RATIO[slot],
    placeholder: asset.lqip,
    readout: [photo.readout?.place, photo.readout?.year?.toString(), discipline].filter(
      (part): part is string => Boolean(part),
    ),
    depthMap: depthMapFor(photo),
  };
}

/** The photos for one placement, in order, ready to draw. Empty = render nothing. */
export function photosFor(placement: PhotoPlacement, locale: string): ResolvedPhoto[] {
  return PHOTOS.filter((p) => p.placement === placement)
    .sort((a, b) => a.order - b.order)
    .map((p) => resolve(p, locale))
    .filter((p): p is ResolvedPhoto => p !== null);
}
