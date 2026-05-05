import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { PORTFOLIO_LUCIDE_ICONS } from '@core/common/icons/lucide-icons.provider';
import { PortfolioIconsSVG } from '@core/common/icons/portfolio-icons';

@Component({
  selector: 'portfolio-icon',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  template: `
    @if (svgUrl(); as svgUrl) {
      @if (svgColored()) {
        <svg role="img" [attr.aria-label]="name()" [class]="coloredSvgClass()" [attr.width]="fontSize()" [attr.height]="fontSize()" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter [attr.id]="coloredFilterId" color-interpolation-filters="sRGB">
              <feFlood flood-color="currentColor" result="tint"></feFlood>
              <feBlend in="tint" in2="SourceGraphic" mode="color" result="colored"></feBlend>
              <feComposite in="colored" in2="SourceAlpha" operator="in"></feComposite>
            </filter>
          </defs>

          <image [attr.href]="svgUrl" width="1" height="1" preserveAspectRatio="xMidYMid meet" [attr.filter]="coloredFilterUrl()"></image>
        </svg>
      } @else {
        <span role="img" [attr.aria-label]="name()" [class]="maskedImageClass()" [style.width]="fontSize()" [style.height]="fontSize()" [style.--icon-url]="'url(' + svgUrl + ')'"></span>
      }
    } @else if (lucideName(); as lucideName) {
      <svg [lucideIcon]="lucideName" [class]="iconClass()" [size]="pixelSize()"></svg>
    } @else {
      <span [class]="iconClass()" [style.fontSize]="fontSize()">
        {{ name() }}
      </span>
    }
  `,
  host: {
    '[style.color]': 'resolvedColor()',
    '[style.fontSize]': 'fontSize()',
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      svg[lucideIcon],
      span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        color: inherit;
      }

      .svg-colored-icon,
      .svg-icon {
        display: inline-block;
        flex: 0 0 auto;
      }

      .svg-colored-icon {
        color: inherit;
        overflow: visible;
      }

      .svg-icon {
        background-color: currentColor;
        mask: var(--icon-url) center / contain no-repeat;
        -webkit-mask: var(--icon-url) center / contain no-repeat;
      }

      .spin {
        animation: portfolio-icon-spin 1s linear infinite;
      }

      @keyframes portfolio-icon-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class PortfolioIcon {
  private static nextFilterId = 0;

  private readonly lucideIcons = inject(PORTFOLIO_LUCIDE_ICONS);
  private readonly svgIcons = PortfolioIconsSVG;
  protected readonly coloredFilterId = `portfolio-colored-icon-${PortfolioIcon.nextFilterId++}`;

  readonly name = input.required<string>();
  readonly size = input<string | number>('1.25rem');
  readonly color = input<string | undefined>(undefined);
  readonly spin = input<boolean>(false);
  readonly extraClass = input<string>('');

  readonly svgEntry = computed(() => {
    const key = this.name();
    return this.svgIcons.find((icon) => icon.name === key) ?? null;
  });

  readonly svgUrl = computed(() => this.svgEntry()?.url ?? null);
  readonly svgColored = computed(() => this.svgEntry()?.colored ?? false);

  readonly lucideName = computed(() => {
    const key = this.name();
    return key in this.lucideIcons ? key : null;
  });

  readonly iconClass = computed(() => {
    const base = this.spin() ? 'spin' : '';
    const extra = (this.extraClass() ?? '').trim();
    return [base, extra].filter(Boolean).join(' ');
  });

  readonly imageClass = computed(() => {
    const base = this.spin() ? 'spin' : '';
    const extra = (this.extraClass() ?? '').trim();
    return [base, extra].filter(Boolean).join(' ');
  });

  readonly coloredSvgClass = computed(() => {
    const base = this.spin() ? 'svg-colored-icon spin' : 'svg-colored-icon';
    const extra = (this.extraClass() ?? '').trim();
    return [base, extra].filter(Boolean).join(' ');
  });

  readonly coloredFilterUrl = computed(() => `url(#${this.coloredFilterId})`);

  readonly maskedImageClass = computed(() => {
    const base = this.spin() ? 'svg-icon spin' : 'svg-icon';
    const extra = (this.extraClass() ?? '').trim();
    return [base, extra].filter(Boolean).join(' ');
  });

  readonly resolvedColor = computed(() => {
    if (this.color()) return this.color()!;
    if (this.svgColored()) return 'var(--p-primary-500)';
    return null;
  });

  readonly fontSize = computed(() => {
    const value = this.size();
    if (typeof value === 'number') return `${value}px`;

    const sizeStr = (value ?? '').toString().trim();
    if (/^\d+$/.test(sizeStr)) return `${sizeStr}px`;

    return sizeStr || '1.25rem';
  });

  readonly pixelSize = computed(() => {
    const value = this.size();

    if (typeof value === 'number') return value;

    const sizeStr = (value ?? '').toString().trim();
    if (/^\d+$/.test(sizeStr)) return Number(sizeStr);
    if (/^\d+px$/.test(sizeStr)) return Number(sizeStr.replace('px', ''));
    if (/^\d*\.?\d+rem$/.test(sizeStr)) return Math.round(Number(sizeStr.replace('rem', '')) * 16);
    if (/^\d*\.?\d+em$/.test(sizeStr)) return Math.round(Number(sizeStr.replace('em', '')) * 16);

    return 20;
  });
}
