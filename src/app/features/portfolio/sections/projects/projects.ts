import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Popover } from 'primeng/popover';

import { I18nService } from '@core/i18n';
import { IProject, IProjectTechnologyCategory } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { CarouselItem } from '@shared/components/portfolio-carousel/carousel-item.directive';
import { PortfolioCarousel } from '@shared/components/portfolio-carousel/portfolio-carousel';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioSearch } from '@shared/components/portfolio-search/portfolio-search';
import { PortfolioAnimatedBorderDirective } from '@shared/directives';
import { techIconUrl } from '@shared/utils/tech-icons';

import { PROJECT_TECH_FALLBACK_ICONS, PROJECT_TECHNOLOGY_CATEGORIES, PROJECTS, PROJECTS_EMPTY_STATE, PROJECTS_HEADER } from './mocks';
import { ProjectsService } from './projects.service';
import { PortfolioSectionRevealService } from '@shared/services';

@Component({
  selector: 'portfolio-projects',
  standalone: true,
  imports: [Popover, PortfolioButton, PortfolioCarousel, CarouselItem, PortfolioIcon, PortfolioSearch, PortfolioAnimatedBorderDirective],
  providers: [ProjectsService],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; background-color: var(--app-panel-muted-bg);',
  },
})
export class Projects {
  private readonly projectsService = inject(ProjectsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly revealService = inject(PortfolioSectionRevealService);
  private readonly i18nService = inject(I18nService);

  @ViewChild('headerRef') private headerRef?: ElementRef<HTMLElement>;
  @ViewChild('toolbarRef') private toolbarRef?: ElementRef<HTMLElement>;
  @ViewChild('resultsRef') private resultsRef?: ElementRef<HTMLElement>;
  @ViewChild('filterPanel') private filterPanel?: Popover;

  protected readonly techIconUrl = techIconUrl;

  protected readonly header = computed(() => ({
    label: this.t(PROJECTS_HEADER.label),
    title: this.t(PROJECTS_HEADER.title),
    subtitle: this.t(PROJECTS_HEADER.subtitle),
  }));

  protected readonly emptyState = computed(() => ({
    searchTitle: this.t(PROJECTS_EMPTY_STATE.searchTitle),
    filtersTitle: this.t(PROJECTS_EMPTY_STATE.filtersTitle),
    description: this.t(PROJECTS_EMPTY_STATE.description),
  }));

  protected readonly filtersButtonLabel = computed(() => this.t('projects.filters.button'));
  protected readonly filtersButtonAria = computed(() => this.t('projects.filters.button.aria'));
  protected readonly filtersClearLabel = computed(() => this.t('projects.filters.clear'));
  protected readonly filtersClearAria = computed(() => this.t('projects.filters.clear.aria'));
  protected readonly filtersPanelTitle = computed(() => this.t('projects.filters.panel.title'));
  protected readonly filtersPanelClear = computed(() => this.t('projects.filters.panel.clear'));
  protected readonly filtersPanelHint = computed(() => this.t('projects.filters.panel.hint'));
  protected readonly filtersCategoriesAria = computed(() => this.t('projects.filters.categories.aria'));
  protected readonly selectedTagsAria = computed(() => this.t('projects.filters.selectedTags.aria'));
  protected readonly removeFilterPrefix = computed(() => this.t('projects.filters.remove.prefix'));
  protected readonly searchPlaceholder = computed(() => this.t('projects.search.placeholder'));
  protected readonly featuredBadge = computed(() => this.t('projects.badge.featured'));
  protected readonly cardTagsAria = computed(() => this.t('projects.card.tags.aria'));
  protected readonly statsAria = computed(() => this.t('projects.stats.aria'));
  protected readonly forkLabel = computed(() => this.t('projects.stats.fork'));
  protected readonly githubLoading = computed(() => this.t('projects.github.loading'));
  protected readonly githubUnavailable = computed(() => this.t('projects.github.unavailable'));
  protected readonly privateProjectLabel = computed(() => this.t('projects.private'));
  protected readonly viewGithubPrefix = computed(() => this.t('projects.link.github.prefix'));
  protected readonly viewGithubSuffix = computed(() => this.t('projects.link.github.suffix'));
  protected readonly demoLabel = computed(() => this.t('projects.link.live'));
  protected readonly viewDemoPrefix = computed(() => this.t('projects.link.live.prefix'));

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });
  protected readonly searchTerm = signal('');

  protected readonly projects = signal<IProject[]>([...PROJECTS]);
  protected readonly technologyCategories = signal<IProjectTechnologyCategory[]>([...PROJECT_TECHNOLOGY_CATEGORIES]);
  protected readonly selectedTechnologies = signal<string[]>([]);

  protected readonly activeFilterCategoryLabel = signal<string | null>(PROJECT_TECHNOLOGY_CATEGORIES[0]?.label ?? null);

  protected readonly displayedProjects = signal<IProject[]>([...PROJECTS]);
  protected readonly leavingProjectTitles = signal<Set<string>>(new Set());
  protected readonly enteringProjectTitles = signal<Set<string>>(new Set());

  protected readonly showProjectsCarousel = signal(PROJECTS.length > 0);
  protected readonly showEmptyState = signal(false);

  protected readonly activeCarouselProjectTitle = signal(PROJECTS[0]?.title ?? '');

  private readonly selectedTechnologySet = computed(() => new Set(this.selectedTechnologies()));

  protected readonly hasSelectedTechnologies = computed(() => this.selectedTechnologies().length > 0);
  protected readonly hasSearchTerm = computed(() => this.searchTerm().length > 0);

  protected readonly activeFilterCategory = computed(() => {
    const categories = this.technologyCategories();
    const activeLabel = this.activeFilterCategoryLabel();

    return categories.find((category) => category.label === activeLabel) ?? categories[0] ?? null;
  });

  protected readonly filteredProjects = computed(() => {
    const selected = this.selectedTechnologySet();
    const term = this.normalizeText(this.searchTerm());

    return this.projects().filter((project) => {
      const matchesTechnology = !selected.size || project.tags.some((technology) => selected.has(technology));
      const matchesSearch = !term || this.projectMatchesSearch(project, term);

      return matchesTechnology && matchesSearch;
    });
  });

  protected readonly displayedProjectsKey = computed(() =>
    this.displayedProjects()
      .map((project) => project.title)
      .join('|'),
  );

  protected readonly displayedProjectsStateKey = computed(() => {
    return this.displayedProjects()
      .map((project) => {
        const state = this.isProjectLeaving(project.title) ? 'leaving' : this.isProjectEntering(project.title) ? 'entering' : 'active';

        return `${project.title}:${state}`;
      })
      .join('|');
  });

  private readonly leavingProjectTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly enteringProjectTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private emptyStateTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const searchSubscription = this.searchControl.valueChanges.subscribe((value) => {
      this.searchTerm.set(value.trim());
      this.syncDisplayedProjects();
    });

    this.destroyRef.onDestroy(() => {
      searchSubscription.unsubscribe();

      this.clearEmptyStateTimer();

      this.leavingProjectTimeouts.forEach((timeout) => clearTimeout(timeout));
      this.leavingProjectTimeouts.clear();

      this.enteringProjectTimeouts.forEach((timeout) => clearTimeout(timeout));
      this.enteringProjectTimeouts.clear();
    });

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.revealService.revealOnViewport({
        hostRef: this.elementRef,
        destroyRef: this.destroyRef,
        onReveal: () => {
          this.projectsService.animateEntrance(this.elementRef, this.headerRef, this.toolbarRef, this.resultsRef);
          void this.loadGithubStats();
        },
      });

      const onResize = (): void => {
        this.filterPanel?.hide();
      };

      window.addEventListener('resize', onResize);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', onResize);
      });
    });
  }

  protected selectFilterCategory(label: string): void {
    this.activeFilterCategoryLabel.set(label);
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term.trim());
    this.syncDisplayedProjects();
  }

  protected toggleTechnology(technology: string): void {
    this.selectedTechnologies.update((current) => (current.includes(technology) ? current.filter((item) => item !== technology) : [...current, technology]));
    this.syncDisplayedProjects();
  }

  protected removeTechnology(technology: string): void {
    this.selectedTechnologies.update((current) => current.filter((item) => item !== technology));
    this.syncDisplayedProjects();
  }

  protected clearFilters(): void {
    this.selectedTechnologies.set([]);
    this.syncDisplayedProjects();
  }

  protected isTechnologySelected(technology: string): boolean {
    return this.selectedTechnologySet().has(technology);
  }

  protected isProjectLeaving(title: string): boolean {
    return this.leavingProjectTitles().has(title);
  }

  protected isProjectEntering(title: string): boolean {
    return this.enteringProjectTitles().has(title);
  }

  protected techFallbackIcon(technology: string): string {
    return PROJECT_TECH_FALLBACK_ICONS[technology] ?? 'Code';
  }

  protected isRepositoryLoading(repo: string): boolean {
    return this.projectsService.isLoading().has(repo);
  }

  protected translateCategoryLabel(label: string): string {
    return this.t(label);
  }

  protected translateProjectDescription(description: string): string {
    return this.t(description);
  }

  protected formatVisibility(visibility: string | null | undefined): string {
    return visibility === 'private' ? this.t('projects.stats.visibility.private') : this.t('projects.stats.visibility.public');
  }

  protected formatLicense(license: string | null | undefined): string {
    if (!license || license === 'NOASSERTION') {
      return this.t('projects.stats.license.none');
    }

    return license.toUpperCase() === 'MIT' ? 'MIT' : license;
  }

  private t(key: string): string {
    return this.i18nService.t(key);
  }

  private syncDisplayedProjects(): void {
    const nextProjects = this.filteredProjects();
    const currentDisplayedProjects = this.displayedProjects();

    this.activeCarouselProjectTitle.set(nextProjects[0]?.title ?? '');

    if (!nextProjects.length) {
      this.updateStateForEmptyResults(currentDisplayedProjects);
      return;
    }

    this.updateStateForResults(nextProjects, currentDisplayedProjects);
  }

  private updateStateForEmptyResults(currentProjects: IProject[]): void {
    this.clearEmptyStateTimer();
    this.clearEnteringProjectAnimations();

    if (!currentProjects.length) {
      this.displayedProjects.set([]);
      this.showProjectsCarousel.set(false);
      this.showEmptyState.set(true);
      return;
    }

    this.showProjectsCarousel.set(true);
    this.showEmptyState.set(false);

    this.markProjectsState(currentProjects, 'leaving', () => {
      if (!this.filteredProjects().length && !this.displayedProjects().length && !this.leavingProjectTitles().size) {
        this.showProjectsCarousel.set(false);
        this.showEmptyState.set(true);
      }
    });
  }

  private updateStateForResults(nextProjects: IProject[], currentProjects: IProject[]): void {
    const wasEmpty = this.showEmptyState() || !this.showProjectsCarousel() || !currentProjects.length;

    this.clearEmptyStateTimer();
    this.showEmptyState.set(false);
    this.showProjectsCarousel.set(true);

    const nextTitles = new Set(nextProjects.map((project) => project.title));
    const currentTitles = new Set(currentProjects.map((project) => project.title));

    const leaving = currentProjects.filter((project) => !nextTitles.has(project.title));
    const entering = nextProjects.filter((project) => !currentTitles.has(project.title));

    nextProjects.forEach((project) => {
      const timeout = this.leavingProjectTimeouts.get(project.title);

      if (!timeout) {
        return;
      }

      clearTimeout(timeout);
      this.leavingProjectTimeouts.delete(project.title);
    });

    if (!leaving.length) {
      const sorted = this.replaceProjectReferences(this.sortProjectsByOriginalOrder(nextProjects, this.projects()));
      this.displayedProjects.set(sorted);
      this.markProjectsState(wasEmpty ? sorted : entering, 'entering');
      return;
    }

    const merged = this.sortProjectsByOriginalOrder([...currentProjects, ...entering], this.projects());
    this.displayedProjects.set(this.replaceProjectReferences(merged));

    this.markProjectsState(entering, 'entering');
    this.markProjectsState(leaving, 'leaving');
  }

  private markProjectsState(projects: IProject[], state: 'entering' | 'leaving', callback?: () => void): void {
    if (!projects.length) {
      return;
    }

    const signal = state === 'entering' ? this.enteringProjectTitles : this.leavingProjectTitles;
    const timeouts = state === 'entering' ? this.enteringProjectTimeouts : this.leavingProjectTimeouts;
    const duration = (state === 'entering' ? this.projectsService.ENTER_DURATION : this.projectsService.EXIT_DURATION) * 1000;

    projects.forEach((project) => {
      const existing = timeouts.get(project.title);

      if (existing) {
        clearTimeout(existing);
      }

      signal.update((current) => new Set(current).add(project.title));

      const timeout = setTimeout(() => {
        if (state === 'leaving') {
          this.displayedProjects.update((list) => list.filter((item) => item.title !== project.title));
        }

        signal.update((current) => {
          const updated = new Set(current);
          updated.delete(project.title);

          return updated;
        });

        timeouts.delete(project.title);

        if (callback) {
          callback();
        }
      }, duration);

      timeouts.set(project.title, timeout);
    });
  }

  private clearEnteringProjectAnimations(): void {
    this.enteringProjectTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.enteringProjectTimeouts.clear();
    this.enteringProjectTitles.set(new Set());
  }

  private clearEmptyStateTimer(): void {
    if (!this.emptyStateTimer) {
      return;
    }

    clearTimeout(this.emptyStateTimer);
    this.emptyStateTimer = null;
  }

  private replaceProjectReferences(projects: IProject[]): IProject[] {
    const projectByTitle = new Map(this.projects().map((project) => [project.title, project]));

    return projects.map((project) => projectByTitle.get(project.title) ?? project);
  }

  private sortProjectsByOriginalOrder(projects: IProject[], originalProjects: IProject[]): IProject[] {
    const uniqueProjects = new Map(projects.map((project) => [project.title, project]));
    const order = new Map(originalProjects.map((project, index) => [project.title, index]));

    return Array.from(uniqueProjects.values()).sort((a, b) => {
      return (order.get(a.title) ?? 0) - (order.get(b.title) ?? 0);
    });
  }

  private projectMatchesSearch(project: IProject, term: string): boolean {
    return this.normalizeText(project.title).includes(term) || this.normalizeText(this.t(project.description)).includes(term) || project.tags.some((tag) => this.normalizeText(tag).includes(term));
  }

  private normalizeText(value: string): string {
    return value.trim().toLowerCase();
  }

  private async loadGithubStats(): Promise<void> {
    const entries = await Promise.all(
      this.projects().map(async (project) => ({
        repo: project.repo,
        stats: await this.projectsService.getRepositoryStats(project.repo),
      })),
    );

    const statsByRepo = new Map(entries.map(({ repo, stats }) => [repo, stats ?? undefined]));

    this.projects.update((projects) =>
      projects.map((project) => ({
        ...project,
        githubStats: statsByRepo.get(project.repo) ?? project.githubStats,
      })),
    );

    this.displayedProjects.set(this.replaceProjectReferences(this.displayedProjects()));
  }
}
