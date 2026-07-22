// src/app/core/i18n/prelanguage-toggle.script.ts

export const PORTFOLIO_PRELANGUAGE_TOGGLE_SCRIPT = `
(function () {
  try {
    var LANGUAGE_KEY = 'portfolio-language';
    var VALID_LANGUAGES = ['es', 'en'];
    var DEFAULT_SSR_LANGUAGE = 'es';

    var PAGE_TITLES = {
      es: {
        home: 'Portfolio - Gabriel Cruz | Inicio',
        about: 'Portfolio - Gabriel Cruz | Sobre mí',
        experience: 'Portfolio - Gabriel Cruz | Experiencia',
        projects: 'Portfolio - Gabriel Cruz | Proyectos',
        skills: 'Portfolio - Gabriel Cruz | Habilidades',
        contact: 'Portfolio - Gabriel Cruz | Contacto'
      },
      en: {
        home: 'Portfolio - Gabriel Cruz | Home',
        about: 'Portfolio - Gabriel Cruz | About me',
        experience: 'Portfolio - Gabriel Cruz | Experience',
        projects: 'Portfolio - Gabriel Cruz | Projects',
        skills: 'Portfolio - Gabriel Cruz | Skills',
        contact: 'Portfolio - Gabriel Cruz | Contact'
      }
    };

    var PAGE_DESCRIPTIONS = {
      es: {
        home: 'Portfolio de Gabriel Cruz (Liriraid), desarrollador Full Stack especializado en Angular 21, TypeScript y Node.js. Construido con SSR + prerendering.',
        about: 'Conoce a Gabriel Cruz, desarrollador Full Angular especializado en Angular, TypeScript, Tailwind CSS, PrimeNG y Node.js.',
        experience: 'Experiencia laboral de Gabriel Cruz construyendo aplicaciones web empresariales con Angular moderno y tecnologías frontend.',
        projects: 'Proyectos destacados de Gabriel Cruz creados con Angular, SSR, Tailwind CSS, PrimeNG, Node.js y arquitectura frontend escalable.',
        skills: 'Habilidades técnicas de Gabriel Cruz en Angular, TypeScript, Tailwind CSS, PrimeNG, Node.js, Ruby on Rails y PostgreSQL.',
        contact: 'Contacta a Gabriel Cruz para proyectos freelance, colaboración técnica o desarrollo de aplicaciones web con Angular.'
      },
      en: {
        home: 'Portfolio of Gabriel Cruz (Liriraid), Full Stack developer specialized in Angular 21, TypeScript and Node.js. Built with SSR + prerendering.',
        about: 'Learn about Gabriel Cruz, a Full Angular developer specialized in Angular, TypeScript, Tailwind CSS, PrimeNG and Node.js.',
        experience: 'Work experience of Gabriel Cruz building enterprise web applications with modern Angular and frontend technologies.',
        projects: 'Featured projects by Gabriel Cruz built with Angular, SSR, Tailwind CSS, PrimeNG, Node.js and scalable frontend architecture.',
        skills: 'Technical skills of Gabriel Cruz in Angular, TypeScript, Tailwind CSS, PrimeNG, Node.js, Ruby on Rails and PostgreSQL.',
        contact: 'Contact Gabriel Cruz for freelance projects, technical collaboration or Angular web application development.'
      }
    };

    function isValidLanguage(language) {
      return VALID_LANGUAGES.indexOf(language) !== -1;
    }

    function getCookieLanguage() {
      var match = document.cookie.match(/(?:^|;\\s*)portfolio-language=([^;]+)/);

      if (!match) {
        return null;
      }

      try {
        return decodeURIComponent(match[1]);
      } catch (error) {
        return null;
      }
    }

    function getStoredLanguage() {
      try {
        return localStorage.getItem(LANGUAGE_KEY);
      } catch (error) {
        return null;
      }
    }

    function getSystemLanguage() {
      var language = (navigator.language || '').toLowerCase();

      return language.indexOf('en') === 0 ? 'en' : 'es';
    }

    function resolveLanguage() {
      var cookieLanguage = getCookieLanguage();

      if (isValidLanguage(cookieLanguage)) {
        return cookieLanguage;
      }

      var storedLanguage = getStoredLanguage();

      if (isValidLanguage(storedLanguage)) {
        return storedLanguage;
      }

      return getSystemLanguage();
    }

    function isKnownPageKey(value) {
      return value === 'home' || value === 'about' || value === 'experience' || value === 'projects' || value === 'skills' || value === 'contact';
    }

    function normalizePageKey(value) {
      if (!value) {
        return 'home';
      }

      if (value === '') {
        return 'home';
      }

      if (value === '/') {
        return 'home';
      }

      if (value === 'inicio') {
        return 'home';
      }

      if (value === 'sobre-mi') {
        return 'about';
      }

      if (value === 'experiencia') {
        return 'experience';
      }

      if (value === 'proyectos') {
        return 'projects';
      }

      if (value === 'habilidades') {
        return 'skills';
      }

      if (value === 'contacto') {
        return 'contact';
      }

      return isKnownPageKey(value) ? value : 'home';
    }

    function getCurrentPageKey() {
      var hash = (location.hash || '').replace(/^#\\/?/, '').split('?')[0].split('/')[0].trim();

      if (hash) {
        return normalizePageKey(hash);
      }

      var path = (location.pathname || '').replace(/^\\//, '').split('?')[0].split('/')[0].trim();

      if (path) {
        return normalizePageKey(path);
      }

      return 'home';
    }

    function setMetaByName(name, content) {
      var element = document.querySelector('meta[name="' + name + '"]');

      if (element) {
        element.setAttribute('content', content);
      }
    }

    function setMetaByProperty(property, content) {
      var element = document.querySelector('meta[property="' + property + '"]');

      if (element) {
        element.setAttribute('content', content);
      }
    }

    function applyMetadata(language) {
      var pageKey = getCurrentPageKey();
      var title = PAGE_TITLES[language][pageKey] || PAGE_TITLES[language].home;
      var description = PAGE_DESCRIPTIONS[language][pageKey] || PAGE_DESCRIPTIONS[language].home;
      var locale = language === 'en' ? 'en_US' : 'es_ES';

      document.title = title;

      setMetaByName('description', description);
      setMetaByProperty('og:title', title);
      setMetaByProperty('og:description', description);
      setMetaByProperty('og:locale', locale);
      setMetaByName('twitter:title', title);
      setMetaByName('twitter:description', description);
    }

    var language = resolveLanguage();
    var root = document.documentElement;

    root.setAttribute('lang', language);
    root.setAttribute('data-language', language);

    applyMetadata(language);

    if (language !== DEFAULT_SSR_LANGUAGE) {
      root.classList.add('portfolio-i18n-pending');
    }
  } catch (error) {}
})();
`.trim();
