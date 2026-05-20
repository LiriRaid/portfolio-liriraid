# Sistema de tema

Documentación de `src/app/core/theme/`.

## Archivos clave

| Archivo | Descripción |
|---------|-------------|
| `theme.service.ts` | Lógica central: modo claro/oscuro, paletas de color, favicon dinámico |
| `theme-palettes.ts` | Definición estática de las 14 paletas primarias y 8 paletas de superficie |
| `theme-preferences.storage.ts` | Lectura y escritura de preferencias en `localStorage` |
| `theme.initializer.ts` | `provideEnvironmentInitializer` que ejecuta `ThemeService.initialize()` en el bootstrap |
| `portfolio-aura-preset.ts` | Preset PrimeNG Aura personalizado con los tokens del portfolio |
| `pretheme.script.ts` | Código fuente del script síncrono inyectado en `index.html` antes del primer paint |

## API de `ThemeService`

```typescript
class ThemeService {
  readonly mode: WritableSignal<'light' | 'dark'>;
  readonly primaryColorKey: WritableSignal<string>;
  readonly surfaceColorKey: WritableSignal<string>;

  initialize(): void;
  toggleMode(): void;
  setMode(mode: ThemeMode): void;
  applyColor(key: string): void;     // cambia primary + actualiza favicon teñido
  applySurface(key: string): void;   // cambia surface
}
```

### Comportamiento por método

| Método | Acción |
|--------|--------|
| `initialize()` | Lee preferencias resueltas (storage > matchMedia), aplica modo/color/superficie. Programa la remoción del `<style id="portfolio-pretheme">` tras 2 rAF. |
| `toggleMode()` | Alterna `light` ↔ `dark`. Aplica clase `theme-switching` al `<html>` durante un frame para desactivar transiciones y evitar parpadeos. |
| `setMode(mode)` | Aplica un modo específico, persiste, activa el `theme-switching` guard. |
| `applyColor(key)` | Cambia el primary via `updatePrimaryPalette` (PrimeNG), persiste, setea `data-primary-color` en el `<html>`, regenera el favicon teñido con el shade 500. |
| `applySurface(key)` | Cambia la superficie via `updateSurfacePalette`, persiste, setea `data-surface-color`. |

## Variables CSS generadas

PrimeNG (preset Aura) inyecta los tokens primitivos al bootstrap, y `src/styles/theme-styles.css` los compone en tokens de aplicación:

```css
/* Primitivos (PrimeNG) */
--p-primary-50   …  --p-primary-950     /* 11 shades del color primario */
--p-primary-color                        /* shade 500, color activo */
--p-surface-0    …  --p-surface-950     /* 12 shades de superficie */

/* App-level (theme-styles.css :root / .dark) */
--app-shell-bg, --app-panel-bg, --app-border-color
--app-text-color, --app-text-muted, --app-text-primary
--app-search-input-bg, --app-control-surface-bg, --app-outline-button-bg
...
```

Los `--app-*` tienen versiones para `:root` (light) y `.dark` (dark), construidas como `color-mix` o referencias a `--p-surface-*` / `--p-primary-*`.

## Atributos del DOM

```html
<html class="dark" data-primary-color="angular" data-surface-color="neutral" style="color-scheme: dark;">
```

- `.dark` → activa los overrides oscuros de los `--app-*` tokens y de PrimeNG (`darkModeSelector: '.dark'`).
- `data-primary-color` y `data-surface-color` → permiten reglas CSS específicas (p.ej. `.dark[data-primary-color="black"]` ajusta el badge soft).
- `color-scheme` → ayuda al navegador a renderizar scrollbars y form controls en el modo correcto.

## Pretheme script (pre-paint)

`pretheme.script.ts` exporta `PORTFOLIO_PRETHEME_SCRIPT`. Es código JS plano (ES5) que `tools/theme/generate-pretheme-index.ts` inyecta en `src/index.html` entre los marcadores:

```html
<!-- portfolio-pretheme:start -->
<script>...</script>
<!-- portfolio-pretheme:end -->
```

