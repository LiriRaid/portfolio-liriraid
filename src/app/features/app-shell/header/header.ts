import { Component, inject, signal } from '@angular/core';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioThemeColorPicker } from '@shared/components/portfolio-theme-color-picker/portfolio-theme-color-picker';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { ThemeService } from '@core/theme/theme.service';
import { PortfolioSectionNavigationService } from '@features/portfolio/portfolio-section-navigation.service';
import {
  PORTFOLIO_SECTIONS,
  type PortfolioSectionId,
} from '@features/portfolio/portfolio-sections';

@Component({
  selector: 'portfolio-header',
  standalone: true,
  imports: [PortfolioIcon, PortfolioThemeColorPicker, PortfolioButton],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly themeService = inject(ThemeService);
  protected readonly sectionNavigation = inject(PortfolioSectionNavigationService);
  protected readonly mobileMenuOpen = signal(false);

  protected readonly navLinks = PORTFOLIO_SECTIONS;

  protected navigateToSection(event: MouseEvent, sectionId: PortfolioSectionId): void {
    event.preventDefault();
    this.sectionNavigation.requestNavigation(sectionId);
    this.closeMobileMenu();
  }

  protected isActive(sectionId: PortfolioSectionId): boolean {
    return this.sectionNavigation.activeSectionId() === sectionId;
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
