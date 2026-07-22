import { IAboutContent, IStat } from '@features/portfolio/entities';

// Las cadenas son keys i18n; se resuelven con I18nService.t() en el componente.
export const ABOUT_CONTENT: IAboutContent = {
  label: 'about.label',
  title: 'about.title',
  ctaLabel: 'about.cta',
  paragraphs: ['about.paragraphs.0', 'about.paragraphs.1'],
};

export const ABOUT_STATS: readonly IStat[] = [
  { value: 'about.stats.0.value', label: 'about.stats.0.label' },
  { value: 'about.stats.1.value', label: 'about.stats.1.label' },
];
