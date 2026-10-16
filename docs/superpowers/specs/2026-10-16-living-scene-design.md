# Živá scéna: návrh (spec)

- **Dátum:** 2026-10-16
- **Vetva:** vychádza z `feat/motion-depth` (HEAD `6dc972c`).
- **Stav:** návrh schválený v konverzácii. Čaká sa na revíziu tohto dokumentu.

## 1. Zámer

Denis chce, aby celý pohyb na homepage pôsobil **ako jeden zážitok**: dynamický, originálny, zviazaný s obsahom a rýchly na desktope aj na telefóne. Dnes je to koláž samostatných efektov, ktoré sa navzájom prekrývajú.

**Čo povedal Denis:**
- 3D model (sken kasna) v úvode pôsobí mimo.
- Minulý run priniesol len drobné zmeny.
- Nechce veľa vrstiev, ktoré sa vizuálne prekrývajú.
- Chce niečo „epické“ a môžu sa použiť knižnice.

**Rozhodnutia z konverzácie:**
1. Smer: **jedna živá scéna** z bodov cez celú homepage.
2. Sken kasna sa **presúva z úvodu do sekcie Lab**.
3. Mobil: **rovnaká scéna s menej bodmi**. Slabé zariadenia dostanú statický obrázok.
4. Technika: **rozšíriť vlastný WebGL engine** (`src/motion/ambient/`). Bez three.js a GSAP.

**Kritériá úspechu:**
- V každom bode scrollu je na obrazovke najviac **jeden** animovaný vizuálny systém. Text a jemné odhalenia (reveal) sa nerátajú.
- Každá sekcia má vlastný tvar, ktorý obsahovo zodpovedá jej textu.
- Lighthouse mobile: výkon ≥ 95, CLS 0, homepage LCP nie horší ako dnes (2,56 s), a11y 100.
- Plynulý chod pri 60 fps na strednom Androide, statický záložný obrázok na slabých zariadeniach.
- Pokojný režim a `prefers-reduced-motion` fungujú bez letu bodov.

## 2. Audit dnešného stavu (východisko)

**V úvode na desktope dnes beží naraz:**
- stojace čiary `.hero__rules`, svietiaca podlaha `.hero__floor` a na mobile ešte `.hero__ground` (tri mriežkové systémy),
- WebGL sken `pointScan.ts`,
- paralaxa `pointerField.ts` a pohyb mena,
- zrnitosť `body::after` (z 200) a kanvas kurzora `cursorField.ts` (z 90) cez celú obrazovku.

Na homepage sa môže súčasne točiť 4–5 rAF slučiek: cursorField, pointerField, pointScan, tilt a pointerPreview. Všetky počúvajú `pointermove`.

**Rozchod synchronizácie:** sken sa otáča podľa JS scroll listenera, kým podlaha ide po CSS `scroll()` timeline. Pri rýchlom scrolle sa rozídu.

**Zrnitosť** na z 200 leží aj nad prechodovou animáciou (z 100) a nad kanvasom kurzora.

**CodePen:** `docs/motion-references.md` eviduje 9 inšpirácií, všetky prepísané od nuly. Nie je to právny problém, len štýlová nejednotnosť.

**Mŕtvy kód:** `src/motion/magnetic.ts` sa nikde neimportuje.

## 3. Rozsah

**V rozsahu:** homepage `src/pages/[lang]/index.astro` vo všetkých 6 jazykoch.

**Mimo rozsahu:**
- Podstránky si nechávajú dnešnú jemnú hĺbku (`depth.css`, tilt).
- Prechod pri kliknutí na projekt (`plateTransition.ts`) ostáva, je to navigácia.
- Prechod medzi jazykmi a gate ostávajú.

## 4. Architektúra

### 4.1 Jednotky

| Jednotka | Súbor (nový/zmenený) | Úloha | Závisí od |
|---|---|---|---|
| **Scene runtime** | `src/motion/scene/index.ts` (nový) | Naplánuje načítanie po LCP. Vyberie úroveň (desktop / mobil / statická). Vlastní jedinú rAF slučku, jediný scroll zdroj a jediný `pointermove`. | `utils/env.ts`, `depth/motionPreference.ts` |
| **Choreografia** | `src/motion/scene/timeline.ts` | Z prvkov `[data-scene]` na stránke vypočíta kotvy (y pozície) a z aktuálneho scrollu vráti `{from, to, t, side}`. Čistá funkcia, testovateľná bez DOM. | nič |
| **Tvary** | `src/motion/scene/shapes.ts` | Vytvorí cieľové pozície bodov pre každý stav (Float32Array, N×3). Postupy: vzorkovanie textu z písma na offscreen kanvas, vzorkovanie SVG ciest (projekty, symboly) a podvzorkovanie skenu. Beží v idle čase. | kanvas 2D, `ambient/` loader skenu |
| **Renderer** | `src/motion/ambient/gl.ts` (rozšírený), `src/motion/scene/morph.ts` (nový shader) | Kreslí body jedným draw callom (`gl.POINTS`). Vertex shader zmieša `aPosFrom` a `aPosTo` podľa `uProgress`. K tomu pridá oneskorenie každého bodu (`aSeed`), šum počas letu, turbulenciu podľa rýchlosti scrollu (`uVelocity`) a odtláčanie kurzorom (`uPointer`, len desktop). | WebGL2 |
| **Statický záložný režim** | `src/motion/scene/fallback.ts` | Bez WebGL2, na slabom zariadení alebo v pokojnom režime: vykreslí tvar aktívnej sekcie raz do 2D kanvasu a pri zmene sekcie ho prelínaním (crossfade) vymení. | kanvas 2D |

