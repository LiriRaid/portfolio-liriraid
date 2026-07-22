import { TestBed } from '@angular/core/testing';

import { I18nService } from '@core/i18n';
import { About } from './about';

describe('About', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
    }).compileComponents();
  });

  it('creates the about component', () => {
    const fixture = TestBed.createComponent(About);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('builds the translated about block via i18n keys', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => `t:${key}`);

    const fixture = TestBed.createComponent(About);
    const block = (fixture.componentInstance as any).about();

    expect(block.label).toBe('t:about.label');
    expect(block.title).toBe('t:about.title');
    expect(block.ctaLabel).toBe('t:about.cta');
    expect(block.paragraphs).toHaveLength(2);
    expect(block.paragraphs[0]).toEqual({ id: 'about.paragraphs.0', text: 't:about.paragraphs.0' });
  });

  it('maps the stats mock through the i18n service preserving each label as id', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => `t:${key}`);

    const fixture = TestBed.createComponent(About);
    const stats = (fixture.componentInstance as any).stats();

    expect(stats).toEqual([
      { id: 'about.stats.0.label', value: 't:about.stats.0.value', label: 't:about.stats.0.label' },
      { id: 'about.stats.1.label', value: 't:about.stats.1.value', label: 't:about.stats.1.label' },
    ]);
  });

  it('exposes the stats aria label as a translated computed', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => `t:${key}`);

    const fixture = TestBed.createComponent(About);

    expect((fixture.componentInstance as any).statsAriaLabel()).toBe('t:about.stats.aria');
  });

  it('does not throw when scrollToExperience is called', () => {
    const fixture = TestBed.createComponent(About);

    expect(() => (fixture.componentInstance as any).scrollToExperience()).not.toThrow();
  });
});
