import type { PortfolioLanguage } from './i18n.service';

const LANGUAGE_STORAGE_KEY = 'portfolio-language';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const normalize = (value: string | null | undefined): PortfolioLanguage | null => {
  return value === 'en' || value === 'es' ? value : null;
};

const readLocalStorage = (key: string): string | null => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writeLocalStorage = (key: string, value: string): void => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Preference persistence is best-effort.
  }
};

const readCookieBrowser = (key: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const pattern = new RegExp(`(?:^|;\\s*)${key}=([^;]+)`);
  const match = document.cookie.match(pattern);

  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookieBrowser = (key: string, value: string): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const secureFlag = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${key}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax${secureFlag}`;
};

export const readCookieFromHeader = (cookieHeader: string | null | undefined, key: string): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const pattern = new RegExp(`(?:^|;\\s*)${key}=([^;]+)`);
  const match = cookieHeader.match(pattern);

  return match ? decodeURIComponent(match[1]) : null;
};

export const parseAcceptLanguage = (header: string | null | undefined): PortfolioLanguage | null => {
  if (!header) {
    return null;
  }

  const first = header.split(',')[0]?.trim().toLowerCase() ?? '';

  if (first.startsWith('en')) {
    return 'en';
  }

  if (first.startsWith('es')) {
    return 'es';
  }

  return null;
};

export const getSystemLanguage = (): PortfolioLanguage => {
  const language = globalThis.navigator?.language?.toLowerCase();

  return language?.startsWith('en') ? 'en' : 'es';
};

export const getStoredLanguage = (): PortfolioLanguage | null => {
  const fromCookie = normalize(readCookieBrowser(LANGUAGE_STORAGE_KEY));

  if (fromCookie) {
    return fromCookie;
  }

  return normalize(readLocalStorage(LANGUAGE_STORAGE_KEY));
};

export const setStoredLanguage = (language: PortfolioLanguage): void => {
  writeCookieBrowser(LANGUAGE_STORAGE_KEY, language);
  writeLocalStorage(LANGUAGE_STORAGE_KEY, language);
};

export const resolveInitialLanguage = (options: { cookieHeader?: string | null; acceptLanguage?: string | null; isBrowser: boolean }): PortfolioLanguage => {
  if (options.isBrowser) {
    return getStoredLanguage() ?? getSystemLanguage();
  }

  const cookieValue = normalize(readCookieFromHeader(options.cookieHeader, LANGUAGE_STORAGE_KEY));

  if (cookieValue) {
    return cookieValue;
  }

  return parseAcceptLanguage(options.acceptLanguage) ?? 'es';
};
