import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, afterNextRender, inject } from '@angular/core';

import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';

type CodeToken = {
  readonly value: string;
  readonly className: string;
};

type CodeLine = {
  readonly indent?: 1 | 2;
  readonly tokens: readonly CodeToken[];
};

@Component({
  selector: 'portfolio-hero',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cvUrl = 'assets/docs/gabriel-cruz-cv.pdf';
  private readonly cvFileName = 'Gabriel-Leonardo-Cruz-Flores-CV.pdf';

  protected readonly techIconUrl = techIconUrl;

  protected readonly stack = ['Angular', 'TypeScript', 'HTML', 'CSS', 'SASS', 'Node.js', 'Ruby on Rails', 'PostgreSQL', 'Tailwind CSS'] as const;

  protected readonly windowDots = ['dot-red', 'dot-yellow', 'dot-green'] as const;

  protected readonly codeLines: readonly CodeLine[] = [
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

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    afterNextRender(() => {
      this.resetToHeroOnLoad();
      this.animateEntrance();
    });
  }

  protected scrollToExperience(): void {
    if (!this.isBrowser) {
      return;
    }

    document.getElementById('experiencia')?.scrollIntoView({ behavior: 'smooth' });
  }

  protected downloadCV(): void {
    if (!this.isBrowser) {
      return;
    }

    const link = document.createElement('a');

    link.href = this.cvUrl;
    link.download = this.cvFileName;
    link.rel = 'noopener';
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  private resetToHeroOnLoad(): void {
    if (!window.location.hash) {
      return;
    }

    history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
  }

  private async animateEntrance(): Promise<void> {
    const { gsap } = await import('gsap');

    gsap.fromTo('.hero-content', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
  }
}
