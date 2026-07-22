import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';

import { getPortfolioScrollRoot } from '@shared/utils/portfolio-scroll';

@Component({
  selector: 'portfolio-scroll-progress',
  standalone: true,
  template: `<div class="scroll-bar" [style.transform]="transform()" aria-hidden="true"></div>`,
  styleUrl: './portfolio-scroll-progress.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioScrollProgress {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly progress = signal(0);
  protected readonly transform = computed(() => `scaleX(${this.progress()})`);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    afterNextRender(() => {
      const root = getPortfolioScrollRoot();
      if (!root) return;

      let rafId = 0;

      const update = () => {
        rafId = 0;
        const { scrollTop, scrollHeight, clientHeight } = root;
        const max = scrollHeight - clientHeight;
        this.progress.set(max > 0 ? Math.min(scrollTop / max, 1) : 0);
      };

      const onScroll = () => {
        if (!rafId) rafId = requestAnimationFrame(update);
      };

      root.addEventListener('scroll', onScroll, { passive: true });

      this.destroyRef.onDestroy(() => {
        root.removeEventListener('scroll', onScroll);
        if (rafId) cancelAnimationFrame(rafId);
      });
    });
  }
}
