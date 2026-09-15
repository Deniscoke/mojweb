/**
 * ITERATION 5 — SELECTED WORK RESTRUCTURE.
 *
 *   npm run restructure
 *
 * Three things happen, all idempotent and all reversible from the admin:
 *
 * 1. Art Learning, Digital Space and AI Commerce move out of Selected Work and
 *    into the Lab. Their project records are set back to draft rather than
 *    deleted, so the case-study prose and its six locales survive intact and a
 *    single click restores any of them.
 * 2. Their evidence moves with them — the point cloud, the capture frame and
 *    the pipeline diagram re-attach to the new lab notes.
 * 3. Three new entries join Selected Work: Web & Digital Work, Contemporary
 *    Circus and Snowboarding.
 *
 * The two movement entries are deliberately thin. No source material for
 * either exists on this machine, so they carry a category, a status and one
 * honest sentence — and nothing else. A page that says "not written up yet" is
 * worth more than an invented practice.
 */

import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { rt, FULL_LOCALES, SHORT_LOCALES, type FullLocale, type AnyLocale } from './lexical'

type Status = 'experiment' | 'prototype' | 'in-development' | 'live' | 'ongoing'
type Visual = 'strata' | 'orbit' | 'grid' | 'scan' | 'flux'

// ── 1. Projects that become lab notes ───────────────────────────────────

interface MovedProject {
  /** Existing project slug, which is unpublished and read for its media. */
  from: string
  identifier: string
  slug: string
  tag: string
  state: 'open-question' | 'in-progress' | 'ongoing'
  order: number
  title: Record<FullLocale, string>
  question: Record<FullLocale, string>
  shortNote: Record<FullLocale, string>
  whatITried: Record<FullLocale, string[]>
  whatHappened: Record<FullLocale, string[]>
  nextQuestion: Record<FullLocale, string[]>
}

