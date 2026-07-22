import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ViewEncapsulation, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { I18nService } from '@core/i18n';
import { PortfolioIcon } from '@shared/components';
import { PortfolioAnimatedBorderDirective } from '@shared/directives';
import { techIconUrl } from '@shared/utils/tech-icons';

import { GITHUB_STATS_KEYS } from '../../mocks';
import { GithubStatsService } from './github-stats.service';
import type { GithubStats } from './entities/github-stats.entity';

@Component({
  selector: 'portfolio-github-stats',
  standalone: true,
  imports: [PortfolioIcon, PortfolioAnimatedBorderDirective],
  templateUrl: './github-stats.html',
  styleUrl: './github-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: block;',
  },
})
export class GithubStatsComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly githubStatsService = inject(GithubStatsService);
  private readonly i18nService = inject(I18nService);

  protected readonly techIconUrl = techIconUrl;

  protected readonly loading = signal(true);
  protected readonly stats = signal<GithubStats | null>(null);

  protected readonly ariaLabel = computed(() => this.t(GITHUB_STATS_KEYS.aria));
  protected readonly eyebrow = computed(() => this.t(GITHUB_STATS_KEYS.eyebrow));
  protected readonly title = computed(() => this.t(GITHUB_STATS_KEYS.title));
  protected readonly reposLabel = computed(() => this.t(GITHUB_STATS_KEYS.repos));
  protected readonly starsLabel = computed(() => this.t(GITHUB_STATS_KEYS.stars));
  protected readonly forksLabel = computed(() => this.t(GITHUB_STATS_KEYS.forks));
  protected readonly mainLanguageLabel = computed(() => this.t(GITHUB_STATS_KEYS.language));

  protected readonly updatedLabel = computed(() => {
    const currentStats = this.stats();

    if (!currentStats || !currentStats.lastUpdatedAt) {
      return this.t(GITHUB_STATS_KEYS.syncing);
    }

    const date = new Date(currentStats.lastUpdatedAt);
    const locale = this.i18nService.language() === 'es' ? 'es-HN' : 'en-US';

    const formattedDate = date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${this.t(GITHUB_STATS_KEYS.updated)} ${formattedDate}`;
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.loadStats();
  }

  private async loadStats(): Promise<void> {
    try {
      const stats = await this.githubStatsService.getStats();
      this.stats.set(stats);
    } catch {
      this.stats.set({
        publicRepos: 0,
        totalStars: 0,
        totalForks: 0,
        followers: 0,
        primaryLanguage: 'TypeScript',
        languages: [{ name: 'TypeScript', count: 1, percentage: 100 }],
        lastUpdatedAt: null,
        profileUrl: 'https://github.com/Liriraid',
        cachedAt: Date.now(),
      });
    } finally {
      this.loading.set(false);
    }
  }

  private t(key: string): string {
    return this.i18nService.t(key);
  }
}
