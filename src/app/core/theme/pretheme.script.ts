import { DEFAULT_PRIMARY_COLOR_KEY, DEFAULT_SURFACE_COLOR_KEY, PRIMARY_COLORS, SURFACE_COLORS } from './theme-palettes';

type ThemePaletteColor = (typeof PRIMARY_COLORS | typeof SURFACE_COLORS)[number];

const toInlinePaletteObject = (colors: readonly ThemePaletteColor[]): string => {
  return JSON.stringify(
    Object.fromEntries(
      colors.map((color) => [
        color.key,
        Object.values(color.palette),
      ]),
    ),
  );
};

export const PORTFOLIO_PRETHEME_SCRIPT = `
(function () {
  try {
    var PRIMARY_PALETTES = ${toInlinePaletteObject(PRIMARY_COLORS)};
    var SURFACE_PALETTES = ${toInlinePaletteObject(SURFACE_COLORS)};

    var PRIMARY_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    var SURFACE_SHADES = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

    var DEFAULT_PRIMARY = '${DEFAULT_PRIMARY_COLOR_KEY}';
    var DEFAULT_SURFACE = '${DEFAULT_SURFACE_COLOR_KEY}';

    var mode = localStorage.getItem('portfolio-theme-mode') || 'dark';
    var primaryKey = localStorage.getItem('portfolio-primary-color') || DEFAULT_PRIMARY;
    var surfaceKey = localStorage.getItem('portfolio-surface-color') || DEFAULT_SURFACE;

    var primaryPalette = PRIMARY_PALETTES[primaryKey] || PRIMARY_PALETTES[DEFAULT_PRIMARY];
    var surfacePalette = SURFACE_PALETTES[surfaceKey] || SURFACE_PALETTES[DEFAULT_SURFACE];

    var root = document.documentElement;

    root.classList.toggle('dark', mode === 'dark');
    root.dataset.primaryColor = primaryKey;
    root.dataset.surfaceColor = surfaceKey;

    var css = ':root{';

    PRIMARY_SHADES.forEach(function (shade, index) {
      css += '--p-primary-' + shade + ':' + primaryPalette[index] + ';';
    });

    css += '--p-primary-color:' + primaryPalette[5] + ';';

    SURFACE_SHADES.forEach(function (shade, index) {
      css += '--p-surface-' + shade + ':' + surfacePalette[index] + ';';
    });

    css += '}';

    var shellBg = mode === 'dark' ? surfacePalette[11] : surfacePalette[3];
    var textColor = mode === 'dark' ? surfacePalette[0] : surfacePalette[10];

    css += 'html{background-color:' + shellBg + ';}';
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
