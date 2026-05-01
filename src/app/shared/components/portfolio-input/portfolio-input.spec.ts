import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioInput } from './portfolio-input';

describe('PortfolioInput', () => {
  let fixture: ComponentFixture<PortfolioInput>;
  let component: PortfolioInput;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioInput],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioInput);
    component = fixture.componentInstance;
  });

  it('writes and emits plain input values through the ControlValueAccessor contract', () => {
    const onChange = vi.fn();
    const valueChangeSpy = vi.spyOn(component.valueChange, 'emit');
    component.registerOnChange(onChange);

    component.writeValue('hello');
    fixture.detectChanges();

    expect(component.displayValue()).toBe('hello');

    component.onInput({ target: { value: 'updated' } } as unknown as Event);

    expect(component.displayValue()).toBe('updated');
    expect(onChange).toHaveBeenCalledWith('updated');
    expect(valueChangeSpy).toHaveBeenCalledWith('updated');
  });

  it('formats price values for display while preserving the raw control value while typing', () => {
    fixture.componentRef.setInput('type', 'price');
    component.writeValue('12345.67');
    fixture.detectChanges();

    expect(component.displayValue()).toBe('12,345.67');

    component.onFocusInput();

    expect(component.displayValue()).toBe('12345.67');
  });

  it('adds unique tags and emits the updated tag list', () => {
    fixture.componentRef.setInput('isTagInput', true);
    const onChange = vi.fn();
    const tagsChangeSpy = vi.spyOn(component.tagsChange, 'emit');
    component.registerOnChange(onChange);

    component.onInput({ target: { value: ' ventas ' } } as unknown as Event);
    component.addTag();
    component.onInput({ target: { value: 'ventas' } } as unknown as Event);
    component.addTag();

    expect(component.tags()).toEqual(['ventas']);
    expect(onChange).toHaveBeenCalledWith(['ventas']);
    expect(tagsChangeSpy).toHaveBeenCalledWith(['ventas']);
  });

  it('removes tags and emits the remaining tag list', () => {
    fixture.componentRef.setInput('isTagInput', true);
    const tagsChangeSpy = vi.spyOn(component.tagsChange, 'emit');

    component.writeValue(['ventas', 'soporte']);
    component.removeTag(0);

    expect(component.tags()).toEqual(['soporte']);
    expect(tagsChangeSpy).toHaveBeenCalledWith(['soporte']);
  });

  it('only emits icon clicks when the icon is clickable and enabled', () => {
    const iconClickSpy = vi.spyOn(component.iconClick, 'emit');
    const clickEvent = new MouseEvent('click');

    component.onIconClick(clickEvent);
    expect(iconClickSpy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('iconClickable', true);
    fixture.detectChanges();

    component.onIconClick(clickEvent);
    expect(iconClickSpy).toHaveBeenCalledWith(clickEvent);

    component.setDisabledState(true);
    component.onIconClick(clickEvent);

    expect(iconClickSpy).toHaveBeenCalledTimes(1);
  });
});
