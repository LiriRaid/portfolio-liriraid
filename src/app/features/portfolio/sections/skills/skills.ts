import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, computed, inject } from '@angular/core';

import { I18nService } from '@core/i18n';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioAnimatedBorderDirective } from '@shared/directives';
import { techIconUrl } from '@shared/utils/tech-icons';

import { SKILL_CATEGORIES, SKILL_FALLBACK_ICONS, SKILLS_HEADER } from './mocks';
import { SkillsService } from './skills.service';
import { PortfolioSectionRevealService } from '@shared/services';

@Component({
  selector: 'portfolio-skills',
  standalone: true,
  imports: [PortfolioIcon, PortfolioAnimatedBorderDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block;',
  },
})
export class Skills {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly skillsService = inject(SkillsService);
  private readonly revealService = inject(PortfolioSectionRevealService);
  private readonly i18nService = inject(I18nService);

  @ViewChild('headerRef') protected headerRef!: ElementRef<HTMLElement>;
  @ViewChild('gridRef') protected gridRef!: ElementRef<HTMLElement>;

  protected readonly techIconUrl = techIconUrl;

  protected readonly header = computed(() => ({
    label: this.t(SKILLS_HEADER.label),
    title: this.t(SKILLS_HEADER.title),
    subtitle: this.t(SKILLS_HEADER.subtitle),
  }));

  protected readonly categories = computed(() =>
    SKILL_CATEGORIES.map((category) => ({
      ...category,
      label: this.t(category.label),
    })),
  );

  protected readonly categoryAriaPrefix = computed(() => this.t('skills.category.aria.prefix'));

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.revealService.revealOnViewport({
        hostRef: this.elementRef,
        destroyRef: this.destroyRef,
        onReveal: () => {
          this.skillsService.animateEntrance(this.elementRef, this.headerRef, this.gridRef);
        },
      });
    });
  }

  protected skillFallbackIcon(skill: string): string {
    return SKILL_FALLBACK_ICONS[skill] ?? 'Code';
  }

  private t(key: string): string {
    return this.i18nService.t(key);
  }
}
