import {
  Component,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Hero } from '../sections/hero/hero';
import { Projects } from '../sections/projects/projects';
import { Skills } from '../sections/skills/skills';
import { About } from '../sections/about/about';
import { Contact } from '../sections/contact/contact';
import {
  DEFAULT_PORTFOLIO_SECTION,
  PORTFOLIO_SECTIONS,
  getPortfolioSectionById,
  getPortfolioSectionByPath,
  isPortfolioSectionPath,
  type PortfolioSectionId,
  type PortfolioSectionPath,
} from '../portfolio-sections';
import { PortfolioSectionNavigationService } from '../portfolio-section-navigation.service';

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [Hero, Projects, Skills, About, Contact],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class Portfolio {
  readonly section = input<PortfolioSectionPath | undefined>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly sectionNavigation = inject(PortfolioSectionNavigationService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private listenersAttached = false;
  private lastNavigationRequestId = 0;
  private initialRouteHandled = false;
  private scrollFrameId: number | null = null;
  private suppressNextRouteScrollFor: PortfolioSectionId | null = null;

  constructor() {
    if (!this.isBrowser) return;

    effect(() => {
      const currentPath = this.section();

      if (currentPath && !isPortfolioSectionPath(currentPath)) {
        void this.router.navigateByUrl('/inicio', { replaceUrl: true });
        return;
      }

      const routeSection =
        getPortfolioSectionByPath(currentPath)?.id ?? DEFAULT_PORTFOLIO_SECTION;

      if (!this.listenersAttached) return;
      if (this.suppressNextRouteScrollFor === routeSection) {
        this.suppressNextRouteScrollFor = null;
        return;
      }

      const activeSection = this.sectionNavigation.activeSectionId();
      if (activeSection === routeSection) return;

      this.scrollToSection(routeSection, this.initialRouteHandled ? 'smooth' : 'auto');
      this.initialRouteHandled = true;
    });

    effect(() => {
      const request = this.sectionNavigation.navigationRequest();
      if (!request || !this.listenersAttached) return;
      if (request.id === this.lastNavigationRequestId) return;

      this.lastNavigationRequestId = request.id;
      this.scrollToSection(request.sectionId, 'smooth');
    });

    afterNextRender(() => {
      this.attachViewportListeners();
      this.updateActiveSectionFromViewport();

      const routeSection =
        getPortfolioSectionByPath(this.section())?.id ?? DEFAULT_PORTFOLIO_SECTION;
      this.scrollToSection(routeSection, 'auto');
      this.initialRouteHandled = true;
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    window.removeEventListener('scroll', this.scheduleViewportSync);
    window.removeEventListener('resize', this.scheduleViewportSync);

    if (this.scrollFrameId !== null) {
      cancelAnimationFrame(this.scrollFrameId);
      this.scrollFrameId = null;
    }
  }

  private attachViewportListeners(): void {
    if (this.listenersAttached) return;

    window.addEventListener('scroll', this.scheduleViewportSync, { passive: true });
    window.addEventListener('resize', this.scheduleViewportSync, { passive: true });
    this.listenersAttached = true;
  }

  private readonly scheduleViewportSync = (): void => {
    if (this.scrollFrameId !== null) return;

    this.scrollFrameId = window.requestAnimationFrame(() => {
      this.scrollFrameId = null;
      this.updateActiveSectionFromViewport();
    });
  };

  private scrollToSection(
    sectionId: PortfolioSectionId,
    behavior: ScrollBehavior,
  ): void {
    const section = document.getElementById(sectionId);
    if (!section) return;

    this.sectionNavigation.setActiveSection(sectionId);
    this.suppressNextRouteScrollFor = sectionId;
    section.scrollIntoView({ behavior, block: 'start' });

    if (behavior === 'auto') {
      this.syncUrlWithSection(sectionId, true);
    }

    this.scheduleViewportSync();
  }

  private updateActiveSectionFromViewport(): void {
    const headerHeight = 64;
    let nextSectionId = DEFAULT_PORTFOLIO_SECTION;
    const activationLine = headerHeight + 24;

    for (const section of PORTFOLIO_SECTIONS) {
      const element = document.getElementById(section.id);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      if (rect.top <= activationLine) {
        nextSectionId = section.id;
      }
    }

    if (this.sectionNavigation.activeSectionId() === nextSectionId) return;

    this.sectionNavigation.setActiveSection(nextSectionId);
    this.syncUrlWithSection(nextSectionId, true);
  }

  private syncUrlWithSection(
    sectionId: PortfolioSectionId,
    replaceUrl: boolean,
  ): void {
    const nextUrl = `/${getPortfolioSectionById(sectionId).path}`;
    if (this.router.url === nextUrl) return;

    void this.router.navigateByUrl(nextUrl, { replaceUrl });
  }
}
