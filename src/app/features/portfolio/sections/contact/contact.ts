import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { I18nService } from '@core/i18n';
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
  private readonly i18nService = inject(I18nService);

  @ViewChild('contentRef') contentRef!: ElementRef<HTMLElement>;
  @ViewChild('formRef') formRef!: ElementRef<HTMLElement>;

  protected readonly contact = computed(() => ({
    label: this.t(CONTACT_CONTENT.label),
    titleStart: this.t(CONTACT_CONTENT.titleStart),
    titleHighlight: this.t(CONTACT_CONTENT.titleHighlight),
    description: this.t(CONTACT_CONTENT.description),
  }));

  protected readonly socialLinks = computed(() =>
    CONTACT_SOCIAL_LINKS.map((link) => ({
      ...link,
      label: this.t(link.label),
    })),
  );

  protected readonly nameLabel = computed(() => this.t('contact.form.name.label'));
  protected readonly namePlaceholder = computed(() => this.t('contact.form.name.placeholder'));
  protected readonly emailLabel = computed(() => this.t('contact.form.email.label'));
  protected readonly emailPlaceholder = computed(() => this.t('contact.form.email.placeholder'));
  protected readonly messageLabel = computed(() => this.t('contact.form.message.label'));
  protected readonly messagePlaceholder = computed(() => this.t('contact.form.message.placeholder'));
  protected readonly submitLabel = computed(() => this.t('contact.form.submit'));
  protected readonly submittingLabel = computed(() => this.t('contact.form.submitting'));

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

      this.alertService.showWarning(this.t('contact.alerts.incomplete.title'), this.t('contact.alerts.incomplete.message'), undefined, 5000, false, 'top-center');

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

      this.alertService.showSuccess(this.t('contact.alerts.success.title'), this.t('contact.alerts.success.message'), undefined, 4500, 'top-center');
    } catch (error) {
      console.error('[EmailJS] Error sending contact email:', error);

      this.alertService.showError(this.t('contact.alerts.error.title'), this.t('contact.alerts.error.message'), undefined, 6000, 'top-center');
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

  private t(key: string): string {
    return this.i18nService.t(key);
  }
}
