import { TestBed } from '@angular/core/testing';

import { I18nService } from '@core/i18n';
import { Skills } from './skills';

describe('Skills', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skills],
    }).compileComponents();
  });

  it('creates the skills component', () => {
    const fixture = TestBed.createComponent(Skills);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('translates the header label/title/subtitle through i18n', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => `t:${key}`);

    const fixture = TestBed.createComponent(Skills);
    const header = (fixture.componentInstance as any).header();

    expect(header.label).toBe('t:skills.header.label');
    expect(header.title).toBe('t:skills.header.title');
    expect(header.subtitle).toBe('t:skills.header.subtitle');
  });

  it('maps each category label through the i18n service while preserving skills order', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => `t:${key}`);

    const fixture = TestBed.createComponent(Skills);
    const categories = (fixture.componentInstance as any).categories();

    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0].label).toBe('t:skills.categories.frontend');
    expect(categories[0].skills[0]).toBe('Angular 21');
  });

  it('returns the Code icon when no fallback mapping exists for a skill', () => {
    const fixture = TestBed.createComponent(Skills);
    const component = fixture.componentInstance as any;

    expect(component.skillFallbackIcon('SomeUnknownTech')).toBe('Code');
  });
});
