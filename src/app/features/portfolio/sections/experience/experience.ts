import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ExperienceItem } from '@features/portfolio/entities';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';

@Component({
  selector: 'portfolio-experience',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
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
}
