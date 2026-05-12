import { Injectable } from '@angular/core';
import type gsap from 'gsap';
import { getGsapSync, loadGsap } from '@shared/utils/gsap-loader';

interface HeaderMorphOptions {
  header: HTMLElement;
  scrollTop: number;
  hostWidth: number;
  headerHeight: number;
  isMobile: boolean;
  onFloatingChange: (floating: boolean) => void;
}

type HeaderMorphConfig = {
  readonly widthRatio: number;
  readonly maxWidth: number;
  readonly targetHeight: number;
  readonly targetY: number;
  readonly shadowOpacity: number;
};

@Injectable()
export class HeaderService {
  private headerMorphFrameId: number | null = null;
  private menuAnimation?: gsap.core.Tween;

  private readonly morphStart = 0;
  private readonly morphEnd = 220;

  private readonly desktopMorph: HeaderMorphConfig = {
    widthRatio: 0.92,
    maxWidth: 980,
    targetHeight: 56,
    targetY: 14,
    shadowOpacity: 0.28,
  };

  private readonly mobileMorph: HeaderMorphConfig = {
    widthRatio: 0.96,
    maxWidth: Number.POSITIVE_INFINITY,
    targetHeight: 44,
    targetY: 8,
    shadowOpacity: 0.22,
  };

  scheduleHeaderMorph(options: HeaderMorphOptions): void {
    this.cancelHeaderMorphFrame();

    this.headerMorphFrameId = requestAnimationFrame(() => {
      void this.updateHeaderMorph(options);
      this.headerMorphFrameId = null;
    });
  }

  async openMobileMenu(nav: HTMLElement): Promise<void> {
    const gsap = await loadGsap();
    this.menuAnimation?.kill();

    gsap.set(nav, {
      clipPath: 'inset(0 0 100% 0)',
      opacity: 0,
      y: -8,
    });

    this.menuAnimation = gsap.to(nav, {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      y: 0,
      duration: 0.38,
      ease: 'power3.out',
    });
  }

  async closeMobileMenu(nav: HTMLElement, onComplete: () => void): Promise<void> {
    const gsap = await loadGsap();
    this.menuAnimation?.kill();

    this.menuAnimation = gsap.to(nav, {
      clipPath: 'inset(0 0 100% 0)',
      opacity: 0,
      y: -8,
      duration: 0.28,
      ease: 'power2.inOut',
      onComplete,
    });
  }

  resetHeaderInlineStyles(header: HTMLElement): void {
    const gsap = getGsapSync();

    if (gsap) {
      gsap.set(header, {
        clearProps: 'width,height,transform,y,borderTopLeftRadius,borderTopRightRadius,borderBottomLeftRadius,borderBottomRightRadius,borderTopWidth,borderLeftWidth,borderRightWidth,borderBottomWidth,borderStyle,borderColor,boxShadow',
      });

      return;
    }

    const props = ['width', 'height', 'transform', 'y', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth', 'borderBottomWidth', 'borderStyle', 'borderColor', 'boxShadow'];

    for (const prop of props) {
      header.style.removeProperty(prop);
    }
  }

  destroy(): void {
    this.cancelHeaderMorphFrame();
    this.menuAnimation?.kill();
  }

  private async updateHeaderMorph({ header, scrollTop, hostWidth, headerHeight, isMobile, onFloatingChange }: HeaderMorphOptions): Promise<void> {
    const gsap = await loadGsap();

    const progress = this.clamp((scrollTop - this.morphStart) / (this.morphEnd - this.morphStart), 0, 1);
    const easedProgress = gsap.parseEase('sine.inOut')(progress);
    const shouldFloat = progress > 0.45;

    onFloatingChange(shouldFloat);

    if (progress === 0) {
      this.resetHeaderInlineStyles(header);
      return;
    }

    const config = isMobile ? this.mobileMorph : this.desktopMorph;
    const floatingWidth = Math.min(hostWidth * config.widthRatio, config.maxWidth);

    const width = this.lerp(hostWidth, floatingWidth, easedProgress);
    const height = this.lerp(headerHeight, config.targetHeight, easedProgress);
    const y = this.lerp(0, config.targetY, easedProgress);
    const radius = this.lerp(0, 999, easedProgress);
    const sideBorderWidth = this.lerp(0, 1, easedProgress);
    const shadowOpacity = this.lerp(0, config.shadowOpacity, easedProgress);

    gsap.set(header, {
      width,
      height,
      y,

      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,

      borderTopWidth: sideBorderWidth,
      borderLeftWidth: sideBorderWidth,
      borderRightWidth: sideBorderWidth,
      borderBottomWidth: 1,
      borderStyle: 'solid',
      borderColor: 'var(--app-border-color)',

      boxShadow: `0 16px 42px -16px rgba(0, 0, 0, ${shadowOpacity})`,
    });
  }

  private cancelHeaderMorphFrame(): void {
    if (this.headerMorphFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.headerMorphFrameId);
    this.headerMorphFrameId = null;
  }

  private lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
