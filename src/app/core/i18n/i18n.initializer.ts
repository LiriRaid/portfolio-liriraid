import { EnvironmentProviders, inject, provideEnvironmentInitializer } from '@angular/core';

import { I18nService } from './i18n.service';

export const provideI18nInitializer = (): EnvironmentProviders => provideEnvironmentInitializer(() => inject(I18nService).initialize());
