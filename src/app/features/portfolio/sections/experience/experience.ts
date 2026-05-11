import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, inject } from '@angular/core';

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

  @ViewChild('headerRef') protected headerRef!: ElementRef<HTMLElement>;
  @ViewChild('timelineRef') protected timelineRef!: ElementRef<HTMLElement>;

  protected readonly techIconUrl = techIconUrl;

  protected readonly header = EXPERIENCE_HEADER;
  protected readonly experiences = EXPERIENCES;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.revealService.revealOnViewport({
        hostRef: this.elementRef,
        destroyRef: this.destroyRef,
        onReveal: () => {
          this.experienceService.animateEntrance(this.elementRef, this.headerRef, this.timelineRef);
        },
      });
    });
  }
}
