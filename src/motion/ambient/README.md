# `motion/ambient/` — reserved

Nothing ships here in v0.1, and that is a decision rather than an omission.

The page texture is a single static SVG grain plate painted by CSS
(`styles/global.css`, `body::after`). It is rasterised once and never
animated, which buys the "there is something alive here" feeling for zero
frames per second.

A WebGL or canvas ambient layer (`shaderHero`, `ambientBackground`) belongs
here when it earns its place. Any module added to this folder must satisfy
the same contract, because these are the effects that quietly ruin a site:

```ts
export interface AmbientModule {
  /** Must return a no-op teardown if the environment cannot support it. */
  mount(host: HTMLElement): () => void;
}
```

Non-negotiables for anything in this folder:

1. **Feature-detect, then fall back.** No WebGL context, no `OffscreenCanvas`,
   no module. The page must look deliberate without it, not broken.
2. **Respect `prefers-reduced-motion`.** Render one static frame or nothing.
3. **Pause when invisible.** Use `whileVisible()` from `../utils/env`, which
   also stops on `visibilitychange`.
4. **Cap the pixel ratio.** Use `renderScale()` — never `devicePixelRatio`
   raw. A 3× phone screen will render 9× the pixels and thermally throttle.
5. **Clean up completely.** Cancel the loop, remove listeners, and call
   `loseContext()` on the WebGL context. Browsers allow a small, finite number
   of live contexts per page.
6. **Skip it on small or low-power devices** unless it is the mobile
   interpretation of the effect rather than the desktop one shrunk down.
