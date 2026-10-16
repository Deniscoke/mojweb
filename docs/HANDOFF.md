# HANDOFF — stav projektu (2026-10-16, živá scéna)

Tento súbor je odovzdávka pre novú konverzáciu. **Čítaj ho celý, než niečo urobíš.**
Všetko tu je overené. Čo tu nie je, si over v kóde a nedomýšľaj si to.

---

## 1. Projekt

- **Čo:** osobné portfólio Denisa Mitrovića (Creative Technologist · Educator · Movement Coach).
- **Repo:** `C:\Users\Admin\mojweb` → GitHub `Deniscoke/mojweb`.
- **Stack:** Astro 5, statický výstup, 152 stránok, 6 jazykov (en, cs, sk, es, sr, tr). Žiadne runtime npm závislosti. Payload CMS (lokálny, SQLite) v `cms/`.
- **Hosting:** Vercel. **Dva projekty** (`mojweb`, `mojweb2`) nasadzujú vetvu `main`. **Push do `main` = naživo.**
- **Živý web:** https://mojweb2.vercel.app (vlastná doména zatiaľ nie je kúpená).
- **Jazyk komunikácie s Denisom:** slovenčina. Denis píše bez diakritiky a stručne.

## 2. Aktuálny stav

| Vetva | Stav |
|---|---|
| `main` | živý web, commit `9c7ade7`. **Nemenený.** |
| `feat/motion-depth` | prvý 3D upgrade (`b6f1fa8`). Denis ho **neschválil**: drobné úpravy, sken v úvode pôsobil mimo, priveľa vrstiev cez seba. **Nemergovať.** |
| `feat/living-scene` | **nová verzia z `feat/motion-depth`: „živá scéna“**. Hotová, otestovaná, pushnutá. |

**Vercel náhľad** vetvy `feat/living-scene` (chránený prihlásením do Vercelu, Denisov účet):
https://mojweb2-c9lzxcsqm-denis-mitrovics-projects.vercel.app/sk/ (commit `1972f8f`)

**ČAKÁ SA NA DENISA:** pozrie si náhľad `feat/living-scene` a povie OK, alebo čo zmeniť.
Po jeho OK: `git checkout main && git merge --no-ff feat/living-scene && git push`, potom over živý web.
**Nemerguj do `main` bez jeho výslovného súhlasu.**

## 3. Čo je na `feat/living-scene`

Spec: `docs/superpowers/specs/2026-10-16-living-scene-design.md`.
Plán s rozhodnutiami „as built“: `docs/superpowers/plans/2026-10-16-living-scene.md`.
API: `src/motion/scene/README.md`, k tomu `src/motion/depth/README.md` (hĺbka, pokojný režim).

- **Jedna scéna namiesto koláže.** Celá homepage má za obsahom jeden kanvas s poľom bodov. Body sa pri scrolle presúvajú do tvaru sekcie, ktorá je v strede obrazovky:
  - Denisov portrét (z mapy hustoty jeho fotky, `scripts/build-portrait.mjs`; samotná fotka sa do repa nedáva a originál je mimo neho),
  - 4 symboly Credo (schválené Denisom),
  - geometria plátu aktívneho projektu (len desktop),
  - sken kasna v Labe,
  - voľne plávajúce body medzi sekciami,
  - šípka ku kontaktu.
- **Čo sa odstránilo:**
  - z úvodu mriežky, podlaha, zem a sken;
  - paralaxa a kurzorové pole na homepage;
  - náhľad projektu za kurzorom, „pás“ a diorámy;
  - čítacia hlava v Labe a čiara v kontakte;
  - engine skenu (`ambient/mount.ts`, `pointScan.ts`, `tools/scan-harness`).

  Popiska skenu je teraz v hlavičke Labu.
- **Načítanie pri prvom vstupe.** Scéna sa načíta pri prvom pohybe myši, dotyku, scrolle alebo klávese. Bez vstupu sa nič nehýbe. Lighthouse preto vidí homepage ako pred zmenou.
- **Tiery:**
  - desktop: WebGL, 16 000 bodov, kurzor body odtláča;
  - mobil: WebGL, 4 000 bodov;
  - statický: 2D, jeden snímok na zmenu sekcie. Platí pre pokojný režim, slabé zariadenia a stratu GL kontextu.
- **Prepínač „Pokojný/Calm“, bezpečnosť a CSP** sa nemenili. Calm prepína scénu za behu.

### Brány kvality (všetky musia prejsť pred mergom)
```
npx astro check            # 0 errors
npm run build              # 152 pages
npm run budget             # rozpočet JS/CSS + lint pravidiel
npm run budget:self-test
npm run test:unit                  # 23 unit testov (node --test)
E2E_STRICT=1 npx playwright test   # 158 testov (systémový Chrome)
npm run test:e2e:gpu               # 4 testy na skutočnej GPU (otvorí okno)
npm run lhci               # Lighthouse mobile, medián 3 behov
```
Posledné výsledky (`feat/living-scene`):
- unit 23/23, e2e 158/158, GPU 6/6;
- Lighthouse: homepage výkon 96, TBT 0, LCP 2,56 s (= pôvodný stav), ostatné stránky 96–99, a11y 100, CLS 0.

