import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      let previousWidth = window.innerWidth;
      let resizeTimer: ReturnType<typeof setTimeout> | null = null;

      const onResize = (): void => {
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
            this.scrollToSection(visibleSectionId, 'auto');
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

  private getScrollRoot(): HTMLElement | null {
    return document.querySelector<HTMLElement>('.layout-scroll-root');
  }

  private getHeaderHeight(): number {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--app-header-height').trim();
    const parsed = Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      return 64;
    }

    return value.endsWith('rem') ? parsed * this.getRootFontSize() : parsed;
  }

  private getRootFontSize(): number {
    return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  }

  private scrollToSection(sectionId: string, behavior: ScrollBehavior): void {
    const scrollRoot = this.getScrollRoot();
    const section = document.getElementById(sectionId);

    if (!scrollRoot || !section) {
      return;
    }

    const scrollRootRect = scrollRoot.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const headerHeight = this.getHeaderHeight();

    const top = sectionRect.top - scrollRootRect.top + scrollRoot.scrollTop - headerHeight;

    scrollRoot.scrollTo({
      top: Math.max(0, Math.round(top)),
      behavior,
    });
  }

  private getVisibleSectionId(): string | null {
    const scrollRoot = this.getScrollRoot();

    if (!scrollRoot) {
      return null;
    }

    const rootRect = scrollRoot.getBoundingClientRect();
    const headerHeight = this.getHeaderHeight();
    const scanLine = rootRect.top + headerHeight + 1;

    let bestMatch: string | null = null;
    let maxVisibleHeight = 0;

    for (const id of this.sectionIds) {
      const section = document.getElementById(id);

      if (!section) {
        continue;
      }

      const rect = section.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, scanLine);
      const visibleBottom = Math.min(rect.bottom, rootRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        bestMatch = id;
      }
    }

    return bestMatch;
  }
}
