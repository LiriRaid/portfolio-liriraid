import { IAboutContent, IStat } from '@features/portfolio/entities';

export const ABOUT_CONTENT: IAboutContent = {
  label: '¿Quién soy?',
  title: 'Sobre mí',
  ctaLabel: 'Contactarme',
  paragraphs: [
    'Soy Gabriel Leonardo Cruz Flores, desarrollador Full Angular enfocado en crear aplicaciones web modernas, rápidas y mantenibles con Angular, TypeScript, Tailwind CSS, PrimeNG y Node.js.',
    'Trabajo construyendo interfaces, dashboards, formularios, flujos administrativos, componentes reutilizables e integraciones con APIs, cuidando arquitectura, rendimiento y experiencia de usuario.',
  ],
};

export const ABOUT_STATS: readonly IStat[] = [
  { value: '2+', label: 'Años de experiencia' },
  { value: '100%', label: 'Orientado a producto' },
];
