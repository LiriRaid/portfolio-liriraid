import type { PortfolioLanguage } from './i18n.service';

type I18nDictionary = Record<string, string>;

export const I18N_MESSAGES: Record<PortfolioLanguage, I18nDictionary> = {
  es: {
    'header.nav.home': 'Inicio',
    'header.nav.experience': 'Experiencia',
    'header.nav.projects': 'Proyectos',
    'header.nav.skills': 'Habilidades',
    'header.nav.about': 'Sobre mí',
    'header.nav.contact': 'Contacto',

    'header.background.enable': 'Activar animación de fondo',
    'header.background.disable': 'Desactivar animación de fondo',
    'header.theme.light': 'Activar modo claro',
    'header.theme.dark': 'Activar modo oscuro',
    'header.menu.open': 'Abrir menú',
    'header.menu.close': 'Cerrar menú',
    'header.language.toggle': 'Cambiar idioma',

    'hero.badge': 'Desarrollador Full Angular',
    'hero.title.line1': 'Construyo aplicaciones web',
    'hero.title.line2': 'modernas, escalables',
    'hero.title.line3': 'y mantenibles.',
    'hero.description': 'Desarrollador Full Angular con Angular 21 y experiencia en versiones legacy (AngularJS 10+). Creo soluciones orientadas a producto con arquitectura limpia, rendimiento óptimo, experiencia de usuario y producto escalable.',
    'hero.cta.experience': 'Ver experiencia',
    'hero.cta.cv': 'Descargar CV',
    'hero.stack.aria': 'Stack tecnológico principal',
    'hero.cv.success.title': 'CV descargado',
    'hero.cv.success.message': 'Has descargado el CV con éxito.',
  },
  en: {
    'header.nav.home': 'Home',
    'header.nav.experience': 'Experience',
    'header.nav.projects': 'Projects',
    'header.nav.skills': 'Skills',
    'header.nav.about': 'About me',
    'header.nav.contact': 'Contact',

    'header.background.enable': 'Enable background animation',
    'header.background.disable': 'Disable background animation',
    'header.theme.light': 'Enable light mode',
    'header.theme.dark': 'Enable dark mode',
    'header.menu.open': 'Open menu',
    'header.menu.close': 'Close menu',
    'header.language.toggle': 'Change language',

    'hero.badge': 'Full Angular Developer',
    'hero.title.line1': 'I build web applications',
    'hero.title.line2': 'modern, scalable',
    'hero.title.line3': 'and maintainable.',
    'hero.description': 'Full Angular developer with Angular 21 and experience in legacy versions (AngularJS 10+). I build product-oriented solutions with clean architecture, optimal performance, user experience and scalable product thinking.',
    'hero.cta.experience': 'View experience',
    'hero.cta.cv': 'Download CV',
    'hero.stack.aria': 'Main technology stack',
    'hero.cv.success.title': 'CV downloaded',
    'hero.cv.success.message': 'Your CV has been downloaded successfully.',
  },
};
