/**
 * ITERATION 5.1 — REAL MOVEMENT & COMMERCIAL CONTENT.
 *
 *   npm run content:movement
 *
 * Everything here was supplied directly by Denis. Two facts are deliberately
 * missing and must not be guessed:
 *
 *   1. The exact public name of the Žďár nad Sázavou organisation. Referred to
 *      approximately as "Aktív", but unconfirmed — so the copy says "local
 *      youth and movement activities in the Žďár nad Sázavou area" and names
 *      no organisation.
 *   2. The official title of the snowboarding qualification. The copy says
 *      "a qualification in the basics of school snowboarding" and stops there.
 *
 * KoresponDance is named only as participation in the children's programme.
 * No employment, partnership or authorship is implied.
 */

import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { rt, FULL_LOCALES, SHORT_LOCALES, type FullLocale, type AnyLocale } from './lexical'

type Status = 'experiment' | 'prototype' | 'in-development' | 'live' | 'ongoing'
type Visual = 'strata' | 'orbit' | 'grid' | 'scan' | 'flux'

interface Sections {
  overview?: string[]
  practice?: string[]
  idea?: string[]
  people?: string[]
  availability?: string[]
}

interface Entry {
  /** Existing slug to find the record by. */
  findBy: string
  slug: string
  status: Status[]
  visual: Visual
  hue: number
  order: number
  disciplines: string[]
  title: Record<AnyLocale, string>
  short: Record<AnyLocale, { category: string; shortDescription: string; subtitle: string; question: string }>
  prose: Record<FullLocale, Sections>
}

