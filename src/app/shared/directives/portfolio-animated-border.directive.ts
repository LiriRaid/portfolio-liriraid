import { isPlatformBrowser } from '@angular/common';
import { Directive, DestroyRef, ElementRef, HostBinding, HostListener, Input, PLATFORM_ID, inject } from '@angular/core';
import type gsap from 'gsap';
import { getGsapSync, loadGsap } from '@shared/utils/gsap-loader';

type GsapTween = gsap.core.Tween;

@Directive({
  selector: '[portfolioAnimatedBorder]',
  standalone: true,
  host: {
    class: 'portfolio-animated-border',
  },
})
export class PortfolioAnimatedBorderDirective {
  private static sharedAngle = 0;
  private static instances = new Set<PortfolioAnimatedBorderDirective>();
  private static activeUncontrolledInstance?: PortfolioAnimatedBorderDirective;

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private tween?: GsapTween;
  private fadeTween?: GsapTween;

  private active = false;
  private controlled = false;
  private wantsAnimation = false;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchPointerId: number | null = null;
  private touchMoved = false;

  private readonly tapMoveTolerance = 10;

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly reduceMotion = this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly isTouchLike = this.isBrowser && window.matchMedia('(hover: none), (pointer: coarse)').matches;

  @HostBinding('class.portfolio-animated-border--active')
  protected get activeClass(): boolean {
    return this.active;
  }

  @Input()
  set portfolioAnimatedBorderActive(value: boolean) {
    this.controlled = true;

    if (value === this.active) {
      return;
    }

    this.active = value;

    if (!this.canAnimate()) {
      return;
    }

    if (!this.isTouchLike) {
      if (!value) {
        this.stopAnimation(true);
      }

      return;
    }

    if (value) {
      this.startAnimation();
      return;
    }

    this.stopAnimation(true);
  }

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    PortfolioAnimatedBorderDirective.instances.add(this);

    const element = this.elementRef.nativeElement;
    element.style.setProperty('--portfolio-border-angle', `${PortfolioAnimatedBorderDirective.sharedAngle}deg`);
    element.style.setProperty('--portfolio-border-opacity', '0');

