# Živá scéna: implementačný plán

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nahradiť koláž efektov na homepage jedinou WebGL scénou z bodov. Body sa pri scrolle presúvajú medzi tvarmi viazanými na obsah sekcií.

**Architecture:**
- Jedna fixná `<canvas>` za obsahom, jedna slučka `createLoop` a jeden scroll zdroj.
- Pozície bodov (from/to) žijú v GPU bufferoch a vertex shader ich mieša podľa `uProgress`.
- Choreografiu počítajú čisté funkcie z `[data-scene]` prvkov.
- Slabé zariadenia a pokojný režim dostanú 2D záložný kanvas.

**Tech Stack:** Astro 5, TypeScript, WebGL2 (vlastný `src/motion/ambient/gl.ts`), Node 24 `node --test` na unit testy, Playwright na e2e.

**Spec:** `docs/superpowers/specs/2026-10-16-living-scene-design.md`

## Global Constraints

- **Vetva:** pracuje sa na novej vetve `feat/living-scene` z `feat/motion-depth`. **Do `main` sa nemerguje** bez Denisovho výslovného súhlasu.
- **Závislosti:** žiadne nové runtime npm balíky (bez three.js a GSAP).
- **Rozpočet (gzip):**
  - home JS nárast **≤ 3,0 KB**,
  - lazy chunk scény **≤ 9 KB**,
  - fallback chunk **≤ 1,5 KB**,
  - home CSS nárast ≤ 5 KB,
  - sken desktop 70 KB a mobil 28 KB raw sa nemenia.
- **Počty bodov:** desktop **16 000**, mobil **4 000**. Mobil má DPR ≤ 1,5, desktop `renderScale()` (default 1,75).
- **Úroveň „static“:** `!canAffordGL()` (existujúca brána v `utils/env.ts`: WebGL2, `saveData`, `deviceMemory < 4`, `hardwareConcurrency < 4`). Spec píše „≤ 2“. Použije sa existujúca, prísnejšia a už otestovaná brána.
- **Odchýlky od specu (zámerné):**
  - Zloženie mena je **časový príchod 1,8 s** po načítaní, nie krok pri 10 % scrollu. Hero je jedna sekcia a príchod funguje aj bez scrollu.
  - Samostatný stav `wander` odpadá. „Rozpad“ skenu je prechod `scan → drift` do ďalšej sekcie a nepodarený sken = `scatter`.
- **Pokojný režim** (`data-calm`) a `prefers-reduced-motion` = `prefersReducedMotion()`: žiadny let bodov a žiadny GL kontext, prepnutie za behu platí hneď.
- **Načítanie:** nič pred LCP, žiadny prefetch. Plánuje sa cez `afterReveal` + `idle` v `src/motion/depth/index.ts`.
- **Z-index:** scéna `--z-ambient`. Na homepage sa vypnú zrnitosť `body::after` aj kanvas kurzora. Na podstránkach sa zrnitosť presunie zo z 200 na 95.
- **Commity:** konvenčné, na konci `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Brány pred push:**
  - `npx astro check` (0 errors),
  - `npm run build` (152 pages),
  - `npm run budget`, `npm run budget:self-test`,
  - `npm run test:unit`,
  - `E2E_STRICT=1 npx playwright test`,
  - `npm run lhci` (výkon ≥ 95, a11y 100, CLS 0, home LCP ≤ 2,56 s).
- **Windows pasce:** `MSYS_NO_PATHCONV=1` pre cesty `/en/...` v Git Bash. Dlhé skripty zapisuj cez Write. Pred mazaním worktree zastav `astro preview`.

## Review Focus

1. **Resize alebo otočenie telefónu uprostred stránky.** Kotvy sa prepočítajú (ResizeObserver na `document.body`) a scéna ostane v stave sekcie, ktorá je v strede. Test: Task 6, e2e `scene keeps the right state after resize`.
2. **Skok cez kotvu** (`#work` z hero cue, späť v histórii). Body letia priamo do cieľa a medzistavy preskočia. Test: Task 2, unit `retarget skips intermediate states`.
3. **Font nedorazí** alebo `fonts.ready` visí. Tvar `name` ostane `scatter` a nič nespadne. Test: Task 4, unit `textShape falls back to scatter on empty mask`. Timeout 3 s v Task 6.
4. **Strata WebGL kontextu** (`WEBGL_lose_context`) a návrat z bfcache. Pri strate prepne na fallback, po bfcache sa slučka znova rozbehne. Test: Task 7, e2e `context loss falls back to 2D` a rozšírený `bfcache.spec.ts`.
5. **Všetkých 6 jazykov.** Meno s „ć“ sa vzorkuje správne a dlhšie preklady nespôsobia, že scéna prekryje text. Test: Task 9, e2e iteruje `/sk/ /sr/ /tr/` a overí, že `name` má N bodov a že `[data-scene]` kotvy existujú.