const moved: MovedProject[] = [
  {
    from: 'art-learning',
    identifier: 'art-learning',
    slug: 'art-learning',
    tag: 'Learning design',
    state: 'in-progress',
    order: 20,
    title: {
      en: 'Art Learning',
      cs: 'Art Learning',
      sk: 'Art Learning',
    },
    question: {
      en: 'What if learning to draw felt more like building a daily habit than completing a course?',
      cs: 'Co kdyby se kreslení učilo spíš jako každodenní návyk než jako kurz?',
      sk: 'Čo ak by sa kreslenie učilo skôr ako každodenný návyk než ako kurz?',
    },
    shortNote: {
      en: 'A mobile app concept built around returning tomorrow.',
      cs: 'Koncept mobilní aplikace postavený na tom, že se člověk vrátí zítra.',
      sk: 'Koncept mobilnej aplikácie postavený na tom, že sa človek vráti zajtra.',
    },
    whatITried: {
      en: [
        'Designed the unit of practice as one day rather than one lesson: a short prompt, a drawing on paper, a photograph of it, and a visible mark that it happened.',
        'Framed progress as an accumulating body of work — a gallery that fills up — instead of a completion percentage.',
      ],
      cs: [
        'Navrhl jsem jednotku praxe jako jeden den, ne jednu lekci: krátké zadání, kresba na papíře, fotka a viditelná stopa, že se to stalo.',
        'Pokrok jsem pojal jako rostoucí soubor práce — galerii, která se zaplňuje — místo procenta dokončení.',
      ],
      sk: [
        'Navrhol som jednotku praxe ako jeden deň, nie jednu lekciu: krátke zadanie, kresba na papieri, fotka a viditeľná stopa, že sa to stalo.',
        'Pokrok som poňal ako rastúci súbor práce — galériu, ktorá sa zapĺňa — namiesto percenta dokončenia.',
      ],
    },
    whatHappened: {
      en: [
        'The learning design got further than the implementation, and the two never caught up with each other.',
        'Numeric scoring kept presenting itself as the obvious mechanic and kept being wrong for beginners, who are supposed to draw badly for a while.',
      ],
      cs: [
        'Návrh učení se dostal dál než implementace a ty dvě věci se už nedohnaly.',
        'Číselné hodnocení se pořád nabízelo jako samozřejmá mechanika a pořád bylo špatně pro začátečníky, kteří mají chvíli kreslit špatně.',
      ],
      sk: [
        'Návrh učenia sa dostal ďalej než implementácia a tie dve veci sa už nedobehli.',
        'Číselné hodnotenie sa stále ponúkalo ako samozrejmá mechanika a stále bolo zlé pre začiatočníkov, ktorí majú chvíľu kresliť zle.',
      ],
    },
    nextQuestion: {
      en: ['Can encouragement be specific enough to be useful without turning into grading?'],
      cs: ['Dokáže být povzbuzení dost konkrétní na to, aby bylo užitečné, a přitom se nestalo známkováním?'],
      sk: ['Dokáže byť povzbudenie dosť konkrétne na to, aby bolo užitočné, a pritom sa nestalo známkovaním?'],
    },
  },
  {
    from: 'digital-space',
    identifier: 'digital-space',
    slug: 'digital-space',
    tag: '3D capture',
    state: 'ongoing',
    order: 21,
    title: {
      en: 'Digital Space / Heritage',
      cs: 'Digital Space / Heritage',
      sk: 'Digital Space / Heritage',
    },
    question: {
      en: 'How can a physical place become a digital environment rather than just a collection of photographs?',
      cs: 'Jak se z fyzického místa stane digitální prostředí, a ne jen sbírka fotografií?',
      sk: 'Ako sa z fyzického miesta stane digitálne prostredie, a nie len zbierka fotografií?',
    },
    shortNote: {
      en: 'Capturing real places as geometry instead of pictures.',
      cs: 'Zachycovat reálná místa jako geometrii místo obrázků.',
      sk: 'Zachytávať reálne miesta ako geometriu namiesto obrázkov.',
    },
    whatITried: {
      en: [
        'Photogrammetry, LiDAR and drone capture of real buildings and objects, run through reconstruction into point clouds and meshes — a record with dimensions rather than a record with framing.',
      ],
      cs: [
        'Fotogrammetrie, LiDAR a snímkování z dronu na reálných budovách a objektech, převedené rekonstrukcí na mračna bodů a meshe — záznam s rozměry místo záznamu s kompozicí.',
      ],
      sk: [
        'Fotogrametria, LiDAR a snímkovanie z dronu na reálnych budovách a objektoch, prevedené rekonštrukciou na mračná bodov a meshe — záznam s rozmermi namiesto záznamu s kompozíciou.',
      ],
    },
    whatHappened: {
      en: [
        'Almost all of the risk sits in the capture. A generous, boring, systematic pass reconstructs better than any amount of cleanup applied to a rushed one.',
        'Scanning a place turned out not to be the same as interpreting it. The geometry is only the material; deciding what a visitor should notice is a separate act.',
      ],
      cs: [
        'Skoro celé riziko nese fáze sběru. Velkorysý, nudný a systematický průchod se rekonstruuje líp než jakékoli čištění uspěchaného.',
        'Naskenovat místo se ukázalo být něco jiného než ho vyložit. Geometrie je jen materiál; rozhodnout, čeho si má návštěvník všimnout, je samostatný úkon.',
      ],
      sk: [
        'Takmer celé riziko nesie fáza zberu. Veľkorysý, nudný a systematický prechod sa rekonštruuje lepšie než akékoľvek čistenie uponáhľaného.',
        'Naskenovať miesto sa ukázalo byť niečím iným než ho vyložiť. Geometria je len materiál; rozhodnúť, čoho si má návštevník všimnúť, je samostatný úkon.',
      ],
    },
    nextQuestion: {
      en: ['What has to be added to a reconstruction before it stops being a model and starts being a space?'],
      cs: ['Co se musí k rekonstrukci přidat, aby přestala být modelem a začala být prostorem?'],
      sk: ['Čo sa musí k rekonštrukcii pridať, aby prestala byť modelom a začala byť priestorom?'],
    },
  },
  {
    from: 'ai-commerce-engine',
    identifier: 'ai-commerce-engine',
    slug: 'ai-commerce-engine',
    tag: 'Systems',
    state: 'in-progress',
    order: 22,
    title: {
      en: 'AI Commerce Engine',
      cs: 'AI Commerce Engine',
      sk: 'AI Commerce Engine',
    },
    question: {
      en: 'How much of a digital-product workflow can be made systematic, reproducible and automatically testable?',
      cs: 'Kolik z workflow digitálního produktu se dá udělat systematicky, opakovatelně a automaticky testovatelně?',
      sk: 'Koľko z workflow digitálneho produktu sa dá urobiť systematicky, opakovateľne a automaticky testovateľne?',
    },
    shortNote: {
      en: 'Treating a generated product like a build artifact.',
      cs: 'Brát vygenerovaný produkt jako build artefakt.',
      sk: 'Brať vygenerovaný produkt ako build artefakt.',
    },
    whatITried: {
      en: [
        'Put the whole thing behind gates: generation, then export into multiple formats, then automated quality checks, then a manifest recording which inputs and which pipeline version produced which outputs.',
      ],
      cs: [
        'Postavil jsem za to celé kontrolní brány: generování, pak export do více formátů, pak automatické kontroly kvality a nakonec manifest se záznamem, jaké vstupy a jaká verze pipeline vyrobily jaké výstupy.',
      ],
      sk: [
        'Postavil som za to celé kontrolné brány: generovanie, potom export do viacerých formátov, potom automatické kontroly kvality a napokon manifest so záznamom, aké vstupy a aká verzia pipeline vyrobili aké výstupy.',
      ],
    },
    whatHappened: {
      en: [
        'The generative step turned out to be the least difficult part. Export correctness, validation and reproducibility took the real work.',
        'A pipeline where nothing ever fails a check turned out to be a warning sign rather than a success: it meant the checks were not testing anything.',
      ],
      cs: [
        'Generativní krok se ukázal jako ten nejmenší problém. Skutečnou práci spolkla správnost exportu, validace a reprodukovatelnost.',
        'Pipeline, ve které nikdy nic neprojde kontrolou negativně, se ukázala spíš jako varování než jako úspěch: znamenalo to, že kontroly nic netestují.',
      ],
      sk: [
        'Generatívny krok sa ukázal ako ten najmenší problém. Skutočnú prácu pohltila správnosť exportu, validácia a reprodukovateľnosť.',
        'Pipeline, v ktorej nikdy nič neprejde kontrolou negatívne, sa ukázala skôr ako varovanie než ako úspech: znamenalo to, že kontroly nič netestujú.',
      ],
    },
    nextQuestion: {
      en: ['Which failures can only be caught by a person, and how should the pipeline route those rather than pretend to decide them?'],
      cs: ['Které chyby dokáže zachytit jen člověk a jak je má pipeline předat dál, místo aby předstírala, že o nich rozhoduje?'],
      sk: ['Ktoré chyby dokáže zachytiť len človek a ako ich má pipeline posunúť ďalej, namiesto toho, aby predstierala, že o nich rozhoduje?'],
    },
  },
]

