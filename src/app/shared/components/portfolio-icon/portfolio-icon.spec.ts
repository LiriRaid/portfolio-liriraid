import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioIcon } from './portfolio-icon';

describe('PortfolioIcon', () => {
  let fixture: ComponentFixture<PortfolioIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioIcon],
    }).compileComponents();
  });

  it('renders a Lucide svg when the icon name maps to the registry', () => {
    fixture = TestBed.createComponent(PortfolioIcon);
    fixture.componentRef.setInput('name', 'Home');
    fixture.detectChanges();

    const iconElement = fixture.nativeElement.querySelector('svg');

    expect(iconElement).not.toBeNull();
    expect(iconElement.getAttribute('width')).toBe('20');
  });

  it('renders a single SVG image reference when the icon name maps to a colored local asset', () => {
    fixture = TestBed.createComponent(PortfolioIcon);
    fixture.componentRef.setInput('name', 'Port');
    fixture.detectChanges();

    const imageElement = fixture.nativeElement.querySelector('image');
    const htmlImageElement = fixture.nativeElement.querySelector('img');

    expect(imageElement).not.toBeNull();
    expect(imageElement.getAttribute('href')).toContain('assets/svg/portfolio-me.svg');
    expect(htmlImageElement).toBeNull();
  });
});
