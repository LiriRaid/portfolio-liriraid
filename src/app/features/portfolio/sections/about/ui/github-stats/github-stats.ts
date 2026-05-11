import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { PortfolioIcon } from '@shared/components';
import { PortfolioAnimatedBorderDirective } from '@shared/directives';
import { techIconUrl } from '@shared/utils/tech-icons';

import { GithubStatsService } from './github-stats.service';
import type { GithubStats } from './entities/github-stats.entity';

@Component({
  selector: 'portfolio-github-stats',
  standalone: true,
  imports: [PortfolioIcon, PortfolioAnimatedBorderDirective],
  templateUrl: './github-stats.html',
  styleUrl: './github-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block;',
  },
})
export class GithubStatsComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly githubStatsService = inject(GithubStatsService);

  protected readonly techIconUrl = techIconUrl;

  protected readonly loading = signal(true);
  protected readonly stats = signal<GithubStats | null>(null);

  protected readonly updatedLabel = computed(() => {
    const stats = this.stats();

    if (!stats?.lastUpdatedAt) {
      return 'Sincronizando';
    }

    const date = new Date(stats.lastUpdatedAt);

    return `Actualizado ${date.toLocaleDateString('es-HN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
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
}
