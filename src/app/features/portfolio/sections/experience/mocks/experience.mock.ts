import { IExperienceHeader, IExperienceItem } from '@features/portfolio/entities';

// Las cadenas de role/period/location/description/responsibilities son keys i18n; se resuelven con I18nService.t() en el componente.
export const EXPERIENCE_HEADER: IExperienceHeader = {
  label: 'experience.header.label',
  title: 'experience.header.title',
  subtitle: 'experience.header.subtitle',
};

export const EXPERIENCES: readonly IExperienceItem[] = [
  {
    company: 'CIT (Creative Infotainment Technologies)',
    role: 'experience.items.0.role',
    period: 'experience.items.0.period',
    location: 'experience.items.0.location',
    description: 'experience.items.0.description',
    responsibilities: [
      'experience.items.0.responsibilities.0',
      'experience.items.0.responsibilities.1',
      'experience.items.0.responsibilities.2',
      'experience.items.0.responsibilities.3',
      'experience.items.0.responsibilities.4',
      'experience.items.0.responsibilities.5',
      'experience.items.0.responsibilities.6',
    ],
    technologies: ['Angular 21', 'AngularJS', 'TypeScript', 'Signals', 'RxJS', 'PrimeNG', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    current: true,
  },
];
