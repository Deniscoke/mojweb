import type { ProjectVisual } from './projects';

/**
 * PROJEKTOVÉ LABY — Czech-only content for schools.
 * ================================================
 * The labs are a branch of the personal site, not a separate product: every
 * lab points back to real projects and lab notes that already exist here.
 * Only Czech is written so far, so these pages are generated for `cs` alone
 * (see src/pages/[lang]/laby/). Translations come after the Czech version has
 * been validated with schools.
 *
 * Each lab carries its own colour world, taken from the printed poster family.
 * The colours are scoped to the lab (as CSS custom properties on the card or
 * page) and never become global accents.
 */

export interface LabWorld {
  /** Main accent, tuned to read on the dark site ground. */
  accent: string;
  /** Secondary accent for small details. */
  second: string;
  /** Poster family the colours come from. */
  palette: string;
}

export interface LabRelated {
  kind: 'project' | 'lab';
  slug: string;
}

export interface Lab {
  slug: string;
  name: string;
  glyph: string;
  /** The question the lab is built around. */
  question: string;
  /** One line for cards and the homepage entry. */
  short: string;
  lead: string;
  studentsDo: string[];
  output: string;
  subjects: string[];
  /** Indexes into LAB_FORMATS that fit this lab. */
  formats: number[];
  online: boolean;
  tech: string;
  /** Optional extra block: an open hypothesis or a fairness note. */
  note?: { title: string; body: string };
  visual: ProjectVisual;
  world: LabWorld;
  related: LabRelated[];
}

export const SCHOOL_YEAR = '2026/27';

export const LAB_GROUP = {
  short: 'Malá projektová skupina · do 12 studentů',
  ideal: 'ideálně 6–10 studentů, maximálně 12',
  why: 'Menší skupina dává prostor pro individuální vedení, rozhovor, experiment a skutečnou týmovou práci místo frontálního workshopu.',
  flex: 'Větší skupiny lze řešit po individuální domluvě, například rozdělením studentů do více projektových týmů nebo bloků.',
};

export const LAB_FORMATS: { duration: string; name: string; body: string }[] = [
  { duration: '90–120 min', name: 'Workshop', body: 'Ochutnávka jednoho labu: první prototyp, experiment nebo otázka, ke které se dá vrátit.' },
  { duration: '1 den', name: 'Projektový den', body: 'Od zadání k malému hotovému výstupu během jednoho dne.' },
  { duration: '2–5 dní', name: 'Intenzivní program', body: 'Skutečný projekt s prezentací a reflexí výstupu na konci.' },
  { duration: 'týdny', name: 'Projektový blok', body: 'Pravidelná setkání a projekt, který roste spolu s týmem.' },
  { duration: 'pololetí +', name: 'Externí ateliér', body: 'Dlouhodobé a pravidelné vedení studentských projektů.' },
];

export const LAB_ONLINE = {
  name: 'Online / hybridně',
  body: 'Většinu formátů lze vést online nebo kombinovaně. Unreal AI Lab jen osobně.',
};

export const LAB_PRINCIPLES: string[] = [
  'hra + skutečná práce',
  'student je autor',
  'AI ověřujeme',
  'nesouhlas je legitimní',
  'učí se celý člověk',
  'technologie nejsou povinnost',
  'umět technologii vypnout',
  'skutečný výstup místo cvičení do šuplíku',
];

export const LAB_PDFS = {
  poster: { href: '/assets/pdf/projektove-laby-nabidka-A4.pdf', label: 'Nabídka pro školy · plakát A4 (PDF)' },
  cards: { href: '/assets/pdf/projektove-laby-karty-A5.pdf', label: 'Karty pěti labů · A5 (PDF)' },
};

