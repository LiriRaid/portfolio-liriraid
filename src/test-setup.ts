import '@angular/compiler';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { LUCIDE_ICONS } from '@lucide/angular';
import { PORTFOLIO_LUCIDE_ICONS } from '@core/common/icons/lucide-icons.provider';

setupTestBed({
  zoneless: true,
  providers: [
    {
      provide: LUCIDE_ICONS,
      useExisting: PORTFOLIO_LUCIDE_ICONS,
    },
  ],
});
