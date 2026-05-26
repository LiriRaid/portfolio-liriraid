import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n';
import { AlertService } from '@shared/services/alert.service';
import { Hero } from './hero';
import { HeroService } from './hero.service';

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
    expect(component.cvCta()).toBe('t:hero.cta.cv');
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

describe('HeroService', () => {
  let service: HeroService;
  let mockTl: { fromTo: ReturnType<typeof vi.fn>; to: ReturnType<typeof vi.fn>; add: ReturnType<typeof vi.fn>; kill: ReturnType<typeof vi.fn> };
  let mockGsap: { timeline: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [MessageService],
    }).compileComponents();

    mockTl = { fromTo: vi.fn().mockReturnThis(), to: vi.fn().mockReturnThis(), add: vi.fn().mockReturnThis(), kill: vi.fn() };
    mockGsap = { timeline: vi.fn().mockReturnValue(mockTl), set: vi.fn() };
    service = TestBed.inject(HeroService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('animateCodeCard', () => {
    it('skips on mobile viewport', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);

      (service as any).animateCodeCard(mockGsap);

      expect(mockGsap.set).not.toHaveBeenCalled();
      expect(mockGsap.timeline).not.toHaveBeenCalled();
    });

    it('skips when prefers-reduced-motion is active', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
        matches: q.includes('prefers-reduced-motion'),
      } as MediaQueryList));

      (service as any).animateCodeCard(mockGsap);

      expect(mockGsap.set).not.toHaveBeenCalled();
    });

    it('skips when .hero-code-card is absent from DOM', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      (service as any).animateCodeCard(mockGsap);

      expect(mockGsap.timeline).not.toHaveBeenCalled();
    });

    it('pre-sets lines to hidden clipPath and tokens to desaturated before timeline', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
      const card = buildCodeCard();
      document.body.appendChild(card);

      (service as any).animateCodeCard(mockGsap);

      expect(mockGsap.set).toHaveBeenCalledWith(expect.anything(), { clipPath: 'inset(0 100% 0 0)' });
      expect(mockGsap.set).toHaveBeenCalledWith(expect.anything(), { filter: 'saturate(0) brightness(0.7)' });
      document.body.removeChild(card);
    });

    it('Phase 1: reveals each line via clipPath per-line tween', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
      const card = buildCodeCard();
      document.body.appendChild(card);

      (service as any).animateCodeCard(mockGsap);

      expect(mockTl.to).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ clipPath: 'inset(0 0% 0 0)' }),
        expect.any(Number),
      );
      document.body.removeChild(card);
    });

    it('Phase 2: activates token colors via filter after typing ends', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
      const card = buildCodeCard();
      document.body.appendChild(card);

      (service as any).animateCodeCard(mockGsap);

      expect(mockTl.to).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ filter: 'saturate(1) brightness(1)', stagger: 0.03 }),
        expect.any(Number),
      );
      document.body.removeChild(card);
    });
  });
});

function buildCodeCard(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'hero-code-card';

  const line = document.createElement('div');
  line.className = 'whitespace-pre';
  card.appendChild(line);

  for (const cls of ['code-keyword', 'code-prop', 'code-string', 'code-class']) {
    const span = document.createElement('span');
    span.className = cls;
    card.appendChild(span);
  }

  return card;
}
