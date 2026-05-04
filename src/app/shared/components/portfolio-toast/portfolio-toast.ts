import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { type ButtonSeverity } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { PortfolioButton } from '@shared/components/portfolio-button/portfolio-button';
import { PortfolioIcon } from '@shared/components/portfolio-icon/portfolio-icon';
import { AlertService } from '@shared/services/alert.service';

import { PortfolioPrimeToastMessage, PortfolioToastAction, PortfolioToastData, PortfolioToastType } from './portfolio-toast.types';

type PrimeToastCloseFn = (event: Event) => void;

@Component({
  selector: 'portfolio-toast',
  standalone: true,
  imports: [CommonModule, ToastModule, PortfolioIcon, PortfolioButton],
  templateUrl: './portfolio-toast.html',
  styleUrl: './portfolio-toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioToast {
  private readonly alertService = inject(AlertService);

  protected readonly position = computed(() => this.alertService.toastPosition());
  protected readonly PortfolioToastType = PortfolioToastType;

  protected closeToast(event: MouseEvent, closeFn: PrimeToastCloseFn): void {
    event.preventDefault();
    event.stopPropagation();

    closeFn(event);
  }

  protected executeAction(event: MouseEvent, action: PortfolioToastAction, closeFn: PrimeToastCloseFn): void {
    event.preventDefault();
    event.stopPropagation();

    closeFn(event);
    action.execute();
  }

  protected data(message: PortfolioPrimeToastMessage): PortfolioToastData {
    return message.data as PortfolioToastData;
  }

  protected hasIcon(message: PortfolioPrimeToastMessage): boolean {
    const data = this.data(message);

    return data.type !== PortfolioToastType.Info || Boolean(data.icon);
  }

  protected showProgressBar(message: PortfolioPrimeToastMessage): boolean {
    const data = this.data(message);

    return data.type !== PortfolioToastType.Loading && !data.persistent;
  }

 protected toastIcon(message: PortfolioPrimeToastMessage): string {
  const data = this.data(message);

  if (data.icon) {
    return data.icon;
  }

  switch (data.type) {
    case PortfolioToastType.Success:
      return 'CheckCircle';

    case PortfolioToastType.Info:
      return 'Info';

    case PortfolioToastType.Warning:
      return 'Info';

    case PortfolioToastType.Error:
      return 'CloseCircle';

    case PortfolioToastType.Secondary:
      return 'Info';

    case PortfolioToastType.Contrast:
      return 'Info';

    case PortfolioToastType.Loading:
      return 'Settings';

    default:
      return this.getBasicIcon(data.context);
  }
}

  protected actionSeverity(action: PortfolioToastAction): ButtonSeverity | undefined {
    if (action.variant === 'danger' || this.isDangerAction(action)) {
      return 'danger';
    }

    return undefined;
  }

  protected actionVariant(action: PortfolioToastAction): 'outlined' | undefined {
    if (action.variant === 'danger' || this.isDangerAction(action)) {
      return undefined;
    }

    return undefined;
  }

  protected formattedMessage(message: string): string {
    return message.replace(/\{\{(.*?)\}\}/g, (_, captured: string) => {
      const clean = captured.trim();

      return `<strong>${clean}</strong>`;
    });
  }

  protected toastDuration(message: PortfolioPrimeToastMessage): string {
    const data = this.data(message);

    return `${data.duration ?? 4000}ms`;
  }

  private isDangerAction(action: PortfolioToastAction): boolean {
    return /eliminar|borrar|delete/i.test(action.label);
  }

  private getBasicIcon(context?: 'view' | 'edit' | 'create'): string {
    switch (context) {
      case 'edit':
        return 'Edit';

      case 'create':
        return 'Add';

      case 'view':
      default:
        return 'Info';
    }
  }
}