---

### Task 1: Unit test runner a čisté generátory tvarov

**Files:**
- Create: `src/motion/scene/points.ts`
- Create: `tests/unit/points.test.ts`
- Modify: `package.json` (script `"test:unit": "node --test tests/unit/"`)
- Modify: `tsconfig.json` (iba ak `astro check` hlási príponu `.ts` v importe testu: `"compilerOptions": { "allowImportingTsExtensions": true }`)

**Interfaces:**
- Produces (všetko čisté, bez DOM a bez importov):
  - `rng(seed: number): () => number` (mulberry32, výstup [0,1)),
  - `scatter(n: number, seed: number): Float32Array` (n×3, x,y ∈ [-1,1], z ∈ [-0.3,0.3]),
  - `fitCount(src: Float32Array, n: number, seed: number): Float32Array` (opakuje alebo podvzorkuje na presne n×3),
  - `sampleMask(alpha: Uint8ClampedArray, w: number, h: number, n: number, seed: number): Float32Array` (vyberie n pixelov s alfa > 127. Výstup je normalizovaný na [-1,1] podľa dlhšej strany, s y hore a z = malý jitter ±0,05. Prázdna maska vráti `scatter(n, seed)`).

**Postup:**
- [ ] **Step 0:** `git checkout -b feat/living-scene` (z `feat/motion-depth`).
- [ ] **Step 1: Failing testy** v `tests/unit/points.test.ts` (`import { test } from 'node:test'`, `assert` z `node:assert/strict`, import `../../src/motion/scene/points.ts`):
  - `rng is deterministic`: dve `rng(7)` dajú rovnakých 5 čísel.
  - `scatter has n*3 values in range`: `scatter(1000, 1).length === 3000`, všetky |x|,|y| ≤ 1.
  - `fitCount repeats and subsamples`: zo 100 bodov na 250 aj na 40 → dĺžky 750 a 120, každý výstupný bod existuje vo vstupe.
  - `sampleMask only picks opaque pixels`: maska 10×10, nepriehľadný len ľavý stĺpec → všetky x ≈ -1 (± 0,21).
  - `sampleMask on empty mask returns scatter`: výstup sa rovná `scatter(n, seed)`.
- [ ] **Step 2:** `npm run test:unit` → FAIL (modul neexistuje).
- [ ] **Step 3:** Implementuj `points.ts` podľa Interfaces.
- [ ] **Step 4:** `npm run test:unit` → PASS. `npx astro check` → 0 errors.
- [ ] **Step 5:** Commit `feat: seeded point generators for the living scene`.

### Task 2: Choreografia a rozloženie (čisté funkcie)

**Files:**
- Create: `src/motion/scene/timeline.ts`
- Create: `tests/unit/timeline.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Side = 'left' | 'right' | 'center';
  export interface SceneEntry { id: string; top: number; height: number; side: Side }   // top v px dokumentu
  export interface Anchor { id: string; at: number; hold: number; side: Side }           // at = scrollY, keď je stred sekcie v strede viewportu
  export interface Pose { from: string; to: string; t: number; side: Side }
  export function computeAnchors(entries: SceneEntry[], viewportH: number): Anchor[];
  export function resolve(anchors: Anchor[], scrollY: number): Pose;
  export function retarget(shown: Pose, target: Pose): Pose;
  export function layoutFor(side: Side, viewportW: number): { cx: number; scale: number; dim: number };
  ```

**Pravidlá:**
- `computeAnchors`:
  - `at = top + height/2 - viewportH/2`, `hold = min(0.25*height, 0.3*viewportH)`.
  - Po sebe idúce rovnaké `id` sa zlúčia do jednej kotvy (prvé `at`, `hold` siaha po stred poslednej).
