import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ViewEncapsulation, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, computed, inject } from '@angular/core';

import { I18nService } from '@core/i18n';
import { PortfolioIcon } from '@shared/components';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioAnimatedBorderDirective } from '@shared/directives';
import { PortfolioSectionRevealService } from '@shared/services';
import { scrollToPortfolioSection } from '@shared/utils/portfolio-scroll';

import { ABOUT_CONTENT, ABOUT_STATS } from './mocks';
import { AboutService } from './about.service';
import { GithubStatsComponent } from './ui/github-stats/github-stats';

@Component({
  selector: 'portfolio-about',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon, PortfolioAnimatedBorderDirective, GithubStatsComponent],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
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
  private readonly i18nService = inject(I18nService);

  @ViewChild('contentRef') contentRef!: ElementRef<HTMLElement>;
  @ViewChild('statsRef') statsRef!: ElementRef<HTMLElement>;

  protected readonly about = computed(() => ({
    label: this.t(ABOUT_CONTENT.label),
    title: this.t(ABOUT_CONTENT.title),
    ctaLabel: this.t(ABOUT_CONTENT.ctaLabel),
    paragraphs: ABOUT_CONTENT.paragraphs.map((key) => ({
      id: key,
      text: this.t(key),
    })),
  }));

  protected readonly stats = computed(() =>
    ABOUT_STATS.map((stat) => ({
      id: stat.label,
      value: this.t(stat.value),
      label: this.t(stat.label),
    })),
  );

  protected readonly statsAriaLabel = computed(() => this.t('about.stats.aria'));

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

  protected scrollToExperience(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    scrollToPortfolioSection('experience');
  }

  private t(key: string): string {
    return this.i18nService.t(key);
  }
}
