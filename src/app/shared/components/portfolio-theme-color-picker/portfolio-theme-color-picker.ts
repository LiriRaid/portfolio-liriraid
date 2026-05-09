import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Popover } from 'primeng/popover';

import { PRIMARY_COLORS, SURFACE_COLORS } from '@core/theme/theme-palettes';
import { ThemeService } from '@core/theme/theme.service';
import { PortfolioButton } from '..';

@Component({
  selector: 'portfolio-theme-color-picker',
  standalone: true,
  imports: [Popover, PortfolioButton],
  templateUrl: './portfolio-theme-color-picker.html',
  styleUrl: './portfolio-theme-color-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioThemeColorPicker {
  private readonly themeService = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly primaryColors = PRIMARY_COLORS;
  protected readonly surfaceColors = SURFACE_COLORS;

  protected readonly currentPrimaryKey = this.themeService.primaryColorKey;
  protected readonly currentSurfaceKey = this.themeService.surfaceColorKey;

  protected readonly isPanelOpen = signal(false);

  protected readonly pickerButtonClass = computed(() => {
    return this.joinClasses(
      'picker-trigger',
      this.isPanelOpen() ? 'picker-trigger--active' : '',
    );
  });

  private triggerElement: HTMLElement | null = null;
  private panelVisible = false;
  private animationFrameId: number | null = null;

  private readonly viewportMargin = 12;
  private readonly panelGap = 8;
  private readonly arrowMinOffset = 14;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readonly repositionPanel = (): void => {
    this.schedulePanelPosition();
  };

  private readonly onOutsidePointerDown = (event: PointerEvent): void => {
    if (!this.panelVisible || this.isEventInsidePicker(event)) {
      return;
    }

    this.markPanelAsClosing();
  };

  private readonly onEscapeKeyDown = (event: KeyboardEvent): void => {
    if (this.panelVisible && event.key === 'Escape') {
      this.markPanelAsClosing();
    }
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cleanupPanelRuntime();
    });
  }

  protected toggle(panel: Popover, event: MouseEvent): void {
    this.triggerElement = this.resolveTriggerElement(event);

    if (this.panelVisible) {
      this.markPanelAsClosing();
    }

    panel.toggle(event);
  }

  protected onPanelShow(): void {
    this.isPanelOpen.set(true);

    if (!this.isBrowser) {
      return;
    }

    this.panelVisible = true;
    this.addRuntimeListeners();
    this.schedulePanelPosition();
  }

  protected onPanelHide(): void {
    this.isPanelOpen.set(false);
    this.panelVisible = false;
    this.triggerElement = null;

    this.cleanupPanelRuntime();
    this.resetPanelPosition();
  }

  protected selectPrimary(key: string, panel: Popover): void {
    this.themeService.applyColor(key);
    this.markPanelAsClosing();
    panel.hide();
  }

  protected selectSurface(key: string): void {
    this.themeService.applySurface(key);
  }

  private markPanelAsClosing(): void {
    this.isPanelOpen.set(false);
    this.panelVisible = false;
    this.cleanupPanelRuntime();
  }

  private schedulePanelPosition(): void {
    if (!this.isBrowser || !this.panelVisible) {
      return;
    }

    this.cancelScheduledPosition();

    this.animationFrameId = requestAnimationFrame(() => {
      this.positionPanel();
    });
  }

  private positionPanel(): void {
    const panel = this.getPanelElement();
    const trigger = this.triggerElement;

    if (!panel || !trigger) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;

    const viewportWidth = this.document.documentElement.clientWidth;
    const viewportHeight = this.document.documentElement.clientHeight;

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;

    const left = this.getPanelLeft({
      triggerCenterX,
      panelWidth,
      viewportWidth,
    });

    const top = this.getPanelTop({
      panel,
      triggerRect,
      panelHeight,
      viewportHeight,
    });

    const arrowX = this.clamp(
      triggerCenterX - left + 8,
      this.arrowMinOffset,
      panelWidth - this.arrowMinOffset,
    );

    this.applyPanelPosition(panel, left, top, arrowX);
  }

  private getPanelLeft(params: {
    triggerCenterX: number;
    panelWidth: number;
    viewportWidth: number;
  }): number {
    const left = params.triggerCenterX - params.panelWidth / 2 + this.getVisualOffsetX();

    return this.clamp(
      left,
      this.viewportMargin,
      params.viewportWidth - params.panelWidth - this.viewportMargin,
    );
  }

  private getPanelTop(params: {
    panel: HTMLElement;
    triggerRect: DOMRect;
    panelHeight: number;
    viewportHeight: number;
  }): number {
    const belowTop = params.triggerRect.bottom + this.panelGap;
    const aboveTop = params.triggerRect.top - params.panelHeight - this.panelGap;

    if (belowTop + params.panelHeight > params.viewportHeight - this.viewportMargin && aboveTop >= this.viewportMargin) {
      params.panel.dataset['placement'] = 'top';
      return aboveTop;
    }

    params.panel.dataset['placement'] = 'bottom';

    return this.clamp(
      belowTop,
      this.viewportMargin,
      params.viewportHeight - params.panelHeight - this.viewportMargin,
    );
  }

  private applyPanelPosition(panel: HTMLElement, left: number, top: number, arrowX: number): void {
    panel.style.setProperty('position', 'fixed', 'important');
    panel.style.setProperty('top', `${top}px`, 'important');
    panel.style.setProperty('left', `${left}px`, 'important');
    panel.style.setProperty('right', 'auto', 'important');
    panel.style.setProperty('bottom', 'auto', 'important');
    panel.style.setProperty('transform', 'none', 'important');
    panel.style.setProperty('margin-top', '0', 'important');
    panel.style.setProperty('--color-picker-arrow-x', `${arrowX}px`);

    panel.dataset['positioned'] = 'true';
  }

  private resetPanelPosition(): void {
    const panel = this.getPanelElement();

    if (!panel) {
      return;
    }

    for (const property of [
      'position',
      'top',
      'left',
      'right',
      'bottom',
      'transform',
      'margin-top',
      '--color-picker-arrow-x',
    ]) {
      panel.style.removeProperty(property);
    }

    delete panel.dataset['positioned'];
    delete panel.dataset['placement'];
  }

  private isEventInsidePicker(event: Event): boolean {
    const target = event.target as Node | null;

    if (!target) {
      return false;
    }

    const panel = this.getPanelElement();
    const trigger = this.triggerElement;

    return Boolean(panel?.contains(target) || trigger?.contains(target));
  }

  private resolveTriggerElement(event: MouseEvent): HTMLElement | null {
    const element = event.currentTarget as HTMLElement | null;

    if (!element) {
      return null;
    }

    return element.classList.contains('p-button')
      ? element
      : (element.querySelector<HTMLElement>('.p-button') ?? element);
  }

  private addRuntimeListeners(): void {
    if (!this.isBrowser) {
      return;
    }

    window.addEventListener('scroll', this.repositionPanel, true);
    window.addEventListener('resize', this.repositionPanel);
    window.visualViewport?.addEventListener('resize', this.repositionPanel);
    window.visualViewport?.addEventListener('scroll', this.repositionPanel);

    this.document.addEventListener('pointerdown', this.onOutsidePointerDown, true);
    this.document.addEventListener('keydown', this.onEscapeKeyDown, true);
  }

  private removeRuntimeListeners(): void {
    if (!this.isBrowser) {
      return;
    }

    window.removeEventListener('scroll', this.repositionPanel, true);
    window.removeEventListener('resize', this.repositionPanel);
    window.visualViewport?.removeEventListener('resize', this.repositionPanel);
    window.visualViewport?.removeEventListener('scroll', this.repositionPanel);

    this.document.removeEventListener('pointerdown', this.onOutsidePointerDown, true);
    this.document.removeEventListener('keydown', this.onEscapeKeyDown, true);
  }

  private cleanupPanelRuntime(): void {
    this.cancelScheduledPosition();
    this.removeRuntimeListeners();
  }

  private cancelScheduledPosition(): void {
    if (this.animationFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  private getPanelElement(): HTMLElement | null {
    return this.document.querySelector<HTMLElement>('.p-popover.color-picker-panel');
  }

  private getVisualOffsetX(): number {
    const width = this.document.documentElement.clientWidth;

    return width >= 1557 ? 45 : -35;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private joinClasses(...classes: string[]): string {
    return classes
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' ');
  }
}
