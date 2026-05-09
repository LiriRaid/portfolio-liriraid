import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, inject } from '@angular/core';
import gsap from 'gsap';

import { AboutContent, Stat } from '@features/portfolio/entities';
import { PortfolioIcon } from '@shared/components';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';

@Component({
  selector: 'portfolio-about',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef);

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
          this.animateEntrance();
        }
      }, { threshold: 0.1 });
      
      observer.observe(this.elementRef.nativeElement);
    });
  }

  private animateEntrance(): void {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (this.contentRef?.nativeElement) {
      tl.fromTo(this.contentRef.nativeElement.children, 
        { opacity: 0, x: -30 }, 
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.15 }
      );
    }

    if (this.statsRef?.nativeElement) {
      tl.fromTo(this.statsRef.nativeElement.children, 
        { opacity: 0, x: 30 }, 
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.15 }, 
        "-=0.4"
      );
    }
  }

  protected scrollToContact(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
