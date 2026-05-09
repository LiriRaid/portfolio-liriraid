import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioButton } from './portfolio-button';

describe('PortfolioButton', () => {
  let fixture: ComponentFixture<PortfolioButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioButton],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioButton);
  });

  it('keeps width classes on the host and text classes on the label', () => {
    fixture.componentRef.setInput('styleClass', 'w-full text-caption-1-bold rounded-lg');
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.hostClass()).toBe('block w-full');
    expect(component.buttonClass()).toContain('rounded-lg');
    expect(component.buttonClass()).not.toContain('text-caption-1-bold');
    expect(component.computedLabelClass()).toContain('text-caption-1-bold');
  });

  it('emits the click event through the custom output', () => {
    const component = fixture.componentInstance;
    const clickEvent = new MouseEvent('click');
    const emitSpy = vi.spyOn(component.onClick, 'emit');

    component.handleClick(clickEvent);

    expect(emitSpy).toHaveBeenCalledWith(clickEvent);
  });
});
