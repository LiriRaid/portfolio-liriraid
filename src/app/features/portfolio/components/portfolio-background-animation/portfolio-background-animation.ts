import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewChild, afterNextRender, effect, inject } from '@angular/core';
import { gsap } from 'gsap';
import { PortfolioBackgroundAnimationService } from './portfolio-background-animation.service';

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

@Component({
  selector: 'portfolio-background-animation',
  standalone: true,
  templateUrl: './portfolio-background-animation.html',
  styleUrl: './portfolio-background-animation.css',
  host: {
    '[class.is-disabled]': '!enabled()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioBackgroundAnimation {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly animationService = inject(PortfolioBackgroundAnimationService);

  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  protected readonly enabled = this.animationService.enabled;

  private ctx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private nodes: CircuitNode[] = [];
  private lines: CircuitLine[] = [];
  private width = 0;
  private height = 0;
  private dpr = 1;
  private time = 0;
  private initialized = false;
  private scrollRoot: HTMLElement | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.initialize();
    });

    effect(() => {
      if (!this.initialized || !this.ctx) {
        return;
      }

      if (!this.enabled()) {
        this.clear();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.destroy();
    });
  }

  private initialize(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) {
      return;
    }

    this.ctx = ctx;
    this.scrollRoot = document.querySelector<HTMLElement>('.layout-scroll-root');

    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(document.documentElement);

    gsap.ticker.add(this.render);
    this.initialized = true;
  }

  private resize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, Math.round(rect.width));
    this.height = Math.max(1, Math.round(rect.height));

    canvas.width = Math.round(this.width * this.dpr);
    canvas.height = Math.round(this.height * this.dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;

    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.buildCircuit();
  }

  private buildCircuit(): void {
    const columns = Math.max(5, Math.round(this.width / 220));
    const rows = Math.max(5, Math.round(this.height / 160));
    const gapX = this.width / (columns + 1);
    const gapY = this.height / (rows + 1);

    this.nodes = [];
    this.lines = [];

    for (let y = 1; y <= rows; y++) {
      for (let x = 1; x <= columns; x++) {
        const offsetX = Math.sin((x + y) * 1.7) * gapX * 0.16;
        const offsetY = Math.cos((x - y) * 1.3) * gapY * 0.14;

        this.nodes.push({
          x: x * gapX + offsetX,
          y: y * gapY + offsetY,
          pulse: Math.random(),
        });
      }
    }

    for (let index = 0; index < this.nodes.length; index++) {
      const node = this.nodes[index];
      const right = this.nodes[index + 1];
      const bottom = this.nodes[index + columns];

      if (right && Math.abs(right.y - node.y) < gapY * 0.8) {
        this.lines.push({ from: node, to: right, delay: Math.random() });
      }

      if (bottom) {
        this.lines.push({ from: node, to: bottom, delay: Math.random() });
      }
    }
  }

  private readonly render = (): void => {
    if (!this.ctx || !this.enabled()) {
      return;
    }

    this.time += gsap.ticker.deltaRatio(60) * 0.01;

    const ctx = this.ctx;
    const primary = this.getCssColor('--app-text-primary');
    const muted = this.getCssColor('--app-text-muted');
    const scrollProgress = this.getScrollProgress();

    ctx.clearRect(0, 0, this.width, this.height);

    this.drawAmbientGlow(ctx, primary, scrollProgress);
    this.drawCircuitLines(ctx, muted, primary);
    this.drawCircuitNodes(ctx, primary);
    this.drawPackets(ctx, primary);
  };

  private drawAmbientGlow(ctx: CanvasRenderingContext2D, primary: string, scrollProgress: number): void {
    const x = this.width * (0.18 + scrollProgress * 0.64);
    const y = this.height * (0.22 + Math.sin(this.time * 0.7) * 0.12);
    const radius = Math.max(this.width, this.height) * 0.38;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, this.withAlpha(primary, 0.1));
    gradient.addColorStop(0.45, this.withAlpha(primary, 0.035));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawCircuitLines(ctx: CanvasRenderingContext2D, muted: string, primary: string): void {
    ctx.lineWidth = 1;

    for (const line of this.lines) {
      const alpha = 0.028 + Math.sin(this.time * 1.25 + line.delay * 8) * 0.01;

      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.strokeStyle = this.withAlpha(muted, alpha);
      ctx.stroke();

      if (line.delay > 0.72) {
        ctx.beginPath();
        ctx.moveTo(line.from.x, line.from.y);
        ctx.lineTo(line.to.x, line.to.y);
        ctx.strokeStyle = this.withAlpha(primary, 0.035);
        ctx.stroke();
      }
    }
  }

  private drawCircuitNodes(ctx: CanvasRenderingContext2D, primary: string): void {
    for (const node of this.nodes) {
      const pulse = 0.5 + Math.sin(this.time * 1.6 + node.pulse * 10) * 0.5;
      const radius = 1 + pulse * 1.05;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.withAlpha(primary, 0.065 + pulse * 0.055);
      ctx.fill();
    }
  }

  private drawPackets(ctx: CanvasRenderingContext2D, primary: string): void {
    for (let index = 0; index < this.lines.length; index += 4) {
      const line = this.lines[index];
      const progress = (this.time * 0.16 + line.delay) % 1;
      const fade = Math.sin(progress * Math.PI);

      const x = line.from.x + (line.to.x - line.from.x) * progress;
      const y = line.from.y + (line.to.y - line.from.y) * progress;

      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = this.withAlpha(primary, 0.2 * fade);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 5.2, 0, Math.PI * 2);
      ctx.fillStyle = this.withAlpha(primary, 0.045 * fade);
      ctx.fill();
    }
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

  private destroy(): void {
    gsap.ticker.remove(this.render);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.clear();
  }
}
