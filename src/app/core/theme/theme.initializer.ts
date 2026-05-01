import { EnvironmentProviders, inject, provideEnvironmentInitializer } from '@angular/core';
import { ThemeService } from './theme.service';

export const provideThemeInitializer = (): EnvironmentProviders =>
  provideEnvironmentInitializer(() => inject(ThemeService).initialize());
