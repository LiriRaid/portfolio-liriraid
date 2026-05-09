import { TestBed } from '@angular/core/testing';
import { Projects } from './projects';

describe('Projects', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Projects);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
