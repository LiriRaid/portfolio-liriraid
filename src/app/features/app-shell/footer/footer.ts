import { Component } from '@angular/core';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';

@Component({
  selector: 'portfolio-footer',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
