import { FormControl, FormGroup } from '@angular/forms';

export interface ISocialLink {
  techIcon: string;
  label: string;
  href: string;
  target?: string;
  rel?: string;
}

export interface IContactContent {
  label: string;
  titleStart: string;
  titleHighlight: string;
  description: string;
}

export type TContactForm = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  message: FormControl<string>;
}>;
