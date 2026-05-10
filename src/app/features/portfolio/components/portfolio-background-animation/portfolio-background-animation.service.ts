import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PortfolioBackgroundAnimationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'portfolio-background-animation-enabled';

  readonly enabled = signal(true);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedValue = localStorage.getItem(this.storageKey);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (storedValue === null) {
      this.enabled.set(!prefersReducedMotion);
      return;
    }

    this.enabled.set(storedValue === 'true');
  }

  toggle(): void {
    this.setEnabled(!this.enabled());
  }

  setEnabled(value: boolean): void {
    this.enabled.set(value);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.storageKey, String(value));
  }
}