El script corre **síncrono en `<head>`**, antes del primer paint, y:

1. Lee `localStorage['portfolio-theme-mode']` o usa `matchMedia('(prefers-color-scheme: dark)')` para resolver el modo inicial.
2. Lee las claves `portfolio-primary-color` y `portfolio-surface-color` (o usa los defaults `angular` / `neutral`).
3. Aplica al `<html>`: clase `dark`, `data-primary-color`, `data-surface-color`, `style.colorScheme`.
4. Inyecta un `<style id="portfolio-pretheme">` con:
   - `:root { --p-primary-* / --p-surface-* }` (paleta seleccionada).
   - `:root { --app-* }` para light y `.dark { --app-* }` para dark — **espejo crítico del bloque en `theme-styles.css`**. Evita el flash de modo claro cuando el `styles.css` se carga en lazy (Vite dev) o queda fuera del CSS crítico (build de prod con `inlineCritical`).
   - `html { background-color: <shell> }` `body { background-color, color }` como fallback.
5. Actualiza el `<meta name="theme-color">` con el shade 700/500 del primary para Safari/Chrome móvil.

`ThemeService.schedulePrethemeRemoval()` quita ese `<style>` después de 2 rAF, cuando `styles.css` real ya está aplicado.

### Regenerar el bloque

Cualquier cambio en `pretheme.script.ts` requiere regenerar el bloque en `index.html`:

```bash
pnpm pretheme      # solo el pretheme
pnpm preindex      # pretheme + prelanguage (lo que corre antes de build/start)
pnpm run build     # también regenera (lleva preindex como hook)
```

**Mantenimiento**: el bloque `APP_THEME_TOKENS_CSS` dentro de `pretheme.script.ts` es un espejo del `:root { --app-* }` y `.dark { --app-* }` de `theme-styles.css`. Si cambias tokens en uno, actualiza el otro.

## Paletas disponibles

**Primarias (14):** `angular`, `black`, `indigo`, `blue`, `sky`, `cyan`, `teal`, `green`, `amber`, `orange`, `red`, `hotpink`, `pink`, `purple`.

**Superficies (8):** `slate`, `gray`, `zinc`, `neutral`, `stone`, `soho`, `viva`, `ocean`.

**Defaults:** primario = `angular` (#dd0031), superficie = `neutral`, modo = preferencia del sistema (`prefers-color-scheme`).

## Favicon teñido

`updateFavicon(color)` carga el SVG base (`/favicon.svg`), inyecta un `<filter>` SVG con `feFlood` + `feBlend mode="color"` para teñirlo con el shade 500 del primary, y lo aplica como data URI al `<link rel="icon">`. Cachea la promesa de fetch para no descargarlo varias veces.

## Relaciones

- **`app.config.ts`**: `providePrimeNG({ theme: { preset: portfolioAuraPreset, options: { darkModeSelector: '.dark' } } })` + `provideThemeInitializer()`.
- **`PortfolioThemeColorPicker`** ([components.md](../shared/components.md#portfolio-theme-color-picker)): UI del cambio de paletas, llama a `applyColor` / `applySurface`.
- **`Header`**: botón de toggle de modo llama a `toggleMode()`.
- **`theme-styles.css`** ([styles README](../../styles/README.md)): define los tokens `--app-*` que el pretheme espeja.

## Decisiones

- **Pretheme síncrono en head**: evita flash de tema incorrecto en cualquier estrategia de carga de CSS (Vite dev, prod con inlineCritical, SSR).
- **Espejo de `--app-*` tokens en pretheme**: cubre el caso de carga lazy del global `styles.css` (Vite en dev). El costo es duplicación; el beneficio es cero flash garantizado.
- **`darkModeSelector: '.dark'`** en PrimeNG (no media query): permite al script setear el modo deterministamente según preferencia guardada, no solo según `prefers-color-scheme`.
- **Favicon teñido en runtime**: un solo SVG, todos los primarios.
