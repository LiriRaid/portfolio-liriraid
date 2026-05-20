import { DEFAULT_PRIMARY_COLOR_KEY, DEFAULT_SURFACE_COLOR_KEY, PRIMARY_COLORS, SURFACE_COLORS } from './theme-palettes';

type ThemePaletteColor = (typeof PRIMARY_COLORS | typeof SURFACE_COLORS)[number];

const toInlinePaletteObject = (colors: readonly ThemePaletteColor[]): string => {
  return JSON.stringify(Object.fromEntries(colors.map((color) => [color.key, Object.values(color.palette)])));
};

/**
 * Critical `--app-*` tokens mirrored from `src/styles/theme-styles.css`.
 * Inlined synchronously before first paint so dark mode does not flash light
 * while the async global stylesheet is still loading. Keep in sync with that file.
 */
const APP_THEME_TOKENS_CSS = `
  :root {
    --app-shell-bg: var(--p-surface-200);
    --app-panel-bg: var(--p-surface-0);
    --app-panel-muted-bg: var(--p-surface-50);
    --app-border-color: var(--p-surface-300);
    --app-text-color: var(--p-surface-900);
    --app-text-muted: var(--p-surface-600);
    --app-text-subtle: var(--p-surface-500);
    --app-text-primary: var(--p-primary-700);
    --app-container-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
    --app-container-border: transparent;
    --app-control-surface-bg: var(--p-surface-0);
    --app-control-surface-border: var(--p-surface-300);
    --app-control-surface-text: var(--p-surface-900);
    --app-control-focus-ring: color-mix(in srgb, var(--p-primary-600) 60%, transparent);
    --app-control-disabled-bg: color-mix(in srgb, var(--app-panel-muted-bg) 82%, white);
    --app-control-disabled-border: var(--p-surface-200);
    --app-control-disabled-text: var(--p-surface-700);
    --app-search-input-bg: var(--p-surface-0);
    --app-search-input-border: var(--p-surface-300);
    --app-search-input-text: var(--p-surface-900);
    --app-search-input-prefix: var(--p-surface-900);
    --app-search-button-bg: var(--p-surface-0);
    --app-search-button-border: var(--p-surface-300);
    --app-search-button-text: var(--p-surface-900);
    --app-search-button-hover-bg: var(--p-primary-600);
    --app-search-button-hover-text: var(--p-surface-0);
    --app-search-button-active-bg: var(--p-surface-0);
    --app-search-button-focus-ring: color-mix(in srgb, var(--p-primary-600) 40%, transparent);
    --app-primary-button-bg: var(--p-primary-700);
    --app-primary-button-disabled-text: var(--p-surface-0);
    --app-outline-button-bg: var(--p-surface-0);
    --app-outline-button-border: var(--p-surface-500);
    --app-outline-button-text: var(--p-surface-900);
    --app-outline-button-hover-bg: var(--p-primary-600);
    --app-outline-button-hover-text: var(--p-surface-0);
    --app-outline-button-disabled-bg: rgba(0, 0, 0, 0.3);
    --app-outline-button-disabled-text: var(--p-surface-0);
    --app-textarea-bg: var(--app-panel-bg);
    --app-textarea-border: var(--p-surface-300);
    --app-textarea-focus-outline: solid 3px rgba(251, 0, 33, 0.3);
    --app-accent-soft-bg: color-mix(in srgb, var(--p-primary-500) 12%, transparent);
    --app-badge-soft-bg: color-mix(in srgb, var(--p-primary-500) 12%, var(--app-panel-bg));
    --app-badge-soft-text: var(--p-primary-800);
    --app-action-icon-color: var(--app-text-subtle);
    --app-disabled-text: var(--p-surface-700);
  }
  .dark {
    --app-shell-bg: color-mix(in srgb, var(--p-surface-950) 88%, black);
    --app-panel-bg: color-mix(in srgb, var(--p-surface-900) 84%, var(--p-surface-950));
    --app-panel-muted-bg: color-mix(in srgb, var(--p-surface-800) 78%, var(--p-surface-900));
    --app-border-color: color-mix(in srgb, var(--p-surface-700) 72%, rgba(255, 255, 255, 0.18));
    --app-text-color: var(--p-surface-0);
    --app-text-muted: var(--p-surface-200);
    --app-text-subtle: var(--p-surface-400);
    --app-text-primary: var(--p-primary-500);
    --app-container-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    --app-container-border: var(--app-border-color);
    --app-control-surface-bg: var(--app-panel-bg);
    --app-control-surface-border: color-mix(in srgb, var(--app-border-color) 75%, rgba(255, 255, 255, 0.2));
    --app-control-surface-text: var(--app-text-color);
    --app-control-focus-ring: color-mix(in srgb, var(--p-primary-600) 60%, transparent);
    --app-control-disabled-bg: color-mix(in srgb, var(--app-panel-muted-bg) 80%, black);
    --app-control-disabled-border: var(--app-border-color);
    --app-control-disabled-text: var(--p-surface-400);
    --app-search-input-bg: var(--app-panel-bg);
    --app-search-input-border: color-mix(in srgb, var(--app-border-color) 82%, rgba(255, 255, 255, 0.18));
    --app-search-input-text: var(--p-surface-0);
    --app-search-input-prefix: var(--app-text-muted);
    --app-search-button-bg: var(--p-surface-0);
    --app-search-button-border: color-mix(in srgb, var(--app-border-color) 82%, rgba(255, 255, 255, 0.18));
    --app-search-button-text: var(--p-surface-900);
    --app-search-button-hover-bg: var(--p-primary-600);
    --app-search-button-hover-text: var(--p-surface-0);
    --app-search-button-active-bg: var(--app-panel-muted-bg);
    --app-search-button-focus-ring: color-mix(in srgb, var(--p-primary-600) 40%, transparent);
    --app-primary-button-bg: var(--p-primary-700);
    --app-primary-button-disabled-text: var(--p-surface-0);
    --app-outline-button-bg: var(--app-panel-bg);
    --app-outline-button-border: var(--app-border-color);
    --app-outline-button-text: var(--app-text-color);
    --app-outline-button-hover-bg: var(--p-primary-600);
    --app-outline-button-hover-text: var(--p-surface-0);
    --app-outline-button-disabled-bg: rgba(255, 255, 255, 0.12);
    --app-outline-button-disabled-text: var(--app-text-color);
    --app-textarea-bg: var(--app-panel-bg);
    --app-textarea-border: color-mix(in srgb, var(--app-border-color) 82%, rgba(255, 255, 255, 0.18));
    --app-textarea-focus-outline: solid 3px rgba(251, 0, 33, 0.3);
    --app-accent-soft-bg: color-mix(in srgb, var(--p-primary-500) 16%, transparent);
    --app-badge-soft-bg: color-mix(in srgb, var(--p-primary-500) 12%, var(--app-panel-bg));
    --app-badge-soft-text: var(--p-primary-500);
    --app-action-icon-color: var(--p-surface-0);
    --app-disabled-text: var(--p-surface-400);
  }
  .dark[data-primary-color="black"] {
    --app-accent-soft-bg: color-mix(in srgb, var(--p-surface-0) 9%, transparent);
    --app-badge-soft-bg: color-mix(in srgb, var(--p-surface-0) 9%, var(--app-panel-bg));
    --app-badge-soft-text: var(--p-surface-100);
  }
`
  .replace(/\s*\n\s*/g, '')
  .trim();

