import { IContactContent, ISocialLink } from '@features/portfolio/entities';

// Las cadenas de label/title/description y social.label son keys i18n; se resuelven con I18nService.t() en el componente.
export const CONTACT_CONTENT: IContactContent = {
  label: 'contact.label',
  titleStart: 'contact.title.start',
  titleHighlight: 'contact.title.highlight',
  description: 'contact.description',
};

export const CONTACT_SOCIAL_LINKS: readonly ISocialLink[] = [
  {
    techIcon: 'GitHub',
    label: 'contact.social.github',
    href: 'https://github.com/liriraid',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  {
    techIcon: 'LinkedIn',
    label: 'contact.social.linkedin',
    href: 'https://www.linkedin.com/in/gabriel-leonardo-cruz-flores-64570a1a4/',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
];
