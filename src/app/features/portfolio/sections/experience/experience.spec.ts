import { TestBed } from '@angular/core/testing';
import { Experience } from './experience';

describe('Experience', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Experience],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Experience);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have at least one experience entry', () => {
    const fixture = TestBed.createComponent(Experience);
    const component = fixture.componentInstance;

    expect((component as any).experiences.length).toBeGreaterThan(0);
  });

  it('should expose techIconUrl utility', () => {
    const fixture = TestBed.createComponent(Experience);
    const component = fixture.componentInstance;

    expect((component as any).techIconUrl).toBeDefined();
    expect(typeof (component as any).techIconUrl).toBe('function');
  });
});
