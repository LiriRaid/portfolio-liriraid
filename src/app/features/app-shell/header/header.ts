import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';

import { ThemeService } from '@core/theme/theme.service';
import { PortfolioButton } from '@shared/components';
import { PortfolioThemeColorPicker } from '@shared/components/portfolio-theme-color-picker/portfolio-theme-color-picker';

type PortfolioSectionId = 'inicio' | 'experiencia' | 'proyectos' | 'habilidades' | 'sobre-mi' | 'contacto';

@Component({
  selector: 'portfolio-header',
  standalone: true,
  imports: [PortfolioButton, PortfolioThemeColorPicker],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly themeService = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly activeSection = signal<PortfolioSectionId>('inicio');

  private scrollAnimationFrameId: number | null = null;
  private scrollUnlockTimer: ReturnType<typeof setTimeout> | null = null;
  private targetSection: PortfolioSectionId | null = null;

  private readonly sectionIds: PortfolioSectionId[] = ['inicio', 'experiencia', 'proyectos', 'habilidades', 'sobre-mi', 'contacto'];

  protected readonly navLinks = [
    { label: 'Inicio', href: '#inicio', sectionId: 'inicio' },
    { label: 'Experiencia', href: '#experiencia', sectionId: 'experiencia' },
    { label: 'Proyectos', href: '#proyectos', sectionId: 'proyectos' },
    { label: 'Habilidades', href: '#habilidades', sectionId: 'habilidades' },
    { label: 'Sobre mí', href: '#sobre-mi', sectionId: 'sobre-mi' },
    { label: 'Contacto', href: '#contacto', sectionId: 'contacto' },
  ] as const;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.initializeHeaderRuntime();
    });
  }

  protected navLinkClass(sectionId: PortfolioSectionId): string {
    return this.getLinkClass('nav-link', 'nav-link--active', sectionId);
  }

  protected mobileNavLinkClass(sectionId: PortfolioSectionId): string {
    return this.getLinkClass('mobile-nav-link', 'mobile-nav-link--active', sectionId);
  }

  protected onNavLinkClick(event: MouseEvent, href: string, sectionId: PortfolioSectionId): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    event.preventDefault();

    this.activeSection.set(sectionId);
    this.targetSection = sectionId;
    this.clearScrollUnlockTimer();

    this.scrollToSection(sectionId, 'smooth');

    history.replaceState(null, '', `${window.location.pathname}${window.location.search}${href}`);

    this.scrollUnlockTimer = setTimeout(() => {
      this.unlockProgrammaticScroll();
      this.syncActiveSection();
    }, 1200);
  }

  protected toggleThemeMode(): void {
    this.themeService.toggleMode();
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  private initializeHeaderRuntime(): void {
    const scrollRoot = this.getScrollRoot();

    if (!scrollRoot) {
      return;
    }

    this.syncInitialHash();
    this.syncActiveSection();

    const desktopMq = window.matchMedia('(min-width: 769px)');

    const onDesktopChange = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        this.closeMobileMenu();
      }
    };

    const onScrollOrResize = (): void => {
      this.scheduleActiveSectionSync();
    };

    const onManualScroll = (): void => {
      this.unlockProgrammaticScroll();
    };

    desktopMq.addEventListener('change', onDesktopChange);
    scrollRoot.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    scrollRoot.addEventListener('wheel', onManualScroll, { passive: true });
    scrollRoot.addEventListener('touchstart', onManualScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      desktopMq.removeEventListener('change', onDesktopChange);
      scrollRoot.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      scrollRoot.removeEventListener('wheel', onManualScroll);
      scrollRoot.removeEventListener('touchstart', onManualScroll);

      this.cancelActiveSectionFrame();
      this.clearScrollUnlockTimer();
    });
  }

  private syncInitialHash(): void {
    const hash = window.location.hash.replace('#', '') as PortfolioSectionId;

    if (!this.sectionIds.includes(hash)) {
      return;
    }

    this.activeSection.set(hash);

    requestAnimationFrame(() => {
      this.scrollToSection(hash, 'auto');
    });
  }

  private getLinkClass(baseClass: string, activeClass: string, sectionId: PortfolioSectionId): string {
    return this.activeSection() === sectionId ? `${baseClass} ${activeClass}` : baseClass;
  }

  private getScrollRoot(): HTMLElement | null {
    return document.querySelector<HTMLElement>('.layout-scroll-root');
  }

  private getHeaderHeight(): number {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--app-header-height').trim();
    const parsed = Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      return 64;
    }

    return value.endsWith('rem') ? parsed * this.getRootFontSize() : parsed;
  }

  private getRootFontSize(): number {
    return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  }

  private scrollToSection(sectionId: PortfolioSectionId, behavior: ScrollBehavior): void {
    const scrollRoot = this.getScrollRoot();
    const section = document.getElementById(sectionId);

    if (!scrollRoot || !section) {
      return;
    }

    const scrollRootRect = scrollRoot.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const headerHeight = this.getHeaderHeight();

    const top = sectionRect.top - scrollRootRect.top + scrollRoot.scrollTop - headerHeight;

    scrollRoot.scrollTo({
      top: Math.max(0, Math.round(top)),
      behavior,
    });
  }

  private scheduleActiveSectionSync(): void {
    this.cancelActiveSectionFrame();

    this.scrollAnimationFrameId = requestAnimationFrame(() => {
      this.syncActiveSection();
      this.scrollAnimationFrameId = null;
    });
  }

  private syncActiveSection(): void {
    if (this.targetSection) {
      this.syncTargetSection();
      return;
    }

    const currentSection = this.getCurrentSectionId();

    if (currentSection) {
      this.activeSection.set(currentSection);
    }
  }

  private syncTargetSection(): void {
    const scrollRoot = this.getScrollRoot();
    const target = document.getElementById(this.targetSection!);

    if (!scrollRoot || !target) {
      this.unlockProgrammaticScroll();
      return;
    }

    const scrollRootRect = scrollRoot.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const headerHeight = this.getHeaderHeight();

    const targetVisualTop = targetRect.top - scrollRootRect.top;
    const reachedTarget = Math.abs(targetVisualTop - headerHeight) <= 2 || targetVisualTop <= headerHeight;

    if (!reachedTarget) {
      return;
    }

    this.activeSection.set(this.targetSection!);
    this.unlockProgrammaticScroll();
  }

  private unlockProgrammaticScroll(): void {
    this.targetSection = null;
    this.clearScrollUnlockTimer();
  }

  private getCurrentSectionId(): PortfolioSectionId | null {
    const scrollRoot = this.getScrollRoot();

    if (!scrollRoot) {
      return null;
    }

    const rootRect = scrollRoot.getBoundingClientRect();
    const headerHeight = this.getHeaderHeight();
    const scanLine = rootRect.top + headerHeight + 1;
    const viewportMiddle = rootRect.top + headerHeight + (rootRect.height - headerHeight) * 0.42;

    let currentSection: PortfolioSectionId | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const sectionId of this.sectionIds) {
      const section = document.getElementById(sectionId);

      if (!section) {
        continue;
      }

      const rect = section.getBoundingClientRect();

      if (rect.top <= scanLine && rect.bottom > scanLine) {
        currentSection = sectionId;
        break;
      }

      const distance = Math.abs(rect.top - viewportMiddle);

      if (distance < closestDistance) {
        closestDistance = distance;
        currentSection = sectionId;
      }
    }

    return currentSection;
  }

  private cancelActiveSectionFrame(): void {
    if (this.scrollAnimationFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.scrollAnimationFrameId);
    this.scrollAnimationFrameId = null;
  }

  private clearScrollUnlockTimer(): void {
    if (this.scrollUnlockTimer === null) {
      return;
    }

    clearTimeout(this.scrollUnlockTimer);
    this.scrollUnlockTimer = null;
  }
}
