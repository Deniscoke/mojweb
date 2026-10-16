# Kinetický web: implementačný plán

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (Denis zvolil inline vykonanie a na konci jednu kontrolu). Kroky sú checkboxy.

**Goal:** odstrániť kasnu, rozšíriť živú scénu na všetky stránky a pridať kinetickú typografiu (GSAP) bez zhoršenia Lighthouse.

**Architecture:**
- Spúšťač pri prvom vstupe sa presúva z `Hero.astro` do `src/motion/depth/index.ts`. Ten importuje `scene/scene.ts` aj nový `kinetic/kinetic.ts` (jediný vstup s dynamickými importmi, takže preload helper Vite ostane v ňom).
- Scéna číta tvary z atribútov `data-scene*` a farbu z `--scene-ink`.
- Kinetika číta `data-kinetic`.

**Tech Stack:** Astro 5, TypeScript, WebGL2 (vlastný), `gsap@3.15.0` (core, SplitText, ScrambleTextPlugin), node --test, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-kinetic-site-design.md`

## Global Constraints
- **Vetva** `feat/kinetic-site`. Do `main` až po Denisovom súhlase s náhľadom.
- **CSP** `script-src 'self'`: GSAP sa zabalí do buildu, žiadne CDN.
- **Nič nové pred prvým vstupom.**
  - Stropy úvodného JS ostávajú: home 2,65 KB, ostatné 2,1 KB.
  - Lazy stropy: `scene` 9 KB, `kinetic` ≤ 40 KB, `TOTAL_NEW_JS_CAP` 55,8 KB.
- **Reduced motion (systém):** kinetika sa nenačíta, scéna je statická.
- **Bez JS** je všetko viditeľné.
- **Lighthouse:** výkon ≥ 95, TBT ≤ 50, CLS 0, LCP ≤ 2,5 s alebo baseline. `/laby` TBT ~60 ms je známy šum.
- **Commity:** konvenčné + `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus
1. **Nadpis, ktorý už bol v obraze, keď sa kinetika načítala, sa nesmie skryť** ani znova animovať. Test v Task 4.
2. **SplitText musí po `revert()` vrátiť presne pôvodný DOM a text,** aj pri ć, š a tureckých znakoch. Test v Task 4 (`/sr/`, `/tr/`).
3. **Rýchly scroll cez veľa nadpisov:** najviac jedna gather animácia naraz, ostatné sa hneď ukážu. Test v Task 4.
4. **Prípadová štúdia s embedom alebo médiom** (napr. Splatoo) nemá plát v DOM: hero musí byť drift, nie prázdny tvar. Test v Task 3.
5. **Prepnutie karty, mobilný adresný riadok, strata kontextu:** scéna pokračuje. Test v Task 5.

---

### Task 1: Kasna preč, otáznik v Labe
**Files:**
- Delete: `src/data/scans.ts`, `public/assets/scans/`, `scripts/build-scans.mjs`, `scripts/render-pointcloud.py`, `src/motion/scene/scanData.ts`, `tests/unit/scanData.test.ts`
- Modify: `shapes.ts` (bez `scanShape`), `scene.ts` (bez tvaru `scan`), `glyphs.ts` (+`QUESTION`), `LabPreview.astro` (`data-scene="question"`, bez popisky a dát skenu), `check-budget.mjs` (bez `SCAN_CAPS`, mŕtve `hero__scan*`, self-test fixture), dotknuté e2e testy.

**Kroky:**
- [ ] e2e: `scrolling to Lab sets state question`, `home never requests a scan file`. Spustiť, musia zlyhať.
- [ ] Implementácia. `QUESTION` je ťah otáznika v 100×100 boxe a bodka ako krátky ťah.
- [ ] `astro check`, `build`, `test:unit` a scene e2e prechádzajú.
- [ ] Commit `refactor: remove the kasna scan, the Lab draws a question mark`.

### Task 2: Spúšťač a CSS scény pre všetky stránky
**Files:**
- `src/motion/depth/index.ts`: spúšťač pri prvom vstupe po reveal, ak existuje `[data-scene]` alebo `[data-kinetic]`; importuje scénu.
- `Hero.astro`: bez spúšťača.
- `src/styles/global.css`: `html[data-scene-tier] .scene{…}` a `html[data-scene-tier] body::after{content:none}`.
- `index.astro`: bez vlastného štýlu.
- `scene.ts`: farba z `getComputedStyle(root).getPropertyValue('--scene-ink')` s fallbackom na farbu `body`.

**Kroky:**
- [ ] e2e: `/sk/lab/` po prvom vstupe má `canvas.scene`; zrnitosť je vypnutá len so scénou. Musí zlyhať.
- [ ] Implementácia, test PASS, rozpočet ostatných stránok ≤ 2,1.
- [ ] Commit `feat: the living scene can run on every site page`.

### Task 3: Tvary na podstránkach
**Files:** `projects/[slug].astro`, `laby/index.astro`, `laby/[slug].astro`, `lab/index.astro`, `lab/[slug].astro`, `scene.ts`

**Atribút `data-scene-source="<selektor>"`:** plát pre tvar `work:` sa hľadá v inom prvku (hlavička projektu → `.project-page__plate`). Bez plátu v DOM je tvar `drift`.

