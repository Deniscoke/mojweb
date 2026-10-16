/**
 * The scene's drawn marks, as SVG path data in a 100 × 100 box, stroked.
 * Credo: Build / Teach / Move / Explore. Contact: the arrow toward the CTA.
 */
export const CREDO = {
  /** Three bricks, laid. */
  build: 'M18 70h64v16H18zM26 48h48v16H26zM34 26h32v16H34z',
  /** An open book: two pages meeting at the spine. */
  teach: 'M50 30C40 22 24 22 14 26v48c10-4 26-4 36 4c10-8 26-8 36-4V26c-10-4-26-4-36 4zM50 30v48',
  /** One continuous wave: a body in motion. */
  move: 'M6 50c11-22 22-22 33 0s22 22 33 0s16-16 22-6',
  /** A compass: the ring and its needle. */
  explore: 'M50 14a36 36 0 1 0 .01 0zM50 28l9 22-9 22-9-22z',
} as const;

export const ARROW = 'M14 50h66M58 28l22 22-22 22';
