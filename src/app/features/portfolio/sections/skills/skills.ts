import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkillCategory } from '@features/portfolio/entities';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';

@Component({
  selector: 'portfolio-skills',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
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

  protected skillFallbackIcon(skill: string): string {
    return this.fallbackIcons[skill] ?? 'Code';
  }
}
