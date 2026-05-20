import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { PortfolioToast } from '@shared/components/portfolio-toast/portfolio-toast';
import { AlertService } from '@shared/services/alert.service';
import { PORTFOLIO_SECTION_IDS, getPortfolioScrollRoot, scrollToPortfolioSection } from '@shared/utils/portfolio-scroll';

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
  protected readonly alertService = inject(AlertService);

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
            scrollToPortfolioSection(visibleSectionId, 'auto');
          }
        }, 80);
      };

      window.addEventListener('resize', onResize, { passive: true });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', onResize);

        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
      });
    });
  }

  private getHeaderHeight(): number {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--app-header-height').trim();
    const parsed = Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      return 64;
    }

    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    return value.endsWith('rem') ? parsed * rootFontSize : parsed;
  }

  private getVisibleSectionId(): string | null {
    const scrollRoot = getPortfolioScrollRoot();

    if (!scrollRoot) {
      return null;
    }

    const rootRect = scrollRoot.getBoundingClientRect();
    const headerHeight = this.getHeaderHeight();
    const scanTop = rootRect.top + headerHeight;
    const scanBottom = rootRect.bottom;

    let bestMatch: string | null = null;
    let maxVisibleHeight = 0;

    for (const id of PORTFOLIO_SECTION_IDS) {
      const section = document.getElementById(id);

      if (!section) {
        continue;
      }

      const rect = section.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, scanTop);
      const visibleBottom = Math.min(rect.bottom, scanBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        bestMatch = id;
      }
    }

    return bestMatch;
  }
}
