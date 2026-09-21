import type { Dictionary } from '../dictionary';

/**
 * Working translation. Latin script only — no Cyrillic anywhere in this file.
 * Marked as a draft in the UI until it is reviewed.
 */
export const sr: Dictionary = {
  meta: {
    title: 'Denis Mitrović — Pretvaram ideje u stvarnost',
    description:
      'Creative technologist, edukator i trener pokreta: sajtovi i AI proizvodi, 3D i Unreal Engine, projektni labovi za škole, cirkus i snoubording.',
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
    title: 'Zdravo, ja sam Denis',
    arc: ['Tehnologija', 'Učenje', 'Pokret', 'Stvaranje'],
    paragraphs: [
      'Gradim sajtove, digitalne proizvode i stvari sa AI — od sajta za malu firmu, preko Pravo365, do plugina za Unreal Engine i saradnje na projektu Splatoo. A posle godina podučavanja, i dalje me najviše zanima kako ljudi zaista uče i šta ih pri tome drži.',
      'Druga polovina je pokret. Sa decom i mladima radim savremeni cirkus — žongliranje, ravnotežu, akrobatiku — a na stazi učim ljude prve zavoje na snoubordu. Najviše volim trenutak kada nešto što dugo nije išlo odjednom krene. Probaš, ne ide, promeniš jednu stvar, kreneš ponovo.',
      'Sa tehnologijom je potpuno isto, samo brže: od maglovite ideje za nekoliko sati nastane nešto na šta može da se klikne. Zato je sve na jednom sajtu. Slobodno razgledaj, poigraj se u Labu — a ako imaš ideju koja još nema oblik, piši mi. Takve najviše volim.',
    ],
    pull: 'Pravim stvari sa tehnologijom, učim ljude i mnogo se krećem. I ne želim da biram samo jedno.',
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
    title: 'Imaš nešto na umu?',
    lead: 'Hajde da popričamo. Nedovršene misli su dobrodošle — tu obično počinje ono zanimljivo.',
    emailCta: 'Piši mi',
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
    embed: {
      load: 'Učitaj 3D scenu',
      note: 'Ništa se ne učitava dok ne kliknete: scena dolazi sa {host} i radi u vašem pregledaču.',
      open: 'Otvori u novom prozoru',
    },
  },
  notFound: {
    title: 'Ove stranice nema.',
    lead: 'Adresa je možda pogrešno ukucana ili je stranica premeštena otkad je link napravljen.',
    home: 'Nazad na početnu',
    languages: 'Ili izaberite jezik',
  },
  footer: {
    colophon: 'Ovaj sajt nastaje isto kao i projekti: ručno, na otvorenom i još uvek se menja.',
    backToTop: 'Na vrh',
    languageLabel: 'Promeni jezik',
    workingTranslation: 'Ovaj prevod je radna verzija.',
  },
};
