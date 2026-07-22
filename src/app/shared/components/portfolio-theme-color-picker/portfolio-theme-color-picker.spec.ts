import { TestBed } from '@angular/core/testing';

import { ThemeService } from '@core/theme/theme.service';
import { PRIMARY_COLORS, SURFACE_COLORS } from '@core/theme/theme-palettes';
import { PortfolioThemeColorPicker } from './portfolio-theme-color-picker';

describe('PortfolioThemeColorPicker', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioThemeColorPicker],
    }).compileComponents();
  });

  it('creates the theme color picker', () => {
    const fixture = TestBed.createComponent(PortfolioThemeColorPicker);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes every primary and surface palette to the template', () => {
    const fixture = TestBed.createComponent(PortfolioThemeColorPicker);
    const component = fixture.componentInstance as any;

    expect(component.primaryColors).toBe(PRIMARY_COLORS);
    expect(component.surfaceColors).toBe(SURFACE_COLORS);
  });

  it('mirrors the current theme keys from ThemeService', () => {
    const themeService = TestBed.inject(ThemeService);
    const fixture = TestBed.createComponent(PortfolioThemeColorPicker);
    const component = fixture.componentInstance as any;

    expect(component.currentPrimaryKey).toBe(themeService.primaryColorKey);
    expect(component.currentSurfaceKey).toBe(themeService.surfaceColorKey);
  });

  it('delegates primary selection to ThemeService.applyColor and closes the popover', () => {
    const themeService = TestBed.inject(ThemeService);
    const applyColorSpy = vi.spyOn(themeService, 'applyColor').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(PortfolioThemeColorPicker);
    const fakePanel = { hide: vi.fn(), toggle: vi.fn() } as any;

    (fixture.componentInstance as any).selectPrimary('indigo', fakePanel);

    expect(applyColorSpy).toHaveBeenCalledWith('indigo');
    expect(fakePanel.hide).toHaveBeenCalledOnce();
  });

  it('delegates surface selection to ThemeService.applySurface without closing the popover', () => {
    const themeService = TestBed.inject(ThemeService);
    const applySurfaceSpy = vi.spyOn(themeService, 'applySurface').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(PortfolioThemeColorPicker);
    (fixture.componentInstance as any).selectSurface('zinc');

    expect(applySurfaceSpy).toHaveBeenCalledWith('zinc');
  });

  it('toggles the open signal via show/hide handlers', () => {
    const fixture = TestBed.createComponent(PortfolioThemeColorPicker);
    const component = fixture.componentInstance as any;

    expect(component.isPanelOpen()).toBe(false);

    component.onPanelShow();
    expect(component.isPanelOpen()).toBe(true);
    expect(component.pickerButtonClass()).toContain('picker-trigger--active');

    component.onPanelHide();
    expect(component.isPanelOpen()).toBe(false);
    expect(component.pickerButtonClass()).not.toContain('picker-trigger--active');
  });
});
