import { CommonModule } from '@angular/common';
import { Component, booleanAttribute, computed, input, output } from '@angular/core';
import { ButtonModule, type ButtonSeverity } from 'primeng/button';
import { Ripple } from 'primeng/ripple';

import { techIconUrl } from '@shared/utils/tech-icons';
import { PortfolioIcon } from '../portfolio-icon/portfolio-icon';

type ButtonVariant = 'outlined' | 'text' | undefined;
type ButtonType = 'button' | 'submit' | 'reset';
type IconPosition = 'left' | 'right' | 'top' | 'bottom';

type ButtonClassParts = {
  button: string;
  label: string;
};

@Component({
  selector: 'portfolio-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, Ripple, PortfolioIcon],
  templateUrl: './portfolio-button.html',
  styleUrl: './portfolio-button.css',
  host: {
    '[class]': 'hostClass()',
  },
})
export class PortfolioButton {
  readonly label = input<string>('');
  readonly icon = input<string | null>(null);
  readonly techIcon = input<string | null>(null);
  readonly badge = input<string | number | null>(null);

  readonly iconSize = input<string | number>('16');
  readonly iconPos = input<IconPosition>('left');

  readonly severity = input<ButtonSeverity | undefined>(undefined);
  readonly outlined = input(false, { transform: booleanAttribute });
  readonly raised = input(false, { transform: booleanAttribute });
  readonly text = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly variant = input<ButtonVariant>(undefined);
  readonly type = input<ButtonType>('button');

  readonly href = input<string | null>(null);
  readonly target = input<string | null | undefined>(null);
  readonly rel = input<string | null | undefined>(null);
  readonly ariaLabel = input<string | null>(null);

  readonly styleClass = input<string>('');
  readonly labelClass = input<string>('');
  readonly badgeClass = input<string>('');
  readonly iconExtraClass = input<string>('');
  readonly iconColor = input<string | undefined>(undefined);

  readonly onClick = output<MouseEvent>();

  readonly techIconImgUrl = computed<string | null>(() => {
    const name = this.techIcon();

    return name ? techIconUrl(name) : null;
  });

  private readonly classParts = computed<ButtonClassParts>(() => {
    const tokens = this.toClassList(this.styleClass());

    const labelTokens = tokens.filter((token) => this.isTextClass(token));
    const buttonTokens = tokens.filter((token) => !this.isTextClass(token));

    return {
      button: buttonTokens.join(' '),
      label: labelTokens.join(' '),
    };
  });

  readonly buttonClass = computed(() => this.classParts().button);

  readonly hostClass = computed(() => {
    const widthTokens = this.toClassList(this.styleClass()).filter((token) => this.isWidthClass(token));

    return this.joinClasses(widthTokens.length ? 'block' : '', ...widthTokens);
  });

  readonly iconClass = computed(() => `p-button-icon-${this.iconPos()}`);

  readonly computedIconClass = computed(() => {
    return this.joinClasses(this.iconClass(), this.iconExtraClass());
  });

  readonly computedLabelClass = computed(() => {
    return this.joinClasses(this.classParts().label, this.labelClass());
  });

  readonly computedBadgeClass = computed(() => {
    return this.joinClasses('portfolio-button__badge', this.badgeClass());
  });

  readonly hasIcon = computed(() => Boolean(this.icon() || this.techIconImgUrl()));

  readonly hasBadge = computed(() => {
    const value = this.badge();

    return value !== null && value !== undefined && value !== '';
  });

  readonly showIconBefore = computed(() => {
    return this.hasIcon() && this.isIconBefore(this.iconPos());
  });

  readonly showIconAfter = computed(() => {
    return this.hasIcon() && !this.isIconBefore(this.iconPos());
  });

  handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.onClick.emit(event);
  }

  private isIconBefore(position: IconPosition): boolean {
    return position === 'left' || position === 'top';
  }

  private isTextClass(token: string): boolean {
    return /(^|:)text-/.test(token);
  }

  private isWidthClass(token: string): boolean {
    return /(^|:)w-/.test(token);
  }

  private toClassList(value: string | null | undefined): string[] {
    return (value ?? '').trim().split(/\s+/).filter(Boolean);
  }

  private joinClasses(...classes: Array<string | null | undefined>): string {
    return classes.flatMap((value) => this.toClassList(value)).join(' ');
  }
}