// ── 2. New Selected Work entries ────────────────────────────────────────

interface NewProject {
  slug: string
  title: string
  status: Status[]
  visual: Visual
  hue: number
  order: number
  externalUrl?: string
  short: Record<AnyLocale, { category: string; shortDescription: string }>
}

const added: NewProject[] = [
  {
    slug: 'web-digital-work',
    title: 'Web & Digital Work',
    // Some of it is shipped and some is still being built; both are true.
    status: ['live', 'in-development'],
    visual: 'grid',
    hue: 205,
    order: 1,
    short: {
      en: {
        category: 'Web / Digital Products',
        shortDescription:
          'A continuing strand of websites and digital work running alongside the larger projects.',
      },
      cs: {
        category: 'Web / Digitální produkty',
        shortDescription:
          'Průběžná linka webů a digitální práce, která běží vedle větších projektů.',
      },
      sk: {
        category: 'Web / Digitálne produkty',
        shortDescription:
          'Priebežná línia webov a digitálnej práce, ktorá beží popri väčších projektoch.',
      },
      es: {
        category: 'Web / Productos digitales',
        shortDescription:
          'Una línea continua de sitios web y trabajo digital que corre en paralelo a los proyectos mayores.',
      },
      sr: {
        category: 'Veb / Digitalni proizvodi',
        shortDescription:
          'Kontinuirana linija veb sajtova i digitalnog rada koja teče uporedo sa većim projektima.',
      },
      tr: {
        category: 'Web / Dijital ürünler',
        shortDescription:
          'Büyük projelerin yanı sıra süren, web siteleri ve dijital işlerden oluşan bir hat.',
      },
    },
  },
  {
    slug: 'contemporary-circus',
    title: 'Contemporary Circus',
    status: ['ongoing'],
    visual: 'flux',
    hue: 320,
    order: 2,
    short: {
      en: {
        category: 'Movement / Performance',
        shortDescription: 'Contemporary circus — an ongoing physical practice. Not written up yet.',
      },
      cs: {
        category: 'Pohyb / Performance',
        shortDescription: 'Nový cirkus — průběžná fyzická praxe. Zatím nesepsáno.',
      },
      sk: {
        category: 'Pohyb / Performance',
        shortDescription: 'Nový cirkus — priebežná fyzická prax. Zatiaľ nespísané.',
      },
      es: {
        category: 'Movimiento / Escena',
        shortDescription: 'Circo contemporáneo — una práctica física en curso. Aún sin desarrollar.',
      },
      sr: {
        category: 'Pokret / Scena',
        shortDescription: 'Savremeni cirkus — kontinuirana fizička praksa. Još nije opisano.',
      },
      tr: {
        category: 'Hareket / Sahne',
        shortDescription: 'Çağdaş sirk — süregelen bir bedensel pratik. Henüz yazılmadı.',
      },
    },
  },
  {
    slug: 'snowboarding',
    title: 'Snowboarding',
    status: ['ongoing'],
    visual: 'scan',
    hue: 195,
    order: 4,
    short: {
      en: {
        category: 'Movement / Riding',
        shortDescription: 'Snowboarding — an ongoing practice. Not written up yet.',
      },
      cs: {
        category: 'Pohyb / Jízda',
        shortDescription: 'Snowboarding — průběžná praxe. Zatím nesepsáno.',
      },
      sk: {
        category: 'Pohyb / Jazda',
        shortDescription: 'Snowboarding — priebežná prax. Zatiaľ nespísané.',
      },
      es: {
        category: 'Movimiento / Nieve',
        shortDescription: 'Snowboard — una práctica en curso. Aún sin desarrollar.',
      },
      sr: {
        category: 'Pokret / Vožnja',
        shortDescription: 'Snoubording — kontinuirana praksa. Još nije opisano.',
      },
      tr: {
        category: 'Hareket / Kayak',
        shortDescription: 'Snowboard — süregelen bir pratik. Henüz yazılmadı.',
      },
    },
  },
]