export const PORTFOLIO_PRETHEME_SCRIPT = `
(function () {
  try {
    var PRIMARY_PALETTES = ${toInlinePaletteObject(PRIMARY_COLORS)};
    var SURFACE_PALETTES = ${toInlinePaletteObject(SURFACE_COLORS)};

    var PRIMARY_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    var SURFACE_SHADES = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

    var DEFAULT_PRIMARY = '${DEFAULT_PRIMARY_COLOR_KEY}';
    var DEFAULT_SURFACE = '${DEFAULT_SURFACE_COLOR_KEY}';

    var storedMode = localStorage.getItem('portfolio-theme-mode');
    var systemMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var mode = storedMode === 'dark' || storedMode === 'light' ? storedMode : systemMode;

    var primaryKey = localStorage.getItem('portfolio-primary-color') || DEFAULT_PRIMARY;
    var surfaceKey = localStorage.getItem('portfolio-surface-color') || DEFAULT_SURFACE;
    var storedBackgroundAnimation = localStorage.getItem('portfolio-background-animation-enabled');
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var backgroundAnimationEnabled = storedBackgroundAnimation === null ? !prefersReducedMotion : storedBackgroundAnimation === 'true';

    var primaryPalette = PRIMARY_PALETTES[primaryKey] || PRIMARY_PALETTES[DEFAULT_PRIMARY];
    var surfacePalette = SURFACE_PALETTES[surfaceKey] || SURFACE_PALETTES[DEFAULT_SURFACE];

    var root = document.documentElement;

    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
    root.dataset.primaryColor = primaryKey;
    root.dataset.surfaceColor = surfaceKey;
    root.classList.toggle('portfolio-background-animation-enabled', backgroundAnimationEnabled);

    var css = ':root{';

    PRIMARY_SHADES.forEach(function (shade, index) {
      css += '--p-primary-' + shade + ':' + primaryPalette[index] + ';';
    });

    css += '--p-primary-color:' + primaryPalette[5] + ';';

    SURFACE_SHADES.forEach(function (shade, index) {
      css += '--p-surface-' + shade + ':' + surfacePalette[index] + ';';
    });

    css += '}';

    css += '${APP_THEME_TOKENS_CSS}';

    var shellBg = mode === 'dark' ? surfacePalette[11] : surfacePalette[3];
    var textColor = mode === 'dark' ? surfacePalette[0] : surfacePalette[10];

    css += 'html{color-scheme:' + mode + ';background-color:' + shellBg + ';}';
    css += 'body{background-color:' + shellBg + ';color:' + textColor + ';}';

    var style = document.createElement('style');

    style.id = 'portfolio-pretheme';
    style.textContent = css;

    document.head.appendChild(style);

    var themeMeta = document.querySelector('meta[name="theme-color"]');

    if (themeMeta) {
      themeMeta.setAttribute('content', primaryPalette[7] || primaryPalette[5]);
    }
  } catch (error) {}
})();
`.trim();
