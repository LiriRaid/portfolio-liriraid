# Feature: Portfolio

Documentación de `src/app/features/portfolio/`.

## Objetivo

Renderizar el portfolio profesional completo como una Single Page con múltiples secciones de desplazamiento continuo.

## Estructura

```
portfolio/
├── entities/          → interfaces y DTOs por sección
│   ├── hero.entity.ts
│   ├── experience.entity.ts
│   ├── projects.entity.ts
│   ├── skills.entity.ts
│   ├── about.entity.ts
│   └── contact.entity.ts
│
├── sections/          → componente por cada sección del portfolio
│   ├── hero/
│   ├── experience/
│   ├── projects/
│   ├── skills/
│   ├── about/
│   └── contact/
│
└── page/
    ├── portfolio.ts   → orquestador que importa y monta todas las secciones
    ├── portfolio.html
    └── portfolio.css
```

## Secciones

### Hero (`sections/hero/`)
- Bloque de código animado con estilo editor (macOS dots, tokens coloreados)
- Stack tecnológico listado con iconos de `skillicons.dev`
- Botón de descarga del CV (`assets/docs/gabriel-cruz-cv.pdf`)
- Botón de scroll a la sección de experiencia
- Animación de entrada con GSAP (opacity + Y offset)

### Experience (`sections/experience/`)
- Array `readonly` de experiencias con: empresa, rol, período, ubicación, descripción, responsabilidades y tecnologías
- Renderiza la experiencia en CIT (Creative Infotainment Technologies) como desarrollador Full Angular

### Projects (`sections/projects/`)
Tres proyectos destacados con:
- **Búsqueda reactiva** mediante `FormControl` + `computed()` que filtra por título, descripción y tags
- **Integración con GitHub API**: `GithubRepositoryService` obtiene stars, forks, visibilidad y licencia; cachea las respuestas por repo
- **Categorías de tecnologías**: popover con tecnologías agrupadas por Frontend, Backend, BD, Herramientas, Arquitectura, IA
- **Proyectos incluidos**: OmniInbox, AgentFlow AI, Portfolio Liriraid

### Skills (`sections/skills/`)
Cinco categorías de habilidades:

| Categoría | Habilidades principales |
|-----------|------------------------|
| Frontend | Angular 21, TypeScript, HTML5, CSS3, Tailwind, RxJS, Signals |
| Backend | Node.js, NestJS, Ruby on Rails, Express, REST API |
| Base de datos | PostgreSQL, Redis |
| Herramientas | Git, Docker, GitHub Actions, VS Code, GSAP, Vitest |
| Arquitectura | Clean Architecture, Screaming Architecture, SSR + Hydration, SOLID, DDD |

### About (`sections/about/`)
- Descripción personal en dos párrafos
- Estadísticas: 2+ años de experiencia, 2 proyectos públicos en GitHub, 100% orientado a producto
- Botón de llamada a la acción hacia la sección de contacto

### Contact (`sections/contact/`)
Formulario reactivo con `ReactiveFormsModule`:

```typescript
form: FormGroup = new FormGroup({
  name:    FormControl<string>('', [Validators.required, Validators.minLength(2)]),
  email:   FormControl<string>('', [Validators.required, Validators.email]),
  message: FormControl<string>('', [Validators.required, Validators.minLength(10)])
})
```

- Envío vía **EmailJS** (carga lazy de `@emailjs/browser`)
- Credenciales tomadas de `environment.emailjs` (excluido del repo por `.gitignore`)
- Feedback de éxito/error a través del `AlertService`
- Links sociales: GitHub y LinkedIn

## Entities

Cada entidad define el contrato de datos de su sección. Mantener las interfaces locales dentro de la feature, y no en `shared/`, porque son exclusivas del dominio del portfolio.

## Notas

- Todos los componentes de sección usan `ChangeDetectionStrategy.OnPush`.
- `portfolio.ts` es un orquestador sin lógica: solo importa y compone las secciones.
- Las credenciales de EmailJS y GitHub viven en `src/environments/` (ignorado por git).
