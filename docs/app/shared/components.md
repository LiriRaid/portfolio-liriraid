# Componentes compartidos

Documentación de `src/app/shared/components/`.

## Objetivo

Agrupar los primitivos y controles de UI reutilizables entre las features del portfolio. Estandarizan la UX y encapsulan la integración con PrimeNG.

## Barrel export

`src/app/shared/components/index.ts` re-exporta todos los componentes:

```typescript
import { PortfolioButton, PortfolioIcon, PortfolioCarousel } from '@shared/components';
```

## Componentes

### `portfolio-button/`
Botón genérico con soporte para múltiples variantes.

| Input | Tipo | Descripción |
|-------|------|-------------|
| `label` | string | Texto del botón |
| `icon` | string \| null | Nombre de icono Lucide |
| `techIcon` | string \| null | Nombre de tecnología (resuelto con `techIconUrl`) |
| `iconPos` | `'left' \| 'right' \| 'top' \| 'bottom'` | Posición del icono |
| `iconSize` | string \| number | Tamaño del icono (px) |
| `badge` | string \| number \| null | Badge superpuesto |
| `severity` | `ButtonSeverity` | Variante de color (primary, secondary, success, info, warn, danger, contrast) |
| `outlined / raised / text` | boolean | Variantes visuales |
| `loading / disabled` | boolean | Estados |
| `type` | `'button' \| 'submit' \| 'reset'` | Tipo de botón |
| `href / target / rel` | string | Convierte el botón en enlace `<a>` |
| `ariaLabel / ariaControls / ariaExpanded` | — | Accesibilidad |
| `styleClass / labelClass / badgeClass / iconExtraClass` | string | Hooks para clases extra |

| Output | Tipo |
|--------|------|
| `onClick` | `OutputEmitter<MouseEvent>` |

