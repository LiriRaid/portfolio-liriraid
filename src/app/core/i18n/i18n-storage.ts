import type { PortfolioLanguage } from './i18n.service';

const LANGUAGE_STORAGE_KEY = 'portfolio-language';

const readStorage = (key: string): string | null => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string): void => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Preference persistence is best-effort.
  }
};

export const getSystemLanguage = (): PortfolioLanguage => {
  const language = globalThis.navigator?.language?.toLowerCase();

  return language?.startsWith('en') ? 'en' : 'es';
};

export const getStoredLanguage = (): PortfolioLanguage | null => {
  const saved = readStorage(LANGUAGE_STORAGE_KEY);

  return saved === 'en' || saved === 'es' ? saved : null;
};

export const getInitialLanguage = (): PortfolioLanguage => {
  return getStoredLanguage() ?? getSystemLanguage();
};

export const setStoredLanguage = (language: PortfolioLanguage): void => {
  writeStorage(LANGUAGE_STORAGE_KEY, language);
};
