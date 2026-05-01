import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';

import { createControlValueAccessorProvider } from '@core/forms/control-value-accessor.provider';
import { LucideIconName } from '@core/common/lucide-icons';
import { PortfolioIcon } from '..';

type PortfolioInputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url' | 'price';
type PortfolioVariant = 'over' | 'in' | 'on';
type PortfolioIconPosition = 'left' | 'right';

@Component({
  selector: 'portfolio-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PortfolioIcon],
  templateUrl: './portfolio-input.html',
  styleUrl: './portfolio-input.css',
  providers: [createControlValueAccessorProvider(PortfolioInput)],
})
export class PortfolioInput implements ControlValueAccessor, OnInit {
  readonly type = input<PortfolioInputType>('text');
  readonly placeholder = input<string>('');
  readonly label = input<string | undefined>(undefined);
  readonly value = input<string>('');

  readonly isTagInput = input<boolean>(false);
  readonly tagPlaceholder = input<string>('Escribe para agregar un Tag');
  readonly currencySymbol = input<string>('$');

  readonly variant = input<PortfolioVariant>('on');

  readonly lucideIcon = input<LucideIconName | ''>('');
  readonly iconPosition = input<PortfolioIconPosition>('left');
  readonly iconClickable = input<boolean>(false);

  readonly showErrorMessage = input<boolean>(true);
  readonly readonlyInput = input<boolean | string>(false);

  readonly readonly = computed<boolean>(() => {
    const v = this.readonlyInput();
    return v === '' || v === true || v === 'true';
  });

  readonly valueChange = output<string>();
  readonly tagsChange = output<string[]>();
  readonly iconClick = output<Event>();

  readonly isDisabled = signal(false);
  readonly tags = signal<string[]>([]);
  readonly currentTagValue = signal('');
  readonly isFocused = signal(false);
  readonly isInputFocused = signal(false);
  readonly isPlaceholderVisible = signal(false);
  readonly isPlaceholderFading = signal(false);
  private placeholderTimer?: ReturnType<typeof setTimeout>;
  private fadeTimer?: ReturnType<typeof setTimeout>;

  private readonly allowedTypes: PortfolioInputType[] = ['text', 'password', 'email', 'number', 'date', 'tel', 'url', 'price'];
  private readonly valueSig = signal<string>('');

  onChange: (value: string | string[]) => void = () => {};
  onTouched: () => void = () => {};

