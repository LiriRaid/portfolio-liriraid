import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, PLATFORM_ID, afterNextRender, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { PortfolioIcon } from '..';

@Component({
  selector: 'portfolio-search',
  standalone: true,
  imports: [ReactiveFormsModule, PortfolioIcon],
  templateUrl: './portfolio-search.html',
  styleUrl: './portfolio-search.css',
  host: {
    '(window:resize)': 'onResize()',
    '[class.desktop-mode]': '!isMobileLayout()',
    '[class.mobile-mode]': 'isMobileLayout()',
  },
})
export class PortfolioSearch implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly mobileBreakpoint = 640;
  private readonly collapsedModeTransitionMs = 400;

  readonly collapsedMode = input<boolean>(false);
  readonly control = input.required<FormControl<string | null>>();
  readonly placeholder = input<string>('Buscar...');
  readonly inputClass = input<string>('');
  readonly mobileMode = input<boolean>(false);

  readonly collapsedSearchClick = output<void>();
  readonly searchEnter = output<string>();
  readonly mobileSearchToggle = output<void>();

  private readonly mobile = signal(false);

  readonly isMobile = this.mobile.asReadonly();
  readonly showMobileInput = signal(false);
  readonly renderCollapsedMode = signal(false);

  readonly isMobileLayout = computed(() => this.mobileMode() && this.mobile());

  private collapseTimer: ReturnType<typeof setTimeout> | null = null;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    let initialized = false;
    let previousCollapsed = false;

    effect(() => {
      const collapsed = this.collapsedMode();

      if (!initialized) {
        this.renderCollapsedMode.set(collapsed);
        previousCollapsed = collapsed;
        initialized = true;
        return;
      }

      if (collapsed === previousCollapsed) {
        return;
      }

      this.clearCollapseTimer();

      if (collapsed) {
        this.collapseTimer = setTimeout(() => {
          this.renderCollapsedMode.set(true);
          this.collapseTimer = null;
        }, this.collapsedModeTransitionMs);
      } else {
        this.renderCollapsedMode.set(false);
      }

      previousCollapsed = collapsed;
    });

    if (this.isBrowser) {
      afterNextRender(() => {
        this.checkMobile();
      });
    }
  }

  ngOnDestroy(): void {
    this.clearCollapseTimer();
  }

  onResize(): void {
    this.checkMobile();
  }

  onKeyup(event: KeyboardEvent): void {
    const term = this.control().value?.trim() || '';

    if (event.key === 'Enter' || term === '') {
      this.searchEnter.emit(term);
    }
  }

  toggleMobile(): void {
    if (this.collapsedMode() || this.renderCollapsedMode()) {
      this.collapsedSearchClick.emit();
      return;
    }

    this.showMobileInput.update((value) => !value);
    this.mobileSearchToggle.emit();
  }

  private checkMobile(): void {
    if (!this.isBrowser) {
      return;
    }

    const wasMobile = this.mobile();
    const nowMobile = window.innerWidth <= this.mobileBreakpoint;

    this.mobile.set(nowMobile);

    if (wasMobile && !nowMobile) {
      this.showMobileInput.set(false);
    }
  }

  private clearCollapseTimer(): void {
    if (!this.collapseTimer) {
      return;
    }

    clearTimeout(this.collapseTimer);
    this.collapseTimer = null;
  }
}
