import { Component, ElementRef, OnDestroy, Renderer2, computed, effect, input, output, signal } from '@angular/core';
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
  },
})
export class PortfolioSearch implements OnDestroy {
  private readonly collapseTransitionMs = 400;

  // ✅ Inputs como signals
  readonly collapsedMode = input<boolean>(false);
  readonly control = input.required<FormControl<string | null>>();
  readonly placeholder = input<string>('Buscar...');
  readonly inputClass = input<string>('');
  readonly mobileMode = input<boolean>(false);

  // ✅ Outputs como signals (Angular 17+)
  readonly collapsedSearchClick = output<void>();
  readonly searchEnter = output<string>();
  readonly mobileSearchToggle = output<void>();

  // ✅ Estado interno como signals
  private readonly _isMobile = signal(false);
  readonly isMobile = computed(() => this._isMobile());

  readonly showMobileInput = signal(false);
  readonly renderCollapsedMode = signal(false);

  private collapseTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
    this.checkMobile();
    this.updateHostClasses();

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

      if (collapsed === previousCollapsed) return;

      this.clearCollapseTimer();

      if (collapsed) {
        this.collapseTimer = setTimeout(() => {
          this.renderCollapsedMode.set(true);
          this.collapseTimer = null;
        }, this.collapseTransitionMs);
      } else {
        this.renderCollapsedMode.set(false);
      }

      previousCollapsed = collapsed;
    });
  }

  ngOnDestroy(): void {
    this.clearCollapseTimer();
  }

  onResize(): void {
    this.checkMobile();
  }

  private checkMobile(): void {
    const wasMobile = this._isMobile();
    const nowMobile = window.innerWidth < 640;

    this._isMobile.set(nowMobile);

    // Si cambia de móvil a desktop, cerrar sin animación
    if (wasMobile && !nowMobile) {
      this.showMobileInput.set(false);
    }

    this.updateHostClasses();
  }

  private updateHostClasses(): void {
    this.renderer.removeClass(this.elementRef.nativeElement, 'desktop-mode');
    this.renderer.removeClass(this.elementRef.nativeElement, 'mobile-mode');

    if (this.mobileMode() && this.isMobile()) {
      this.renderer.addClass(this.elementRef.nativeElement, 'mobile-mode');
    } else {
      this.renderer.addClass(this.elementRef.nativeElement, 'desktop-mode');
    }
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

    this.showMobileInput.update((v) => !v);
    this.mobileSearchToggle.emit();
  }

  private clearCollapseTimer(): void {
    if (this.collapseTimer) {
      clearTimeout(this.collapseTimer);
      this.collapseTimer = null;
    }
  }
}