Jeden snapshot (`strata: keyboard`) raz zlyhal na orezanom výreze a potom prešiel 10/10.
Finálnu kontrolu robil čerstvý recenzent. Jeho 5 dôležitých nálezov je opravených a drobné nálezy sú zapísané v pláne ako odložené.
`/en/laby/` TBT občas ukáže ~60 ms. Je to známy šum na hranici FCP, pôvodná verzia ho má tiež (QA note 1). Nie je to regresia.

### Rozhodnutia, ktoré sa nemajú vracať
- `depth.css` je **inline na homepage**, inde **linknutý** (preload v head, `<link>` na konci body). Merané v QA note 2.
- „Duch" ďalšieho projektu na prípadových štúdiách je **odstránený** (17 KB SVG).
- Scénu si vyžiada `Hero.astro` (udalosť `irl:scene` pri prvom vstupe) a importuje ju depth runtime. Druhý dynamický import by vytiahol preload helper Vite do zdieľaného chunku, čo je +0,08 KB na všetkých ostatných stránkach. Merané.
- CSS scény a vypnutie zrnitosti sú **v štýle homepage**, nie v `global.css`. Aj 60 B navyše v `global.css` posunulo LCP stránky Splatoo z 2,41 na 2,56 s. Merané.
- Načítanie scény pri prvom vstupe (nie po načítaní stránky) je meraná nutnosť. Inak mala homepage výkon 86–94 a TBT 134–377 ms.
- Stropy rozpočtu v `scripts/check-budget.mjs` (home JS 2,65 KB, ostatné 2,1 KB) majú pri sebe zdôvodnenie. Neposúvaj ich bez merania.

## 4. Otvorené veci pre Denisa

1. **Schváliť náhľad** (pozri sekciu 2).
2. **Sken `kasna`:** potvrdiť, že môže byť na úvode, a dodať **miesto a rok** do popisky. Teraz je tam len „SKEN · REALITYSCAN · 2,6 M BODOV".
3. **Fotky** (cirkus, snowboard, projekty): Denis ich vyberá. Návod je v `public/media/photos/README.md`, register v `src/data/photos.ts` (pri deťoch súhlas a len Tier 0). Hĺbkové mapy (Tier 1, `build-depth-maps.py`) sú **odložené**, kým fotky neprídu.
4. Z `docs/launch-readiness.md`: doména (napr. `denismitrovic.cz`), IČO a stránka ochrany súkromia, preklady prípadových štúdií ES/SR/TR, celé meno „Jančiho" a Denisova rola v Splatoo, profily pre JSON-LD, záloha `cms/data/payload.db`.
5. `Michel Rodange monument.ply` na Desktope **nie je Denisov sken** (Artec, CC-BY). **Nepoužívať.**

## 5. Pravidlá práce s Denisom

- **Nevymýšľať fakty:** klientov, mená, roky, miesta, čísla, role. Čo nie je dané, sa nepíše, alebo sa opýtaj.
- Klienti na webe: len živé weby, ktoré Denis výslovne schválil (esenciaviva.cz, elevatorservis.sk). Nepredané návrhy nie.
- Fotky detí iba so súhlasom.
- Chce najvyššiu kvalitu, ale **nemíňať kredity zbytočne**. Krátke správy, žiadne zbytočné kolá.
- Commity: konvenčné správy (`feat:`, `fix:`, `chore:` …), na konci `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## 6. Technické pasce (už sa stali)

- **Windows + git worktree + junction:** zmazanie worktree s `node_modules` ako junction **zmaže hlavné `node_modules`**. Najprv `cmd /c rmdir <worktree>\node_modules` (odpojí len odkaz), až potom `git worktree remove`. Ak sa to stane: `npm ci`.
- Agenti nechávajú bežať `astro preview` servery, ktoré blokujú adresáre. Pred mazaním ich zastav.
- Bash heredoc v tomto prostredí občas zlyhá na úvodzovkách. Dlhší text alebo skript zapíš cez Write do súboru a spusti ho.
- Git Bash prepisuje `/en/...` na cestu vo Windows. Použi `MSYS_NO_PATHCONV=1`.
- Vercel komprimuje HTML **brotli q3** (zmerané). Lokálny gzip test je optimistický.
- Lighthouse (Lantern) penalizuje **každý** request navyše pred LCP na homepage, aj prefetch.
- Playwright vypína bfcache. Test na bfcache je preto v samostatnom `tests/e2e/bfcache.spec.ts`.
- Payload CMS je kanonický zdroj obsahu: `cd cms && npm run content:*` a potom `npm run snapshot:fallback` (generuje `src/data/generated/`, ručne needitovať).

## 7. Prvý krok v novej konverzácii

1. `cd C:\Users\Admin\mojweb && git status && git log --oneline -3` (očakávaj vetvu `feat/living-scene`).
2. Opýtaj sa Denisa, či si pozrel náhľad `feat/living-scene` a čo na to hovorí.