`pointScan.ts` sa zredukuje na loader a podvzorkovanie skenu. Jeho otáčanie podľa scrollu zaniká, točenie skenu v Labe riadi choreografia.

### 4.2 Choreografia (stavy)

| Sekcia | `data-scene` | Tvar | Strana | Poznámka |
|---|---|---|---|---|
| Hero (začiatok) | `scatter` | rozptýlené body (seeded náhodné pole) | celá plocha | stav pri načítaní |
| Hero (≈10 %) | `name` | „Denis Mitrović“ z písma stránky | vpravo/za menom, stlmené | meno v HTML ostáva pre a11y/LCP |
| Credo | `credo` | 4 symboly Build / Teach / Move / Explore | stred | jednoduché geometrické značky, SVG v repe |
| Vybraná práca | `work:<slug>` | tvar aktívneho projektu, vzorkovaný z jeho SVG plátu (`ProjectVisual.astro`) | strana oproti textu riadku | aktívny = riadok v strede obrazovky |
| WhatIDo / About / Currently | `drift` | voľne plávajúce body, nízka hustota | okraje | obrazovka „dýcha“, nerozptyľuje text |
| Lab | `scan` → `wander` | sken kasna, pomaly sa otáča, potom sa rozpadne | vpravo | popisok skenu sa presúva sem |
| Kontakt | `arrow` | body sa zbehnú do šípky smerom na CTA „Write to me“ | pri CTA | |

**Pravidlá:**
- Každý stav má rovnaký počet bodov N. Tvary s menším počtom vzoriek body zopakujú a tvary s väčším počtom sa podvzorkujú.
- Pri prechode sa `aPosFrom` = aktuálny stav a `aPosTo` = nasledujúci. `uProgress` je plynule vyhladený (lerp), takže rýchly scroll body nerozbije.
- Pri preskočení viacerých sekcií naraz (kotva alebo skok) sa letí rovno do cieľa, medzistavy sa vynechajú.
- Kde tvar prekrýva text, stlmí sa (`uDim` podľa strany a šírky viewportu).

### 4.3 Úrovne zariadení

| Úroveň | Podmienka | N bodov (cieľ, doladí sa meraním) | Interakcia |
|---|---|---|---|
| Desktop | WebGL2 + jemný ukazovateľ (fine pointer) | ~16 000 | kurzor odtláča, turbulencia podľa scrollu |
| Mobil | WebGL2 + dotyk | ~4 000, DPR ≤ 1,5 | len turbulencia podľa scrollu |
| Statická | bez WebGL2, `deviceMemory` ≤ 2, `hardwareConcurrency` ≤ 2, `saveData` | 0 (2D kanvas) | žiadna |
| Pokojná | `data-calm` alebo `prefers-reduced-motion` | 2D kanvas, crossfade | žiadna. GL kontext sa nevytvorí alebo sa uvoľní |

Prepnutie pokojného režimu za behu sa prejaví hneď (MutationObserver na `<html data-calm>` už existuje v `mount.ts`).

### 4.4 Vrstvy (z-index) po zmene

- Scéna: `--z-ambient` (0), `position: fixed`, cez celý viewport, `pointer-events: none`.
- Obsah: 1. Nav: 50. Prechody: 100.
- **Zrnitosť:** na homepage sa `body::after` vypne a jemný šum sa kreslí priamo v shaderi scény (o jednu blend vrstvu menej). Na podstránkach `body::after` ostáva, ale presúva sa z z-index 200 na 95, teda pod prechody (100).

### 4.5 Čo sa odstraňuje z homepage

