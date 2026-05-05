import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, DoCheck, ElementRef, PLATFORM_ID, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef, afterNextRender, computed, contentChildren, inject, input, signal } from '@angular/core';
import gsap from 'gsap';

import { PortfolioIcon } from '../portfolio-icon/portfolio-icon';
import { CarouselItem } from './carousel-item.directive';

type CarouselMode = 'card' | 'screenshot';
type SlidePosition = 'center' | 'left' | 'right' | 'hidden';
type Direction = 'left' | 'right';

type ProgressOwner = 'inline' | 'fullscreen';

type CarouselSnapshot = {
  mode: CarouselMode;
  imagesKey: string;
  imagesLength: number;
  cardsLength: number;
  autoPlay: boolean;
  autoPlayDuration: number;
};

type ProgressState = {
  index: number | null;
  startValue: number;
  startedAt: number;
  paused: boolean;
};

@Component({
  selector: 'portfolio-carousel',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './portfolio-carousel.html',
  styleUrl: './portfolio-carousel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioCarousel implements AfterViewInit, DoCheck {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly mode = input<CarouselMode>('screenshot');
  readonly images = input<string[]>([]);
  readonly autoPlay = input<boolean>(true);
  readonly autoPlayDuration = input<number>(4000);

  protected readonly currentIndex = signal(0);
  protected readonly fullscreenIndex = signal<number | null>(null);
  protected readonly isAnimating = signal(false);
  protected readonly isFullscreenAnimating = signal(false);

  protected readonly cardItems = contentChildren(CarouselItem, { descendants: true });

  @ViewChild('fullscreenTemplate') private fullscreenTemplate?: TemplateRef<unknown>;

  @ViewChildren('slideRef') private slideRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('navFillRef') private navFillRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('fullscreenSlideRef') private fullscreenSlideRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('fullscreenNavFillRef') private fullscreenNavFillRefs!: QueryList<ElementRef<HTMLElement>>;

  protected readonly itemsLength = computed(() => {
    return this.mode() === 'card' ? this.cardItems().length : this.images().length;
  });

  protected readonly fullscreenSrc = computed(() => {
    const index = this.fullscreenIndex();

    return index === null ? null : (this.images()[index] ?? null);
  });

  protected readonly fullscreenActiveIndex = computed(() => {
    return this.fullscreenIndex() ?? this.currentIndex();
  });

  private fullscreenOverlayRef?: OverlayRef;

  private didInit = false;
  private lastSnapshot?: CarouselSnapshot;
  private lastDirection: Direction = 'right';

  private isDragging = false;
  private wasDragging = false;
  private dragStartX = 0;
  private dragStartTime = 0;
  private touchStartX = 0;

  private progressTween?: gsap.core.Tween;
  private fullscreenProgressTween?: gsap.core.Tween;
  private cardDelayedCall?: gsap.core.Tween;

  private inlineProgressState: ProgressState = {
    index: null,
    startValue: 0,
    startedAt: 0,
    paused: false,
  };

  private fullscreenProgressState: ProgressState = {
    index: null,
    startValue: 0,
    startedAt: 0,
    paused: false,
  };

  private pendingInlineProgress = 0;
  private pendingFullscreenProgress = 0;

  private inlineInitScheduled = false;
  private fullscreenInitScheduled = false;
  private cardInitScheduled = false;

  private fullscreenHydrated = false;
  private inlineRetryFrame = 0;
  private fullscreenRetryFrame = 0;

  private readonly DRAG_THRESHOLD = 50;
  private readonly DRAG_TIME_THRESHOLD = 120;
  private readonly CARD_DURATION = 0.6;
  private readonly SLIDE_DURATION = 0.72;

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;

      this.didInit = true;
      this.lastSnapshot = this.createSnapshot();
      this.initPositions();

      document.addEventListener('visibilitychange', this.onVisibilityChange);

      this.destroyRef.onDestroy(() => {
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
      });
    });

    this.destroyRef.onDestroy(() => {
      this.stopProgress();
      this.stopFullscreenProgress();
      this.cardDelayedCall?.kill();
      this.fullscreenOverlayRef?.dispose();

      if (this.inlineRetryFrame) {
        cancelAnimationFrame(this.inlineRetryFrame);
      }

      if (this.fullscreenRetryFrame) {
        cancelAnimationFrame(this.fullscreenRetryFrame);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const slideChangesSubscription = this.slideRefs.changes.subscribe(() => {
      if (this.mode() === 'screenshot' && this.fullscreenIndex() === null) {
        this.scheduleInlineInit(this.pendingInlineProgress || this.getInlineProgress(this.currentIndex()));
      }
    });

    const navChangesSubscription = this.navFillRefs.changes.subscribe(() => {
      if (this.mode() === 'screenshot' && this.fullscreenIndex() === null) {
        this.scheduleInlineInit(this.pendingInlineProgress || this.getInlineProgress(this.currentIndex()));
      }
    });

    const fullscreenSlideChangesSubscription = this.fullscreenSlideRefs.changes.subscribe(() => {
      if (this.mode() === 'screenshot' && this.fullscreenIndex() !== null && !this.fullscreenHydrated) {
        this.scheduleFullscreenInit(this.pendingFullscreenProgress);
      }
    });

    const fullscreenNavChangesSubscription = this.fullscreenNavFillRefs.changes.subscribe(() => {
      if (this.mode() === 'screenshot' && this.fullscreenIndex() !== null && !this.fullscreenHydrated) {
        this.scheduleFullscreenInit(this.pendingFullscreenProgress);
      }
    });

    this.destroyRef.onDestroy(() => {
      slideChangesSubscription.unsubscribe();
      navChangesSubscription.unsubscribe();
      fullscreenSlideChangesSubscription.unsubscribe();
      fullscreenNavChangesSubscription.unsubscribe();
    });
  }

  ngDoCheck(): void {
    if (!this.isBrowser || !this.didInit) return;

    const snapshot = this.createSnapshot();

    if (!this.hasSnapshotChanged(snapshot)) return;

    const inlineProgress = this.getInlineProgress(this.currentIndex());
    const fullscreenProgress = this.getFullscreenProgress(this.fullscreenActiveIndex());

    this.lastSnapshot = snapshot;
    this.normalizeCurrentIndexes(snapshot);

    if (snapshot.mode === 'card') {
      this.scheduleCardInit();
      return;
    }

    if (this.fullscreenIndex() !== null) {
      this.fullscreenHydrated = false;
      this.scheduleFullscreenInit(fullscreenProgress);
      return;
    }

    this.scheduleInlineInit(inlineProgress);
  }

  private readonly onVisibilityChange = (): void => {
    if (!this.isBrowser) return;

    if (document.hidden) {
      this.pauseActiveAutoplay();
      return;
    }

    this.resumeActiveAutoplay();
  };

  private createSnapshot(): CarouselSnapshot {
    const images = this.images();

    return {
      mode: this.mode(),
      imagesKey: images.join('|'),
      imagesLength: images.length,
      cardsLength: this.cardItems().length,
      autoPlay: this.autoPlay(),
      autoPlayDuration: this.autoPlayDuration(),
    };
  }

  private hasSnapshotChanged(snapshot: CarouselSnapshot): boolean {
    if (!this.lastSnapshot) return true;

    return this.lastSnapshot.mode !== snapshot.mode || this.lastSnapshot.imagesKey !== snapshot.imagesKey || this.lastSnapshot.imagesLength !== snapshot.imagesLength || this.lastSnapshot.cardsLength !== snapshot.cardsLength || this.lastSnapshot.autoPlay !== snapshot.autoPlay || this.lastSnapshot.autoPlayDuration !== snapshot.autoPlayDuration;
  }

  private normalizeCurrentIndexes(snapshot: CarouselSnapshot): void {
    const total = snapshot.mode === 'card' ? snapshot.cardsLength : snapshot.imagesLength;

    if (total <= 0) {
      this.currentIndex.set(0);
      this.closeFullscreen();
      this.stopProgress();
      this.stopFullscreenProgress();
      return;
    }

    if (this.currentIndex() >= total) {
      this.currentIndex.set(0);
    }

    const fullscreenIndex = this.fullscreenIndex();

    if (fullscreenIndex !== null && fullscreenIndex >= snapshot.imagesLength) {
      this.closeFullscreen();
    }
  }

  private scheduleCardInit(): void {
    if (this.cardInitScheduled) return;

    this.cardInitScheduled = true;

    queueMicrotask(() => {
      this.cardInitScheduled = false;
      this.initCardPositions();
    });
  }

  private scheduleInlineInit(progress = 0): void {
    this.pendingInlineProgress = this.normalizeProgress(progress);

    if (this.inlineInitScheduled) return;

    this.inlineInitScheduled = true;

    queueMicrotask(() => {
      this.inlineInitScheduled = false;

      if (this.fullscreenIndex() !== null) return;

      this.initScreenshotPositions(this.pendingInlineProgress);
      this.pendingInlineProgress = 0;
    });
  }

  private scheduleFullscreenInit(progress = 0): void {
    const normalizedProgress = this.normalizeProgress(progress);

    if (!this.fullscreenHydrated) {
      this.pendingFullscreenProgress = Math.max(this.pendingFullscreenProgress, normalizedProgress);
    } else {
      this.pendingFullscreenProgress = normalizedProgress;
    }

    if (this.fullscreenInitScheduled) return;

    this.fullscreenInitScheduled = true;

    queueMicrotask(() => {
      this.fullscreenInitScheduled = false;

      if (this.fullscreenIndex() === null) return;

      this.initFullscreenPositions(this.pendingFullscreenProgress);
    });
  }

  private retryInlineInit(progress: number): void {
    if (this.inlineRetryFrame) return;

    this.inlineRetryFrame = requestAnimationFrame(() => {
      this.inlineRetryFrame = 0;

      if (this.fullscreenIndex() !== null) return;

      this.scheduleInlineInit(progress);
    });
  }

  private retryFullscreenInit(progress: number): void {
    if (this.fullscreenRetryFrame) return;

    this.fullscreenRetryFrame = requestAnimationFrame(() => {
      this.fullscreenRetryFrame = 0;

      if (this.fullscreenIndex() === null || this.fullscreenHydrated) return;

      this.scheduleFullscreenInit(progress);
    });
  }

  private initPositions(): void {
    if (!this.isBrowser) return;

    if (this.mode() === 'card') {
      this.initCardPositions();
      return;
    }

    this.initScreenshotPositions(this.pendingInlineProgress);
    this.pendingInlineProgress = 0;
  }

  private initCardPositions(): void {
    const items = this.cardItems();
    const total = items.length;

    if (!total) return;

    this.stopProgress();
    this.cardDelayedCall?.kill();

    items.forEach((item, index) => {
      const element = item.elementRef.nativeElement;
      const position = this.resolvePosition(index, this.currentIndex(), total);

      gsap.killTweensOf(element);
      this.setCardPositionState(element, position);
      gsap.set(element, this.cardProps(position));
    });

    this.isAnimating.set(false);
  }

  private initScreenshotPositions(progress = 0): void {
    const slides = this.slideRefs?.toArray() ?? [];
    const fills = this.navFillRefs?.toArray() ?? [];
    const activeIndex = this.currentIndex();
    const normalizedProgress = this.normalizeProgress(progress);

    if (!slides.length || (this.images().length > 1 && !fills.length)) {
      this.retryInlineInit(normalizedProgress);
      return;
    }

    this.stopProgress();

    slides.forEach((ref, index) => {
      gsap.killTweensOf(ref.nativeElement);

      gsap.set(ref.nativeElement, {
        xPercent: index === activeIndex ? 0 : 100,
        zIndex: index === activeIndex ? 10 : 1,
        opacity: 1,
      });
    });

    this.syncNavFills(activeIndex, normalizedProgress);

    if (this.canRunInlineAutoplay()) {
      this.startProgress(activeIndex, normalizedProgress);
    }
  }

  private initFullscreenPositions(progress = 0): void {
    const slides = this.fullscreenSlideRefs?.toArray() ?? [];
    const fills = this.fullscreenNavFillRefs?.toArray() ?? [];
    const activeIndex = this.fullscreenActiveIndex();
    const normalizedProgress = this.normalizeProgress(progress);

    if (!slides.length || (this.images().length > 1 && !fills.length)) {
      this.retryFullscreenInit(normalizedProgress);
      return;
    }

    this.stopFullscreenProgress();

    slides.forEach((ref, index) => {
      gsap.killTweensOf(ref.nativeElement);

      gsap.set(ref.nativeElement, {
        xPercent: index === activeIndex ? 0 : 100,
        zIndex: index === activeIndex ? 10 : 1,
        opacity: 1,
      });
    });

    this.syncFullscreenNavFills(activeIndex, normalizedProgress);

    this.fullscreenHydrated = true;
    this.pendingFullscreenProgress = 0;

    if (this.canRunFullscreenAutoplay()) {
      this.startFullscreenProgress(activeIndex, normalizedProgress);
    }

    this.isFullscreenAnimating.set(false);
  }

  private resolvePosition(index: number, current: number, total: number): SlidePosition {
    if (index === current) return 'center';
    if (total <= 1) return 'hidden';
    if (index === (current - 1 + total) % total) return 'left';
    if (index === (current + 1) % total) return 'right';

    return 'hidden';
  }

  private setCardPositionState(element: HTMLElement, position: SlidePosition): void {
    element.dataset['carouselPosition'] = position;
  }

  private cardProps(position: SlidePosition): gsap.TweenVars {
    const hiddenX = this.lastDirection === 'right' ? 180 : -280;

    const props: Record<SlidePosition, gsap.TweenVars> = {
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
        xPercent: -121,
        yPercent: 0,
        scale: 0.84,
        opacity: 0.38,
        zIndex: 20,
        filter: 'blur(0.2px)',
        pointerEvents: 'auto',
      },
      right: {
        xPercent: 21,
        yPercent: 0,
        scale: 0.84,
        opacity: 0.38,
        zIndex: 20,
        filter: 'blur(0.2px)',
        pointerEvents: 'auto',
      },
      hidden: {
        xPercent: hiddenX,
        yPercent: 0,
        scale: 0.84,
        opacity: 0,
        zIndex: 1,
        filter: 'blur(0.75px)',
        pointerEvents: 'none',
      },
    };

    return props[position];
  }

  private animateCards(newIndex: number): void {
    const items = this.cardItems();
    const total = items.length;

    if (!total) {
      this.isAnimating.set(false);
      return;
    }

    this.cardDelayedCall?.kill();

    items.forEach((item, index) => {
      const element = item.elementRef.nativeElement;
      const position = this.resolvePosition(index, newIndex, total);

      this.setCardPositionState(element, position);

      gsap.to(element, {
        ...this.cardProps(position),
        duration: this.CARD_DURATION,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    });

    this.cardDelayedCall = gsap.delayedCall(this.CARD_DURATION, () => {
      this.isAnimating.set(false);
    });
  }

  protected onTrackClick(event: MouseEvent): void {
    if (this.mode() !== 'card' || this.wasDragging || this.isAnimating()) {
      this.wasDragging = false;
      return;
    }

    const target = event.target as HTMLElement;
    const items = this.cardItems();
    const index = items.findIndex((item) => item.elementRef.nativeElement.contains(target));

    if (index === -1 || index === this.currentIndex()) return;

    event.preventDefault();
    event.stopPropagation();

    this.goTo(index);
  }

  private canUseScreenshotControls(): boolean {
    if (this.mode() !== 'screenshot') return true;

    const parentCardItem = this.hostRef.nativeElement.closest<HTMLElement>('.carousel-item');

    if (!parentCardItem) return true;

    return parentCardItem.dataset['carouselPosition'] === 'center';
  }

  private allowScreenshotControl(event: Event): boolean {
    if (!this.canUseScreenshotControls()) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();

    return true;
  }

  protected onSlideClick(event: MouseEvent): void {
    if (this.isAnimating() || this.wasDragging) {
      this.wasDragging = false;
      return;
    }

    if (this.canUseScreenshotControls()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  protected onExpandClick(event: MouseEvent): void {
    if (!this.allowScreenshotControl(event)) return;

    this.openFullscreen(this.currentIndex());
  }

  protected onScreenshotPrevClick(event: MouseEvent): void {
    if (!this.allowScreenshotControl(event)) return;

    this.prev();
  }

  protected onScreenshotNextClick(event: MouseEvent): void {
    if (!this.allowScreenshotControl(event)) return;

    this.next();
  }

  protected onScreenshotDotClick(event: MouseEvent, index: number): void {
    if (!this.allowScreenshotControl(event)) return;

    this.goTo(index);
  }

  private animateSlides(fromIndex: number, toIndex: number, direction: Direction): void {
    const slides = this.slideRefs?.toArray() ?? [];
    const from = slides[fromIndex]?.nativeElement;
    const to = slides[toIndex]?.nativeElement;

    if (!from || !to) {
      this.isAnimating.set(false);
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

          this.isAnimating.set(false);
          this.syncNavFills(toIndex, 0);

          if (this.canRunInlineAutoplay()) {
            this.startProgress(toIndex, 0);
          }
        },
      })
      .to(
        from,
        {
          xPercent: direction === 'right' ? -100 : 100,
          duration: this.SLIDE_DURATION,
          ease: 'power3.inOut',
        },
        0,
      )
      .to(
        to,
        {
          xPercent: 0,
          duration: this.SLIDE_DURATION,
          ease: 'power3.inOut',
        },
        0,
      );
  }

  private animateFullscreenSlides(fromIndex: number, toIndex: number, direction: Direction): void {
    const slides = this.fullscreenSlideRefs?.toArray() ?? [];
    const from = slides[fromIndex]?.nativeElement;
    const to = slides[toIndex]?.nativeElement;

    if (!from || !to) {
      this.isFullscreenAnimating.set(false);
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

          this.isFullscreenAnimating.set(false);
          this.syncFullscreenNavFills(toIndex, 0);

          if (this.canRunFullscreenAutoplay()) {
            this.startFullscreenProgress(toIndex, 0);
          }
        },
      })
      .to(
        from,
        {
          xPercent: direction === 'right' ? -100 : 100,
          duration: this.SLIDE_DURATION,
          ease: 'power3.inOut',
        },
        0,
      )
      .to(
        to,
        {
          xPercent: 0,
          duration: this.SLIDE_DURATION,
          ease: 'power3.inOut',
        },
        0,
      );
  }

  private syncNavFills(activeIndex: number, activeProgress = 0): void {
    const fills = this.navFillRefs?.toArray() ?? [];
    const normalizedProgress = this.normalizeProgress(activeProgress);

    fills.forEach((ref, index) => {
      gsap.killTweensOf(ref.nativeElement);

      gsap.set(ref.nativeElement, {
        scaleX: index < activeIndex ? 1 : index === activeIndex ? normalizedProgress : 0,
      });
    });
  }

  private syncFullscreenNavFills(activeIndex: number, activeProgress = 0): void {
    const fills = this.fullscreenNavFillRefs?.toArray() ?? [];
    const normalizedProgress = this.normalizeProgress(activeProgress);

    fills.forEach((ref, index) => {
      gsap.killTweensOf(ref.nativeElement);

      gsap.set(ref.nativeElement, {
        scaleX: index < activeIndex ? 1 : index === activeIndex ? normalizedProgress : 0,
      });
    });
  }

  private startProgress(index: number, startProgress = 0): void {
    if (this.mode() !== 'screenshot') return;

    this.stopProgress();

    const fills = this.navFillRefs?.toArray() ?? [];
    const fill = fills[index]?.nativeElement;
    const normalizedProgress = this.normalizeProgress(startProgress);

    this.inlineProgressState = {
      index,
      startValue: normalizedProgress,
      startedAt: this.now(),
      paused: false,
    };

    if (!fill) return;

    gsap.killTweensOf(fill);
    gsap.set(fill, { scaleX: normalizedProgress });

    if (normalizedProgress >= 0.999) {
      queueMicrotask(() => this.next());
      return;
    }

    this.progressTween = gsap.to(fill, {
      scaleX: 1,
      duration: (this.autoPlayDuration() / 1000) * (1 - normalizedProgress),
      ease: 'none',
      overwrite: 'auto',
      onComplete: () => {
        this.next();
      },
    });
  }

  private startFullscreenProgress(index: number, startProgress = 0): void {
    if (this.mode() !== 'screenshot') return;

    this.stopFullscreenProgress();

    const fills = this.fullscreenNavFillRefs?.toArray() ?? [];
    const fill = fills[index]?.nativeElement;
    const normalizedProgress = this.normalizeProgress(startProgress);

    this.fullscreenProgressState = {
      index,
      startValue: normalizedProgress,
      startedAt: this.now(),
      paused: false,
    };

    if (!fill) return;

    gsap.killTweensOf(fill);
    gsap.set(fill, { scaleX: normalizedProgress });

    if (normalizedProgress >= 0.999) {
      queueMicrotask(() => this.fullscreenNext());
      return;
    }

    this.fullscreenProgressTween = gsap.to(fill, {
      scaleX: 1,
      duration: (this.autoPlayDuration() / 1000) * (1 - normalizedProgress),
      ease: 'none',
      overwrite: 'auto',
      onComplete: () => {
        this.fullscreenNext();
      },
    });
  }

  private stopProgress(): void {
    this.progressTween?.kill();
    this.progressTween = undefined;
  }

  private stopFullscreenProgress(): void {
    this.fullscreenProgressTween?.kill();
    this.fullscreenProgressTween = undefined;
  }

  private canRunInlineAutoplay(): boolean {
    return this.mode() === 'screenshot' && this.autoPlay() && this.images().length > 1 && this.fullscreenIndex() === null && !this.isAnimating() && !document.hidden;
  }

  private canRunFullscreenAutoplay(): boolean {
    return this.mode() === 'screenshot' && this.autoPlay() && this.images().length > 1 && this.fullscreenIndex() !== null && !this.isFullscreenAnimating() && !document.hidden;
  }

  private getInlineProgress(index: number): number {
    if (this.currentIndex() !== index) return 0;

    const domProgress = this.getInlineDomProgress(index);
    const stateProgress = this.getProgressFromState('inline', index);

    if (stateProgress === null) return domProgress;

    return Math.max(domProgress, stateProgress);
  }

  private getFullscreenProgress(index: number): number {
    if (this.fullscreenActiveIndex() !== index) return 0;

    const domProgress = this.getFullscreenDomProgress(index);
    const stateProgress = this.getProgressFromState('fullscreen', index);

    if (stateProgress === null) return domProgress;

    return Math.max(domProgress, stateProgress);
  }

  private getProgressFromState(owner: ProgressOwner, index: number): number | null {
    const state = owner === 'inline' ? this.inlineProgressState : this.fullscreenProgressState;

    if (state.index !== index) return null;

    if (state.paused) return this.normalizeProgress(state.startValue);

    const duration = this.autoPlayDuration();

    if (duration <= 0) return 1;

    const elapsed = this.now() - state.startedAt;
    const elapsedProgress = elapsed / duration;
    const progress = state.startValue + (1 - state.startValue) * elapsedProgress;

    return this.normalizeProgress(progress);
  }

  private getInlineDomProgress(index: number): number {
    const fills = this.navFillRefs?.toArray() ?? [];
    const fill = fills[index]?.nativeElement;

    if (!fill) return 0;

    return this.normalizeProgress(Number(gsap.getProperty(fill, 'scaleX')));
  }

  private getFullscreenDomProgress(index: number): number {
    const fills = this.fullscreenNavFillRefs?.toArray() ?? [];
    const fill = fills[index]?.nativeElement;

    if (!fill) return 0;

    return this.normalizeProgress(Number(gsap.getProperty(fill, 'scaleX')));
  }

  private pauseActiveAutoplay(): void {
    if (this.fullscreenIndex() !== null) {
      const index = this.fullscreenActiveIndex();
      const progress = this.getFullscreenProgress(index);

      this.stopFullscreenProgress();

      this.fullscreenProgressState = {
        index,
        startValue: progress,
        startedAt: this.now(),
        paused: true,
      };

      this.syncFullscreenNavFills(index, progress);
      return;
    }

    const index = this.currentIndex();
    const progress = this.getInlineProgress(index);

    this.stopProgress();

    this.inlineProgressState = {
      index,
      startValue: progress,
      startedAt: this.now(),
      paused: true,
    };

    this.syncNavFills(index, progress);
  }

  private resumeActiveAutoplay(): void {
    if (this.fullscreenIndex() !== null) {
      const index = this.fullscreenActiveIndex();
      const progress = this.normalizeProgress(this.fullscreenProgressState.startValue);

      if (this.canRunFullscreenAutoplay()) {
        this.startFullscreenProgress(index, progress);
      }

      return;
    }

    const index = this.currentIndex();
    const progress = this.normalizeProgress(this.inlineProgressState.startValue);

    if (this.canRunInlineAutoplay()) {
      this.startProgress(index, progress);
    }
  }

  private normalizeProgress(value: number): number {
    if (!Number.isFinite(value)) return 0;

    return Math.min(Math.max(value, 0), 1);
  }

  private now(): number {
    return performance.now();
  }

  private navigate(newIndex: number, direction: Direction): void {
    const total = this.itemsLength();

    if (!this.isBrowser || total <= 1 || this.isAnimating()) return;

    const current = this.currentIndex();

    if (newIndex === current) return;

    this.stopProgress();
    this.isAnimating.set(true);
    this.lastDirection = direction;
    this.currentIndex.set(newIndex);

    this.inlineProgressState = {
      index: newIndex,
      startValue: 0,
      startedAt: this.now(),
      paused: false,
    };

    if (this.mode() === 'card') {
      this.animateCards(newIndex);
      return;
    }

    this.animateSlides(current, newIndex, direction);
  }

  private navigateFullscreen(newIndex: number, direction: Direction): void {
    const total = this.images().length;
    const current = this.fullscreenActiveIndex();

    if (!this.isBrowser || total <= 1 || this.isFullscreenAnimating()) return;
    if (newIndex === current) return;

    this.stopFullscreenProgress();
    this.isFullscreenAnimating.set(true);
    this.fullscreenIndex.set(newIndex);
    this.currentIndex.set(newIndex);

    this.fullscreenProgressState = {
      index: newIndex,
      startValue: 0,
      startedAt: this.now(),
      paused: false,
    };

    this.animateFullscreenSlides(current, newIndex, direction);
  }

  protected prev(): void {
    const total = this.itemsLength();
    if (total <= 1) return;

    this.navigate((this.currentIndex() - 1 + total) % total, 'left');
  }

  protected next(): void {
    const total = this.itemsLength();
    if (total <= 1) return;

    this.navigate((this.currentIndex() + 1) % total, 'right');
  }

  protected goTo(index: number): void {
    const current = this.currentIndex();

    if (index === current) return;

    this.navigate(index, index > current ? 'right' : 'left');
  }

  protected onMouseDown(event: MouseEvent): void {
    if (this.itemsLength() <= 1) return;

    if (this.mode() === 'screenshot' && !this.canUseScreenshotControls()) {
      return;
    }

    if (this.mode() === 'screenshot') {
      event.stopPropagation();
    }

    this.isDragging = true;
    this.wasDragging = false;
    this.dragStartX = event.clientX;
    this.dragStartTime = Date.now();
  }

  protected onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.isAnimating()) return;

    if (this.mode() === 'screenshot') {
      event.stopPropagation();
    }

    const deltaX = event.clientX - this.dragStartX;
    const elapsed = Date.now() - this.dragStartTime;

    if (elapsed < this.DRAG_TIME_THRESHOLD || Math.abs(deltaX) < this.DRAG_THRESHOLD) {
      return;
    }

    event.preventDefault();

    this.wasDragging = true;
    this.isDragging = false;

    deltaX > 0 ? this.prev() : this.next();
  }

  protected onMouseUp(event?: MouseEvent): void {
    if (this.mode() === 'screenshot' && this.canUseScreenshotControls()) {
      event?.stopPropagation();
    }

    this.isDragging = false;
  }

  protected onTrackMouseLeave(): void {
    this.isDragging = false;
  }

  protected onTouchStart(event: TouchEvent): void {
    if (this.itemsLength() <= 1) return;

    if (this.mode() === 'screenshot' && !this.canUseScreenshotControls()) {
      return;
    }

    if (this.mode() === 'screenshot') {
      event.stopPropagation();
    }

    this.wasDragging = false;
    this.touchStartX = event.touches[0]?.clientX ?? 0;
  }

  protected onTouchEnd(event: TouchEvent): void {
    if (this.itemsLength() <= 1 || this.isAnimating()) return;

    if (this.mode() === 'screenshot' && !this.canUseScreenshotControls()) {
      return;
    }

    if (this.mode() === 'screenshot') {
      event.stopPropagation();
    }

    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = endX - this.touchStartX;

    if (Math.abs(delta) < this.DRAG_THRESHOLD) return;

    this.wasDragging = true;

    delta > 0 ? this.prev() : this.next();
  }

  protected openFullscreen(index: number): void {
    if (this.mode() !== 'screenshot') return;

    const progress = this.getInlineProgress(index);

    this.fullscreenHydrated = false;
    this.pendingFullscreenProgress = progress;

    this.stopProgress();
    this.stopFullscreenProgress();

    this.fullscreenIndex.set(index);
    this.currentIndex.set(index);

    this.fullscreenProgressState = {
      index,
      startValue: progress,
      startedAt: this.now(),
      paused: false,
    };

    queueMicrotask(() => {
      this.attachFullscreenOverlay();
    });
  }

  private attachFullscreenOverlay(): void {
    if (!this.fullscreenTemplate || this.fullscreenOverlayRef?.hasAttached()) return;

    if (!this.fullscreenOverlayRef) {
      this.fullscreenOverlayRef = this.overlay.create({
        hasBackdrop: false,
        scrollStrategy: this.overlay.scrollStrategies.block(),
        positionStrategy: this.overlay.position().global().top('0').left('0'),
        panelClass: 'portfolio-carousel-fullscreen-pane',
      });
    }

    this.fullscreenOverlayRef.attach(new TemplatePortal(this.fullscreenTemplate, this.viewContainerRef));
    this.scheduleFullscreenInit(this.pendingFullscreenProgress);
  }

  protected closeFullscreen(): void {
    const index = this.fullscreenActiveIndex();
    const progress = this.getFullscreenProgress(index);

    this.pendingInlineProgress = progress;

    this.fullscreenOverlayRef?.detach();
    this.stopFullscreenProgress();

    this.fullscreenHydrated = false;
    this.fullscreenIndex.set(null);
    this.currentIndex.set(index);
    this.isFullscreenAnimating.set(false);

    this.inlineProgressState = {
      index,
      startValue: progress,
      startedAt: this.now(),
      paused: false,
    };

    this.scheduleInlineInit(this.pendingInlineProgress);
  }

  protected fullscreenPrev(): void {
    const total = this.images().length;
    const index = this.fullscreenActiveIndex();

    if (total <= 1) return;

    this.navigateFullscreen((index - 1 + total) % total, 'left');
  }

  protected fullscreenNext(): void {
    const total = this.images().length;
    const index = this.fullscreenActiveIndex();

    if (total <= 1) return;

    this.navigateFullscreen((index + 1) % total, 'right');
  }

  protected fullscreenGoTo(index: number): void {
    const current = this.fullscreenActiveIndex();

    if (index === current) return;

    this.navigateFullscreen(index, index > current ? 'right' : 'left');
  }

  protected onFullscreenKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeFullscreen();
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.fullscreenPrev();
      return;
    }

    if (event.key === 'ArrowRight') {
      this.fullscreenNext();
    }
  }
}
