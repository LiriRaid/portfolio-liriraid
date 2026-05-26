import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService, type PortfolioLanguage } from '@core/i18n';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'portfolio-language-toggle',
  standalone: true,
  imports: [FormsModule, ToggleSwitchModule],
  templateUrl: './portfolio-language-toggle.html',
  styleUrl: './portfolio-language-toggle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioLanguageToggle implements DoCheck {
  private readonly i18nService = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly language = this.i18nService.language;
  protected readonly ariaLabel = computed(() => this.i18nService.t('header.language.toggle'));

  protected readonly checked = computed(() => this.language() === 'es');
  protected readonly localChecked = signal(this.i18nService.language() === 'es');

  private initialSyncDone = false;
  private previousLanguage: PortfolioLanguage | null = null;
  private requestedLanguage: PortfolioLanguage | null = null;

  constructor() {
    afterNextRender(() => {
      const currentLanguage = this.language();

      this.previousLanguage = currentLanguage;
      this.localChecked.set(currentLanguage === 'es');
      this.syncPrimeNgToggleState({ instant: true });

      this.initialSyncDone = true;
      this.cdr.markForCheck();
    });
  }

  ngDoCheck(): void {
    if (!this.isBrowser || !this.initialSyncDone) {
      return;
    }

    const currentLanguage = this.language();

    if (this.requestedLanguage !== null) {
      if (currentLanguage !== this.requestedLanguage) {
        return;
      }

      this.requestedLanguage = null;
    }

    if (currentLanguage === this.previousLanguage) {
      return;
    }

    this.previousLanguage = currentLanguage;
    this.localChecked.set(currentLanguage === 'es');

    queueMicrotask(() => {
      this.syncPrimeNgToggleState({ instant: false });
      this.cdr.markForCheck();
    });
  }

  protected onLanguageChange(checked: boolean): void {
    const nextLanguage: PortfolioLanguage = checked ? 'es' : 'en';

    if (nextLanguage === this.requestedLanguage) {
      return;
    }

    this.localChecked.set(checked);
    this.requestedLanguage = nextLanguage;

    this.syncPrimeNgToggleState({ instant: false });
    this.i18nService.setLanguage(nextLanguage);

    this.cdr.markForCheck();
  }

  private syncPrimeNgToggleState(options: { instant: boolean }): void {
    if (!this.isBrowser) {
      return;
    }

    const root = this.elementRef.nativeElement;
    const toggle = root.querySelector<HTMLElement>('.p-toggleswitch');
    const input = root.querySelector<HTMLInputElement>('.p-toggleswitch-input');

    if (!toggle && !input) {
      return;
    }

    const shouldBeChecked = this.localChecked();

    if (toggle && options.instant) {
      toggle.classList.add('is-initial-sync');
    }

    if (toggle) {
      toggle.classList.toggle('p-toggleswitch-checked', shouldBeChecked);
    }

    if (input) {
      if (input.checked !== shouldBeChecked) {
        input.checked = shouldBeChecked;
      }

      input.setAttribute('aria-checked', String(shouldBeChecked));
    }

    if (toggle && options.instant) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          toggle.classList.remove('is-initial-sync');
        });
      });
    }
  }
}
