import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

import {
  DEFAULT_PRIMARY_COLOR_KEY,
  DEFAULT_SURFACE_COLOR_KEY,
  getPrimaryColor,
  getSurfaceColor,
} from '@core/theme/theme-palettes';

// ---------------------------------------------------------------------------
// Fallback-only types (used when OffscreenCanvas is not available)
// ---------------------------------------------------------------------------

type CircuitNode = { x: number; y: number; pulse: number };
type CircuitLine = { from: CircuitNode; to: CircuitNode; delay: number };
type BackgroundIntensity = {
  glowStart: number; glowMid: number; lineBase: number; linePulse: number;
  lineAccent: number; nodeBase: number; nodePulse: number; packet: number; packetGlow: number;
};

@Injectable({
  providedIn: 'root',
})
export class PortfolioBackgroundAnimationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'portfolio-background-animation-enabled';
  private readonly rootEnabledClass = 'portfolio-background-animation-enabled';

  readonly enabled = signal(false);

  // Shared state
  private canvas: HTMLCanvasElement | null = null;
  private scrollRoot: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private themeObserver: MutationObserver | null = null;
  private resizeFrameId: number | null = null;
  private scrollFrameId: number | null = null;
  private scrollProgress = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;

  // Worker path
  private worker: Worker | null = null;
  private readonly supportsOffscreen =
    typeof OffscreenCanvas !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    'transferControlToOffscreen' in HTMLCanvasElement.prototype;

  // Fallback path (main-thread canvas)
  private ctx: CanvasRenderingContext2D | null = null;
  private nodes: CircuitNode[] = [];
  private lines: CircuitLine[] = [];
  private time = 0;
  private initialized = false;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private cachedPrimaryColor = '#ffffff';
  private cachedMutedColor = '#ffffff';

  private readonly onScrollRootScroll = (): void => {
    this.scheduleScrollProgressUpdate();
  };

  private readonly onWindowResize = (): void => {
    this.scheduleResize();
    this.scheduleScrollProgressUpdate();
  };

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const storedValue = localStorage.getItem(this.storageKey);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enabled = storedValue === null ? !prefersReducedMotion : storedValue === 'true';

    this.enabled.set(enabled);
    this.syncRootEnabledClass(enabled);
  }

  initialize(canvas: HTMLCanvasElement, hostElement: HTMLElement): void {
    if (!this.isBrowser) {
      return;
    }

    this.destroy();

    this.canvas = canvas;
    this.scrollRoot = document.querySelector<HTMLElement>('.layout-scroll-root');

    this.setupListeners();

    if (this.supportsOffscreen) {
      this.initializeWorker(canvas);
    } else {
      this.initializeFallback(canvas, hostElement);
    }
  }

  toggle(): void {
    this.setEnabled(!this.enabled());
  }

  setEnabled(value: boolean): void {
    this.enabled.set(value);

    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, String(value));
    this.syncRootEnabledClass(value);

    if (this.worker) {
      this.worker.postMessage({ type: 'enabled', value });
      return;
    }

    if (value) {
      this.startAnimationLoop();
      this.renderFrameFallback(1 / 60);
      return;
    }

    this.stopAnimationLoop();
    this.clearFallback();
  }

  destroy(): void {
    if (!this.isBrowser) {
      return;
    }

    this.teardownListeners();

    if (this.resizeFrameId !== null) {
      cancelAnimationFrame(this.resizeFrameId);
      this.resizeFrameId = null;
    }

    if (this.scrollFrameId !== null) {
      cancelAnimationFrame(this.scrollFrameId);
      this.scrollFrameId = null;
    }

    if (this.worker) {
      this.worker.postMessage({ type: 'destroy' });
      this.worker.terminate();
      this.worker = null;
    } else {
      this.stopAnimationLoop();
      this.clearFallback();
      this.ctx = null;
    }

    this.canvas = null;
    this.scrollRoot = null;
    this.nodes = [];
    this.lines = [];
    this.initialized = false;
  }

  // ---------------------------------------------------------------------------
  // Worker path
  // ---------------------------------------------------------------------------

  private initializeWorker(canvas: HTMLCanvasElement): void {
    const offscreen = canvas.transferControlToOffscreen();

    const { primary, muted, isDark } = this.readThemeColors();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(window.innerWidth));
    const h = Math.max(1, Math.round(window.innerHeight));

    this.width = w;
    this.height = h;
    this.dpr = dpr;

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    this.worker = new Worker(
      new URL('./background-animation.worker', import.meta.url),
      { type: 'module' },
    );

    this.worker.postMessage(
      {
        type: 'init',
        canvas: offscreen,
        width: w,
        height: h,
        dpr,
        primary,
        muted,
        isDark,
        enabled: this.enabled(),
        scrollProgress: this.scrollProgress,
      },
      [offscreen],
    );
  }

  private resizeWorker(): void {
    if (!this.worker || !this.canvas) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(window.innerWidth));
    const h = Math.max(1, Math.round(window.innerHeight));

    if (dpr === this.dpr && w === this.width && h === this.height) {
      return;
    }

    this.dpr = dpr;
    this.width = w;
    this.height = h;

    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.worker.postMessage({ type: 'resize', width: w, height: h, dpr });
  }

  private updateThemeWorker(): void {
    if (!this.worker) {
      return;
    }

    const { primary, muted, isDark } = this.readThemeColors();
    this.worker.postMessage({ type: 'theme', primary, muted, isDark });
  }

  private updateScrollWorker(): void {
    if (!this.worker) {
      return;
    }

    this.worker.postMessage({ type: 'scroll', progress: this.scrollProgress });
  }

  // ---------------------------------------------------------------------------
  // Fallback path (main-thread canvas — identical to original behavior)
  // ---------------------------------------------------------------------------

  private initializeFallback(canvas: HTMLCanvasElement, _hostElement: HTMLElement): void {
    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) {
      return;
    }

    this.ctx = ctx;

    this.refreshThemeColors();
    this.resizeFallback();
    this.observeThemeChanges();

    this.initialized = true;

    if (this.enabled()) {
      this.startAnimationLoop();
    } else {
      this.clearFallback();
    }
  }

  private startAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    this.lastFrameTime = 0;

    const tick = (currentTime: number): void => {
      const delta = this.lastFrameTime ? (currentTime - this.lastFrameTime) / 1000 : 1 / 60;
      this.lastFrameTime = currentTime;
      this.renderFrameFallback(delta);
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopAnimationLoop(): void {
    if (this.animationFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  private resizeFallback(): void {
    if (!this.canvas || !this.ctx) {
      return;
    }

    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.round(window.innerWidth));
    const nextHeight = Math.max(1, Math.round(window.innerHeight));

    if (nextDpr === this.dpr && nextWidth === this.width && nextHeight === this.height) {
      return;
    }

    const sizeChanged = nextWidth !== this.width || nextHeight !== this.height;

    this.dpr = nextDpr;
    this.width = nextWidth;
    this.height = nextHeight;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (sizeChanged || this.nodes.length === 0) {
      this.buildCircuit();
    }

    if (this.initialized && this.enabled()) {
      this.renderFrameFallback(1 / 60);
    }
  }

  private buildCircuit(): void {
    const columns = Math.max(7, Math.round(this.width / 180));
    const rows = Math.max(6, Math.round(this.height / 145));
    const gapX = this.width / Math.max(1, columns - 1);
    const gapY = this.height / Math.max(1, rows - 1);

    this.nodes = [];
    this.lines = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const isEdgeX = x === 0 || x === columns - 1;
        const isEdgeY = y === 0 || y === rows - 1;
        const offsetX = isEdgeX ? 0 : Math.sin((x + y) * 1.7) * gapX * 0.12;
        const offsetY = isEdgeY ? 0 : Math.cos((x - y) * 1.3) * gapY * 0.1;

        this.nodes.push({
          x: Math.min(Math.max(x * gapX + offsetX, 0), this.width),
          y: Math.min(Math.max(y * gapY + offsetY, 0), this.height),
          pulse: Math.random(),
        });
      }
    }

    for (let index = 0; index < this.nodes.length; index++) {
      const node = this.nodes[index];
      const right = this.nodes[index + 1];
      const bottom = this.nodes[index + columns];

      if (right && index % columns !== columns - 1) {
        this.lines.push({ from: node, to: right, delay: Math.random() });
      }

      if (bottom) {
        this.lines.push({ from: node, to: bottom, delay: Math.random() });
      }
    }
  }

  private renderFrameFallback(deltaSeconds: number): void {
    if (!this.ctx || !this.initialized || !this.enabled()) {
      return;
    }

    this.time += deltaSeconds * 0.6;

    const primary = this.cachedPrimaryColor;
    const muted = this.cachedMutedColor;
    const intensity = this.getFallbackIntensity();

    this.ctx.clearRect(0, 0, this.width, this.height);

    const x = this.width * (0.18 + this.scrollProgress * 0.64);
    const y = this.height * (0.22 + Math.sin(this.time * 0.7) * 0.12);
    const radius = Math.max(this.width, this.height) * 0.38;
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, this.withAlpha(primary, intensity.glowStart));
    gradient.addColorStop(0.45, this.withAlpha(primary, intensity.glowMid));
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.lineWidth = 1;

    for (const line of this.lines) {
      const alpha = intensity.lineBase + Math.sin(this.time * 1.25 + line.delay * 8) * intensity.linePulse;

      this.ctx.beginPath();
      this.ctx.moveTo(line.from.x, line.from.y);
      this.ctx.lineTo(line.to.x, line.to.y);
      this.ctx.strokeStyle = this.withAlpha(muted, alpha);
      this.ctx.stroke();

      if (line.delay > 0.72) {
        this.ctx.beginPath();
        this.ctx.moveTo(line.from.x, line.from.y);
        this.ctx.lineTo(line.to.x, line.to.y);
        this.ctx.strokeStyle = this.withAlpha(primary, intensity.lineAccent);
        this.ctx.stroke();
      }
    }

    for (const node of this.nodes) {
      const pulse = 0.5 + Math.sin(this.time * 1.6 + node.pulse * 10) * 0.5;
      const nodeRadius = 1 + pulse * 1.05;

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.withAlpha(primary, intensity.nodeBase + pulse * intensity.nodePulse);
      this.ctx.fill();
    }

    for (let index = 0; index < this.lines.length; index += 4) {
      const line = this.lines[index];
      const progress = (this.time * 0.16 + line.delay) % 1;
      const fade = Math.sin(progress * Math.PI);
      const px = line.from.x + (line.to.x - line.from.x) * progress;
      const py = line.from.y + (line.to.y - line.from.y) * progress;

      this.ctx.beginPath();
      this.ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      this.ctx.fillStyle = this.withAlpha(primary, intensity.packet * fade);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(px, py, 5.2, 0, Math.PI * 2);
      this.ctx.fillStyle = this.withAlpha(primary, intensity.packetGlow * fade);
      this.ctx.fill();
    }
  }

  private getFallbackIntensity(): BackgroundIntensity {
    const isDark = document.documentElement.classList.contains('dark');

    if (isDark) {
      return { glowStart: 0.14, glowMid: 0.052, lineBase: 0.04, linePulse: 0.014, lineAccent: 0.052, nodeBase: 0.085, nodePulse: 0.075, packet: 0.26, packetGlow: 0.06 };
    }

    return { glowStart: 0.2, glowMid: 0.08, lineBase: 0.075, linePulse: 0.022, lineAccent: 0.085, nodeBase: 0.12, nodePulse: 0.095, packet: 0.34, packetGlow: 0.085 };
  }

  private clearFallback(): void {
    this.ctx?.clearRect(0, 0, this.width, this.height);
  }

  private observeThemeChanges(): void {
    this.themeObserver?.disconnect();
    this.themeObserver = new MutationObserver(() => {
      this.refreshThemeColors();

      if (this.enabled()) {
        this.renderFrameFallback(1 / 60);
      }
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-primary-color', 'data-surface-color'],
    });
  }

  private refreshThemeColors(): void {
    const { primary, muted } = this.readThemeColors();
    this.cachedPrimaryColor = primary;
    this.cachedMutedColor = muted;
  }

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  private setupListeners(): void {
    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(document.documentElement);
    this.scrollRoot?.addEventListener('scroll', this.onScrollRootScroll, { passive: true });
    window.addEventListener('resize', this.onWindowResize, { passive: true });

    if (this.supportsOffscreen) {
      this.themeObserver = new MutationObserver(() => this.updateThemeWorker());
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-primary-color', 'data-surface-color'],
      });
    }
  }

  private teardownListeners(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.themeObserver?.disconnect();
    this.themeObserver = null;
    this.scrollRoot?.removeEventListener('scroll', this.onScrollRootScroll);
    window.removeEventListener('resize', this.onWindowResize);
  }

  private scheduleResize(): void {
    if (this.resizeFrameId !== null) {
      return;
    }

    this.resizeFrameId = requestAnimationFrame(() => {
      this.resizeFrameId = null;

      if (this.worker) {
        this.resizeWorker();
      } else {
        this.resizeFallback();
      }
    });
  }

  private scheduleScrollProgressUpdate(): void {
    if (this.scrollFrameId !== null) {
      return;
    }

    this.scrollFrameId = requestAnimationFrame(() => {
      this.scrollFrameId = null;
      this.updateScrollProgress();
    });
  }

  private updateScrollProgress(): void {
    if (!this.scrollRoot) {
      this.scrollProgress = 0;
    } else {
      const max = window.innerHeight * 5;
      this.scrollProgress = max > 0 ? Math.min(1, Math.max(0, this.scrollRoot.scrollTop / max)) : 0;
    }

    if (this.worker) {
      this.updateScrollWorker();
    }
  }

  private readThemeColors(): { primary: string; muted: string; isDark: boolean } {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const primaryPalette = getPrimaryColor(root.dataset['primaryColor'] || localStorage.getItem('portfolio-primary-color') || DEFAULT_PRIMARY_COLOR_KEY);
    const surfacePalette = getSurfaceColor(root.dataset['surfaceColor'] || localStorage.getItem('portfolio-surface-color') || DEFAULT_SURFACE_COLOR_KEY);

    return {
      primary: primaryPalette.palette[isDark ? '500' : '700'],
      muted: surfacePalette.palette[isDark ? '200' : '600'],
      isDark,
    };
  }

  private syncRootEnabledClass(enabled: boolean): void {
    document.documentElement.classList.toggle(this.rootEnabledClass, enabled);
  }

  private withAlpha(color: string, alpha: number): string {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const value = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      const r = Number.parseInt(value.slice(0, 2), 16);
      const g = Number.parseInt(value.slice(2, 4), 16);
      const b = Number.parseInt(value.slice(4, 6), 16);

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }

    if (color.startsWith('rgba(')) {
      return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
    }

    return color;
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
