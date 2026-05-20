import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { ThemeService } from '@core/theme/theme.service';
import { PortfolioBackgroundAnimationService } from '@features/portfolio/ui/portfolio-background-animation/portfolio-background-animation.service';
import { Header } from './header';

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [MessageService],
    }).compileComponents();
  });

  it('creates the header component', () => {
    const fixture = TestBed.createComponent(Header);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('lists every portfolio section in the nav links', () => {
    const fixture = TestBed.createComponent(Header);
    const component = fixture.componentInstance as any;

    const sectionIds = component.navLinks().map((link: { sectionId: string }) => link.sectionId);

    expect(sectionIds).toEqual(['home', 'about', 'experience', 'projects', 'skills', 'contact']);
  });

  it('toggles the mobile menu open and closed', () => {
    const fixture = TestBed.createComponent(Header);
    const component = fixture.componentInstance as any;

    expect(component.mobileMenuOpen()).toBe(false);

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);

    component.closeMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('delegates the theme toggle to ThemeService', () => {
    const themeService = TestBed.inject(ThemeService);
    const toggleSpy = vi.spyOn(themeService, 'toggleMode').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(Header);
    (fixture.componentInstance as any).toggleThemeMode();

    expect(toggleSpy).toHaveBeenCalledOnce();
  });

  it('delegates the background-animation toggle to its service', () => {
    const animationService = TestBed.inject(PortfolioBackgroundAnimationService);
    const toggleSpy = vi.spyOn(animationService, 'toggle').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(Header);
    (fixture.componentInstance as any).toggleBackgroundAnimation();

    expect(toggleSpy).toHaveBeenCalledOnce();
  });

  it('computes nav link classes based on the active section', () => {
    const fixture = TestBed.createComponent(Header);
    const component = fixture.componentInstance as any;

    component.activeSection.set('projects');

    expect(component.navLinkClass('projects')).toBe('nav-link nav-link--active');
    expect(component.navLinkClass('about')).toBe('nav-link');
    expect(component.mobileNavLinkClass('projects')).toBe('mobile-nav-link mobile-nav-link--active');
  });

  it('reflects the background-animation enabled signal in the button class', () => {
    const animationService = TestBed.inject(PortfolioBackgroundAnimationService);
    const fixture = TestBed.createComponent(Header);
    const component = fixture.componentInstance as any;

    animationService.enabled.set(true);
    expect(component.backgroundAnimationButtonClass()).toContain('background-animation-btn--active');

    animationService.enabled.set(false);
    expect(component.backgroundAnimationButtonClass()).not.toContain('background-animation-btn--active');
  });
});
