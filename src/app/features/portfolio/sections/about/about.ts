import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, inject } from '@angular/core';

import { AboutContent, Stat } from '@features/portfolio/entities';
import { PortfolioIcon } from '@shared/components';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';

import { AboutService } from './about.service';
import { PortfolioAnimatedBorderDirective } from '../../../../shared/directives/portfolio-animated-border.directive';

@Component({
  selector: 'portfolio-about',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon, PortfolioAnimatedBorderDirective],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; --a-inner-opacity: 0; --a-inner-visibility: hidden;',
  },
})
export class About {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef);
  private readonly aboutService = inject(AboutService);

  @ViewChild('contentRef') contentRef!: ElementRef<HTMLElement>;
  @ViewChild('statsRef') statsRef!: ElementRef<HTMLElement>;

  protected readonly about: AboutContent = {
    label: '¿Quién soy?',
    title: 'Sobre mí',
    ctaLabel: 'Contactarme',
    paragraphs: ['Soy Gabriel Leonardo Cruz Flores, desarrollador Full Angular enfocado en crear aplicaciones web modernas, rápidas y mantenibles con Angular, TypeScript, Tailwind CSS, PrimeNG y Node.js.', 'Trabajo construyendo interfaces, dashboards, formularios, flujos administrativos, componentes reutilizables e integraciones con APIs, cuidando arquitectura, rendimiento y experiencia de usuario.'],
  };

  protected readonly stats: Stat[] = [
    { value: '2+', label: 'Años de experiencia' },
    { value: '2', label: 'Proyectos públicos en GitHub' },
    { value: '100%', label: 'Orientado a producto' },
  ];

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    afterNextRender(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          this.aboutService.animateEntrance(this.elementRef, this.contentRef, this.statsRef);
        }
      }, { threshold: 0.1 });

      observer.observe(this.elementRef.nativeElement);
    });
  }



  protected scrollToContact(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
