import type { Dictionary } from '../dictionary';

/**
 * Working translation. Latin script only — no Cyrillic anywhere in this file.
 * Marked as a draft in the UI until it is reviewed.
 */
export const sr: Dictionary = {
  meta: {
    title: 'Denis Mitrović — Pretvaram ideje u stvarnost',
    description:
      'Creative technologist i product builder na preseku tehnologije, obrazovanja, AI i kreativnog rada. Projekti, prototipovi i eksperimenti.',
  },
  nav: {
    work: 'Radovi',
    lab: 'Lab',
    about: 'O meni',
    contact: 'Kontakt',
    openMenu: 'Otvori meni',
    closeMenu: 'Zatvori meni',
    language: 'Jezik',
    skipToContent: 'Pređi na sadržaj',
    home: 'Početna',
  },
  hero: {
    statement: 'Pretvaram ideje u stvarnost.',
    intro: 'Pet projekata, osam otvorenih pitanja i zapis o tome šta se dešavalo između.',
    scrollCue: 'Skrolujte',
  },
  work: {
    label: 'Izabrani radovi',
    title: 'Na čemu radim',
    lead: 'Nešto od ovoga radi. Nešto ostaje eksperiment.',
    viewProject: 'Otvori projekat',
    noLinkYet: 'Još nije javno',
    statusLabel: 'Status',
    status: {
      live: 'Uživo',
      'in-development': 'U razvoju',
      prototype: 'Prototip',
      experiment: 'Eksperiment',
      ongoing: 'Kontinuirano',
    },
  },
  credo: [
    { word: 'Graditi', hint: 'Sajtovi, digitalni proizvodi, AI, automatizacija' },
    { word: 'Učiti', hint: 'Učenje, tehnologija, radionice, škole' },
    { word: 'Kretati se', hint: 'Cirkus, pokret, snoubording' },
    { word: 'Istraživati', hint: 'AI, Unreal, kreativna tehnologija, eksperimenti' },
  ],
  services: {
    label: 'S čim mogu da pomognem',
    title: 'Gde mogu da budem koristan',
    lead: 'Nešto od ovoga se preklapa. Zanimljivo obično stoji između.',
    items: [
      {
        title: 'Veb sajtovi',
        body: 'Kompletni sajtovi, redizajni i landing stranice — ili postojeći sajt brži i lakši za održavanje.',
      },
      {
        title: 'AI i automatizacija',
        body: 'AI koji radi posao koji može da se proveri, plus API integracije, automatizacija i vodovod ispod toga.',
      },
      {
        title: 'Radionice',
        body: 'Susreti na kojima ljudi nešto naprave, umesto da gledaju slajdove.',
      },
      {
        title: 'Obrazovanje',
        body: 'Spoljašnji rad sa školama: učenje usklađeno sa mozgom, intuitivna pedagogija, AI u nastavi, obuka nastavnika.',
      },
      {
        title: 'Cirkus',
        body: 'Cirkuske i pokretne radionice za decu i mlade, redovno ili kratkoročno.',
      },
      {
        title: 'Snoubording',
        body: 'Obuka snoubordinga za početnike — decu i odrasle, u regionu Vysočina.',
      },
      {
        title: 'Konsultacije',
        body: 'Nejasna ideja, ili problem koji još nema oblik. Možemo početi odatle.',
      },
    ],
  },
  lab: {
    label: 'Lab',
    title: 'Otvorena pitanja',
    lead: 'Pitanja na koja još nisam odgovorio.',
    indexTitle: 'Lab',
    indexLead: 'Eksperimenti, beleške i pitanja. Kraći i siroviji od projekata, ponekad bez odgovora.',
    all: 'Svi eksperimenti',
    open: 'Otvori belešku',
    states: {
      'open-question': 'Otvoreno pitanje',
      'in-progress': 'U toku',
      ongoing: 'Kontinuirano',
    },
    headings: {
      tried: 'Šta sam probao',
      happened: 'Šta se desilo',
      next: 'Sledeće pitanje',
    },
    relatedProject: 'Povezani projekat',
    noteOnly: 'Još uvek bez zapisa.',
  },
  about: {
    label: 'O meni',
    title: 'Kako je ovo nastalo',
    paragraphs: [
      'Nekoliko godina intenzivnog rada u nastavi ispostavilo se kao neobično praktična laboratorija: mesto na kom se vidi kako ljudi zaista uče, šta ih drži i kako posežu za tehnologijom kada im niko za to ne daje ocenu.',
      'Pokret uči isto to sa druge strane. U cirkusu i na dasci napredak je fizički, ponavljajući i prilično nesentimentalan — probaš, ne ide, promeniš jednu stvar, kreneš ponovo.',
      'U tehnologiji ta petlja teče najbrže: ideja postaje sistem ili proizvod, a povratna informacija stiže za sate, a ne za sezonu. Na istom su sajtu jer su ista navika primenjena na različit materijal.',
    ],
    pull: 'Nije nastavnik koji je prešao u IT — to je neko ko povezuje discipline i pretvara nejasne ideje u nešto što može da se testira.',
  },
  currently: {
    label: 'Trenutno',
    kinds: {
      building: 'Trenutno gradim',
      exploring: 'Trenutno istražujem',
      experimenting: 'Trenutno eksperimentišem sa',
      thinking: 'Trenutno razmišljam o',
    },
  },
  contact: {
    label: 'Saradnja',
    title: 'Imate nešto na umu?',
    lead: 'Hajde da popričamo. Nedovršene misli su dobrodošle — tu obično počinje ono zanimljivo.',
    emailCta: 'Pišite mi',
    pending: 'Kontakt podaci se dodaju.',
    elsewhere: 'Drugde',
  },
  project: {
    backToWork: 'Svi projekti',
    next: 'Sledeći projekat',
    visit: 'Otvori sajt',
    disciplines: 'Discipline',
    statusLabel: 'Status',
    untranslated: 'Ova studija slučaja još nije prevedena. Prikazana je na engleskom.',
    headings: {
      overview: 'Pregled',
      context: 'Kontekst',
      idea: 'Ideja',
      process: 'Proces',
      technology: 'Tehnologija',
      experiments: 'Eksperimenti',
      state: 'Trenutno stanje',
      learning: 'Šta sam naučio',
      practice: 'Šta obuhvata',
      people: 'Za koga',
      availability: 'Dostupno za',
    },
    relatedExperiments: 'Povezani eksperimenti',
    evidence: 'Dokazi',
    mediaPending: 'Još nije zabeleženo',
  },
  footer: {
    colophon: 'Ovaj sajt nastaje isto kao i projekti: ručno, na otvorenom i još uvek se menja.',
    backToTop: 'Na vrh',
    languageLabel: 'Promeni jezik',
    workingTranslation: 'Ovaj prevod je radna verzija.',
  },
};
