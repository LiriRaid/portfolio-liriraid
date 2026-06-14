# Feature: Portfolio

Documentación de `src/app/features/portfolio/`.

## Objetivo

Renderizar el portfolio profesional completo como una Single Page con múltiples secciones de desplazamiento continuo, internacionalizado (ES/EN) y con tema dinámico.

## Estructura

```
portfolio/
├── entities/                              → interfaces y DTOs por sección
│   ├── hero.entity.ts
│   ├── experience.entity.ts
│   ├── projects.entity.ts
│   ├── skills.entity.ts
│   ├── about.entity.ts
│   ├── contact.entity.ts
│   └── index.ts
│
├── sections/                              → componente por cada sección
│   ├── hero/         (+ hero.service.ts, mocks/)
│   ├── experience/   (+ experience.service.ts, mocks/)
│   ├── projects/     (+ projects.service.ts, mocks/)
│   ├── skills/       (+ skills.service.ts, mocks/)
│   ├── about/        (+ about.service.ts, mocks/, ui/github-stats/)
│   └── contact/      (+ contact.service.ts, mocks/)
│
├── ui/
│   └── portfolio-background-animation/    → canvas de partículas globales del portfolio
│
└── page/
    ├── portfolio.ts                        → orquestador que monta todas las secciones
    ├── portfolio.html
    └── portfolio.css
```

## Page (`page/portfolio.ts`)

Componente raíz de la feature. Sin lógica: importa y compone `Hero`, `Experience`, `Projects`, `Skills`, `About`, `Contact` y `PortfolioBackgroundAnimation`. Se monta como hijo del `Layout` desde `app.routes.ts`.

## Secciones

Todas las secciones siguen la misma estructura interna:

- Componente standalone con `ChangeDetectionStrategy.OnPush`.
- Servicio `<section>.service.ts` para lógica de animación / datos.
- Carpeta `mocks/` con los datos estáticos de la sección (separados del componente para facilitar i18n y tests).
- Inyectan `I18nService` para traducciones y `PortfolioSectionRevealService` para revelar la sección al entrar al viewport.
- Tokens de tipografía y espaciado locales con `clamp()` para escalado fluido. Las variables de gap/padding usan un valor mínimo (mobile) y un máximo aumentado para desktop sin breakpoints adicionales — los `@media (max-width: ...)` existentes en cada sección sobreescriben para tablet y mobile.