**Mapovanie podľa stránky:**

| Stránka | Hero | Telo | Iné |
|---|---|---|---|
| projekt | `work:<slug>`, `right`, x 0.55, scale 0.36 | sekcie `drift` | |
| `/laby` | `credo` | `drift` | |
| detail labu | `drift` | `drift` | `main` nastaví `--scene-ink: var(--lab-accent)` |
| `/lab` | `question`, `right` | `drift` | |
| poznámka | `question` scale 0.22 | `drift` | |

**Kroky:**
- [ ] e2e pre každý typ stránky (stav hero po prvom vstupe, farba v detaile labu). Musia zlyhať.
- [ ] Implementácia, PASS.
- [ ] Commit `feat: shapes for every page type`.
- [ ] **Ruling:** plát „ďalšieho projektu“ zo specu sa nerobí. Jeho SVG nie je v DOM a pridanie by zväčšilo HTML prípadových štúdií. Pasca z HANDOFF: prvé TCP okno, LCP. Koniec projektu je `drift`.

### Task 4: Kinetická vrstva
**Files:**
- Create: `src/motion/kinetic/kinetic.ts` (lazy, GSAP), `src/motion/kinetic/pick.ts` (čisté funkcie), `tests/unit/kinetic.test.ts`
- Modify: `package.json` (`gsap@3.15.0` v `dependencies`), komponenty (atribúty), `depth/index.ts` (import kinetiky v rovnakom spúšťači), `check-budget.mjs` (lazy chunk `kinetic` ≤ 40, total 55,8, lint `data-reveal`+`data-kinetic` na tom istom prvku je chyba)

**`pick.ts`:**
- `unseen(rects: {top:number;bottom:number}[], viewportH: number, scrollY: number): boolean[]`: prvok nad spodným okrajom obrazovky už bol videný.
- `queue()`: najviac 1 gather naraz, ďalšie sa ukážu hneď.

**`kinetic.ts`:** `initKinetic(): () => void`
- Gather: SplitText `type:'words,chars'`, `aria:'auto'`. Znaky z `x/y ±40, rotate ±12, opacity 0, blur 4px` (blur len pri jemnom ukazovateli), `stagger 0.018`, `duration 0.7`, `ease 'expo.out'`, potom `revert()`.
- Decode: ScrambleText, `chars:'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#/·'`, `duration 0.6`, `revealDelay 0.1`. Hover a focus pre `decode-hover`.
- Pozorovanie cez IntersectionObserver s `rootMargin: '0px 0px -10% 0px'`.

**Atribúty:**
- `gather`: h2 sekcií (hlavičky sekcií na homepage, v labe a na laby stránkach), nadpisy riadkov projektov, `project-page__next-title`, h2 v poznámkach.
- `decode`: `section__label`, hodnoty v Readout, `lab__num`, tagy.
- `decode-hover`: odkazy v navigácii, CTA kontaktu, „ďalší projekt“.
- Kde má hlavička `data-reveal`, ostáva na hlavičke a nadpis dostane `data-kinetic`. Lint kontroluje len rovnaký prvok.

**Kroky:**
- [ ] Unit testy `pick.ts` (RED → GREEN).
- [ ] e2e:
  - nadpis mimo obrazu po scrolle má po dokončení pôvodný `textContent` a žiadne `.char`/`.word` obaly;
  - nadpis v obraze pri načítaní sa nikdy neskryje (opacity ostane 1);
  - decode skončí na pôvodnom texte;
  - pri reduced motion sa chunk `kinetic` nestiahne.

  Musia zlyhať.
- [ ] Implementácia, PASS, `build` a `budget` (kinetic ≤ 40).
- [ ] Commit `feat: kinetic typography with GSAP on every page`.

### Task 5: Doladenie podstránok a drobnosti
**Kroky:**
- [ ] `/lab`: nadpis `--t-display`, preč čítacia hlava (CSS `::after`).
- [ ] Scéna:
  - `visibilitychange` (visible) → `loop.start()`;
  - `resize` okna → debounce, prepočítať kotvy a veľkosť kanvasu;
  - `useGL` a `createMorph` reject strážia `ctx === mine && tier !== 'static'`;
  - `console.warn` pri zlyhaní GL;
  - mŕtve odkazy v testoch.
- [ ] e2e: `scene resumes after the tab comes back` (`visibilitychange` cez `page.evaluate`).
- [ ] Commit `fix: scene resumes after tab switch and window resize; polish lab index`.

### Task 6: Rozpočet, brány, dokumentácia, náhľad
- [ ] Brány zo Global Constraints, `lhci` všetky stránky, GPU e2e (žiadna úloha z `kinetic|scene` ≥ 50 ms pri 6× throttle: rozšíriť `DEPTH_SOURCES`).
- [ ] Dokumentácia:
  - `src/motion/kinetic/README.md`;
  - `src/motion/scene/README.md` (tvary, `--scene-ink`, `data-scene-source`, otáznik, bez skenu);
  - `docs/HANDOFF.md`.
- [ ] Finálna kontrola čerstvým recenzentom, opravy Critical/Important.
- [ ] Push vetvy, náhľad Vercel, screenshoty (desktop + mobil, všetky typy stránok).
