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

  protected readonly pickerButtonClass = computed(() => (this.isPanelOpen() ? 'picker-trigger picker-trigger--active' : 'picker-trigger'));

  private triggerElement: HTMLElement | null = null;
  private panelVisible = false;
  private animationFrameId: number | null = null;

  private readonly viewportMargin = 12;
  private readonly panelGap = 8;
  private readonly arrowMinOffset = 14;

  private readonly repositionPanel = (): void => {
    this.schedulePanelPosition();
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cancelScheduledPosition();
      this.removePositionListeners();
    });
  }

  protected toggle(panel: Popover, event: MouseEvent): void {
    this.triggerElement = this.resolveTriggerElement(event);
    panel.toggle(event);
  }

  protected onPanelShow(): void {
    this.isPanelOpen.set(true);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.panelVisible = true;
    this.addPositionListeners();
    this.schedulePanelPosition();
  }

  protected onPanelHide(): void {
    this.isPanelOpen.set(false);
    this.panelVisible = false;
    this.triggerElement = null;

    this.cancelScheduledPosition();
    this.removePositionListeners();
    this.resetPanelPosition();
  }

  protected selectPrimary(key: string, panel: Popover): void {
    this.themeService.applyColor(key);
    panel.hide();
  }

  protected selectSurface(key: string): void {
    this.themeService.applySurface(key);
  }

  private resolveTriggerElement(event: MouseEvent): HTMLElement | null {
    const element = event.currentTarget as HTMLElement | null;

    if (!element) {
      return null;
    }

    return element.classList.contains('p-button') ? element : (element.querySelector<HTMLElement>('.p-button') ?? element);
  }

  private schedulePanelPosition(): void {
    if (!isPlatformBrowser(this.platformId) || !this.panelVisible) {
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
    const visualOffsetX = this.getVisualOffsetX();

    let left = triggerCenterX - panelWidth / 2 + visualOffsetX;

    left = this.clamp(left, this.viewportMargin, viewportWidth - panelWidth - this.viewportMargin);

    const belowTop = triggerRect.bottom + this.panelGap;
    const aboveTop = triggerRect.top - panelHeight - this.panelGap;

    let top = belowTop;

    if (belowTop + panelHeight > viewportHeight - this.viewportMargin && aboveTop >= this.viewportMargin) {
      top = aboveTop;
      panel.dataset['placement'] = 'top';
    } else {
      top = this.clamp(belowTop, this.viewportMargin, viewportHeight - panelHeight - this.viewportMargin);
      panel.dataset['placement'] = 'bottom';
    }

    /*
      NO CAMBIAR:
      Este +8 es el ajuste que ya te mantenía el triángulo centrado visualmente.
      El contenedor se mueve con getVisualOffsetX(), pero la flecha sigue apuntando al botón.
    */
    const arrowX = this.clamp(triggerCenterX - left + 8, this.arrowMinOffset, panelWidth - this.arrowMinOffset);

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

  private getVisualOffsetX(): number {
    const width = this.document.documentElement.clientWidth;

    /*
      >= 1557px: desktop, contenedor más hacia la derecha.
      <= 1556px: responsive, contenedor más hacia la izquierda.
      El triángulo NO se toca.
    */
    return width >= 1557 ? 45 : -35;
  }

  private resetPanelPosition(): void {
    const panel = this.getPanelElement();

    if (!panel) {
      return;
    }

    panel.style.removeProperty('position');
    panel.style.removeProperty('top');
    panel.style.removeProperty('left');
    panel.style.removeProperty('right');
    panel.style.removeProperty('bottom');
    panel.style.removeProperty('transform');
    panel.style.removeProperty('margin-top');
    panel.style.removeProperty('--color-picker-arrow-x');

    delete panel.dataset['positioned'];
    delete panel.dataset['placement'];
  }

  private addPositionListeners(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.addEventListener('scroll', this.repositionPanel, true);
    window.addEventListener('resize', this.repositionPanel);
    window.visualViewport?.addEventListener('resize', this.repositionPanel);
    window.visualViewport?.addEventListener('scroll', this.repositionPanel);
  }

  private removePositionListeners(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.removeEventListener('scroll', this.repositionPanel, true);
    window.removeEventListener('resize', this.repositionPanel);
    window.visualViewport?.removeEventListener('resize', this.repositionPanel);
    window.visualViewport?.removeEventListener('scroll', this.repositionPanel);
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

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
