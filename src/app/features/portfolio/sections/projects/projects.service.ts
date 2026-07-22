import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal, ElementRef } from '@angular/core';
import { IGithubRepositoryResponse, IGithubRepositoryStats } from '@features/portfolio/entities';
import { loadGsap } from '@shared/utils/gsap-loader';

const CACHE_KEY = 'portfolio-github-stats';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

interface CachedStats {
  data: Record<string, IGithubRepositoryStats>;
  timestamp: number;
}

@Injectable()
export class ProjectsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly memoryCache = new Map<string, IGithubRepositoryStats>();
  private readonly pendingRequests = new Map<string, Promise<IGithubRepositoryStats | null>>();
  private readonly loadingRepos = signal<Set<string>>(new Set());
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isLoading = this.loadingRepos.asReadonly();

  constructor() {
    if (this.isBrowser) {
      this.loadFromStorage();
    }
  }

  getRepositoryStats(repo: string): Promise<IGithubRepositoryStats | null> {
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

  private async fetchRepositoryStats(repo: string): Promise<IGithubRepositoryStats | null> {
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

      const data = (await response.json()) as IGithubRepositoryResponse;

      const stats: IGithubRepositoryStats = {
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
      const data: Record<string, IGithubRepositoryStats> = {};

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

  // --- ANIMATIONS ---

  readonly EXIT_DURATION = 0.68;
  readonly ENTER_DURATION = 0.52;

  /**
   * Animación de entrada ÚNICA y EXCLUSIVA para la sección de Proyectos: "Focus-Reveal".
   */
  async animateEntrance(_hostRef: ElementRef<HTMLElement>, headerRef?: ElementRef<HTMLElement>, toolbarRef?: ElementRef<HTMLElement>, resultsRef?: ElementRef<HTMLElement>): Promise<void> {
    const gsap = await loadGsap();

    if (headerRef?.nativeElement) gsap.killTweensOf(headerRef.nativeElement.children);
    if (toolbarRef?.nativeElement) gsap.killTweensOf(toolbarRef.nativeElement);
    if (resultsRef?.nativeElement) gsap.killTweensOf(resultsRef.nativeElement);

    const tl = gsap.timeline({
      defaults: { ease: 'power4.out', force3D: true },
    });

    if (headerRef?.nativeElement) {
      tl.fromTo(headerRef.nativeElement.children, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, clearProps: 'opacity,visibility,transform' });
    }

    if (toolbarRef?.nativeElement) {
      tl.fromTo(toolbarRef.nativeElement, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, clearProps: 'opacity,visibility,transform' }, '-=0.5');
    }

    if (resultsRef?.nativeElement) {
      tl.fromTo(resultsRef.nativeElement, { autoAlpha: 0, y: 40, filter: 'blur(10px)', scale: 0.98 }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1.1, clearProps: 'opacity,visibility,transform,filter' }, '-=0.4');
    }
  }

  /**
   * Ejecuta la animación de salida de una tarjeta y notifica al terminar
   */
  async animateCardExit(element: HTMLElement): Promise<void> {
    const gsap = await loadGsap();

    await gsap.to(element, {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: this.EXIT_DURATION,
      ease: 'power2.in',
    });
  }

  /**
   * Ejecuta la animación de entrada de una tarjeta
   */
  async animateCardEntry(element: HTMLElement): Promise<void> {
    const gsap = await loadGsap();

    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.95, y: -20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: this.ENTER_DURATION,
        ease: 'power4.out',
        clearProps: 'all',
      },
    );
  }
}
