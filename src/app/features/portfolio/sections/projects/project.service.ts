import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { GithubRepositoryResponse, GithubRepositoryStats } from '@features/portfolio/entities';

const CACHE_KEY = 'portfolio-github-stats';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

interface CachedStats {
  data: Record<string, GithubRepositoryStats>;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class GithubRepositoryService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly memoryCache = new Map<string, GithubRepositoryStats>();
  private readonly pendingRequests = new Map<string, Promise<GithubRepositoryStats | null>>();
  private readonly loadingRepos = signal<Set<string>>(new Set());
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isLoading = this.loadingRepos.asReadonly();

  constructor() {
    if (this.isBrowser) {
      this.loadFromStorage();
    }
  }

  getRepositoryStats(repo: string): Promise<GithubRepositoryStats | null> {
    const cachedStats = this.memoryCache.get(repo);

    if (cachedStats) {
      return Promise.resolve(cachedStats);
    }

    const pendingRequest = this.pendingRequests.get(repo);

    if (pendingRequest) {
      return pendingRequest;
    }

    const request = this.fetchRepositoryStats(repo).finally(() => {
      this.pendingRequests.delete(repo);
    });

    this.pendingRequests.set(repo, request);

    return request;
  }

  private async fetchRepositoryStats(repo: string): Promise<GithubRepositoryStats | null> {
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

      this.memoryCache.set(repo, stats);
      this.saveToStorage();

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

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(CACHE_KEY);

      if (!raw) return;

      const cached: CachedStats = JSON.parse(raw);

      if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_KEY);
        return;
      }

      for (const [repo, stats] of Object.entries(cached.data)) {
        this.memoryCache.set(repo, stats);
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  private saveToStorage(): void {
    if (!this.isBrowser) return;

    try {
      const data: Record<string, GithubRepositoryStats> = {};

      this.memoryCache.forEach((stats, repo) => {
        data[repo] = stats;
      });

      const cached: CachedStats = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }
}
