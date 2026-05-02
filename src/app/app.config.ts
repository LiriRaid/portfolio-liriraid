import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LUCIDE_ICONS } from '@lucide/angular';
import { PORTFOLIO_LUCIDE_ICONS } from '@core/common/lucide-icons.provider';
import { createPortfolioAuraPreset } from '@core/theme/portfolio-aura-preset';
import { getStoredPrimaryColorKey, getStoredSurfaceColorKey } from '@core/theme/theme-preferences.storage';
import { getPrimaryColor, getSurfaceColor } from '@core/theme/theme-palettes';
import { provideThemeInitializer } from '@core/theme/theme.initializer';

const portfolioAuraPreset = createPortfolioAuraPreset(
  getPrimaryColor(getStoredPrimaryColorKey()).palette,
  getSurfaceColor(getStoredSurfaceColorKey()).palette
);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true }), withComponentInputBinding()),
    provideHttpClient(withInterceptors([])),
    provideThemeInitializer(),
    provideClientHydration(withEventReplay()),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: portfolioAuraPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'base, components, primeng, utilities',
          }
        }
      }
    }),
    {
      provide: LUCIDE_ICONS,
      useExisting: PORTFOLIO_LUCIDE_ICONS,
    },
  ],
};
