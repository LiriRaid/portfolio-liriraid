import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Layout } from './layout';

describe('Layout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();
  });

  it('creates the layout component', () => {
    const fixture = TestBed.createComponent(Layout);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the scroll root that hosts every section', () => {
    const fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();

    const scrollRoot = fixture.nativeElement.querySelector('.layout-scroll-root');
    const main = fixture.nativeElement.querySelector('main');

    expect(scrollRoot).not.toBeNull();
    expect(main).not.toBeNull();
  });

  it('mounts the header, footer and router outlet wrappers', () => {
    const fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('portfolio-header')).not.toBeNull();
    expect(root.querySelector('portfolio-footer')).not.toBeNull();
    expect(root.querySelector('router-outlet')).not.toBeNull();
  });

  it('returns null from getVisibleSectionId when there is no scroll root yet', () => {
    const fixture = TestBed.createComponent(Layout);
    const result = (fixture.componentInstance as any).getVisibleSectionId();

    // Without the layout attached/visible the helper bails out without throwing.
    expect(result).toBeNull();
  });
});
