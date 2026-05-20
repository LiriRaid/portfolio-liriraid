# docs/styles

Documentación de `src/styles/`.

## Objetivo

El sistema de estilos del portfolio separa responsabilidades en archivos dedicados para facilitar el mantenimiento. Todos se importan desde `src/styles.css`, que actúa como orquestador. La identidad visual se compone con Tailwind v4 + tokens propios + el preset PrimeNG Aura.

## Archivos

| Archivo | Responsabilidad |
|---------|-----------------|
| `theme-styles.css` | Tokens de aplicación (`--app-*`) para modo claro (`:root`) y oscuro (`.dark`), construidos sobre los primitivos `--p-surface-*` / `--p-primary-*` |
| `general-styles.css` | Reglas base de `html`/`body`, layout container, sección reveal, breakpoints globales |
| `components-styles.css` | Estilos compartidos de componentes (`.input`, `.button-outline`, `.icon-btn`, badges, etc.) sobre la capa `@layer components` |
| `input-styles.css` | Reglas base para inputs y textarea (caret color, paddings, focus) sobre `@layer base` |
| `projects-styles.css` | Estilos específicos de la sección Projects (movidos fuera del componente por volumen) |
| `carousel-styles.css` | Estilos del [`PortfolioCarousel`](../app/shared/components.md#portfolio-carousel) (cards, screenshots, fullscreen, hover/touch revealed) |
| `animated-border-styles.css` | Borde con gradiente rotatorio consumido por la directiva [`portfolioAnimatedBorder`](../app/shared/directives.md) |
| `scrollbar-styles.css` | Apariencia de scrollbars (webkit) y variantes por contenedor |
| `text-and-color-styles.css` | Tokens `@theme` de Tailwind: tipografía (sizes/line-heights), sombras, breakpoints, aliases de color primary |
| `typography-styles.css` | Utilidades CSS de tipografía (`.text-tittle-*`, `.text-subtitle-*`, `.text-body-*`, `.text-caption-*` en variantes bold/semibold/medium/regular) |
| `theme-switching-styles.css` | Reglas de `:root.theme-switching` para desactivar transiciones durante el cambio de tema (evita parpadeos) |

## `src/styles.css` — entrypoint global

Importa Tailwind, el plugin de PrimeUI y todos los archivos internos en orden. Se mantiene como orquestador ligero — no contiene reglas propias, solo `@import`.

```css
@import 'tailwindcss';
@import 'tailwindcss-primeui';

@import './styles/general-styles.css';
@import './styles/theme-styles.css';
@import './styles/components-styles.css';
@import './styles/carousel-styles.css';
@import './styles/projects-styles.css';
@import './styles/input-styles.css';
@import './styles/scrollbar-styles.css';
@import './styles/text-and-color-styles.css';
@import './styles/typography-styles.css';
@import './styles/animated-border-styles.css';
@import './styles/theme-switching-styles.css';

@import './app/shared/animations/animations.css';
```

## Sistema de tokens

### Primitivos (PrimeNG / `text-and-color-styles.css`)
- `--p-primary-50 … 950` + `--p-primary-color`: 11 shades del color primario activo.
- `--p-surface-0 … 950`: 12 shades de la superficie activa.
- `--font-size-*`, `--line-height-*`, `--shadow-*`: tokens declarados en `@theme` de Tailwind.

### App tokens (`theme-styles.css`)
Construidos sobre los primitivos. Tienen versión light (`:root`) y dark (`.dark`):

```
--app-shell-bg         /* fondo del shell global */
--app-panel-bg         /* paneles, cards */
--app-panel-muted-bg   /* paneles secundarios, screenshots, empty states */
--app-border-color
--app-text-color / --app-text-muted / --app-text-subtle / --app-text-primary
--app-search-input-* / --app-control-surface-* / --app-outline-button-*
--app-textarea-* / --app-badge-soft-* / --app-accent-soft-bg
```

**Importante:** Este bloque tiene un espejo crítico inyectado por el pretheme script (ver [theme.md](../app/core/theme.md#pretheme-script-pre-paint)). Si añades o modificas tokens `--app-*`, actualiza también `pretheme.script.ts` para mantener el zero-flash en dark mode.

## Tipografía

`typography-styles.css` expone una escala consistente:

| Escala | Clases | Tokens |
|--------|--------|--------|
| Tittles | `.text-tittle-{1\|2\|3\|4}-{bold\|semibold\|medium\|regular}` | `--font-size-tittle-*`, `--line-height-tittle-*` |
| Subtitles | `.text-subtitle-{1\|2}-*` | `--font-size-subtitle-*`, `--line-height-subtitle-*` |
| Body | `.text-body-{1\|2}-*` | `--font-size-body-*`, `--line-height-body-*` |
| Captions | `.text-caption-{1\|2}-*` | `--font-size-caption-*`, `--line-height-caption-*` |

Los componentes de sección hacen override local de `--font-size-body-*` con `clamp()` para escalado fluido entre breakpoints. **Importante:** body-1 siempre debe ser mayor que body-2 — si overrideas uno con `clamp()`, hazlo proporcionalmente en el otro.

## Animación de cambio de tema

`theme-switching-styles.css` aplica `transition-duration: 0` a casi todo cuando `<html>` tiene la clase `.theme-switching` (la pone `ThemeService.applyMode` y la quita tras 2 rAF). Evita ver transiciones de mil colores cuando se cambia entre light/dark.

## Relación con Tailwind y PrimeNG

- **Tailwind v4** con CSS-first config en `text-and-color-styles.css` (`@theme { ... }`).
- **`tailwindcss-primeui`** sincroniza utilidades Tailwind con las variables de PrimeNG (`bg-primary`, `text-surface-900`, etc.).
- **Overrides de PrimeNG**: los que aplican a todo el sitio van en `components-styles.css`; los puntuales en el CSS del componente que los usa.

## Convenciones

- `@layer base` para reglas que pisan elementos nativos (`input`, `textarea`, `html`).
- `@layer components` para clases reutilizables (`.input`, `.button-outline`).
- Sin reglas globales fuera de `@layer` salvo las del `:root`/`.dark` (tokens).
- Imports relativos al raíz del proyecto desde `styles.css`; nunca al revés.