export const entries: Entry[] = [
  // ──────────────────────────────────────────────── CIRCUS & MOVEMENT
  {
    findBy: 'contemporary-circus',
    slug: 'circus-movement',
    status: ['ongoing'],
    visual: 'flux',
    hue: 320,
    order: 2,
    disciplines: ['Juggling', 'Object work', 'Balance', 'Acrobatics', 'Group work'],
    title: {
      en: 'Circus & Movement',
      cs: 'Cirkus a pohyb',
      sk: 'Cirkus a pohyb',
      es: 'Circo y movimiento',
      sr: 'Cirkus i pokret',
      tr: 'Sirk ve hareket',
    },
    short: {
      en: {
        category: 'Movement / Circus / Teaching',
        shortDescription:
          'Contemporary circus with children and young people — juggling, balance, coordination, and finding a discipline that fits.',
        subtitle: 'An object that keeps falling is an honest teacher.',
        question: 'What does someone learn about persistence from a thing that keeps hitting the floor?',
      },
      cs: {
        category: 'Pohyb / Cirkus / Výuka',
        shortDescription:
          'Nový cirkus s dětmi a mladými — žonglování, rovnováha, koordinace a hledání disciplíny, která sedne.',
        subtitle: 'Předmět, který pořád padá, je poctivý učitel.',
        question: 'Co se člověk naučí o vytrvalosti od věci, která pořád končí na zemi?',
      },
      sk: {
        category: 'Pohyb / Cirkus / Výučba',
        shortDescription:
          'Nový cirkus s deťmi a mladými — žonglovanie, rovnováha, koordinácia a hľadanie disciplíny, ktorá sadne.',
        subtitle: 'Predmet, ktorý stále padá, je poctivý učiteľ.',
        question: 'Čo sa človek naučí o vytrvalosti od veci, ktorá stále končí na zemi?',
      },
      es: {
        category: 'Movimiento / Circo / Docencia',
        shortDescription:
          'Circo contemporáneo con niños y jóvenes: malabares, equilibrio, coordinación y encontrar la disciplina propia.',
        subtitle: 'Un objeto que no deja de caerse es un maestro honesto.',
        question: '¿Qué se aprende sobre la constancia de algo que no para de caer al suelo?',
      },
      sr: {
        category: 'Pokret / Cirkus / Podučavanje',
        shortDescription:
          'Savremeni cirkus sa decom i mladima — žongliranje, ravnoteža, koordinacija i pronalaženje sopstvene discipline.',
        subtitle: 'Predmet koji stalno pada je pošten učitelj.',
        question: 'Šta čovek nauči o istrajnosti od stvari koja stalno završava na podu?',
      },
      tr: {
        category: 'Hareket / Sirk / Öğretim',
        shortDescription:
          'Çocuklar ve gençlerle çağdaş sirk — jonglörlük, denge, koordinasyon ve kendine uyan disiplini bulmak.',
        subtitle: 'Sürekli düşen bir nesne dürüst bir öğretmendir.',
        question: 'Sürekli yere düşen bir şey, insana sebat hakkında ne öğretir?',
      },
    },
    prose: {
      en: {
        overview: [
          'Contemporary circus is less about the trick than about what a person finds out while learning one. I work with children and young people, roughly six to sixteen, on juggling, object manipulation, balance and basic acrobatics.',
          'Around five years of practice and teaching so far.',
        ],
        practice: [
          'Juggling and object manipulation. Balance disciplines. Basic acrobatics. Coordination work. Performative elements and working as a group.',
          'Everyone eventually gravitates towards a discipline that suits them. Part of the job is helping them find it rather than deciding it for them.',
        ],
        idea: [
          'You try something, it does not work, you change one thing, you go again. Progress shows up through repetition, and with a physical skill it is visible in a way that is hard to argue with.',
          'What holds my attention is everything around that: awareness of your own body, coordination, trust between people in a group, staying with something that is not working yet, and movement as a way of expressing something rather than performing it.',
        ],
        people: [
          'Mostly children and young people, roughly ages 6 to 16.',
          'Local youth and movement activities in the Žďár nad Sázavou area, and the children’s programme connected with the KoresponDance festival.',
        ],
        availability: [
          'Circus and movement workshops. Regular or short-term training. Programmes for children and young people. External programmes for schools and community organisations.',
        ],
      },
      cs: {
        overview: [
          'Nový cirkus není ani tak o triku jako o tom, co člověk zjistí, když se ho učí. Pracuju s dětmi a mladými, zhruba od šesti do šestnácti, na žonglování, manipulaci s předměty, rovnováze a základní akrobacii.',
          'Zatím zhruba pět let praxe a vedení.',
        ],
        practice: [
          'Žonglování a manipulace s předměty. Rovnovážné disciplíny. Základní akrobacie. Práce na koordinaci. Performativní prvky a práce ve skupině.',
          'Každý si nakonec najde disciplínu, která mu sedne. Část práce je pomoct mu ji najít, ne ji za něj vybrat.',
        ],
        idea: [
          'Zkusíš to, nejde to, změníš jednu věc, jdeš znovu. Pokrok se ukazuje opakováním a u fyzické dovednosti je vidět tak, že se s tím nedá moc polemizovat.',
          'Zajímá mě všechno kolem toho: vnímání vlastního těla, koordinace, důvěra mezi lidmi ve skupině, vydržet u něčeho, co ještě nejde, a pohyb jako způsob, jak něco vyjádřit — ne jak to předvést.',
        ],
        people: [
          'Převážně děti a mladí lidé, zhruba 6 až 16 let.',
          'Místní volnočasové a pohybové aktivity na Žďársku a dětský program spojený s festivalem KoresponDance.',
        ],
        availability: [
          'Cirkusové a pohybové workshopy. Pravidelné i krátkodobé vedení. Programy pro děti a mládež. Externí programy pro školy a komunitní organizace.',
        ],
      },
      sk: {
        overview: [
          'Nový cirkus nie je ani tak o triku ako o tom, čo človek zistí, keď sa ho učí. Pracujem s deťmi a mladými, zhruba od šiestich do šestnástich, na žonglovaní, manipulácii s predmetmi, rovnováhe a základnej akrobacii.',
          'Zatiaľ zhruba päť rokov praxe a vedenia.',
        ],
        practice: [
          'Žonglovanie a manipulácia s predmetmi. Rovnovážne disciplíny. Základná akrobacia. Práca na koordinácii. Performatívne prvky a práca v skupine.',
          'Každý si nakoniec nájde disciplínu, ktorá mu sadne. Časť práce je pomôcť mu ju nájsť, nie ju zaňho vybrať.',
        ],
        idea: [
          'Skúsiš to, nejde to, zmeníš jednu vec, ideš znova. Pokrok sa ukazuje opakovaním a pri fyzickej zručnosti je vidieť tak, že sa s tým nedá veľmi polemizovať.',
          'Zaujíma ma všetko okolo toho: vnímanie vlastného tela, koordinácia, dôvera medzi ľuďmi v skupine, vydržať pri niečom, čo ešte nejde, a pohyb ako spôsob, ako niečo vyjadriť — nie ako to predviesť.',
        ],
        people: [
          'Prevažne deti a mladí ľudia, zhruba 6 až 16 rokov.',
          'Miestne voľnočasové a pohybové aktivity v okolí Žďáru nad Sázavou a detský program spojený s festivalom KoresponDance.',
        ],
        availability: [
          'Cirkusové a pohybové workshopy. Pravidelné aj krátkodobé vedenie. Programy pre deti a mládež. Externé programy pre školy a komunitné organizácie.',
        ],
      },
    },
  },

  // ─────────────────────────────────────────────── SNOWBOARD COACHING
  {
    findBy: 'snowboarding',
    slug: 'snowboard-coaching',
    status: ['ongoing'],
    visual: 'scan',
    hue: 195,
    order: 4,
    disciplines: ['Beginners', 'Children', 'Adults', 'Vysočina'],
    title: {
      en: 'Snowboard Coaching',
      cs: 'Výuka snowboardingu',
      sk: 'Výučba snowboardingu',
      es: 'Clases de snowboard',
      sr: 'Obuka snoubordinga',
      tr: 'Snowboard eğitimi',
    },
    short: {
      en: {
        category: 'Movement / Snowboarding / Teaching',
        shortDescription:
          'Beginner snowboard instruction for children and adults, in Vysočina.',
        subtitle: 'Getting comfortable on a board, one repetition at a time.',
        question: 'How do you make a first day on a board end with someone wanting a second one?',
      },
      cs: {
        category: 'Pohyb / Snowboarding / Výuka',
        shortDescription: 'Výuka snowboardingu pro začátečníky — děti i dospělé, na Vysočině.',
        subtitle: 'Cítit se na prkně dobře, jedno opakování po druhém.',
        question: 'Jak udělat první den na prkně tak, aby po něm člověk chtěl i druhý?',
      },
      sk: {
        category: 'Pohyb / Snowboarding / Výučba',
        shortDescription: 'Výučba snowboardingu pre začiatočníkov — deti aj dospelých, na Vysočine.',
        subtitle: 'Cítiť sa na doske dobre, jedno opakovanie po druhom.',
        question: 'Ako urobiť prvý deň na doske tak, aby po ňom človek chcel aj druhý?',
      },
      es: {
        category: 'Movimiento / Snowboard / Docencia',
        shortDescription: 'Clases de snowboard para principiantes, niños y adultos, en Vysočina.',
        subtitle: 'Sentirse cómodo sobre la tabla, una repetición cada vez.',
        question: '¿Cómo hacer que un primer día sobre la tabla termine con ganas de un segundo?',
      },
      sr: {
        category: 'Pokret / Snoubording / Podučavanje',
        shortDescription: 'Obuka snoubordinga za početnike — decu i odrasle, u regionu Vysočina.',
        subtitle: 'Osećati se dobro na dasci, jedno ponavljanje za drugim.',
        question: 'Kako napraviti prvi dan na dasci tako da čovek poželi i drugi?',
      },
      tr: {
        category: 'Hareket / Snowboard / Öğretim',
        shortDescription: 'Vysočina bölgesinde çocuklar ve yetişkinler için başlangıç snowboard eğitimi.',
        subtitle: 'Tahtanın üstünde rahatlamak, tekrar tekrar.',
        question: 'İlk gün, insana ikinci bir günü istetecek şekilde nasıl geçirilir?',
      },
    },
    prose: {
      en: {
        overview: [
          'I have snowboarded since I was around eighteen, and I hold a qualification in the basics of school snowboarding.',
          'I have taught and helped teach children and primary-school-aged learners, adults, and a fair number of friends and family.',
        ],
        practice: [
          'Basic stance and balance on the board. Board control. The fundamentals of turning. Enough confidence to keep going after the first few falls.',
          'Beginner instruction, deliberately — not racing, and not advanced freestyle. The aim is safe, unhurried progression rather than a syllabus.',
        ],
        people: [
          'Beginners: children and adults.',
          'Vysočina, mainly around Nové Město na Moravě and Žďár nad Sázavou.',
        ],
        availability: [
          'Seasonal winter sessions by arrangement. External and independent — not tied to a school or a resort.',
        ],
      },
      cs: {
        overview: [
          'Na snowboardu jezdím zhruba od osmnácti a mám kvalifikaci pro základy školního snowboardingu.',
          'Učil a pomáhal jsem učit děti a žáky prvního stupně, dospělé a slušnou řádku kamarádů a příbuzných.',
        ],
        practice: [
          'Základní postoj a rovnováha na prkně. Ovládání prkna. Základy zatáčení. Dost jistoty na to, aby člověk po prvních pádech pokračoval.',
          'Záměrně výuka pro začátečníky — ne závodní ježdění a ne pokročilý freestyle. Jde o bezpečný a nespěchaný posun, ne o osnovu.',
        ],
        people: [
          'Začátečníci: děti i dospělí.',
          'Vysočina, hlavně okolí Nového Města na Moravě a Žďáru nad Sázavou.',
        ],
        availability: [
          'Sezónní zimní lekce po domluvě. Externě a nezávisle — bez vazby na školu nebo areál.',
        ],
      },
      sk: {
        overview: [
          'Na snowboarde jazdím zhruba od osemnástich a mám kvalifikáciu pre základy školského snowboardingu.',
          'Učil a pomáhal som učiť deti a žiakov prvého stupňa, dospelých a slušný rad kamarátov a príbuzných.',
        ],
        practice: [
          'Základný postoj a rovnováha na doske. Ovládanie dosky. Základy zatáčania. Dosť istoty na to, aby človek po prvých pádoch pokračoval.',
          'Zámerne výučba pre začiatočníkov — nie závodné jazdenie a nie pokročilý freestyle. Ide o bezpečný a neuponáhľaný posun, nie o osnovu.',
        ],
        people: [
          'Začiatočníci: deti aj dospelí.',
          'Vysočina, najmä okolie Nového Mesta na Morave a Žďáru nad Sázavou.',
        ],
        availability: [
          'Sezónne zimné lekcie po dohode. Externe a nezávisle — bez väzby na školu alebo areál.',
        ],
      },
    },
  },

  // ─────────────────────────────────────────────── WEB & DIGITAL WORK
  {
    findBy: 'web-digital-work',
    slug: 'web-digital-work',
    status: ['live', 'in-development'],
    visual: 'grid',
    hue: 205,
    order: 1,
    disciplines: ['Web', 'AI', 'Automation', 'Consultation'],
    title: {
      en: 'Web & Digital Work',
      cs: 'Web a digitální práce',
      sk: 'Web a digitálna práca',
      es: 'Web y trabajo digital',
      sr: 'Veb i digitalni rad',
      tr: 'Web ve dijital işler',
    },
    short: {
      en: {
        category: 'Web / Digital Products / AI',
        shortDescription:
          'Websites, digital products, AI and automation — from a finished brief, or from a problem that has not been shaped yet.',
        subtitle: 'Two ways in: you know what you need, or you know something is wrong.',
        question: 'Does this problem actually need a website, or something else entirely?',
      },
      cs: {
        category: 'Web / Digitální produkty / AI',
        shortDescription:
          'Weby, digitální produkty, AI a automatizace — z hotového zadání, nebo z problému, který ještě nemá tvar.',
        subtitle: 'Dvě cesty dovnitř: víš, co potřebuješ, nebo víš, že něco nefunguje.',
        question: 'Potřebuje ten problém opravdu web, nebo něco úplně jiného?',
      },
      sk: {
        category: 'Web / Digitálne produkty / AI',
        shortDescription:
          'Weby, digitálne produkty, AI a automatizácia — z hotového zadania, alebo z problému, ktorý ešte nemá tvar.',
        subtitle: 'Dve cesty dovnútra: vieš, čo potrebuješ, alebo vieš, že niečo nefunguje.',
        question: 'Potrebuje ten problém naozaj web, alebo niečo úplne iné?',
      },
      es: {
        category: 'Web / Productos digitales / IA',
        shortDescription:
          'Sitios web, productos digitales, IA y automatización: desde un encargo cerrado o desde un problema sin forma todavía.',
        subtitle: 'Dos entradas: sabes qué necesitas, o sabes que algo no funciona.',
        question: '¿Este problema necesita realmente una web, o algo distinto?',
      },
      sr: {
        category: 'Veb / Digitalni proizvodi / AI',
        shortDescription:
          'Sajtovi, digitalni proizvodi, AI i automatizacija — od gotovog briefa ili od problema koji još nema oblik.',
        subtitle: 'Dva ulaza: znaš šta ti treba, ili znaš da nešto ne radi.',
        question: 'Da li ovom problemu zaista treba sajt, ili nešto sasvim drugo?',
      },
      tr: {
        category: 'Web / Dijital ürünler / YZ',
        shortDescription:
          'Web siteleri, dijital ürünler, yapay zekâ ve otomasyon — hazır bir brief’ten ya da henüz biçimlenmemiş bir sorundan.',
        subtitle: 'İki giriş: ne istediğini biliyorsun ya da bir şeyin yanlış olduğunu biliyorsun.',
        question: 'Bu sorunun gerçekten bir web sitesine mi, yoksa bambaşka bir şeye mi ihtiyacı var?',
      },
    },
    prose: {
      en: {
        overview: [
          'Complete websites, redesigns and landing pages for self-employed people, small organisations, businesses and cultural projects.',
          'Alongside that: AI integrations, API work, automation, databases, deployment and the infrastructure underneath — and consultation when that is the useful part.',
        ],
        practice: [
          'There are two ways this usually starts, and they are genuinely different pieces of work.',
          'The first: you know what you need. A brief exists, the scope is reasonably clear, and the job is to design it, build it and hand it over working.',
          'The second: you have a problem, or an idea, and no clear picture of the solution. That starts earlier — working out what the actual problem is before deciding what should be built. Sometimes the answer turns out not to be a website at all.',
        ],
        people: [
          'Self-employed people, small organisations, businesses and cultural projects.',
        ],
        availability: [
          'Full builds and redesigns. Landing pages. AI and API integrations. Automation and databases. Hosting and deployment. Consultation on a problem that has not been shaped yet.',
        ],
      },
      cs: {
        overview: [
          'Kompletní weby, redesigny a landing pages pro OSVČ, malé organizace, firmy a kulturní projekty.',
          'Vedle toho: AI integrace, práce s API, automatizace, databáze, nasazení a infrastruktura pod tím — a konzultace, když je zrovna ona tou užitečnou částí.',
        ],
        practice: [
          'Obvykle to začíná dvěma způsoby a jsou to opravdu dvě různé práce.',
          'První: víš, co potřebuješ. Zadání existuje, rozsah je celkem jasný a úkolem je to navrhnout, postavit a předat funkční.',
          'Druhý: máš problém nebo nápad a nemáš jasnou představu o řešení. To začíná dřív — nejdřív zjistit, co je skutečný problém, a teprve pak rozhodnout, co se má stavět. Někdy se ukáže, že odpovědí není web.',
        ],
        people: [
          'OSVČ, malé organizace, firmy a kulturní projekty.',
        ],
        availability: [
          'Kompletní weby a redesigny. Landing pages. AI a API integrace. Automatizace a databáze. Hosting a nasazení. Konzultace k problému, který ještě nemá tvar.',
        ],
      },
      sk: {
        overview: [
          'Kompletné weby, redizajny a landing pages pre živnostníkov, malé organizácie, firmy a kultúrne projekty.',
          'Popri tom: AI integrácie, práca s API, automatizácia, databázy, nasadenie a infraštruktúra pod tým — a konzultácie, keď sú práve ony tou užitočnou časťou.',
        ],
        practice: [
          'Obyčajne to začína dvoma spôsobmi a sú to naozaj dve rôzne práce.',
          'Prvý: vieš, čo potrebuješ. Zadanie existuje, rozsah je celkom jasný a úlohou je to navrhnúť, postaviť a odovzdať funkčné.',
          'Druhý: máš problém alebo nápad a nemáš jasnú predstavu o riešení. To začína skôr — najprv zistiť, čo je skutočný problém, a až potom rozhodnúť, čo sa má stavať. Niekedy sa ukáže, že odpoveďou nie je web.',
        ],
        people: [
          'Živnostníci, malé organizácie, firmy a kultúrne projekty.',
        ],
        availability: [
          'Kompletné weby a redizajny. Landing pages. AI a API integrácie. Automatizácia a databázy. Hosting a nasadenie. Konzultácie k problému, ktorý ešte nemá tvar.',
        ],
      },
    },
  },
]

