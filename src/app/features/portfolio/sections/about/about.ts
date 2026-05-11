import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, inject } from '@angular/core';

import { PortfolioIcon } from '@shared/components';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioAnimatedBorderDirective } from '@shared/directives';

import { ABOUT_CONTENT, ABOUT_STATS } from './mocks';
import { AboutService } from './about.service';
import { PortfolioSectionRevealService } from '@shared/services';

@Component({
  selector: 'portfolio-about',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon, PortfolioAnimatedBorderDirective],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block;',
  },
})
export class About {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly aboutService = inject(AboutService);
  private readonly revealService = inject(PortfolioSectionRevealService);

  @ViewChild('contentRef') contentRef!: ElementRef<HTMLElement>;
  @ViewChild('statsRef') statsRef!: ElementRef<HTMLElement>;

  protected readonly about = ABOUT_CONTENT;
  protected readonly stats = ABOUT_STATS;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.revealService.revealOnViewport({
        hostRef: this.elementRef,
        destroyRef: this.destroyRef,
        onReveal: () => {
          this.aboutService.animateEntrance(this.elementRef, this.contentRef, this.statsRef);
        },
      });
    });
  }

  protected scrollToContact(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
