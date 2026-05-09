import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Portfolio } from './portfolio';

describe('Portfolio', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portfolio],
      providers: [MessageService],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Portfolio);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
