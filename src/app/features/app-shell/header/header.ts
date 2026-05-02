import { Component, inject, signal } from '@angular/core';
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
  protected readonly mobileMenuOpen = signal(false);

  protected readonly navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Proyectos', href: '#proyectos' },
    { label: 'Habilidades', href: '#habilidades' },
    { label: 'Sobre mí', href: '#sobre-mi' },
    { label: 'Contacto', href: '#contacto' },
  ] as const;

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
