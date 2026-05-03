import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { environment } from '@environments/environment';
import { SocialLink } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioInput } from '@shared/components/portfolio-input/portfolio-input';

type ContactForm = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  message: FormControl<string>;
}>;

@Component({
  selector: 'portfolio-contact',
  standalone: true,
  imports: [ReactiveFormsModule, PortfolioButton, PortfolioInput],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly platformId = inject(PLATFORM_ID);

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

  protected readonly form: ContactForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
  });

  protected readonly messageFocused = signal(false);
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly sendError = signal(false);

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.sending.set(true);
    this.resetSubmitState();

    try {
      await this.sendEmail();
      this.sent.set(true);
      this.form.reset();
    } catch {
      this.sendError.set(true);
    } finally {
      this.sending.set(false);
    }
  }

  private resetSubmitState(): void {
    this.sent.set(false);
    this.sendError.set(false);
  }

  private async sendEmail(): Promise<void> {
    const { name, email, message } = this.form.getRawValue();
    const { send } = await import('@emailjs/browser');

    await send(
      environment.emailjs.serviceId,
      environment.emailjs.templateId,
      {
        from_name: name,
        from_email: email,
        message,
      },
      {
        publicKey: environment.emailjs.publicKey,
      },
    );
  }
}
