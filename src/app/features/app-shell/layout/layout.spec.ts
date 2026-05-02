import { TestBed } from '@angular/core/testing';
import { Layout } from './layout';
import { provideRouter } from '@angular/router';

describe('Layout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Layout);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render main element', () => {
    const fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('main')).toBeTruthy();
  });
});
