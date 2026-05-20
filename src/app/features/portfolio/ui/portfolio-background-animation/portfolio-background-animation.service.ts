import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

type CircuitNode = {
  x: number;
  y: number;
  pulse: number;
};

type CircuitLine = {
  from: CircuitNode;
  to: CircuitNode;
  delay: number;
};

type BackgroundIntensity = {
  glowStart: number;
  glowMid: number;
  lineBase: number;
  linePulse: number;
  lineAccent: number;
  nodeBase: number;
  nodePulse: number;
  packet: number;
  packetGlow: number;
};

@Injectable({
  providedIn: 'root',
})
export class PortfolioBackgroundAnimationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'portfolio-background-animation-enabled';

  readonly enabled = signal(false);

  private canvas: HTMLCanvasElement | null = null;
  private hostElement: HTMLElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private scrollRoot: HTMLElement | null = null;

  private nodes: CircuitNode[] = [];
  private lines: CircuitLine[] = [];
  private width = 0;
  private height = 0;
  private dpr = 1;
  private time = 0;
  private initialized = false;
  private resizeFrameId: number | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private cachedPrimaryColor = '#ffffff';
  private cachedMutedColor = '#ffffff';
  private colorCacheFrames = 0;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const storedValue = localStorage.getItem(this.storageKey);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.enabled.set(storedValue === null ? !prefersReducedMotion : storedValue === 'true');
  }

  initialize(canvas: HTMLCanvasElement, hostElement: HTMLElement): void {
    if (!this.isBrowser) {
      return;
    }

    this.destroy();

    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) {
      return;
    }

    this.canvas = canvas;
    this.hostElement = hostElement;
    this.ctx = ctx;
    this.scrollRoot = document.querySelector<HTMLElement>('.layout-scroll-root');

    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(document.documentElement);

    this.startAnimationLoop();
    this.initialized = true;

    if (!this.enabled()) {
      this.clear();
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
      this.renderFrame(delta);
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

  toggle(): void {
    this.setEnabled(!this.enabled());
  }

  setEnabled(value: boolean): void {
    this.enabled.set(value);

    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, String(value));

    if (value) {
      this.renderFrame(1 / 60);
    }
  }

  destroy(): void {
    this.stopAnimationLoop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.resizeFrameId !== null) {
      cancelAnimationFrame(this.resizeFrameId);
      this.resizeFrameId = null;
    }

    this.clear();

    this.canvas = null;
    this.hostElement = null;
    this.ctx = null;
    this.scrollRoot = null;
    this.nodes = [];
    this.lines = [];
    this.initialized = false;
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private scheduleResize(): void {
    if (this.resizeFrameId !== null) {
      return;
    }

    this.resizeFrameId = requestAnimationFrame(() => {
      this.resizeFrameId = null;
      this.resize();
    });
  }

  private resize(): void {
    if (!this.isBrowser || !this.canvas || !this.hostElement) {
      return;
    }

    const rect = this.hostElement.getBoundingClientRect();
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));

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

    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (sizeChanged || this.nodes.length === 0) {
      this.buildCircuit();
    }

    if (this.initialized && this.enabled()) {
      this.renderFrame(1 / 60);
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
          x: this.clamp(x * gapX + offsetX, 0, this.width),
          y: this.clamp(y * gapY + offsetY, 0, this.height),
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

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private renderFrame(deltaSeconds: number): void {
    if (!this.ctx || !this.initialized || !this.enabled()) {
      return;
    }

    this.time += deltaSeconds * 0.6;

    this.refreshThemeColors();
    const primary = this.cachedPrimaryColor;
    const muted = this.cachedMutedColor;
    const intensity = this.getIntensity();
    const scrollProgress = this.getScrollProgress();

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawAmbientGlow(primary, scrollProgress, intensity);
    this.drawCircuitLines(muted, primary, intensity);
    this.drawCircuitNodes(primary, intensity);
    this.drawPackets(primary, intensity);
  }

  private drawAmbientGlow(primary: string, scrollProgress: number, intensity: BackgroundIntensity): void {
    if (!this.ctx) {
      return;
    }

    const x = this.width * (0.18 + scrollProgress * 0.64);
    const y = this.height * (0.22 + Math.sin(this.time * 0.7) * 0.12);
    const radius = Math.max(this.width, this.height) * 0.38;

    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, this.withAlpha(primary, intensity.glowStart));
    gradient.addColorStop(0.45, this.withAlpha(primary, intensity.glowMid));
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawCircuitLines(muted: string, primary: string, intensity: BackgroundIntensity): void {
    if (!this.ctx) {
      return;
    }

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
  }

  private drawCircuitNodes(primary: string, intensity: BackgroundIntensity): void {
    if (!this.ctx) {
      return;
    }

    for (const node of this.nodes) {
      const pulse = 0.5 + Math.sin(this.time * 1.6 + node.pulse * 10) * 0.5;
      const radius = 1 + pulse * 1.05;

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.withAlpha(primary, intensity.nodeBase + pulse * intensity.nodePulse);
      this.ctx.fill();
    }
  }

  private drawPackets(primary: string, intensity: BackgroundIntensity): void {
    if (!this.ctx) {
      return;
    }

    for (let index = 0; index < this.lines.length; index += 4) {
      const line = this.lines[index];
      const progress = (this.time * 0.16 + line.delay) % 1;
      const fade = Math.sin(progress * Math.PI);

      const x = line.from.x + (line.to.x - line.from.x) * progress;
      const y = line.from.y + (line.to.y - line.from.y) * progress;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      this.ctx.fillStyle = this.withAlpha(primary, intensity.packet * fade);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(x, y, 5.2, 0, Math.PI * 2);
      this.ctx.fillStyle = this.withAlpha(primary, intensity.packetGlow * fade);
      this.ctx.fill();
    }
  }

  private getIntensity(): BackgroundIntensity {
    const isDark = document.documentElement.classList.contains('dark');

    if (isDark) {
      return {
        glowStart: 0.14,
        glowMid: 0.052,
        lineBase: 0.04,
        linePulse: 0.014,
        lineAccent: 0.052,
        nodeBase: 0.085,
        nodePulse: 0.075,
        packet: 0.26,
        packetGlow: 0.06,
      };
    }

    return {
      glowStart: 0.2,
      glowMid: 0.08,
      lineBase: 0.075,
      linePulse: 0.022,
      lineAccent: 0.085,
      nodeBase: 0.12,
      nodePulse: 0.095,
      packet: 0.34,
      packetGlow: 0.085,
    };
  }

  private getScrollProgress(): number {
    if (!this.scrollRoot) {
      return 0;
    }

    const max = this.scrollRoot.scrollHeight - this.scrollRoot.clientHeight;

    if (max <= 0) {
      return 0;
    }

    return Math.min(1, Math.max(0, this.scrollRoot.scrollTop / max));
  }

  private refreshThemeColors(): void {
    // getComputedStyle forces a style recalc; reading it every frame causes a
    // continuous forced reflow. The theme colors only change on theme toggle,
    // so refresh the cache at most ~every 30 frames (~0.5s, visually imperceptible).
    if (this.colorCacheFrames > 0) {
      this.colorCacheFrames--;
      return;
    }

    this.cachedPrimaryColor = this.getCssColor('--app-text-primary');
    this.cachedMutedColor = this.getCssColor('--app-text-muted');
    this.colorCacheFrames = 30;
  }

  private getCssColor(variableName: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim() || '#ffffff';
  }

  private withAlpha(color: string, alpha: number): string {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const value =
        hex.length === 3
          ? hex
              .split('')
              .map((char) => char + char)
              .join('')
          : hex;

      const red = Number.parseInt(value.slice(0, 2), 16);
      const green = Number.parseInt(value.slice(2, 4), 16);
      const blue = Number.parseInt(value.slice(4, 6), 16);

      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }

    if (color.startsWith('rgba(')) {
      return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
    }

    return color;
  }

  private clear(): void {
    this.ctx?.clearRect(0, 0, this.width, this.height);
  }
}
