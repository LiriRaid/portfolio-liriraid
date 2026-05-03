import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Popover } from 'primeng/popover';

import { Project, ProjectTechnologyCategory } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
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
  },
  {
    title: 'AgentFlow AI',
    description: 'Orquestador multiagente para desarrollo con IA. Coordina agentes como Claude, Codex, OpenCode y Gemini, delega tareas, monitorea progreso en una TUI y mantiene el proyecto principal limpio mediante un workspace separado.',
    tags: ['Node.js', 'JavaScript', 'CLI', 'TUI', 'AI Agents', 'Automation', 'NPM', 'Clean Architecture'],
    repo: 'LiriRaid/agentflow-ai',
    githubUrl: 'https://github.com/LiriRaid/agentflow-ai',
    liveUrl: null,
  },
  {
    title: 'Portfolio Liriraid',
    description: 'Portfolio personal profesional creado con Angular 21, SSR, prerender, hidratación normal, sistema de temas dinámico, componentes reutilizables y estructura escalable basada en features.',
    tags: ['Angular 21', 'TypeScript', 'CSS3', 'RxJS', 'Signals', 'SSR', 'Prerender', 'PrimeNG', 'Tailwind CSS', 'CSS', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
    repo: 'LiriRaid/portfolio-liriraid',
    githubUrl: 'https://github.com/LiriRaid/portfolio-liriraid',
    liveUrl: null,
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
  imports: [Popover, PortfolioButton, PortfolioIcon, PortfolioSearch],
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

  private readonly selectedTechnologySet = computed(() => new Set(this.selectedTechnologies()));

  protected readonly hasSelectedTechnologies = computed(() => this.selectedTechnologies().length > 0);
  protected readonly hasSearchTerm = computed(() => this.searchTerm().length > 0);

  protected readonly filteredProjects = computed(() => {
    const selected = this.selectedTechnologySet();
    const term = this.normalizeText(this.searchTerm());

    return this.projects().filter((project) => {
      const matchesTechnology = !selected.size || project.tags.some((technology) => selected.has(technology));
      const matchesSearch = !term || this.projectMatchesSearch(project, term);

      return matchesTechnology && matchesSearch;
    });
  });

  constructor() {
    const searchSubscription = this.searchControl.valueChanges.subscribe((value) => {
      this.searchTerm.set(value.trim());
    });

    this.destroyRef.onDestroy(() => {
      searchSubscription.unsubscribe();
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

  protected onSearch(term: string): void {
    this.searchTerm.set(term.trim());
  }

  protected toggleTechnology(technology: string): void {
    this.selectedTechnologies.update((current) => (current.includes(technology) ? current.filter((item) => item !== technology) : [...current, technology]));
  }

  protected removeTechnology(technology: string): void {
    this.selectedTechnologies.update((current) => current.filter((item) => item !== technology));
  }

  protected clearFilters(): void {
    this.selectedTechnologies.set([]);
  }

  protected isTechnologySelected(technology: string): boolean {
    return this.selectedTechnologySet().has(technology);
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
  }
}
