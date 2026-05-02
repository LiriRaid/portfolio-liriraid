const SKILL = 'https://skillicons.dev/icons?i=';

const MAP: Record<string, string> = {
  'Angular':         'assets/svg/angular-logo.svg',
  'Angular 21':      'assets/svg/angular-logo.svg',
  'AngularJS':       'assets/svg/angular-logo.svg',
  'PrimeNG':         `assets/svg/primeng-logo.svg`,
  'TypeScript':      `${SKILL}ts`,
  'JavaScript':      `${SKILL}js`,
  'HTML':            `${SKILL}html`,
  'HTML5':           `${SKILL}html`,
  'CSS':             `${SKILL}css`,
  'CSS3':            `${SKILL}css`,
  'SASS':            `${SKILL}sass`,
  'Tailwind CSS':    `${SKILL}tailwind`,
  'RxJS':            `${SKILL}rxjs`,
  'Signals':         `assets/svg/angular-logo.svg`, // No hay un ícono específico para Signals, se usa el de Angular como referencia
  'Node.js':         `${SKILL}nodejs`,
  'Ruby on Rails':   `${SKILL}rails`,
  'Express':         `${SKILL}express`,
  'NestJS':          `${SKILL}nestjs`,
  'Nest.js':         `${SKILL}nestjs`,
  'PostgreSQL':      `${SKILL}postgres`,
  'Redis':           `${SKILL}redis`,
  'Git':             `${SKILL}git`,
  'Docker':          `${SKILL}docker`,
  'GitHub Actions':  `${SKILL}githubactions`,
  'VS Code':         `${SKILL}vscode`,
  'Postman':         `${SKILL}postman`,
  'Figma':           `${SKILL}figma`,
  'GSAP':            'assets/svg/gsap-black.svg',
  'Vitest':          'assets/svg/vitest-logo.svg',
  'NPM':             'assets/svg/npm-logo.svg',
  'GitHub':          `${SKILL}github`,
  'LinkedIn':        `${SKILL}linkedin`,
};

export function techIconUrl(name: string): string | null {
  return MAP[name] ?? null;
}
