# docs/styles

Documentación de `src/styles/`.

## Objetivo

El sistema de estilos del portfolio separa las responsabilidades en archivos dedicados para facilitar el mantenimiento. Todos se importan desde `src/styles.css`, que actúa como orquestador.

## Archivos

| Archivo | Responsabilidad |
|---------|----------------|
| `theme-styles.css` | Tokens CSS para modo claro y oscuro (fondos, superficies, estados) |
| `components-styles.css` | Clases globales de componentes reutilizables |
| `input-styles.css` | Reglas base para inputs, textarea, checkbox, radio |
| `text-and-color-styles.css` | Tokens de tamaño de texto, line-height, sombras y aliases de color |
| `typography-styles.css` | Utilidades CSS de tipografía (`.text-title-*`, `.text-body-*`, etc.) |
| `scrollbar-styles.css` | Apariencia de scrollbars (webkit) y variantes por contenedor |

## `src/styles.css` — entrypoint global

```css
@import 'tailwindcss';
@import "tailwindcss-primeui";
@plugin "@tailwindcss/forms";

/* Reglas base */
html { scroll-behavior: smooth; }
section[id] { scroll-margin-top: 4.25rem; }  /* Compensa el header sticky */

/* Archivos internos */
@import './styles/theme-styles.css';
@import './styles/components-styles.css';
@import './styles/input-styles.css';
@import './styles/scrollbar-styles.css';
@import './styles/text-and-color-styles.css';
@import './styles/typography-styles.css';
@import './app/shared/animations/animations.css';

/* Transición suave al cambiar tema */
:root.theme-switching * { transition: ... !important; }
```

`styles.css` debe mantenerse como orquestador ligero, no como depósito de estilos.

## `theme-styles.css`

Define los tokens CSS globales para ambos modos usando el sistema de variables `--p-primary-*` y `--p-surface-*` generados por el `ThemeService`. Incluye:
- Fondos y superficies del layout
- Estados de botones y elementos interactivos
- Tokens específicos del header, footer y secciones

La identidad visual del portfolio usa **naranja** como color primario y **neutral** como superficie base, con modo oscuro profundo como experiencia por defecto.

## Relación con PrimeNG

`tailwindcss-primeui` sincroniza las utilidades de Tailwind con las variables de PrimeNG, permitiendo usar clases como `bg-primary` o `text-surface-900` que apuntan a los tokens del tema activo.

Los overrides profundos de componentes PrimeNG que no pueden hacerse con tokens van en el CSS del componente que los usa, o en `components-styles.css` si son globales.
