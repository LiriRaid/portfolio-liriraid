import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from '@core/i18n';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'portfolio-language-toggle',
  standalone: true,
  imports: [FormsModule, ToggleSwitchModule],
  templateUrl: './portfolio-language-toggle.html',
  styleUrl: './portfolio-language-toggle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioLanguageToggle {
  private readonly i18nService = inject(I18nService);

  protected readonly language = this.i18nService.language;
  protected readonly ariaLabel = computed(() => this.i18nService.t('header.language.toggle'));

  protected readonly checked = computed(() => this.language() === 'es');

  protected onLanguageChange(checked: boolean): void {
    this.i18nService.setLanguage(checked ? 'es' : 'en');
  }
}