export const LABS: Lab[] = [
  {
    slug: 'ai-builder',
    name: 'AI Builder Lab',
    glyph: '›_',
    question: 'Od nápadu k funkčnímu produktu',
    short: 'Prompt, kontext, Git, API, databáze, nasazení. Co udělala AI, ověříme a vysvětlíme.',
    lead: 'Student se neučí jen zadávat prompt. Pochopí cestu od nápadu k funkčnímu digitálnímu produktu. AI přitom není autorita: něco vytvoří, ale student musí pochopit, co se stalo, ověřit to, opravit a vysvětlit.',
    studentsDo: [
      'Rozloží nápad na kroky a pracují s promptem, tokeny a kontextem.',
      'Používají Git a GitHub, CLI a API a učí se bezpečně spravovat API klíče.',
      'Ukládají data do databáze (např. Supabase), zkouší cloud i lokální modely.',
      'Aplikaci nasadí a vysvětlí, co v ní vytvořila AI a co sami ověřili a opravili.',
    ],
    output: 'Funkční nasazená aplikace nebo nástroj a krátká obhajoba vlastního řešení.',
    subjects: ['informatika', 'matematika', 'český jazyk', 'podnikavost'],
    formats: [0, 1, 2, 4],
    online: true,
    tech: 'Počítačová učebna s internetem. Účty a API klíče řešíme společně podle pravidel školy a věku studentů.',
    visual: 'strata',
    world: { accent: '#e8927f', second: '#f3eee8', palette: 'Salmon × black × warm neutral' },
    related: [
      { kind: 'project', slug: 'pravo365' },
      { kind: 'lab', slug: 'ai-commerce-engine' },
      { kind: 'lab', slug: 'generated-product-pipelines' },
    ],
  },
  {
    slug: 'unreal',
    name: 'Unreal AI Lab',
    glyph: '◇',
    question: 'Tělo, pohyb a digitální světy',
    short: 'Unreal Engine, Blueprints, Niagara, motion capture. Tělo a pohyb v digitálním světě.',
    lead: 'Unreal Engine jako prostor pro gameplay, fyziku, animaci, VFX, světlo a zvuk. A k tomu druhá vrstva: tělo → pohyb → technologie → digitální prostor. Technologie tu člověka od těla neodřízne, pomáhá ten vztah zkoumat.',
    studentsDo: [
      'S pomocí AI staví 3D prostředí a gameplay v Blueprints, řeší fyziku a kameru.',
      'Pracují s materiály, světlem, zvukem, animací a Niagara VFX.',
      'Nahrají vlastní pohyb přes motion capture a přenesou ho do digitální postavy.',
      'Zkoumají fyzický prostor, uvědomování těla a digitální reprezentaci člověka.',
    ],
    output: 'Hratelná scéna nebo krátké video z digitálního světa, ve kterém je vidět i vlastní pohyb studentů.',
    subjects: ['informatika', 'fyzika', 'výtvarná výchova', 'tělesná výchova'],
    formats: [1, 2, 3, 4],
    online: false,
    tech: 'Počítače s dedikovanou grafickou kartou, případně sdílené stanice pro týmy. Pro motion capture stačí kamera a volný prostor.',
    visual: 'orbit',
    world: { accent: '#d9566d', second: '#cfa33a', palette: 'Crimson × grey × mustard' },
    related: [
      { kind: 'project', slug: 'moodpack-director' },
      { kind: 'lab', slug: 'ai-controlling-unreal' },
      { kind: 'project', slug: 'circus-movement' },
      { kind: 'project', slug: 'snowboard-coaching' },
    ],
  },
  {
    slug: 'usage',
    name: 'Usage Lab',
    glyph: 'Σ',
    question: 'Jakou stopu zanechává AI?',
    short: 'Tokeny, náklady, soukromí, digitální hodnota. Otevřenou hypotézu kriticky testujeme.',
    lead: 'Každé použití AI má spotřebu, cenu a dopad. Lab stojí na reálném experimentálním projektu a otevřené otázce, kterou studenti kriticky zkoumají.',
    studentsDo: [
      'Měří tokeny, usage a náklady svých AI dotazů a pracují s digitálními receipts.',
      'Zkoumají soukromí, decentralizaci, krypto a digitální hodnoty.',
      'Odhadují environmentální dopad a porovnávají, odkud data pocházejí.',
      'Hypotézu o přínosu pro společnost či přírodu ověřují, nebo ji zdůvodněně odmítnou.',
    ],
    output: 'Datová studie nebo infografika, která hypotézu s argumenty podpoří, zpochybní, nebo vyvrátí.',
    subjects: ['informatika', 'matematika', 'zeměpis a ekologie', 'ZSV a ekonomie'],
    formats: [0, 1, 3],
    online: true,
    tech: 'Učebna s počítači nebo notebooky a připojením k internetu.',
    note: {
      title: 'Otevřená hypotéza',
      body: 'Může hodnota vznikající používáním technologií vytvořit nový mechanismus podpory společnosti nebo přírody? Není to hotová pravda. Studenti ji mohou odmítnout.',
    },
    visual: 'scan',
    world: { accent: '#9fb39b', second: '#c08bb0', palette: 'Sage × plum' },
    related: [],
  },
  {
    slug: 'invok',
    name: 'Invok Lab',
    glyph: '↻',
    question: 'Jak vzniká vzdělávací produkt?',
    short: 'Živá case study reálného produktu: metodika, validace i slepé uličky.',
    lead: 'Invok je reálný vzdělávací produkt, na kterém pracuji. Slouží jako živá case study: jak vzniká produkt a jeho metodika, AI literacy, UX, validace, zpětná vazba, rebranding i slepé uličky.',
    studentsDo: [
      'Sledují vznik skutečného produktu včetně slepých uliček a rebrandingu.',
      'Navrhují a testují aktivity pro AI literacy a sbírají zpětnou vazbu.',
      'Učí se validovat nápad a rozhodovat produktově i pedagogicky.',
      'Zkouší si podnikavost na reálném případu, ne na modelové situaci.',
    ],
    output: 'Otestovaný návrh aktivity nebo funkce s argumentací, proč má, nebo nemá vzdělávací hodnotu.',
    subjects: ['ZSV', 'ekonomika a podnikavost', 'informatika', 'pedagogika a psychologie'],
    formats: [1, 2, 3, 4],
    online: true,
    tech: 'Prostor pro týmovou práci, flipcharty a podle zaměření několik notebooků.',
    note: {
      title: 'Férovost',
      body: 'Studenti nejsou bezplatná pracovní síla, účel labu je vzdělávací. Pokud by studentský výstup někdy přerostl v reálnou komerční spolupráci, řešila by se samostatně, transparentně a férově.',
    },
    visual: 'grid',
    world: { accent: '#e2448b', second: '#c4c25a', palette: 'Fuchsia × olive' },
    related: [
      { kind: 'lab', slug: 'art-learning' },
      { kind: 'lab', slug: 'drawing-as-daily-habit' },
    ],
  },
  {
    slug: 'future',
    name: 'Future Lab',
    glyph: '?',
    question: 'Co chceme, aby technologie dělaly?',
    short: 'AI, příroda, soukromí, digitální střídmost. Nesouhlas je legitimní výsledek.',
    lead: 'Klíčová otázka nezní, co všechno technologie dokážou, ale co chceme, aby dělaly. Nesouhlas je legitimní vzdělávací výsledek: když student dojde k tomu, že AI používat nechce, a umí to rozumně vysvětlit, je to úspěch.',
    studentsDo: [
      'Zkoumají vztah AI, člověka, přírody, společnosti, kreativity a vzdělávání.',
      'Diskutují o soukromí, automatizaci, technologické závislosti a digitální střídmosti.',
      'Porovnávají lokální a cloudové technologie, transhumanismus i biofilní transhumanismus.',
      'Zformulují a obhájí vlastní etický postoj, včetně nesouhlasu.',
    ],
    output: 'Manifest, podcast, výstava nebo veřejná debata pro celou školu.',
    subjects: ['ZSV a filozofie', 'etika', 'český jazyk', 'biologie a ekologie'],
    formats: [0, 1, 3],
    online: true,
    tech: 'Místnost, kde se dá sedět v kruhu. Technika není nutná.',
    visual: 'flux',
    world: { accent: '#c08bb0', second: '#9fb39b', palette: 'Plum × sage' },
    related: [
      { kind: 'lab', slug: 'spatial-computing' },
      { kind: 'lab', slug: 'navigable-space' },
    ],
  },
];

export function getLab(slug: string): Lab | undefined {
  return LABS.find((lab) => lab.slug === slug);
}
