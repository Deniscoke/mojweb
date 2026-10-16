# HANDOFF — stav projektu (2026-10-16)

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
| `feat/motion-depth` | 3D a pohybový upgrade, **hotový, otestovaný a pushnutý**, HEAD `b6f1fa8` |

**Vercel náhľad** vetvy `feat/motion-depth` (chránený prihlásením do Vercelu, Denisov účet):
https://mojweb2-1iyf531w2-denis-mitrovics-projects.vercel.app/sk/

**ČAKÁ SA NA DENISA:** pozrie si náhľad a povie OK, alebo čo zmeniť.
Po jeho OK: `git checkout main && git merge --no-ff feat/motion-depth && git push`, potom over živý web.
**Nemerguj do `main` bez jeho výslovného súhlasu.**

## 3. Čo je na `feat/motion-depth` (3D upgrade)

Plán: `docs/motion-depth-plan.md` (začína sekciou „As built", ktorá opisuje, v čom sa skutočnosť líši od plánu).
QA záznam a zdokumentované kompromisy: `docs/motion-depth-qa.md`.
API: `src/motion/depth/README.md` (hĺbka, pokojný režim, pravidlá pre kompozítor) a `src/motion/ambient/README.md` (WebGL engine skenu).

- **Úvod, desktop:** skutočný point-cloud sken pavilónu (`kasna.ply`, Denisov RealityScan, už zverejnený ako doklad v Digital Space) stojí vpravo od mena. Pri scrollovaní sa otočí o 120° a mriežka sa sklopí do svietiacej podlahy (`.hero__floor`).
- **Úvod, mobil:** „scéna" pod úvodom so statickou perspektívnou zemou (`.hero__ground`). Sken stojí na nej a otáča sa o 90°.
- **Vybraná práca:** na desktope od 80rem je „pás". Projekt v strede obrazovky pri scrollovaní ukáže svoj vrstvený plát. Náhľad za kurzorom sa vyvolá až skutočným pohybom myši. Na mobile sú karty diorámy.
- **Ostatné sekcie:** jemná hĺbka (CSS scroll timelines), päta zrkadlí čiary z úvodu, Lab má značku v medzere pred nadpisom (nie čiaru cez text).
- **Prepínač „Pokojný/Calm":** v menu aj v päte, uložený v `localStorage irl:motion = calm`. Platí od prvého vykreslenia a obnoví sa aj z bfcache.
- **Bezpečnosť** (už je aj na `main`): CSP integrácia `integrations/csp.mjs` (hash inline skriptov), `vercel.json` hlavičky, 404 stránka, ikony a manifest.

### Brány kvality (všetky musia prejsť pred mergom)
```
npx astro check            # 0 errors
npm run build              # 152 pages
npm run budget             # rozpočet JS/CSS + lint pravidiel
npm run budget:self-test
E2E_STRICT=1 npx playwright test   # 150 passed (systémový Chrome)
npm run lhci               # Lighthouse mobile, medián 3 behov
```
Posledné výsledky: e2e 150/150, Lighthouse výkon 96–99, a11y 100, CLS 0, homepage LCP 2,56 s (= pôvodný stav).
`/en/laby/` TBT občas ukáže ~60 ms. Je to známy šum na hranici FCP, pôvodná verzia ho má tiež (QA note 1). Nie je to regresia.

### Rozhodnutia, ktoré sa nemajú vracať
- `depth.css` je **inline na homepage**, inde **linknutý** (preload v head, `<link>` na konci body). Merané v QA note 2.
- „Duch" ďalšieho projektu na prípadových štúdiách je **odstránený** (17 KB SVG).
- Načítanie skenu je naplánované v zdieľanom depth runtime (`src/motion/depth/index.ts`), nie v `Hero.astro`. Merané, je to lacnejšie.
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

1. `cd C:\Users\Admin\mojweb && git status && git log --oneline -3` (očakávaj vetvu `feat/motion-depth`, `b6f1fa8` alebo novšiu).
2. Opýtaj sa Denisa, či si pozrel náhľad a čo na to hovorí.
