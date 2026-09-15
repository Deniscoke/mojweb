/**
 * PROJECT CONTENT — the canonical source for what the five case studies say.
 *
 * This file is authored content, imported into Payload by `import.ts`. Payload
 * remains the canonical runtime source; this exists so the writing is
 * reviewable in a diff and reproducible into an empty database.
 *
 * Nothing here may be invented. No user counts, revenue, clients, partners,
 * institutions, awards, endorsements or metrics appear because none were
 * provided. Where a fact is unknown it is left out rather than estimated.
 */

import type { ProjectContent } from './lexical'

export const projectContent: ProjectContent[] = [
  // ────────────────────────────────────────────────────────────── PRAVO365
  {
    slug: 'pravo365',
    title: 'Pravo365',
    disciplines: ['LegalTech', 'AI', 'Product', 'UX'],
    short: {
      en: {
        category: 'LegalTech / AI / Product',
        shortDescription:
          'A digital product for drafting contract proposals for the Czech legal environment.',
        subtitle: 'Drafting contracts for a jurisdiction, not for a template gallery.',
        question:
          'How can the creation of a complex legal document become a usable digital product?',
      },
      cs: {
        category: 'LegalTech / AI / Produkt',
        shortDescription: 'Digitální produkt zaměřený na tvorbu návrhů smluv pro české právní prostředí.',
        subtitle: 'Smlouvy psané pro jedno právní prostředí, ne pro galerii šablon.',
        question: 'Jak se z tvorby složitého právního dokumentu stane použitelný digitální produkt?',
      },
      sk: {
        category: 'LegalTech / AI / Produkt',
        shortDescription: 'Digitálny produkt zameraný na tvorbu návrhov zmlúv pre české právne prostredie.',
        subtitle: 'Zmluvy písané pre jedno právne prostredie, nie pre galériu šablón.',
        question: 'Ako sa z tvorby zložitého právneho dokumentu stane použiteľný digitálny produkt?',
      },
      es: {
        category: 'LegalTech / IA / Producto',
        shortDescription:
          'Un producto digital para redactar propuestas de contrato para el entorno jurídico checo.',
        subtitle: 'Contratos escritos para una jurisdicción, no para un catálogo de plantillas.',
        question: '¿Cómo puede la creación de un documento legal complejo convertirse en un producto digital usable?',
      },
      sr: {
        category: 'LegalTech / AI / Proizvod',
        shortDescription: 'Digitalni proizvod za izradu predloga ugovora za češko pravno okruženje.',
        subtitle: 'Ugovori pisani za jednu jurisdikciju, a ne za galeriju šablona.',
        question: 'Kako izrada složenog pravnog dokumenta može postati upotrebljiv digitalni proizvod?',
      },
      tr: {
        category: 'LegalTech / YZ / Ürün',
        shortDescription: 'Çek hukuk ortamı için sözleşme taslakları hazırlamaya yönelik dijital bir ürün.',
        subtitle: 'Bir şablon galerisi için değil, belirli bir hukuk düzeni için yazılan sözleşmeler.',
        question: 'Karmaşık bir hukuki belgenin hazırlanması nasıl kullanılabilir bir dijital ürüne dönüşür?',
      },
    },
    prose: {
      en: {
        overview: [
          'Pravo365 is a digital product for drafting contract proposals in the Czech legal environment. It takes structured input from someone who knows what they need and returns a draft they can read, check and take further.',
          'It is deliberately not an "AI lawyer". The product does not give legal advice and nothing in it suggests the draft is final.',
        ],
        context: [
          'Contract drafting is document work: precise, repetitive, and unforgiving of small mistakes. It is also bound to a jurisdiction — a template written for one legal environment is not merely less useful in another, it can be wrong.',
          'Most general-purpose document tools solve the formatting problem and leave the jurisdiction problem to the user. That is the wrong way round.',
        ],
        idea: [
          'Narrow the product until it can actually be trusted. One legal environment, Czech. One language, Czech. A defined set of document types rather than an open text box.',
          'The constraint is the feature. A system that only tries to produce Czech contract proposals can be checked against Czech expectations.',
        ],
        process: [
          'The work splits into three parts that stay separate on purpose: collecting structured input, generating the document, and presenting the result for review.',
          'Structured input matters most. A form that asks the right questions in the right order does more for output quality than any amount of post-processing.',
          'The review step assumes the draft will be edited. Nothing in the interface performs finality it has not earned.',
        ],
        technology: [
          'A generation pipeline behind a structured web interface, with the document assembled from validated inputs rather than from free-form prompting.',
          'Reliability work — confirming that the same input produces the same shape of document — matters more here than model sophistication. A legal draft that varies unpredictably between runs is unusable regardless of how good any single run looks.',
        ],
        currentState: [
          'Live at pravo365.cz, in Czech. The scope is intentionally narrow and is extended one document type at a time.',
        ],
        learning: [
          'In this category, trust is built by what a product refuses to do. Every place the interface declines to sound authoritative makes the parts that do work more believable.',
          'The narrow scope also made the engineering tractable. A general-purpose contract generator would have been easier to describe and far harder to verify.',
        ],
      },
      cs: {
        overview: [
          'Pravo365 je digitální produkt pro tvorbu návrhů smluv v českém právním prostředí. Vezme strukturovaný vstup od člověka, který ví, co potřebuje, a vrátí návrh, který si může přečíst, zkontrolovat a dopracovat.',
          'Záměrně to není „AI právník". Produkt neposkytuje právní poradenství a nic v něm nenaznačuje, že je návrh hotový.',
        ],
        context: [
          'Tvorba smluv je práce s dokumenty: přesná, opakující se a nemilosrdná k drobným chybám. Zároveň je vázaná na jurisdikci — šablona psaná pro jedno právní prostředí není v jiném jen méně užitečná, může být přímo špatně.',
          'Většina obecných nástrojů na dokumenty vyřeší formátování a otázku právního prostředí nechá na uživateli. To je obráceně.',
        ],
        idea: [
          'Zúžit produkt tak, aby se mu dalo věřit. Jedno právní prostředí, české. Jeden jazyk, čeština. Definovaná sada typů dokumentů místo prázdného textového pole.',
          'Omezení je tu funkcí. Systém, který se pokouší dělat pouze české návrhy smluv, se dá poměřit s českými očekáváními.',
        ],
        process: [
          'Práce se dělí na tři části, které zůstávají oddělené záměrně: sběr strukturovaného vstupu, generování dokumentu a předložení výsledku ke kontrole.',
          'Nejdůležitější je strukturovaný vstup. Formulář, který se ptá na správné věci ve správném pořadí, udělá pro kvalitu výstupu víc než jakékoli dodatečné zpracování.',
          'Krok kontroly počítá s tím, že se návrh bude upravovat. Rozhraní nikde nepředstírá hotovost, kterou si nezasloužilo.',
        ],
        technology: [
          'Generovací pipeline za strukturovaným webovým rozhraním, kde dokument vzniká z ověřených vstupů, ne z volného promptování.',
          'Práce na spolehlivosti — ověřování, že stejný vstup dá stejný tvar dokumentu — je tu důležitější než vyspělost modelu. Právní návrh, který se mezi běhy nepředvídatelně mění, je nepoužitelný bez ohledu na to, jak dobře vypadá jeden konkrétní běh.',
        ],
        currentState: [
          'Živě na pravo365.cz, v češtině. Rozsah je záměrně úzký a rozšiřuje se po jednotlivých typech dokumentů.',
        ],
        learning: [
          'V téhle kategorii se důvěra staví tím, co produkt dělat odmítá. Každé místo, kde rozhraní nezní autoritativně, dělá věrohodnějšími ty části, které fungují.',
          'Úzký rozsah zároveň udělal vývoj zvládnutelným. Obecný generátor smluv by se popisoval snáz a ověřoval mnohem hůř.',
        ],
      },
      sk: {
        overview: [
          'Pravo365 je digitálny produkt na tvorbu návrhov zmlúv v českom právnom prostredí. Vezme štruktúrovaný vstup od človeka, ktorý vie, čo potrebuje, a vráti návrh, ktorý si môže prečítať, skontrolovať a dopracovať.',
          'Zámerne to nie je „AI právnik". Produkt neposkytuje právne poradenstvo a nič v ňom nenaznačuje, že je návrh hotový.',
        ],
        context: [
          'Tvorba zmlúv je práca s dokumentmi: presná, opakujúca sa a nemilosrdná k drobným chybám. Zároveň je viazaná na jurisdikciu — šablóna písaná pre jedno právne prostredie nie je v inom len menej užitočná, môže byť priamo nesprávna.',
          'Väčšina všeobecných nástrojov na dokumenty vyrieši formátovanie a otázku právneho prostredia nechá na používateľovi. To je naopak.',
        ],
        idea: [
          'Zúžiť produkt tak, aby sa mu dalo veriť. Jedno právne prostredie, české. Jeden jazyk, čeština. Definovaná sada typov dokumentov namiesto prázdneho textového poľa.',
          'Obmedzenie je tu funkciou. Systém, ktorý sa pokúša robiť iba české návrhy zmlúv, sa dá porovnať s českými očakávaniami.',
        ],
        process: [
          'Práca sa delí na tri časti, ktoré zostávajú oddelené zámerne: zber štruktúrovaného vstupu, generovanie dokumentu a predloženie výsledku na kontrolu.',
          'Najdôležitejší je štruktúrovaný vstup. Formulár, ktorý sa pýta na správne veci v správnom poradí, urobí pre kvalitu výstupu viac než akékoľvek dodatočné spracovanie.',
          'Krok kontroly počíta s tým, že sa návrh bude upravovať. Rozhranie nikde nepredstiera hotovosť, ktorú si nezaslúžilo.',
        ],
        technology: [
          'Generovacia pipeline za štruktúrovaným webovým rozhraním, kde dokument vzniká z overených vstupov, nie z voľného promptovania.',
          'Práca na spoľahlivosti — overovanie, že rovnaký vstup dá rovnaký tvar dokumentu — je tu dôležitejšia než vyspelosť modelu. Právny návrh, ktorý sa medzi behmi nepredvídateľne mení, je nepoužiteľný bez ohľadu na to, ako dobre vyzerá jeden konkrétny beh.',
        ],
        currentState: [
          'Naživo na pravo365.cz, v češtine. Rozsah je zámerne úzky a rozširuje sa po jednotlivých typoch dokumentov.',
        ],
        learning: [
          'V tejto kategórii sa dôvera stavia tým, čo produkt robiť odmieta. Každé miesto, kde rozhranie neznie autoritatívne, robí vierohodnejšími tie časti, ktoré fungujú.',
          'Úzky rozsah zároveň urobil vývoj zvládnuteľným. Všeobecný generátor zmlúv by sa opisoval ľahšie a overoval oveľa horšie.',
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────── MOODPACK / DIRECTOR
  {
    slug: 'moodpack-director',
    title: 'Moodpack / Director',
    disciplines: ['AI', 'Unreal Engine', '3D', 'Agents'],
    short: {
      en: {
        category: 'AI / Unreal Engine / 3D / Experimental Technology',
        shortDescription:
          'An experimental environment exploring how AI can understand and operate Unreal Engine and complex 3D.',
        subtitle: 'Teaching an agent to operate a 3D editor, not to describe one.',
        question:
          'What if AI could understand and operate a complex 3D editor instead of only talking about it?',
      },
      cs: {
        category: 'AI / Unreal Engine / 3D / Experimentální technologie',
        shortDescription:
          'Experimentální prostředí zkoumající, jak může AI rozumět Unreal Enginu a ovládat ho.',
        subtitle: 'Naučit agenta editor ovládat, ne ho popisovat.',
        question:
          'Co kdyby AI dokázala složitý 3D editor nejen popsat, ale skutečně ovládat?',
      },
      sk: {
        category: 'AI / Unreal Engine / 3D / Experimentálna technológia',
        shortDescription:
          'Experimentálne prostredie skúmajúce, ako môže AI rozumieť Unreal Enginu a ovládať ho.',
        subtitle: 'Naučiť agenta editor ovládať, nie ho opisovať.',
        question:
          'Čo ak by AI dokázala zložitý 3D editor nielen opísať, ale skutočne ovládať?',
      },
      es: {
        category: 'IA / Unreal Engine / 3D / Tecnología experimental',
        shortDescription:
          'Un entorno experimental que explora cómo la IA puede entender y operar Unreal Engine y 3D complejo.',
        subtitle: 'Enseñar a un agente a operar un editor 3D, no a describirlo.',
        question: '¿Y si la IA pudiera entender y operar un editor 3D complejo en lugar de solo hablar de él?',
      },
      sr: {
        category: 'AI / Unreal Engine / 3D / Eksperimentalna tehnologija',
        shortDescription:
          'Eksperimentalno okruženje koje istražuje kako AI može da razume i upravlja Unreal Engine-om i složenim 3D-om.',
        subtitle: 'Naučiti agenta da upravlja 3D editorom, a ne da ga opisuje.',
        question: 'Šta ako bi AI mogla da razume i upravlja složenim 3D editorom, umesto da samo priča o njemu?',
      },
      tr: {
        category: 'YZ / Unreal Engine / 3B / Deneysel teknoloji',
        shortDescription:
          'Yapay zekânın Unreal Engine’i ve karmaşık 3B’yi nasıl anlayıp kullanabileceğini araştıran deneysel bir ortam.',
        subtitle: 'Bir ajana 3B editörü anlatmayı değil, kullanmayı öğretmek.',
        question: 'Ya yapay zekâ karmaşık bir 3B editörü hakkında konuşmak yerine onu gerçekten kullanabilseydi?',
      },
    },
    prose: {
      en: {
        overview: [
          'Moodpack / Director is an experimental environment for connecting AI agents to Unreal Engine — not to generate pictures of 3D scenes, but to operate the editor that builds them.',
        ],
        context: [
          'Language models are fluent about 3D work and largely unable to do it. They can describe a scene, name the right tools and explain a workflow, then produce nothing that exists inside the software.',
          'The gap is not knowledge. It is state: an editor is a live environment with a selection, a hierarchy, a coordinate system and consequences, and none of that is present in a text prompt.',
        ],
        idea: [
          'Give the agent real handles on the editor and a way to read back what happened. Actions become tools, the scene becomes observable state, and the loop closes.',
        ],
        process: [
          'The system is built as a control layer between an agent and the editor. Commands are explicit and inspectable rather than free-form, so a failed action is a readable failure instead of silence.',
          'Much of the work turns out to be spatial rather than linguistic — placement, collision, orientation, whether an object ended up where it was asked to go.',
          'Each experiment stays small and repeatable: request one operation, observe the scene, compare against intent.',
        ],
        technology: [
          'Unreal Engine as the environment, with an agent-facing command surface on one side and scene inspection on the other. Object and sound generation exist as separate generators feeding the same environment.',
        ],
        experiments: [
          'The recurring test is spatial reasoning. An agent can produce a perfectly plausible sentence about where a chair should go and still place it inside a wall.',
          'Collision and placement work is therefore the honest measure of progress — more so than any transcript of the agent explaining itself.',
        ],
        currentState: [
          'In development, and an experiment rather than a product. It is not an autonomous system and is not presented as one.',
        ],
        learning: [
          'The bottleneck is not the model’s vocabulary but its grip on state. Progress came from making the environment more legible to the agent, not from asking the agent more elaborately.',
        ],
      },
      cs: {
        overview: [
          'Moodpack / Director je experimentální prostředí pro propojení AI agentů s Unreal Enginem — ne kvůli generování obrázků 3D scén, ale kvůli ovládání editoru, ve kterém scény vznikají.',
        ],
        context: [
          'Jazykové modely mluví o 3D práci plynule a většinou ji neumí dělat. Dokážou popsat scénu, pojmenovat správné nástroje a vysvětlit postup — a nevznikne nic, co by v softwaru existovalo.',
          'Mezera není ve znalostech. Je ve stavu: editor je živé prostředí s výběrem, hierarchií, souřadnicovým systémem a důsledky, a nic z toho v textovém promptu není.',
        ],
        idea: [
          'Dát agentovi skutečné úchyty na editor a způsob, jak si přečíst, co se stalo. Z akcí se stanou nástroje, ze scény pozorovatelný stav, a smyčka se uzavře.',
        ],
        process: [
          'Systém je postavený jako řídicí vrstva mezi agentem a editorem. Příkazy jsou explicitní a kontrolovatelné, ne volné, takže neúspěšná akce je čitelné selhání, ne ticho.',
          'Velká část práce je nakonec prostorová, ne jazyková — umístění, kolize, orientace, jestli objekt skončil tam, kam měl.',
          'Každý experiment zůstává malý a opakovatelný: vyžádat jednu operaci, pozorovat scénu, porovnat se záměrem.',
        ],
        technology: [
          'Unreal Engine jako prostředí, na jedné straně příkazové rozhraní pro agenta, na druhé čtení stavu scény. Generování objektů a zvuku existuje jako samostatné generátory napojené na stejné prostředí.',
        ],
        experiments: [
          'Opakovaným testem je prostorové uvažování. Agent umí vyprodukovat naprosto věrohodnou větu o tom, kam patří židle, a přesto ji umístit do zdi.',
          'Práce s kolizemi a umísťováním je proto poctivější mírou pokroku než jakýkoli přepis toho, jak se agent vysvětluje.',
        ],
        currentState: [
          'Ve vývoji, a spíš experiment než produkt. Není to autonomní systém a ani se tak neprezentuje.',
        ],
        learning: [
          'Úzkým hrdlem není slovní zásoba modelu, ale jeho úchop stavu. Pokrok přišel z toho, že se prostředí stalo pro agenta čitelnějším — ne z důmyslnějšího zadávání.',
        ],
      },
      sk: {
        overview: [
          'Moodpack / Director je experimentálne prostredie na prepojenie AI agentov s Unreal Enginom — nie kvôli generovaniu obrázkov 3D scén, ale kvôli ovládaniu editora, v ktorom scény vznikajú.',
        ],
        context: [
          'Jazykové modely hovoria o 3D práci plynulo a väčšinou ju nevedia robiť. Dokážu opísať scénu, pomenovať správne nástroje a vysvetliť postup — a nevznikne nič, čo by v softvéri existovalo.',
          'Medzera nie je vo vedomostiach. Je v stave: editor je živé prostredie s výberom, hierarchiou, súradnicovým systémom a dôsledkami, a nič z toho v textovom prompte nie je.',
        ],
        idea: [
          'Dať agentovi skutočné úchyty na editor a spôsob, ako si prečítať, čo sa stalo. Z akcií sa stanú nástroje, zo scény pozorovateľný stav, a slučka sa uzavrie.',
        ],
        process: [
          'Systém je postavený ako riadiaca vrstva medzi agentom a editorom. Príkazy sú explicitné a kontrolovateľné, nie voľné, takže neúspešná akcia je čitateľné zlyhanie, nie ticho.',
          'Veľká časť práce je napokon priestorová, nie jazyková — umiestnenie, kolízie, orientácia, či objekt skončil tam, kam mal.',
          'Každý experiment zostáva malý a opakovateľný: vyžiadať jednu operáciu, pozorovať scénu, porovnať so zámerom.',
        ],
        technology: [
          'Unreal Engine ako prostredie, na jednej strane príkazové rozhranie pre agenta, na druhej čítanie stavu scény. Generovanie objektov a zvuku existuje ako samostatné generátory napojené na rovnaké prostredie.',
        ],
        experiments: [
          'Opakovaným testom je priestorové uvažovanie. Agent vie vyprodukovať úplne vierohodnú vetu o tom, kam patrí stolička, a napriek tomu ju umiestniť do steny.',
          'Práca s kolíziami a umiestňovaním je preto poctivejšou mierou pokroku než akýkoľvek prepis toho, ako sa agent vysvetľuje.',
        ],
        currentState: [
          'Vo vývoji, a skôr experiment než produkt. Nie je to autonómny systém a ani sa tak neprezentuje.',
        ],
        learning: [
          'Úzkym hrdlom nie je slovná zásoba modelu, ale jeho úchop stavu. Pokrok prišiel z toho, že sa prostredie stalo pre agenta čitateľnejším — nie z dômyselnejšieho zadávania.',
        ],
      },
    },
  },
]
