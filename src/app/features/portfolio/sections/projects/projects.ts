import { Component, DestroyRef, OnInit, PLATFORM_ID, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Popover } from 'primeng/popover';

import { Project, ProjectTechnologyCategory } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { techIconUrl } from '@shared/utils/tech-icons';

import { GithubRepositoryService } from './project.service';

@Component({
  selector: 'portfolio-projects',
  standalone: true,
  imports: [Popover, PortfolioButton, PortfolioIcon],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private readonly githubRepositoryService = inject(GithubRepositoryService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('filterPanel') filterPanel!: Popover;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        const onResize = () => this.filterPanel?.hide();

        window.addEventListener('resize', onResize);
        this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
      });
    }
  }

  protected readonly techIconUrl = techIconUrl;
  protected readonly selectedTechnologies = signal<string[]>([]);

  private readonly fallbackIcons: Record<string, string> = {
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

  protected readonly projects = signal<Project[]>([
    {
      title: 'OmniInbox',
      description: 'Plataforma conversacional tipo inbox omnicanal construida con Angular 21. Centraliza módulos de login, inbox, perfil y shell autenticado con arquitectura feature-first, componentes standalone, lazy loading, tema claro/oscuro, animaciones y testing moderno.',
      tags: ['Angular 21', 'TypeScript', 'RxJS', 'Signals', 'Tailwind CSS', 'PrimeNG', 'GSAP', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
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
      tags: ['Angular 21', 'TypeScript', 'Signals', 'SSR', 'Prerender', 'PrimeNG', 'Tailwind CSS', 'CSS', 'Vitest', 'Lazy Loading', 'Screaming Architecture', 'Feature-first'],
      repo: 'LiriRaid/portfolio-liriraid',
      githubUrl: 'https://github.com/LiriRaid/portfolio-liriraid',
      liveUrl: null,
    },
  ]);

  protected readonly technologyCategories = signal<ProjectTechnologyCategory[]>([
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
  ]);

  protected readonly filteredProjects = computed(() => {
    const selected = this.selectedTechnologies();

    if (!selected.length) {
      return this.projects();
    }

    return this.projects().filter((project) => selected.some((technology) => project.tags.includes(technology)));
  });

  protected readonly hasSelectedTechnologies = computed(() => this.selectedTechnologies().length > 0);

  async ngOnInit(): Promise<void> {
    await this.loadGithubStats();
  }

  protected toggleTechnology(technology: string): void {
    this.selectedTechnologies.update((current) => (current.includes(technology) ? current.filter((item) => item !== technology) : [...current, technology]));
  }

  protected removeTechnology(technology: string): void {
    this.selectedTechnologies.update((current) => current.filter((item) => item !== technology));
  }

  protected isTechnologySelected(technology: string): boolean {
    return this.selectedTechnologies().includes(technology);
  }

  protected clearFilters(): void {
    this.selectedTechnologies.set([]);
  }

  protected techFallbackIcon(technology: string): string {
    return this.fallbackIcons[technology] ?? 'Code';
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

  private async loadGithubStats(): Promise<void> {
    const currentProjects = this.projects();

    const entries = await Promise.all(
      currentProjects.map(async (project) => {
        const stats = await this.githubRepositoryService.getRepositoryStats(project.repo);

        return {
          repo: project.repo,
          stats: stats ?? undefined,
        };
      }),
    );

    const statsByRepo = new Map<string, Project['githubStats']>(entries.map(({ repo, stats }) => [repo, stats]));

    this.projects.update((projects) =>
      projects.map((project) => ({
        ...project,
        githubStats: statsByRepo.get(project.repo) ?? project.githubStats,
      })),
    );
  }
}