- `.hero__rules`, `.hero__floor`, `.hero__ground` a ich scroll timelines v `Hero.astro`.
- `src/motion/hero/pointerField.ts` (paralaxa) a `heroScan.ts` (scéna ich nahrádza).
- `src/motion/pointer/cursorField.ts` na homepage. Na podstránkach ostáva, mimo rozsahu.
- `src/motion/projects/pointerPreview.ts` a CSS „pás“ (`band-plate/band-turn/band-lift`) v `SelectedWork.astro`. Tvar projektu ukazuje scéna. Diorámy na mobile ostávajú ako statické karty bez vlastnej animácie.
- `lab-scan` značka v `LabPreview.astro`.
- `src/motion/magnetic.ts` (mŕtvy kód).
- `data-tilt` na SchoolsEntry ostáva, je to interakcia na karte, nie vrstva.

## 5. Tok dát

1. Prvé vykreslenie: HTML a CSS ako dnes, bez kanvasu (LCP = text mena).
2. Po `irl:revealed` a LCP (existujúci plánovač v `depth/index.ts`) sa lazy-loadne `scene/index.ts`.
3. Runtime zistí úroveň, vytvorí kanvas a v `requestIdleCallback` postaví tvary. Sken sa načíta až keď je Lab do 2 viewportov.
4. Slučka: scroll → `timeline.ts` → uniformy → jeden draw. Keď je progress ustálený, kurzor je v pokoji a rýchlosť ≈ 0, slučka sa zastaví a ďalší vstup ju znova spustí.
5. Pri skrytej karte alebo `pagehide` sa slučka zastaví. Pri obnovení z bfcache sa obnoví (test v `tests/e2e/bfcache.spec.ts`).

## 6. Chyby a záložné cesty

- Zlyhá kompilácia shadera alebo vytvorenie kontextu → statická úroveň a zápis do `console.warn`, bez výnimky.
- `webglcontextlost` → statická úroveň. Pri `contextrestored` sa scéna obnoví.
- Sken sa nenačíta → stav `scan` sa nahradí stavom `wander`.
- Chýbajúci `data-scene` alebo prázdna choreografia → scéna ostane v `drift`.

## 7. Rozpočet

**Nové stropy** (`scripts/check-budget.mjs`, gzip), každý so zdôvodnením v komentári ako doteraz:

| Položka | Dnes | Nový strop (návrh) |
|---|---|---|
| home JS nárast (úvodný) | +2,65 KB | **+3,0 KB** (len plánovač scény) |
| lazy chunk scény (runtime, timeline, shapes, morph, gl) | gl+pointScan 4,5 KB | **≤ 9 KB** |
| fallback chunk | — | **≤ 1,5 KB** |
| home CSS nárast | +5 KB | ≤ 5 KB (odstránené pravidlá ho majú znížiť) |
| sken | 70 / 28 KB | bez zmeny |

Ak meranie ukáže viac, strop sa neposúva bez Denisovho súhlasu.

## 8. Testovanie

- **Unit testy** (Vitest, ak v repe nie je, tak Node test runner, rozhodne sa v pláne):
  - `timeline.ts`: kotvy, interpolácia, preskočenie sekcií, okrajové hodnoty;
  - `shapes.ts`: počet bodov N pre každý tvar, deterministický seed.
- **E2E (Playwright):**
  - homepage má práve jeden kanvas scény;
  - v pokojnom režime nevznikne WebGL kontext;
  - bez WebGL2 sa použije statický režim;
  - po skrolovaní do Labu je aktívny stav `scan`;
  - bfcache obnovenie;
  - na homepage neostali odstránené prvky (`.hero__floor`, `.hero__ground`, kanvas kurzora).
- **Výkon:** `npm run lhci` (medián 3 behov) a ručné meranie fps na mobilnej emulácii (4× CPU throttle).
- **Brány pred mergom** (z HANDOFF): `astro check`, `build` (152 stránok), `budget`, `budget:self-test`, `E2E_STRICT=1 playwright test`, `lhci`.

## 9. Riziká

| Riziko | Zmiernenie |
|---|---|
| Tvar „meno z bodov“ súperí s HTML menom | Body stoja vedľa mena alebo za ním a sú stlmené. Stav `name` je krátky a hneď prechádza do Creda. |
| Vzorkovanie písma pred načítaním fontu | Počkať na `document.fonts.ready`. Dovtedy ostáva `scatter`. |
| Výkon na lacnom Androide | Úrovne zariadení, DPR clamp a zastavovanie slučky v nečinnosti. Statická úroveň ako poistka. |
| Lighthouse penalizuje requesty pred LCP | Všetko až po LCP, žiadny prefetch (pasca z HANDOFF). |
| Symboly Credo nie sú v repe | Navrhnúť ich ako jednoduché SVG (čiara, kruh, oblúk, šípka) a dať Denisovi schváliť pred implementáciou. |

## 10. Otvorené otázky pre Denisa (neblokujú plán)

- Popiska skenu v Labe: **miesto a rok** (z HANDOFF, stále chýba).
- Schválenie vizuálu 4 symbolov Credo, keď budú navrhnuté.
