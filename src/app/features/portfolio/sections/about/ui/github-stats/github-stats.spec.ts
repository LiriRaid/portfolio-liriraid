import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GithubStats } from './github-stats';

describe('GithubStats', () => {
  let component: GithubStats;
  let fixture: ComponentFixture<GithubStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GithubStats],
    }).compileComponents();

    fixture = TestBed.createComponent(GithubStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
