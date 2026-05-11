import { IProject, IProjectTechnologyCategory, IProjectsEmptyState, IProjectsHeader } from '@features/portfolio/entities';

export const PROJECTS_HEADER: IProjectsHeader = {
  label: 'Trabajo reciente',
  title: 'Proyectos destacados',
  subtitle: 'Aplicaciones reales construidas con foco en arquitectura limpia, rendimiento y escalabilidad.',
};

export const PROJECTS_EMPTY_STATE: IProjectsEmptyState = {
  searchTitle: 'No encontré proyectos con esa búsqueda.',
  filtersTitle: 'No hay proyectos públicos con estos filtros.',
  description: 'Prueba con otra tecnología, limpia los filtros o busca por nombre, descripción o stack.',
};

export const PROJECTS: readonly IProject[] = [
  {
    title: 'OmniInbox',
    description: 'Plataforma conversacional tipo inbox omnicanal construida con Angular 21. Centraliza módulos de login, inbox, perfil y shell autenticado con arquitectura feature-first, componentes standalone, lazy loading, tema claro/oscuro, animaciones y testing moderno.',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'Tailwind CSS', 'PrimeNG', 'GSAP', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: 'LiriRaid/omni-inbox',
    githubUrl: 'https://github.com/LiriRaid/omni-inbox',
    liveUrl: null,
    featured: true,
    screenshots: ['assets/img/projects/omniinbox-profile.svg', 'assets/img/projects/omniinbox-login.svg', 'assets/img/projects/omniinbox-inbox.svg'],
  },
  {
    title: 'AgentFlow AI',
    description: 'Orquestador multiagente para desarrollo con IA. Coordina agentes como Claude, Codex, OpenCode y Gemini, delega tareas, monitorea progreso en una TUI y mantiene el proyecto principal limpio mediante un workspace separado.',
    tags: ['Node.js', 'JavaScript', 'NPM', 'CLI', 'TUI', 'AI Agents', 'Automation', 'Clean Architecture'],
    repo: 'LiriRaid/agentflow-ai',
    githubUrl: 'https://github.com/LiriRaid/agentflow-ai',
    liveUrl: null,
    screenshots: ['assets/img/projects/agentflow-tui.svg', 'assets/img/projects/agentflow-orchestrator.svg'],
  },
  {
    title: 'Portfolio Liriraid',
    description: 'Portfolio personal profesional creado con Angular 21, SSR, prerender, hidratación normal, sistema de temas dinámico, componentes reutilizables y estructura escalable basada en features.',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'SSR', 'Prerender', 'PrimeNG', 'Tailwind CSS', 'CSS', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: 'LiriRaid/portfolio-liriraid',
    githubUrl: 'https://github.com/LiriRaid/portfolio-liriraid',
    liveUrl: null,
    screenshots: ['assets/img/projects/portfolio-hero.svg', 'assets/img/projects/portfolio-projects.svg'],
  },
];

export const PROJECT_TECHNOLOGY_CATEGORIES: readonly IProjectTechnologyCategory[] = [
  {
    label: 'Frontend',
    icon: 'Globe',
    technologies: ['Angular 21', 'AngularJS', 'Signals', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'PrimeNG', 'RxJS'],
  },
  {
    label: 'Backend',
    icon: 'Server',
    technologies: ['Node.js', 'NestJS', 'Ruby on Rails', 'Express', 'REST API'],
  },
  {
    label: 'Base de datos',
    icon: 'Database',
    technologies: ['PostgreSQL', 'Redis'],
  },
  {
    label: 'Herramientas',
    icon: 'Settings',
    technologies: ['Git', 'Docker', 'GitHub Actions', 'VS Code', 'Postman', 'Figma', 'GSAP', 'Vitest', 'NPM'],
  },
  {
    label: 'Arquitectura',
    icon: 'Layers',
    technologies: ['Screaming Architecture', 'Feature-first', 'Clean Architecture', 'Prerender', 'SSR', 'Lazy Loading', 'DRY / SOLID', 'DDD'],
  },
  {
    label: 'IA / Automatización',
    icon: 'Code',
    technologies: ['JavaScript', 'CLI', 'TUI', 'AI Agents', 'Automation'],
  },
];

export const PROJECT_TECH_FALLBACK_ICONS: Readonly<Record<string, string>> = {
  'Clean Architecture': 'Layers',
  'Screaming Architecture': 'Folder',
  'Feature-first': 'Folder',
  SSR: 'Server',
  Prerender: 'Globe',
  'Lazy Loading': 'Download',
  'DRY / SOLID': 'ShieldCheck',
  DDD: 'Database',
  CLI: 'Code',
  TUI: 'MediaPreview',
  'AI Agents': 'MessagesSquare',
  Automation: 'Settings',
  'REST API': 'Server',
  MIT: 'Scale',
};