- `resolve`:
  - pred prvou kotvou platí prvá a za poslednou posledná (`t = 0`, `from = to`);
  - v `[at-hold, at+hold]` je `t = 0` a `from = to = id`;
  - medzi `a_i.at+hold_i` a `a_{i+1}.at-hold_{i+1}` je `from = a_i`, `to = a_{i+1}` a `t` lineárne 0→1;
  - `side` je `side` cieľa, ak t ≥ 0,5, inak zdroja.
- `retarget` (volá ho renderer, keď sa zmení cieľová dvojica):
  - susedný posun (nové `from` = zobrazené `to` alebo naopak) vráti `target` bez zmeny;
  - inak vráti `{ from: shown.t >= 0.5 ? shown.to : shown.from, to: target.t >= 0.5 ? target.to : target.from, t: 0, side: target.side }`, teda priamy let, medzistavy sa vynechajú.
- `layoutFor`:
  - pod 62rem (992 px) je vždy `cx 0, scale 0.9, dim 0.55`;
  - inak `left → cx -0.5`, `right → cx 0.5`, `center → cx 0` so `scale 0.45` a `dim` 0 (stred: `scale 0.6, dim 0.35`).

- [ ] **Step 1: Failing testy:**
  - `anchors merge consecutive equal ids` (3× `drift` → 1 kotva);
  - `resolve holds at anchor` (scrollY = at → t 0);
  - `resolve interpolates between anchors` (v polovici medzery → t ≈ 0.5, from/to správne);
  - `resolve clamps before first and after last`;
  - `retarget keeps adjacent transitions`;
  - `retarget skips intermediate states` (shown name→credo t 0.2, target work:a→lab t 0.7 ⇒ `{from:'name', to:'lab', t:0}`);
  - `layoutFor collapses to center below 992px`.
- [ ] **Step 2:** `npm run test:unit` → FAIL.
- [ ] **Step 3:** Implementuj `timeline.ts` (bez importov).
- [ ] **Step 4:** `npm run test:unit` → PASS.
- [ ] **Step 5:** Commit `feat: scroll choreography for the living scene`.

### Task 3: Parser skenu vytiahnutý z pointScan

**Files:**
- Create: `src/motion/scene/scanData.ts`
- Create: `tests/unit/scanData.test.ts`
- Modify: `src/motion/ambient/pointScan.ts:550-566` (použije `parseScanHeader`, správanie sa nemení)

**Interfaces:**
- Produces:
  - `parseScanHeader(buf: ArrayBuffer): { count: number; lo: [number,number,number]; hi: [number,number,number]; progressive: boolean } | null`
  - `scanPositions(buf: ArrayBuffer): Float32Array | null` (n×3 floaty normalizované na horizontálny polomer, rovnako ako dnešné `inv` v pointScan, y od zeme).
- Formát (overený v `pointScan.ts:116-117, 552-563`):
  - hlavička 36 B: `MAGIC 0x31534d44` (u32 @0), `count` (u32 @4), `lo` f32×3 @8, `hi` f32×3 @20, flagy u32 @32 (bit 0 = progressive);
  - potom `count×3` int16 normalizovaných na bounds;
  - potom `count` bajtov jasu.

- [ ] **Step 1: Failing testy** so syntetickým bufferom (3 body, známe bounds):
  - `parses header`,
  - `rejects wrong magic` (→ null),
  - `rejects truncated body` (→ null),
  - `decodes int16 positions to normalised floats` (tolerancia 1e-3).
- [ ] **Step 2:** `npm run test:unit` → FAIL.
- [ ] **Step 3:** Implementuj. V `pointScan.ts` nahraď inline dekódovanie hlavičky volaním `parseScanHeader`.
- [ ] **Step 4:** `npm run test:unit` → PASS. `npm run build` → 152 pages. `E2E_STRICT=1 npx playwright test tests/e2e/motion.spec.ts` → bez nových chýb.
- [ ] **Step 5:** Commit `refactor: share scan header parsing with the living scene`.

### Task 4: Glyfy a tvary v prehliadači (+ checkpoint s Denisom)

**Files:**
- Create: `src/motion/scene/glyphs.ts`
- Create: `src/motion/scene/shapes.ts`
- Create: `tests/unit/shapes.test.ts`

