import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, inject } from '@angular/core';

import { SkillCategory } from '@features/portfolio/entities';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';

import { SkillsService } from './skills.service';
import { PortfolioAnimatedBorderDirective } from '@shared/directives/portfolio-animated-border.directive';

@Component({
  selector: 'portfolio-skills',
  standalone: true,
  imports: [PortfolioIcon, PortfolioAnimatedBorderDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; --s-inner-opacity: 0; --s-inner-visibility: hidden;',
  },
})
export class Skills {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef);
  private readonly skillsService = inject(SkillsService);

  @ViewChild('headerRef') headerRef!: ElementRef<HTMLElement>;
  @ViewChild('gridRef') gridRef!: ElementRef<HTMLElement>;

  protected readonly techIconUrl = techIconUrl;

  private readonly fallbackIcons: Record<string, string> = {
    'REST API': 'Server',
    'Clean Architecture': 'Layers',
    'Screaming Architecture': 'Folder',
    'SSR + Hydration': 'Server',
    'Lazy Loading': 'Download',
    'DRY / SOLID': 'ShieldCheck',
    DDD: 'Database',
  };

  protected readonly categories: SkillCategory[] = [
    {
      label: 'Frontend',
      icon: 'Globe',
      skills: ['Angular 21', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'RxJS', 'Signals'],
    },
    {
      label: 'Backend',
      icon: 'Server',
      skills: ['Node.js', 'NestJS', 'Ruby on Rails', 'Express', 'REST API'],
    },
    {
      label: 'Base de datos',
      icon: 'Database',
      skills: ['PostgreSQL', 'Redis'],
    },
    {
      label: 'Herramientas',
      icon: 'Settings',
      skills: ['Git', 'Docker', 'GitHub Actions', 'VS Code', 'Postman', 'Figma', 'GSAP', 'Vitest', 'NPM'],
    },
    {
      label: 'Arquitectura',
      icon: 'Layers',
      skills: ['Clean Architecture', 'Screaming Architecture', 'SSR + Hydration', 'Lazy Loading', 'DRY / SOLID', 'DDD'],
    },
  ];

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    afterNextRender(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          this.skillsService.animateEntrance(this.elementRef, this.headerRef, this.gridRef);
        }
      }, { threshold: 0.1 });

      observer.observe(this.elementRef.nativeElement);
    });
  }



  protected skillFallbackIcon(skill: string): string {
    return this.fallbackIcons[skill] ?? 'Code';
  }
}
