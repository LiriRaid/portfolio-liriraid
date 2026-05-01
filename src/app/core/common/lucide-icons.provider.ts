import { InjectionToken } from '@angular/core';
import { LucideIcons } from './lucide-icons';

/**
 * Token de inyección para el mapeo de iconos Lucide de Portfolio.
 */
export const PORTFOLIO_LUCIDE_ICONS = new InjectionToken<typeof LucideIcons>('PORTFOLIO_LUCIDE_ICONS', {
  providedIn: 'root',
  factory: () => LucideIcons,
});
