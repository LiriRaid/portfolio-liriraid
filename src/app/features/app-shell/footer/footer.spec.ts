import { TestBed } from '@angular/core/testing';
import { I18nService } from '@core/i18n';
import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();
  });

  it('creates the footer component', () => {
    const fixture = TestBed.createComponent(Footer);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes the current year', () => {
    const fixture = TestBed.createComponent(Footer);

    expect((fixture.componentInstance as any).year).toBe(new Date().getFullYear());
  });

  it('interpolates the current year into the copyright string', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => (key === 'footer.copyright' ? '© {year} Liriraid' : key));

    const fixture = TestBed.createComponent(Footer);
    const copyright = (fixture.componentInstance as any).copyright();

    expect(copyright).toBe(`© ${new Date().getFullYear()} Liriraid`);
  });

  it('routes translated labels through the i18n service', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => `t:${key}`);

    const fixture = TestBed.createComponent(Footer);
    const component = fixture.componentInstance as any;

    expect(component.tagline()).toBe('t:footer.tagline');
    expect(component.githubLabel()).toBe('t:footer.links.github');
    expect(component.contactLabel()).toBe('t:footer.links.contact');
  });
});
