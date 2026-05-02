import { Component, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';
import { PortfolioSectionNavigationService } from '../../portfolio-section-navigation.service';

@Component({
  selector: 'portfolio-hero',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sectionNavigation = inject(PortfolioSectionNavigationService);

  protected readonly techIconUrl = techIconUrl;

  protected readonly stack = [
    'Angular', 'TypeScript', 'HTML', 'CSS', 'SASS',
    'Node.js', 'Ruby on Rails', 'PostgreSQL', 'Tailwind CSS',
  ] as const;

  protected readonly visible = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.animateEntrance();
      });
    }
  }

  private animateEntrance(): void {
    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        '.hero-content',
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      );
    });
  }

  protected scrollToProjects(): void {
    this.sectionNavigation.requestNavigation('proyectos');
  }

  protected scrollToContact(): void {
    this.sectionNavigation.requestNavigation('contacto');
  }
}
