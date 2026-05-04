# Portfolio Liriraid

Portfolio profesional de **Gabriel Leonardo Cruz Flores** ([Liriraid](https://github.com/liriraid)), desarrollador Full Stack especializado en **Angular 21 · TypeScript · Node.js**.

Construido con SSR (Server-Side Rendering), prerendering estático e hidratación completa para máximo rendimiento y SEO óptimo.

## Stack

| Área | Tecnologías |
|------|-------------|
| **Framework** | Angular 21, TypeScript 5.9 |
| **Estilos** | Tailwind CSS 4, PrimeNG 21, CSS personalizado |
| **Animaciones** | GSAP 3.15 |
| **Iconos** | Lucide Angular 1.14, SVG custom |
| **Formularios** | ReactiveFormsModule + EmailJS |
| **Testing** | Vitest 4.0 + JSDOM |
| **Build** | Angular Build @21 (SSR + Static Prerender) |
| **APIs externas** | GitHub API, EmailJS |

## Arquitectura

Este proyecto sigue **Screaming Architecture** (arquitectura que grita el dominio), organizado con **Feature-first**.

La regla de alcance: lo que usa una sola feature vive dentro de ella. Lo reutilizable entre dos o más features se mueve a `shared`. La infraestructura global (tema, iconos, inicializadores) vive en `core`.

```
src/app/
├── core/         → infraestructura transversal: tema, iconos, providers
├── features/     → app-shell y portfolio (hero, experience, projects, skills, about, contact)
└── shared/       → componentes reutilizables, servicios, utilidades
```

## Estructura

```
src/
├── app/
│   ├── core/
│   │   ├── common/          → mapeo de iconos Lucide + SVG custom del portfolio
│   │   ├── forms/           → helper ControlValueAccessor provider
│   │   └── theme/           → ThemeService, paletas de color, inicializador, preset Aura
│   │
│   ├── features/
│   │   ├── app-shell/       → layout principal, header con navegación y footer
│   │   └── portfolio/
│   │       ├── entities/    → interfaces y DTOs por sección del portfolio
│   │       ├── sections/    → hero, experience, projects, skills, about, contact
│   │       └── page/        → orquestador que monta todas las secciones
│   │
│   ├── shared/
│   │   ├── animations/      → CSS de animaciones reutilizables
│   │   ├── components/      → portfolio-button, portfolio-icon, portfolio-input,
│   │   │                       portfolio-search, portfolio-toast, portfolio-theme-color-picker
│   │   ├── services/        → AlertService (gestión de toasts globales)
│   │   └── utils/           → tech-icons (mapeo de tecnologías a URLs de iconos)
│   │
│   ├── app.ts               → componente raíz standalone
│   ├── app.config.ts        → providers globales (PrimeNG, rutas, tema, iconos)
│   └── app.routes.ts        → routing con lazy loading por componente
│
├── styles/                  → sistema global de estilos separado por responsabilidad
│   ├── theme-styles.css     → tokens CSS para modo claro/oscuro
│   ├── components-styles.css
│   ├── input-styles.css
│   ├── typography-styles.css
│   ├── text-and-color-styles.css
│   └── scrollbar-styles.css
│
├── assets/
│   ├── docs/                → CV descargable (gabriel-cruz-cv.pdf)
│   ├── img/                 → fotografía de perfil (Me.jpg)
│   └── svg/                 → logos: Angular, PrimeNG, GSAP, Vitest, NPM
│
└── index.html               → HTML base con pretheme script para evitar flash de tema en SSR
```

## Convenciones

- **Standalone components**: todos los componentes, pipes y directivas son standalone sin NgModules.
- **Lazy loading**: Layout y PortfolioPage se cargan con `loadComponent` para optimizar el bundle inicial.
- **Screaming Architecture**: el nombre de cada carpeta revela su dominio (`hero/`, `experience/`, `contact/`).
- **Alias de paths**: `@core/*`, `@features/*`, `@shared/*`, `@environments/*` para imports limpios.
- **OnPush por defecto**: todos los componentes usan `ChangeDetectionStrategy.OnPush` para rendimiento.
- **Pretheme script**: aplica variables CSS antes de que Angular cargue, evitando el flash de tema por defecto durante la hidratación SSR.

## Tema dinámico

El portfolio incluye un sistema de temas dinámico con:
- **13 colores primarios**: black, indigo, blue, sky, cyan, teal, green, amber, orange, red, hotpink, pink, purple.
- **8 paletas de superficie**: slate, gray, zinc, neutral, stone, soho, viva, ocean.

Las preferencias se persisten en `localStorage`. El `ThemeService` actualiza variables CSS `--p-primary-*` y `--p-surface-*` en tiempo real y sincroniza el favicon con el color primario activo.

## Secciones del portfolio

| Sección | Descripción |
|---------|-------------|
| **Hero** | Presentación con bloque de código animado (GSAP), stack tecnológico y descarga de CV |
| **Experience** | Experiencia laboral detallada con responsabilidades y tecnologías por rol |
| **Projects** | Proyectos destacados con búsqueda, categorías de tecnologías e integración GitHub API |
| **Skills** | Habilidades organizadas en 5 categorías: Frontend, Backend, BD, Herramientas, Arquitectura |
| **About** | Descripción personal, estadísticas y llamada a la acción |
| **Contact** | Formulario reactivo con envío vía EmailJS + enlaces a GitHub y LinkedIn |

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start

# Build de producción (SSR + estático prerendered)
npm run build

# Ejecutar tests con Vitest
npm test

# Watch mode para desarrollo
npm run watch
```

## Documentación

La documentación técnica del proyecto está organizada en [`docs/`](docs/):

- [`docs/app/core/`](docs/app/core/) — tema dinámico, iconos, infraestructura global
- [`docs/app/features/`](docs/app/features/) — app-shell y secciones del portfolio
- [`docs/app/shared/`](docs/app/shared/) — componentes, servicios y utilidades reutilizables
- [`docs/styles/`](docs/styles/) — sistema global de estilos

## Referencias oficiales

- [Angular](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [PrimeNG](https://primeng.org)
- [GSAP](https://gsap.com)
- [Lucide Icons](https://lucide.dev)
- [Vitest](https://vitest.dev)
- [EmailJS](https://www.emailjs.com)

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
