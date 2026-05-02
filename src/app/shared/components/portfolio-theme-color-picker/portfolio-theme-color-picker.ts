import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Popover } from 'primeng/popover';
import { PRIMARY_COLORS, SURFACE_COLORS } from '@core/theme/theme-palettes';
import { ThemeService } from '@core/theme/theme.service';
import { PortfolioIcon } from '../portfolio-icon/portfolio-icon';

@Component({
  selector: 'portfolio-theme-color-picker',
  standalone: true,
  imports: [Popover, PortfolioIcon],
  templateUrl: './portfolio-theme-color-picker.html',
  styleUrl: './portfolio-theme-color-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioThemeColorPicker {
  private readonly themeService = inject(ThemeService);

  protected readonly primaryColors = PRIMARY_COLORS;
  protected readonly surfaceColors = SURFACE_COLORS;
  protected readonly currentPrimaryKey = this.themeService.primaryColorKey;
  protected readonly currentSurfaceKey = this.themeService.surfaceColorKey;

  protected toggle(panel: Popover, event: Event): void {
    panel.toggle(event);
  }

  protected selectPrimary(key: string, panel: Popover): void {
    this.themeService.applyColor(key);
    panel.hide();
  }

  protected selectSurface(key: string): void {
    this.themeService.applySurface(key);
  }
}
