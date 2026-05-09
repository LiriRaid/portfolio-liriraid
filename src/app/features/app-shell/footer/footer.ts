import { Component } from '@angular/core';

import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';

@Component({
  selector: 'portfolio-footer',
  standalone: true,
  imports: [PortfolioButton],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