### Hero (`sections/hero/`)
- Bloque de código animado con estilo editor (macOS dots, tokens coloreados, líneas en `HERO_CODE_LINES`).
- Stack tecnológico con iconos resueltos por [`techIconUrl`](../shared/utils.md#tech-iconsts).
- CTA "Descargar CV" (descarga `assets/docs/gabriel-cruz-cv.pdf` y emite toast vía `AlertService`).
- CTA "Sobre mí" que hace scroll a la sección About.
- Animación de entrada coordinada por `HeroService` (GSAP, fade + Y offset).

### Experience (`sections/experience/`)
- Timeline con la trayectoria laboral; cada ítem incluye empresa, rol, período, ubicación, descripción, responsabilidades y tecnologías.
- Badge "Actual" cuando aplica.
- Datos en `EXPERIENCES` (mocks); cada texto se traduce vía claves i18n.

### Projects (`sections/projects/`)
Búsqueda + filtros + carrusel de proyectos destacados.

**Proyectos actuales y su stack:**

| Proyecto | Stack destacado |
|----------|----------------|
| OmniInbox | Angular 21, TypeScript, RxJS, Signals, Tailwind CSS, PrimeNG, GSAP, Vitest, Ruby on Rails, Screaming Architecture, Feature-first |
| AgentFlow AI | Node.js, JavaScript, NPM, CLI, TUI, AI Agents, Automation, Clean Architecture |
| Portfolio Liriraid | Angular 21, TypeScript, SSR, Prerender, PrimeNG, Tailwind CSS, Vitest, Screaming Architecture, Feature-first |

- **Búsqueda reactiva** mediante `FormControl` no-nullable + `computed()` que filtra por título, descripción traducida y tags.
- **Filtros por tecnología** con popover (PrimeNG `Popover`) y categorías (Frontend, Backend, BD, Herramientas, Arquitectura, IA, ...) definidas en `PROJECT_TECHNOLOGY_CATEGORIES`.
- **Carrusel de cards** ([`PortfolioCarousel`](../shared/components.md#portfolio-carousel) en modo `card`) con animación entering/leaving para entrada/salida de proyectos al filtrar.
- **Carrusel de screenshots** anidado por proyecto (mismo componente en modo `screenshot`) con fullscreen.
- **Integración con GitHub API**: `ProjectsService` obtiene stars, forks, visibilidad y licencia; cachea las respuestas por repo. Se llama tras `revealOnViewport`.
- **Borde animado** con la directiva [`portfolioAnimatedBorder`](../shared/directives.md) en la card centrada.

### Skills (`sections/skills/`)
Categorías de habilidades con barra de proficiencia. Datos en `SKILLS` (mocks).
Iconos de categoría dimensionados con `clamp()` vía `extraClass="size-(--s-cat-icon)"` en `portfolio-icon` (sin `::ng-deep`).

| Categoría | Habilidades principales |
|-----------|------------------------|
| Frontend | Angular 21, TypeScript, HTML5, CSS3, Tailwind CSS, RxJS, Signals |
| Backend | Node.js, NestJS, Ruby on Rails, Express, REST API |
| Base de datos | PostgreSQL, Redis |
| Herramientas | Git, Docker, GitHub Actions, VS Code, GSAP, Vitest |
| Arquitectura | Clean Architecture, Screaming Architecture, SSR + Hydration, SOLID, DDD |

### About (`sections/about/`)
- Descripción personal en dos párrafos con claves `about.paragraphs.0` / `.1`.
- Estadísticas profesionales (años de experiencia, % producto, repos públicos).
- CTA hacia la sección de experiencia.
- Subcomponente `ui/github-stats/`: tarjeta en vivo con stats de GitHub (repos, stars, forks, lenguaje principal, último update) — su propio `GithubStatsService` consulta la GitHub REST API y cachea en `localStorage` con TTL.
- Iconos de estadísticas y GitHub stats dimensionados con `clamp()` vía `extraClass="size-(--var)"` en `portfolio-icon` (sin `::ng-deep`). El icono del CTA usa `iconExtraClass` en `portfolio-button`.

### Contact (`sections/contact/`)
Formulario reactivo con `ReactiveFormsModule`:

```typescript
form = new FormGroup({
  name:    new FormControl('', { nonNullable: true,
            validators: [Validators.required, Validators.minLength(2)] }),
  email:   new FormControl('', { nonNullable: true,
            validators: [Validators.required, Validators.email] }),
  message: new FormControl('', { nonNullable: true,
            validators: [Validators.required, Validators.minLength(10)] }),
});
```

- Envío vía **EmailJS** (`@emailjs/browser` cargado lazy).
- Credenciales tomadas de `environment.emailjs` (excluido del repo por `.gitignore`).
- Feedback de éxito/error a través del [`AlertService`](../shared/services.md#alertservice).
- Links sociales: GitHub y LinkedIn.

## UI (`ui/portfolio-background-animation/`)

Capa de animación de fondo global del portfolio.

- Canvas a pantalla completa (z-index bajo) con partículas que se mueven y se conectan al acercarse.
- `PortfolioBackgroundAnimationService` controla el ciclo: usa `requestAnimationFrame`, expone un signal `enabled` (toggle desde el header), y se adapta al modo claro/oscuro leyendo `html.dark`.
- Suspende la animación cuando el documento está oculto (`visibilitychange`).
- Se monta una sola vez en `Portfolio` (page) y vive detrás de todas las secciones.

## Entities (`entities/`)

Cada entidad define el contrato de datos de su sección (`IHero`, `IExperience`, `IProject`, `ISkillCategory`, `IAboutContent`, `TContactForm`, etc.). Las interfaces son locales a la feature porque son exclusivas del dominio del portfolio.

## Mocks (`sections/<name>/mocks/`)

Cada sección tiene su carpeta `mocks/` con datos en tiempo de build (constantes `readonly`). Esto permite:

- Tests sin depender de servicios externos.
- Mantener las cadenas como claves i18n en lugar de strings duros (los componentes resuelven con `i18nService.t(key)`).
- Cambiar datos sin tocar el componente.

## Notas

- Todos los componentes de sección usan `ChangeDetectionStrategy.OnPush`.
- `portfolio.ts` (page) es un orquestador sin lógica: solo importa y compone secciones + background animation.
- Las credenciales de EmailJS y GitHub viven en `src/environments/` (ignorado por git).
- Cada sección revela su contenido cuando entra al viewport vía [`PortfolioSectionRevealService`](../shared/services.md#portfoliosectionrevealservice).
