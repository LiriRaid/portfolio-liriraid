import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { I18nService } from '@core/i18n';
import { ThemeService } from '@core/theme/theme.service';
import { PortfolioButton } from '@shared/components';
import { PortfolioLanguageToggle } from '@shared/components/portfolio-language-toggle/portfolio-language-toggle';
import { PortfolioThemeColorPicker } from '@shared/components/portfolio-theme-color-picker/portfolio-theme-color-picker';
import { PORTFOLIO_SECTION_IDS, PortfolioSectionId, getPortfolioScrollRoot, scrollToPortfolioSection } from '@shared/utils/portfolio-scroll';
import { HeaderService } from './header.service';
import { PortfolioBackgroundAnimationService } from '@features/portfolio/ui/portfolio-background-animation/portfolio-background-animation.service';

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
  private readonly titleService = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly baseTitle = 'Portfolio - Gabriel Cruz';

  protected readonly mobileMenuOpen = signal(false);
  protected readonly isMobileMenuRendered = signal(false);
  protected readonly activeSection = signal<PortfolioSectionId>('home');
  protected readonly isFloating = signal(false);
  protected readonly backgroundAnimationEnabled = this.backgroundAnimationService.enabled;

  protected readonly navLinks = computed(() => [
    { label: this.t('header.nav.home'), href: '#home', sectionId: 'home' as const },
    { label: this.t('header.nav.about'), href: '#about', sectionId: 'about' as const },
    { label: this.t('header.nav.experience'), href: '#experience', sectionId: 'experience' as const },
    { label: this.t('header.nav.projects'), href: '#projects', sectionId: 'projects' as const },
    { label: this.t('header.nav.skills'), href: '#skills', sectionId: 'skills' as const },
    { label: this.t('header.nav.contact'), href: '#contact', sectionId: 'contact' as const },
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

  private readonly sectionIds = PORTFOLIO_SECTION_IDS;

  constructor() {
    effect(() => {
      const sectionKey = `header.nav.${this.activeSection()}`;
      const sectionLabel = this.i18nService.t(sectionKey);
      const nextTitle = sectionLabel && sectionLabel !== sectionKey ? `${this.baseTitle} | ${sectionLabel}` : this.baseTitle;

      this.titleService.setTitle(nextTitle);
    });

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    effect(() => {
      document.documentElement.classList.toggle('header-is-floating', this.isFloating());
    });

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

    if (sectionId !== 'home') {
      this.isFloating.set(true);
    }

    scrollToPortfolioSection(sectionId, 'smooth');

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
    const scrollRoot = getPortfolioScrollRoot();

    if (!scrollRoot) {
      return;
    }

    const initialHash = this.syncInitialHash();

    if (initialHash !== 'home' && scrollRoot.scrollTop > 1) {
      this.syncActiveSection();
    }

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
      hostWidth: window.innerWidth,
      headerHeight: this.getHeaderHeight(),
      isMobile: window.innerWidth <= 768,
      onFloatingChange: (floating) => {
        if (this.targetSection && this.targetSection !== 'home' && !floating) {
          return;
        }

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

  private syncInitialHash(): PortfolioSectionId | null {
    const hash = window.location.hash.replace('#', '') as PortfolioSectionId;

    if (!this.sectionIds.includes(hash)) {
      return null;
    }

    this.activeSection.set(hash);

    requestAnimationFrame(() => {
      scrollToPortfolioSection(hash, 'auto');
    });

    return hash;
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

  private getHeaderHeight(): number {
    if (window.innerWidth > 640) {
      return 64;
    }

    return Math.min(64, Math.max(48, 27.424 + window.innerWidth * 0.05714));
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

    if (currentSection && currentSection !== this.activeSection()) {
      this.activeSection.set(currentSection);
      this.updateUrlHash(currentSection);
    }
  }

  private updateUrlHash(sectionId: PortfolioSectionId): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentHash = window.location.hash.replace('#', '');

    if (currentHash === sectionId) {
      return;
    }

    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${sectionId}`);
  }

  private syncTargetSection(): void {
    const scrollRoot = getPortfolioScrollRoot();
    const target = document.getElementById(this.targetSection!);

    if (!scrollRoot || !target) {
      this.unlockProgrammaticScroll();
      return;
    }

    const scrollRootRect = scrollRoot.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const targetVisualTop = targetRect.top - scrollRootRect.top;
    const expectedTop = this.targetSection === 'home' ? this.getHeaderHeight() : 0;
    const reachedTarget = Math.abs(targetVisualTop - expectedTop) <= 2 || targetVisualTop <= expectedTop;

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
    const scrollRoot = getPortfolioScrollRoot();

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
