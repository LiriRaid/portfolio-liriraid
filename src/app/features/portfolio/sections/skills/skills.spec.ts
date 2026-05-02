import { TestBed } from '@angular/core/testing';
import { Skills } from './skills';

describe('Skills', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skills],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Skills);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
