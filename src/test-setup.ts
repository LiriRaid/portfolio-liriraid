import '@angular/compiler';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { LUCIDE_ICONS } from '@lucide/angular';
import { PORTFOLIO_LUCIDE_ICONS } from '@core/common/icons/lucide-icons.provider';

// jsdom does not implement these browser APIs that components use at
// construction/render time. Provide minimal no-op polyfills so component
// creation does not throw in the test environment.
if (typeof window !== 'undefined') {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }

  if (typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }

  if (typeof window.IntersectionObserver === 'undefined') {
    window.IntersectionObserver = class {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds: ReadonlyArray<number> = [];
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
  }
}

setupTestBed({
  zoneless: true,
  providers: [
    {
      provide: LUCIDE_ICONS,
      useExisting: PORTFOLIO_LUCIDE_ICONS,
    },
  ],
});
