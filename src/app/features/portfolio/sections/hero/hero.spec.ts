import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n';
import { AlertService } from '@shared/services/alert.service';
import { Hero } from './hero';

describe('Hero', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [MessageService],
    }).compileComponents();
  });

  it('creates the hero component', () => {
    const fixture = TestBed.createComponent(Hero);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes translated copy through computed signals', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => `t:${key}`);

    const fixture = TestBed.createComponent(Hero);
    const component = fixture.componentInstance as any;

    expect(component.badge()).toBe('t:hero.badge');
    expect(component.introName()).toBe('t:hero.intro.name');
    expect(component.titleLine1()).toBe('t:hero.title.line1');
    expect(component.description()).toBe('t:hero.description');
    expect(component.cvCta()).toBe('t:hero.cv.cta');
    // Falls back to the key on miss — the computed wrapper should just propagate it.
  });

  it('triggers a CV download and surfaces a success toast', () => {
    const alertService = TestBed.inject(AlertService);
    const showSuccessSpy = vi.spyOn(alertService, 'showSuccess').mockImplementation(() => undefined);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(Hero);
    (fixture.componentInstance as any).downloadCV();

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(showSuccessSpy).toHaveBeenCalledOnce();
    expect(showSuccessSpy.mock.calls[0]?.[4]).toBe('top-center');
  });

  it('scrollToAbout is a no-op on server but callable on browser', () => {
    const fixture = TestBed.createComponent(Hero);

    expect(() => (fixture.componentInstance as any).scrollToAbout()).not.toThrow();
  });
});
