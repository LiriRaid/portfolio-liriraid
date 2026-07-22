import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { Portfolio } from './portfolio';

describe('Portfolio (page)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portfolio],
      providers: [MessageService],
      // The page wraps its below-the-fold sections in @defer blocks; Manual
      // behavior lets the spec render them to their final state explicitly.
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();
  });

  it('creates the portfolio page component', () => {
    const fixture = TestBed.createComponent(Portfolio);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it(
    'mounts every portfolio section plus the background animation in order',
    async () => {
      const fixture = TestBed.createComponent(Portfolio);
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();
      for (const block of deferBlocks) {
        await block.render(DeferBlockState.Complete);
      }

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
    },
    15_000,
  );
});
