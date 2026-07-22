import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioBackgroundAnimation } from './portfolio-background-animation';

describe('PortfolioBackgroundAnimation', () => {
  let component: PortfolioBackgroundAnimation;
  let fixture: ComponentFixture<PortfolioBackgroundAnimation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioBackgroundAnimation],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioBackgroundAnimation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
