import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Popover } from 'primeng/popover';

import { Project, ProjectTechnologyCategory } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { CarouselItem } from '@shared/components/portfolio-carousel/carousel-item.directive';
import { PortfolioCarousel } from '@shared/components/portfolio-carousel/portfolio-carousel';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioSearch } from '@shared/components/portfolio-search/portfolio-search';
import { techIconUrl } from '@shared/utils/tech-icons';

import { GithubRepositoryService } from './project.service';

const PROJECTS: Project[] = [
  {
    title: 'OmniInbox',
    description: 'Plataforma conversacional tipo inbox omnicanal construida con Angular 21. Centraliza módulos de login, inbox, perfil y shell autenticado con arquitectura feature-first, componentes standalone, lazy loading, tema claro/oscuro, animaciones y testing moderno.',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'Tailwind CSS', 'PrimeNG', 'GSAP', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: 'LiriRaid/omni-inbox',
    githubUrl: 'https://github.com/LiriRaid/omni-inbox',
    liveUrl: null,
    featured: true,
    screenshots: ['https://placehold.co/800x450/1e293b/06b6d4?text=OmniInbox+—+Perfil', 'https://placehold.co/800x450/0f172a/7c3aed?text=OmniInbox+—+Login', 'https://placehold.co/800x450/1e293b/94a3b8?text=OmniInbox+—+Inbox'],
  },
  {
    title: 'AgentFlow AI',
    description: 'Orquestador multiagente para desarrollo con IA. Coordina agentes como Claude, Codex, OpenCode y Gemini, delega tareas, monitorea progreso en una TUI y mantiene el proyecto principal limpio mediante un workspace separado.',
    tags: ['Node.js', 'JavaScript', 'NPM', 'CLI', 'TUI', 'AI Agents', 'Automation', 'Clean Architecture'],
    repo: 'LiriRaid/agentflow-ai',
    githubUrl: 'https://github.com/LiriRaid/agentflow-ai',
    liveUrl: null,
    screenshots: ['https://placehold.co/800x450/0a0a0a/22c55e?text=AgentFlow+—+TUI', 'https://placehold.co/800x450/111827/f59e0b?text=AgentFlow+—+Orquestador'],
  },
  {
    title: 'Portfolio Liriraid',
    description: 'Portfolio personal profesional creado con Angular 21, SSR, prerender, hidratación normal, sistema de temas dinámico, componentes reutilizables y estructura escalable basada en features.',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'SSR', 'Prerender', 'PrimeNG', 'Tailwind CSS', 'CSS', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: 'LiriRaid/portfolio-liriraid',
    githubUrl: 'https://github.com/LiriRaid/portfolio-liriraid',
    liveUrl: null,
    screenshots: ['https://placehold.co/800x450/18181b/a78bfa?text=Portfolio+—+Hero', 'https://placehold.co/800x450/18181b/f472b6?text=Portfolio+—+Projects'],
  },
];

const TECHNOLOGY_CATEGORIES: ProjectTechnologyCategory[] = [
  {
    label: 'Frontend',
    icon: 'Globe',
    technologies: ['Angular 21', 'AngularJS', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'PrimeNG', 'RxJS', 'Signals'],
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
    technologies: ['Clean Architecture', 'Screaming Architecture', 'Feature-first', 'SSR', 'Prerender', 'Lazy Loading', 'DRY / SOLID', 'DDD'],
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
  imports: [Popover, PortfolioButton, PortfolioCarousel, CarouselItem, PortfolioIcon, PortfolioSearch],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  private readonly githubRepositoryService = inject(GithubRepositoryService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

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

  protected readonly displayedProjectsKey = computed(() => this.displayedProjects().map((project) => project.title).join('|'));

  protected readonly displayedProjectsStateKey = computed(() => {
    return this.displayedProjects()
      .map((project) => `${project.title}:${this.isProjectLeaving(project.title) ? 'leaving' : 'active'}`)
      .join('|');
  });

  private readonly projectExitDuration = 680;
  private readonly leavingProjectTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    const searchSubscription = this.searchControl.valueChanges.subscribe((value) => {
      this.searchTerm.set(value.trim());
      this.syncDisplayedProjects();
    });

    this.destroyRef.onDestroy(() => {
      searchSubscription.unsubscribe();

      this.leavingProjectTimeouts.forEach((timeout) => clearTimeout(timeout));
      this.leavingProjectTimeouts.clear();
    });

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const onResize = (): void => {
        this.filterPanel?.hide();
      };

      window.addEventListener('resize', onResize);

      void this.loadGithubStats();

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

  protected techFallbackIcon(technology: string): string {
    return FALLBACK_ICONS[technology] ?? 'Code';
  }

  protected isRepositoryLoading(repo: string): boolean {
    return this.githubRepositoryService.isLoading().has(repo);
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

    const nextTitles = new Set(nextProjects.map((project) => project.title));
    const currentTitles = new Set(currentDisplayedProjects.map((project) => project.title));

    const leavingProjects = currentDisplayedProjects.filter((project) => !nextTitles.has(project.title));
    const enteringProjects = nextProjects.filter((project) => !currentTitles.has(project.title));

    nextProjects.forEach((project) => {
      const timeout = this.leavingProjectTimeouts.get(project.title);

      if (!timeout) return;

      clearTimeout(timeout);
      this.leavingProjectTimeouts.delete(project.title);
    });

    this.leavingProjectTitles.update((current) => {
      const updated = new Set(current);

      nextProjects.forEach((project) => {
        updated.delete(project.title);
      });

      leavingProjects.forEach((project) => {
        updated.add(project.title);
      });

      return updated;
    });

    const hasLeavingProjects = leavingProjects.length > 0;

    if (!hasLeavingProjects) {
      this.displayedProjects.set(this.replaceProjectReferences(this.sortProjectsByOriginalOrder(nextProjects, this.projects())));
      return;
    }

    const mergedProjects = this.sortProjectsByOriginalOrder([...currentDisplayedProjects, ...enteringProjects], this.projects());
    this.displayedProjects.set(this.replaceProjectReferences(mergedProjects));

    leavingProjects.forEach((project) => {
      if (this.leavingProjectTimeouts.has(project.title)) return;

      const timeout = setTimeout(() => {
        this.displayedProjects.update((projects) => projects.filter((item) => item.title !== project.title));

        this.leavingProjectTitles.update((current) => {
          const updated = new Set(current);
          updated.delete(project.title);
          return updated;
        });

        this.leavingProjectTimeouts.delete(project.title);
      }, this.projectExitDuration);

      this.leavingProjectTimeouts.set(project.title, timeout);
    });
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
        stats: await this.githubRepositoryService.getRepositoryStats(project.repo),
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
