const ICONS: Record<string, string> = {
  Angular: 'assets/svg/technologies/angular-logo.svg',
  'Angular 21': 'assets/svg/technologies/angular-logo.svg',
  AngularJS: 'assets/svg/technologies/angular-logo.svg',
  PrimeNG: 'assets/svg/technologies/primeng-logo.svg',
  Signals: 'assets/svg/technologies/angular-logo.svg',
  GSAP: 'assets/svg/technologies/gsap-black.svg',
  Vitest: 'assets/svg/technologies/vitest-logo.svg',
  NPM: 'assets/svg/technologies/npm-logo.svg',

  TypeScript: 'assets/svg/technologies/typescript.svg',
  JavaScript: 'assets/svg/technologies/javascript.svg',
  HTML: 'assets/svg/technologies/html5.svg',
  HTML5: 'assets/svg/technologies/html5.svg',
  CSS: 'assets/svg/technologies/css3.svg',
  CSS3: 'assets/svg/technologies/css3.svg',
  SASS: 'assets/svg/technologies/sass.svg',
  'Tailwind CSS': 'assets/svg/technologies/tailwindcss.svg',
  RxJS: 'assets/svg/technologies/rxjs.svg',
  'Node.js': 'assets/svg/technologies/nodejs.svg',
  'Ruby on Rails': 'assets/svg/technologies/rails.svg',
  Express: 'assets/svg/technologies/express.svg',
  NestJS: 'assets/svg/technologies/nestjs.svg',
  'Nest.js': 'assets/svg/technologies/nestjs.svg',
  PostgreSQL: 'assets/svg/technologies/postgresql.svg',
  Redis: 'assets/svg/technologies/redis.svg',
  Git: 'assets/svg/technologies/git.svg',
  Docker: 'assets/svg/technologies/docker.svg',
  'GitHub Actions': 'assets/svg/technologies/github-actions.svg',
  'VS Code': 'assets/svg/technologies/vscode.svg',
  Postman: 'assets/svg/technologies/postman.svg',
  Figma: 'assets/svg/technologies/figma.svg',
  GitHub: 'assets/svg/technologies/github.svg',
  LinkedIn: 'assets/svg/technologies/linkedin.svg',
};

export function techIconUrl(name: string): string | null {
  return ICONS[name] ?? null;
}
