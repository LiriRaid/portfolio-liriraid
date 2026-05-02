import { Component, inject, signal } from '@angular/core';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioSectionNavigationService } from '../../portfolio-section-navigation.service';

export interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'portfolio-about',
  standalone: true,
  imports: [PortfolioButton],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  private readonly sectionNavigation = inject(PortfolioSectionNavigationService);

  protected readonly stats = signal<Stat[]>([
    { value: '3+', label: 'Años de experiencia' },
    { value: '10+', label: 'Proyectos entregados' },
    { value: '100%', label: 'Orientado a producto' },
  ]);

  protected goToProjects(): void {
    this.sectionNavigation.requestNavigation('proyectos');
  }
}
