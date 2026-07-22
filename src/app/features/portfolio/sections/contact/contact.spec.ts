import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n';
import { Contact } from './contact';

describe('Contact', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [MessageService],
    }).compileComponents();
  });

  it('creates the contact component', () => {
    const fixture = TestBed.createComponent(Contact);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('builds a non-nullable form with name, email and message controls', () => {
    const fixture = TestBed.createComponent(Contact);
    const form = (fixture.componentInstance as any).form;

    expect(Object.keys(form.controls)).toEqual(['name', 'email', 'message']);
    expect(form.controls.name.value).toBe('');
    expect(form.controls.email.value).toBe('');
    expect(form.controls.message.value).toBe('');
  });

  it('marks the form invalid until every field passes its validators', () => {
    const fixture = TestBed.createComponent(Contact);
    const form = (fixture.componentInstance as any).form;

    expect(form.invalid).toBe(true);

    form.controls.name.setValue('Al');
    form.controls.email.setValue('not-an-email');
    form.controls.message.setValue('short');
    expect(form.invalid).toBe(true);

    form.controls.name.setValue('Gabriel');
    form.controls.email.setValue('gabriel@example.com');
    form.controls.message.setValue('Hola, me interesa hablar contigo.');
    expect(form.valid).toBe(true);
  });

  it('starts with the sending signal at false', () => {
    const fixture = TestBed.createComponent(Contact);

    expect((fixture.componentInstance as any).sending()).toBe(false);
  });

  it('translates contact copy through the i18n service', () => {
    const i18n = TestBed.inject(I18nService);
    vi.spyOn(i18n, 't').mockImplementation((key) => `t:${key}`);

    const fixture = TestBed.createComponent(Contact);
    const block = (fixture.componentInstance as any).contact();

    expect(block.label).toBe('t:contact.label');
    expect(block.titleStart).toBe('t:contact.title.start');
    expect(block.description).toBe('t:contact.description');
  });
});
