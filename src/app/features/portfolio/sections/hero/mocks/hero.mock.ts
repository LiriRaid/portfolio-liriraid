import { IHeroCodeLine, IHeroCvFile, IHeroWindowDot } from '@features/portfolio/entities';

export const HERO_CV_FILE: IHeroCvFile = {
  url: 'assets/docs/gabriel-cruz-cv.pdf',
  fileName: 'Gabriel-Leonardo-Cruz-Flores-CV.pdf',
};

export const HERO_STACK = ['Angular', 'TypeScript', 'HTML', 'CSS', 'SCSS', 'Node.js', 'Ruby on Rails', 'PostgreSQL', 'Tailwind CSS'] as const;

export const HERO_WINDOW_DOTS: readonly IHeroWindowDot[] = [{ className: 'hero-window-dot--red' }, { className: 'hero-window-dot--yellow' }, { className: 'hero-window-dot--green' }];

export const HERO_CODE_LINES: readonly IHeroCodeLine[] = [
  {
    tokens: [
      { value: 'export class', className: 'code-keyword' },
      { value: ' GabrielCruz', className: 'code-class' },
      { value: ' {', className: 'code-punct' },
    ],
  },
  {
    indent: 1,
    tokens: [
      { value: 'role', className: 'code-prop' },
      { value: ' = ', className: 'code-punct' },
      { value: "'Full Angular Dev'", className: 'code-string' },
      { value: ';', className: 'code-punct' },
    ],
  },
  {
    indent: 1,
    tokens: [
      { value: 'focus', className: 'code-prop' },
      { value: ' = ', className: 'code-punct' },
      { value: "'Product & Scale'", className: 'code-string' },
      { value: ';', className: 'code-punct' },
    ],
  },
  {
    indent: 1,
    tokens: [
      { value: 'stack', className: 'code-prop' },
      { value: ' = [', className: 'code-punct' },
    ],
  },
  {
    indent: 2,
    tokens: [
      { value: "'Angular'", className: 'code-string' },
      { value: ',', className: 'code-punct' },
      { value: " 'Node.js'", className: 'code-string' },
      { value: ',', className: 'code-punct' },
    ],
  },
  {
    indent: 2,
    tokens: [
      { value: "'Rails'", className: 'code-string' },
      { value: ',', className: 'code-punct' },
      { value: " 'PostgreSQL'", className: 'code-string' },
    ],
  },
  {
    indent: 1,
    tokens: [{ value: '];', className: 'code-punct' }],
  },
  {
    tokens: [{ value: '}', className: 'code-punct' }],
  },
];
