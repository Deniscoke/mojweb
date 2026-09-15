/**
 * LAB CONTENT — the eight experiments.
 *
 * A lab note is shorter and rougher than a case study and is allowed to end
 * without an answer. Where an experiment genuinely has no log yet, the fields
 * are left empty and the frontend keeps it as an index-only entry rather than
 * generating a thin page.
 *
 * `relatedProject` is the canonical direction of the relationship. A project's
 * related experiments are derived from these values, never stored twice.
 * Where the link is not unambiguous it stays null.
 */

import type { FullLocale } from './lexical'

export interface ExperimentLog {
  shortNote?: string
  whatITried?: string[]
  whatHappened?: string[]
  nextQuestion?: string[]
}

export interface ExperimentContent {
  identifier: string
  slug: string
  /** Slug of the related project, or null when it genuinely stands alone. */
  relatedProject: string | null
  question: Record<FullLocale, string>
  log: Record<FullLocale, ExperimentLog>
}

export const experimentContent: ExperimentContent[] = [
  {
    identifier: 'ai-unreal',
    slug: 'ai-controlling-unreal',
    relatedProject: 'moodpack-director',
    question: {
      en: 'Can a language model operate a 3D editor rather than describe one?',
      cs: 'Dokáže jazykový model 3D editor ovládat, ne jen popisovat?',
      sk: 'Dokáže jazykový model 3D editor ovládať, nie len opisovať?',
    },
    log: {
      en: {
        shortNote: 'The gap between describing a scene and changing one.',
        whatITried: [
          'Exposed editor operations to an agent as explicit, inspectable commands instead of free-form text, and gave it a way to read the scene back after acting.',
        ],
        whatHappened: [
          'Fluency was never the problem. The model could explain any workflow and still fail to leave a trace inside the editor.',
          'Once actions returned observable state, the failures became specific and therefore fixable: wrong target, wrong transform, wrong assumption about what was selected.',
        ],
        nextQuestion: [
          'How much scene state does an agent need to see before its spatial decisions stop being guesses?',
        ],
      },
      cs: {
        shortNote: 'Rozdíl mezi popsat scénu a změnit ji.',
        whatITried: [
          'Zpřístupnil jsem agentovi operace editoru jako explicitní, kontrolovatelné příkazy místo volného textu a dal mu možnost si po akci přečíst stav scény.',
        ],
        whatHappened: [
          'Problém nikdy nebyl v plynulosti. Model uměl vysvětlit jakýkoli postup a stejně po sobě v editoru nenechal stopu.',
          'Jakmile akce začaly vracet pozorovatelný stav, selhání se stala konkrétními, a tím opravitelnými: špatný cíl, špatná transformace, špatný předpoklad o tom, co je vybrané.',
        ],
        nextQuestion: [
          'Kolik stavu scény musí agent vidět, aby jeho prostorová rozhodnutí přestala být hádáním?',
        ],
      },
      sk: {
        shortNote: 'Rozdiel medzi opísať scénu a zmeniť ju.',
        whatITried: [
          'Sprístupnil som agentovi operácie editora ako explicitné, kontrolovateľné príkazy namiesto voľného textu a dal mu možnosť si po akcii prečítať stav scény.',
        ],
        whatHappened: [
          'Problém nikdy nebol v plynulosti. Model vedel vysvetliť akýkoľvek postup a aj tak po sebe v editore nenechal stopu.',
          'Len čo akcie začali vracať pozorovateľný stav, zlyhania sa stali konkrétnymi, a tým opraviteľnými: zlý cieľ, zlá transformácia, zlý predpoklad o tom, čo je vybrané.',
        ],
        nextQuestion: [
          'Koľko stavu scény musí agent vidieť, aby jeho priestorové rozhodnutia prestali byť hádaním?',
        ],
      },
    },
  },
  {
    identifier: 'duolingo-drawing',
    slug: 'drawing-as-daily-habit',
    relatedProject: 'art-learning',
    question: {
      en: 'What keeps someone drawing on day thirty?',
      cs: 'Co udrží člověka u kreslení třicátý den?',
      sk: 'Čo udrží človeka pri kreslení tridsiaty deň?',
    },
    log: {
      en: {
        shortNote: 'Motivation is the constraint, not instruction.',
        whatITried: [
          'Designed the unit of practice as a single day rather than a lesson: one prompt, one drawing on paper, one photograph, one visible mark that it happened.',
        ],
        whatHappened: [
          'Framing progress as an accumulating body of work reads very differently from framing it as a completion percentage. One says "look what exists now", the other says "you are not finished".',
          'Numeric scoring kept surfacing as the obvious mechanic and kept being wrong for beginners, who are supposed to draw badly for a while.',
        ],
        nextQuestion: [
          'Can encouragement be specific enough to be useful without becoming grading?',
        ],
      },
      cs: {
        shortNote: 'Limitem je motivace, ne výklad.',
        whatITried: [
          'Navrhl jsem jednotku praxe jako jeden den, ne jako lekci: jedno zadání, jedna kresba na papíře, jedna fotka, jedna viditelná stopa, že se to stalo.',
        ],
        whatHappened: [
          'Ukazovat pokrok jako rostoucí soubor práce působí úplně jinak než procento dokončení. První říká „podívej, co teď existuje", druhé „ještě nejsi hotový".',
          'Číselné hodnocení se pořád nabízelo jako samozřejmá mechanika a pořád bylo špatně pro začátečníky, kteří mají chvíli kreslit špatně.',
        ],
        nextQuestion: [
          'Dokáže být povzbuzení dost konkrétní na to, aby bylo užitečné, a přitom se nestalo známkováním?',
        ],
      },
      sk: {
        shortNote: 'Limitom je motivácia, nie výklad.',
        whatITried: [
          'Navrhol som jednotku praxe ako jeden deň, nie ako lekciu: jedno zadanie, jedna kresba na papieri, jedna fotka, jedna viditeľná stopa, že sa to stalo.',
        ],
        whatHappened: [
          'Ukazovať pokrok ako rastúci súbor práce pôsobí úplne inak než percento dokončenia. Prvé hovorí „pozri, čo teraz existuje", druhé „ešte nie si hotový".',
          'Číselné hodnotenie sa stále ponúkalo ako samozrejmá mechanika a stále bolo zlé pre začiatočníkov, ktorí majú chvíľu kresliť zle.',
        ],
        nextQuestion: [
          'Dokáže byť povzbudenie dosť konkrétne na to, aby bolo užitočné, a pritom sa nestalo známkovaním?',
        ],
      },
    },
  },
  {
    identifier: 'navigable-space',
    slug: 'navigable-space',
    relatedProject: 'digital-space',
    question: {
      en: 'When does a scan stop being a record and start being a place?',
      cs: 'Kdy sken přestane být záznamem a začne být místem?',
      sk: 'Kedy sken prestane byť záznamom a začne byť miestom?',
    },
    log: {
      en: {
        shortNote: 'An open question, not a finding.',
        whatHappened: [
          'Reconstruction accuracy and the feeling of being somewhere turn out to be only loosely related. A geometrically faithful scan can still read as an object you are looking at rather than a room you are in.',
        ],
        nextQuestion: [
          'What has to be added to a reconstruction — movement, scale cues, sound, framing — before it stops being a model and starts being a space?',
        ],
      },
      cs: {
        shortNote: 'Otevřená otázka, ne zjištění.',
        whatHappened: [
          'Přesnost rekonstrukce a pocit „být někde" spolu souvisejí jen volně. Geometricky věrný sken může pořád působit jako objekt, na který se díváš, ne jako místnost, ve které jsi.',
        ],
        nextQuestion: [
          'Co se musí k rekonstrukci přidat — pohyb, měřítko, zvuk, rámování — aby přestala být modelem a začala být prostorem?',
        ],
      },
      sk: {
        shortNote: 'Otvorená otázka, nie zistenie.',
        whatHappened: [
          'Presnosť rekonštrukcie a pocit „byť niekde" spolu súvisia len voľne. Geometricky verný sken môže stále pôsobiť ako objekt, na ktorý sa pozeráš, nie ako miestnosť, v ktorej si.',
        ],
        nextQuestion: [
          'Čo sa musí k rekonštrukcii pridať — pohyb, mierka, zvuk, rámovanie — aby prestala byť modelom a začala byť priestorom?',
        ],
      },
    },
  },
  {
    identifier: 'generated-product',
    slug: 'generated-product-pipelines',
    relatedProject: 'ai-commerce-engine',
    question: {
      en: 'Can a generated product be verified rather than just inspected by eye?',
      cs: 'Dá se vygenerovaný produkt ověřit, ne jen prohlédnout okem?',
      sk: 'Dá sa vygenerovaný produkt overiť, nie len prezrieť okom?',
    },
    log: {
      en: {
        shortNote: 'Generation is cheap; verification is the work.',
        whatITried: [
          'Put automated gates after generation — format checks, export validation, and a manifest recording inputs, pipeline version and outputs.',
        ],
        whatHappened: [
          'The generative step stopped being the interesting part almost immediately. Export correctness and reproducibility consumed the real effort.',
          'A pipeline where nothing ever fails a check turned out to be a warning sign rather than a success: it meant the checks were not testing anything.',
        ],
        nextQuestion: [
          'Which failures can only be caught by a person, and how should the pipeline route those rather than pretend to decide them?',
        ],
      },
      cs: {
        shortNote: 'Generování je levné; práce je v ověřování.',
        whatITried: [
          'Zařadil jsem za generování automatické brány — kontroly formátu, validaci exportu a manifest se záznamem vstupů, verze pipeline a výstupů.',
        ],
        whatHappened: [
          'Generativní krok přestal být tou zajímavou částí skoro okamžitě. Skutečné úsilí spolkla správnost exportu a reprodukovatelnost.',
          'Pipeline, ve které nikdy nic neprojde kontrolou negativně, se ukázala spíš jako varování než jako úspěch: znamenalo to, že kontroly nic netestují.',
        ],
        nextQuestion: [
          'Které chyby dokáže zachytit jen člověk a jak je má pipeline předat dál, místo aby předstírala, že o nich rozhoduje?',
        ],
      },
      sk: {
        shortNote: 'Generovanie je lacné; práca je v overovaní.',
        whatITried: [
          'Zaradil som za generovanie automatické brány — kontroly formátu, validáciu exportu a manifest so záznamom vstupov, verzie pipeline a výstupov.',
        ],
        whatHappened: [
          'Generatívny krok prestal byť tou zaujímavou časťou takmer okamžite. Skutočné úsilie pohltila správnosť exportu a reprodukovateľnosť.',
          'Pipeline, v ktorej nikdy nič neprejde kontrolou negatívne, sa ukázala skôr ako varovanie než ako úspech: znamenalo to, že kontroly nič netestujú.',
        ],
        nextQuestion: [
          'Ktoré chyby dokáže zachytiť len človek a ako ich má pipeline posunúť ďalej, namiesto toho, aby predstierala, že o nich rozhoduje?',
        ],
      },
    },
  },
  {
    identifier: 'ai-phone',
    slug: 'can-ai-answer-my-phone',
    relatedProject: null,
    question: {
      en: 'Could an agent answer a phone call without making things worse?',
      cs: 'Mohl by agent zvednout telefon, aniž by to zhoršil?',
      sk: 'Mohol by agent zdvihnúť telefón bez toho, aby to zhoršil?',
    },
    log: {
      en: {
        shortNote: 'Still an open question.',
        nextQuestion: [
          'A call is real-time, unstructured and unforgiving: there is no draft state and no undo. What would an agent have to get right before answering is better than not answering?',
        ],
      },
      cs: {
        shortNote: 'Zatím otevřená otázka.',
        nextQuestion: [
          'Hovor je živý, nestrukturovaný a nemilosrdný: neexistuje rozpracovaný stav ani zpětné vzetí. Co všechno by musel agent zvládnout, aby bylo zvednutí lepší než nezvednutí?',
        ],
      },
      sk: {
        shortNote: 'Zatiaľ otvorená otázka.',
        nextQuestion: [
          'Hovor je živý, neštruktúrovaný a nemilosrdný: neexistuje rozpracovaný stav ani vzatie späť. Čo všetko by musel agent zvládnuť, aby bolo zdvihnutie lepšie než nezdvihnutie?',
        ],
      },
    },
  },
  {
    identifier: 'lidar-photogrammetry',
    slug: 'lidar-and-photogrammetry',
    relatedProject: 'digital-space',
    question: {
      en: 'How much of the final result is decided at capture time?',
      cs: 'Kolik z výsledku se rozhodne už při sběru dat?',
      sk: 'Koľko z výsledku sa rozhodne už pri zbere dát?',
    },
    log: {
      en: {
        shortNote: 'Ongoing capture tests.',
        whatITried: [
          'Repeated capture of the same kinds of subject under different conditions — coverage, overlap, lighting, access — and compared what survived reconstruction.',
        ],
        whatHappened: [
          'Almost everything is decided at capture. A thorough, unglamorous pass reconstructs better than any amount of downstream cleanup applied to a rushed one.',
          'Reflective, featureless and very fine detail remain the reliable failure cases.',
        ],
        nextQuestion: [
          'Where is the point of diminishing returns — when does more capture stop improving the reconstruction?',
        ],
      },
      cs: {
        shortNote: 'Průběžné testy sběru.',
        whatITried: [
          'Opakovaný sběr stejných typů objektů za různých podmínek — pokrytí, překryv, světlo, přístup — a porovnání, co přežije rekonstrukci.',
        ],
        whatHappened: [
          'Rozhodne se skoro všechno už při sběru. Důkladný, nezáživný průchod se rekonstruuje líp než jakékoli následné čištění uspěchaného.',
          'Spolehlivými případy selhání zůstávají lesklé povrchy, plochy bez struktury a velmi jemné detaily.',
        ],
        nextQuestion: [
          'Kde je bod klesajících výnosů — kdy další sběr přestane rekonstrukci zlepšovat?',
        ],
      },
      sk: {
        shortNote: 'Priebežné testy zberu.',
        whatITried: [
          'Opakovaný zber rovnakých typov objektov za rôznych podmienok — pokrytie, prekryv, svetlo, prístup — a porovnanie, čo prežije rekonštrukciu.',
        ],
        whatHappened: [
          'Rozhodne sa takmer všetko už pri zbere. Dôkladný, nezáživný prechod sa rekonštruuje lepšie než akékoľvek následné čistenie uponáhľaného.',
          'Spoľahlivými prípadmi zlyhania zostávajú lesklé povrchy, plochy bez štruktúry a veľmi jemné detaily.',
        ],
        nextQuestion: [
          'Kde je bod klesajúcich výnosov — kedy ďalší zber prestane rekonštrukciu zlepšovať?',
        ],
      },
    },
  },
  {
    identifier: 'voice-agents',
    slug: 'voice-agents',
    relatedProject: null,
    question: {
      en: 'What changes when an agent has to answer immediately?',
      cs: 'Co se změní, když musí agent odpovědět okamžitě?',
      sk: 'Čo sa zmení, keď musí agent odpovedať okamžite?',
    },
    log: {
      en: {
        shortNote: 'Ongoing.',
        whatHappened: [
          'Latency stops being a performance metric and becomes part of the conversation. A pause that is fine in text reads as hesitation or a dropped line in speech.',
        ],
        nextQuestion: [
          'How should a voice agent signal that it is still thinking, without filling silence with noise?',
        ],
      },
      cs: {
        shortNote: 'Průběžně.',
        whatHappened: [
          'Latence přestane být výkonnostní metrikou a stane se součástí konverzace. Pauza, která je v textu v pořádku, působí v řeči jako zaváhání nebo spadlé spojení.',
        ],
        nextQuestion: [
          'Jak má hlasový agent dát najevo, že ještě přemýšlí, aniž by ticho zaplnil šumem?',
        ],
      },
      sk: {
        shortNote: 'Priebežne.',
        whatHappened: [
          'Latencia prestane byť výkonnostnou metrikou a stane sa súčasťou konverzácie. Pauza, ktorá je v texte v poriadku, pôsobí v reči ako zaváhanie alebo spadnuté spojenie.',
        ],
        nextQuestion: [
          'Ako má hlasový agent dať najavo, že ešte premýšľa, bez toho, aby ticho zaplnil šumom?',
        ],
      },
    },
  },
  {
    identifier: 'spatial-computing',
    slug: 'spatial-computing',
    relatedProject: null,
    question: {
      en: 'What does an interface become when it has room instead of a rectangle?',
      cs: 'Čím se stane rozhraní, když má prostor místo obdélníku?',
      sk: 'Čím sa stane rozhranie, keď má priestor namiesto obdĺžnika?',
    },
    log: {
      en: {
        shortNote: 'Ongoing.',
        whatHappened: [
          'Habits from flat interfaces transfer badly. Layouts that depend on a fixed frame and a known viewing distance lose their meaning once the viewer can walk around them.',
        ],
        nextQuestion: [
          'Which parts of an interface genuinely benefit from space, and which are just a flat design floating in it?',
        ],
      },
      cs: {
        shortNote: 'Průběžně.',
        whatHappened: [
          'Návyky z plochých rozhraní se přenášejí špatně. Rozvržení, která stojí na pevném rámu a známé vzdálenosti pohledu, ztrácejí smysl, jakmile se kolem nich dá obejít.',
        ],
        nextQuestion: [
          'Které části rozhraní z prostoru skutečně těží a které jsou jen plochý návrh, který se v něm vznáší?',
        ],
      },
      sk: {
        shortNote: 'Priebežne.',
        whatHappened: [
          'Návyky z plochých rozhraní sa prenášajú zle. Rozloženia, ktoré stoja na pevnom ráme a známej vzdialenosti pohľadu, strácajú zmysel, len čo sa okolo nich dá obísť.',
        ],
        nextQuestion: [
          'Ktoré časti rozhrania z priestoru skutočne ťažia a ktoré sú len plochý návrh, ktorý sa v ňom vznáša?',
        ],
      },
    },
  },
]