**Interfaces:**
- Consumes: `sampleMask`, `fitCount`, `scatter` (Task 1), `scanPositions` (Task 3).
- Produces:
  - `glyphs.ts`: `CREDO: { build: string; teach: string; move: string; explore: string }` (SVG path `d`, viewBox 0 0 100 100, len ťahy, stroke 6) a `ARROW: string`.
    - **Návrh motívov:** Build = tri na sebe uložené tehly, Teach = otvorená kniha (dva oblúky), Move = plynulá vlna, Explore = kružnica s ihlou kompasu.
  - `shapes.ts`:
    - `rasterize(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 512, h = 256): { alpha: Uint8ClampedArray; w: number; h: number }` (OffscreenCanvas, ak existuje, inak `document.createElement('canvas')`; z `getImageData` vyberie každý 4. bajt);
    - `textShape(text: string, font: string, n: number, seed: number): Float32Array`;
    - `pathsShape(paths: string[], n: number, seed: number): Float32Array` (cesty vedľa seba v jednom riadku, `Path2D` + `stroke`);
    - `svgShape(svg: SVGSVGElement, n: number, seed: number): Promise<Float32Array>` (XMLSerializer → Blob URL → `Image` → `drawImage`; pri chybe vráti `scatter`);
    - `scanShape(buf: ArrayBuffer, n: number, seed: number): Float32Array` (`fitCount(scanPositions(buf) ?? scatter(n,seed), n, seed)`).
  - Unit test pokryje len čistú časť cez injektovaný `rasterize`. Signatúra: `textShape(..., raster = rasterize)`, rovnako pre ostatné.

- [ ] **Step 1: Failing testy:**
  - `textShape uses raster alpha` (fake raster s plným obdĺžnikom → n bodov v [-1,1]);
  - `textShape falls back to scatter on empty mask`;
  - `pathsShape returns exactly n points`.
- [ ] **Step 2:** `npm run test:unit` → FAIL.
- [ ] **Step 3:** Implementuj `glyphs.ts` a `shapes.ts`.
- [ ] **Step 4:** `npm run test:unit` → PASS.
- [ ] **Step 5: CHECKPOINT Denis.** Vyrenderuj 4 glyfy a šípku do jedného SVG v scratchpade, ukáž ich Denisovi (SendUserFile, render) a počkaj na OK alebo úpravy. Bez OK nepokračuj na Task 6 (Task 5 môže bežať).
- [ ] **Step 6:** Commit `feat: credo glyphs and shape builders`.

### Task 5: Renderer s morphom (shader)

**Files:**
- Create: `src/motion/scene/morph.ts`

**Interfaces:**
- Consumes: `createGL`, `GL` z `src/motion/ambient/gl.ts`.
- Produces:
  ```ts
  export interface MorphUniforms {
    progress: number; time: number; velocity: number;       // velocity = |Δscroll|/viewportH za snímku, vyhladená, 0..1
    pointer: [number, number, number];                      // x,y v clip space, z = 1 aktívny / 0
    cx: number; scale: number; dim: number;                 // z layoutFor
    color: [number, number, number]; size: number;          // farba z computed `color` body, veľkosť v px × DPR
  }
  export interface Morph {
    setShapes(from: Float32Array, to: Float32Array): void;  // n×3, rovnaká dĺžka ako pri create
    draw(u: MorphUniforms): void;
    dispose(): void;
  }
  export function createMorph(ctx: GL, n: number): Promise<Morph>;
  ```
- **Buffery:**
  - `aFrom` a `aTo` (vec3, `DYNAMIC_DRAW`, `bufferSubData` pri `setShapes`);
  - `aSeed` (float, `rng(1)` raz, `STATIC_DRAW`);
  - jeden `drawArrays(gl.POINTS, 0, n)`.
