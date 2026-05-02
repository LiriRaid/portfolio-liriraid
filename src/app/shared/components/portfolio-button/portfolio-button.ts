import { Component, booleanAttribute, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule, type ButtonSeverity } from 'primeng/button';
import { PortfolioIcon } from '../portfolio-icon/portfolio-icon';

@Component({
  selector: 'portfolio-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, PortfolioIcon],
  templateUrl: './portfolio-button.html',
  styleUrl: './portfolio-button.css',
  host: {
    '[class]': 'hostClass()',
  },
})
export class PortfolioButton {
  readonly label = input<string>('');
  readonly icon = input<string | null>(null);
  readonly iconSize = input<string | number>('16');
  readonly iconPos = input<'left' | 'right' | 'top' | 'bottom'>('left');

  readonly severity = input<ButtonSeverity | undefined>(undefined);
  readonly outlined = input(false, { transform: booleanAttribute });
  readonly raised = input(false, { transform: booleanAttribute });
  readonly text = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly variant = input<'outlined' | 'text' | undefined>(undefined);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly styleClass = input<string>('');
  readonly labelClass = input<string>('');
  readonly iconExtraClass = input<string>('');
  readonly iconColor = input<string | undefined>(undefined);

  readonly onClick = output<MouseEvent>();

  private readonly splitClasses = computed(() => {
    const raw = (this.styleClass() ?? '').trim();
    if (!raw) return { button: '', label: '' };

    const tokens = raw.split(/\s+/).filter(Boolean);
    const labelTokens: string[] = [];
    const buttonTokens: string[] = [];

    for (const token of tokens) {
      // text-* classes (including responsive prefixes like sm:text-*)
      if (/(^|:)text-/.test(token)) {
        labelTokens.push(token);
      } else {
        buttonTokens.push(token);
      }
    }

    return {
      button: buttonTokens.join(' '),
      label: labelTokens.join(' '),
    };
  });

  readonly buttonClass = computed(() => this.splitClasses().button);
  readonly iconClass = computed(() => `p-button-icon-${this.iconPos()}`);
  readonly computedIconClass = computed(() => {
    const base = this.iconClass();
    const extra = (this.iconExtraClass() ?? '').trim();
    return [base, extra].filter(Boolean).join(' ');
  });
  readonly hostClass = computed(() => {
    const raw = (this.styleClass() ?? '').trim();
    if (!raw) return '';
    const tokens = raw.split(/\s+/).filter(Boolean);
    const widthTokens = tokens.filter((token) => /(^|:)w-/.test(token));
    if (!widthTokens.length) return '';
    return ['block', ...widthTokens].join(' ');
  });
  readonly computedLabelClass = computed(() => {
    const fromStyle = this.splitClasses().label;
    const extra = (this.labelClass() ?? '').trim();
    return [fromStyle, extra].filter(Boolean).join(' ');
  });

  handleClick(event: MouseEvent): void {
    this.onClick.emit(event);
  }
}