/** Selected Work, in the order it should read. */
const FEATURE_ORDER = [
  'pravo365',
  'web-digital-work',
  'contemporary-circus',
  'moodpack-director',
  'snowboarding',
]

async function findProject(payload: Payload, slug: string) {
  const res = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  })
  return res.docs[0]
}

async function findExperiment(payload: Payload, identifier: string) {
  const res = await payload.find({
    collection: 'experiments',
    where: { identifier: { equals: identifier } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  })
  return res.docs[0]
}

async function moveToLab(payload: Payload) {
  console.log('\n[restructure] Moving 3 projects into the Lab...')

  for (const m of moved) {
    const project = await findProject(payload, m.from)

    // Carry the evidence across rather than orphaning it.
    const mediaIds = (project?.media ?? [])
      .map((x) => (typeof x === 'number' ? x : x?.id))
      .filter((x): x is number => typeof x === 'number')

    let doc = await findExperiment(payload, m.identifier)

    if (!doc) {
      doc = await payload.create({
        collection: 'experiments',
        locale: 'en',
        overrideAccess: true,
        data: {
          identifier: m.identifier,
          slug: m.slug,
          title: m.title.en,
          tag: m.tag,
          status: m.state,
          order: m.order,
          _status: 'published',
        },
      })
      console.log(`  + lab note  ${m.identifier}`)
    } else {
      console.log(`  ~ lab note  ${m.identifier}`)
    }

    for (const locale of FULL_LOCALES) {
      await payload.update({
        collection: 'experiments',
        id: doc.id,
        locale,
        overrideAccess: true,
        data: {
          title: m.title[locale],
          question: m.question[locale],
          shortNote: m.shortNote[locale],
          whatITried: rt(m.whatITried[locale]),
          whatHappened: rt(m.whatHappened[locale]),
          nextQuestion: rt(m.nextQuestion[locale]),
        },
      })
    }

    await payload.update({
      collection: 'experiments',
      id: doc.id,
      overrideAccess: true,
      data: {
        slug: m.slug,
        tag: m.tag,
        status: m.state,
        order: m.order,
        media: mediaIds,
        // The project it came from is no longer public, so there is nothing
        // to point at.
        relatedProject: null,
        _status: 'published',
      },
    })

    if (project) {
      // Draft, not deleted: the case study and all six locales survive, and
      // republishing is one click in the admin.
      await payload.update({
        collection: 'projects',
        id: project.id,
        overrideAccess: true,
        data: { featured: false, _status: 'draft' },
      })
      console.log(`    ${m.from}: unpublished, ${mediaIds.length} media moved`)
    }
  }

  // Existing experiments that pointed at a now-unpublished project.
  for (const identifier of ['duolingo-drawing', 'navigable-space', 'lidar-photogrammetry', 'generated-product']) {
    const e = await findExperiment(payload, identifier)
    if (e) {
      await payload.update({
        collection: 'experiments',
        id: e.id,
        overrideAccess: true,
        data: { relatedProject: null },
      })
    }
  }
  console.log('  cleared 4 dangling relatedProject links')
}

async function addProjects(payload: Payload) {
  console.log('\n[restructure] Adding 3 Selected Work entries...')

  for (const p of added) {
    let doc = await findProject(payload, p.slug)

    if (!doc) {
      doc = await payload.create({
        collection: 'projects',
        locale: 'en',
        overrideAccess: true,
        data: {
          title: p.title,
          slug: p.slug,
          status: p.status,
          visual: p.visual,
          hue: p.hue,
          order: p.order,
          featured: true,
          externalUrl: p.externalUrl,
          category: p.short.en.category,
          shortDescription: p.short.en.shortDescription,
          _status: 'published',
        },
      })
      console.log(`  + ${p.slug}`)
    } else {
      console.log(`  ~ ${p.slug}`)
    }

    for (const locale of [...FULL_LOCALES, ...SHORT_LOCALES] as AnyLocale[]) {
      await payload.update({
        collection: 'projects',
        id: doc.id,
        locale,
        overrideAccess: true,
        data: {
          category: p.short[locale].category,
          shortDescription: p.short[locale].shortDescription,
          metaTitle: `${p.title} — Denis Mitrović`,
          metaDescription: p.short[locale].shortDescription,
        },
      })
    }

    await payload.update({
      collection: 'projects',
      id: doc.id,
      overrideAccess: true,
      data: {
        status: p.status,
        visual: p.visual,
        hue: p.hue,
        order: p.order,
        featured: true,
        _status: 'published',
      },
    })
  }
}

async function reorder(payload: Payload) {
  console.log('\n[restructure] Selected Work order:')
  for (let i = 0; i < FEATURE_ORDER.length; i++) {
    const slug = FEATURE_ORDER[i]!
    const doc = await findProject(payload, slug)
    if (!doc) {
      console.warn(`  ! missing ${slug}`)
      continue
    }
    await payload.update({
      collection: 'projects',
      id: doc.id,
      overrideAccess: true,
      data: { order: i, featured: true, _status: 'published' },
    })
    console.log(`  ${i}. ${slug}`)
  }
}

async function main() {
  const payload = await getPayload({ config })

  await moveToLab(payload)
  await addProjects(payload)
  await reorder(payload)

  const [p, x] = await Promise.all([
    payload.count({ collection: 'projects', where: { _status: { equals: 'published' } }, overrideAccess: true }),
    payload.count({ collection: 'experiments', where: { _status: { equals: 'published' } }, overrideAccess: true }),
  ])

  console.log('\n[restructure] Done.')
  console.log(`  Published projects:    ${p.totalDocs}`)
  console.log(`  Published experiments: ${x.totalDocs}`)
  process.exit(0)
}

void main()
