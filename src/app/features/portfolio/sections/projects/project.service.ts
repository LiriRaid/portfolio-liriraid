import { Injectable, signal } from '@angular/core';
import { GithubRepositoryResponse, GithubRepositoryStats } from '@features/portfolio/entities';

@Injectable({
  providedIn: 'root',
})
export class GithubRepositoryService {
  private readonly cache = new Map<string, GithubRepositoryStats>();
  private readonly loadingRepos = signal<Set<string>>(new Set());

  readonly isLoading = this.loadingRepos.asReadonly();

  async getRepositoryStats(repo: string): Promise<GithubRepositoryStats | null> {
    const cachedStats = this.cache.get(repo);

    if (cachedStats) {
      return cachedStats;
    }

    this.setRepoLoading(repo, true);

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as GithubRepositoryResponse;

      const stats: GithubRepositoryStats = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        visibility: data.visibility,
        license: data.license?.spdx_id ?? data.license?.name ?? null,
      };

      this.cache.set(repo, stats);

      return stats;
    } catch {
      return null;
    } finally {
      this.setRepoLoading(repo, false);
    }
  }

  private setRepoLoading(repo: string, loading: boolean): void {
    this.loadingRepos.update((current) => {
      const next = new Set(current);

      if (loading) {
        next.add(repo);
      } else {
        next.delete(repo);
      }

      return next;
    });
  }
}
