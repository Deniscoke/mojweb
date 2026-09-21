import type { Dictionary } from '../dictionary';

/** Working translation. Marked as a draft in the UI until it is reviewed. */
export const es: Dictionary = {
  meta: {
    title: 'Denis Mitrović — Hago que las ideas sean reales',
    description:
      'Creative technologist, educador y entrenador de movimiento: webs y productos con IA, 3D y Unreal Engine, labs de proyectos para escuelas, circo y snowboard.',
  },
  nav: {
    work: 'Trabajo',
    lab: 'Lab',
    about: 'Sobre mí',
    contact: 'Contacto',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    language: 'Idioma',
    skipToContent: 'Ir al contenido',
    home: 'Inicio',
  },
  hero: {
    statement: 'Hago que las ideas sean reales.',
    intro: 'Cinco proyectos, ocho preguntas abiertas y el registro de lo que pasó entremedias.',
    scrollCue: 'Desplázate',
  },
  work: {
    label: 'Trabajo seleccionado',
    title: 'En lo que estoy trabajando',
    lead: 'Parte de esto funciona. Parte se queda en experimento.',
    viewProject: 'Abrir proyecto',
    noLinkYet: 'Todavía no es público',
    statusLabel: 'Estado',
    status: {
      live: 'En vivo',
      'in-development': 'En desarrollo',
      prototype: 'Prototipo',
      experiment: 'Experimento',
      ongoing: 'En curso',
    },
  },
  credo: [
    { word: 'Construir', hint: 'Webs, productos digitales, IA, automatización' },
    { word: 'Enseñar', hint: 'Aprendizaje, tecnología, talleres, escuelas' },
    { word: 'Moverse', hint: 'Circo, movimiento, snowboard' },
    { word: 'Explorar', hint: 'IA, Unreal, tecnología creativa, experimentos' },
  ],
  services: {
    label: 'En qué puedo ayudar',
    title: 'Dónde puedo ser útil',
    lead: 'Algunas cosas se solapan. Lo interesante suele estar entre ellas.',
    items: [
      {
        title: 'Sitios web',
        body: 'Sitios completos, rediseños y landing pages, o uno existente más rápido y fácil de mantener.',
      },
      {
        title: 'IA y automatización',
        body: 'IA que hace trabajo comprobable, más integraciones de API, automatización y la fontanería de debajo.',
      },
      {
        title: 'Talleres',
        body: 'Sesiones prácticas donde la gente construye algo en vez de mirar diapositivas.',
      },
      {
        title: 'Educación',
        body: 'Trabajo externo con escuelas: aprendizaje compatible con el cerebro, pedagogía intuitiva, IA en educación, formación docente.',
      },
      {
        title: 'Circo',
        body: 'Talleres de circo y movimiento para niños y jóvenes, regulares o puntuales.',
      },
      {
        title: 'Snowboard',
        body: 'Clases de snowboard para principiantes, niños y adultos, en Vysočina.',
      },
      {
        title: 'Consultoría',
        body: 'Una idea confusa, o un problema que aún no tiene forma. Podemos empezar ahí.',
      },
    ],
  },
  lab: {
    label: 'Lab',
    title: 'Preguntas abiertas',
    lead: 'Preguntas que todavía no he terminado de responder.',
    indexTitle: 'El Lab',
    indexLead: 'Experimentos, notas y preguntas. Más cortos y más crudos que los proyectos, y a veces sin respuesta.',
    all: 'Todos los experimentos',
    open: 'Abrir nota',
    states: {
      'open-question': 'Pregunta abierta',
      'in-progress': 'En curso',
      ongoing: 'Continuo',
    },
    headings: {
      tried: 'Lo que probé',
      happened: 'Lo que pasó',
      next: 'Siguiente pregunta',
    },
    relatedProject: 'Proyecto relacionado',
    noteOnly: 'Todavía sin registro escrito.',
  },
  about: {
    label: 'Sobre mí',
    title: 'Hola, soy Denis',
    arc: ['Tecnología', 'Aprendizaje', 'Movimiento', 'Creación'],
    paragraphs: [
      'Construyo webs, productos digitales y cosas con IA: desde la web de un pequeño negocio, pasando por Pravo365, hasta un plugin para Unreal Engine y una colaboración en Splatoo. Y después de años enseñando, lo que más me sigue interesando es cómo aprende de verdad la gente y qué hace que siga adelante.',
      'La otra mitad es el movimiento. Hago circo contemporáneo con niños y jóvenes —malabares, equilibrio, acrobacias— y en la pista enseño a la gente sus primeros giros en snowboard. Lo que más me gusta es el momento en que algo que llevaba tiempo sin salir de pronto sale. Lo intentas, no sale, cambias una cosa, vuelves a empezar.',
      'Con la tecnología pasa exactamente lo mismo, solo que más rápido: en unas horas, una idea difusa se convierte en algo en lo que se puede hacer clic. Por eso está todo en la misma web. Echa un vistazo, juega un rato en el Lab y, si tienes una idea que todavía no tiene forma, escríbeme. Esas son mis favoritas.',
    ],
    pull: 'Hago cosas con tecnología, enseño y me muevo mucho. Y no me apetece elegir solo una.',
  },
  currently: {
    label: 'Ahora mismo',
    kinds: {
      building: 'Ahora construyendo',
      exploring: 'Ahora explorando',
      experimenting: 'Ahora experimentando con',
      thinking: 'Ahora pensando en',
    },
  },
  contact: {
    label: 'Colaborar',
    title: '¿Tienes algo en mente?',
    lead: 'Hablemos. Las ideas a medio hacer son bienvenidas: ahí suele empezar lo interesante.',
    emailCta: 'Escríbeme',
    pending: 'Los datos de contacto se están añadiendo.',
    elsewhere: 'En otros sitios',
  },
  project: {
    backToWork: 'Todos los proyectos',
    next: 'Siguiente proyecto',
    visit: 'Visitar el sitio',
    disciplines: 'Disciplinas',
    statusLabel: 'Estado',
    untranslated: 'Este caso todavía no está traducido. Se muestra en inglés.',
    headings: {
      overview: 'Resumen',
      context: 'Contexto',
      idea: 'Idea',
      process: 'Proceso',
      technology: 'Tecnología',
      experiments: 'Experimentos',
      state: 'Estado actual',
      learning: 'Lo que aprendí',
      practice: 'En qué consiste',
      people: 'Para quién',
      availability: 'Disponible para',
    },
    relatedExperiments: 'Experimentos relacionados',
    evidence: 'Evidencia',
    mediaPending: 'Aún sin capturar',
    embed: {
      load: 'Cargar la escena 3D',
      note: 'No se carga nada hasta que lo pidas: la escena viene de {host} y se ejecuta en tu navegador.',
      open: 'Abrir en una ventana nueva',
    },
  },
  notFound: {
    title: 'Esta página no está aquí.',
    lead: 'Puede que la dirección esté mal escrita o que la página se haya movido desde que se creó el enlace.',
    home: 'Volver al inicio',
    languages: 'O elige un idioma',
  },
  footer: {
    colophon: 'Esta web se construye igual que los proyectos: a mano, a la vista y todavía cambiando.',
    backToTop: 'Volver arriba',
    languageLabel: 'Cambiar idioma',
    workingTranslation: 'Esta traducción es un borrador de trabajo.',
  },
};
