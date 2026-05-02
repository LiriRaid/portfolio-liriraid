import { Component, signal } from '@angular/core';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location?: string;
  description: string;
  technologies: string[];
  current?: boolean;
}

@Component({
  selector: 'portfolio-experience',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience {
  protected readonly experiences = signal<ExperienceItem[]>([
    {
      company: 'Empresa actual',
      role: 'Desarrollador Full Angular',
      period: '2024 — Presente',
      location: 'Remoto',
      description:
        'Diseño e implementación de aplicaciones Angular 21 con SSR e hidratación incremental. Liderazgo técnico en arquitectura limpia, design systems y rendimiento.',
      technologies: ['Angular 21', 'TypeScript', 'Tailwind CSS', 'PrimeNG', 'Node.js'],
      current: true,
    },
  ]);
}
