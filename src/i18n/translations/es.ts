import type { Dictionary } from '../dictionary';

/** Working translation. Marked as a draft in the UI until it is reviewed. */
export const es: Dictionary = {
  meta: {
    title: 'Denis Mitrović — Hago que las ideas sean reales',
    description:
      'Creative technologist y product builder entre tecnología, educación, IA y trabajo creativo. Proyectos, prototipos y experimentos.',
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
    title: 'Cómo surgió esto',
    paragraphs: [
      'Varios años de enseñanza intensiva resultaron ser un laboratorio inusualmente práctico: un sitio donde se ve cómo aprende la gente de verdad, qué la mantiene y cómo recurre a la tecnología cuando nadie la califica por ello.',
      'El movimiento enseña lo mismo desde el otro lado. En el circo y sobre una tabla el progreso es físico, repetitivo y bastante poco sentimental: lo intentas, no sale, cambias una cosa, vuelves a empezar.',
      'En la tecnología ese bucle corre más rápido: una idea se convierte en un sistema o un producto y la respuesta llega en horas, no en temporadas. Están en la misma web porque son el mismo hábito aplicado a materiales distintos.',
    ],
    pull: 'No es un profesor que se pasó a la tecnología: es alguien que conecta disciplinas y convierte ideas vagas en algo que se puede probar.',
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
  footer: {
    colophon: 'Esta web se construye igual que los proyectos: a mano, a la vista y todavía cambiando.',
    backToTop: 'Volver arriba',
    languageLabel: 'Cambiar idioma',
    workingTranslation: 'Esta traducción es un borrador de trabajo.',
  },
};
