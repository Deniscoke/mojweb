import type { Dictionary } from '../dictionary';

export const en: Dictionary = {
  meta: {
    title: 'Denis Mitrović — I make ideas real',
    description:
      'Creative technologist and product builder working across technology, education, AI and creative work. Projects, prototypes and experiments.',
  },
  nav: {
    work: 'Work',
    lab: 'Lab',
    about: 'About',
    contact: 'Contact',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
    skipToContent: 'Skip to content',
    home: 'Home',
  },
  hero: {
    statement: 'I make ideas real.',
    intro: 'Five projects, eight open questions, and the record of what happened in between.',
    scrollCue: 'Scroll',
  },
  work: {
    label: 'Selected work',
    title: 'Things I am building',
    lead: 'Some of it ships. Some of it stays an experiment.',
    viewProject: 'Open project',
    noLinkYet: 'Not public yet',
    statusLabel: 'Status',
    status: {
      live: 'Live',
      'in-development': 'In development',
      prototype: 'Prototype',
      experiment: 'Experiment',
      ongoing: 'Ongoing',
    },
  },
  credo: [
    { word: 'Build', hint: 'Websites, digital products, AI, automation' },
    { word: 'Teach', hint: 'Learning, technology, workshops, schools' },
    { word: 'Move', hint: 'Circus, movement, snowboarding' },
    { word: 'Explore', hint: 'AI, Unreal, creative technology, experiments' },
  ],
  services: {
    label: 'Things I can help with',
    title: 'Where I can be useful',
    lead: 'Some of these overlap. The interesting work usually sits between them.',
    items: [
      {
        title: 'Websites',
        body: 'Complete sites, redesigns and landing pages — or an existing one made faster and easier to run.',
      },
      {
        title: 'AI & Automation',
        body: 'AI that does work you can check, plus API integrations, automation and the plumbing behind them.',
      },
      {
        title: 'Workshops',
        body: 'Hands-on sessions where people build something rather than watch slides.',
      },
      {
        title: 'Education',
        body: 'External work with schools: brain-compatible learning, intuitive pedagogy, AI in education, teacher training.',
      },
      {
        title: 'Circus',
        body: 'Circus and movement workshops for children and young people, regular or short-term.',
      },
      {
        title: 'Snowboarding',
        body: 'Beginner snowboard instruction for children and adults, in Vysočina.',
      },
      {
        title: 'Consulting',
        body: 'A messy idea, or a problem you have not shaped yet. We can start there.',
      },
    ],
  },
  lab: {
    label: 'Lab',
    title: 'Open questions',
    lead: 'Questions I have not finished answering.',
    indexTitle: 'The Lab',
    indexLead: 'Experiments, notes and questions. Shorter and rougher than the projects, and sometimes without an answer.',
    all: 'All experiments',
    open: 'Open note',
    states: {
      'open-question': 'Open question',
      'in-progress': 'In progress',
      ongoing: 'Ongoing',
    },
    headings: {
      tried: 'What I tried',
      happened: 'What happened',
      next: 'Next question',
    },
    relatedProject: 'Related project',
    noteOnly: 'No written log yet.',
  },
  about: {
    label: 'About',
    title: 'How this came together',
    paragraphs: [
      'Several years of intensive teaching turned out to be an unusually practical laboratory: a place to watch how people actually learn, what keeps them going, and how they reach for technology when nobody is grading them on it.',
      'Movement taught the same thing from the other side. In circus and on a snowboard the progress is physical, repetitive and fairly unsentimental — you try, it does not work, you change one thing, you go again.',
      'Technology is where that loop runs fastest: an idea becomes a system or a product, and the feedback arrives in hours rather than seasons. The three are on one site because they are the same habit applied to different material.',
    ],
    pull: 'Not a teacher who moved into tech — someone who connects disciplines and turns vague ideas into things you can actually test.',
  },
  currently: {
    label: 'Currently',
    kinds: {
      building: 'Currently building',
      exploring: 'Currently exploring',
      experimenting: 'Currently experimenting with',
      thinking: 'Currently thinking about',
    },
  },
  contact: {
    label: 'Collaborate',
    title: 'Have something in mind?',
    lead: 'Let’s talk. Unfinished thoughts are welcome — that is usually where the interesting work starts.',
    emailCta: 'Write to me',
    pending: 'Contact details are being added.',
    elsewhere: 'Elsewhere',
  },
  project: {
    backToWork: 'All work',
    next: 'Next project',
    visit: 'Visit site',
    disciplines: 'Disciplines',
    statusLabel: 'Status',
    untranslated: 'This case study has not been translated yet. It is shown in English.',
    headings: {
      overview: 'Overview',
      context: 'Context',
      idea: 'Idea',
      process: 'Process',
      technology: 'Technology',
      experiments: 'Experiments',
      state: 'Current state',
      learning: 'What I learned',
      practice: 'What it involves',
      people: 'Who it’s for',
      availability: 'Available for',
    },
    relatedExperiments: 'Related experiments',
    evidence: 'Evidence',
    mediaPending: 'Not captured yet',
  },
  footer: {
    colophon: 'This site is built the way the projects are: by hand, in the open, still changing.',
    backToTop: 'Back to top',
    languageLabel: 'Change language',
    workingTranslation: 'This translation is a working draft.',
  },
};
