import { Injectable } from '@angular/core';
import gsap from 'gsap';

export type CarouselDirection = 'left' | 'right';
export type CarouselSlidePosition = 'center' | 'left' | 'right' | 'hidden';

type CardMetrics = {
  sideOffset: number;
  sideScale: number;
  hiddenX: number;
};

type ResolvePositionFn = (index: number, current: number, total: number) => CarouselSlidePosition;

type AnimateCardsParams = {
  elements: HTMLElement[];
  newIndex: number;
  total: number;
  metrics: CardMetrics;
  resolvePosition: ResolvePositionFn;
  onComplete: () => void;
};

type SetCardPositionsParams = {
  elements: HTMLElement[];
  currentIndex: number;
  total: number;
  metrics: CardMetrics;
  resolvePosition: ResolvePositionFn;
};

type AnimateCardLayoutParams = {
  elements: HTMLElement[];
  currentKeys: string[];
  previousKeys: string[];
  previousIndex: number;
  newIndex: number;
  previousTotal: number;
  total: number;
  metrics: CardMetrics;
  resolvePosition: ResolvePositionFn;
  onComplete: () => void;
};

type AnimateSlidesParams = {
  slides: HTMLElement[];
  fromIndex: number;
  toIndex: number;
  direction: CarouselDirection;
  onComplete: () => void;
  onMissingElements: () => void;
};

type StartProgressParams = {
  fills: HTMLElement[];
  extraFills?: HTMLElement[];
  index: number;
  startProgress: number;
  durationMs: number;
  onComplete: () => void;
};

type ProgressOwner = 'inline' | 'fullscreen';

@Injectable()
export class CarouselItemSceneService {
  readonly cardDuration = 0.6;
  readonly slideDuration = 0.72;

  private inlineProgressTween?: gsap.core.Tween;
  private fullscreenProgressTween?: gsap.core.Tween;
  private cardDelayedCall?: gsap.core.Tween;
  private cardRevealDelayedCalls: gsap.core.Tween[] = [];

  destroy(): void {
    this.stopProgress('inline');
    this.stopProgress('fullscreen');
    this.killCardTweens();
  }

  killCardTweens(): void {
    this.cardDelayedCall?.kill();
    this.cardDelayedCall = undefined;
    this.killCardRevealDelayedCalls();
  }

  killCardRevealDelayedCalls(): void {
    this.cardRevealDelayedCalls.forEach((call) => call.kill());
    this.cardRevealDelayedCalls = [];
  }

  setCardPositionState(element: HTMLElement, position: CarouselSlidePosition): void {
    element.dataset['carouselPosition'] = position;
    element.style.visibility = 'visible';
  }

  setCardPositions(params: SetCardPositionsParams): void {
    const { elements, currentIndex, total, metrics, resolvePosition } = params;

    this.killCardTweens();

    elements.forEach((element, index) => {
      const position = resolvePosition(index, currentIndex, total);

      gsap.killTweensOf(element);
      this.setCardPositionState(element, position);
      gsap.set(element, this.cardProps(position, metrics));
    });
  }