- **Algoritmus vertex shadera** (nie je určený signatúrou):
  ```glsl
  float lt = smoothstep(0.0, 1.0, clamp(uProgress * 1.4 - aSeed * 0.4, 0.0, 1.0));
  vec3 p = mix(aFrom, aTo, lt);
  float flight = sin(lt * 3.14159) * (0.12 + 0.5 * uVelocity);
  p.xy += flight * vec2(sin(aSeed * 91.0 + uTime * 0.6), cos(aSeed * 57.0 + uTime * 0.5));
  p.xy += 0.006 * vec2(sin(uTime * 0.4 + aSeed * 12.0), cos(uTime * 0.3 + aSeed * 7.0));   // dýchanie
  vec2 c = vec2(uCx, 0.0) + p.xy * uScale;
  vec2 d = c - uPointer.xy; float r = length(d);
  c += uPointer.z * normalize(d + 1e-5) * 0.08 * smoothstep(0.18, 0.0, r);                  // odtláčanie kurzorom
  gl_Position = vec4(c.x / uAspect, c.y, 0.0, 1.0);
  gl_PointSize = uSize * (1.0 + p.z * 0.6);
  vAlpha = (0.55 + 0.45 * fract(aSeed * 13.0)) * (1.0 - uDim);
  ```
- **Fragment shader:** okrúhly bod (`discard`, ak `length(gl_PointCoord-0.5) > 0.5`), farba `uColor * vAlpha` (premultiplied, blend `ONE, ONE_MINUS_SRC_ALPHA` ako v pointScan), jemný šum `hash(gl_FragCoord.xy + uTime)` ±4 %, čím nahrádza zrnitosť.
- [ ] **Step 1:** Implementuj `morph.ts`. Programy cez `ctx.program()` (asynchrónne, bez synchrónneho dotazu na stav).
- [ ] **Step 2:** `npx astro check` → 0 errors. Vizuálne sa overuje v Task 6.
- [ ] **Step 3:** Commit `feat: GPU morph renderer for the living scene`.

### Task 6: Runtime scény a zapojenie na homepage

**Files:**
- Create: `src/motion/scene/scene.ts` (lazy entry)
- Modify: `src/motion/depth/index.ts:91-95` (namiesto `heroScan` importuje `../scene/scene`, ak existuje `[data-scene]`)
- Modify: `src/components/hero/Hero.astro` (`data-scene="name" data-scene-side="right"` na `<section class="hero">`)
- Modify: `SchoolsEntry`, `Credo` (`credo`, `center`), riadky v `SelectedWork.astro` (`work:<slug>`, strana oproti textu), `WhatIDo`, `AboutTeaser`, `Currently` (`drift`), `LabPreview.astro` (`scan`, `right`), `ContactTeaser.astro` (`arrow`, `center`)
- Create: `tests/e2e/scene.spec.ts`

**Interfaces:**
- Consumes: Task 1–5, `afterReveal`, `idle`, `createLoop`, `canAffordGL`, `hasFinePointer`, `prefersReducedMotion`, `onMotionPreferenceChange`, `renderScale`, `fontsReady` z `utils/env.ts`.
- Produces:
  - `initScene(): () => void`;
  - `pickTier(): 'desktop' | 'mobile' | 'static'`. Calm alebo `!canAffordGL()` → `static`, jemný ukazovateľ → `desktop`, inak `mobile`;
  - na `<html>` atribút `data-scene-tier` a na kanvase `data-scene-state="<aktuálne id to>"` (čítajú ho e2e testy).

**Správanie:**
- **Kanvas:** JS vytvorí `<canvas class="scene" aria-hidden="true">` ako prvé dieťa `body`, `position:fixed; inset:0; z-index:var(--z-ambient); pointer-events:none`.
- **Tvary sa stavajú postupne v `idle`:**
  - `scatter` hneď;
  - `name` po `fontsReady()` (timeout 3 s → ostáva `scatter`) s fontom H1;
  - `credo` z `CREDO`, `arrow` z `ARROW`;
  - `work:<slug>` z `svg` v danom riadku;
  - `scan` cez fetch súboru z `data-desktop`/`data-mobile` (podľa tieru) na Lab sekcii, až keď je Lab do 2 viewportov (IntersectionObserver s `rootMargin: '200% 0px'`);
  - `drift` = `scatter(n, 2)`.
  - Kým tvar nie je hotový, používa sa `scatter`.
- **Príchod:** prvý snímok `from = scatter`, `to = name`. `progress` ide časovo 0→1 za 1,8 s, potom ho preberie scroll.
- **Slučka (`createLoop`):**
  1. `resolve(anchors, scrollY)`;
  2. ak sa dvojica zmenila → `retarget` a `setShapes`;
  3. `shown.t` sa lerpuje k cieľu (faktor `1 - exp(-dt/120)`);
  4. velocity sa vyhladí;
  5. `draw`;
  6. vráti `false`, keď |Δt| < 0,001, velocity < 0,001 a ukazovateľ je v pokoji 500 ms.
