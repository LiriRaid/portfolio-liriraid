import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { LUCIDE_ICONS } from '@lucide/angular';
import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { PORTFOLIO_LUCIDE_ICONS } from '@core/common/icons/lucide-icons.provider';
import { provideI18nInitializer } from '@core/i18n';
import { createPortfolioAuraPreset } from '@core/theme/portfolio-aura-preset';
import { getStoredPrimaryColorKey, getStoredSurfaceColorKey } from '@core/theme/theme-preferences.storage';
import { getPrimaryColor, getSurfaceColor } from '@core/theme/theme-palettes';
import { provideThemeInitializer } from '@core/theme/theme.initializer';

const portfolioAuraPreset = createPortfolioAuraPreset(getPrimaryColor(getStoredPrimaryColorKey()).palette, getSurfaceColor(getStoredSurfaceColorKey()).palette);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true }), withComponentInputBinding()),

    provideClientHydration(withEventReplay(), withIncrementalHydration()),
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
          },
        },
      },
    }),
    provideThemeInitializer(),
    provideI18nInitializer(),
    MessageService,
    {
      provide: LUCIDE_ICONS,
      useExisting: PORTFOLIO_LUCIDE_ICONS,
    },
  ],
};
