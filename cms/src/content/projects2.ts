/**
 * PROJECT CONTENT, part two. Same rules as `projects.ts`: nothing invented.
 *
 * Digital Space in particular makes no claim that any institution
 * commissioned, funded or endorsed the work, because no such fact was given.
 */

import type { ProjectContent } from './lexical'

export const projectContent2: ProjectContent[] = [
  // ────────────────────────────────────────────────────────── ART LEARNING
  {
    slug: 'art-learning',
    title: 'Art Learning',
    disciplines: ['Education', 'Mobile', 'Learning Design', 'Gamification'],
    short: {
      en: {
        category: 'Education / Mobile / Gamification',
        shortDescription:
          'A mobile app concept for everyday drawing practice and visible artistic progress, built on habit rather than on a syllabus.',
        subtitle: 'Practice you come back to, not a course you finish.',
        question:
          'What if learning to draw felt more like building a daily habit than completing a course?',
      },
      cs: {
        category: 'Vzdělávání / Mobil / Gamifikace',
        shortDescription:
          'Koncept mobilní aplikace pro každodenní kreslení a viditelný posun, postavený na návyku místo na osnově.',
        subtitle: 'Praxe, ke které se vracíš, ne kurz, který dokončíš.',
        question: 'Co kdyby se kreslení učilo spíš jako každodenní návyk než jako kurz?',
      },
      sk: {
        category: 'Vzdelávanie / Mobil / Gamifikácia',
        shortDescription:
          'Koncept mobilnej aplikácie pre každodenné kreslenie a viditeľný posun, postavený na návyku namiesto osnovy.',
        subtitle: 'Prax, ku ktorej sa vraciaš, nie kurz, ktorý dokončíš.',
        question: 'Čo ak by sa kreslenie učilo skôr ako každodenný návyk než ako kurz?',
      },
      es: {
        category: 'Educación / Móvil / Gamificación',
        shortDescription:
          'Un concepto de app móvil para practicar dibujo a diario y ver el progreso, basado en el hábito y no en un temario.',
        subtitle: 'Una práctica a la que vuelves, no un curso que terminas.',
        question: '¿Y si aprender a dibujar se pareciera más a construir un hábito diario que a completar un curso?',
      },
      sr: {
        category: 'Obrazovanje / Mobilno / Gejmifikacija',
        shortDescription:
          'Koncept mobilne aplikacije za svakodnevno crtanje i vidljiv napredak, zasnovan na navici umesto na programu.',
        subtitle: 'Praksa kojoj se vraćaš, a ne kurs koji završiš.',
        question: 'Šta ako bi učenje crtanja više ličilo na građenje svakodnevne navike nego na završavanje kursa?',
      },
      tr: {
        category: 'Eğitim / Mobil / Oyunlaştırma',
        shortDescription:
          'Bir müfredat yerine alışkanlık üzerine kurulu, günlük çizim pratiği ve görünür ilerleme için bir mobil uygulama konsepti.',
        subtitle: 'Bitirdiğin bir kurs değil, geri döndüğün bir pratik.',
        question: 'Ya çizim öğrenmek bir kursu tamamlamaktan çok günlük bir alışkanlık kurmaya benzeseydi?',
      },
    },
    prose: {
      en: {
        overview: [
          'Art Learning is a mobile app concept for everyday drawing practice, built around coming back tomorrow rather than finishing a syllabus.',
        ],
        context: [
          'Most drawing instruction is structured as a course: a sequence with a beginning and an end. Most people who want to draw do not fail at the content — they stop showing up.',
          'Motivation, not information, is the binding constraint. That makes it a learning-design problem before it is an app problem.',
        ],
        idea: [
          'Treat the daily act of drawing as the unit, not the lesson. A short prompt, a drawing, a photograph of it, and visible evidence that you did it again.',
          'Progress is shown as accumulation — a body of work that grows — rather than as a completion percentage.',
        ],
        process: [
          'The core loop is deliberately small: prompt, draw on paper, photograph, keep the streak, watch the journey fill up.',
          'Photographing real paper matters. The practice happens off-screen; the app’s job is to hold the record, not to replace the pencil.',
          'Feedback and community validation are designed as encouragement rather than grading. Scoring a beginner’s drawing numerically is an efficient way to make them stop.',
        ],
        technology: [
          'A mobile client with prompt delivery, camera capture, streak and progression state, and a gallery that works as the learner’s own archive.',
        ],
        currentState: [
          'Prototype and in development. The learning design is further along than the implementation.',
        ],
        learning: [
          'Gamification is easy to add and easy to get wrong. Streaks reward returning; points reward performing. For a beginner who is supposed to draw badly at first, the first helps and the second does not.',
          'The "Duolingo for drawing" shorthand is useful in one sentence and misleading in five. Language has right answers; drawing practice mostly does not.',
        ],
      },
      cs: {
        overview: [
          'Art Learning je koncept mobilní aplikace pro každodenní kreslení, postavený na tom, že se člověk vrátí zítra — ne na dokončení osnovy.',
        ],
        context: [
          'Většina výuky kreslení je uspořádaná jako kurz: posloupnost se začátkem a koncem. Většina lidí, kteří chtějí kreslit, ale neselže na obsahu — přestanou chodit.',
          'Limitem je motivace, ne informace. Tím je to nejdřív problém návrhu učení a až potom problém aplikace.',
        ],
        idea: [
          'Brát jako jednotku každodenní akt kreslení, ne lekci. Krátké zadání, kresba, fotka, a viditelný důkaz, že se to stalo znovu.',
          'Pokrok se ukazuje jako hromadění — rostoucí soubor práce — ne jako procento dokončení.',
        ],
        process: [
          'Základní smyčka je záměrně malá: zadání, kresba na papír, fotka, udržení série, zaplňující se cesta.',
          'Fotit skutečný papír je podstatné. Praxe se děje mimo obrazovku; úkolem aplikace je držet záznam, ne nahradit tužku.',
          'Zpětná vazba a komunitní ocenění jsou navržené jako povzbuzení, ne jako známkování. Číselně hodnotit kresbu začátečníka je účinný způsob, jak ho odradit.',
        ],
        technology: [
          'Mobilní klient se zadáváním úkolů, fotoaparátem, stavem série a postupu a galerií, která funguje jako vlastní archiv toho, kdo se učí.',
        ],
        currentState: [
          'Prototyp ve vývoji. Návrh učení je dál než implementace.',
        ],
        learning: [
          'Gamifikaci je snadné přidat a snadné pokazit. Série odměňuje návrat, body odměňují výkon. U začátečníka, který má zpočátku kreslit špatně, pomáhá to první a škodí to druhé.',
          'Zkratka „Duolingo na kreslení" je užitečná v jedné větě a zavádějící v pěti. Jazyk má správné odpovědi, kreslení většinou ne.',
        ],
      },
      sk: {
        overview: [
          'Art Learning je koncept mobilnej aplikácie pre každodenné kreslenie, postavený na tom, že sa človek vráti zajtra — nie na dokončení osnovy.',
        ],
        context: [
          'Väčšina výučby kreslenia je usporiadaná ako kurz: postupnosť so začiatkom a koncom. Väčšina ľudí, ktorí chcú kresliť, však nezlyhá na obsahu — prestanú chodiť.',
          'Limitom je motivácia, nie informácia. Tým je to najprv problém návrhu učenia a až potom problém aplikácie.',
        ],
        idea: [
          'Brať ako jednotku každodenný akt kreslenia, nie lekciu. Krátke zadanie, kresba, fotka, a viditeľný dôkaz, že sa to stalo znova.',
          'Pokrok sa ukazuje ako hromadenie — rastúci súbor práce — nie ako percento dokončenia.',
        ],
        process: [
          'Základná slučka je zámerne malá: zadanie, kresba na papier, fotka, udržanie série, zapĺňajúca sa cesta.',
          'Fotiť skutočný papier je podstatné. Prax sa deje mimo obrazovky; úlohou aplikácie je držať záznam, nie nahradiť ceruzku.',
          'Spätná väzba a komunitné ocenenie sú navrhnuté ako povzbudenie, nie ako známkovanie. Číselne hodnotiť kresbu začiatočníka je účinný spôsob, ako ho odradiť.',
        ],
        technology: [
          'Mobilný klient so zadávaním úloh, fotoaparátom, stavom série a postupu a galériou, ktorá funguje ako vlastný archív toho, kto sa učí.',
        ],
        currentState: [
          'Prototyp vo vývoji. Návrh učenia je ďalej než implementácia.',
        ],
        learning: [
          'Gamifikáciu je ľahké pridať a ľahké pokaziť. Séria odmeňuje návrat, body odmeňujú výkon. U začiatočníka, ktorý má spočiatku kresliť zle, pomáha to prvé a škodí to druhé.',
          'Skratka „Duolingo na kreslenie" je užitočná v jednej vete a zavádzajúca v piatich. Jazyk má správne odpovede, kreslenie väčšinou nie.',
        ],
      },
    },
  },

  // ─────────────────────────────────────────────── DIGITAL SPACE / HERITAGE
  {
    slug: 'digital-space',
    title: 'Digital Space / Heritage',
    disciplines: ['3D', 'LiDAR', 'Photogrammetry', 'Spatial Computing'],
    short: {
      en: {
        category: '3D / LiDAR / Photogrammetry / Culture',
        shortDescription:
          'Experiments in digitising real places — 3D scanning, drones, LiDAR and interactive digital environments.',
        subtitle: 'A place you can move through, not a folder of photographs.',
        question:
          'How can a physical place become a digital environment rather than just a collection of photographs?',
      },
      cs: {
        category: '3D / LiDAR / Fotogrammetrie / Kultura',
        shortDescription:
          'Experimenty s digitalizací reálných míst — 3D skenování, drony, LiDAR a interaktivní digitální prostředí.',
        subtitle: 'Místo, kterým se dá projít, ne složka fotek.',
        question: 'Jak se z fyzického místa stane digitální prostředí, a ne jen sbírka fotografií?',
      },
      sk: {
        category: '3D / LiDAR / Fotogrametria / Kultúra',
        shortDescription:
          'Experimenty s digitalizáciou reálnych miest — 3D skenovanie, drony, LiDAR a interaktívne digitálne prostredia.',
        subtitle: 'Miesto, ktorým sa dá prejsť, nie priečinok fotiek.',
        question: 'Ako sa z fyzického miesta stane digitálne prostredie, a nie len zbierka fotografií?',
      },
      es: {
        category: '3D / LiDAR / Fotogrametría / Cultura',
        shortDescription:
          'Experimentos de digitalización de lugares reales — escaneo 3D, drones, LiDAR y entornos digitales interactivos.',
        subtitle: 'Un lugar que puedes recorrer, no una carpeta de fotos.',
        question: '¿Cómo puede un lugar físico convertirse en un entorno digital y no solo en una colección de fotografías?',
      },
      sr: {
        category: '3D / LiDAR / Fotogrametrija / Kultura',
        shortDescription:
          'Eksperimenti sa digitalizacijom stvarnih mesta — 3D skeniranje, dronovi, LiDAR i interaktivna digitalna okruženja.',
        subtitle: 'Mesto kroz koje možeš da prođeš, a ne folder fotografija.',
        question: 'Kako fizičko mesto može da postane digitalno okruženje, a ne samo zbirka fotografija?',
      },
      tr: {
        category: '3B / LiDAR / Fotogrametri / Kültür',
        shortDescription:
          'Gerçek mekânları dijitalleştirme denemeleri — 3B tarama, dronlar, LiDAR ve etkileşimli dijital ortamlar.',
        subtitle: 'İçinde dolaşabildiğin bir mekân, bir fotoğraf klasörü değil.',
        question: 'Fiziksel bir mekân, yalnızca bir fotoğraf koleksiyonu değil de nasıl dijital bir ortama dönüşebilir?',
      },
    },
    prose: {
      en: {
        overview: [
          'A set of experiments in capturing real places — buildings, interiors, objects — and rebuilding them as digital environments that can be entered rather than browsed.',
        ],
        context: [
          'Photographs record a place from positions someone already chose. They preserve appearance and lose space: you cannot walk around a photograph, and you cannot tell from one how two rooms relate.',
          'For cultural sites that difference matters. What is often worth keeping is the spatial experience, and that is exactly what a photo set discards.',
        ],
        idea: [
          'Capture geometry, not just images. Photogrammetry, LiDAR and drone capture produce point clouds and meshes — a record with dimensions rather than a record with framing.',
        ],
        process: [
          'The workflow runs capture, point cloud, mesh, usable environment — and each stage loses something different.',
          'Capture is the part that cannot be fixed later. Lighting, coverage, overlap and access decide what is reconstructable; everything downstream is cleanup.',
          'The final step — turning a reconstruction into an environment someone can move through — is a design problem, not a scanning one.',
        ],
        technology: [
          'Photogrammetry and LiDAR capture including drone imagery, reconstruction workflows of the RealityScan kind, and real-time 3D for the resulting environments.',
        ],
        currentState: [
          'Experiment. A set of capture and reconstruction tests rather than a finished interactive piece.',
        ],
        learning: [
          'The capture stage carries almost all of the risk. A generous, boring, systematic capture beats a clever reconstruction of a rushed one.',
          'Scanning a place is not the same as interpreting it. The geometry is only the material; deciding what a visitor should notice is a separate act.',
        ],
      },
      cs: {
        overview: [
          'Série experimentů se zachycováním reálných míst — budov, interiérů, objektů — a jejich převodem na digitální prostředí, do kterých se dá vstoupit, ne je jen prohlížet.',
        ],
        context: [
          'Fotografie zaznamenávají místo z pozic, které někdo předem vybral. Uchovají vzhled a ztratí prostor: kolem fotky se nedá obejít a nepozná se z ní, jak spolu dvě místnosti souvisejí.',
          'U kulturních míst na tom rozdílu záleží. Často je hodnotný právě prostorový zážitek — a přesně ten sada fotek zahodí.',
        ],
        idea: [
          'Zachytit geometrii, ne jen obrazy. Fotogrammetrie, LiDAR a snímkování z dronu dávají mračna bodů a meshe — záznam s rozměry místo záznamu s kompozicí.',
        ],
        process: [
          'Postup jde od sběru přes mračno bodů a mesh až po použitelné prostředí — a každý krok ztrácí něco jiného.',
          'Sběr je ta část, která se později nedá opravit. Světlo, pokrytí, překryv a přístup rozhodnou o tom, co půjde zrekonstruovat; všechno další je už jen čištění.',
          'Poslední krok — udělat z rekonstrukce prostředí, kterým se dá projít — je otázka návrhu, ne skenování.',
        ],
        technology: [
          'Fotogrammetrie a LiDAR včetně snímků z dronu, rekonstrukční postupy typu RealityScan a real-time 3D pro výsledná prostředí.',
        ],
        currentState: [
          'Experiment. Spíš sada testů sběru a rekonstrukce než hotové interaktivní dílo.',
        ],
        learning: [
          'Skoro všechno riziko nese fáze sběru. Velkorysý, nudný a systematický sběr porazí chytrou rekonstrukci uspěchaného.',
          'Naskenovat místo není totéž co ho vyložit. Geometrie je jen materiál; rozhodnout, čeho si má návštěvník všimnout, je samostatný úkon.',
        ],
      },
      sk: {
        overview: [
          'Séria experimentov so zachytávaním reálnych miest — budov, interiérov, objektov — a ich prevodom na digitálne prostredia, do ktorých sa dá vstúpiť, nie ich len prezerať.',
        ],
        context: [
          'Fotografie zaznamenávajú miesto z pozícií, ktoré niekto vopred vybral. Uchovajú vzhľad a stratia priestor: okolo fotky sa nedá obísť a nepozná sa z nej, ako spolu dve miestnosti súvisia.',
          'Pri kultúrnych miestach na tom rozdiele záleží. Často je hodnotný práve priestorový zážitok — a presne ten sada fotiek zahodí.',
        ],
        idea: [
          'Zachytiť geometriu, nielen obrazy. Fotogrametria, LiDAR a snímkovanie z dronu dávajú mračná bodov a meshe — záznam s rozmermi namiesto záznamu s kompozíciou.',
        ],
        process: [
          'Postup ide od zberu cez mračno bodov a mesh až po použiteľné prostredie — a každý krok stráca niečo iné.',
          'Zber je tá časť, ktorá sa neskôr nedá opraviť. Svetlo, pokrytie, prekryv a prístup rozhodnú o tom, čo pôjde zrekonštruovať; všetko ďalšie je už len čistenie.',
          'Posledný krok — urobiť z rekonštrukcie prostredie, ktorým sa dá prejsť — je otázka návrhu, nie skenovania.',
        ],
        technology: [
          'Fotogrametria a LiDAR vrátane snímok z dronu, rekonštrukčné postupy typu RealityScan a real-time 3D pre výsledné prostredia.',
        ],
        currentState: [
          'Experiment. Skôr sada testov zberu a rekonštrukcie než hotové interaktívne dielo.',
        ],
        learning: [
          'Takmer celé riziko nesie fáza zberu. Veľkorysý, nudný a systematický zber porazí šikovnú rekonštrukciu uponáhľaného.',
          'Naskenovať miesto nie je to isté ako vyložiť ho. Geometria je len materiál; rozhodnúť, čoho si má návštevník všimnúť, je samostatný úkon.',
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────── AI COMMERCE ENGINE
  {
    slug: 'ai-commerce-engine',
    title: 'AI Commerce Engine',
    disciplines: ['Generative AI', 'Automation', 'QA', 'Systems'],
    short: {
      en: {
        category: 'Generative AI / Automation / E-commerce',
        shortDescription:
          'An experimental system exploring automated creation of digital products, export, QA and the workflow around them.',
        subtitle: 'A pipeline that can prove what it produced.',
        question:
          'How much of a digital-product workflow can be made systematic, reproducible and automatically testable?',
      },
      cs: {
        category: 'Generativní AI / Automatizace / E-commerce',
        shortDescription:
          'Experimentální systém zkoumající automatizovanou tvorbu digitálních produktů, export, QA a navazující workflow.',
        subtitle: 'Pipeline, která umí doložit, co vyrobila.',
        question:
          'Kolik z workflow digitálního produktu se dá udělat systematicky, opakovatelně a automaticky testovatelně?',
      },
      sk: {
        category: 'Generatívna AI / Automatizácia / E-commerce',
        shortDescription:
          'Experimentálny systém skúmajúci automatizovanú tvorbu digitálnych produktov, export, QA a nadväzujúce workflow.',
        subtitle: 'Pipeline, ktorá vie doložiť, čo vyrobila.',
        question:
          'Koľko z workflow digitálneho produktu sa dá urobiť systematicky, opakovateľne a automaticky testovateľne?',
      },
      es: {
        category: 'IA generativa / Automatización / E-commerce',
        shortDescription:
          'Un sistema experimental sobre la creación automatizada de productos digitales, exportación, QA y el flujo de trabajo asociado.',
        subtitle: 'Una tubería que puede demostrar lo que produjo.',
        question: '¿Cuánto de un flujo de producto digital puede volverse sistemático, reproducible y comprobable automáticamente?',
      },
      sr: {
        category: 'Generativni AI / Automatizacija / E-trgovina',
        shortDescription:
          'Eksperimentalni sistem koji istražuje automatizovanu izradu digitalnih proizvoda, izvoz, QA i prateći tok rada.',
        subtitle: 'Pipeline koji može da dokaže šta je proizveo.',
        question: 'Koliko toka rada digitalnog proizvoda može da postane sistematsko, ponovljivo i automatski proverljivo?',
      },
      tr: {
        category: 'Üretken YZ / Otomasyon / E-ticaret',
        shortDescription:
          'Dijital ürünlerin otomatik üretimini, dışa aktarımı, QA’yı ve çevresindeki iş akışını araştıran deneysel bir sistem.',
        subtitle: 'Ne ürettiğini kanıtlayabilen bir hat.',
        question: 'Bir dijital ürün iş akışının ne kadarı sistematik, yeniden üretilebilir ve otomatik test edilebilir hale gelebilir?',
      },
    },
    prose: {
      en: {
        overview: [
          'An experimental system for producing digital products end to end — generation, export, quality checks and the commerce workflow around them — as a repeatable pipeline rather than a sequence of manual steps.',
        ],
        context: [
          'Generative tools make the first version of almost anything cheap. They do not make the hundredth version consistent, and consistency is what a catalogue actually requires.',
          'So the interesting problem is not "can this be generated". It is "can this be generated the same way twice, and can a machine tell when it went wrong".',
        ],
        idea: [
          'Treat the output like a build artifact. If a product can be described by inputs, produced by a pipeline and validated by gates, the whole thing becomes inspectable.',
        ],
        process: [
          'Generation is only the first stage. After it come export into multiple formats, automated QA gates, and a manifest recording what was produced and from what.',
          'Hashes and manifests exist so a product’s provenance is checkable: which inputs, which pipeline version, which outputs. Without that record a catalogue of generated goods is unauditable.',
          'The QA gates are what make the rest usable. A pipeline with no failing checks is not automated, only fast.',
        ],
        technology: [
          'Generative models behind a studio interface, a multi-format export stage, automated validation gates, and manifest and hash records for reproducibility.',
        ],
        currentState: [
          'In development. It is a systems experiment, not a running store.',
        ],
        learning: [
          'The generative step turned out to be the least difficult part. Export correctness, validation and reproducibility took the real work, and they are what decides whether an output is sellable at all.',
          'Automation without verification just produces mistakes faster.',
        ],
      },
      cs: {
        overview: [
          'Experimentální systém pro tvorbu digitálních produktů od začátku do konce — generování, export, kontrola kvality a navazující obchodní workflow — jako opakovatelná pipeline, ne jako sled ručních kroků.',
        ],
        context: [
          'Generativní nástroje zlevnily první verzi skoro čehokoli. Nezajistí ale, že bude stá verze konzistentní — a konzistence je to, co katalog ve skutečnosti potřebuje.',
          'Zajímavá otázka proto není „dá se to vygenerovat". Je to „dá se to vygenerovat dvakrát stejně a pozná stroj, když se to pokazí".',
        ],
        idea: [
          'Brát výstup jako build artefakt. Když se produkt dá popsat vstupy, vyrobit pipeline a ověřit branami, stane se celé to kontrolovatelným.',
        ],
        process: [
          'Generování je jen první fáze. Po něm přichází export do více formátů, automatické QA brány a manifest se záznamem, co vzniklo a z čeho.',
          'Hashe a manifesty existují proto, aby se dal ověřit původ produktu: jaké vstupy, jaká verze pipeline, jaké výstupy. Bez toho záznamu je katalog generovaného zboží neauditovatelný.',
          'QA brány jsou to, co dělá zbytek použitelným. Pipeline, ve které nikdy nic neselže, není automatizovaná, jen rychlá.',
        ],
        technology: [
          'Generativní modely za studiovým rozhraním, exportní fáze do více formátů, automatické validační brány a manifesty s hashi kvůli reprodukovatelnosti.',
        ],
        currentState: [
          'Ve vývoji. Je to systémový experiment, ne běžící obchod.',
        ],
        learning: [
          'Generativní krok se ukázal jako ten nejmenší problém. Skutečnou práci si vyžádaly správnost exportu, validace a reprodukovatelnost — a právě ony rozhodují, jestli se výstup vůbec dá prodat.',
          'Automatizace bez ověřování jen rychleji vyrábí chyby.',
        ],
      },
      sk: {
        overview: [
          'Experimentálny systém na tvorbu digitálnych produktov od začiatku do konca — generovanie, export, kontrola kvality a nadväzujúce obchodné workflow — ako opakovateľná pipeline, nie ako sled ručných krokov.',
        ],
        context: [
          'Generatívne nástroje zlacnili prvú verziu takmer čohokoľvek. Nezaistia však, že bude stá verzia konzistentná — a konzistencia je to, čo katalóg v skutočnosti potrebuje.',
          'Zaujímavá otázka preto nie je „dá sa to vygenerovať". Je to „dá sa to vygenerovať dvakrát rovnako a spozná stroj, keď sa to pokazí".',
        ],
        idea: [
          'Brať výstup ako build artefakt. Keď sa produkt dá opísať vstupmi, vyrobiť pipeline a overiť bránami, stane sa celé to kontrolovateľným.',
        ],
        process: [
          'Generovanie je len prvá fáza. Po ňom prichádza export do viacerých formátov, automatické QA brány a manifest so záznamom, čo vzniklo a z čoho.',
          'Hashe a manifesty existujú preto, aby sa dal overiť pôvod produktu: aké vstupy, aká verzia pipeline, aké výstupy. Bez toho záznamu je katalóg generovaného tovaru neauditovateľný.',
          'QA brány sú to, čo robí zvyšok použiteľným. Pipeline, v ktorej nikdy nič nezlyhá, nie je automatizovaná, len rýchla.',
        ],
        technology: [
          'Generatívne modely za štúdiovým rozhraním, exportná fáza do viacerých formátov, automatické validačné brány a manifesty s hashmi kvôli reprodukovateľnosti.',
        ],
        currentState: [
          'Vo vývoji. Je to systémový experiment, nie bežiaci obchod.',
        ],
        learning: [
          'Generatívny krok sa ukázal ako ten najmenší problém. Skutočnú prácu si vyžiadali správnosť exportu, validácia a reprodukovateľnosť — a práve ony rozhodujú, či sa výstup vôbec dá predať.',
          'Automatizácia bez overovania len rýchlejšie vyrába chyby.',
        ],
      },
    },
  },
]
