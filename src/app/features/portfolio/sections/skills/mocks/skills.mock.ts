import { ISkillCategory, ISkillsHeader } from '@features/portfolio/entities';

// Las cadenas de label/title/subtitle y category.label son keys i18n; se resuelven con I18nService.t() en el componente.
export const SKILLS_HEADER: ISkillsHeader = {
  label: 'skills.header.label',
  title: 'skills.header.title',
  subtitle: 'skills.header.subtitle',
};

export const SKILL_CATEGORIES: readonly ISkillCategory[] = [
  {
    label: 'skills.categories.frontend',
    icon: 'Globe',
    skills: ['Angular 21', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'RxJS', 'Signals', 'PrimeNG'],
  },
  {
    label: 'skills.categories.backend',
    icon: 'Server',
    skills: ['Node.js', 'NestJS', 'Ruby on Rails', 'Express', 'REST API'],
  },
  {
    label: 'skills.categories.database',
    icon: 'Database',
    skills: ['PostgreSQL', 'Redis'],
  },
  {
    label: 'skills.categories.tools',
    icon: 'Settings',
    skills: ['Git', 'Docker', 'GitHub Actions', 'VS Code', 'Postman', 'Figma', 'GSAP', 'Vitest', 'NPM'],
  },
  {
    label: 'skills.categories.architecture',
    icon: 'Layers',
    skills: ['Clean Architecture', 'Screaming Architecture', 'DDD', 'SSR + Hydration', 'Lazy Loading', 'DRY / SOLID', 'Feature-first', 'Prerender'],
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
