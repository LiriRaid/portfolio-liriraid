import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { environment } from '@environments/environment';
import { TContactForm } from '@features/portfolio/entities';
import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioInput } from '@shared/components/portfolio-input/portfolio-input';
import { AlertService } from '@shared/services/alert.service';

import { CONTACT_CONTENT, CONTACT_SOCIAL_LINKS } from './mocks';
import { ContactService } from './contact.service';
import { PortfolioSectionRevealService } from '@shared/services';

@Component({
  selector: 'portfolio-contact',
  standalone: true,
  imports: [ReactiveFormsModule, PortfolioButton, PortfolioInput],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block;',
  },
})
export class Contact {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly alertService = inject(AlertService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contactService = inject(ContactService);
  private readonly revealService = inject(PortfolioSectionRevealService);

  @ViewChild('contentRef') contentRef!: ElementRef<HTMLElement>;
  @ViewChild('formRef') formRef!: ElementRef<HTMLElement>;

  protected readonly contact = CONTACT_CONTENT;
  protected readonly socialLinks = CONTACT_SOCIAL_LINKS;

  protected readonly form: TContactForm = new FormGroup({
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

  protected readonly sending = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.revealService.revealOnViewport({
        hostRef: this.elementRef,
        destroyRef: this.destroyRef,
        onReveal: () => {
          this.contactService.animateEntrance(this.elementRef, this.contentRef, this.formRef);
        },
      });
    });
  }

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