  private readonly injector = inject(Injector);
  private ngControl?: NgControl;

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null) || undefined;

    const initial = this.value() ?? '';
    if (initial && !this.isTagInput()) this.valueSig.set(initial);
  }

  private get control(): AbstractControl | null {
    return this.ngControl?.control ?? null;
  }

  readonly hasErrors = computed(() => {
    const c = this.control;
    if (!c) return false;
    return !!(c.invalid && (c.touched || c.dirty));
  });

  readonly errorMessage = computed(() => {
    if (!this.hasErrors() || !this.control?.errors) return '';

    const errors = this.control.errors;
    const label = this.label() || this.placeholder() || 'Este campo';

    if (errors['required']) return `${label} es requerido`;
    if (errors['email']) return 'Ingrese un correo electrónico válido';
    if (errors['minlength']) {
      const n = errors['minlength'].requiredLength;
      return `${label} debe tener al menos ${n} caracteres`;
    }
    if (errors['maxlength']) {
      const n = errors['maxlength'].requiredLength;
      return `${label} no puede exceder ${n} caracteres`;
    }
    if (errors['pattern']) return `${label} tiene un formato inválido`;

    return `${label} es inválido`;
  });

  readonly displayValue = computed(() => {
    if (this.isTagInput()) return '';
    const raw = this.valueSig();

    if (this.type() === 'price') {
      return this.isInputFocused() ? raw : this.formatPrice(raw);
    }
    return raw;
  });

  readonly inputType = computed(() => {
    const t = this.type();
    if (t === 'price') return 'text';
    return this.allowedTypes.includes(t) ? t : 'text';
  });

  readonly showCurrencySymbol = computed(() => {
    return this.type() === 'price' && (this.isInputFocused() || !!this.valueSig());
  });

  readonly hasValue = computed(() => {
    if (this.isTagInput()) return this.tags().length > 0;
    return !!this.valueSig();
  });

  readonly hasIcon = computed(() => !!this.lucideIcon());

  readonly hasLeftIcon = computed(() => {
    return this.hasIcon() && this.iconPosition() === 'left';
  });

  readonly placeholderAttr = computed(() => {
    const ph = this.placeholder();
    if (!ph) return ' ';

    const variant = this.variant();
    const hasLabel = !!this.label();

    if (hasLabel) return ph;

    return ph;
  });

  readonly inputVerticalClasses = computed(() => {
    return this.variant() === 'in' ? 'pt-[24px] pb-2.5' : 'py-2.5';
  });

  readonly inputPaddingClasses = computed(() => {
    const type = this.type();

    const leftOffset = (() => {
      if (type === 'price') {
        if (this.showCurrencySymbol()) {
          if (this.hasLeftIcon()) return 'pl-12';
          return 'pl-8';
        }
        if (this.hasLeftIcon()) return 'pl-10';
        return 'pl-4';
      }

      if (this.hasLeftIcon()) return 'pl-10';
      return 'pl-4';
    })();

    const rightOffset = this.hasIcon() && this.iconPosition() === 'right' ? 'pr-10' : 'pr-4';

    return `${leftOffset} ${rightOffset}`;
  });

  readonly inputBackground = computed(() => {
    if (this.isDisabled() || this.readonly()) return 'var(--app-control-disabled-bg)';
    return 'var(--app-control-surface-bg)';
  });

  readonly inputTextColor = computed(() => {
    if (this.isDisabled() || this.readonly()) return 'var(--app-control-disabled-text)';
    return 'var(--app-control-surface-text)';
  });

  readonly inputBorderColor = computed(() => {
    if (this.hasErrors()) return '#e51d21';
    if (this.isDisabled() || this.readonly()) return 'var(--app-control-disabled-border)';
    return 'var(--app-control-surface-border)';
  });

  readonly inputBoxShadow = computed(() => {
    if (this.hasErrors() && this.isInputFocused()) {
      return 'inset 0 0 0 2px rgba(229, 29, 33, 0.4)';
    }

    if (this.isInputFocused()) {
      return 'inset 0 0 0 2px var(--app-control-focus-ring)';
    }

    return 'none';
  });

  readonly tagContainerBackground = computed(() => {
    if (this.isDisabled() || this.readonly()) return 'var(--app-control-disabled-bg)';
    return 'var(--app-control-surface-bg)';
  });

  readonly tagContainerBoxShadow = computed(() => {
    if (this.hasErrors() && this.isFocused()) {
      return 'inset 0 0 0 2px rgba(229, 29, 33, 0.4)';
    }

    if (this.isFocused()) {
      return 'inset 0 0 0 2px var(--app-control-focus-ring)';
    }

    return 'none';
  });

  readonly shouldFloat = computed(() => this.hasValue() || this.isInputFocused());

  readonly legendOffset = computed(() => (this.hasLeftIcon() || this.showCurrencySymbol() ? '2rem' : '0.75rem'));

  readonly legendMaxWidth = computed(() => (this.shouldFloat() ? '999px' : '0px'));

  readonly legendTransition = computed(() => (this.shouldFloat() ? 'max-width 180ms ease' : 'max-width 80ms ease'));

  readonly fieldsetClasses = computed(() => ({
    'border-(--app-control-surface-border) bg-(--app-control-surface-bg)': !this.isDisabled() && !this.readonly() && !this.hasErrors(),
    'focus-within:ring-2 focus-within:ring-(--app-control-focus-ring) focus-within:border-transparent': !this.hasErrors(),
    'cursor-not-allowed bg-(--app-control-disabled-bg) border-(--app-control-disabled-border)': this.isDisabled() || this.readonly(),
    'bg-(--app-control-surface-bg) border-red-500 focus-within:ring-2 focus-within:ring-red-500/25 focus-within:border-transparent': this.hasErrors(),
  }));

  readonly labelBackground = computed(() => {
    if (this.variant() !== 'on') return 'transparent';
    return this.inputBackground();
  });

  readonly labelColor = computed(() => {
    if (this.hasErrors()) return '#e51d21';
    if (this.isDisabled()) return 'var(--app-disabled-text)';
    if (this.isInputFocused() || this.isFocused()) return 'var(--p-primary-500)';
    if (this.hasValue()) return 'var(--app-text-muted)';
    return 'var(--app-text-subtle)';
  });

  readonly labelClass = computed(() => {
    const cls: { [k: string]: boolean } = {};
    const leftClass = this.hasLeftIcon() || this.showCurrencySymbol() ? 'left-8' : 'left-3';
    cls[leftClass] = true;

    const shouldFloat = this.shouldFloat();
    const variant = this.variant();

    if (variant === 'in') {
      if (shouldFloat) {
        cls['top-2'] = true;
        cls['translate-y-0'] = true;
        cls['text-caption-2-bold'] = true;
      } else {
        cls['top-1/2'] = true;
        cls['-translate-y-1/2'] = true;
        cls['text-caption-1-medium'] = true;
      }
      return cls;
    }

    if (variant === 'over') {
      if (shouldFloat) {
        cls['-top-4.5'] = true;
        cls['translate-y-0'] = true;
        cls['text-caption-2-bold'] = true;
      } else {
        cls['top-1/2'] = true;
        cls['-translate-y-1/2'] = true;
        cls['text-caption-1-medium'] = true;
      }
      return cls;
    }

    if (shouldFloat) {
      cls['-top-2'] = true;
      cls['translate-y-0'] = true;
      cls['text-caption-2-bold'] = true;
    } else {
      cls['top-1/2'] = true;
      cls['-translate-y-1/2'] = true;
      cls['text-caption-1-medium'] = true;
    }

    return cls;
  });

  writeValue(value: unknown): void {
    if (this.isTagInput()) {
      if (Array.isArray(value)) {
        this.tags.set([...value]);
      } else if (typeof value === 'string' && value) {
        this.tags.set(
          value
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        );
      } else {
        this.tags.set([]);
      }
      return;
    }

    if (value !== null && value !== undefined) {
      const raw = String(value);
      this.valueSig.set(this.type() === 'price' ? this.unformatPrice(raw) : raw);
    } else {
      this.valueSig.set('');
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    if (this.isTagInput()) {
      this.currentTagValue.set((event.target as HTMLInputElement).value);
      return;
    }

    let val = (event.target as HTMLInputElement).value;

    if (this.type() === 'price') {
      val = this.unformatPrice(val);
      (event.target as HTMLInputElement).value = val;
    }

    this.valueSig.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
  }

  onFocusInput(): void {
    this.isInputFocused.set(true);
    clearTimeout(this.placeholderTimer);
    this.placeholderTimer = setTimeout(() => this.isPlaceholderVisible.set(true), 150);
  }

  onBlurInput(): void {
    this.isInputFocused.set(false);
    clearTimeout(this.placeholderTimer);
    this.isPlaceholderVisible.set(false);
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  onTagKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag();
    }
  }

  addTag(): void {
    const tag = this.currentTagValue().trim();
    const current = this.tags();

    if (tag && !current.includes(tag)) {
      const next = [...current, tag];
      this.tags.set(next);
      this.currentTagValue.set('');
      this.updateTagsValue(next);
    }
  }

  removeTag(index: number): void {
    const next = [...this.tags()];
    next.splice(index, 1);
    this.tags.set(next);
    this.updateTagsValue(next);
  }

  private updateTagsValue(next: string[]): void {
    this.onChange(next);
    this.tagsChange.emit([...next]);
  }

  onIconClick(event: Event): void {
    if (this.iconClickable() && !this.isDisabled() && !this.readonly()) {
      this.iconClick.emit(event);
    }
  }

  private unformatPrice(input: string): string {
    if (!input) return '';
    let s = input.replace(/,/g, '');
    s = s.replace(/[^\d.]/g, '');
    const parts = s.split('.');
    if (parts.length > 1) {
      s = parts[0] + '.' + parts.slice(1).join('');
    }
    return s;
  }

  private formatPrice(raw: string): string {
    if (!raw) return '';
    const sign = raw.startsWith('-') ? '-' : '';
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const [intPartRaw, decPartRaw] = cleaned.split('.');
    const intPart = (intPartRaw || '').replace(/^0+(?=\d)/, '');
    const withCommas = (intPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return sign + (decPartRaw !== undefined && decPartRaw !== '' ? `${withCommas}.${decPartRaw}` : withCommas);
  }
}
