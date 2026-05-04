import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { updatePrimaryPalette, updateSurfacePalette } from '@primeuix/themes';

import { DEFAULT_PRIMARY_COLOR_KEY, DEFAULT_SURFACE_COLOR_KEY, getPrimaryColor, getSurfaceColor } from './theme-palettes';

import { getStoredPrimaryColorKey, getStoredSurfaceColorKey, getStoredThemeMode, setStoredPrimaryColorKey, setStoredSurfaceColorKey, setStoredThemeMode } from './theme-preferences.storage';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly rootElement = this.document.documentElement;
  private readonly faviconSourceUrl = 'favicon.svg';

  private faviconSvgPromise: Promise<string> | null = null;
  private prethemeRemovalScheduled = false;

  readonly mode = signal<ThemeMode>('dark');
  readonly primaryColorKey = signal<string>(DEFAULT_PRIMARY_COLOR_KEY);
  readonly surfaceColorKey = signal<string>(DEFAULT_SURFACE_COLOR_KEY);

  initialize(): void {
    this.initMode();
    this.initColor();
    this.initSurface();

    if (this.isBrowser) {
      this.schedulePrethemeRemoval();
    }
  }

  // ── Mode ──────────────────────────────────────────────

  toggleMode(): void {
    this.setMode(this.mode() === 'dark' ? 'light' : 'dark');
  }

  setMode(mode: ThemeMode): void {
    this.applyMode(mode, true);
    setStoredThemeMode(mode);
  }

  // ── Primary color ─────────────────────────────────────

  applyColor(key: string): void {
    const color = getPrimaryColor(key);

    this.primaryColorKey.set(color.key);
    setStoredPrimaryColorKey(color.key);

    if (!this.isBrowser) return;

    updatePrimaryPalette(color.palette);

    this.rootElement.dataset['primaryColor'] = color.key;

    this.updateFavicon(color.palette['500']);
  }

  // ── Surface color ─────────────────────────────────────

  applySurface(key: string): void {
    const color = getSurfaceColor(key);

    this.surfaceColorKey.set(color.key);
    setStoredSurfaceColorKey(color.key);

    if (!this.isBrowser) return;

    updateSurfacePalette(color.palette);

    this.rootElement.dataset['surfaceColor'] = color.key;
  }

  // ── Private ───────────────────────────────────────────

  private initMode(): void {
    const saved = getStoredThemeMode();

    const resolved: ThemeMode = saved ? saved : globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    this.applyMode(resolved, false);
  }

  private initColor(): void {
    this.applyColor(getStoredPrimaryColorKey());
  }

  private initSurface(): void {
    this.applySurface(getStoredSurfaceColorKey());
  }

  private applyMode(mode: ThemeMode, withTransitionGuard: boolean): void {
    this.mode.set(mode);

    if (!this.isBrowser) return;

    if (withTransitionGuard) {
      this.rootElement.classList.add('theme-switching');
    }

    this.rootElement.classList.toggle('dark', mode === 'dark');

    if (withTransitionGuard) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.rootElement.classList.remove('theme-switching');
        });
      });
    }
  }

  private schedulePrethemeRemoval(): void {
    if (this.prethemeRemovalScheduled) return;

    this.prethemeRemovalScheduled = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.document.getElementById('portfolio-pretheme')?.remove();
      });
    });
  }

  private updateFavicon(color: string): void {
    if (typeof globalThis.fetch !== 'function' || !this.isHexColor(color)) return;

    void this.loadFaviconSvg()
      .then((svg) => {
        const favicon = this.ensureFaviconLink();
        favicon.type = 'image/svg+xml';
        favicon.href = this.createTintedFaviconHref(svg, color);
      })
      .catch(() => {
        // Mantengo tu comportamiento actual.
        // this.ensureFaviconLink().href = this.faviconSourceUrl;
      });
  }

  private loadFaviconSvg(): Promise<string> {
    if (!this.faviconSvgPromise) {
      this.faviconSvgPromise = fetch(this.faviconSourceUrl).then((response) => {
        if (!response.ok) {
          throw new Error('Could not load favicon SVG.');
        }

        return response.text();
      });
    }

    return this.faviconSvgPromise;
  }

  private createTintedFaviconHref(svg: string, color: string): string {
    const filter = `
<filter id="favicon-primary-tint" color-interpolation-filters="sRGB">
  <feFlood flood-color="${color}" result="tint"/>
  <feBlend in="tint" in2="SourceGraphic" mode="color" result="colored"/>
  <feComposite in="colored" in2="SourceAlpha" operator="in"/>
</filter>`;

    const withFilter = svg.replace('</defs>', `${filter}</defs>`);
    const withTint = withFilter.replace('<g id="surface2">', '<g id="surface2" filter="url(#favicon-primary-tint)">');

    return `data:image/svg+xml,${encodeURIComponent(withTint)}`;
  }

  private ensureFaviconLink(): HTMLLinkElement {
    const current = this.document.querySelector<HTMLLinkElement>("link[rel~='icon']");

    if (current) return current;

    const link = this.document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = this.faviconSourceUrl;

    this.document.head.appendChild(link);

    return link;
  }

  private isHexColor(color: string): boolean {
    return /^#(?:[\da-f]{3}){1,2}$/i.test(color.trim());
  }
}
