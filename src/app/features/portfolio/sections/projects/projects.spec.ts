import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { Projects } from './projects';

describe('Projects', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [MessageService],
    }).compileComponents();
  });

  it('creates the projects component', () => {
    const fixture = TestBed.createComponent(Projects);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts with all projects displayed and the first project active', () => {
    const fixture = TestBed.createComponent(Projects);
    const component = fixture.componentInstance as any;

    expect(component.projects().length).toBeGreaterThan(0);
    expect(component.displayedProjects().length).toBe(component.projects().length);
    expect(component.showProjectsCarousel()).toBe(true);
    expect(component.showEmptyState()).toBe(false);
    expect(component.activeCarouselProjectTitle()).toBe(component.projects()[0].title);
  });

  it('toggles selected technologies on and off', () => {
    const fixture = TestBed.createComponent(Projects);
    const component = fixture.componentInstance as any;

    component.toggleTechnology('Angular 21');
    expect(component.selectedTechnologies()).toContain('Angular 21');
    expect(component.hasSelectedTechnologies()).toBe(true);
    expect(component.isTechnologySelected('Angular 21')).toBe(true);

    component.toggleTechnology('Angular 21');
    expect(component.selectedTechnologies()).not.toContain('Angular 21');
    expect(component.hasSelectedTechnologies()).toBe(false);
  });

  it('clears all selected technologies', () => {
    const fixture = TestBed.createComponent(Projects);
    const component = fixture.componentInstance as any;

    component.toggleTechnology('Angular 21');
    component.toggleTechnology('TypeScript');
    expect(component.selectedTechnologies().length).toBe(2);

    component.clearFilters();
    expect(component.selectedTechnologies()).toEqual([]);
  });

  it('filters projects whose tags intersect the active selection', () => {
    const fixture = TestBed.createComponent(Projects);
    const component = fixture.componentInstance as any;

    component.toggleTechnology('CLI');

    const filtered = component.filteredProjects();
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((project: { tags: string[] }) => {
      expect(project.tags).toContain('CLI');
    });
  });

  it('filters projects when typing in the search control', () => {
    const fixture = TestBed.createComponent(Projects);
    const component = fixture.componentInstance as any;

    component.searchControl.setValue('OmniInbox');

    const filtered = component.filteredProjects();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('OmniInbox');
    expect(component.hasSearchTerm()).toBe(true);
  });

  it('returns a fallback icon for tech names not present in the override map', () => {
    const fixture = TestBed.createComponent(Projects);
    const component = fixture.componentInstance as any;

    expect(component.techFallbackIcon('SomeUnmappedTech')).toBe('Code');
  });
});
