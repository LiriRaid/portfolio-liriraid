import { Component, DestroyRef, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { PortfolioToast } from '@shared/components/portfolio-toast/portfolio-toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, PortfolioToast],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly sectionIds = ['inicio', 'experiencia', 'proyectos', 'habilidades', 'sobre-mi', 'contacto'];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        let previousWidth = window.innerWidth;
        let resizeTimer: ReturnType<typeof setTimeout> | null = null;

        const onResize = () => {
          const currentWidth = window.innerWidth;

          if (currentWidth === previousWidth) {
            return;
          }

          previousWidth = currentWidth;

          if (resizeTimer) {
            clearTimeout(resizeTimer);
          }

          const visibleSectionId = this.getVisibleSectionId();

          resizeTimer = setTimeout(() => {
            if (visibleSectionId) {
              document.getElementById(visibleSectionId)?.scrollIntoView({
                behavior: 'instant',
                block: 'start',
              });
            }
          }, 50);
        };

        window.addEventListener('resize', onResize);

        this.destroyRef.onDestroy(() => {
          window.removeEventListener('resize', onResize);

          if (resizeTimer) {
            clearTimeout(resizeTimer);
          }
        });
      });
    }
  }

  private getVisibleSectionId(): string | null {
    const headerOffset = 80;

    let bestMatch: string | null = null;
    let maxVisibleHeight = 0;

    for (const id of this.sectionIds) {
      const el = document.getElementById(id);

      if (!el) {
        continue;
      }

      const rect = el.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, headerOffset);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        bestMatch = id;
      }
    }

    return bestMatch;
  }
}
