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

  it('renders a colored SVG when the icon name maps to a portfolio SVG with colored flag', () => {
    fixture = TestBed.createComponent(PortfolioIcon);
    fixture.componentRef.setInput('name', 'Angular');
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.svgUrl()).toContain('assets/svg/angular-logo.svg');
  });

  it('falls back to text span when icon name is not in any registry', () => {
    fixture = TestBed.createComponent(PortfolioIcon);
    fixture.componentRef.setInput('name', 'UnknownIconXYZ');
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');

    expect(span).not.toBeNull();
    expect(span.textContent.trim()).toBe('UnknownIconXYZ');
  });
});
