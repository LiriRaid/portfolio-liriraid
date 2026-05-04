import { Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

import { PortfolioToastAction, PortfolioToastData, PortfolioToastType, ToastPosition } from '@shared/components/portfolio-toast/portfolio-toast.types';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly toastKey = 'portfolio-toast';

  readonly toastPosition = signal<ToastPosition>('top-right');

  constructor(private readonly messageService: MessageService) {}

  showSuccess(title: string, message: string, action?: PortfolioToastAction, duration?: number, position: ToastPosition = 'top-right'): void {
    this.showAlert(title, message, PortfolioToastType.Success, action, duration, undefined, false, position);
  }

  showInfo(title: string, message: string, action?: PortfolioToastAction, duration?: number, position: ToastPosition = 'top-right'): void {
    this.showAlert(title, message, PortfolioToastType.Info, action, duration, undefined, false, position);
  }

  showWarning(title: string, message: string, action?: PortfolioToastAction, duration?: number, persistent = false, position: ToastPosition = 'top-right'): void {
    this.showAlert(title, message, PortfolioToastType.Warning, action, duration, undefined, persistent, position);
  }

  showError(title: string, message: string, action?: PortfolioToastAction, duration?: number, position: ToastPosition = 'top-right'): void {
    this.showAlert(title, message, PortfolioToastType.Error, action, duration, undefined, false, position);
  }

  showSecondary(title: string, message: string, action?: PortfolioToastAction, duration?: number, position: ToastPosition = 'top-right'): void {
    this.showAlert(title, message, PortfolioToastType.Secondary, action, duration, undefined, false, position);
  }

  showContrast(title: string, message: string, action?: PortfolioToastAction, duration?: number, position: ToastPosition = 'top-right'): void {
    this.showAlert(title, message, PortfolioToastType.Contrast, action, duration, undefined, false, position);
  }

  showLoading(title: string, message: string, action?: PortfolioToastAction, duration?: number, position: ToastPosition = 'top-right'): void {
    this.showAlert(title, message, PortfolioToastType.Loading, action, duration, undefined, true, position);
  }

  showBasic(title: string, message: string, action?: PortfolioToastAction, duration?: number, context?: 'view' | 'edit' | 'create', position: ToastPosition = 'top-right'): void {
    this.showAlert(title, message, PortfolioToastType.Info, action, duration, context, false, position);
  }

  clear(): void {
    this.messageService.clear(this.toastKey);
  }

  private showAlert(title: string, message: string, type: PortfolioToastType, action?: PortfolioToastAction, duration?: number, context?: 'view' | 'edit' | 'create', persistent = false, position: ToastPosition = 'top-right'): void {
    this.toastPosition.set(position);

    const data: PortfolioToastData = {
      type,
      title,
      message,
      action,
      duration: duration ?? this.getDefaultDuration(type),
      context,
      persistent,
      position,
    };

    this.messageService.add({
      key: this.toastKey,
      severity: this.toPrimeSeverity(type),
      summary: title,
      detail: message,
      life: persistent ? undefined : data.duration,
      sticky: persistent,
      closable: false,
      data,
    });
  }

  private toPrimeSeverity(type: PortfolioToastType): string {
    if (type === PortfolioToastType.Loading) {
      return 'secondary';
    }

    return type;
  }

  private getDefaultDuration(type: PortfolioToastType): number {
    switch (type) {
      case PortfolioToastType.Error:
        return 6000;

      case PortfolioToastType.Warning:
        return 5000;

      case PortfolioToastType.Success:
      case PortfolioToastType.Info:
      case PortfolioToastType.Secondary:
      case PortfolioToastType.Contrast:
      case PortfolioToastType.Loading:
      default:
        return 4000;
    }
  }
}
