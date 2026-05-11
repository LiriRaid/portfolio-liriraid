import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';

import { I18nService } from '@core/i18n';
import { ThemeService } from '@core/theme/theme.service';
import { PortfolioButton } from '@shared/components';
import { PortfolioLanguageToggle } from '@shared/components/portfolio-language-toggle/portfolio-language-toggle';
import { PortfolioThemeColorPicker } from '@shared/components/portfolio-theme-color-picker/portfolio-theme-color-picker';
import { HeaderService } from './header.service';
import { PortfolioBackgroundAnimationService } from '@features/portfolio/ui/portfolio-background-animation/portfolio-background-animation.service';

type PortfolioSectionId = 'inicio' | 'experiencia' | 'proyectos' | 'habilidades' | 'sobre-mi' | 'contacto';

@Component({
  selector: 'portfolio-header',
  standalone: true,
  imports: [PortfolioButton, PortfolioThemeColorPicker, PortfolioLanguageToggle],
  providers: [HeaderService],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly themeService = inject(ThemeService);
  private readonly headerService = inject(HeaderService);
  private readonly backgroundAnimationService = inject(PortfolioBackgroundAnimationService);
  private readonly i18nService = inject(I18nService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly isMobileMenuRendered = signal(false);
  protected readonly activeSection = signal<PortfolioSectionId>('inicio');
  protected readonly isFloating = signal(false);
  protected readonly backgroundAnimationEnabled = this.backgroundAnimationService.enabled;

  protected readonly navLinks = computed(() => [
    { label: this.t('header.nav.home'), href: '#inicio', sectionId: 'inicio' as const },
    { label: this.t('header.nav.experience'), href: '#experiencia', sectionId: 'experiencia' as const },
    { label: this.t('header.nav.projects'), href: '#proyectos', sectionId: 'proyectos' as const },
    { label: this.t('header.nav.skills'), href: '#habilidades', sectionId: 'habilidades' as const },
    { label: this.t('header.nav.about'), href: '#sobre-mi', sectionId: 'sobre-mi' as const },
    { label: this.t('header.nav.contact'), href: '#contacto', sectionId: 'contacto' as const },
  ]);

  protected readonly backgroundAnimationAriaLabel = computed(() => {
    return this.backgroundAnimationEnabled() ? this.t('header.background.disable') : this.t('header.background.enable');
  });

  protected readonly lightThemeAriaLabel = computed(() => this.t('header.theme.light'));
  protected readonly darkThemeAriaLabel = computed(() => this.t('header.theme.dark'));
  protected readonly openMenuAriaLabel = computed(() => this.t('header.menu.open'));
  protected readonly closeMenuAriaLabel = computed(() => this.t('header.menu.close'));

  private scrollAnimationFrameId: number | null = null;
  private scrollUnlockTimer: ReturnType<typeof setTimeout> | null = null;
  private targetSection: PortfolioSectionId | null = null;

  private readonly sectionIds: PortfolioSectionId[] = ['inicio', 'experiencia', 'proyectos', 'habilidades', 'sobre-mi', 'contacto'];

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      setTimeout(() => {
        this.initializeHeaderRuntime();
      }, 50);
    });
  }

  protected navLinkClass(sectionId: PortfolioSectionId): string {
    return this.getLinkClass('nav-link', 'nav-link--active', sectionId);
  }

  protected mobileNavLinkClass(sectionId: PortfolioSectionId): string {
    return this.getLinkClass('mobile-nav-link', 'mobile-nav-link--active', sectionId);
  }

  protected backgroundAnimationButtonClass(): string {
    return this.backgroundAnimationEnabled() ? 'icon-btn background-animation-btn background-animation-btn--active' : 'icon-btn background-animation-btn';
  }

  protected toggleBackgroundAnimation(): void {
    this.backgroundAnimationService.toggle();
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
    const willOpen = !this.mobileMenuOpen();

    if (willOpen) {
      this.openMobileMenu();
      return;
    }

    this.closeMobileMenu();
  }

  protected closeMobileMenu(): void {
    if (!this.mobileMenuOpen()) return;

    this.mobileMenuOpen.set(false);

    const nav = this.getMobileNavElement();

    if (!nav) {
      this.isMobileMenuRendered.set(false);
      return;
    }

    this.headerService.closeMobileMenu(nav, () => {
      this.isMobileMenuRendered.set(false);
    });
  }

  private t(key: string): string {
    return this.i18nService.t(key);
  }

  private openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
    this.isMobileMenuRendered.set(true);

    setTimeout(() => {
      const nav = this.getMobileNavElement();

      if (!nav) return;

      this.headerService.openMobileMenu(nav);
    });
  }

  private initializeHeaderRuntime(): void {
    const scrollRoot = this.getScrollRoot();

    if (!scrollRoot) {
      return;
    }

    this.syncInitialHash();
    this.syncActiveSection();
    this.scheduleHeaderMorph(scrollRoot.scrollTop);

    const desktopMq = window.matchMedia('(min-width: 769px)');

    const onDesktopChange = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        this.closeMobileMenu();
      }

      this.scheduleHeaderMorph(scrollRoot.scrollTop);
    };

    const onScrollOrResize = (): void => {
      this.scheduleActiveSectionSync();
      this.scheduleHeaderMorph(scrollRoot.scrollTop);
    };

    const onManualScroll = (): void => {
      this.unlockProgrammaticScroll();
    };

    const onDocumentPointerDown = (event: PointerEvent): void => {
      this.closeMobileMenuFromOutside(event);
    };

    const onDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        this.closeMobileMenu();
      }
    };

    desktopMq.addEventListener('change', onDesktopChange);
    scrollRoot.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    scrollRoot.addEventListener('wheel', onManualScroll, { passive: true });
    scrollRoot.addEventListener('touchstart', onManualScroll, { passive: true });
    document.addEventListener('pointerdown', onDocumentPointerDown, { capture: true });
    document.addEventListener('keydown', onDocumentKeyDown);

    this.destroyRef.onDestroy(() => {
      desktopMq.removeEventListener('change', onDesktopChange);
      scrollRoot.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      scrollRoot.removeEventListener('wheel', onManualScroll);
      scrollRoot.removeEventListener('touchstart', onManualScroll);
      document.removeEventListener('pointerdown', onDocumentPointerDown, { capture: true });
      document.removeEventListener('keydown', onDocumentKeyDown);

      this.cancelActiveSectionFrame();
      this.clearScrollUnlockTimer();
      this.headerService.destroy();
    });
  }

  private scheduleHeaderMorph(scrollTop: number): void {
    const header = this.getHeaderElement();

    if (!header) {
      return;
    }

    this.headerService.scheduleHeaderMorph({
      header,
      scrollTop,
      hostWidth: this.elementRef.nativeElement.clientWidth,
      headerHeight: this.getHeaderHeight(),
      isMobile: window.innerWidth <= 768,
      onFloatingChange: (floating) => {
        if (this.isFloating() !== floating) {
          this.isFloating.set(floating);
        }
      },
    });
  }

  private closeMobileMenuFromOutside(event: PointerEvent): void {
    if (!this.mobileMenuOpen()) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    const host = this.elementRef.nativeElement;

    if (host.contains(target)) {
      return;
    }

    this.closeMobileMenu();
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

  private getHeaderElement(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>('.header');
  }

  private getMobileNavElement(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>('.mobile-nav');
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