  animateCards(params: AnimateCardsParams): void {
    const { elements, newIndex, total, metrics, resolvePosition, onComplete } = params;

    this.killCardTweens();

    if (!elements.length) {
      onComplete();
      return;
    }

    elements.forEach((element, index) => {
      const position = resolvePosition(index, newIndex, total);

      this.setCardPositionState(element, position);

      gsap.to(element, {
        ...this.cardProps(position, metrics),
        duration: this.cardDuration,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    });

    this.cardDelayedCall = gsap.delayedCall(this.cardDuration, () => {
      onComplete();
    });
  }

  animateCardLayout(params: AnimateCardLayoutParams): void {
    const { elements, currentKeys, previousKeys, previousIndex, newIndex, previousTotal, total, metrics, resolvePosition, onComplete } = params;

    this.killCardTweens();

    if (!elements.length) {
      onComplete();
      return;
    }

    const previousPositions = new Map<string, CarouselSlidePosition>();

    previousKeys.forEach((key, index) => {
      previousPositions.set(key, resolvePosition(index, previousIndex, previousTotal));
    });

    const isExpandingBack = total > previousTotal;
    const revealDelay = isExpandingBack ? this.cardDuration * 0.55 : 0;

    elements.forEach((element, index) => {
      const key = currentKeys[index];
      const targetPosition = resolvePosition(index, newIndex, total);
      const previousPosition = previousPositions.get(key);
      const existedBefore = previousPosition !== undefined;
      const isLeaving = element.dataset['carouselLeaving'] === 'true';

      gsap.killTweensOf(element);

      if (isLeaving) {
        this.animateLeavingCard({
          element,
          fromPosition: previousPosition ?? targetPosition,
          metrics,
        });

        return;
      }

      if (!existedBefore) {
        this.animateEnteringCard({
          element,
          targetPosition,
          metrics,
          delay: revealDelay,
        });

        return;
      }

      this.setCardPositionState(element, targetPosition);

      gsap.to(element, {
        ...this.cardProps(targetPosition, metrics),
        duration: this.cardDuration,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    });

    this.cardDelayedCall = gsap.delayedCall(this.cardDuration, () => {
      onComplete();
      this.killCardRevealDelayedCalls();
    });
  }

  setSlidesPositions(slides: HTMLElement[], fills: HTMLElement[], activeIndex: number, progress: number): void {
    slides.forEach((slide, index) => {
      gsap.killTweensOf(slide);

      gsap.set(slide, {
        xPercent: index === activeIndex ? 0 : 100,
        zIndex: index === activeIndex ? 10 : 1,
        opacity: 1,
      });
    });

    this.syncFills(fills, activeIndex, progress);
  }

  animateSlides(params: AnimateSlidesParams): void {
    const { slides, fromIndex, toIndex, direction, onComplete, onMissingElements } = params;

    const from = slides[fromIndex];
    const to = slides[toIndex];

    if (!from || !to) {
      onMissingElements();
      return;
    }

    gsap.set(to, {
      xPercent: direction === 'right' ? 100 : -100,
      zIndex: 20,
      opacity: 1,
    });

    gsap.set(from, {
      zIndex: 10,
      opacity: 1,
    });

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(from, {
            zIndex: 1,
            xPercent: direction === 'right' ? -100 : 100,
          });

          gsap.set(to, {
            zIndex: 10,
            xPercent: 0,
          });

          onComplete();
        },
      })
      .to(
        from,
        {
          xPercent: direction === 'right' ? -100 : 100,
          duration: this.slideDuration,
          ease: 'power3.inOut',
        },
        0,
      )
      .to(
        to,
        {
          xPercent: 0,
          duration: this.slideDuration,
          ease: 'power3.inOut',
        },
        0,
      );
  }

  syncFills(fills: HTMLElement[], activeIndex: number, activeProgress = 0): void {
    const normalizedProgress = this.normalizeProgress(activeProgress);

    fills.forEach((fill, index) => {
      gsap.killTweensOf(fill);

      gsap.set(fill, {
        scaleX: index < activeIndex ? 1 : index === activeIndex ? normalizedProgress : 0,
      });
    });
  }

  startProgress(owner: ProgressOwner, params: StartProgressParams): void {
    const { fills, extraFills, index, startProgress, durationMs, onComplete } = params;

    this.stopProgress(owner);

    const fill = fills[index];
    const normalizedProgress = this.normalizeProgress(startProgress);

    if (!fill) return;

    const targetFills = [fill];
    if (extraFills && extraFills[index]) {
      targetFills.push(extraFills[index]);
    }

    gsap.killTweensOf(targetFills);
    gsap.set(targetFills, { scaleX: normalizedProgress });

    if (normalizedProgress >= 0.999) {
      queueMicrotask(onComplete);
      return;
    }

    const tween = gsap.to(targetFills, {
      scaleX: 1,
      duration: (durationMs / 1000) * (1 - normalizedProgress),
      ease: 'none',
      overwrite: 'auto',
      onComplete,
    });

    if (owner === 'inline') {
      this.inlineProgressTween = tween;
      return;
    }

    this.fullscreenProgressTween = tween;
  }

  stopProgress(owner: ProgressOwner): void {
    if (owner === 'inline') {
      this.inlineProgressTween?.kill();
      this.inlineProgressTween = undefined;
      return;
    }

    this.fullscreenProgressTween?.kill();
    this.fullscreenProgressTween = undefined;
  }

  getFillProgress(fills: HTMLElement[], index: number): number {
    const fill = fills[index];

    if (!fill) return 0;

    return this.normalizeProgress(Number(gsap.getProperty(fill, 'scaleX')));
  }

  private animateLeavingCard(params: { element: HTMLElement; fromPosition: CarouselSlidePosition; metrics: CardMetrics }): void {
    const { element, fromPosition, metrics } = params;

    const fromProps = this.cardProps(fromPosition, metrics);
    const fromScale = typeof fromProps.scale === 'number' ? fromProps.scale : 1;

    this.setCardPositionState(element, fromPosition);

    gsap.set(element, {
      ...fromProps,
      pointerEvents: 'none',
    });

    gsap.to(element, {
      opacity: 0,
      scale: fromScale * 0.88,
      yPercent: 4,
      filter: 'blur(0.8px)',
      pointerEvents: 'none',
      duration: 0.24,
      ease: 'power2.in',
      overwrite: 'auto',
    });
  }

  private animateEnteringCard(params: { element: HTMLElement; targetPosition: CarouselSlidePosition; metrics: CardMetrics; delay: number }): void {
    const { element, targetPosition, metrics, delay } = params;

    const targetProps = this.cardProps(targetPosition, metrics);
    const targetScale = typeof targetProps.scale === 'number' ? targetProps.scale : 1;

    this.setCardPositionState(element, targetPosition);

    gsap.set(element, {
      ...targetProps,
      opacity: 0,
      scale: targetScale * 0.96,
      pointerEvents: 'none',
    });

    const revealCall = gsap.delayedCall(delay, () => {
      this.setCardPositionState(element, targetPosition);

      gsap.to(element, {
        ...targetProps,
        opacity: targetProps.opacity,
        scale: targetScale,
        yPercent: 0,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    this.cardRevealDelayedCalls.push(revealCall);
  }

  private cardProps(position: CarouselSlidePosition, metrics: CardMetrics): gsap.TweenVars {
    const { sideOffset, sideScale, hiddenX } = metrics;

    const props: Record<CarouselSlidePosition, gsap.TweenVars> = {
      center: {
        xPercent: -50,
        yPercent: 0,
        scale: 1,
        opacity: 1,
        zIndex: 50,
        filter: 'blur(0px)',
        pointerEvents: 'auto',
      },
      left: {
        xPercent: -50 - sideOffset,
        yPercent: 0,
        scale: sideScale,
        opacity: 0.38,
        zIndex: 20,
        filter: 'blur(0.2px)',
        pointerEvents: 'auto',
      },
      right: {
        xPercent: -50 + sideOffset,
        yPercent: 0,
        scale: sideScale,
        opacity: 0.38,
        zIndex: 20,
        filter: 'blur(0.2px)',
        pointerEvents: 'auto',
      },
      hidden: {
        xPercent: hiddenX,
        yPercent: 0,
        scale: sideScale,
        opacity: 0,
        zIndex: 1,
        filter: 'blur(0.75px)',
        pointerEvents: 'none',
      },
    };

    return props[position];
  }

  private normalizeProgress(value: number): number {
    if (!Number.isFinite(value)) return 0;

    return Math.min(Math.max(value, 0), 1);
  }
}
