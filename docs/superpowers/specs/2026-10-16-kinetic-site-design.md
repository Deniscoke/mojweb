# Kinetický web: návrh (spec)

- **Dátum:** 2026-10-16
- **Vetva:** `feat/kinetic-site` z `main` (`f6832ef` + handoff).
- **Stav:** návrh na schválenie.

## 1. Zámer

**Denis chce:**
1. Sken kasna úplne preč z webu.
2. Doladiť podstránky.
3. Vizuálne a animačne vyboostovať všetky stránky zaujímavou knižnicou, ktorá ladí s tým, čo už je, a dať si na tom záležať.

**Rozhodnutia z konverzácie:**
- Smer: **GSAP a živá scéna na všetkých stránkach.**
  - GSAP: SplitText, ScrambleText a jadro.
  - Žiadny Lenis: natívny scroll ostáva.
- V sekcii Lab na homepage body kreslia **otáznik** namiesto skenu.

**Kritériá úspechu:**
- Každý typ stránky (homepage, prípadová štúdia, `/laby`, detail labu, `/lab`, poznámka) má živú scénu a kinetickú typografiu v jednom jazyku pohybu.
- Na homepage je zachované, čo Denis schválil: portrét, Credo, plátky projektov a prechod z bodov.
- Lighthouse ostáva na dnešných hodnotách: výkon ≥ 95, TBT ≤ 50 ms, CLS 0, a11y 100, LCP ≤ 2,5 s alebo na baseline. Všetko nové sa načíta **až pri prvom vstupe** a nič nové nie je na ceste k LCP.
- Bez JavaScriptu a pri systémovom `prefers-reduced-motion` je všetok obsah viditeľný a nič sa nehýbe samo.

## 2. Kasna: úplné odstránenie

**Odstránia sa:**
- `src/data/scans.ts`
- `public/assets/scans/*.bin`
- `scripts/build-scans.mjs`
- `scripts/render-pointcloud.py`
- `src/motion/scene/scanData.ts`, `scanShape` v `shapes.ts` a tvar `scan` v `scene.ts`
- popiska a dáta skenu v `LabPreview.astro`
- `SCAN_CAPS` a súvisiace kontroly a self-testy v `check-budget.mjs`
- `tests/unit/scanData.test.ts`, úpravy dotknutých e2e testov

**Ostáva ako obsah** (nie animácia): render `digital-space-pointcloud.webp` v poznámke a projekte Digital Space a prózy o RealityScan. Ak ich Denis chce tiež preč, je to samostatná obsahová zmena.

**Lab na homepage:** `data-scene="question"`. Otáznik je nový glyf v `glyphs.ts`, ťahom ako Credo.

## 3. Živá scéna na všetkých stránkach

**Spúšťanie:** spúšťač pri prvom vstupe sa presúva z `Hero.astro` do depth runtime (`src/motion/depth/index.ts`). Beží na každej stránke, ktorá má `[data-scene]`, a spúšťa scénu aj kinetickú vrstvu (sekcia 4). Rozpočet ostatných stránok (+2,1 KB) to unesie: dnes je na +1,65 KB.

**CSS kanvasu:** `.scene` a vypnutie zrnitosti sa presúvajú do zdieľaného štýlu, ktorý platí len pod `html[data-scene-tier]` (atribút nastavuje scéna). Stránka bez scény sa nemení.

**Farba bodov:** z CSS premennej `--scene-ink` (default `--c-bone`). Detail labu ju nastaví na farbu svojho labu (`--lab-accent`).

**Tvary podľa stránky:**

| Stránka | Hero | Telo | Koniec |
|---|---|---|---|
| Homepage | portrét (bez zmeny) | Credo, plátky, **otáznik v Labe**, drift | drift |
| Prípadová štúdia | plát projektu vpravo od nadpisu (hlavička dnes nemá vizuál) | drift | plát **nasledujúceho projektu** pri odkaze „ďalší projekt“ |
| `/laby` | 4 symboly Credo | drift | drift |
| Detail labu | drift vo farbe labu (plát labu už v hero je) | drift | drift |
| `/lab` | otáznik vpravo od nadpisu | drift | drift |
| Poznámka v labe | malý otáznik | drift | drift |
| 404, gate | bez scény (variant gate nemá runtime) | | |

**Prechod z homepage na projekt** ostáva. Plát v hlavičke prípadovej štúdie stojí tam, kam prechod doletí, takže body nadviažu na plát z prechodu.

## 4. Kinetická vrstva (GSAP)

**Knižnica:** `gsap@3.15.0`, licencia „Standard no-charge“, pluginy sú v balíku. Zabalí sa do vlastného lazy chunku `kinetic`. CSP povoľuje len `'self'`, žiadne CDN. Chunk sa importuje v rovnakej chvíli ako scéna (prvý vstup), nikdy na ceste k LCP.

**Modul:** `src/motion/kinetic/`. Efekty sa zapínajú atribútmi, pridávajú sa do komponentov:

| Atribút | Efekt | Kde |
|---|---|---|
| `data-kinetic="gather"` | Nadpis sa rozdelí na znaky (SplitText). Znaky priletia z rozptýlených pozícií a „zložia sa“ ako body scény: posun ±40 px, rotácia ±12°, rozmazanie a opacity, stagger 18 ms. Raz, pri vstupe do obrazu. | h2 sekcií, h1 podstránok pod úvodnou obrazovkou, nadpisy projektov v zozname |
| `data-kinetic="decode"` | Mono text sa „dekóduje“ (ScrambleText, znaky `0-9A-Z#/·`, 0,6 s) pri vstupe do obrazu. | mono popisky sekcií, hodnoty v Readout, tagy, čísla riadkov |
| `data-kinetic="decode-hover"` | To isté pri prejdení myšou alebo fokuse. | odkazy v navigácii, CTA „Napíš mi“, „Ďalší projekt“ |

