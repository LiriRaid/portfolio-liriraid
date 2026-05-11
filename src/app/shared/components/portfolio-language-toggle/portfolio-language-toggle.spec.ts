import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioLanguageToggle } from './portfolio-language-toggle';

describe('PortfolioLanguageToggle', () => {
  let component: PortfolioLanguageToggle;
  let fixture: ComponentFixture<PortfolioLanguageToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioLanguageToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioLanguageToggle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
