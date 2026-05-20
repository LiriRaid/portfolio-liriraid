import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { Portfolio } from './portfolio';

describe('Portfolio (page)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portfolio],
      providers: [MessageService],
    }).compileComponents();
  });

  it('creates the portfolio page component', () => {
    const fixture = TestBed.createComponent(Portfolio);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mounts every portfolio section plus the background animation in order', () => {
    const fixture = TestBed.createComponent(Portfolio);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;

    const expectedSelectors = [
      'portfolio-hero',
      'portfolio-experience',
      'portfolio-projects',
      'portfolio-skills',
      'portfolio-about',
      'portfolio-contact',
      'portfolio-background-animation',
    ];

    for (const selector of expectedSelectors) {
      expect(root.querySelector(selector)).not.toBeNull();
    }
  });
});
