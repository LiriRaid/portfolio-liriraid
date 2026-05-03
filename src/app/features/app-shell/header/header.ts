import { Component, DestroyRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PortfolioThemeColorPicker } from '@shared/components/portfolio-theme-color-picker/portfolio-theme-color-picker';
import { ThemeService } from '@core/theme/theme.service';
import { PortfolioButton, PortfolioIcon } from '@shared/components';

@Component({
  selector: 'portfolio-header',
  standalone: true,
  imports: [PortfolioButton, PortfolioIcon, PortfolioThemeColorPicker],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly themeService = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly mobileMenuOpen = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        const desktopMq = window.matchMedia('(min-width: 769px)');
        const onChange = (e: MediaQueryListEvent) => {
          if (e.matches) this.closeMobileMenu();
        };
        desktopMq.addEventListener('change', onChange);
        this.destroyRef.onDestroy(() => desktopMq.removeEventListener('change', onChange));
      });
    }
  }

  protected readonly navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Experiencia', href: '#experiencia' },
    { label: 'Proyectos', href: '#proyectos' },
    { label: 'Habilidades', href: '#habilidades' },
    { label: 'Sobre mí', href: '#sobre-mi' },
    { label: 'Contacto', href: '#contacto' },
  ] as const;

  protected onNavLinkClick(event: MouseEvent, href: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (href === '#inicio') {
      event.preventDefault();
      if (window.scrollY === 0) return;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
