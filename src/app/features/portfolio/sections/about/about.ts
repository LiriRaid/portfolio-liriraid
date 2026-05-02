import { Component, signal } from '@angular/core';
import { AboutContent, Stat } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';

@Component({
  selector: 'portfolio-about',
  standalone: true,
  imports: [PortfolioButton],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly about = signal<AboutContent>({
    label: '¿Quién soy?',
    title: 'Sobre mí',
    ctaLabel: 'Contactarme',
    paragraphs: ['Soy Gabriel Leonardo Cruz Flores, desarrollador Full Angular enfocado en crear aplicaciones web modernas, rápidas y mantenibles con Angular, TypeScript, Tailwind CSS, PrimeNG y Node.js.', 'Trabajo construyendo interfaces, dashboards, formularios, flujos administrativos, componentes reutilizables e integraciones con APIs, cuidando arquitectura, rendimiento y experiencia de usuario.'],
  });

  protected readonly stats = signal<Stat[]>([
    { value: '2+', label: 'Años de experiencia' },
    { value: '2', label: 'Proyectos públicos en GitHub' },
    { value: '100%', label: 'Orientado a producto' },
  ]);

  protected scrollToContact(): void {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
