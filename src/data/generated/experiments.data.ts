/* eslint-disable */
/**
 * ============================================================================
 * DO NOT EDIT MANUALLY
 * Generated from Payload canonical content by `npm run cms:snapshot-fallback`.
 *
 * This is the emergency fallback used when the CMS is unreachable at build
 * time. Editing it by hand creates a second database that will silently drift
 * from Payload. Change content in the Payload admin and regenerate.
 * ============================================================================
 */

import type { Experiment } from '../experiments';

export const experimentsData: Experiment[] = [
  {
    id: "ai-unreal",
    slug: "ai-controlling-unreal",
    title: {
      en: "Can AI control Unreal Engine?",
      cs: "Dokáže AI ovládat Unreal Engine?",
      sk: "Dokáže AI ovládať Unreal Engine?",
      es: "¿Puede la IA controlar Unreal Engine?",
      sr: "Da li AI može da upravlja Unreal Engine-om?",
      tr: "Yapay zekâ Unreal Engine’i yönetebilir mi?"
    },
    state: "in-progress",
    tag: "AI × 3D",
    question: {
      en: "Can a language model operate a 3D editor rather than describe one?",
      cs: "Dokáže jazykový model 3D editor ovládat, ne jen popisovat?",
      sk: "Dokáže jazykový model 3D editor ovládať, nie len opisovať?"
    },
    shortNote: {
      en: "The gap between describing a scene and changing one.",
      cs: "Rozdíl mezi popsat scénu a změnit ji.",
      sk: "Rozdiel medzi opísať scénu a zmeniť ju."
    },
    whatITried: [
      {
        en: "Exposed editor operations to an agent as explicit, inspectable commands instead of free-form text, and gave it a way to read the scene back after acting.",
        cs: "Zpřístupnil jsem agentovi operace editoru jako explicitní, kontrolovatelné příkazy místo volného textu a dal mu možnost si po akci přečíst stav scény.",
        sk: "Sprístupnil som agentovi operácie editora ako explicitné, kontrolovateľné príkazy namiesto voľného textu a dal mu možnosť si po akcii prečítať stav scény."
      }
    ],
    whatHappened: [
      {
        en: "Fluency was never the problem. The model could explain any workflow and still fail to leave a trace inside the editor.",
        cs: "Problém nikdy nebyl v plynulosti. Model uměl vysvětlit jakýkoli postup a stejně po sobě v editoru nenechal stopu.",
        sk: "Problém nikdy nebol v plynulosti. Model vedel vysvetliť akýkoľvek postup a aj tak po sebe v editore nenechal stopu."
      },
      {
        en: "Once actions returned observable state, the failures became specific and therefore fixable: wrong target, wrong transform, wrong assumption about what was selected.",
        cs: "Jakmile akce začaly vracet pozorovatelný stav, selhání se stala konkrétními, a tím opravitelnými: špatný cíl, špatná transformace, špatný předpoklad o tom, co je vybrané.",
        sk: "Len čo akcie začali vracať pozorovateľný stav, zlyhania sa stali konkrétnymi, a tým opraviteľnými: zlý cieľ, zlá transformácia, zlý predpoklad o tom, čo je vybrané."
      }
    ],
    nextQuestion: [
      {
        en: "How much scene state does an agent need to see before its spatial decisions stop being guesses?",
        cs: "Kolik stavu scény musí agent vidět, aby jeho prostorová rozhodnutí přestala být hádáním?",
        sk: "Koľko stavu scény musí agent vidieť, aby jeho priestorové rozhodnutia prestali byť hádaním?"
      }
    ],
    relatedProjectSlug: "moodpack-director"
  },
  {
    id: "duolingo-drawing",
    slug: "drawing-as-daily-habit",
    title: {
      en: "What if learning to draw worked like Duolingo?",
      cs: "Co kdyby se kreslení učilo jako v Duolingu?",
      sk: "Čo ak by sa kreslenie učilo ako v Duolingu?",
      es: "¿Y si aprender a dibujar funcionara como Duolingo?",
      sr: "Šta ako bi učenje crtanja funkcionisalo kao Duolingo?",
      tr: "Ya çizim öğrenmek Duolingo gibi işleseydi?"
    },
    state: "in-progress",
    tag: "Education",
    question: {
      en: "What keeps someone drawing on day thirty?",
      cs: "Co udrží člověka u kreslení třicátý den?",
      sk: "Čo udrží človeka pri kreslení tridsiaty deň?"
    },
    shortNote: {
      en: "Motivation is the constraint, not instruction.",
      cs: "Limitem je motivace, ne výklad.",
      sk: "Limitom je motivácia, nie výklad."
    },
    whatITried: [
      {
        en: "Designed the unit of practice as a single day rather than a lesson: one prompt, one drawing on paper, one photograph, one visible mark that it happened.",
        cs: "Navrhl jsem jednotku praxe jako jeden den, ne jako lekci: jedno zadání, jedna kresba na papíře, jedna fotka, jedna viditelná stopa, že se to stalo.",
        sk: "Navrhol som jednotku praxe ako jeden deň, nie ako lekciu: jedno zadanie, jedna kresba na papieri, jedna fotka, jedna viditeľná stopa, že sa to stalo."
      }
    ],
    whatHappened: [
      {
        en: "Framing progress as an accumulating body of work reads very differently from framing it as a completion percentage. One says \"look what exists now\", the other says \"you are not finished\".",
        cs: "Ukazovat pokrok jako rostoucí soubor práce působí úplně jinak než procento dokončení. První říká „podívej, co teď existuje\", druhé „ještě nejsi hotový\".",
        sk: "Ukazovať pokrok ako rastúci súbor práce pôsobí úplne inak než percento dokončenia. Prvé hovorí „pozri, čo teraz existuje\", druhé „ešte nie si hotový\"."
      },
      {
        en: "Numeric scoring kept surfacing as the obvious mechanic and kept being wrong for beginners, who are supposed to draw badly for a while.",
        cs: "Číselné hodnocení se pořád nabízelo jako samozřejmá mechanika a pořád bylo špatně pro začátečníky, kteří mají chvíli kreslit špatně.",
        sk: "Číselné hodnotenie sa stále ponúkalo ako samozrejmá mechanika a stále bolo zlé pre začiatočníkov, ktorí majú chvíľu kresliť zle."
      }
    ],
    nextQuestion: [
      {
        en: "Can encouragement be specific enough to be useful without becoming grading?",
        cs: "Dokáže být povzbuzení dost konkrétní na to, aby bylo užitečné, a přitom se nestalo známkováním?",
        sk: "Dokáže byť povzbudenie dosť konkrétne na to, aby bolo užitočné, a pritom sa nestalo známkovaním?"
      }
    ]
  },
  {
    id: "navigable-space",
    slug: "navigable-space",
    title: {
      en: "Can physical spaces become navigable digital worlds?",
      cs: "Můžou se fyzické prostory stát průchozími digitálními světy?",
      sk: "Môžu sa fyzické priestory stať prechodnými digitálnymi svetmi?",
      es: "¿Pueden los espacios físicos convertirse en mundos digitales navegables?",
      sr: "Mogu li fizički prostori postati prohodni digitalni svetovi?",
      tr: "Fiziksel mekânlar gezilebilir dijital dünyalara dönüşebilir mi?"
    },
    state: "open-question",
    tag: "Spatial",
    question: {
      en: "When does a scan stop being a record and start being a place?",
      cs: "Kdy sken přestane být záznamem a začne být místem?",
      sk: "Kedy sken prestane byť záznamom a začne byť miestom?"
    },
    shortNote: {
      en: "An open question, not a finding.",
      cs: "Otevřená otázka, ne zjištění.",
      sk: "Otvorená otázka, nie zistenie."
    },
    whatHappened: [
      {
        en: "Reconstruction accuracy and the feeling of being somewhere turn out to be only loosely related. A geometrically faithful scan can still read as an object you are looking at rather than a room you are in.",
        cs: "Přesnost rekonstrukce a pocit „být někde\" spolu souvisejí jen volně. Geometricky věrný sken může pořád působit jako objekt, na který se díváš, ne jako místnost, ve které jsi.",
        sk: "Presnosť rekonštrukcie a pocit „byť niekde\" spolu súvisia len voľne. Geometricky verný sken môže stále pôsobiť ako objekt, na ktorý sa pozeráš, nie ako miestnosť, v ktorej si."
      }
    ],
    nextQuestion: [
      {
        en: "What has to be added to a reconstruction — movement, scale cues, sound, framing — before it stops being a model and starts being a space?",
        cs: "Co se musí k rekonstrukci přidat — pohyb, měřítko, zvuk, rámování — aby přestala být modelem a začala být prostorem?",
        sk: "Čo sa musí k rekonštrukcii pridať — pohyb, mierka, zvuk, rámovanie — aby prestala byť modelom a začala byť priestorom?"
      }
    ]
  },
  {
    id: "generated-product",
    slug: "generated-product-pipelines",
    title: {
      en: "Can AI generate an entire commercial digital product workflow?",
      cs: "Zvládne AI vygenerovat celý komerční workflow digitálního produktu?",
      sk: "Zvládne AI vygenerovať celý komerčný workflow digitálneho produktu?",
      es: "¿Puede la IA generar todo el flujo de un producto digital comercial?",
      sr: "Može li AI da generiše ceo komercijalni tok digitalnog proizvoda?",
      tr: "Yapay zekâ ticari bir dijital ürünün tüm iş akışını üretebilir mi?"
    },
    state: "in-progress",
    tag: "Automation",
    question: {
      en: "Can a generated product be verified rather than just inspected by eye?",
      cs: "Dá se vygenerovaný produkt ověřit, ne jen prohlédnout okem?",
      sk: "Dá sa vygenerovaný produkt overiť, nie len prezrieť okom?"
    },
    shortNote: {
      en: "Generation is cheap; verification is the work.",
      cs: "Generování je levné; práce je v ověřování.",
      sk: "Generovanie je lacné; práca je v overovaní."
    },
    whatITried: [
      {
        en: "Put automated gates after generation — format checks, export validation, and a manifest recording inputs, pipeline version and outputs.",
        cs: "Zařadil jsem za generování automatické brány — kontroly formátu, validaci exportu a manifest se záznamem vstupů, verze pipeline a výstupů.",
        sk: "Zaradil som za generovanie automatické brány — kontroly formátu, validáciu exportu a manifest so záznamom vstupov, verzie pipeline a výstupov."
      }
    ],
    whatHappened: [
      {
        en: "The generative step stopped being the interesting part almost immediately. Export correctness and reproducibility consumed the real effort.",
        cs: "Generativní krok přestal být tou zajímavou částí skoro okamžitě. Skutečné úsilí spolkla správnost exportu a reprodukovatelnost.",
        sk: "Generatívny krok prestal byť tou zaujímavou časťou takmer okamžite. Skutočné úsilie pohltila správnosť exportu a reprodukovateľnosť."
      },
      {
        en: "A pipeline where nothing ever fails a check turned out to be a warning sign rather than a success: it meant the checks were not testing anything.",
        cs: "Pipeline, ve které nikdy nic neprojde kontrolou negativně, se ukázala spíš jako varování než jako úspěch: znamenalo to, že kontroly nic netestují.",
        sk: "Pipeline, v ktorej nikdy nič neprejde kontrolou negatívne, sa ukázala skôr ako varovanie než ako úspech: znamenalo to, že kontroly nič netestujú."
      }
    ],
    nextQuestion: [
      {
        en: "Which failures can only be caught by a person, and how should the pipeline route those rather than pretend to decide them?",
        cs: "Které chyby dokáže zachytit jen člověk a jak je má pipeline předat dál, místo aby předstírala, že o nich rozhoduje?",
        sk: "Ktoré chyby dokáže zachytiť len človek a ako ich má pipeline posunúť ďalej, namiesto toho, aby predstierala, že o nich rozhoduje?"
      }
    ]
  },
  {
    id: "ai-phone",
    slug: "can-ai-answer-my-phone",
    title: {
      en: "Can an AI answer my phone?",
      cs: "Může mi AI zvedat telefon?",
      sk: "Môže mi AI dvíhať telefón?",
      es: "¿Puede una IA contestar mi teléfono?",
      sr: "Može li AI da se javlja na moj telefon?",
      tr: "Bir yapay zekâ telefonuma cevap verebilir mi?"
    },
    state: "open-question",
    tag: "Voice",
    question: {
      en: "Could an agent answer a phone call without making things worse?",
      cs: "Mohl by agent zvednout telefon, aniž by to zhoršil?",
      sk: "Mohol by agent zdvihnúť telefón bez toho, aby to zhoršil?"
    },
    shortNote: {
      en: "Still an open question.",
      cs: "Zatím otevřená otázka.",
      sk: "Zatiaľ otvorená otázka."
    },
    nextQuestion: [
      {
        en: "A call is real-time, unstructured and unforgiving: there is no draft state and no undo. What would an agent have to get right before answering is better than not answering?",
        cs: "Hovor je živý, nestrukturovaný a nemilosrdný: neexistuje rozpracovaný stav ani zpětné vzetí. Co všechno by musel agent zvládnout, aby bylo zvednutí lepší než nezvednutí?",
        sk: "Hovor je živý, neštruktúrovaný a nemilosrdný: neexistuje rozpracovaný stav ani vzatie späť. Čo všetko by musel agent zvládnuť, aby bolo zdvihnutie lepšie než nezdvihnutie?"
      }
    ]
  },
  {
    id: "lidar-photogrammetry",
    slug: "lidar-and-photogrammetry",
    title: {
      en: "Experiments with LiDAR and photogrammetry",
      cs: "Experimenty s LiDARem a fotogrammetrií",
      sk: "Experimenty s LiDARom a fotogrametriou",
      es: "Experimentos con LiDAR y fotogrametría",
      sr: "Eksperimenti sa LiDAR-om i fotogrametrijom",
      tr: "LiDAR ve fotogrametri denemeleri"
    },
    state: "ongoing",
    tag: "Capture",
    question: {
      en: "How much of the final result is decided at capture time?",
      cs: "Kolik z výsledku se rozhodne už při sběru dat?",
      sk: "Koľko z výsledku sa rozhodne už pri zbere dát?"
    },
    shortNote: {
      en: "Ongoing capture tests.",
      cs: "Průběžné testy sběru.",
      sk: "Priebežné testy zberu."
    },
    whatITried: [
      {
        en: "Repeated capture of the same kinds of subject under different conditions — coverage, overlap, lighting, access — and compared what survived reconstruction.",
        cs: "Opakovaný sběr stejných typů objektů za různých podmínek — pokrytí, překryv, světlo, přístup — a porovnání, co přežije rekonstrukci.",
        sk: "Opakovaný zber rovnakých typov objektov za rôznych podmienok — pokrytie, prekryv, svetlo, prístup — a porovnanie, čo prežije rekonštrukciu."
      }
    ],
    whatHappened: [
      {
        en: "Almost everything is decided at capture. A thorough, unglamorous pass reconstructs better than any amount of downstream cleanup applied to a rushed one.",
        cs: "Rozhodne se skoro všechno už při sběru. Důkladný, nezáživný průchod se rekonstruuje líp než jakékoli následné čištění uspěchaného.",
        sk: "Rozhodne sa takmer všetko už pri zbere. Dôkladný, nezáživný prechod sa rekonštruuje lepšie než akékoľvek následné čistenie uponáhľaného."
      },
      {
        en: "Reflective, featureless and very fine detail remain the reliable failure cases.",
        cs: "Spolehlivými případy selhání zůstávají lesklé povrchy, plochy bez struktury a velmi jemné detaily.",
        sk: "Spoľahlivými prípadmi zlyhania zostávajú lesklé povrchy, plochy bez štruktúry a veľmi jemné detaily."
      }
    ],
    nextQuestion: [
      {
        en: "Where is the point of diminishing returns — when does more capture stop improving the reconstruction?",
        cs: "Kde je bod klesajících výnosů — kdy další sběr přestane rekonstrukci zlepšovat?",
        sk: "Kde je bod klesajúcich výnosov — kedy ďalší zber prestane rekonštrukciu zlepšovať?"
      }
    ]
  },
  {
    id: "voice-agents",
    slug: "voice-agents",
    title: {
      en: "Voice agents",
      cs: "Hlasoví agenti",
      sk: "Hlasoví agenti",
      es: "Agentes de voz",
      sr: "Glasovni agenti",
      tr: "Sesli ajanlar"
    },
    state: "ongoing",
    tag: "Agents",
    question: {
      en: "What changes when an agent has to answer immediately?",
      cs: "Co se změní, když musí agent odpovědět okamžitě?",
      sk: "Čo sa zmení, keď musí agent odpovedať okamžite?"
    },
    shortNote: {
      en: "Ongoing.",
      cs: "Průběžně.",
      sk: "Priebežne."
    },
    whatHappened: [
      {
        en: "Latency stops being a performance metric and becomes part of the conversation. A pause that is fine in text reads as hesitation or a dropped line in speech.",
        cs: "Latence přestane být výkonnostní metrikou a stane se součástí konverzace. Pauza, která je v textu v pořádku, působí v řeči jako zaváhání nebo spadlé spojení.",
        sk: "Latencia prestane byť výkonnostnou metrikou a stane sa súčasťou konverzácie. Pauza, ktorá je v texte v poriadku, pôsobí v reči ako zaváhanie alebo spadnuté spojenie."
      }
    ],
    nextQuestion: [
      {
        en: "How should a voice agent signal that it is still thinking, without filling silence with noise?",
        cs: "Jak má hlasový agent dát najevo, že ještě přemýšlí, aniž by ticho zaplnil šumem?",
        sk: "Ako má hlasový agent dať najavo, že ešte premýšľa, bez toho, aby ticho zaplnil šumom?"
      }
    ]
  },
  {
    id: "spatial-computing",
    slug: "spatial-computing",
    title: {
      en: "Spatial computing experiments",
      cs: "Experimenty se spatial computingem",
      sk: "Experimenty so spatial computingom",
      es: "Experimentos de computación espacial",
      sr: "Eksperimenti sa prostornim računarstvom",
      tr: "Mekânsal bilişim denemeleri"
    },
    state: "ongoing",
    tag: "Spatial",
    question: {
      en: "What does an interface become when it has room instead of a rectangle?",
      cs: "Čím se stane rozhraní, když má prostor místo obdélníku?",
      sk: "Čím sa stane rozhranie, keď má priestor namiesto obdĺžnika?"
    },
    shortNote: {
      en: "Ongoing.",
      cs: "Průběžně.",
      sk: "Priebežne."
    },
    whatHappened: [
      {
        en: "Habits from flat interfaces transfer badly. Layouts that depend on a fixed frame and a known viewing distance lose their meaning once the viewer can walk around them.",
        cs: "Návyky z plochých rozhraní se přenášejí špatně. Rozvržení, která stojí na pevném rámu a známé vzdálenosti pohledu, ztrácejí smysl, jakmile se kolem nich dá obejít.",
        sk: "Návyky z plochých rozhraní sa prenášajú zle. Rozloženia, ktoré stoja na pevnom ráme a známej vzdialenosti pohľadu, strácajú zmysel, len čo sa okolo nich dá obísť."
      }
    ],
    nextQuestion: [
      {
        en: "Which parts of an interface genuinely benefit from space, and which are just a flat design floating in it?",
        cs: "Které části rozhraní z prostoru skutečně těží a které jsou jen plochý návrh, který se v něm vznáší?",
        sk: "Ktoré časti rozhrania z priestoru skutočne ťažia a ktoré sú len plochý návrh, ktorý sa v ňom vznáša?"
      }
    ]
  },
  {
    id: "art-learning",
    slug: "art-learning",
    title: "Art Learning",
    state: "in-progress",
    tag: "Learning design",
    question: {
      en: "What if learning to draw felt more like building a daily habit than completing a course?",
      cs: "Co kdyby se kreslení učilo spíš jako každodenní návyk než jako kurz?",
      sk: "Čo ak by sa kreslenie učilo skôr ako každodenný návyk než ako kurz?"
    },
    shortNote: {
      en: "A mobile app concept built around returning tomorrow.",
      cs: "Koncept mobilní aplikace postavený na tom, že se člověk vrátí zítra.",
      sk: "Koncept mobilnej aplikácie postavený na tom, že sa človek vráti zajtra."
    },
    whatITried: [
      {
        en: "Designed the unit of practice as one day rather than one lesson: a short prompt, a drawing on paper, a photograph of it, and a visible mark that it happened.",
        cs: "Navrhl jsem jednotku praxe jako jeden den, ne jednu lekci: krátké zadání, kresba na papíře, fotka a viditelná stopa, že se to stalo.",
        sk: "Navrhol som jednotku praxe ako jeden deň, nie jednu lekciu: krátke zadanie, kresba na papieri, fotka a viditeľná stopa, že sa to stalo."
      },
      {
        en: "Framed progress as an accumulating body of work — a gallery that fills up — instead of a completion percentage.",
        cs: "Pokrok jsem pojal jako rostoucí soubor práce — galerii, která se zaplňuje — místo procenta dokončení.",
        sk: "Pokrok som poňal ako rastúci súbor práce — galériu, ktorá sa zapĺňa — namiesto percenta dokončenia."
      }
    ],
    whatHappened: [
      {
        en: "The learning design got further than the implementation, and the two never caught up with each other.",
        cs: "Návrh učení se dostal dál než implementace a ty dvě věci se už nedohnaly.",
        sk: "Návrh učenia sa dostal ďalej než implementácia a tie dve veci sa už nedobehli."
      },
      {
        en: "Numeric scoring kept presenting itself as the obvious mechanic and kept being wrong for beginners, who are supposed to draw badly for a while.",
        cs: "Číselné hodnocení se pořád nabízelo jako samozřejmá mechanika a pořád bylo špatně pro začátečníky, kteří mají chvíli kreslit špatně.",
        sk: "Číselné hodnotenie sa stále ponúkalo ako samozrejmá mechanika a stále bolo zlé pre začiatočníkov, ktorí majú chvíľu kresliť zle."
      }
    ],
    nextQuestion: [
      {
        en: "Can encouragement be specific enough to be useful without turning into grading?",
        cs: "Dokáže být povzbuzení dost konkrétní na to, aby bylo užitečné, a přitom se nestalo známkováním?",
        sk: "Dokáže byť povzbudenie dosť konkrétne na to, aby bolo užitočné, a pritom sa nestalo známkovaním?"
      }
    ]
  },
  {
    id: "digital-space",
    slug: "digital-space",
    title: "Digital Space / Heritage",
    state: "ongoing",
    tag: "3D capture",
    question: {
      en: "How can a physical place become a digital environment rather than just a collection of photographs?",
      cs: "Jak se z fyzického místa stane digitální prostředí, a ne jen sbírka fotografií?",
      sk: "Ako sa z fyzického miesta stane digitálne prostredie, a nie len zbierka fotografií?"
    },
    shortNote: {
      en: "Capturing real places as geometry instead of pictures.",
      cs: "Zachycovat reálná místa jako geometrii místo obrázků.",
      sk: "Zachytávať reálne miesta ako geometriu namiesto obrázkov."
    },
    whatITried: [
      {
        en: "Photogrammetry, LiDAR and drone capture of real buildings and objects, run through reconstruction into point clouds and meshes — a record with dimensions rather than a record with framing.",
        cs: "Fotogrammetrie, LiDAR a snímkování z dronu na reálných budovách a objektech, převedené rekonstrukcí na mračna bodů a meshe — záznam s rozměry místo záznamu s kompozicí.",
        sk: "Fotogrametria, LiDAR a snímkovanie z dronu na reálnych budovách a objektoch, prevedené rekonštrukciou na mračná bodov a meshe — záznam s rozmermi namiesto záznamu s kompozíciou."
      }
    ],
    whatHappened: [
      {
        en: "Almost all of the risk sits in the capture. A generous, boring, systematic pass reconstructs better than any amount of cleanup applied to a rushed one.",
        cs: "Skoro celé riziko nese fáze sběru. Velkorysý, nudný a systematický průchod se rekonstruuje líp než jakékoli čištění uspěchaného.",
        sk: "Takmer celé riziko nesie fáza zberu. Veľkorysý, nudný a systematický prechod sa rekonštruuje lepšie než akékoľvek čistenie uponáhľaného."
      },
      {
        en: "Scanning a place turned out not to be the same as interpreting it. The geometry is only the material; deciding what a visitor should notice is a separate act.",
        cs: "Naskenovat místo se ukázalo být něco jiného než ho vyložit. Geometrie je jen materiál; rozhodnout, čeho si má návštěvník všimnout, je samostatný úkon.",
        sk: "Naskenovať miesto sa ukázalo byť niečím iným než ho vyložiť. Geometria je len materiál; rozhodnúť, čoho si má návštevník všimnúť, je samostatný úkon."
      }
    ],
    nextQuestion: [
      {
        en: "What has to be added to a reconstruction before it stops being a model and starts being a space?",
        cs: "Co se musí k rekonstrukci přidat, aby přestala být modelem a začala být prostorem?",
        sk: "Čo sa musí k rekonštrukcii pridať, aby prestala byť modelom a začala byť priestorom?"
      }
    ]
  },
  {
    id: "ai-commerce-engine",
    slug: "ai-commerce-engine",
    title: "AI Commerce Engine",
    state: "in-progress",
    tag: "Systems",
    question: {
      en: "How much of a digital-product workflow can be made systematic, reproducible and automatically testable?",
      cs: "Kolik z workflow digitálního produktu se dá udělat systematicky, opakovatelně a automaticky testovatelně?",
      sk: "Koľko z workflow digitálneho produktu sa dá urobiť systematicky, opakovateľne a automaticky testovateľne?"
    },
    shortNote: {
      en: "Treating a generated product like a build artifact.",
      cs: "Brát vygenerovaný produkt jako build artefakt.",
      sk: "Brať vygenerovaný produkt ako build artefakt."
    },
    whatITried: [
      {
        en: "Put the whole thing behind gates: generation, then export into multiple formats, then automated quality checks, then a manifest recording which inputs and which pipeline version produced which outputs.",
        cs: "Postavil jsem za to celé kontrolní brány: generování, pak export do více formátů, pak automatické kontroly kvality a nakonec manifest se záznamem, jaké vstupy a jaká verze pipeline vyrobily jaké výstupy.",
        sk: "Postavil som za to celé kontrolné brány: generovanie, potom export do viacerých formátov, potom automatické kontroly kvality a napokon manifest so záznamom, aké vstupy a aká verzia pipeline vyrobili aké výstupy."
      }
    ],
    whatHappened: [
      {
        en: "The generative step turned out to be the least difficult part. Export correctness, validation and reproducibility took the real work.",
        cs: "Generativní krok se ukázal jako ten nejmenší problém. Skutečnou práci spolkla správnost exportu, validace a reprodukovatelnost.",
        sk: "Generatívny krok sa ukázal ako ten najmenší problém. Skutočnú prácu pohltila správnosť exportu, validácia a reprodukovateľnosť."
      },
      {
        en: "A pipeline where nothing ever fails a check turned out to be a warning sign rather than a success: it meant the checks were not testing anything.",
        cs: "Pipeline, ve které nikdy nic neprojde kontrolou negativně, se ukázala spíš jako varování než jako úspěch: znamenalo to, že kontroly nic netestují.",
        sk: "Pipeline, v ktorej nikdy nič neprejde kontrolou negatívne, sa ukázala skôr ako varovanie než ako úspech: znamenalo to, že kontroly nič netestujú."
      }
    ],
    nextQuestion: [
      {
        en: "Which failures can only be caught by a person, and how should the pipeline route those rather than pretend to decide them?",
        cs: "Které chyby dokáže zachytit jen člověk a jak je má pipeline předat dál, místo aby předstírala, že o nich rozhoduje?",
        sk: "Ktoré chyby dokáže zachytiť len človek a ako ich má pipeline posunúť ďalej, namiesto toho, aby predstierala, že o nich rozhoduje?"
      }
    ]
  }
];