    this.destroyRef.onDestroy(() => {
      PortfolioAnimatedBorderDirective.instances.delete(this);

      if (PortfolioAnimatedBorderDirective.activeUncontrolledInstance === this) {
        PortfolioAnimatedBorderDirective.activeUncontrolledInstance = undefined;
      }

      this.killAnimations();
    });
  }

  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    if (!this.canAnimate() || this.isTouchLike) {
      return;
    }

    this.startAnimation();
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    if (!this.canAnimate() || this.isTouchLike) {
      return;
    }

    this.stopAnimation();
  }

  @HostListener('pointerdown', ['$event'])
  protected onPointerDown(event: PointerEvent): void {
    if (!this.shouldHandleTouch(event)) {
      return;
    }

    if (!event.isPrimary) {
      PortfolioAnimatedBorderDirective.clearUncontrolledInstances();
      return;
    }

    this.touchPointerId = event.pointerId;
    this.touchStartX = event.clientX;
    this.touchStartY = event.clientY;
    this.touchMoved = false;
  }

  @HostListener('pointermove', ['$event'])
  protected onPointerMove(event: PointerEvent): void {
    if (!this.isCurrentTouch(event)) {
      return;
    }

    const movedX = Math.abs(event.clientX - this.touchStartX);
    const movedY = Math.abs(event.clientY - this.touchStartY);

    this.touchMoved = movedX > this.tapMoveTolerance || movedY > this.tapMoveTolerance;
  }

  @HostListener('pointerup', ['$event'])
  protected onPointerUp(event: PointerEvent): void {
    if (!this.isCurrentTouch(event)) {
      return;
    }

    const wasTap = !this.touchMoved;

    this.resetTouchState();

    if (!wasTap) {
      return;
    }

    this.activateUncontrolledInstance();
  }

  @HostListener('pointercancel', ['$event'])
  protected onPointerCancel(event: PointerEvent): void {
    if (this.touchPointerId !== event.pointerId) {
      return;
    }

    this.resetTouchState();
  }

  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!this.canAnimate() || !this.isTouchLike || !this.isTouchPointer(event)) {
      return;
    }

    if (!event.isPrimary) {
      PortfolioAnimatedBorderDirective.clearUncontrolledInstances();
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('.portfolio-animated-border')) {
      return;
    }

    PortfolioAnimatedBorderDirective.clearUncontrolledInstances();
  }

  private static clearUncontrolledInstances(except?: PortfolioAnimatedBorderDirective): void {
    PortfolioAnimatedBorderDirective.instances.forEach((instance) => {
      if (instance.controlled || instance === except) {
        return;
      }

      instance.setUncontrolledActive(false);
      instance.resetTouchState();
    });

    PortfolioAnimatedBorderDirective.activeUncontrolledInstance = except;
  }

  private activateUncontrolledInstance(): void {
    PortfolioAnimatedBorderDirective.clearUncontrolledInstances(this);
    PortfolioAnimatedBorderDirective.activeUncontrolledInstance = this;

    this.setUncontrolledActive(true);
  }

  private setUncontrolledActive(value: boolean): void {
    if (value === this.active) {
      return;
    }

    this.active = value;

    if (!this.canAnimate()) {
      return;
    }

    if (value) {
      this.startAnimation();
      return;
    }

    this.stopAnimation(true);
  }

  private startAnimation(): void {
    this.wantsAnimation = true;

    if (this.tween?.isActive()) {
      return;
    }

    void this.startAnimationAsync();
  }

  private async startAnimationAsync(): Promise<void> {
    const gsap = await loadGsap();

    if (!this.wantsAnimation) {
      return;
    }

    const element = this.elementRef.nativeElement;

    const state = {
      angle: PortfolioAnimatedBorderDirective.sharedAngle,
    };

    this.fadeTween?.kill();
    this.tween?.kill();

    gsap.set(element, {
      '--portfolio-border-opacity': 1,
      '--portfolio-border-angle': `${PortfolioAnimatedBorderDirective.sharedAngle}deg`,
    });

    this.tween = gsap.to(state, {
      angle: state.angle + 360,
      duration: 4.8,
      ease: 'none',
      repeat: -1,
      onUpdate: () => {
        const normalizedAngle = gsap.utils.wrap(0, 360, state.angle);

        PortfolioAnimatedBorderDirective.sharedAngle = normalizedAngle;
        element.style.setProperty('--portfolio-border-angle', `${normalizedAngle}deg`);
      },
    });
  }

  private stopAnimation(force = false): void {
    this.wantsAnimation = false;
    this.tween?.kill();
    this.tween = undefined;

    this.fadeTween?.kill();
    this.fadeTween = undefined;

    const element = this.elementRef.nativeElement;

    if (force) {
      element.style.setProperty('--portfolio-border-opacity', '0');
      return;
    }

    const gsap = getGsapSync();

    if (!gsap) {
      element.style.setProperty('--portfolio-border-opacity', '0');
      return;
    }

    this.fadeTween = gsap.to(element, {
      '--portfolio-border-opacity': 0,
      duration: 0.22,
      ease: 'power2.out',
    });
  }

  private killAnimations(): void {
    this.tween?.kill();
    this.fadeTween?.kill();

    this.tween = undefined;
    this.fadeTween = undefined;
  }

  private resetTouchState(): void {
    this.touchPointerId = null;
    this.touchMoved = false;
  }

  private isCurrentTouch(event: PointerEvent): boolean {
    return this.shouldHandleTouch(event) && this.touchPointerId === event.pointerId;
  }

  private shouldHandleTouch(event: PointerEvent): boolean {
    return this.canAnimate() && this.isTouchLike && !this.controlled && this.isTouchPointer(event);
  }

  private isTouchPointer(event: PointerEvent): boolean {
    return event.pointerType === 'touch' || event.pointerType === 'pen';
  }

  private canAnimate(): boolean {
    return this.isBrowser && !this.reduceMotion;
  }
}
