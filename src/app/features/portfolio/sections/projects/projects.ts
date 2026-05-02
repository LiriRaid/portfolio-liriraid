import { Component, signal } from '@angular/core';
import { Project } from '@features/portfolio/entities';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';

@Component({
  selector: 'portfolio-projects',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  protected readonly techIconUrl = techIconUrl;

  protected readonly projects = signal<Project[]>([
    {
      title: 'OmniInbox',
      description:
        'Plataforma unificada de bandeja de entrada multicanal. Centraliza comunicaciones de email, WhatsApp, llamadas y más en un solo panel operacional. Construida para equipos de soporte y ventas orientados a escala.',
      tags: ['Angular', 'TypeScript', 'Node.js', 'PostgreSQL', 'WebSocket', 'SSR'],
      githubUrl: null,
      liveUrl: null,
      featured: true,
    },
    {
      title: 'Portfolio Liriraid',
      description:
        'Portfolio personal profesional construido con Angular 21 SSR, Incremental Hydration y Tailwind CSS 4. Arquitectura limpia con Screaming Architecture, lazy loading y design system propio.',
      tags: ['Angular 21', 'SSR', 'Tailwind CSS', 'PrimeNG', 'TypeScript'],
      githubUrl: 'https://github.com/liriraid',
      liveUrl: null,
    },
    {
      title: 'API de Gestión',
      description:
        'API REST robusta para gestión de recursos empresariales. Incluye autenticación JWT, control de acceso por roles, validación de datos y documentación OpenAPI. Diseñada para mantenibilidad y extensibilidad.',
      tags: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'REST API', 'OpenAPI'],
      githubUrl: 'https://github.com/liriraid',
      liveUrl: null,
    },
  ]);
}
