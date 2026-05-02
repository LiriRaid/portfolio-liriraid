import { TestBed } from '@angular/core/testing';
import { Portfolio } from './portfolio';

describe('Portfolio', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portfolio],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Portfolio);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
