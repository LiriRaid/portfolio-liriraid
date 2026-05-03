import { FormControl } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioSearch } from './portfolio-search';

describe('PortfolioSearch', () => {
  let fixture: ComponentFixture<PortfolioSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioSearch);
    fixture.componentRef.setInput('control', new FormControl<string | null>(''));
    fixture.detectChanges();
  });

  it('emits the collapsed search event when used in collapsed mode', () => {
    fixture.componentRef.setInput('collapsedMode', true);
    fixture.detectChanges();

    const emitSpy = vi.spyOn(fixture.componentInstance.collapsedSearchClick, 'emit');

    fixture.componentInstance.toggleMobile();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('emits the search term when Enter is pressed', () => {
    const emitSpy = vi.spyOn(fixture.componentInstance.searchEnter, 'emit');
    fixture.componentInstance.control().setValue('  inbox  ');

    fixture.componentInstance.onKeyup(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(emitSpy).toHaveBeenCalledWith('inbox');
  });

  it('opens the mobile input and emits the toggle event in mobile mode', () => {
    fixture.componentRef.setInput('mobileMode', true);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.mobileSearchToggle, 'emit');

    component.toggleMobile();

    expect(component.showMobileInput()).toBe(true);
    expect(emitSpy).toHaveBeenCalled();
  });
});
