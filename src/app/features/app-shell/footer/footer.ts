import { Component, inject } from '@angular/core';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { PortfolioSectionNavigationService } from '@features/portfolio/portfolio-section-navigation.service';

@Component({
  selector: 'portfolio-footer',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private readonly sectionNavigation = inject(PortfolioSectionNavigationService);
  protected readonly year = new Date().getFullYear();

  protected goToContact(event: MouseEvent): void {
    event.preventDefault();
    this.sectionNavigation.requestNavigation('contacto');
  }
}
