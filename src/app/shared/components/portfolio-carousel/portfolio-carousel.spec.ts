import { TestBed } from '@angular/core/testing';
import { PortfolioCarousel } from './portfolio-carousel';

describe('PortfolioCarousel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioCarousel],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PortfolioCarousel);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default to screenshot mode', () => {
    const fixture = TestBed.createComponent(PortfolioCarousel);
    const component = fixture.componentInstance;

    expect(component.mode()).toBe('screenshot');
  });

  it('should default to empty images', () => {
    const fixture = TestBed.createComponent(PortfolioCarousel);
    const component = fixture.componentInstance;

    expect(component.images()).toEqual([]);
  });

  it('should default autoPlay to true', () => {
    const fixture = TestBed.createComponent(PortfolioCarousel);
    const component = fixture.componentInstance;

    expect(component.autoPlay()).toBe(true);
  });

  it('should default autoPlayDuration to 4000', () => {
    const fixture = TestBed.createComponent(PortfolioCarousel);
    const component = fixture.componentInstance;

    expect(component.autoPlayDuration()).toBe(4000);
  });

  it('should start at index 0', () => {
    const fixture = TestBed.createComponent(PortfolioCarousel);
    fixture.detectChanges();

    expect((fixture.componentInstance as any).currentIndex()).toBe(0);
  });
});
