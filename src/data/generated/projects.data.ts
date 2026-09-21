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

import type { Project } from '../projects';

export const projectsData: Project[] = [
  {
    slug: "pravo365",
    title: "Pravo365",
    category: "LegalTech / AI / Product",
    description: {
      en: "A digital product for drafting contract proposals for the Czech legal environment.",
      cs: "Digitální produkt zaměřený na tvorbu návrhů smluv pro české právní prostředí.",
      sk: "Digitálny produkt zameraný na tvorbu návrhov zmlúv pre české právne prostredie.",
      es: "Un producto digital para la redacción de propuestas de contratos en el entorno jurídico checo.",
      sr: "Digitalni proizvod za izradu predloga ugovora za češko pravno okruženje.",
      tr: "Çek hukuk ortamı için sözleşme taslakları hazırlamaya yönelik dijital bir ürün."
    },
    status: [
      "live"
    ],
    href: "https://pravo365.cz/cs",
    visual: "strata",
    hue: 18,
    featured: true,
    detail: {
      subtitle: {
        en: "Drafting contracts for a jurisdiction, not for a template gallery.",
        cs: "Smlouvy psané pro jedno právní prostředí, ne pro galerii šablon.",
        sk: "Zmluvy písané pre jedno právne prostredie, nie pre galériu šablón.",
        es: "Contratos escritos para una jurisdicción, no para un catálogo de plantillas.",
        sr: "Ugovori pisani za jednu jurisdikciju, a ne za galeriju šablona.",
        tr: "Bir şablon galerisi için değil, belirli bir hukuk düzeni için yazılan sözleşmeler."
      },
      question: {
        en: "How can the creation of a complex legal document become a usable digital product?",
        cs: "Jak se z tvorby složitého právního dokumentu stane použitelný digitální produkt?",
        sk: "Ako sa z tvorby zložitého právneho dokumentu stane použiteľný digitálny produkt?",
        es: "¿Cómo puede la creación de un documento legal complejo convertirse en un producto digital usable?",
        sr: "Kako izrada složenog pravnog dokumenta može postati upotrebljiv digitalni proizvod?",
        tr: "Karmaşık bir hukuki belgenin hazırlanması nasıl kullanılabilir bir dijital ürüne dönüşür?"
      },
      disciplines: [
        "LegalTech",
        "AI",
        "Product",
        "UX"
      ],
      sections: [
        {
          id: "overview",
          body: [
            {
              en: "Pravo365 is a digital product for drafting contract proposals in the Czech legal environment. It takes structured input from someone who knows what they need and returns a draft they can read, check and take further.",
              cs: "Pravo365 je digitální produkt pro tvorbu návrhů smluv v českém právním prostředí. Vezme strukturovaný vstup od člověka, který ví, co potřebuje, a vrátí návrh, který si může přečíst, zkontrolovat a dopracovat.",
              sk: "Pravo365 je digitálny produkt na tvorbu návrhov zmlúv v českom právnom prostredí. Vezme štruktúrovaný vstup od človeka, ktorý vie, čo potrebuje, a vráti návrh, ktorý si môže prečítať, skontrolovať a dopracovať."
            },
            {
              en: "It is deliberately not an \"AI lawyer\". The product does not give legal advice and nothing in it suggests the draft is final.",
              cs: "Záměrně to není „AI právník\". Produkt neposkytuje právní poradenství a nic v něm nenaznačuje, že je návrh hotový.",
              sk: "Zámerne to nie je „AI právnik\". Produkt neposkytuje právne poradenstvo a nič v ňom nenaznačuje, že je návrh hotový."
            }
          ]
        },
        {
          id: "context",
          body: [
            {
              en: "Contract drafting is document work: precise, repetitive, and unforgiving of small mistakes. It is also bound to a jurisdiction — a template written for one legal environment is not merely less useful in another, it can be wrong.",
              cs: "Tvorba smluv je práce s dokumenty: přesná, opakující se a nemilosrdná k drobným chybám. Zároveň je vázaná na jurisdikci — šablona psaná pro jedno právní prostředí není v jiném jen méně užitečná, může být přímo špatně.",
              sk: "Tvorba zmlúv je práca s dokumentmi: presná, opakujúca sa a nemilosrdná k drobným chybám. Zároveň je viazaná na jurisdikciu — šablóna písaná pre jedno právne prostredie nie je v inom len menej užitočná, môže byť priamo nesprávna."
            },
            {
              en: "Most general-purpose document tools solve the formatting problem and leave the jurisdiction problem to the user. That is the wrong way round.",
              cs: "Většina obecných nástrojů na dokumenty vyřeší formátování a otázku právního prostředí nechá na uživateli. To je obráceně.",
              sk: "Väčšina všeobecných nástrojov na dokumenty vyrieši formátovanie a otázku právneho prostredia nechá na používateľovi. To je naopak."
            }
          ]
        },
        {
          id: "idea",
          body: [
            {
              en: "Narrow the product until it can actually be trusted. One legal environment, Czech. One language, Czech. A defined set of document types rather than an open text box.",
              cs: "Zúžit produkt tak, aby se mu dalo věřit. Jedno právní prostředí, české. Jeden jazyk, čeština. Definovaná sada typů dokumentů místo prázdného textového pole.",
              sk: "Zúžiť produkt tak, aby sa mu dalo veriť. Jedno právne prostredie, české. Jeden jazyk, čeština. Definovaná sada typov dokumentov namiesto prázdneho textového poľa."
            },
            {
              en: "The constraint is the feature. A system that only tries to produce Czech contract proposals can be checked against Czech expectations.",
              cs: "Omezení je tu funkcí. Systém, který se pokouší dělat pouze české návrhy smluv, se dá poměřit s českými očekáváními.",
              sk: "Obmedzenie je tu funkciou. Systém, ktorý sa pokúša robiť iba české návrhy zmlúv, sa dá porovnať s českými očakávaniami."
            }
          ]
        },
        {
          id: "process",
          body: [
            {
              en: "The work splits into three parts that stay separate on purpose: collecting structured input, generating the document, and presenting the result for review.",
              cs: "Práce se dělí na tři části, které zůstávají oddělené záměrně: sběr strukturovaného vstupu, generování dokumentu a předložení výsledku ke kontrole.",
              sk: "Práca sa delí na tri časti, ktoré zostávajú oddelené zámerne: zber štruktúrovaného vstupu, generovanie dokumentu a predloženie výsledku na kontrolu."
            },
            {
              en: "Structured input matters most. A form that asks the right questions in the right order does more for output quality than any amount of post-processing.",
              cs: "Nejdůležitější je strukturovaný vstup. Formulář, který se ptá na správné věci ve správném pořadí, udělá pro kvalitu výstupu víc než jakékoli dodatečné zpracování.",
              sk: "Najdôležitejší je štruktúrovaný vstup. Formulár, ktorý sa pýta na správne veci v správnom poradí, urobí pre kvalitu výstupu viac než akékoľvek dodatočné spracovanie."
            },
            {
              en: "The review step assumes the draft will be edited. Nothing in the interface performs finality it has not earned.",
              cs: "Krok kontroly počítá s tím, že se návrh bude upravovat. Rozhraní nikde nepředstírá hotovost, kterou si nezasloužilo.",
              sk: "Krok kontroly počíta s tým, že sa návrh bude upravovať. Rozhranie nikde nepredstiera hotovosť, ktorú si nezaslúžilo."
            }
          ]
        },
        {
          id: "technology",
          body: [
            {
              en: "A generation pipeline behind a structured web interface, with the document assembled from validated inputs rather than from free-form prompting.",
              cs: "Generovací pipeline za strukturovaným webovým rozhraním, kde dokument vzniká z ověřených vstupů, ne z volného promptování.",
              sk: "Generovacia pipeline za štruktúrovaným webovým rozhraním, kde dokument vzniká z overených vstupov, nie z voľného promptovania."
            },
            {
              en: "Reliability work — confirming that the same input produces the same shape of document — matters more here than model sophistication. A legal draft that varies unpredictably between runs is unusable regardless of how good any single run looks.",
              cs: "Práce na spolehlivosti — ověřování, že stejný vstup dá stejný tvar dokumentu — je tu důležitější než vyspělost modelu. Právní návrh, který se mezi běhy nepředvídatelně mění, je nepoužitelný bez ohledu na to, jak dobře vypadá jeden konkrétní běh.",
              sk: "Práca na spoľahlivosti — overovanie, že rovnaký vstup dá rovnaký tvar dokumentu — je tu dôležitejšia než vyspelosť modelu. Právny návrh, ktorý sa medzi behmi nepredvídateľne mení, je nepoužiteľný bez ohľadu na to, ako dobre vyzerá jeden konkrétny beh."
            }
          ]
        },
        {
          id: "state",
          body: [
            {
              en: "Live at pravo365.cz, in Czech. The scope is intentionally narrow and is extended one document type at a time.",
              cs: "Živě na pravo365.cz, v češtině. Rozsah je záměrně úzký a rozšiřuje se po jednotlivých typech dokumentů.",
              sk: "Naživo na pravo365.cz, v češtine. Rozsah je zámerne úzky a rozširuje sa po jednotlivých typoch dokumentov."
            }
          ]
        },
        {
          id: "learning",
          body: [
            {
              en: "In this category, trust is built by what a product refuses to do. Every place the interface declines to sound authoritative makes the parts that do work more believable.",
              cs: "V téhle kategorii se důvěra staví tím, co produkt dělat odmítá. Každé místo, kde rozhraní nezní autoritativně, dělá věrohodnějšími ty části, které fungují.",
              sk: "V tejto kategórii sa dôvera stavia tým, čo produkt robiť odmieta. Každé miesto, kde rozhranie neznie autoritatívne, robí vierohodnejšími tie časti, ktoré fungujú."
            },
            {
              en: "The narrow scope also made the engineering tractable. A general-purpose contract generator would have been easier to describe and far harder to verify.",
              cs: "Úzký rozsah zároveň udělal vývoj zvládnutelným. Obecný generátor smluv by se popisoval snáz a ověřoval mnohem hůř.",
              sk: "Úzky rozsah zároveň urobil vývoj zvládnuteľným. Všeobecný generátor zmlúv by sa opisoval ľahšie a overoval oveľa horšie."
            }
          ]
        }
      ],
      written: [
        "en",
        "cs",
        "sk"
      ]
    }
  },
  {
    slug: "web-digital-work",
    title: {
      en: "Web & Digital Work",
      cs: "Web a digitální práce",
      sk: "Web a digitálna práca",
      es: "Web y trabajo digital",
      sr: "Veb i digitalni rad",
      tr: "Web ve dijital işler"
    },
    category: {
      en: "Web / Digital Products / AI",
      cs: "Web / Digitální produkty / AI",
      sk: "Web / Digitálne produkty / AI",
      es: "Web / Productos digitales / IA",
      sr: "Veb / Digitalni proizvodi / AI",
      tr: "Web / Dijital ürünler / YZ"
    },
    description: {
      en: "Websites, digital products, AI and automation — from a finished brief, or from a problem that has not been shaped yet.",
      cs: "Weby, digitální produkty, AI a automatizace — z hotového zadání, nebo z problému, který ještě nemá tvar.",
      sk: "Weby, digitálne produkty, AI a automatizácia — z hotového zadania, alebo z problému, ktorý ešte nemá tvar.",
      es: "Sitios web, productos digitales, IA y automatización: desde un encargo cerrado o desde un problema sin forma todavía.",
      sr: "Sajtovi, digitalni proizvodi, AI i automatizacija — od gotovog briefa ili od problema koji još nema oblik.",
      tr: "Web siteleri, dijital ürünler, yapay zekâ ve otomasyon — hazır bir brief’ten ya da henüz biçimlenmemiş bir sorundan."
    },
    status: [
      "live",
      "in-development"
    ],
    href: null,
    visual: "grid",
    hue: 205,
    featured: true,
    detail: {
      subtitle: {
        en: "Two ways in: you know what you need, or you know something is wrong.",
        cs: "Dvě cesty dovnitř: víš, co potřebuješ, nebo víš, že něco nefunguje.",
        sk: "Dve cesty dovnútra: vieš, čo potrebuješ, alebo vieš, že niečo nefunguje.",
        es: "Dos entradas: sabes qué necesitas, o sabes que algo no funciona.",
        sr: "Dva ulaza: znaš šta ti treba, ili znaš da nešto ne radi.",
        tr: "İki giriş: ne istediğini biliyorsun ya da bir şeyin yanlış olduğunu biliyorsun."
      },
      question: {
        en: "Does this problem actually need a website, or something else entirely?",
        cs: "Potřebuje ten problém opravdu web, nebo něco úplně jiného?",
        sk: "Potrebuje ten problém naozaj web, alebo niečo úplne iné?",
        es: "¿Este problema necesita realmente una web, o algo distinto?",
        sr: "Da li ovom problemu zaista treba sajt, ili nešto sasvim drugo?",
        tr: "Bu sorunun gerçekten bir web sitesine mi, yoksa bambaşka bir şeye mi ihtiyacı var?"
      },
      disciplines: [
        "Web",
        "AI",
        "Automation",
        "Consultation"
      ],
      sections: [
        {
          id: "overview",
          body: [
            {
              en: "Complete websites, redesigns and landing pages for self-employed people, small organisations, businesses and cultural projects.",
              cs: "Kompletní weby, redesigny a landing pages pro OSVČ, malé organizace, firmy a kulturní projekty.",
              sk: "Kompletné weby, redizajny a landing pages pre živnostníkov, malé organizácie, firmy a kultúrne projekty."
            },
            {
              en: "Alongside that: AI integrations, API work, automation, databases, deployment and the infrastructure underneath — and consultation when that is the useful part.",
              cs: "Vedle toho: AI integrace, práce s API, automatizace, databáze, nasazení a infrastruktura pod tím — a konzultace, když je zrovna ona tou užitečnou částí.",
              sk: "Popri tom: AI integrácie, práca s API, automatizácia, databázy, nasadenie a infraštruktúra pod tým — a konzultácie, keď sú práve ony tou užitočnou časťou."
            }
          ]
        },
        {
          id: "practice",
          body: [
            {
              en: "There are two ways this usually starts, and they are genuinely different pieces of work.",
              cs: "Obvykle to začíná dvěma způsoby a jsou to opravdu dvě různé práce.",
              sk: "Obyčajne to začína dvoma spôsobmi a sú to naozaj dve rôzne práce."
            },
            {
              en: "The first: you know what you need. A brief exists, the scope is reasonably clear, and the job is to design it, build it and hand it over working.",
              cs: "První: víš, co potřebuješ. Zadání existuje, rozsah je celkem jasný a úkolem je to navrhnout, postavit a předat funkční.",
              sk: "Prvý: vieš, čo potrebuješ. Zadanie existuje, rozsah je celkom jasný a úlohou je to navrhnúť, postaviť a odovzdať funkčné."
            },
            {
              en: "The second: you have a problem, or an idea, and no clear picture of the solution. That starts earlier — working out what the actual problem is before deciding what should be built. Sometimes the answer turns out not to be a website at all.",
              cs: "Druhý: máš problém nebo nápad a nemáš jasnou představu o řešení. To začíná dřív — nejdřív zjistit, co je skutečný problém, a teprve pak rozhodnout, co se má stavět. Někdy se ukáže, že odpovědí není web.",
              sk: "Druhý: máš problém alebo nápad a nemáš jasnú predstavu o riešení. To začína skôr — najprv zistiť, čo je skutočný problém, a až potom rozhodnúť, čo sa má stavať. Niekedy sa ukáže, že odpoveďou nie je web."
            }
          ]
        },
        {
          id: "people",
          body: [
            {
              en: "Self-employed people, small organisations, businesses and cultural projects.",
              cs: "OSVČ, malé organizace, firmy a kulturní projekty.",
              sk: "Živnostníci, malé organizácie, firmy a kultúrne projekty."
            }
          ]
        },
        {
          id: "availability",
          body: [
            {
              en: "Full builds and redesigns. Landing pages. AI and API integrations. Automation and databases. Hosting and deployment. Consultation on a problem that has not been shaped yet.",
              cs: "Kompletní weby a redesigny. Landing pages. AI a API integrace. Automatizace a databáze. Hosting a nasazení. Konzultace k problému, který ještě nemá tvar.",
              sk: "Kompletné weby a redizajny. Landing pages. AI a API integrácie. Automatizácia a databázy. Hosting a nasadenie. Konzultácie k problému, ktorý ešte nemá tvar."
            }
          ]
        }
      ],
      written: [
        "en",
        "cs",
        "sk"
      ]
    }
  },
  {
    slug: "circus-movement",
    title: {
      en: "Circus & Movement",
      cs: "Cirkus a pohyb",
      sk: "Cirkus a pohyb",
      es: "Circo y movimiento",
      sr: "Cirkus i pokret",
      tr: "Sirk ve hareket"
    },
    category: {
      en: "Movement / Circus / Teaching",
      cs: "Pohyb / Cirkus / Výuka",
      sk: "Pohyb / Cirkus / Výučba",
      es: "Movimiento / Circo / Docencia",
      sr: "Pokret / Cirkus / Podučavanje",
      tr: "Hareket / Sirk / Öğretim"
    },
    description: {
      en: "Contemporary circus with children and young people — juggling, balance, coordination, and finding a discipline that fits.",
      cs: "Nový cirkus s dětmi a mladými — žonglování, rovnováha, koordinace a hledání disciplíny, která sedne.",
      sk: "Nový cirkus s deťmi a mladými — žonglovanie, rovnováha, koordinácia a hľadanie disciplíny, ktorá sadne.",
      es: "Circo contemporáneo con niños y jóvenes: malabares, equilibrio, coordinación y encontrar la disciplina propia.",
      sr: "Savremeni cirkus sa decom i mladima — žongliranje, ravnoteža, koordinacija i pronalaženje sopstvene discipline.",
      tr: "Çocuklar ve gençlerle çağdaş sirk — jonglörlük, denge, koordinasyon ve kendine uyan disiplini bulmak."
    },
    status: [
      "ongoing"
    ],
    href: null,
    visual: "flux",
    hue: 320,
    featured: true,
    detail: {
      subtitle: {
        en: "An object that keeps falling is an honest teacher.",
        cs: "Předmět, který pořád padá, je poctivý učitel.",
        sk: "Predmet, ktorý stále padá, je poctivý učiteľ.",
        es: "Un objeto que no deja de caerse es un maestro honesto.",
        sr: "Predmet koji stalno pada je pošten učitelj.",
        tr: "Sürekli düşen bir nesne dürüst bir öğretmendir."
      },
      question: {
        en: "What does someone learn about persistence from a thing that keeps hitting the floor?",
        cs: "Co se člověk naučí o vytrvalosti od věci, která pořád končí na zemi?",
        sk: "Čo sa človek naučí o vytrvalosti od veci, ktorá stále končí na zemi?",
        es: "¿Qué se aprende sobre la constancia de algo que no para de caer al suelo?",
        sr: "Šta čovek nauči o istrajnosti od stvari koja stalno završava na podu?",
        tr: "Sürekli yere düşen bir şey, insana sebat hakkında ne öğretir?"
      },
      disciplines: [
        "Juggling",
        "Object work",
        "Balance",
        "Acrobatics",
        "Group work"
      ],
      sections: [
        {
          id: "overview",
          body: [
            {
              en: "Contemporary circus is less about the trick than about what a person finds out while learning one. I work with children and young people, roughly six to sixteen, on juggling, object manipulation, balance and basic acrobatics.",
              cs: "Nový cirkus není ani tak o triku jako o tom, co člověk zjistí, když se ho učí. Pracuju s dětmi a mladými, zhruba od šesti do šestnácti, na žonglování, manipulaci s předměty, rovnováze a základní akrobacii.",
              sk: "Nový cirkus nie je ani tak o triku ako o tom, čo človek zistí, keď sa ho učí. Pracujem s deťmi a mladými, zhruba od šiestich do šestnástich, na žonglovaní, manipulácii s predmetmi, rovnováhe a základnej akrobacii."
            },
            {
              en: "Around five years of practice and teaching so far.",
              cs: "Zatím zhruba pět let praxe a vedení.",
              sk: "Zatiaľ zhruba päť rokov praxe a vedenia."
            }
          ]
        },
        {
          id: "practice",
          body: [
            {
              en: "Juggling and object manipulation. Balance disciplines. Basic acrobatics. Coordination work. Performative elements and working as a group.",
              cs: "Žonglování a manipulace s předměty. Rovnovážné disciplíny. Základní akrobacie. Práce na koordinaci. Performativní prvky a práce ve skupině.",
              sk: "Žonglovanie a manipulácia s predmetmi. Rovnovážne disciplíny. Základná akrobacia. Práca na koordinácii. Performatívne prvky a práca v skupine."
            },
            {
              en: "Everyone eventually gravitates towards a discipline that suits them. Part of the job is helping them find it rather than deciding it for them.",
              cs: "Každý si nakonec najde disciplínu, která mu sedne. Část práce je pomoct mu ji najít, ne ji za něj vybrat.",
              sk: "Každý si nakoniec nájde disciplínu, ktorá mu sadne. Časť práce je pomôcť mu ju nájsť, nie ju zaňho vybrať."
            }
          ]
        },
        {
          id: "idea",
          body: [
            {
              en: "You try something, it does not work, you change one thing, you go again. Progress shows up through repetition, and with a physical skill it is visible in a way that is hard to argue with.",
              cs: "Zkusíš to, nejde to, změníš jednu věc, jdeš znovu. Pokrok se ukazuje opakováním a u fyzické dovednosti je vidět tak, že se s tím nedá moc polemizovat.",
              sk: "Skúsiš to, nejde to, zmeníš jednu vec, ideš znova. Pokrok sa ukazuje opakovaním a pri fyzickej zručnosti je vidieť tak, že sa s tým nedá veľmi polemizovať."
            },
            {
              en: "What holds my attention is everything around that: awareness of your own body, coordination, trust between people in a group, staying with something that is not working yet, and movement as a way of expressing something rather than performing it.",
              cs: "Zajímá mě všechno kolem toho: vnímání vlastního těla, koordinace, důvěra mezi lidmi ve skupině, vydržet u něčeho, co ještě nejde, a pohyb jako způsob, jak něco vyjádřit — ne jak to předvést.",
              sk: "Zaujíma ma všetko okolo toho: vnímanie vlastného tela, koordinácia, dôvera medzi ľuďmi v skupine, vydržať pri niečom, čo ešte nejde, a pohyb ako spôsob, ako niečo vyjadriť — nie ako to predviesť."
            }
          ]
        },
        {
          id: "people",
          body: [
            {
              en: "Mostly children and young people, roughly ages 6 to 16.",
              cs: "Převážně děti a mladí lidé, zhruba 6 až 16 let.",
              sk: "Prevažne deti a mladí ľudia, zhruba 6 až 16 rokov."
            },
            {
              en: "Local youth and movement activities in the Žďár nad Sázavou area, and the children’s programme connected with the KoresponDance festival.",
              cs: "Místní volnočasové a pohybové aktivity na Žďársku a dětský program spojený s festivalem KoresponDance.",
              sk: "Miestne voľnočasové a pohybové aktivity v okolí Žďáru nad Sázavou a detský program spojený s festivalom KoresponDance."
            }
          ]
        },
        {
          id: "availability",
          body: [
            {
              en: "Circus and movement workshops. Regular or short-term training. Programmes for children and young people. External programmes for schools and community organisations.",
              cs: "Cirkusové a pohybové workshopy. Pravidelné i krátkodobé vedení. Programy pro děti a mládež. Externí programy pro školy a komunitní organizace.",
              sk: "Cirkusové a pohybové workshopy. Pravidelné aj krátkodobé vedenie. Programy pre deti a mládež. Externé programy pre školy a komunitné organizácie."
            }
          ]
        }
      ],
      written: [
        "en",
        "cs",
        "sk"
      ]
    }
  },
  {
    slug: "moodpack-director",
    title: "Moodpack / Director",
    category: "AI / Unreal Engine / 3D / Experimental Technology",
    description: {
      en: "An experimental environment exploring how AI can understand and control Unreal Engine and complex 3D scenes.",
      cs: "Experimentální prostředí zkoumající, jak může AI chápat a ovládat Unreal Engine a komplexní 3D prostředí.",
      sk: "Experimentálne prostredie skúmajúce, ako môže AI chápať a ovládať Unreal Engine a komplexné 3D prostredia.",
      es: "Un entorno experimental que explora cómo la IA puede entender y controlar Unreal Engine y escenas 3D complejas.",
      sr: "Eksperimentalno okruženje koje istražuje kako AI može da razume i kontroliše Unreal Engine i složene 3D scene.",
      tr: "Yapay zekânın Unreal Engine ve karmaşık 3B sahneleri nasıl anlayıp yönetebileceğini araştıran deneysel bir ortam."
    },
    status: [
      "in-development",
      "experiment"
    ],
    href: null,
    visual: "orbit",
    hue: 268,
    featured: true,
    detail: {
      subtitle: {
        en: "Teaching an agent to operate a 3D editor, not to describe one.",
        cs: "Naučit agenta editor ovládat, ne ho popisovat.",
        sk: "Naučiť agenta editor ovládať, nie ho opisovať.",
        es: "Enseñar a un agente a operar un editor 3D, no a describirlo.",
        sr: "Naučiti agenta da upravlja 3D editorom, a ne da ga opisuje.",
        tr: "Bir ajana 3B editörü anlatmayı değil, kullanmayı öğretmek."
      },
      question: {
        en: "What if AI could understand and operate a complex 3D editor instead of only talking about it?",
        cs: "Co kdyby AI dokázala složitý 3D editor nejen popsat, ale skutečně ovládat?",
        sk: "Čo ak by AI dokázala zložitý 3D editor nielen opísať, ale skutočne ovládať?",
        es: "¿Y si la IA pudiera entender y operar un editor 3D complejo en lugar de solo hablar de él?",
        sr: "Šta ako bi AI mogla da razume i upravlja složenim 3D editorom, umesto da samo priča o njemu?",
        tr: "Ya yapay zekâ karmaşık bir 3B editörü hakkında konuşmak yerine onu gerçekten kullanabilseydi?"
      },
      disciplines: [
        "AI",
        "Unreal Engine",
        "3D",
        "Agents"
      ],
      sections: [
        {
          id: "overview",
          body: [
            {
              en: "Moodpack / Director is an experimental environment for connecting AI agents to Unreal Engine — not to generate pictures of 3D scenes, but to operate the editor that builds them.",
              cs: "Moodpack / Director je experimentální prostředí pro propojení AI agentů s Unreal Enginem — ne kvůli generování obrázků 3D scén, ale kvůli ovládání editoru, ve kterém scény vznikají.",
              sk: "Moodpack / Director je experimentálne prostredie na prepojenie AI agentov s Unreal Enginom — nie kvôli generovaniu obrázkov 3D scén, ale kvôli ovládaniu editora, v ktorom scény vznikajú."
            }
          ]
        },
        {
          id: "context",
          body: [
            {
              en: "Language models are fluent about 3D work and largely unable to do it. They can describe a scene, name the right tools and explain a workflow, then produce nothing that exists inside the software.",
              cs: "Jazykové modely mluví o 3D práci plynule a většinou ji neumí dělat. Dokážou popsat scénu, pojmenovat správné nástroje a vysvětlit postup — a nevznikne nic, co by v softwaru existovalo.",
              sk: "Jazykové modely hovoria o 3D práci plynulo a väčšinou ju nevedia robiť. Dokážu opísať scénu, pomenovať správne nástroje a vysvetliť postup — a nevznikne nič, čo by v softvéri existovalo."
            },
            {
              en: "The gap is not knowledge. It is state: an editor is a live environment with a selection, a hierarchy, a coordinate system and consequences, and none of that is present in a text prompt.",
              cs: "Mezera není ve znalostech. Je ve stavu: editor je živé prostředí s výběrem, hierarchií, souřadnicovým systémem a důsledky, a nic z toho v textovém promptu není.",
              sk: "Medzera nie je vo vedomostiach. Je v stave: editor je živé prostredie s výberom, hierarchiou, súradnicovým systémom a dôsledkami, a nič z toho v textovom prompte nie je."
            }
          ]
        },
        {
          id: "idea",
          body: [
            {
              en: "Give the agent real handles on the editor and a way to read back what happened. Actions become tools, the scene becomes observable state, and the loop closes.",
              cs: "Dát agentovi skutečné úchyty na editor a způsob, jak si přečíst, co se stalo. Z akcí se stanou nástroje, ze scény pozorovatelný stav, a smyčka se uzavře.",
              sk: "Dať agentovi skutočné úchyty na editor a spôsob, ako si prečítať, čo sa stalo. Z akcií sa stanú nástroje, zo scény pozorovateľný stav, a slučka sa uzavrie."
            }
          ]
        },
        {
          id: "process",
          body: [
            {
              en: "The system is built as a control layer between an agent and the editor. Commands are explicit and inspectable rather than free-form, so a failed action is a readable failure instead of silence.",
              cs: "Systém je postavený jako řídicí vrstva mezi agentem a editorem. Příkazy jsou explicitní a kontrolovatelné, ne volné, takže neúspěšná akce je čitelné selhání, ne ticho.",
              sk: "Systém je postavený ako riadiaca vrstva medzi agentom a editorom. Príkazy sú explicitné a kontrolovateľné, nie voľné, takže neúspešná akcia je čitateľné zlyhanie, nie ticho."
            },
            {
              en: "Much of the work turns out to be spatial rather than linguistic — placement, collision, orientation, whether an object ended up where it was asked to go.",
              cs: "Velká část práce je nakonec prostorová, ne jazyková — umístění, kolize, orientace, jestli objekt skončil tam, kam měl.",
              sk: "Veľká časť práce je napokon priestorová, nie jazyková — umiestnenie, kolízie, orientácia, či objekt skončil tam, kam mal."
            },
            {
              en: "Each experiment stays small and repeatable: request one operation, observe the scene, compare against intent.",
              cs: "Každý experiment zůstává malý a opakovatelný: vyžádat jednu operaci, pozorovat scénu, porovnat se záměrem.",
              sk: "Každý experiment zostáva malý a opakovateľný: vyžiadať jednu operáciu, pozorovať scénu, porovnať so zámerom."
            }
          ]
        },
        {
          id: "technology",
          body: [
            {
              en: "Unreal Engine as the environment, with an agent-facing command surface on one side and scene inspection on the other. Object and sound generation exist as separate generators feeding the same environment.",
              cs: "Unreal Engine jako prostředí, na jedné straně příkazové rozhraní pro agenta, na druhé čtení stavu scény. Generování objektů a zvuku existuje jako samostatné generátory napojené na stejné prostředí.",
              sk: "Unreal Engine ako prostredie, na jednej strane príkazové rozhranie pre agenta, na druhej čítanie stavu scény. Generovanie objektov a zvuku existuje ako samostatné generátory napojené na rovnaké prostredie."
            }
          ]
        },
        {
          id: "experiments",
          body: [
            {
              en: "The recurring test is spatial reasoning. An agent can produce a perfectly plausible sentence about where a chair should go and still place it inside a wall.",
              cs: "Opakovaným testem je prostorové uvažování. Agent umí vyprodukovat naprosto věrohodnou větu o tom, kam patří židle, a přesto ji umístit do zdi.",
              sk: "Opakovaným testom je priestorové uvažovanie. Agent vie vyprodukovať úplne vierohodnú vetu o tom, kam patrí stolička, a napriek tomu ju umiestniť do steny."
            },
            {
              en: "Collision and placement work is therefore the honest measure of progress — more so than any transcript of the agent explaining itself.",
              cs: "Práce s kolizemi a umísťováním je proto poctivější mírou pokroku než jakýkoli přepis toho, jak se agent vysvětluje.",
              sk: "Práca s kolíziami a umiestňovaním je preto poctivejšou mierou pokroku než akýkoľvek prepis toho, ako sa agent vysvetľuje."
            }
          ]
        },
        {
          id: "state",
          body: [
            {
              en: "In development, and an experiment rather than a product. It is not an autonomous system and is not presented as one.",
              cs: "Ve vývoji, a spíš experiment než produkt. Není to autonomní systém a ani se tak neprezentuje.",
              sk: "Vo vývoji, a skôr experiment než produkt. Nie je to autonómny systém a ani sa tak neprezentuje."
            }
          ]
        },
        {
          id: "learning",
          body: [
            {
              en: "The bottleneck is not the model’s vocabulary but its grip on state. Progress came from making the environment more legible to the agent, not from asking the agent more elaborately.",
              cs: "Úzkým hrdlem není slovní zásoba modelu, ale jeho úchop stavu. Pokrok přišel z toho, že se prostředí stalo pro agenta čitelnějším — ne z důmyslnějšího zadávání.",
              sk: "Úzkym hrdlom nie je slovná zásoba modelu, ale jeho úchop stavu. Pokrok prišiel z toho, že sa prostredie stalo pre agenta čitateľnejším — nie z dômyselnejšieho zadávania."
            }
          ]
        }
      ],
      written: [
        "en",
        "cs",
        "sk"
      ]
    }
  },
  {
    slug: "splatoo",
    title: "Splatoo",
    category: {
      en: "3D / Gaussian Splatting / Web",
      sr: "3D / Gaussian Splatting / Veb"
    },
    description: {
      en: "Real places captured in 3D and made explorable in any browser, with nothing to install. A collaboration on Splatoo.",
      cs: "Skutečná místa zachycená ve 3D, prozkoumatelná v každém prohlížeči a bez instalace. Spolupráce na Splatoo.",
      sk: "Skutočné miesta zachytené v 3D, preskúmateľné v každom prehliadači a bez inštalácie. Spolupráca na Splatoo.",
      es: "Lugares reales capturados en 3D y explorables en cualquier navegador, sin instalar nada. Una colaboración en Splatoo.",
      sr: "Stvarna mesta snimljena u 3D, koja se mogu istraživati u svakom pregledaču, bez instalacije. Saradnja na Splatoo.",
      tr: "Gerçek mekânlar 3D olarak yakalanıyor ve hiçbir şey kurmadan her tarayıcıda keşfedilebiliyor. Splatoo üzerinde bir iş birliği."
    },
    status: [
      "live"
    ],
    href: "https://splatoo.com/",
    visual: "scan",
    hue: 125,
    featured: true,
    detail: {
      subtitle: {
        en: "A real place, explorable from a link.",
        cs: "Skutečné místo, prozkoumatelné z odkazu.",
        sk: "Skutočné miesto, preskúmateľné z odkazu.",
        es: "Un lugar real, explorable desde un enlace.",
        sr: "Stvarno mesto, dostupno preko linka.",
        tr: "Gerçek bir mekân, bir bağlantıdan keşfedilebilir."
      },
      question: {
        en: "Can someone walk through a real place from a browser, with nothing to install?",
        cs: "Dá se projít skutečným místem z prohlížeče, bez čehokoli k instalaci?",
        sk: "Dá sa prejsť skutočným miestom z prehliadača, bez čohokoľvek na inštaláciu?",
        es: "¿Se puede recorrer un lugar real desde el navegador, sin instalar nada?",
        sr: "Može li se proći kroz stvarno mesto iz pregledača, bez ičega za instaliranje?",
        tr: "Gerçek bir mekânda, hiçbir şey kurmadan tarayıcıdan dolaşılabilir mi?"
      },
      disciplines: [
        "Gaussian splatting",
        "Unreal Engine",
        "Wayfinding",
        "Web"
      ],
      sections: [
        {
          id: "overview",
          body: [
            {
              en: "Splatoo turns real places into interactive 3D spaces that open in an ordinary browser — no app to install. I collaborate on it.",
              cs: "Splatoo mění skutečná místa v interaktivní 3D prostory, které se otevřou v obyčejném prohlížeči — bez instalace aplikace. Spolupracuju na něm.",
              sk: "Splatoo mení skutočné miesta na interaktívne 3D priestory, ktoré sa otvoria v obyčajnom prehliadači — bez inštalácie aplikácie. Spolupracujem na ňom."
            },
            {
              en: "The scene on this page is Žďár nad Sázavou, presented the way Splatoo presents any space: a captured place you can move through yourself, rather than a video of someone else moving through it.",
              cs: "Scéna na téhle stránce je Žďár nad Sázavou, představený tak, jak Splatoo představuje jakýkoli prostor: zachycené místo, kterým se pohybuješ sám, ne video, jak se jím pohybuje někdo jiný.",
              sk: "Scéna na tejto stránke je Žďár nad Sázavou, predstavený tak, ako Splatoo predstavuje akýkoľvek priestor: zachytené miesto, ktorým sa pohybuješ sám, nie video, ako sa ním pohybuje niekto iný."
            }
          ]
        },
        {
          id: "technology",
          body: [
            {
              en: "A location is captured with Gaussian splatting, which keeps both the geometry and the atmosphere of a place instead of reducing it to a simplified model.",
              cs: "Místo se zachytí metodou Gaussian splatting, která zachová geometrii i atmosféru místa, místo aby ho zjednodušila na model.",
              sk: "Miesto sa zachytí metódou Gaussian splatting, ktorá zachová geometriu aj atmosféru miesta, namiesto toho, aby ho zjednodušila na model."
            },
            {
              en: "On top of the capture goes a layer of points of interest, routes and content, so a scene works as wayfinding and not only as something to look at. The same scene runs on the web and on on-site kiosks.",
              cs: "Na záznam se přidá vrstva bodů zájmu, tras a obsahu, takže scéna slouží k orientaci, ne jen k dívání. Stejná scéna běží na webu i na kioscích přímo na místě.",
              sk: "Na záznam sa pridá vrstva bodov záujmu, trás a obsahu, takže scéna slúži na orientáciu, nie len na pozeranie. Tá istá scéna beží na webe aj na kioskoch priamo na mieste."
            },
            {
              en: "Scenes can also be brought over from Unreal Engine and converted into splats, so a space does not have to exist physically to be presented this way.",
              cs: "Scény se dají převést i z Unreal Engine do splatů, takže prostor nemusí fyzicky existovat, aby se dal takhle ukázat.",
              sk: "Scény sa dajú previesť aj z Unreal Engine do splatov, takže priestor nemusí fyzicky existovať, aby sa dal takto ukázať."
            }
          ]
        },
        {
          id: "state",
          body: [
            {
              en: "Live at splatoo.com. Splatoo’s own site sets out where it is aimed: real estate, events, retail, tourism, golf, zoos and veterinary practices.",
              cs: "Živě na splatoo.com. Web Splatoo sám uvádí, pro koho je určený: reality, akce, retail, cestovní ruch, golf, zoo a veterinární praxe.",
              sk: "Naživo na splatoo.com. Web Splatoo sám uvádza, pre koho je určený: reality, podujatia, retail, cestovný ruch, golf, zoo a veterinárne ambulancie."
            }
          ]
        }
      ],
      written: [
        "en",
        "cs",
        "sk"
      ]
    }
  },
  {
    slug: "snowboard-coaching",
    title: {
      en: "Snowboard Coaching",
      cs: "Výuka snowboardingu",
      sk: "Výučba snowboardingu",
      es: "Clases de snowboard",
      sr: "Obuka snoubordinga",
      tr: "Snowboard eğitimi"
    },
    category: {
      en: "Movement / Snowboarding / Teaching",
      cs: "Pohyb / Snowboarding / Výuka",
      sk: "Pohyb / Snowboarding / Výučba",
      es: "Movimiento / Snowboard / Docencia",
      sr: "Pokret / Snoubording / Podučavanje",
      tr: "Hareket / Snowboard / Öğretim"
    },
    description: {
      en: "Beginner snowboard instruction for children and adults, in Vysočina.",
      cs: "Výuka snowboardingu pro začátečníky — děti i dospělé, na Vysočině.",
      sk: "Výučba snowboardingu pre začiatočníkov — deti aj dospelých, na Vysočine.",
      es: "Clases de snowboard para principiantes, niños y adultos, en Vysočina.",
      sr: "Obuka snoubordinga za početnike — decu i odrasle, u regionu Vysočina.",
      tr: "Vysočina bölgesinde çocuklar ve yetişkinler için başlangıç snowboard eğitimi."
    },
    status: [
      "ongoing"
    ],
    href: null,
    visual: "scan",
    hue: 195,
    featured: true,
    detail: {
      subtitle: {
        en: "Getting comfortable on a board, one repetition at a time.",
        cs: "Cítit se na prkně dobře, jedno opakování po druhém.",
        sk: "Cítiť sa na doske dobre, jedno opakovanie po druhom.",
        es: "Sentirse cómodo sobre la tabla, una repetición cada vez.",
        sr: "Osećati se dobro na dasci, jedno ponavljanje za drugim.",
        tr: "Tahtanın üstünde rahatlamak, tekrar tekrar."
      },
      question: {
        en: "How do you make a first day on a board end with someone wanting a second one?",
        cs: "Jak udělat první den na prkně tak, aby po něm člověk chtěl i druhý?",
        sk: "Ako urobiť prvý deň na doske tak, aby po ňom človek chcel aj druhý?",
        es: "¿Cómo hacer que un primer día sobre la tabla termine con ganas de un segundo?",
        sr: "Kako napraviti prvi dan na dasci tako da čovek poželi i drugi?",
        tr: "İlk gün, insana ikinci bir günü istetecek şekilde nasıl geçirilir?"
      },
      disciplines: [
        "Beginners",
        "Children",
        "Adults",
        "Vysočina"
      ],
      sections: [
        {
          id: "overview",
          body: [
            {
              en: "I have snowboarded since I was around eighteen, and I hold a qualification in the basics of school snowboarding.",
              cs: "Na snowboardu jezdím zhruba od osmnácti a mám kvalifikaci pro základy školního snowboardingu.",
              sk: "Na snowboarde jazdím zhruba od osemnástich a mám kvalifikáciu pre základy školského snowboardingu."
            },
            {
              en: "I have taught and helped teach children and primary-school-aged learners, adults, and a fair number of friends and family.",
              cs: "Učil a pomáhal jsem učit děti a žáky prvního stupně, dospělé a slušnou řádku kamarádů a příbuzných.",
              sk: "Učil a pomáhal som učiť deti a žiakov prvého stupňa, dospelých a slušný rad kamarátov a príbuzných."
            }
          ]
        },
        {
          id: "practice",
          body: [
            {
              en: "Basic stance and balance on the board. Board control. The fundamentals of turning. Enough confidence to keep going after the first few falls.",
              cs: "Základní postoj a rovnováha na prkně. Ovládání prkna. Základy zatáčení. Dost jistoty na to, aby člověk po prvních pádech pokračoval.",
              sk: "Základný postoj a rovnováha na doske. Ovládanie dosky. Základy zatáčania. Dosť istoty na to, aby človek po prvých pádoch pokračoval."
            },
            {
              en: "Beginner instruction, deliberately — not racing, and not advanced freestyle. The aim is safe, unhurried progression rather than a syllabus.",
              cs: "Záměrně výuka pro začátečníky — ne závodní ježdění a ne pokročilý freestyle. Jde o bezpečný a nespěchaný posun, ne o osnovu.",
              sk: "Zámerne výučba pre začiatočníkov — nie závodné jazdenie a nie pokročilý freestyle. Ide o bezpečný a neuponáhľaný posun, nie o osnovu."
            }
          ]
        },
        {
          id: "people",
          body: [
            {
              en: "Beginners: children and adults.",
              cs: "Začátečníci: děti i dospělí.",
              sk: "Začiatočníci: deti aj dospelí."
            },
            {
              en: "Vysočina, mainly around Nové Město na Moravě and Žďár nad Sázavou.",
              cs: "Vysočina, hlavně okolí Nového Města na Moravě a Žďáru nad Sázavou.",
              sk: "Vysočina, najmä okolie Nového Mesta na Morave a Žďáru nad Sázavou."
            }
          ]
        },
        {
          id: "availability",
          body: [
            {
              en: "Seasonal winter sessions by arrangement. External and independent — not tied to a school or a resort.",
              cs: "Sezónní zimní lekce po domluvě. Externě a nezávisle — bez vazby na školu nebo areál.",
              sk: "Sezónne zimné lekcie po dohode. Externe a nezávisle — bez väzby na školu alebo areál."
            }
          ]
        }
      ],
      written: [
        "en",
        "cs",
        "sk"
      ]
    }
  }
];
