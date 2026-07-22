# Utilidades compartidas

Documentación de `src/app/shared/utils/`.

## ¿Qué contiene?

Funciones puras y constantes sin estado, sin dependencia del árbol de DI. Cualquier feature puede importarlas vía `@shared/utils/<archivo>`.

| Archivo | Descripción |
|---------|-------------|
| `tech-icons.ts` | Mapa nombre-de-tecnología → URL del SVG; resuelve los logos usados en chips/badges del portfolio |
| `gsap-loader.ts` | Carga dinámica (lazy) de la librería GSAP, cacheada para reuso |
| `portfolio-scroll.ts` | IDs de las secciones del portfolio + helpers de scroll suave dentro del contenedor scrollable |

## `tech-icons.ts`

```typescript
export function techIconUrl(name: string): string | null;
```

- Diccionario de ~30 alias (`Angular`, `Angular 21`, `AngularJS`, `Tailwind CSS`, `Node.js`, etc.) hacia archivos en `assets/svg/technologies/`.
- Devuelve `null` si el nombre no está mapeado, para que el consumidor decida fallback (icono Lucide, texto plano, etc.).
- Consumido por `PortfolioButton` (input `techIcon`), chips de tecnologías en `Projects` y `Experience`, badge de stack del `Hero`.

Para añadir un logo nuevo: agregar el SVG a `src/assets/svg/technologies/` y la entrada en el mapa `ICONS`.

## `gsap-loader.ts`

```typescript
export async function loadGsap(): Promise<GsapInstance>;
export function getGsapSync(): GsapInstance | null;
export type GsapInstance = (typeof import('gsap'))['gsap'];
```

- `loadGsap()` hace `import('gsap')` dinámico la primera vez, cachea el módulo en una promesa pendiente para evitar imports duplicados si varias features lo piden a la vez, y devuelve siempre la misma instancia en llamadas posteriores.
- `getGsapSync()` devuelve la instancia ya cargada o `null`. Útil para consumidores que ya pidieron `loadGsap` antes y quieren acceso sin async.
- Consumidores: `I18nService` (animación de cambio de idioma), `Hero` (animación de entrada), `CarouselItemSceneService`, `HeaderService` (header morph).

Decisión: GSAP pesa lo suficiente para no incluirlo en el bundle inicial; el `import()` dinámico lo separa en su propio chunk lazy.

## `portfolio-scroll.ts`

```typescript
export const PORTFOLIO_SECTION_IDS = [
  'home', 'experience', 'projects', 'skills', 'about', 'contact',
] as const;

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number];

export function getPortfolioScrollRoot(): HTMLElement | null;
export function scrollToPortfolioSection(
  sectionId: string,
  behavior?: ScrollBehavior,
): void;
```

- `PORTFOLIO_SECTION_IDS`: lista canónica de secciones del portfolio. El header genera sus links a partir de este array, así que añadir o renombrar una sección se hace en un solo punto.
- `getPortfolioScrollRoot()`: encuentra el contenedor con scroll (`.layout-scroll-root` definido en `Layout`). El portfolio no scrollea en `body` sino en este contenedor para mantener el header fijo sin `position: fixed`.
- `scrollToPortfolioSection()`: hace `scrollTo` al `offsetTop` de la sección dentro del scroll root. Para `home` va al tope. Agrega `.header-is-floating` al `<html>` para mantener el header en estado flotante mientras se navega entre secciones.

## Relaciones

- **`Header`**: usa `scrollToPortfolioSection` en clicks de navegación y `PORTFOLIO_SECTION_IDS` para los links.
- **`Layout`**: detecta la sección visible con `getPortfolioScrollRoot` + observers para sincronizar el hash de la URL.
- **`I18nService` / `Hero` / `CarouselItemSceneService`**: importan `loadGsap` para animaciones.
- **`PortfolioButton` y chips**: usan `techIconUrl` para resolver el logo de la tecnología.

## Decisiones

- **Funciones puras, no servicios**: nada aquí tiene estado de instancia ni necesita DI. Hacerlas servicios sumaría boilerplate sin valor.
- **GSAP lazy obligatorio**: GSAP no debe aparecer en el chunk inicial del bundle. Quien lo necesite usa `loadGsap()` y vive con el await.
- **`PORTFOLIO_SECTION_IDS` como `as const` readonly tuple**: da tipos exactos (`PortfolioSectionId`) en lugar de un `string` genérico, y previene mutaciones accidentales del array.
