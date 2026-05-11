// src/app/core/i18n/prelanguage-toggle.script.ts

export const PORTFOLIO_PRELANGUAGE_TOGGLE_SCRIPT = `
(function () {
  try {
    var LANGUAGE_KEY = 'portfolio-language';
    var COOKIE_KEY = 'portfolio-language';
    var VALID_LANGUAGES = ['es', 'en'];
    var SYNC_CLASS = 'is-initial-sync';
    var STYLE_ID = 'portfolio-prelanguage-toggle-style';
    var MAX_SYNC_TIME = 2500;

    function isValidLanguage(lang) {
      return VALID_LANGUAGES.indexOf(lang) !== -1;
    }

    function getCookieLanguage() {
      var cookieMatch = document.cookie.match(/(?:^|;\\s*)portfolio-language=([^;]+)/);

      if (!cookieMatch) {
        return null;
      }

      try {
        return decodeURIComponent(cookieMatch[1]);
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
      var navLang = (navigator.language || '').toLowerCase();
      return navLang.indexOf('en') === 0 ? 'en' : 'es';
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

    function ensureNoTransitionStyle() {
      if (document.getElementById(STYLE_ID)) {
        return;
      }

      var style = document.createElement('style');

      style.id = STYLE_ID;
      style.textContent =
        '.p-toggleswitch.' + SYNC_CLASS + ',' +
        '.p-toggleswitch.' + SYNC_CLASS + ' *{' +
        'transition:none!important;' +
        'animation:none!important;' +
        '}';

      document.head.appendChild(style);
    }

    function syncToggle(toggle, shouldBeChecked) {
      toggle.classList.add(SYNC_CLASS);
      toggle.classList.toggle('p-toggleswitch-checked', shouldBeChecked);
      toggle.setAttribute('data-language-ready', 'true');

      var input = toggle.querySelector('.p-toggleswitch-input');

      if (input) {
        input.checked = shouldBeChecked;
        input.setAttribute('aria-checked', String(shouldBeChecked));
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          toggle.classList.remove(SYNC_CLASS);
        });
      });
    }

    function syncLanguageToggles() {
      var lang = resolveLanguage();
      var shouldBeChecked = lang === 'es';
      var toggles = document.querySelectorAll('.p-toggleswitch');

      document.documentElement.lang = lang;
      document.documentElement.dataset.language = lang;

      if (!toggles.length) {
        return false;
      }

      toggles.forEach(function (toggle) {
        syncToggle(toggle, shouldBeChecked);
      });

      return true;
    }

    ensureNoTransitionStyle();

    var didSync = syncLanguageToggles();

    if (!didSync && document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', syncLanguageToggles, { once: true });
    }

    if (!didSync && window.MutationObserver) {
      var startedAt = Date.now();

      var observer = new MutationObserver(function () {
        var synced = syncLanguageToggles();

        if (synced || Date.now() - startedAt > MAX_SYNC_TIME) {
          observer.disconnect();
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      setTimeout(function () {
        observer.disconnect();
      }, MAX_SYNC_TIME);
    }
  } catch (error) {}
})();
`.trim();