- **Reštart slučky:** `scroll` a `pointermove` (len desktop), oba passive.
- **Kotvy:** z `[data-scene]` cez `getBoundingClientRect().top + scrollY`. Prepočet je debounced 150 ms cez ResizeObserver na `document.body`.
- **Stav calm** zmenený za behu → `dispose` a prepnutie na `static` (Task 7).
- **Upratanie:** `pagehide` zastaví slučku a `pageshow` s `persisted` ju obnoví.

- [ ] **Step 1: Failing e2e** v `tests/e2e/scene.spec.ts`:
  - `home has exactly one scene canvas` (`canvas.scene` count 1);
  - `tier is desktop on desktop project, mobile on mobile project`;
  - `scrolling to Lab sets state scan` (scroll na `[data-scene="scan"]`, počkať, `data-scene-state` = `scan`);
  - `scene keeps the right state after resize` (scroll na Credo, `setViewportSize` 1024×700 → `credo`);
  - `subpages have no scene canvas` (`/sk/laby/`).
- [ ] **Step 2:** `npm run build && npx playwright test tests/e2e/scene.spec.ts` → FAIL.
- [ ] **Step 3:** Implementuj `scene.ts`, zapoj ho v `depth/index.ts` a pridaj `data-scene` atribúty.
- [ ] **Step 4:** Build a test → PASS. Ručne: `preview_start`, desktop a mobil (`resize_window` mobile), screenshoty úvodu, Creda, Práce, Labu a Kontaktu.
- [ ] **Step 5:** Commit `feat: living scene runtime on the homepage`.

### Task 7: Záložný 2D režim, pokojný režim a strata kontextu

**Files:**
- Create: `src/motion/scene/fallback.ts`
- Modify: `src/motion/scene/scene.ts`
- Modify: `tests/e2e/scene.spec.ts`, `tests/e2e/bfcache.spec.ts`

**Interfaces:**
- Produces: `createFallback(canvas: HTMLCanvasElement): { show(shape: Float32Array, layout: ReturnType<typeof layoutFor>, color: string): void; dispose(): void }`.
  - Kreslí body ako 1,5 px štvorce do 2D kanvasu.
  - Zmena tvaru = crossfade 400 ms cez `globalAlpha` (v slučke `createLoop`, ktorá sa po dobehnutí zastaví).
- Lazy import `./fallback` iba pri tieri `static`, pri strate kontextu alebo pri prepnutí do calm.
- **Strata kontextu:** `GLHooks.lost` → `morph.dispose()` a prepnutie na fallback. `restored` → nový `createMorph` a návrat do GL tieru, ak `pickTier() !== 'static'`.

- [ ] **Step 1: Failing e2e:**
  - `calm mode creates no WebGL context` (localStorage `irl:motion=calm` pred načítaním; `liveContexts()` nie je dostupné v buildi, preto over `data-scene-tier="static"` a že `canvas.scene.getContext('2d')` nevráti null);
  - `toggling calm at runtime switches to static`;
  - `context loss falls back to 2D` (`WEBGL_lose_context.loseContext()` cez `page.evaluate` → `data-scene-tier="static"`);
  - v `bfcache.spec.ts`: `scene resumes after bfcache restore` (state sa po návrate z inej stránky znova mení pri scrolle).
