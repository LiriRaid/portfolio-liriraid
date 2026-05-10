import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { gsap } from 'gsap';
import { FormControl } from '@angular/forms';
import { Popover } from 'primeng/popover';

import { Project, ProjectTechnologyCategory } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { CarouselItem } from '@shared/components/portfolio-carousel/carousel-item.directive';
import { PortfolioCarousel } from '@shared/components/portfolio-carousel/portfolio-carousel';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioSearch } from '@shared/components/portfolio-search/portfolio-search';
import { techIconUrl } from '@shared/utils/tech-icons';

import { ProjectsService } from './projects.service';
import { PortfolioAnimatedBorderDirective } from '@shared/directives/portfolio-animated-border.directive';

const PROJECTS: Project[] = [
  {
    title: 'OmniInbox',
    description: 'Plataforma conversacional tipo inbox omnicanal construida con Angular 21. Centraliza módulos de login, inbox, perfil y shell autenticado con arquitectura feature-first, componentes standalone, lazy loading, tema claro/oscuro, animaciones y testing moderno.',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'Tailwind CSS', 'PrimeNG', 'GSAP', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: 'LiriRaid/omni-inbox',
    githubUrl: 'https://github.com/LiriRaid/omni-inbox',
    liveUrl: null,
    featured: true,
    screenshots: ['assets/img/projects/omniinbox-profile.svg', 'assets/img/projects/omniinbox-login.svg', 'assets/img/projects/omniinbox-inbox.svg'],
  },
  {
    title: 'AgentFlow AI',
    description: 'Orquestador multiagente para desarrollo con IA. Coordina agentes como Claude, Codex, OpenCode y Gemini, delega tareas, monitorea progreso en una TUI y mantiene el proyecto principal limpio mediante un workspace separado.',
    tags: ['Node.js', 'JavaScript', 'NPM', 'CLI', 'TUI', 'AI Agents', 'Automation', 'Clean Architecture'],
    repo: 'LiriRaid/agentflow-ai',
    githubUrl: 'https://github.com/LiriRaid/agentflow-ai',
    liveUrl: null,
    screenshots: ['assets/img/projects/agentflow-tui.svg', 'assets/img/projects/agentflow-orchestrator.svg'],
  },
  {
    title: 'Portfolio Liriraid',
    description: 'Portfolio personal profesional creado con Angular 21, SSR, prerender, hidratación normal, sistema de temas dinámico, componentes reutilizables y estructura escalable basada en features.',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'SSR', 'Prerender', 'PrimeNG', 'Tailwind CSS', 'CSS', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: 'LiriRaid/portfolio-liriraid',
    githubUrl: 'https://github.com/LiriRaid/portfolio-liriraid',
    liveUrl: null,
    screenshots: ['assets/img/projects/portfolio-hero.svg', 'assets/img/projects/portfolio-projects.svg'],
  },
];

const TECHNOLOGY_CATEGORIES: ProjectTechnologyCategory[] = [
  {
    label: 'Frontend',
    icon: 'Globe',
    technologies: ['Angular 21', 'AngularJS', 'Signals', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'PrimeNG', 'RxJS'],
  },
  {
    label: 'Backend',
    icon: 'Server',
    technologies: ['Node.js', 'NestJS', 'Ruby on Rails', 'Express', 'REST API'],
  },
  {
    label: 'Base de datos',
    icon: 'Database',
    technologies: ['PostgreSQL', 'Redis'],
  },
  {
    label: 'Herramientas',
    icon: 'Settings',
    technologies: ['Git', 'Docker', 'GitHub Actions', 'VS Code', 'Postman', 'Figma', 'GSAP', 'Vitest', 'NPM'],
  },
  {
    label: 'Arquitectura',
    icon: 'Layers',
    technologies: ['Screaming Architecture', 'Feature-first', 'Clean Architecture', 'Prerender', 'SSR', 'Lazy Loading', 'DRY / SOLID', 'DDD'],
  },
  {
    label: 'IA / Automatización',
    icon: 'Code',
    technologies: ['JavaScript', 'CLI', 'TUI', 'AI Agents', 'Automation'],
  },
];

const FALLBACK_ICONS: Record<string, string> = {
  'Clean Architecture': 'Layers',
  'Screaming Architecture': 'Folder',
  'Feature-first': 'Folder',
  SSR: 'Server',
  Prerender: 'Globe',
  'Lazy Loading': 'Download',
  'DRY / SOLID': 'ShieldCheck',
  DDD: 'Database',
  CLI: 'Code',
  TUI: 'MediaPreview',
  'AI Agents': 'MessagesSquare',
  Automation: 'Settings',
  'REST API': 'Server',
  MIT: 'Scale',
};

