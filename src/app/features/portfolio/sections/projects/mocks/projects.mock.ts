import { IProject, IProjectTechnologyCategory, IProjectsEmptyState, IProjectsHeader } from '@features/portfolio/entities';

// Las cadenas de label/title/subtitle/description y category.label son keys i18n; se resuelven con I18nService.t() en el componente.
export const PROJECTS_HEADER: IProjectsHeader = {
  label: 'projects.header.label',
  title: 'projects.header.title',
  subtitle: 'projects.header.subtitle',
};

export const PROJECTS_EMPTY_STATE: IProjectsEmptyState = {
  searchTitle: 'projects.empty.searchTitle',
  filtersTitle: 'projects.empty.filtersTitle',
  description: 'projects.empty.description',
};

export const PROJECTS: readonly IProject[] = [
  {
    title: 'OmniInbox',
    description: 'projects.items.0.description',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'Tailwind CSS', 'PrimeNG', 'GSAP', 'Vitest', 'Ruby on Rails', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: null,
    githubUrl: null,
    liveUrl: null,
    featured: true,
    screenshots: ['assets/img/projects/omniinbox-profile.svg', 'assets/img/projects/omniinbox-login.svg', 'assets/img/projects/omniinbox-inbox.svg'],
  },
  {
    title: 'AgentFlow AI',
    description: 'projects.items.1.description',
    tags: ['Node.js', 'JavaScript', 'NPM', 'CLI', 'TUI', 'AI Agents', 'Automation', 'Clean Architecture'],
    repo: 'LiriRaid/agentflow-ai',
    githubUrl: 'https://github.com/LiriRaid/agentflow-ai',
    liveUrl: null,
    screenshots: ['assets/img/projects/agentflow-tui.svg', 'assets/img/projects/agentflow-orchestrator.svg'],
  },
  {
    title: 'Portfolio Liriraid',
    description: 'projects.items.2.description',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'SSR', 'Prerender', 'PrimeNG', 'Tailwind CSS', 'CSS', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: 'LiriRaid/portfolio-liriraid',
    githubUrl: 'https://github.com/LiriRaid/portfolio-liriraid',
    liveUrl: null,
    screenshots: ['assets/img/projects/portfolio-hero.svg', 'assets/img/projects/portfolio-projects.svg'],
  },
];

export const PROJECT_TECHNOLOGY_CATEGORIES: readonly IProjectTechnologyCategory[] = [
  {
    label: 'projects.tech.categories.frontend',
    icon: 'Globe',
    technologies: ['Angular 21', 'AngularJS', 'Signals', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'PrimeNG', 'RxJS'],
  },
  {
    label: 'projects.tech.categories.backend',
    icon: 'Server',
    technologies: ['Node.js', 'NestJS', 'Ruby on Rails', 'Express', 'REST API'],
  },
  {
    label: 'projects.tech.categories.database',
    icon: 'Database',
    technologies: ['PostgreSQL', 'Redis'],
  },
  {
    label: 'projects.tech.categories.tools',
    icon: 'Settings',
    technologies: ['Git', 'Docker', 'GitHub Actions', 'VS Code', 'Postman', 'Figma', 'GSAP', 'Vitest', 'NPM'],
  },
  {
    label: 'projects.tech.categories.architecture',
    icon: 'Layers',
    technologies: ['Screaming Architecture', 'Feature-first', 'Clean Architecture', 'Prerender', 'SSR', 'Lazy Loading', 'DRY / SOLID', 'DDD'],
  },
  {
    label: 'projects.tech.categories.ai',
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
