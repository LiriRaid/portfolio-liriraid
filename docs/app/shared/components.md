# Componentes compartidos

Documentación de `src/app/shared/components/`.

## Objetivo

Agrupar los primitivos y controles de UI reutilizables entre las features del portfolio. Estandarizan la UX y encapsulan la integración con PrimeNG.

## Componentes

### `portfolio-button/`
Botón genérico con soporte para:

| Input | Tipo | Descripción |
|-------|------|-------------|
| `label` | string | Texto del botón |
| `icon` | LucideIconName | Icono Lucide |
| `techIcon` | string | Nombre de tecnología (resuelto con `techIconUrl`) |
| `severity` | string | Variante de color (primary, secondary, etc.) |
| `outlined / raised / text` | boolean | Variantes visuales |
| `loading / disabled` | boolean | Estados |
| `href / target / rel` | string | Convierte el botón en enlace `<a>` |

Output: `clicked` (EventEmitter).

### `portfolio-icon/`
Wrapper delgado sobre `@lucide/angular`. Traduce un `LucideIconName` al componente de icono correspondiente del catálogo registrado en `app.config.ts`.

### `portfolio-input/`
Input personalizado que implementa `ControlValueAccessor`, compatible con `ReactiveFormsModule`:

| Característica | Descripción |
|----------------|-------------|
| Tipos soportados | text, email, password, number, date, tel, url, price |
| Variantes de label | over, in, on (floating label) |
| Tag input | Modo para introducir múltiples valores como tags |
| Icono interactivo | Icono clickeable en el input (p.ej. toggle de visibilidad de contraseña) |
| Validación inline | Muestra errores directamente bajo el input |

Usa `control-value-accessor.provider.ts` de `core/forms/` para el registro.

### `portfolio-search/`
Input especializado para búsqueda. Variante simplificada de `portfolio-input` con estilo y comportamiento de campo de búsqueda. Usado en la sección de proyectos del portfolio.

### `portfolio-theme-color-picker/`
Popover con el selector de tema:
- Grid de 13 botones de color primario
- Grid de 8 botones de color de superficie
- Previsualización en tiempo real llamando a `ThemeService`
- Persiste selección en `localStorage`

Usado en el header por `HeaderComponent`.

### `portfolio-toast/`
Sistema de notificaciones toast con:
- 7 tipos: `Success`, `Info`, `Warning`, `Error`, `Secondary`, `Contrast`, `Loading`
- 6 posiciones: top/bottom + left/center/right
- Soporte para acción personalizada y toasts persistentes
- Integrado con `AlertService` y `MessageService` de PrimeNG

## Barrel export

`src/app/shared/components/index.ts` re-exporta todos los componentes para imports limpios:

```typescript
import { PortfolioButton, PortfolioIcon } from '@shared/components';
```
