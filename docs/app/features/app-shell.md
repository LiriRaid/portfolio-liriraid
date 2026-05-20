# Feature: App Shell

Documentación de `src/app/features/app-shell/`.

## Objetivo

Proporcionar la estructura visual que envuelve toda la aplicación: header con navegación + controles (idioma, tema, color), footer y contenedor donde se renderizan las rutas hijas.

## Estructura

```
app-shell/
├── header/
│   ├── header.ts
│   ├── header.html
│   ├── header.css
│   └── header.service.ts        → morph del header y animación del menú móvil
├── footer/
│   ├── footer.ts
│   ├── footer.html
│   └── footer.css
└── layout/
    ├── layout.ts
    ├── layout.html
    └── layout.css
```

## `layout/`

Componente contenedor que monta `Header`, `Footer`, `RouterOutlet` y `PortfolioToast` (de [`portfolio-toast`](../shared/components.md#portfolio-toast)).

- Renderiza el scroll en un contenedor propio `.layout-scroll-root` (no en el body), con `overflow-y: auto` y altura `100dvh`. El header queda fijo sin necesidad de `position: fixed` y la animación de fondo puede vivir detrás de las secciones.
- Listener de resize: cuando el ancho del viewport cambia, vuelve a scrollear a la sección actualmente visible (calculada midiendo intersecciones con `getBoundingClientRect`) para evitar que un breakpoint corte una sección por la mitad.
- Conoce los IDs canónicos de sección mediante [`PORTFOLIO_SECTION_IDS`](../shared/utils.md#portfolio-scrollts): `home`, `experience`, `projects`, `skills`, `about`, `contact`.

Se carga con `loadComponent` (lazy loading) desde `app.routes.ts`.

## `header/`

Componente `OnPush` con el header de navegación principal.

### Funcionalidades

| Función | Descripción |
|---------|-------------|
| Navegación | Links a cada sección con scroll suave vía [`scrollToPortfolioSection`](../shared/utils.md#portfolio-scrollts) |
| Sección activa | Calcula qué sección está visible (scanLine = top + header height, fallback al middle del viewport) y actualiza el hash de la URL |
| Menú móvil | Toggle con animación GSAP coordinada por `HeaderService` |
| Theme toggle | Cambia entre modo claro y oscuro (delega en `ThemeService.toggleMode`) |
| Color picker | Monta el popover de [`PortfolioThemeColorPicker`](../shared/components.md#portfolio-theme-color-picker) |
| Language toggle | Switch ES/EN vía [`PortfolioLanguageToggle`](../shared/components.md#portfolio-language-toggle) |
| Background animation toggle | Activa/desactiva la capa de partículas (delega en `PortfolioBackgroundAnimationService`) |
| Título dinámico | Actualiza `document.title` según la sección activa, usando claves i18n |

### Lógica de scroll

- Distingue scroll manual (rueda/touch) de scroll programático (click en un link).
- Durante un scroll programático bloquea la detección de sección activa hasta llegar al target (timeout de 1200ms) para evitar parpadeos en el indicador.
- Sincroniza el hash de la URL via `history.replaceState` (sin disparar navegación).

### `HeaderService`

Servicio interno de la feature (`providers: [HeaderService]`). Encapsula:

- **Morph del header al scrollear**: anima width, height y posición Y entre `morphStart=0` y `morphEnd=220` px de scroll. Configs distintos para desktop (`widthRatio 0.92`, `maxWidth 980`, target height 56px) y mobile (`widthRatio 0.96`, target height 44px). Throttled con `requestAnimationFrame`.
- **Animación del menú móvil**: open/close con GSAP (cargado lazy via [`gsap-loader`](../shared/utils.md#gsap-loaderts)).

Mantener este servicio dentro de la feature (no en `shared/`) porque solo lo consume el header.

## `footer/`

Componente simple `OnPush`.

- Brand (Liriraid) + tagline traducible (`footer.tagline`).
- Links a GitHub y a la sección de contacto.
- Año dinámico de copyright via interpolación `{year}` en la clave i18n `footer.copyright`.

## Notas

- `Layout` se carga lazy via `loadComponent` para no contaminar el bundle inicial.
- `Header` usa `OnPush` y signals para evitar re-renders durante el scroll.
- Todos los textos pasan por `I18nService.t(key)` — no hay strings duros en los componentes.
- El header funciona dentro del scroll root `.layout-scroll-root`, no contra `window`.
