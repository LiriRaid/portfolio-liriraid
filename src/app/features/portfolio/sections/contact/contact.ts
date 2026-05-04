import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { environment } from '@environments/environment';
import { SocialLink } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioInput } from '@shared/components/portfolio-input/portfolio-input';
import { AlertService } from '@shared/services/alert.service';

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
  private readonly alertService = inject(AlertService);

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

  protected readonly submitDisabled = computed(() => {
    return this.sending() || this.form.invalid;
  });

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.alertService.showWarning('Formulario incompleto', 'Completa tu nombre, un correo válido y un mensaje antes de enviar.', undefined, 5000, false, 'top-center');

      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.sending.set(true);

    try {
      await this.sendEmail();

      this.form.reset({
        name: '',
        email: '',
        message: '',
      });

      this.alertService.showSuccess('Mensaje enviado', 'Gracias por escribirme. Te responderé pronto.', undefined, 4500, 'top-center');
    } catch (error) {
      console.error('[EmailJS] Error sending contact email:', error);

      this.alertService.showError('No se pudo enviar', 'Hubo un error al enviar tu mensaje. Intenta nuevamente en unos minutos.', undefined, 6000, 'top-center');
    } finally {
      this.sending.set(false);
    }
  }

  private async sendEmail(): Promise<void> {
    const { name, email, message } = this.form.getRawValue();
    const { send } = await import('@emailjs/browser');

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    await send(
      environment.emailjs.serviceId,
      environment.emailjs.templateId,
      {
        from_name: cleanName,
        from_email: cleanEmail,
        reply_to: cleanEmail,
        message: cleanMessage,
        from_initials: this.getInitials(cleanName),
      },
      {
        publicKey: environment.emailjs.publicKey,
      },
    );
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) {
      return '??';
    }

    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';

    return `${first}${last}`.toUpperCase();
  }
}
