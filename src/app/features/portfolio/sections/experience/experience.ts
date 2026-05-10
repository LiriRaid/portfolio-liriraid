import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, inject } from '@angular/core';

import { ExperienceItem } from '@features/portfolio/entities';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';

import { ExperienceService } from './experience.service';

@Component({
  selector: 'portfolio-experience',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; --e-inner-opacity: 0; --e-inner-visibility: hidden;',
  },
})
export class Experience {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef);
  private readonly experienceService = inject(ExperienceService);

  @ViewChild('headerRef') headerRef!: ElementRef<HTMLElement>;
  @ViewChild('timelineRef') timelineRef!: ElementRef<HTMLElement>;

  protected readonly techIconUrl = techIconUrl;

  protected readonly experiences: readonly ExperienceItem[] = [
    {
      company: 'CIT (Creative Infotainment Technologies)',
      role: 'Desarrollador Full Angular',
      period: 'Julio · 2024 — Presente',
      location: 'Presencial',
      description: 'Desarrollo de aplicaciones web empresariales con Angular moderno, enfocadas en arquitectura escalable, componentes reutilizables, rendimiento y experiencia de usuario.',
      responsibilities: [
        'Construcción de módulos administrativos con Angular 21, TypeScript, PrimeNG y Tailwind CSS.',
        'Implementación de arquitectura frontend basada en features, rutas lazy loading y separación clara por dominio.',
        'Desarrollo de componentes reutilizables para formularios, botones, iconos, sidebars, modales, filtros, inputs y elementos de interfaz.',
        'Manejo de estado moderno con signals, computed, effects, servicios reactivos y RxJS cuando aplica.',
        'Integración con APIs REST para flujos CRUD, autenticación, permisos, paginación, filtros avanzados y dashboards.',
        'Optimización de rendimiento, carga inicial, experiencia responsive y consistencia visual del sistema.',
        'Mantenimiento y mejora de proyectos legacy con AngularJS, migrando lógica hacia soluciones más modernas y mantenibles.',
      ],
      technologies: ['Angular 21', 'AngularJS', 'TypeScript', 'Signals', 'RxJS', 'PrimeNG', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
      current: true,
    },
  ];

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    afterNextRender(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          this.experienceService.animateEntrance(this.elementRef, this.headerRef, this.timelineRef);
        }
      }, { threshold: 0.1 });
      
      observer.observe(this.elementRef.nativeElement);
    });
  }
}
