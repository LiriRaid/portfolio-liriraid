import { ISkillCategory, ISkillsHeader } from '@features/portfolio/entities';

export const SKILLS_HEADER: ISkillsHeader = {
  label: 'Tecnologías',
  title: 'Habilidades técnicas',
  subtitle: 'Herramientas y tecnologías que uso para construir productos robustos y mantenibles.',
};

export const SKILL_CATEGORIES: readonly ISkillCategory[] = [
  {
    label: 'Frontend',
    icon: 'Globe',
    skills: ['Angular 21', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'RxJS', 'Signals'],
  },
  {
    label: 'Backend',
    icon: 'Server',
    skills: ['Node.js', 'NestJS', 'Ruby on Rails', 'Express', 'REST API'],
  },
  {
    label: 'Base de datos',
    icon: 'Database',
    skills: ['PostgreSQL', 'Redis'],
  },
  {
    label: 'Herramientas',
    icon: 'Settings',
    skills: ['Git', 'Docker', 'GitHub Actions', 'VS Code', 'Postman', 'Figma', 'GSAP', 'Vitest', 'NPM'],
  },
  {
    label: 'Arquitectura',
    icon: 'Layers',
    skills: ['Clean Architecture', 'Screaming Architecture', 'SSR + Hydration', 'Lazy Loading', 'DRY / SOLID', 'DDD'],
  },
];

export const SKILL_FALLBACK_ICONS: Readonly<Record<string, string>> = {
  'REST API': 'Server',
  'Clean Architecture': 'Layers',
  'Screaming Architecture': 'Folder',
  'SSR + Hydration': 'Server',
  'Lazy Loading': 'Download',
  'DRY / SOLID': 'ShieldCheck',
  DDD: 'Database',
};
