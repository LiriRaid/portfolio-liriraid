import { ChangeDetectionStrategy, ViewEncapsulation, Component, computed, inject } from '@angular/core';

import { I18nService } from '@core/i18n';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';

@Component({
  selector: 'portfolio-footer',
  standalone: true,
  imports: [PortfolioButton],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class Footer {
  private readonly i18nService = inject(I18nService);

  protected readonly year = new Date().getFullYear();

  protected readonly tagline = computed(() => this.t('footer.tagline'));
  protected readonly githubLabel = computed(() => this.t('footer.links.github'));
  protected readonly githubAria = computed(() => this.t('footer.links.github.aria'));
  protected readonly contactLabel = computed(() => this.t('footer.links.contact'));
  protected readonly contactAria = computed(() => this.t('footer.links.contact.aria'));
  protected readonly copyright = computed(() => this.t('footer.copyright').replace('{year}', String(this.year)));

  private t(key: string): string {
    return this.i18nService.t(key);
  }
}
