import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, QueryList, ViewChild, ViewChildren, afterNextRender, computed, inject } from '@angular/core';

import { I18nService } from '@core/i18n';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioAnimatedBorderDirective } from '@shared/directives';
import { techIconUrl } from '@shared/utils/tech-icons';

import { EXPERIENCE_HEADER, EXPERIENCES } from './mocks';
import { ExperienceService } from './experience.service';
import { PortfolioSectionRevealService } from '@shared/services';

@Component({
  selector: 'portfolio-experience',
  standalone: true,
  imports: [PortfolioIcon, PortfolioAnimatedBorderDirective],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block;',
  },
})
export class Experience {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly experienceService = inject(ExperienceService);
  private readonly revealService = inject(PortfolioSectionRevealService);
  private readonly i18nService = inject(I18nService);

  @ViewChild('headerRef') protected headerRef!: ElementRef<HTMLElement>;
  @ViewChild('timelineRef') protected timelineRef!: ElementRef<HTMLElement>;
  @ViewChildren('lineRef') protected lineRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('dotRef') protected dotRefs!: QueryList<ElementRef<HTMLElement>>;

  protected readonly techIconUrl = techIconUrl;

  protected readonly header = computed(() => ({
    label: this.t(EXPERIENCE_HEADER.label),
    title: this.t(EXPERIENCE_HEADER.title),
    subtitle: this.t(EXPERIENCE_HEADER.subtitle),
  }));

  protected readonly currentBadge = computed(() => this.t('experience.badge.current'));
  protected readonly technologiesAriaLabel = computed(() => this.t('experience.tags.aria'));

  protected readonly experiences = computed(() =>
    EXPERIENCES.map((item) => ({
      ...item,
      role: this.t(item.role),
      period: this.t(item.period),
      location: item.location ? this.t(item.location) : undefined,
      description: this.t(item.description),
      responsibilities: item.responsibilities.map((key) => this.t(key)),
    })),
  );

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.revealService.revealOnViewport({
        hostRef: this.elementRef,
        destroyRef: this.destroyRef,
        onReveal: () => {
          this.experienceService.animateEntrance(this.elementRef, this.headerRef, this.timelineRef, this.lineRefs, this.dotRefs);
        },
      });
    });
  }

  private t(key: string): string {
    return this.i18nService.t(key);
  }
}