Características clave:
- Las clases pasadas en `styleClass` se reparten automáticamente: `w-*` van al host, `text-*` al label, el resto al botón.
- `techIcon` resuelve al SVG correspondiente via [`techIconUrl`](utils.md#tech-iconsts); precedencia sobre `icon` Lucide si ambos se setean.

### `portfolio-icon/`
Wrapper delgado sobre `@lucide/angular`. Traduce un `LucideIconName` al componente de icono correspondiente del catálogo registrado en `app.config.ts` (ver [icons.md](../core/icons.md)).

### `portfolio-input/`
Input personalizado que implementa `ControlValueAccessor`, compatible con `ReactiveFormsModule`.

| Característica | Descripción |
|----------------|-------------|
| Tipos soportados | `text`, `email`, `password`, `number`, `date`, `tel`, `url`, `price` |
| Variantes de label | `over`, `in`, `on` (floating label) |
| Tag input | Modo para introducir múltiples valores como tags |
| Icono interactivo | Icono clickeable en el input (p.ej. toggle de visibilidad de contraseña) |
| Validación inline | Errores directamente bajo el input |

Usa `control-value-accessor.provider.ts` de `core/forms/` para registrar el accessor.

### `portfolio-search/`
Input especializado para búsqueda con comportamiento responsive.

| Input | Tipo | Descripción |
|-------|------|-------------|
| `control` | `FormControl<string \| null>` (required) | FormControl externo que mantiene el valor |
| `placeholder` | string | Placeholder, default `'Buscar...'` |
| `collapsedMode` | boolean | Si `true`, renderiza solo el icono colapsado (lupa) |
| `mobileMode` | boolean | Habilita el modo móvil (colapsa el input bajo cierto breakpoint) |
| `inputClass` | string | Clases extra para el contenedor del input |

| Output | Descripción |
|--------|-------------|
| `searchEnter` | Emite el término al presionar Enter o al limpiar |
| `collapsedSearchClick` | El usuario clickea el botón colapsado |
| `mobileSearchToggle` | Cambia el estado de visibilidad del input en mobile |

Detecta `window.innerWidth <= 640` para alternar entre layout desktop (input siempre visible) y mobile (botón → input animado).

### `portfolio-carousel/`
Carrusel con dos modos: **card** (proyectos lado a lado con la centrada destacada) y **screenshot** (capturas con dots y fullscreen).

| Input | Tipo | Descripción |
|-------|------|-------------|
| `mode` | `'card' \| 'screenshot'` | Modo de operación, default `'screenshot'` |
| `images` | `string[]` | URLs de las imágenes (modo screenshot) |
| `itemsKey / itemsStateKey / activeItemKey` | string | Claves de tracking para el modo card |
| `autoPlay` | boolean | Auto-avance del modo screenshot, default `true` |
| `autoPlayDuration` | number | ms entre auto-avances, default `4000` |
| `active` | boolean | Si el carrusel es el centrado/activo (modo screenshot anidado dentro de card) |

| Output | Tipo |
|--------|------|
| `activeItemChange` | `OutputEmitter<string>` |

Características:
- **Modo screenshot**: dots de progreso animados, contador `X / N`, fullscreen overlay con cierre por overlay/Escape, navegación prev/next.
- **Modo card**: cards laterales escaladas, drag horizontal, navegación con flechas, dots clickeables.
- Touch: swipe horizontal para navegar, threshold de 50px.
- En touch + screenshot mode: el botón fullscreen se oculta vía `@media (hover: none)`; un tap en la card centrada abre directo el fullscreen.
- Las animaciones GSAP se cargan en lazy via [`gsap-loader`](utils.md#gsap-loaderts).
- Servicio interno `CarouselItemSceneService` orquesta la animación de slides.
- Directiva `carouselItem` (`[carouselItem]`) marca cada card hijo en modo card; el carrusel las descubre con `contentChildren`.

### `portfolio-theme-color-picker/`
Popover con el selector de tema.

- Grid de **13 botones** de color primario (angular, indigo, blue, sky, cyan, teal, green, amber, orange, red, hotpink, pink, purple, black, ...).
- Grid de **8 paletas** de superficie (slate, gray, zinc, neutral, stone, soho, viva, ocean).
- Previsualización en tiempo real llamando a `ThemeService.applyColor` / `applySurface`.
- Persiste selección en `localStorage` (claves `portfolio-primary-color`, `portfolio-surface-color`).

Usado en `Header`. Ver [theme.md](../core/theme.md) para el sistema completo.

### `portfolio-language-toggle/`
Toggle switch para alternar idioma (ES / EN).

- Usa `p-toggleswitch` de PrimeNG; `checked = true` representa español.
- Inyecta `I18nService` y delega los cambios a `setLanguage()`.
- Sincroniza el estado visual del toggle con el idioma actual incluso durante la animación de cambio.
- Coopera con el `prelanguage-toggle.script.ts` ([i18n.md](../core/i18n.md)) que aplica la clase `is-initial-sync` antes del primer paint para evitar el "flash" del toggle al cargar.

### `portfolio-toast/`
Sistema de notificaciones toast.

- 7 tipos: `Success`, `Info`, `Warning`, `Error`, `Secondary`, `Contrast`, `Loading` (definidos en `portfolio-toast.types.ts` como enum `PortfolioToastType`).
- 6 posiciones: `top-left/center/right`, `bottom-left/center/right`.
- Soporte para acción personalizada (`PortfolioToastAction` con label + callback) y toasts persistentes (`persistent: true`).
- Renderiza siempre vía `key: 'portfolio-toast'` de `MessageService`.
- API pública vía [`AlertService`](services.md#alertservice) — los componentes no instancian `MessageService` directamente.

## Convenciones internas

- Todos los componentes son standalone y usan `ChangeDetectionStrategy.OnPush` cuando aplica.
- Inputs declarados con la API `input()` / `input.required()` (signal-based).
- Outputs con la API `output()`.
- Los archivos `*.spec.ts` viven junto a su componente.
- Estilos: cada componente puede tener `*.css` propio; los tokens transversales viven en `src/styles/`.