const WRITTEN = [...FULL_LOCALES]

async function main() {
  const payload = await getPayload({ config })

  console.log('\n[movement] Writing real content for 3 Selected Work entries...')

  for (const e of entries) {
    const found = await payload.find({
      collection: 'projects',
      where: { slug: { equals: e.findBy } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    })
    const doc = found.docs[0]
    if (!doc) {
      console.warn(`  ! ${e.findBy} not found — run "npm run restructure" first`)
      continue
    }

    for (const locale of [...FULL_LOCALES, ...SHORT_LOCALES] as AnyLocale[]) {
      const s = e.short[locale]
      await payload.update({
        collection: 'projects',
        id: doc.id,
        locale,
        overrideAccess: true,
        data: {
          title: e.title[locale],
          category: s.category,
          shortDescription: s.shortDescription,
          subtitle: s.subtitle,
          question: s.question,
          metaTitle: `${e.title[locale]} — Denis Mitrović`,
          metaDescription: s.shortDescription,
        },
      })
    }

    for (const locale of FULL_LOCALES) {
      const p = e.prose[locale]
      await payload.update({
        collection: 'projects',
        id: doc.id,
        locale,
        overrideAccess: true,
        data: {
          overview: p.overview ? rt(p.overview) : null,
          practice: p.practice ? rt(p.practice) : null,
          idea: p.idea ? rt(p.idea) : null,
          people: p.people ? rt(p.people) : null,
          availability: p.availability ? rt(p.availability) : null,
        },
      })
    }

    await payload.update({
      collection: 'projects',
      id: doc.id,
      overrideAccess: true,
      data: {
        slug: e.slug,
        status: e.status,
        visual: e.visual,
        hue: e.hue,
        order: e.order,
        featured: true,
        disciplines: e.disciplines,
        writtenLocales: WRITTEN,
        _status: 'published',
      },
    })

    console.log(`  ✓ ${e.slug}  (${e.findBy === e.slug ? 'updated' : `renamed from ${e.findBy}`})`)
  }

  console.log('\n[movement] Done.')
  process.exit(0)
}

void main()
