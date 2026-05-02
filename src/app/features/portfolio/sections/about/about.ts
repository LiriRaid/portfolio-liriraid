import { Component, signal } from '@angular/core';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';

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
  protected readonly stats = signal<Stat[]>([
    { value: '3+', label: 'Años de experiencia' },
    { value: '10+', label: 'Proyectos entregados' },
    { value: '100%', label: 'Orientado a producto' },
  ]);

  protected goToProjects(): void {
    document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth' });
  }
}
