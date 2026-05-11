import { IContactContent, ISocialLink } from '@features/portfolio/entities';

export const CONTACT_CONTENT: IContactContent = {
  label: 'Hablemos',
  titleStart: '¿Listo para construir',
  titleHighlight: 'algo juntos?',
  description:
    'Estoy abierto a proyectos freelance, colaboraciones técnicas y propuestas donde pueda aportar valor construyendo soluciones web modernas, escalables y bien cuidadas. Si tienes una idea que quieras llevar a producción, me encantaría escucharla.',
};

export const CONTACT_SOCIAL_LINKS: readonly ISocialLink[] = [
  {
    techIcon: 'GitHub',
    label: 'GitHub',
    href: 'https://github.com/liriraid',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  {
    techIcon: 'LinkedIn',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/gabriel-leonardo-cruz-flores-64570a1a4/',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
];