- [ ] **Step 2:** FAIL. **Step 3:** Implementuj. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat: 2D fallback and calm handling for the living scene`.

### Task 8: Odstránenie starých vrstiev

**Files:**
- Modify: `src/components/hero/Hero.astro`:
  - zmaž `.hero__rules`, `.hero__floor`, `.hero__ground` (markup, CSS, scroll timelines);
  - zmaž hostiteľa skenu `.hero__scan`, `.hero__scan-anchor` a `.hero__scan-cap`;
  - zmaž `data-scan-mask`, `data-parallax` a import `pointerField`.
- Delete: `src/motion/hero/pointerField.ts`, `src/motion/hero/heroScan.ts`, `src/motion/magnetic.ts`, `src/motion/projects/pointerPreview.ts`.
- Modify: `src/components/projects/SelectedWork.astro`:
  - zmaž import `pointerPreview`, fixný náhľad, CSS „pás“ (`band-plate`, `band-turn`, `band-lift`, `--row` timeline) a animáciu diorám `--card`;
  - plátky v riadkoch ostávajú staticky a `plateTransition.ts` ostáva.
- Modify: `src/components/lab/LabPreview.astro` (zmaž `lab-scan` značku; sem presuň popisok skenu `scanCaption`, viditeľný až po stave `scan` cez `[data-scene-state]`).
- Modify: `src/motion/pointer/cursorField.ts` (na začiatku `initCursorField`: `if (document.querySelector('[data-scene]')) return () => {}`).
- Modify: `src/styles/global.css:23-32` (z-index zrnitosti 200 → 95 a `:root:has([data-scene]) body::after { content: none; }`).
- Modify: e2e testy, ktoré cielia na zmazané prvky: `tests/e2e/gpu.spec.ts`, `motion.spec.ts`, `regressions.spec.ts`, `visual.spec.ts` (+ snapshoty v `__screenshots__`).

- [ ] **Step 1: Failing e2e** v `scene.spec.ts`: `old layers are gone from home`. Na homepage nie sú `.hero__floor`, `.hero__ground`, `.hero__rules`, kanvas kurzora ani `[data-preview-on]`; `body::after` má `content: none`.
- [ ] **Step 2:** FAIL. **Step 3:** Zmaž a uprav. Testy viazané na zmazané prvky prepíš na scénu alebo zmaž (v commite uveď prečo). Snapshoty obnov cez `--update-snapshots` až po vizuálnej kontrole.
- [ ] **Step 4:** `npx astro check` (0), `npm run build` (152), celé `E2E_STRICT=1 npx playwright test` → PASS.
- [ ] **Step 5:** Commit `refactor: remove the stacked hero and work layers replaced by the scene`.

### Task 9: Rozpočet, jazyky a brány

**Files:**
- Modify: `scripts/check-budget.mjs:82-116`:
  - `PAGE_CAPS.home.js` 2.65 → **3.0** (komentár: plánovač scény nahrádza plánovač skenu, merané v tomto commite);
  - do `LAZY_CHUNKS` pridaj `{ id: 'scene', match: /^(?:scene|morph|shapes|points|timeline|scanData|glyphs)\./, cap: 9 }` a `{ id: 'scene/fallback', match: /^fallback\./, cap: 1.5 }`;
  - `TOTAL_NEW_JS_CAP` 11.1 → **21.6** (= 11.1 + 9 + 1.5, komentár so súčtom).
- Modify: `tests/e2e/scene.spec.ts`

- [ ] **Step 1: Failing e2e:** `scene anchors exist in every language` pre `/sk/`, `/sr/`, `/tr/`. Počet `[data-scene]` je rovnaký ako na `/en/` a po príchode je `data-scene-state` = `name`.
- [ ] **Step 2:** `npm run build && npm run budget`. Ak nejaký chunk presahuje strop, **zmenši kód, strop neposúvaj** a ak to nejde, opýtaj sa Denisa.
- [ ] **Step 3:** `npm run budget:self-test`, `npm run test:unit`, `E2E_STRICT=1 npx playwright test`, `npm run lhci` → všetko zelené (výkon ≥ 95, a11y 100, CLS 0, LCP ≤ 2,56 s).
- [ ] **Step 4:** Commit `chore: budget caps and language coverage for the living scene`.

### Task 10: Dokumentácia, náhľad a odovzdanie Denisovi

**Files:**
- Create: `src/motion/scene/README.md` (API, stavy, tiery, pravidlá pre nové sekcie: pridať `data-scene` + `data-scene-side`)
- Modify: `docs/HANDOFF.md` (sekcie 2 a 3: nová vetva, čo scéna nahradila, stav brán)
- Modify: `docs/motion-references.md` (poznámka, ktoré referencie už na homepage nie sú)

- [ ] **Step 1:** Dopíš dokumentáciu.
- [ ] **Step 2:** Commit `docs: living scene as built`.
- [ ] **Step 3:** `git push -u origin feat/living-scene`. Vercel náhľad zisti cez `gh api repos/Deniscoke/mojweb/deployments` (+ statuses, `environment_url`).
- [ ] **Step 4:** Pošli Denisovi odkaz a screenshoty (desktop + mobil). **Nemerguj do `main`.**
