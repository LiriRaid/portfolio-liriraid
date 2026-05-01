import { DEFAULT_PRIMARY_COLOR_KEY, DEFAULT_SURFACE_COLOR_KEY } from './theme-palettes';
import type { ThemeMode } from './theme.service';

const THEME_MODE_STORAGE_KEY = 'portfolio-theme-mode';
const PRIMARY_COLOR_STORAGE_KEY = 'portfolio-primary-color';
const SURFACE_COLOR_STORAGE_KEY = 'portfolio-surface-color';

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
    // Preference persistence is best-effort until user settings come from the API.
  }
};

export const getStoredThemeMode = (): ThemeMode | null => {
  const saved = readStorage(THEME_MODE_STORAGE_KEY);
  return saved === 'dark' || saved === 'light' ? saved : null;
};

export const setStoredThemeMode = (mode: ThemeMode): void => {
  writeStorage(THEME_MODE_STORAGE_KEY, mode);
};

export const getStoredPrimaryColorKey = (): string => {
  return readStorage(PRIMARY_COLOR_STORAGE_KEY) ?? DEFAULT_PRIMARY_COLOR_KEY;
};

export const setStoredPrimaryColorKey = (key: string): void => {
  writeStorage(PRIMARY_COLOR_STORAGE_KEY, key);
};

export const getStoredSurfaceColorKey = (): string => {
  return readStorage(SURFACE_COLOR_STORAGE_KEY) ?? DEFAULT_SURFACE_COLOR_KEY;
};

export const setStoredSurfaceColorKey = (key: string): void => {
  writeStorage(SURFACE_COLOR_STORAGE_KEY, key);
};
