# Modelos compartidos

Documentación de `src/app/shared/` — tipos e interfaces.

## Estado actual

Los modelos del portfolio son específicos de cada sección y viven dentro de `features/portfolio/entities/`. No hay tipos actualmente en `shared/` que sean compartidos entre múltiples features.

## Regla

Solo tipos que se usen en dos o más features deben estar en `shared/`. Los modelos de una sola feature (interfaces de sección del portfolio, DTOs de GitHub API, etc.) pertenecen dentro de esa feature.

## Servicios compartidos

### `services/alert.service.ts`

Servicio `providedIn: 'root'` que centraliza la creación de toasts:

| Método | Toast generado |
|--------|---------------|
| `showSuccess(title, message, ...)` | Toast verde de éxito |
| `showInfo(title, message, ...)` | Toast azul informativo |
| `showWarning(title, message, ...)` | Toast amarillo de advertencia |
| `showError(title, message, ...)` | Toast rojo de error |
| `showLoading(title, message, ...)` | Toast con spinner de carga |
| `showSecondary / showContrast` | Variantes adicionales |
| `clear()` | Cierra todos los toasts activos |

Internamente usa `MessageService` de PrimeNG, registrado en `app.config.ts`.

## Utilidades compartidas

### `utils/tech-icons.ts`

Función `techIconUrl(name: string): string | null` que resuelve el nombre de una tecnología a su URL de icono:

- **skillicons.dev**: TypeScript, Node.js, PostgreSQL, Docker, GitHub, etc.
- **SVG locales** (`assets/svg/`): Angular, GSAP, Vitest, NPM, PrimeNG
- **Retorna `null`** si el nombre no está en el mapa (para manejo seguro en templates)

Usado por `portfolio-button` para renderizar iconos de tecnologías.
