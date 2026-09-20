/**
 * EVIDENCE — real artefacts for projects and lab notes.
 * =====================================================
 * The single source of truth for which real image belongs to which project,
 * with alt text and captions written by a person who looked at each file.
 *
 * Two consumers:
 *   - cms/src/content/media.ts imports these into Payload (`npm run media:import`).
 *   - The site uses them directly when Payload is not running (e.g. on Vercel),
 *     serving the files from public/media/evidence/. Without this, a build from
 *     the local fallback showed only generated plates, even for Pravo365, which
 *     has real screenshots.
 *
 * Every `alt` describes what is actually visible in that specific file. None
 * of it is derived from a filename. Do not add an entry for an image whose
 * provenance is unconfirmed (see docs/assets-found.md).
 *
 * Plain data with no imports, so the CMS package can import it too.
 */

export type EvidenceKind = 'screenshot' | 'diagram' | 'photo' | 'generated' | 'video';

export interface EvidenceSpec {
  file: string;
  width: number;
  height: number;
  kind: EvidenceKind;
  /** Describes what is genuinely visible. EN/CS/SK, like the case studies. */
  alt: Record<'en' | 'cs' | 'sk', string>;
  caption?: Record<'en' | 'cs' | 'sk', string>;
  credit?: string;
  /** Project or lab-note slug this belongs to, in intended display order. */
  project: string;
  order: number;
}

