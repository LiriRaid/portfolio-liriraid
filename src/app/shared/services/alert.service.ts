import { Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

import { PortfolioToastAction, PortfolioToastData, PortfolioToastType, ToastPosition } from '@shared/components/portfolio-toast/portfolio-toast.types';

type ToastMessage = Parameters<MessageService['add']>[0];

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly toastKey = 'portfolio-toast';

  readonly toastPosition = signal<ToastPosition>('top-right');

  // Latches true on the first toast request so the @defer downloads the toast
  // chunk once (lazy) and keeps it ready for instant re-mounts afterwards.
  readonly toastRequested = signal(false);

  // Drives the @if that creates/destroys the toast instance: true while there
  // are visible alerts, false when none remain. The toast is never mounted at
  // startup and is destroyed once the last alert is closed/expires.
  readonly toastActive = signal(false);

  // Number of alerts currently on screen; when it reaches 0 the toast unmounts.
  private activeCount = 0;

  // Messages requested before the toast component has mounted/subscribed are
  // buffered here and flushed by markToastReady(), so none are lost.
  private toastReady = false;
  private readonly pending: ToastMessage[] = [];
  private destroyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly messageService: MessageService) {}

  /** Called by <portfolio-toast> once it has mounted and subscribed. */
  markToastReady(): void {
    this.toastReady = true;

    if (this.pending.length === 0) {
      return;
    }

    for (const message of this.pending) {
      this.messageService.add(message);
    }

    this.pending.length = 0;
  }

  /** Called by <portfolio-toast> when a message closes (manual or by its life). */
  notifyToastClosed(): void {
    this.activeCount = Math.max(0, this.activeCount - 1);

    if (this.activeCount === 0) {
      this.teardownToast();
    }
  }

  private teardownToast(): void {
    this.pending.length = 0;

    this.destroyTimer = setTimeout(() => {
      this.toastReady = false;
      this.toastActive.set(false);
      this.destroyTimer = null;
    }, 300);
  }

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
    this.activeCount = 0;
    this.teardownToast();
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

    this.enqueue({
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

  private enqueue(message: ToastMessage): void {
    if (this.destroyTimer !== null) {
      clearTimeout(this.destroyTimer);
      this.destroyTimer = null;
    }

    // Mount the deferred toast on demand, then either show now or buffer until ready.
    this.activeCount++;
    this.toastRequested.set(true);
    this.toastActive.set(true);

    if (this.toastReady) {
      this.messageService.add(message);
      return;
    }

    this.pending.push(message);
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
