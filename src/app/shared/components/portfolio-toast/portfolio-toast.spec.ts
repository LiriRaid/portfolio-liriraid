import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { PortfolioToast } from './portfolio-toast';

describe('PortfolioToast', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioToast],
      providers: [MessageService],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PortfolioToast);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should format message with bold tags', () => {
    const fixture = TestBed.createComponent(PortfolioToast);
    const component = fixture.componentInstance;

    const result = (component as any).formattedMessage('Hola {{mundo}}');

    expect(result).toBe('Hola <strong>mundo</strong>');
  });

  it('should format message without placeholders unchanged', () => {
    const fixture = TestBed.createComponent(PortfolioToast);
    const component = fixture.componentInstance;

    const result = (component as any).formattedMessage('Sin formato');

    expect(result).toBe('Sin formato');
  });
});