**Pravidlá:**
- **Progresívne vylepšenie:** bez JS a pred načítaním chunku je text normálne viditeľný. Kinetika animuje len prvky, ktoré **ešte neboli v obraze** v čase načítania. Čo už divák videl, sa nikdy neskryje.
- **Žiadna dvojitá animácia:** prvok s `data-kinetic="gather"` nemá vlastný `data-reveal`. Hlavičky sekcií s `data-reveal` dostanú `data-kinetic` na nadpis a `data-reveal` sa presunie na zvyšok hlavičky.
- **Prístupnosť:**
  - SplitText v režime `aria: 'auto'`: čítačky čítajú celé slovo.
  - Po dokončení `revert()` vráti pôvodný DOM.
  - ScrambleText sa nespustí na prvku so zameraním čítačky (`aria-live`) a vždy skončí na pôvodnom texte.
- **Reduced motion** (systém): kinetika sa nenačíta vôbec.
- **Výkon:**
  - animuje sa len `transform`, `opacity` a `filter: blur` (blur iba do 4 px a iba na desktope);
  - delenie na znaky sa robí tesne pred vstupom do obrazu (IntersectionObserver, `rootMargin: 20%`);
  - na stránke beží najviac jedna gather animácia naraz.

## 5. Doladenie podstránok

- **`/lab`:**
  - nadpis má rovnakú mierku ako sekcie homepage (`--t-display`, dnes `--t-section`);
  - otáznik zo scény vpravo;
  - čísla otázok sa dekódujú;
  - CSS „čítacia hlava“ sa odstraňuje, rovnako ako na homepage.
- **Poznámka:**
  - späť-odkaz a tagy sa dekódujú;
  - sekcie s nadpismi majú gather;
  - jemný drift scény.
- **Prípadová štúdia:**
  - hlavička dostane plát zo scény vpravo, v mieste, ktoré dnes nemá vizuál;
  - meter zrelosti sa dekóduje;
  - „ďalší projekt“ ukáže svoj plát v bodoch.
- **`/laby` a detail labu:** gather nadpisov a dekódovanie popisiek, body vo farbe labu.
- **Drobnosti odložené z minulej kontroly (opraviť teraz):**
  - zamrznutie po prepnutí karty prehliadača;
  - zmena výšky okna na mobile (adresný riadok);
  - race pri prepnutí reduced motion počas štartu WebGL;
  - mŕtve odkazy (`hero__scan*` v `check-budget.mjs`, `motion.spec.ts`);
  - `console.warn` pri zlyhaní WebGL.

## 6. Rozpočet

| Položka | Dnes | Nový strop |
|---|---|---|
| ostatné stránky, úvodný JS | +1,65 KB (strop 2,1) | bez zmeny strop **2,1** |
| home, úvodný JS | +1,08 KB | bez zmeny strop 2,65 |
| lazy `scene` | 7,1 KB | **9** (bez zmeny) |
| **lazy `kinetic`** (gsap core + SplitText + ScrambleText + náš modul) | — | **≤ 40 KB** gzip, odhad ~36 |
| `TOTAL_NEW_JS_CAP` | 15,8 | **+40 → 55,8** |

GSAP sa stiahne len raz (cache) a až po prvom vstupe. Lighthouse ho nenameria, lebo nič nerobí.

## 7. Testovanie

- **Unit:** glyf otáznika (počet bodov), mapovanie tvarov podľa typu stránky (čistá funkcia), výber prvkov na kinetiku (čo už bolo v obraze sa nespracuje), čistá logika bez DOM.
- **E2E (Playwright):**
  - každá stránka po prvom vstupe má práve jeden `canvas.scene` a správny stav hero (`work:<slug>` na projekte, `question` na `/lab`, `credo` na `/laby`);
  - gather: nadpis po animácii má pôvodný `textContent` a žiadne zvyšné obaly;
  - decode: text skončí na pôvodnej hodnote;
  - pri reduced motion sa kinetický chunk nestiahne;
  - bez JS je všetko viditeľné (existujúci test);
  - homepage nemá kasnu (`[data-scene="scan"]`, žiadny request na `.bin`);
  - farba bodov v detaile labu sa rovná farbe labu.
- **Brány:**
  - `astro check`, `build` (152 strán)
  - `budget`, `budget:self-test`
  - `test:unit`
  - `E2E_STRICT=1` e2e, GPU e2e
  - `lhci`: všetky stránky na dnešných hodnotách, `/laby` TBT ~60 ms je zdokumentovaný šum.

## 8. Riziká

| Riziko | Zmiernenie |
|---|---|
| GSAP pridá ~36 KB, na slabom mobile parse ~30 ms po prvom vstupe | Načítanie v idle po vstupe, kinetika na mobile bez blur. Úlohy sa merajú v GPU teste pri 6× throttle (žiadna úloha z `kinetic` ≥ 50 ms). |
| Gather pri rýchlom scrolle (veľa nadpisov naraz) | Najviac jedna animácia naraz, ostatné sa ukážu hneď. |
| Rozbitie zalomenia nadpisov po SplitText | Split na slová aj znaky, `revert()` po skončení, test, že `textContent` sedí. |
| Kombinácia nadpisu so `data-reveal` a kinetiky | Pravidlo zo sekcie 4. Rozpočtový lint (`check-budget`) dostane pravidlo: prvok nesmie mať `data-reveal` aj `data-kinetic` naraz. |
