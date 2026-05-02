import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioInput } from '@shared/components/portfolio-input/portfolio-input';

export interface SocialLink {
  techIcon: string;
  label: string;
  href: string;
  target?: string;
  rel?: string;
}

@Component({
  selector: 'portfolio-contact',
  standalone: true,
  imports: [ReactiveFormsModule, PortfolioButton, PortfolioInput],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly rEmail = ['gabrielleonardo', 'cruzflores', '@gmail.com'].join('');

  protected readonly socialLinks: SocialLink[] = [
    {
      techIcon: 'GitHub',
      label: 'GitHub',
      href: 'https://github.com/liriraid',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      techIcon: 'LinkedIn',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/gabriel-leonardo-cruz-flores-64570a1a4/',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  ];

  protected readonly form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  protected readonly messageFocused = signal(false);

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!isPlatformBrowser(this.platformId)) return;

    const { name, email, message } = this.form.getRawValue();
    const subject = encodeURIComponent(`Contacto portfolio – ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`);
    window.location.href = `mailto:${this.rEmail}?subject=${subject}&body=${body}`;
  }
}
