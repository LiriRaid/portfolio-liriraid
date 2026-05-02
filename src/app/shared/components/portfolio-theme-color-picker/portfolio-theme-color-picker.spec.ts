import { TestBed } from '@angular/core/testing';
import { PortfolioThemeColorPicker } from './portfolio-theme-color-picker';

describe('PortfolioThemeColorPicker', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioThemeColorPicker],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PortfolioThemeColorPicker);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
