import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, afterNextRender, computed, inject } from '@angular/core';

import { I18nService } from '@core/i18n';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { AlertService } from '@shared/services/alert.service';
import { scrollToPortfolioSection } from '@shared/utils/portfolio-scroll';
import { techIconUrl } from '@shared/utils/tech-icons';

import { HERO_CODE_LINES, HERO_CV_FILE, HERO_STACK, HERO_TEXT_KEYS, HERO_WINDOW_DOTS } from './mocks';
import { HeroService } from './hero.service';

@Component({
  selector: 'portfolio-hero',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly alertService = inject(AlertService);
  private readonly heroService = inject(HeroService);
  private readonly i18nService = inject(I18nService);

  protected readonly techIconUrl = techIconUrl;

  protected readonly stack = HERO_STACK;
  protected readonly codeLines = HERO_CODE_LINES;
  protected readonly windowDots = HERO_WINDOW_DOTS;

  protected readonly badge = computed(() => this.t(HERO_TEXT_KEYS['badge']));
  protected readonly titleLine1 = computed(() => this.t(HERO_TEXT_KEYS['titleLine1']));
  protected readonly titleLine2 = computed(() => this.t(HERO_TEXT_KEYS['titleLine2']));
  protected readonly titleLine3 = computed(() => this.t(HERO_TEXT_KEYS['titleLine3']));
  protected readonly description = computed(() => this.t(HERO_TEXT_KEYS['description']));
  protected readonly experienceCta = computed(() => this.t(HERO_TEXT_KEYS['experienceCta']));
  protected readonly cvCta = computed(() => this.t(HERO_TEXT_KEYS['cvCta']));
  protected readonly stackAriaLabel = computed(() => this.t(HERO_TEXT_KEYS['stackAria']));
  protected readonly cvSuccessTitle = computed(() => this.t(HERO_TEXT_KEYS['cvSuccessTitle']));
  protected readonly cvSuccessMessage = computed(() => this.t(HERO_TEXT_KEYS['cvSuccessMessage']));

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    afterNextRender(() => {
      this.heroService.animateEntrance();
    });
  }

  protected scrollToExperience(): void {
    if (!this.isBrowser) {
      return;
    }

    scrollToPortfolioSection('experience');
  }

  protected downloadCV(): void {
    if (!this.isBrowser) {
      return;
    }

    const link = document.createElement('a');

    link.href = HERO_CV_FILE.url;
    link.download = HERO_CV_FILE.fileName;
    link.rel = 'noopener';
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    link.remove();

    this.alertService.showSuccess(this.cvSuccessTitle(), this.cvSuccessMessage(), undefined, 4000, 'top-center');
  }

  private t(key: string): string {
    return this.i18nService.t(key);
  }

}