export const EVIDENCE: EvidenceSpec[] = [
  // ─────────────────────────────────────────────────────────── PRAVO365
  {
    file: 'pravo365-generator.webp',
    width: 1440,
    height: 900,
    kind: 'screenshot',
    project: 'pravo365',
    order: 1,
    alt: {
      en: 'The Právo365 contract generator, listing contract types grouped under civil law, each card citing the sections of Czech Civil Code it is built on.',
      cs: 'Generátor smluv Právo365 se seznamem typů smluv v sekci občanského práva; každá karta uvádí paragrafy občanského zákoníku, ze kterých vychází.',
      sk: 'Generátor zmlúv Právo365 so zoznamom typov zmlúv v sekcii občianskeho práva; každá karta uvádza paragrafy občianskeho zákonníka, z ktorých vychádza.',
    },
    caption: {
      en: 'Every contract type is tied to the statute it comes from. The banner states the output is a working draft to be checked by a lawyer.',
      cs: 'Každý typ smlouvy je navázaný na paragraf, ze kterého vychází. Banner uvádí, že výstup je pracovní verze ke kontrole advokátem.',
      sk: 'Každý typ zmluvy je naviazaný na paragraf, z ktorého vychádza. Banner uvádza, že výstup je pracovná verzia na kontrolu advokátom.',
    },
  },
  {
    file: 'pravo365-form.webp',
    width: 1440,
    height: 900,
    kind: 'screenshot',
    project: 'pravo365',
    order: 2,
    alt: {
      en: 'The structured input step for a purchase contract: numbered section one, "contracting parties", with empty fields for name, address and company number, and a note that the company number is required for businesses under section 435.',
      cs: 'Krok strukturovaného vstupu u kupní smlouvy: číslovaná sekce 1 „Smluvní strany" s prázdnými poli pro jméno, adresu a IČO a poznámkou, že IČO je povinné pro podnikatele dle § 435.',
      sk: 'Krok štruktúrovaného vstupu pri kúpnej zmluve: číslovaná sekcia 1 „Zmluvné strany" s prázdnymi poľami pre meno, adresu a IČO a poznámkou, že IČO je povinné pre podnikateľov podľa § 435.',
    },
    caption: {
      en: 'Structured input, not an open text box — and the legal reference sits next to the field it governs.',
      cs: 'Strukturovaný vstup místo prázdného textového pole — a odkaz na zákon stojí přímo u pole, kterého se týká.',
      sk: 'Štruktúrovaný vstup namiesto prázdneho textového poľa — a odkaz na zákon stojí priamo pri poli, ktorého sa týka.',
    },
  },

  // ─────────────────────────────────────────────── MOODPACK / DIRECTOR
  {
    file: 'moodpack-architecture.svg',
    width: 1200,
    height: 720,
    kind: 'diagram',
    project: 'moodpack-director',
    order: 1,
    alt: {
      en: 'Architecture diagram: a Gaussian Splat scan is imported into the Unreal Engine editor plugin, which builds an invisible collision shell from the scan mesh and parents splat, collision and anchors under one World Root so a character can walk. An optional AI Director sends a typed sentence to a separate Mood Pack server over HTTP and receives scene actions; without that server the AI commands switch off and the local features still work.',
      cs: 'Diagram architektury: sken Gaussian Splat se importuje do pluginu pro editor Unreal Engine, který z meshe skenu vytvoří neviditelnou kolizní skořápku a připojí splat, kolize a kotvy pod jeden World Root, aby se dalo chodit. Volitelný AI Director posílá napsanou větu přes HTTP na samostatný Mood Pack server a dostává zpět akce ve scéně; bez serveru se AI příkazy vypnou a lokální funkce fungují dál.',
      sk: 'Diagram architektúry: sken Gaussian Splat sa importuje do pluginu pre editor Unreal Engine, ktorý z meshu skenu vytvorí neviditeľnú kolíznu škrupinu a pripojí splat, kolízie a kotvy pod jeden World Root, aby sa dalo chodiť. Voliteľný AI Director posiela napísanú vetu cez HTTP na samostatný Mood Pack server a dostáva späť akcie v scéne; bez servera sa AI príkazy vypnú a lokálne funkcie fungujú ďalej.',
    },
    caption: {
      en: 'The AI layer is optional by design. Import, collision and walking run offline, with no server and no account.',
      cs: 'AI vrstva je záměrně volitelná. Import, kolize a chození běží offline, bez serveru a bez účtu.',
      sk: 'AI vrstva je zámerne voliteľná. Import, kolízie a chodenie bežia offline, bez servera a bez účtu.',
    },
  },

  // ────────────────────────────────────────── DIGITAL SPACE / HERITAGE
  {
    file: 'digital-space-pointcloud.webp',
    width: 1723,
    height: 623,
    kind: 'generated',
    project: 'digital-space',
    order: 1,
    alt: {
      en: 'A photogrammetric reconstruction seen from above at an angle: a small hexagonal stone pavilion with a slate hipped roof, standing on a grass mound ringed by a gravel path. The reconstruction breaks off raggedly at the edges where the capture stopped.',
      cs: 'Fotogrammetrická rekonstrukce z nadhledu: malý šestiboký kamenný pavilon s valbovou břidlicovou střechou stojí na travnatém návrší obklopeném štěrkovou cestou. Na okrajích se rekonstrukce roztřepeně láme tam, kde skončil sběr dat.',
      sk: 'Fotogrametrická rekonštrukcia z nadhľadu: malý šesťboký kamenný pavilón s valbovou bridlicovou strechou stojí na trávnatom návrší obklopenom štrkovou cestou. Na okrajoch sa rekonštrukcia rozstrapkane láme tam, kde sa skončil zber dát.',
    },
    caption: {
      en: 'Rendered from the scan itself — 2.6 million captured points. The ragged edge is the honest boundary of the capture, not a crop.',
      cs: 'Vykresleno přímo ze skenu — 2,6 milionu zachycených bodů. Roztřepený okraj je skutečná hranice sběru dat, ne ořez.',
      sk: 'Vykreslené priamo zo skenu — 2,6 milióna zachytených bodov. Rozstrapkaný okraj je skutočná hranica zberu dát, nie orez.',
    },
    credit: 'Captured and reconstructed in RealityScan',
  },
  {
    file: 'digital-space-capture.webp',
    width: 896,
    height: 640,
    kind: 'photo',
    project: 'digital-space',
    order: 2,
    alt: {
      en: 'A close capture frame of a historic facade: yellow render between white pilaster strips, an ornamental stucco capital, and two tall arched windows with dark frames.',
      cs: 'Detailní snímek z fotogrammetrického sběru na historické fasádě: žlutá omítka mezi bílými lizénami, ozdobná štuková hlavice a dvě vysoká okna s obloukovým záklenkem a tmavými rámy.',
      sk: 'Detailná snímka z fotogrametrického zberu na historickej fasáde: žltá omietka medzi bielymi lizénami, ozdobná štuková hlavica a dve vysoké okná s oblúkovým záklenkom a tmavými rámami.',
    },
    caption: {
      en: 'One frame from the capture pass. Coverage like this — close, overlapping, unglamorous — is what decides whether anything can be reconstructed at all.',
      cs: 'Jeden snímek ze sběru. Právě takové pokrytí — zblízka, s překryvem a bez efektu — rozhoduje o tom, jestli půjde vůbec něco zrekonstruovat.',
      sk: 'Jedna snímka zo zberu. Práve také pokrytie — zblízka, s prekryvom a bez efektu — rozhoduje o tom, či sa vôbec dá niečo zrekonštruovať.',
    },
  },

  // ───────────────────────────────────────────── AI COMMERCE ENGINE
  {
    file: 'ai-commerce-pipeline.svg',
    width: 1200,
    height: 660,
    kind: 'diagram',
    project: 'ai-commerce-engine',
    order: 1,
    alt: {
      en: 'Pipeline diagram: a brief and its sources produce a master document, which is rendered into per-profile exports and previews. Eight families of quality gates — evidence, learner fit, learning value, agency, accessibility, culture and ethics, media and commercial — are checked against a SHA-256 of the product, profile or release. A manifest records content-addressed exports, and a marketplace package is released only after an explicit human approval.',
      cs: 'Diagram pipeline: ze zadání a zdrojů vzniká master dokument, který se vykresluje do exportů podle profilů a náhledů. Osm rodin kontrolních bran — doklady, vhodnost pro učícího se, vzdělávací hodnota, samostatnost, přístupnost, kultura a etika, média a komerční hledisko — se ověřuje proti SHA-256 produktu, profilu nebo vydání. Manifest zaznamenává exporty adresované obsahem a balíček pro tržiště se vydá až po výslovném lidském schválení.',
      sk: 'Diagram pipeline: zo zadania a zdrojov vzniká master dokument, ktorý sa vykresľuje do exportov podľa profilov a náhľadov. Osem rodín kontrolných brán — doklady, vhodnosť pre učiaceho sa, vzdelávacia hodnota, samostatnosť, prístupnosť, kultúra a etika, médiá a komerčné hľadisko — sa overuje proti SHA-256 produktu, profilu alebo vydania. Manifest zaznamenáva exporty adresované obsahom a balík pre trhovisko sa vydá až po výslovnom ľudskom schválení.',
    },
    caption: {
      en: 'Dry-run is the default: nothing paid or networked happens without an explicit approval, and a verdict only enters the record bound to a hash.',
      cs: 'Výchozí je dry-run: nic placeného ani síťového neproběhne bez výslovného schválení a verdikt se do záznamu dostane jen navázaný na hash.',
      sk: 'Predvolený je dry-run: nič platené ani sieťové neprebehne bez výslovného schválenia a verdikt sa do záznamu dostane len naviazaný na hash.',
    },
  },
  // ───────────────────────────────────────────── WEB & DIGITAL WORK
  /**
   * Live client sites, captured from the public web at 1440x900 and cropped to
   * remove the browser scrollbar. Both are shipped, running on their own
   * domain, and named here with Denis's approval — unlike the unsold proposals
   * in docs/web-portfolio-selection.md, which stay out.
   */
  {
    file: 'web-esenciaviva.webp',
    width: 1424,
    height: 900,
    kind: 'screenshot',
    project: 'web-digital-work',
    order: 1,
    alt: {
      en: 'The Esencia Viva homepage: a pale, washed-out photograph of a woman standing by water fills the screen behind large serif type reading "Tělo nemusíte opravovat. Potřebuje být slyšeno." — the body does not need fixing, it needs to be heard. Below it a line about massage, aromatherapy, herbs and conscious body work, and two buttons — arrange a first session, and how it works.',
      cs: 'Úvodní stránka Esencia Viva: bledá, prosvětlená fotografie ženy u vody vyplňuje celou plochu za velkým patkovým písmem „Tělo nemusíte opravovat. Potřebuje být slyšeno." Pod ním řádek o masážích, aromaterapii, bylinkách a vědomé práci s tělem a dvě tlačítka — domluvit první sezení a jak to probíhá.',
      sk: 'Úvodná stránka Esencia Viva: bledá, presvetlená fotografia ženy pri vode vypĺňa celú plochu za veľkým pätkovým písmom „Tělo nemusíte opravovat. Potřebuje být slyšeno." Pod ním riadok o masážach, aromaterapii, bylinkách a vedomej práci s telom a dve tlačidlá — dohodnúť prvé sedenie a ako to prebieha.',
    },
    caption: {
      en: 'Live at esenciaviva.cz. A one-person practice, in Czech: every route through the site ends at the same thing — booking a first session.',
      cs: 'Živě na esenciaviva.cz. Praxe jednoho člověka, v češtině: každá cesta webem končí u téhož — domluvit první sezení.',
      sk: 'Naživo na esenciaviva.cz. Prax jedného človeka, v češtine: každá cesta webom končí pri tom istom — dohodnúť prvé sedenie.',
    },
  },
  {
    file: 'web-elevatorservis.webp',
    width: 1424,
    height: 900,
    kind: 'screenshot',
    project: 'web-digital-work',
    order: 2,
    alt: {
      en: 'The Elevator Servis homepage: a dark photograph of a lift machine room — steel cable drums and a technician in work trousers — behind white headline type reading "Servis výťahov v Banskej Bystrici a okolí" — lift servicing in and around Banská Bystrica — with the city underlined in yellow. A badge states the service radius is 80 km, a paragraph lists servicing, repairs, inspections and modernisation, and two buttons offer a non-binding enquiry or the emergency line.',
      cs: 'Úvodní stránka Elevátor Servis: tmavá fotografie strojovny výtahu — ocelové lanové bubny a technik v pracovních kalhotách — za bílým nadpisem „Servis výťahov v Banskej Bystrici a okolí", s městem podtrženým žlutě. Odznak uvádí dojezd 80 km, odstavec vyjmenovává servis, opravy, odborné prohlídky a modernizaci a dvě tlačítka nabízejí nezávaznou poptávku nebo havarijní linku.',
      sk: 'Úvodná stránka Elevátor Servis: tmavá fotografia strojovne výťahu — oceľové lanové bubny a technik v pracovných nohaviciach — za bielym nadpisom „Servis výťahov v Banskej Bystrici a okolí", s mestom podčiarknutým žlto. Odznak uvádza dojazd 80 km, odsek vymenúva servis, opravy, odborné prehliadky a modernizáciu a dve tlačidlá ponúkajú nezáväzný dopyt alebo havarijnú linku.',
    },
    caption: {
      en: 'Live at elevatorservis.sk. A lift service company, in Slovak. The emergency call-out gets its own route in the header, separate from the ordinary enquiry — a broken lift is not a sales conversation.',
      cs: 'Živě na elevatorservis.sk. Servisní firma na výtahy, ve slovenštině. Havarijní služba má v hlavičce vlastní cestu, oddělenou od běžné poptávky — porouchaný výtah není obchodní hovor.',
      sk: 'Naživo na elevatorservis.sk. Servisná firma na výťahy, po slovensky. Havarijná služba má v hlavičke vlastnú cestu, oddelenú od bežného dopytu — pokazený výťah nie je obchodný hovor.',
    },
  },
];
