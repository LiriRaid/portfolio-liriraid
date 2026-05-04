import { definePreset } from '@primeuix/themes';
import AuraBase from '@primeuix/themes/aura/base';
import AuraButton from '@primeuix/themes/aura/button';
import AuraDivider from '@primeuix/themes/aura/divider';
import AuraPopover from '@primeuix/themes/aura/popover';
import AuraRipple from '@primeuix/themes/aura/ripple';
import AuraToast from '@primeuix/themes/aura/toast';

import { DEFAULT_PRIMARY_PALETTE, DEFAULT_SURFACE_PALETTE } from './theme-palettes';

const portfolioAuraBase = {
  ...AuraBase,
  components: {
    button: AuraButton,
    divider: AuraDivider,
    popover: AuraPopover,
    ripple: AuraRipple,
    toast: AuraToast,
  },
};

export const createPortfolioAuraPreset = (primaryPalette: Record<string, string> = DEFAULT_PRIMARY_PALETTE, surfacePalette: Record<string, string> = DEFAULT_SURFACE_PALETTE) =>
  definePreset(portfolioAuraBase, {
    semantic: {
      primary: primaryPalette,
      colorScheme: {
        light: {
          surface: surfacePalette,
          primary: {
            color: '{primary.700}',
            inverseColor: '#ffffff',
            hoverColor: '{primary.800}',
            activeColor: '{primary.900}',
          },
          highlight: {
            background: '{primary.100}',
            focusBackground: '{primary.200}',
            color: '{primary.900}',
            focusColor: '{primary.800}',
          },
        },
        dark: {
          surface: surfacePalette,
          primary: {
            color: '{primary.600}',
            inverseColor: '#ffffff',
            hoverColor: '{primary.700}',
            activeColor: '{primary.800}',
          },
          highlight: {
            background: 'rgba(255, 255, 255, 0.15)',
            focusBackground: 'rgba(255, 255, 255, 0.25)',
            color: '{primary.950}',
            focusColor: '#ffffff',
          },
        },
      },
    },
  });
