import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

import type { GithubLanguageStat, GithubRepoResponse, GithubStats, GithubUserResponse } from './entities/github-stats.entity';

const GITHUB_USERNAME = 'Liriraid';
const GITHUB_STATS_STORAGE_KEY = 'portfolio-github-stats';
const GITHUB_STATS_TTL_MS = 1000 * 60 * 60;

type GithubRepoLanguagesResponse = Record<string, number>;

@Injectable({
  providedIn: 'root',
})
export class GithubStatsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  async getStats(): Promise<GithubStats> {
    const cached = this.readCache();

    if (cached) {
      return cached;
    }

    const stats = await this.fetchStats();
    this.writeCache(stats);

    return stats;
  }

  private async fetchStats(): Promise<GithubStats> {
    const [userResponse, reposResponse] = await Promise.all([fetch(`https://api.github.com/users/${GITHUB_USERNAME}`), fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`)]);

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error('No se pudieron cargar las estadísticas de GitHub.');
    }

    const user = (await userResponse.json()) as GithubUserResponse;
    const repos = (await reposResponse.json()) as GithubRepoResponse[];

    const publicRepos = repos.filter((repo) => !repo.private);
    const ownPublicRepos = publicRepos.filter((repo) => !repo.fork);
    const sourceRepos = ownPublicRepos.length > 0 ? ownPublicRepos : publicRepos;

    const totalStars = sourceRepos.reduce((total, repo) => total + repo.stargazers_count, 0);
    const totalForks = sourceRepos.reduce((total, repo) => total + repo.forks_count, 0);

    const languages = await this.buildLanguageStats(sourceRepos);
    const primaryLanguage = languages[0]?.name ?? 'TypeScript';
    const lastUpdatedAt = sourceRepos[0]?.updated_at ?? null;

    return {
      publicRepos: sourceRepos.length,
      totalStars,
      totalForks,
      followers: user.followers,
      primaryLanguage,
      languages,
      lastUpdatedAt,
      profileUrl: user.html_url,
      cachedAt: Date.now(),
    };
  }

  private async buildLanguageStats(repos: GithubRepoResponse[]): Promise<GithubLanguageStat[]> {
    const languageMap = new Map<string, number>();

    const languageRequests = repos.map((repo) =>
      fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/languages`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`No se pudieron cargar los lenguajes de ${repo.name}.`);
          }

          return response.json() as Promise<GithubRepoLanguagesResponse>;
        })
        .catch(() => null),
    );

    const languageResponses = await Promise.all(languageRequests);

    for (const languages of languageResponses) {
      if (!languages) continue;

      for (const [language, bytes] of Object.entries(languages)) {
        languageMap.set(language, (languageMap.get(language) ?? 0) + bytes);
      }
    }

    if (languageMap.size === 0) {
      return this.buildFallbackLanguageStats(repos);
    }

    const totalBytes = Array.from(languageMap.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(languageMap.entries())
      .map(([name, bytes]) => ({
        name,
        count: bytes,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private buildFallbackLanguageStats(repos: GithubRepoResponse[]): GithubLanguageStat[] {
    const languageMap = new Map<string, number>();

    for (const repo of repos) {
      const language = repo.language ?? 'Otros';
      languageMap.set(language, (languageMap.get(language) ?? 0) + 1);
    }

    const total = Array.from(languageMap.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(languageMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private readCache(): GithubStats | null {
    if (!this.isBrowser) return null;

    try {
      const raw = localStorage.getItem(GITHUB_STATS_STORAGE_KEY);
      if (!raw) return null;

      const cached = JSON.parse(raw) as GithubStats;
      const isValid = Date.now() - cached.cachedAt < GITHUB_STATS_TTL_MS;

      return isValid ? cached : null;
    } catch {
      return null;
    }
  }

  private writeCache(stats: GithubStats): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(GITHUB_STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Cache best-effort.
    }
  }
}