@Component({
  selector: 'portfolio-projects',
  standalone: true,
  imports: [Popover, PortfolioButton, PortfolioCarousel, CarouselItem, PortfolioIcon, PortfolioSearch, PortfolioAnimatedBorderDirective],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; background-color: var(--app-panel-muted-bg); --p-inner-opacity: 0; --p-inner-visibility: hidden;',
  },
})
export class Projects {
  private readonly projectsService = inject(ProjectsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @ViewChild('headerRef') private headerRef?: ElementRef<HTMLElement>;
  @ViewChild('toolbarRef') private toolbarRef?: ElementRef<HTMLElement>;
  @ViewChild('resultsRef') private resultsRef?: ElementRef<HTMLElement>;
  @ViewChild('filterPanel') private filterPanel?: Popover;

  protected readonly techIconUrl = techIconUrl;

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });
  protected readonly searchTerm = signal('');

  protected readonly projects = signal<Project[]>(PROJECTS);
  protected readonly technologyCategories = signal<ProjectTechnologyCategory[]>(TECHNOLOGY_CATEGORIES);
  protected readonly selectedTechnologies = signal<string[]>([]);

  protected readonly activeFilterCategoryLabel = signal<string | null>(TECHNOLOGY_CATEGORIES[0]?.label ?? null);

  protected readonly displayedProjects = signal<Project[]>(PROJECTS);
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
      // Lógica de disparo
      const triggerAnimation = () => {
        this.projectsService.animateEntrance(this.elementRef, this.headerRef, this.toolbarRef, this.resultsRef);
        void this.loadGithubStats();
      };

      // 1. Salto Directo: Si ya estamos en la sección (ej. click en header), animamos YA.
      const rect = this.elementRef.nativeElement.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        triggerAnimation();
        return;
      }

      // 2. Observador para cuando se llega por scroll
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect();
            triggerAnimation();
          }
        },
        { threshold: 0.1 },
      );

      observer.observe(this.elementRef.nativeElement);

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
    return FALLBACK_ICONS[technology] ?? 'Code';
  }

  protected isRepositoryLoading(repo: string): boolean {
    return this.projectsService.isLoading().has(repo);
  }

  protected formatVisibility(visibility: string | null | undefined): string {
    return visibility === 'private' ? 'Privado' : 'Público';
  }

  protected formatLicense(license: string | null | undefined): string {
    if (!license || license === 'NOASSERTION') {
      return 'Sin licencia';
    }

    return license.toUpperCase() === 'MIT' ? 'MIT' : license;
  }

  private syncDisplayedProjects(): void {
    const nextProjects = this.filteredProjects();
    const currentDisplayedProjects = this.displayedProjects();

    this.activeCarouselProjectTitle.set(nextProjects[0]?.title ?? '');

    // 1. Manejo de estado vacío
    if (!nextProjects.length) {
      this.updateStateForEmptyResults(currentDisplayedProjects);
      return;
    }

    // 2. Manejo de actualización de resultados
    this.updateStateForResults(nextProjects, currentDisplayedProjects);
  }

  private updateStateForEmptyResults(currentProjects: Project[]): void {
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

  private updateStateForResults(nextProjects: Project[], currentProjects: Project[]): void {
    const wasEmpty = this.showEmptyState() || !this.showProjectsCarousel() || !currentProjects.length;

    this.clearEmptyStateTimer();
    this.showEmptyState.set(false);
    this.showProjectsCarousel.set(true);

    const nextTitles = new Set(nextProjects.map((p) => p.title));
    const currentTitles = new Set(currentProjects.map((p) => p.title));

    const leaving = currentProjects.filter((p) => !nextTitles.has(p.title));
    const entering = nextProjects.filter((p) => !currentTitles.has(p.title));

    // Cancelar salidas si el proyecto vuelve a entrar
    nextProjects.forEach((p) => {
      const timeout = this.leavingProjectTimeouts.get(p.title);
      if (timeout) {
        clearTimeout(timeout);
        this.leavingProjectTimeouts.delete(p.title);
      }
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

  private markProjectsState(projects: Project[], state: 'entering' | 'leaving', callback?: () => void): void {
    if (!projects.length) return;

    const signal = state === 'entering' ? this.enteringProjectTitles : this.leavingProjectTitles;
    const timeouts = state === 'entering' ? this.enteringProjectTimeouts : this.leavingProjectTimeouts;
    const duration = (state === 'entering' ? this.projectsService.ENTER_DURATION : this.projectsService.EXIT_DURATION) * 1000;

    projects.forEach((project) => {
      const existing = timeouts.get(project.title);
      if (existing) clearTimeout(existing);

      signal.update((current) => new Set(current).add(project.title));

      const timeout = setTimeout(() => {
        if (state === 'leaving') {
          this.displayedProjects.update((list) => list.filter((p) => p.title !== project.title));
        }

        signal.update((current) => {
          const updated = new Set(current);
          updated.delete(project.title);
          return updated;
        });

        timeouts.delete(project.title);
        if (callback) callback();
      }, duration);

      timeouts.set(project.title, timeout);
    });
  }

  private clearEnteringProjectAnimations(): void {
    this.enteringProjectTimeouts.forEach((t) => clearTimeout(t));
    this.enteringProjectTimeouts.clear();
    this.enteringProjectTitles.set(new Set());
  }

  private clearEmptyStateTimer(): void {
    if (this.emptyStateTimer) {
      clearTimeout(this.emptyStateTimer);
      this.emptyStateTimer = null;
    }
  }

  private replaceProjectReferences(projects: Project[]): Project[] {
    const projectByTitle = new Map(this.projects().map((project) => [project.title, project]));

    return projects.map((project) => projectByTitle.get(project.title) ?? project);
  }

  private sortProjectsByOriginalOrder(projects: Project[], originalProjects: Project[]): Project[] {
    const uniqueProjects = new Map(projects.map((project) => [project.title, project]));
    const order = new Map(originalProjects.map((project, index) => [project.title, index]));

    return Array.from(uniqueProjects.values()).sort((a, b) => {
      return (order.get(a.title) ?? 0) - (order.get(b.title) ?? 0);
    });
  }

  private projectMatchesSearch(project: Project, term: string): boolean {
    return this.normalizeText(project.title).includes(term) || this.normalizeText(project.description).includes(term) || project.tags.some((tag) => this.normalizeText(tag).includes(term));
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
