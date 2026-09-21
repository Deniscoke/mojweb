/**
 * SPLATOO — a new Selected Work entry.
 *
 *   npm run content:splatoo
 *
 * Supplied by Denis: he works on Splatoo in collaboration, and the Žďár nad
 * Sázavou scene (app.splatoo.com/present/zdar-nad-sazavou) is to be shown on
 * the project page. Everything said about the product itself is taken from the
 * official site, splatoo.com, and nothing beyond it.
 *
 * Deliberately NOT stated, because it was not given:
 *
 *   1. Denis's specific role or what he built. The copy says he collaborates on
 *      Splatoo and stops there.
 *   2. The collaborator's name. Denis referred to him informally; a public
 *      portfolio needs the name he wants to be credited under.
 *   3. Who captured the Žďár scene, or what "Žabiak" in it is.
 *   4. Clients. Splatoo's site lists sectors it is aimed at — the copy
 *      attributes that list to Splatoo and never presents it as customers.
 *
 * Idempotent: finds the project by slug, creates it only if missing, and
 * rewrites only the fields below. Placed directly after MoodPack / Director
 * so the two Gaussian-splatting entries sit together, without renumbering any
 * other project.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { rt, FULL_LOCALES, SHORT_LOCALES, type FullLocale, type AnyLocale } from './lexical'

const SLUG = 'splatoo'
const TITLE = 'Splatoo'

const short: Record<AnyLocale, { category: string; shortDescription: string; subtitle: string; question: string }> = {
  en: {
    category: '3D / Gaussian Splatting / Web',
    shortDescription:
      'Real places captured in 3D and made explorable in any browser, with nothing to install. A collaboration on Splatoo.',
    subtitle: 'A real place, explorable from a link.',
    question: 'Can someone walk through a real place from a browser, with nothing to install?',
  },
  cs: {
    category: '3D / Gaussian Splatting / Web',
    shortDescription:
      'Skutečná místa zachycená ve 3D, prozkoumatelná v každém prohlížeči a bez instalace. Spolupráce na Splatoo.',
    subtitle: 'Skutečné místo, prozkoumatelné z odkazu.',
    question: 'Dá se projít skutečným místem z prohlížeče, bez čehokoli k instalaci?',
  },
  sk: {
    category: '3D / Gaussian Splatting / Web',
    shortDescription:
      'Skutočné miesta zachytené v 3D, preskúmateľné v každom prehliadači a bez inštalácie. Spolupráca na Splatoo.',
    subtitle: 'Skutočné miesto, preskúmateľné z odkazu.',
    question: 'Dá sa prejsť skutočným miestom z prehliadača, bez čohokoľvek na inštaláciu?',
  },
  es: {
    category: '3D / Gaussian Splatting / Web',
    shortDescription:
      'Lugares reales capturados en 3D y explorables en cualquier navegador, sin instalar nada. Una colaboración en Splatoo.',
    subtitle: 'Un lugar real, explorable desde un enlace.',
    question: '¿Se puede recorrer un lugar real desde el navegador, sin instalar nada?',
  },
  sr: {
    category: '3D / Gaussian Splatting / Veb',
    shortDescription:
      'Stvarna mesta snimljena u 3D, koja se mogu istraživati u svakom pregledaču, bez instalacije. Saradnja na Splatoo.',
    subtitle: 'Stvarno mesto, dostupno preko linka.',
    question: 'Može li se proći kroz stvarno mesto iz pregledača, bez ičega za instaliranje?',
  },
  tr: {
    category: '3D / Gaussian Splatting / Web',
    shortDescription:
      'Gerçek mekânlar 3D olarak yakalanıyor ve hiçbir şey kurmadan her tarayıcıda keşfedilebiliyor. Splatoo üzerinde bir iş birliği.',
    subtitle: 'Gerçek bir mekân, bir bağlantıdan keşfedilebilir.',
    question: 'Gerçek bir mekânda, hiçbir şey kurmadan tarayıcıdan dolaşılabilir mi?',
  },
}

interface Prose {
  overview: string[]
  technology: string[]
  currentState: string[]
}

const prose: Record<FullLocale, Prose> = {
  en: {
    overview: [
      'Splatoo turns real places into interactive 3D spaces that open in an ordinary browser — no app to install. I collaborate on it.',
      'The scene on this page is Žďár nad Sázavou, presented the way Splatoo presents any space: a captured place you can move through yourself, rather than a video of someone else moving through it.',
    ],
    technology: [
      'A location is captured with Gaussian splatting, which keeps both the geometry and the atmosphere of a place instead of reducing it to a simplified model.',
      'On top of the capture goes a layer of points of interest, routes and content, so a scene works as wayfinding and not only as something to look at. The same scene runs on the web and on on-site kiosks.',
      'Scenes can also be brought over from Unreal Engine and converted into splats, so a space does not have to exist physically to be presented this way.',
    ],
    currentState: [
      'Live at splatoo.com. Splatoo’s own site sets out where it is aimed: real estate, events, retail, tourism, golf, zoos and veterinary practices.',
    ],
  },
  cs: {
    overview: [
      'Splatoo mění skutečná místa v interaktivní 3D prostory, které se otevřou v obyčejném prohlížeči — bez instalace aplikace. Spolupracuju na něm.',
      'Scéna na téhle stránce je Žďár nad Sázavou, představený tak, jak Splatoo představuje jakýkoli prostor: zachycené místo, kterým se pohybuješ sám, ne video, jak se jím pohybuje někdo jiný.',
    ],
    technology: [
      'Místo se zachytí metodou Gaussian splatting, která zachová geometrii i atmosféru místa, místo aby ho zjednodušila na model.',
      'Na záznam se přidá vrstva bodů zájmu, tras a obsahu, takže scéna slouží k orientaci, ne jen k dívání. Stejná scéna běží na webu i na kioscích přímo na místě.',
      'Scény se dají převést i z Unreal Engine do splatů, takže prostor nemusí fyzicky existovat, aby se dal takhle ukázat.',
    ],
    currentState: [
      'Živě na splatoo.com. Web Splatoo sám uvádí, pro koho je určený: reality, akce, retail, cestovní ruch, golf, zoo a veterinární praxe.',
    ],
  },
  sk: {
    overview: [
      'Splatoo mení skutočné miesta na interaktívne 3D priestory, ktoré sa otvoria v obyčajnom prehliadači — bez inštalácie aplikácie. Spolupracujem na ňom.',
      'Scéna na tejto stránke je Žďár nad Sázavou, predstavený tak, ako Splatoo predstavuje akýkoľvek priestor: zachytené miesto, ktorým sa pohybuješ sám, nie video, ako sa ním pohybuje niekto iný.',
    ],
    technology: [
      'Miesto sa zachytí metódou Gaussian splatting, ktorá zachová geometriu aj atmosféru miesta, namiesto toho, aby ho zjednodušila na model.',
      'Na záznam sa pridá vrstva bodov záujmu, trás a obsahu, takže scéna slúži na orientáciu, nie len na pozeranie. Tá istá scéna beží na webe aj na kioskoch priamo na mieste.',
      'Scény sa dajú previesť aj z Unreal Engine do splatov, takže priestor nemusí fyzicky existovať, aby sa dal takto ukázať.',
    ],
    currentState: [
      'Naživo na splatoo.com. Web Splatoo sám uvádza, pre koho je určený: reality, podujatia, retail, cestovný ruch, golf, zoo a veterinárne ambulancie.',
    ],
  },
}

async function main() {
  const payload = await getPayload({ config })

  console.log('\n[splatoo] Writing the Splatoo entry...')

  const all = await payload.find({
    collection: 'projects',
    limit: 100,
    depth: 0,
    draft: true,
    overrideAccess: true,
    sort: 'order',
  })
  const bySlug = new Map(all.docs.map((d) => [d.slug as string, d]))

  // Between MoodPack / Director and whatever follows it, without renumbering.
  const anchor = bySlug.get('moodpack-director')
  const anchorOrder = Number(anchor?.order ?? 0)
  const after = all.docs.find((d) => d.slug !== SLUG && Number(d.order ?? 0) > anchorOrder)
  const order = after ? (anchorOrder + Number(after.order)) / 2 : anchorOrder + 1

  let doc = bySlug.get(SLUG)
  if (!doc) {
    doc = await payload.create({
      collection: 'projects',
      locale: 'en',
      overrideAccess: true,
      data: {
        title: TITLE,
        slug: SLUG,
        status: ['live'],
        visual: 'scan',
        hue: 125,
        order,
        featured: true,
        category: short.en.category,
        shortDescription: short.en.shortDescription,
        _status: 'published',
      },
    })
    console.log(`  + ${SLUG}`)
  } else {
    console.log(`  ~ ${SLUG}`)
  }

  for (const locale of [...FULL_LOCALES, ...SHORT_LOCALES] as AnyLocale[]) {
    const s = short[locale]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      locale,
      overrideAccess: true,
      data: {
        title: TITLE,
        category: s.category,
        shortDescription: s.shortDescription,
        subtitle: s.subtitle,
        question: s.question,
        metaTitle: `${TITLE} — Denis Mitrović`,
        metaDescription: s.shortDescription,
      },
    })
  }

  for (const locale of FULL_LOCALES) {
    const p = prose[locale]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      locale,
      overrideAccess: true,
      data: {
        overview: rt(p.overview),
        technology: rt(p.technology),
        currentState: rt(p.currentState),
      },
    })
  }

  await payload.update({
    collection: 'projects',
    id: doc.id,
    overrideAccess: true,
    data: {
      status: ['live'],
      visual: 'scan',
      hue: 125,
      order,
      featured: true,
      externalUrl: 'https://splatoo.com/',
      disciplines: ['Gaussian splatting', 'Unreal Engine', 'Wayfinding', 'Web'],
      writtenLocales: [...FULL_LOCALES],
      _status: 'published',
    },
  })

  console.log(`  ✓ ${SLUG}  order=${order}`)
  console.log('\n[splatoo] Done. Run "npm run snapshot:fallback" next.')
  process.exit(0)
}

void main()
