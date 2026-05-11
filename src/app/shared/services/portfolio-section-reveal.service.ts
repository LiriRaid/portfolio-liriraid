import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, ElementRef, Injectable, PLATFORM_ID, inject } from '@angular/core';

interface PortfolioSectionRevealOptions {
  hostRef: ElementRef<HTMLElement>;
  destroyRef: DestroyRef;
  threshold?: number;
  onReveal: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioSectionRevealService {
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  revealOnViewport(options: PortfolioSectionRevealOptions): void {
    if (!this.isBrowser) {
      return;
    }

    const { hostRef, destroyRef, onReveal } = options;
    const threshold = options.threshold ?? 0.1;

    let revealed = false;
    let observer: IntersectionObserver | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let rafId = 0;

    const cleanup = (): void => {
      observer?.disconnect();
      observer = null;

      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const revealTarget = (): HTMLElement => {
      return hostRef.nativeElement.querySelector<HTMLElement>('.portfolio-section-reveal') ?? hostRef.nativeElement;
    };

    const reveal = (): void => {
      if (revealed) {
        return;
      }

      revealed = true;
      cleanup();

      revealTarget().classList.add('portfolio-section-reveal--ready');
      onReveal();
    };

    const isVisibleNow = (): boolean => {
      const element = hostRef.nativeElement;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      return rect.top < viewportHeight * (1 - threshold) && rect.bottom > viewportHeight * threshold;
    };

    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        if (isVisibleNow()) {
          reveal();
          return;
        }

        observer = new IntersectionObserver(
          (entries) => {
            if (!entries[0]?.isIntersecting) {
              return;
            }

            reveal();
          },
          {
            threshold,
            rootMargin: '0px 0px -8% 0px',
          },
        );

        observer.observe(hostRef.nativeElement);

        fallbackTimer = setTimeout(() => {
          if (isVisibleNow()) {
            reveal();
          }
        }, 500);
      });
    });

    destroyRef.onDestroy(cleanup);
  }
}
