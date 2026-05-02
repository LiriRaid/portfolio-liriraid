import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioThemeColorPicker } from '@shared/components/portfolio-theme-color-picker/portfolio-theme-color-picker';
import { ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'portfolio-header',
  standalone: true,
  imports: [PortfolioIcon, PortfolioThemeColorPicker],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly themeService = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly mobileMenuOpen = signal(false);

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
