import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';

@Component({
  selector: 'portfolio-hero',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cvUrl = 'assets/docs/gabriel-cruz-cv.pdf';

  protected readonly techIconUrl = techIconUrl;

  protected readonly stack = ['Angular', 'TypeScript', 'HTML', 'CSS', 'SASS', 'Node.js', 'Ruby on Rails', 'PostgreSQL', 'Tailwind CSS'] as const;

  protected readonly visible = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      afterNextRender(() => {
        this.resetToHeroOnLoad();
        this.animateEntrance();
      });
    }
  }

  private resetToHeroOnLoad(): void {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
    }
  }

  private animateEntrance(): void {
    import('gsap').then(({ gsap }) => {
      gsap.fromTo('.hero-content', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    });
  }

  protected scrollToExperience(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.getElementById('experiencia')?.scrollIntoView({ behavior: 'smooth' });
  }

  protected downloadCV(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const link = document.createElement('a');

    link.href = this.cvUrl;
    link.download = 'Gabriel-Leonardo-Cruz-Flores-CV.pdf';
    link.rel = 'noopener';
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
