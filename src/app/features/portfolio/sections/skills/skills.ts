import { Component, signal } from '@angular/core';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';

export interface SkillCategory {
  label: string;
  icon: string;
  skills: string[];
}

@Component({
  selector: 'portfolio-skills',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills {
  protected readonly categories = signal<SkillCategory[]>([
    {
      label: 'Frontend',
      icon: 'Globe',
      skills: ['Angular 21', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'RxJS', 'Signals'],
    },
    {
      label: 'Backend',
      icon: 'Server',
      skills: ['Node.js', 'Ruby on Rails', 'Express', 'REST API', 'GraphQL', 'WebSocket'],
    },
    {
      label: 'Base de datos',
      icon: 'Database',
      skills: ['PostgreSQL', 'MySQL', 'Redis', 'ActiveRecord', 'Prisma'],
    },
    {
      label: 'Herramientas',
      icon: 'Settings',
      skills: ['Git', 'Docker', 'GitHub Actions', 'VS Code', 'Postman', 'Figma'],
    },
    {
      label: 'Arquitectura',
      icon: 'Layers',
      skills: [
        'Clean Architecture',
        'Screaming Architecture',
        'SSR + Hydration',
        'Lazy Loading',
        'DRY / SOLID',
        'DDD',
      ],
    },
  ]);
}
