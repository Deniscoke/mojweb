import type { Dictionary } from '../dictionary';

/** Working translation. Marked as a draft in the UI until it is reviewed. */
export const tr: Dictionary = {
  meta: {
    title: 'Denis Mitrović — Fikirleri gerçeğe dönüştürüyorum',
    description:
      'Teknoloji, eğitim, yapay zekâ ve yaratıcı işin kesişiminde çalışan bir creative technologist ve product builder. Projeler, prototipler ve denemeler.',
  },
  nav: {
    work: 'İşler',
    lab: 'Lab',
    about: 'Hakkımda',
    contact: 'İletişim',
    openMenu: 'Menüyü aç',
    closeMenu: 'Menüyü kapat',
    language: 'Dil',
    skipToContent: 'İçeriğe geç',
    home: 'Ana sayfa',
  },
  hero: {
    statement: 'Fikirleri gerçeğe dönüştürüyorum.',
    intro: 'Beş proje, sekiz açık soru ve arada olup bitenlerin kaydı.',
    scrollCue: 'Kaydır',
  },
  work: {
    label: 'Seçilmiş işler',
    title: 'Üzerinde çalıştıklarım',
    lead: 'Bir kısmı çalışıyor. Bir kısmı deney olarak kalıyor.',
    viewProject: 'Projeyi aç',
    noLinkYet: 'Henüz herkese açık değil',
    statusLabel: 'Durum',
    status: {
      live: 'Yayında',
      'in-development': 'Geliştiriliyor',
      prototype: 'Prototip',
      experiment: 'Deneme',
      ongoing: 'Süregelen',
    },
  },
  credo: [
    { word: 'İnşa et', hint: 'Web siteleri, dijital ürünler, YZ, otomasyon' },
    { word: 'Öğret', hint: 'Öğrenme, teknoloji, atölyeler, okullar' },
    { word: 'Hareket et', hint: 'Sirk, hareket, snowboard' },
    { word: 'Keşfet', hint: 'YZ, Unreal, yaratıcı teknoloji, deneyler' },
  ],
  services: {
    label: 'Nelerde yardımcı olabilirim',
    title: 'Nerede işe yarayabilirim',
    lead: 'Bazıları birbirine giriyor. İlginç olan genelde aralarında duruyor.',
    items: [
      {
        title: 'Web siteleri',
        body: 'Eksiksiz siteler, yeniden tasarımlar ve landing sayfaları — ya da mevcut bir siteyi hızlandırmak.',
      },
      {
        title: 'YZ ve otomasyon',
        body: 'Denetlenebilir iş yapan yapay zekâ, artı API entegrasyonları, otomasyon ve alttaki tesisat.',
      },
      {
        title: 'Atölyeler',
        body: 'İnsanların slayt izlemek yerine bir şey inşa ettiği uygulamalı oturumlar.',
      },
      {
        title: 'Eğitim',
        body: 'Okullarla dış arıdan çalışma: beyne uygun öğrenme, sezgisel pedagoji, eğitimde yapay zekâ, öğretmen eğitimi.',
      },
      {
        title: 'Sirk',
        body: 'Çocuklar ve gençler için düzenli ya da kısa süreli sirk ve hareket atölyeleri.',
      },
      {
        title: 'Snowboard',
        body: 'Vysočina’da çocuklar ve yetişkinler için başlangıç snowboard eğitimi.',
      },
      {
        title: 'Danışmanlık',
        body: 'Dağınık bir fikir ya da henüz biçimlenmemiş bir sorun. Oradan başlayabiliriz.',
      },
    ],
  },
  lab: {
    label: 'Lab',
    title: 'Açık sorular',
    lead: 'Yanıtlamayı henüz bitirmediğim sorular.',
    indexTitle: 'Lab',
    indexLead: 'Deneyler, notlar ve sorular. Projelerden daha kısa ve daha ham, bazen de yanıtsız.',
    all: 'Tüm deneyler',
    open: 'Notu aç',
    states: {
      'open-question': 'Açık soru',
      'in-progress': 'Devam ediyor',
      ongoing: 'Süregelen',
    },
    headings: {
      tried: 'Ne denedim',
      happened: 'Ne oldu',
      next: 'Sonraki soru',
    },
    relatedProject: 'İlgili proje',
    noteOnly: 'Henüz yazılı kayıt yok.',
  },
  about: {
    label: 'Hakkımda',
    title: 'Bu nasıl bir araya geldi',
    paragraphs: [
      'Birkaç yıl süren yoğun öğretmenlik, alışılmadık ölçüde pratik bir laboratuvara dönüştü: insanların gerçekte nasıl öğrendiğini, onları neyin sürdürdüğünü ve kimse not vermezken teknolojiye nasıl uzandıklarını görebildiğim bir yer.',
      'Hareket aynı şeyi öbür taraftan öğretiyor. Sirkte ve tahtanın üstünde ilerleme bedensel, tekrarlı ve oldukça duygusuzdur — denersin, olmaz, bir şeyi değiştirirsin, yeniden başlarsın.',
      'Bu döngü en hızlı teknolojide işliyor: bir fikir sisteme ya da ürüne dönüşüyor ve geri bildirim mevsimlerle değil saatlerle geliyor. Aynı sitede olmalarının nedeni, farklı malzemeye uygulanan aynı alışkanlık olmaları.',
    ],
    pull: 'Teknolojiye geçmiş bir öğretmen değil — disiplinleri birbirine bağlayan ve belirsiz fikirleri test edilebilir şeylere dönüştüren biri.',
  },
  currently: {
    label: 'Şu anda',
    kinds: {
      building: 'Şu anda geliştirdiğim',
      exploring: 'Şu anda araştırdığım',
      experimenting: 'Şu anda denediğim',
      thinking: 'Şu anda düşündüğüm',
    },
  },
  contact: {
    label: 'İş birliği',
    title: 'Aklınızda bir şey mi var?',
    lead: 'Konuşalım. Yarım kalmış düşünceler memnuniyetle karşılanır — ilginç iş genelde orada başlar.',
    emailCta: 'Bana yazın',
    pending: 'İletişim bilgileri ekleniyor.',
    elsewhere: 'Diğer yerler',
  },
  project: {
    backToWork: 'Tüm projeler',
    next: 'Sonraki proje',
    visit: 'Siteyi aç',
    disciplines: 'Disiplinler',
    statusLabel: 'Durum',
    untranslated: 'Bu vaka çalışması henüz çevrilmedi. İngilizce gösteriliyor.',
    headings: {
      overview: 'Genel bakış',
      context: 'Bağlam',
      idea: 'Fikir',
      process: 'Süreç',
      technology: 'Teknoloji',
      experiments: 'Denemeler',
      state: 'Mevcut durum',
      learning: 'Ne öğrendim',
      practice: 'Neleri kapsıyor',
      people: 'Kimler için',
      availability: 'Şunlar için uygun',
    },
    relatedExperiments: 'İlgili deneyler',
    evidence: 'Kanıt',
    mediaPending: 'Henüz kaydedilmedi',
    embed: {
      load: '3D sahneyi yükle',
      note: 'Siz istemeden hiçbir şey yüklenmez: sahne {host} adresinden gelir ve tarayıcınızda çalışır.',
      open: 'Yeni pencerede aç',
    },
  },
  footer: {
    colophon: 'Bu site de projeler gibi yapılıyor: elle, açıkta ve hâlâ değişerek.',
    backToTop: 'Yukarı dön',
    languageLabel: 'Dili değiştir',
    workingTranslation: 'Bu çeviri bir taslaktır.',
  },
};
