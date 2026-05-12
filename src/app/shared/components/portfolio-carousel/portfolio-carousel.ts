import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, DoCheck, ElementRef, PLATFORM_ID, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef, afterNextRender, computed, contentChildren, inject, input, output, signal } from '@angular/core';

import { PortfolioIcon } from '../portfolio-icon/portfolio-icon';
import { CarouselItem } from './carousel-item.directive';
import { CarouselDirection, CarouselItemSceneService, CarouselSlidePosition } from './carousel-item-scene.service';

type CarouselMode = 'card' | 'screenshot';

type ProgressOwner = 'inline' | 'fullscreen';

type CarouselSnapshot = {
  mode: CarouselMode;
  imagesKey: string;
  itemsKey: string;
  itemsStateKey: string;
  activeItemKey: string;
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
  providers: [CarouselItemSceneService],
  host: {
    '[class.carousel-screenshot-active]': "mode() === 'screenshot' && active()",
  },
})
export class PortfolioCarousel implements AfterViewInit, DoCheck {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly carouselScene = inject(CarouselItemSceneService);

  readonly mode = input<CarouselMode>('screenshot');
  readonly images = input<string[]>([]);
  readonly itemsKey = input<string>('');
  readonly itemsStateKey = input<string>('');
  readonly activeItemKey = input<string>('');
  readonly autoPlay = input<boolean>(true);
  readonly autoPlayDuration = input<number>(4000);
  readonly active = input<boolean>(true);
  readonly activeItemChange = output<string>();

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
  private lastDirection: CarouselDirection = 'right';

  private isDragging = false;
  private wasDragging = false;
  private dragStartX = 0;
  private dragStartTime = 0;
  private touchStartX = 0;

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

  private resizeObserver?: ResizeObserver;
  private resizeFrame = 0;
  private cardInitFrame = 0;
  private lastMeasuredCardRootWidth = 0;

  private readonly DRAG_THRESHOLD = 50;
  private readonly DRAG_TIME_THRESHOLD = 120;
  private readonly NAVIGATION_THROTTLE = 250;

  private navigationId = 0;
  private fullscreenNavigationId = 0;
  private lastNavigationTime = 0;
  private lastFullscreenNavigationTime = 0;

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;

      this.didInit = true;
      this.lastSnapshot = this.createSnapshot();
      this.initPositions();
      this.initResizeObserver();

      document.addEventListener('visibilitychange', this.onVisibilityChange);
      window.addEventListener('resize', this.onWindowResize, { passive: true });

      this.destroyRef.onDestroy(() => {
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        window.removeEventListener('resize', this.onWindowResize);
      });
    });

    this.destroyRef.onDestroy(() => {
      this.carouselScene.destroy();
      this.fullscreenOverlayRef?.dispose();
      this.resizeObserver?.disconnect();

      if (this.inlineRetryFrame) {
        cancelAnimationFrame(this.inlineRetryFrame);
      }

      if (this.fullscreenRetryFrame) {
        cancelAnimationFrame(this.fullscreenRetryFrame);
      }

      if (this.resizeFrame) {
        cancelAnimationFrame(this.resizeFrame);
      }

      if (this.cardInitFrame) {
        cancelAnimationFrame(this.cardInitFrame);
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

    const previousSnapshot = this.lastSnapshot;
    const previousIndex = this.currentIndex();
    const inlineProgress = this.getInlineProgress(this.currentIndex());
    const fullscreenProgress = this.getFullscreenProgress(this.fullscreenActiveIndex());

    if (snapshot.mode === 'card') {
      this.prepareCardIndexForSnapshot(previousSnapshot, snapshot, previousIndex);
    }

    this.lastSnapshot = snapshot;
    this.normalizeCurrentIndexes(snapshot);

    if (snapshot.mode === 'card') {
      const shouldAnimateCards = previousSnapshot?.mode === 'card' && previousSnapshot.cardsLength > 0 && snapshot.cardsLength > 0;

      this.scheduleCardInit(shouldAnimateCards, previousSnapshot, previousIndex);
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

  private readonly onWindowResize = (): void => {
    this.scheduleResponsiveCardRefresh();
  };

  private initResizeObserver(): void {
    if (!this.isBrowser || typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.scheduleResponsiveCardRefresh();
    });

    this.resizeObserver.observe(this.hostRef.nativeElement);
  }

  private scheduleResponsiveCardRefresh(): void {
    if (!this.isBrowser || this.mode() !== 'card') return;

    if (this.resizeFrame) {
      cancelAnimationFrame(this.resizeFrame);
    }

    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = 0;

      if (this.mode() !== 'card') return;

      const root = this.cardRootElement();
      const width = root?.clientWidth || this.hostRef.nativeElement.clientWidth;

      if (!width) return;

      if (Math.abs(width - this.lastMeasuredCardRootWidth) < 1) return;

      this.lastMeasuredCardRootWidth = width;
      this.scheduleCardInit(false);
    });
  }

  private createSnapshot(): CarouselSnapshot {
    const images = this.images();

    return {
      mode: this.mode(),
      imagesKey: images.join('|'),
      itemsKey: this.itemsKey().trim() || this.createCardItemsKey(),
      itemsStateKey: this.itemsStateKey().trim(),
      activeItemKey: this.activeItemKey().trim(),
      imagesLength: images.length,
      cardsLength: this.cardItems().length,
      autoPlay: this.autoPlay(),
      autoPlayDuration: this.autoPlayDuration(),
    };
  }

  private createCardItemsKey(): string {
    return this.cardItems()
      .map((item, index) => this.cardElementKey(item.elementRef.nativeElement, index))
      .join('|');
  }

  private cardElementKey(element: HTMLElement, index: number): string {
    const explicitKey = element.getAttribute('data-carousel-key');

    if (explicitKey?.trim()) {
      return explicitKey.trim();
    }

    const title = element.querySelector<HTMLElement>('.projects-card-title')?.textContent?.trim();

    if (title) {
      return title;
    }

    const heading = element.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6')?.textContent?.trim();

    if (heading) {
      return heading;
    }

    const text = element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120);

    return text || `carousel-item-${index}`;
  }

  private snapshotKeyParts(snapshot?: CarouselSnapshot): string[] {
    if (!snapshot?.itemsKey) return [];

    return snapshot.itemsKey
      .split('|')
      .map((key) => key.trim())
      .filter(Boolean);
  }

  private currentCardKeys(): string[] {
    const snapshotKeys = this.snapshotKeyParts(this.lastSnapshot);

    if (snapshotKeys.length) {
      return snapshotKeys;
    }

    return this.cardItems().map((item, index) => this.cardElementKey(item.elementRef.nativeElement, index));
  }

  private prepareCardIndexForSnapshot(previousSnapshot: CarouselSnapshot | undefined, snapshot: CarouselSnapshot, previousIndex: number): void {
    if (!previousSnapshot || previousSnapshot.mode !== 'card') return;

    const previousKeys = this.snapshotKeyParts(previousSnapshot);
    const nextKeys = this.snapshotKeyParts(snapshot);

    if (!nextKeys.length) {
      this.currentIndex.set(0);
      return;
    }

    const forcedActiveKey = snapshot.activeItemKey;

    if (forcedActiveKey) {
      const forcedActiveIndex = nextKeys.indexOf(forcedActiveKey);

      if (forcedActiveIndex !== -1) {
        this.currentIndex.set(forcedActiveIndex);
        return;
      }
    }

    const previousActiveKey = previousKeys[previousIndex] ?? null;
    const isFilteringDown = snapshot.cardsLength < previousSnapshot.cardsLength;
    const isExpandingBack = snapshot.cardsLength > previousSnapshot.cardsLength;

    if (isFilteringDown) {
      if (previousActiveKey) {
        const sameActiveIndex = nextKeys.indexOf(previousActiveKey);

        if (sameActiveIndex !== -1) {
          this.currentIndex.set(sameActiveIndex);
          return;
        }
      }

      const previousTotal = Math.max(previousSnapshot.cardsLength, 1);
      const visibleIndexes = [(previousIndex + 1) % previousTotal, (previousIndex - 1 + previousTotal) % previousTotal];

      for (const visibleIndex of visibleIndexes) {
        const visibleKey = previousKeys[visibleIndex];
        const nextIndex = visibleKey ? nextKeys.indexOf(visibleKey) : -1;

        if (nextIndex !== -1) {
          this.currentIndex.set(nextIndex);
          return;
        }
      }

      this.currentIndex.set(0);
      return;
    }

    if (isExpandingBack) {
      this.currentIndex.set(0);
      return;
    }

    if (previousActiveKey) {
      const activeIndexInNext = nextKeys.indexOf(previousActiveKey);

      if (activeIndexInNext !== -1) {
        this.currentIndex.set(activeIndexInNext);
        return;
      }
    }

    this.currentIndex.set(Math.min(previousIndex, nextKeys.length - 1));
  }

  private hasSnapshotChanged(snapshot: CarouselSnapshot): boolean {
    if (!this.lastSnapshot) return true;

    return this.lastSnapshot.mode !== snapshot.mode || this.lastSnapshot.imagesKey !== snapshot.imagesKey || this.lastSnapshot.itemsKey !== snapshot.itemsKey || this.lastSnapshot.itemsStateKey !== snapshot.itemsStateKey || this.lastSnapshot.activeItemKey !== snapshot.activeItemKey || this.lastSnapshot.imagesLength !== snapshot.imagesLength || this.lastSnapshot.cardsLength !== snapshot.cardsLength || this.lastSnapshot.autoPlay !== snapshot.autoPlay || this.lastSnapshot.autoPlayDuration !== snapshot.autoPlayDuration;
  }

  private normalizeCurrentIndexes(snapshot: CarouselSnapshot): void {
    const total = snapshot.mode === 'card' ? snapshot.cardsLength : snapshot.imagesLength;

    if (total <= 0) {
      this.currentIndex.set(0);
      this.closeFullscreen();
      this.stopProgress();
      this.stopFullscreenProgress();
      this.isAnimating.set(false);
      this.isFullscreenAnimating.set(false);
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

  private scheduleCardInit(animate = false, previousSnapshot?: CarouselSnapshot, previousIndex = this.currentIndex()): void {
    if (!this.isBrowser || this.mode() !== 'card') return;

    if (this.cardInitFrame) {
      cancelAnimationFrame(this.cardInitFrame);
      this.cardInitFrame = 0;
    }

    this.cardInitScheduled = true;

    this.cardInitFrame = requestAnimationFrame(() => {
      this.cardInitFrame = 0;
      this.cardInitScheduled = false;

      if (this.mode() !== 'card') return;

      this.initCardPositions(animate, previousSnapshot, previousIndex);
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
      this.initCardPositions(false);
      return;
    }

    this.initScreenshotPositions(this.pendingInlineProgress);
    this.pendingInlineProgress = 0;
  }

  private initCardPositions(animate = false, previousSnapshot?: CarouselSnapshot, previousIndex = this.currentIndex()): void {
    const items = this.cardItems();
    const elements = this.cardElements();
    const total = items.length;

    this.stopProgress();
    this.carouselScene.killCardTweens();

    if (!total) {
      this.currentIndex.set(0);
      this.isAnimating.set(false);
      return;
    }

    if (this.currentIndex() >= total) {
      this.currentIndex.set(0);
    }

    const root = this.cardRootElement();
    this.lastMeasuredCardRootWidth = root?.clientWidth || this.hostRef.nativeElement.clientWidth || this.lastMeasuredCardRootWidth;

    if (animate && previousSnapshot?.mode === 'card') {
      this.animateCardLayout(this.currentIndex(), previousSnapshot, previousIndex);
      return;
    }

    this.carouselScene.setCardPositions({
      elements,
      currentIndex: this.currentIndex(),
      total,
      metrics: this.cardMetrics(),
      resolvePosition: this.resolvePosition,
    });

    this.isAnimating.set(false);
    this.emitActiveCardChange();
  }

  private emitActiveCardChange(): void {
    if (this.mode() !== 'card') {
      return;
    }

    const activeElement = this.cardElements()[this.currentIndex()];
    const activeKey = activeElement?.dataset['carouselKey'];

    if (!activeKey) {
      return;
    }

    this.activeItemChange.emit(activeKey);
  }

  private animateCardLayout(newIndex: number, previousSnapshot: CarouselSnapshot, previousIndex: number): void {
    const elements = this.cardElements();
    const total = elements.length;

    if (!total) {
      this.isAnimating.set(false);
      return;
    }

    this.isAnimating.set(true);

    this.carouselScene.animateCardLayout({
      elements,
      currentKeys: this.currentCardKeys(),
      previousKeys: this.snapshotKeyParts(previousSnapshot),
      previousIndex,
      newIndex,
      previousTotal: previousSnapshot.cardsLength,
      total,
      metrics: this.cardMetrics(),
      resolvePosition: this.resolvePosition,
      onComplete: () => {
        this.isAnimating.set(false);
        this.emitActiveCardChange();
      },
    });
  }

  private initScreenshotPositions(progress = 0): void {
    const slides = this.slideElements();
    const fills = this.navFillElements();
    const activeIndex = this.currentIndex();
    const normalizedProgress = this.normalizeProgress(progress);

    if (!slides.length || (this.images().length > 1 && !fills.length)) {
      this.retryInlineInit(normalizedProgress);
      return;
    }

    this.stopProgress();

    this.carouselScene.setSlidesPositions(slides, fills, activeIndex, normalizedProgress);

    if (this.canRunInlineAutoplay()) {
      this.startProgress(activeIndex, normalizedProgress);
    }
  }

  private initFullscreenPositions(progress = 0): void {
    const slides = this.fullscreenSlideElements();
    const fills = this.fullscreenNavFillElements();
    const activeIndex = this.fullscreenActiveIndex();
    const normalizedProgress = this.normalizeProgress(progress);

    if (!slides.length || (this.images().length > 1 && !fills.length)) {
      this.retryFullscreenInit(normalizedProgress);
      return;
    }

    this.stopFullscreenProgress();

    this.carouselScene.setSlidesPositions(slides, fills, activeIndex, normalizedProgress);

    this.fullscreenHydrated = true;
    this.pendingFullscreenProgress = 0;

    if (this.canRunFullscreenAutoplay()) {
      this.startFullscreenProgress(activeIndex, normalizedProgress);
    }

    this.isFullscreenAnimating.set(false);
  }

  private readonly resolvePosition = (index: number, current: number, total: number): CarouselSlidePosition => {
    if (index === current) return 'center';
    if (total <= 1) return 'hidden';
    if (index === (current - 1 + total) % total) return 'left';
    if (index === (current + 1) % total) return 'right';

    return 'hidden';
  };

  private cardRootElement(): HTMLElement | null {
    return this.hostRef.nativeElement.querySelector<HTMLElement>('.carousel-root--card');
  }

  private cssNumber(variableName: string, fallback: number): number {
    if (!this.isBrowser) {
      return fallback;
    }

    const rawValue = getComputedStyle(this.hostRef.nativeElement).getPropertyValue(variableName).trim();
    const value = Number.parseFloat(rawValue);

    return Number.isFinite(value) ? value : fallback;
  }

  private cardSideScale(): number {
    return this.cssNumber('--carousel-card-side-scale', 0.84);
  }

  private cardWidth(): number {
    const items = this.cardItems();

    const currentItem = items[this.currentIndex()]?.elementRef.nativeElement;
    const firstItem = items[0]?.elementRef.nativeElement;

    return currentItem?.offsetWidth || firstItem?.offsetWidth || 0;
  }

  private cardSideOffset(): number {
    if (!this.isBrowser) {
      return 96;
    }

    const root = this.cardRootElement();

    const rootWidth = root?.clientWidth || this.hostRef.nativeElement.clientWidth;
    const cardWidth = this.cardWidth();

    const sideScale = this.cardSideScale();
    const maxOffset = this.cssNumber('--carousel-card-side-max-offset', 96);
    const minOffset = this.cssNumber('--carousel-card-side-min-offset', 34);
    const edgeGap = this.cssNumber('--carousel-card-side-edge-gap', 54);

    if (!rootWidth || !cardWidth) {
      return maxOffset;
    }

    const sideCardHalfWidth = (cardWidth * sideScale) / 2;
    const availableSpaceFromCenterToButton = rootWidth / 2 - edgeGap - sideCardHalfWidth;
    const offset = (availableSpaceFromCenterToButton / cardWidth) * 100;

    return Math.min(Math.max(offset, minOffset), maxOffset);
  }

  private cardMetrics(): { sideOffset: number; sideScale: number; hiddenX: number } {
    return {
      sideOffset: this.cardSideOffset(),
      sideScale: this.cardSideScale(),
      hiddenX: this.lastDirection === 'right' ? 180 : -280,
    };
  }

  private cardElements(): HTMLElement[] {
    return this.cardItems().map((item) => item.elementRef.nativeElement);
  }

  private slideElements(): HTMLElement[] {
    return (this.slideRefs?.toArray() ?? []).map((ref) => ref.nativeElement);
  }

  private navFillElements(): HTMLElement[] {
    return (this.navFillRefs?.toArray() ?? []).map((ref) => ref.nativeElement);
  }

  private fullscreenSlideElements(): HTMLElement[] {
    return (this.fullscreenSlideRefs?.toArray() ?? []).map((ref) => ref.nativeElement);
  }

  private fullscreenNavFillElements(): HTMLElement[] {
    return (this.fullscreenNavFillRefs?.toArray() ?? []).map((ref) => ref.nativeElement);
  }

  private animateCards(newIndex: number, animationId: number): void {
    const elements = this.cardElements();
    const total = elements.length;

    this.carouselScene.animateCards({
      elements,
      newIndex,
      total,
      metrics: this.cardMetrics(),
      resolvePosition: this.resolvePosition,
      onComplete: () => {
        if (animationId !== this.navigationId) return;
        this.isAnimating.set(false);
        this.emitActiveCardChange();
      },
    });
  }

  protected onTrackClick(event: MouseEvent): void {
    if (this.mode() !== 'card' || this.wasDragging) {
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

  protected onScreenshotRootInteraction(event: Event): void {
  if (this.mode() !== 'screenshot') {
    return;
  }

  if (!this.canUseScreenshotControls()) {
    return;
  }

  event.stopPropagation();
}

  protected onSlideClick(event: MouseEvent): void {
    if (this.wasDragging) {
      this.wasDragging = false;
      return;
    }

    if (!this.canUseScreenshotControls() || !this.active()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.openFullscreen(this.currentIndex());
  }

  protected onExpandClick(event: MouseEvent): void {
    if (!this.allowScreenshotControl(event) || !this.active()) return;

    this.openFullscreen(this.currentIndex());
  }

  protected onScreenshotDotClick(event: MouseEvent, index: number): void {
    if (!this.allowScreenshotControl(event)) return;

    this.goTo(index);
  }

  private animateSlides(fromIndex: number, toIndex: number, direction: CarouselDirection, animationId: number): void {
    this.carouselScene.animateSlides({
      slides: this.slideElements(),
      fromIndex,
      toIndex,
      direction,
      onMissingElements: () => {
        this.isAnimating.set(false);
      },
      onComplete: () => {
        if (animationId !== this.navigationId) return;
        this.isAnimating.set(false);
        this.syncNavFills(toIndex, 0);

        if (this.canRunInlineAutoplay()) {
          this.startProgress(toIndex, 0);
        }
      },
    });
  }

  private animateFullscreenSlides(fromIndex: number, toIndex: number, direction: CarouselDirection, animationId: number): void {
    this.carouselScene.animateSlides({
      slides: this.fullscreenSlideElements(),
      fromIndex,
      toIndex,
      direction,
      onMissingElements: () => {
        this.isFullscreenAnimating.set(false);
      },
      onComplete: () => {
        if (animationId !== this.fullscreenNavigationId) return;
        this.isFullscreenAnimating.set(false);
        this.syncFullscreenNavFills(toIndex, 0);

        if (this.canRunFullscreenAutoplay()) {
          this.startFullscreenProgress(toIndex, 0);
        }
      },
    });
  }

  private syncNavFills(activeIndex: number, activeProgress = 0): void {
    this.carouselScene.syncFills(this.navFillElements(), activeIndex, activeProgress);
  }

  private syncFullscreenNavFills(activeIndex: number, activeProgress = 0): void {
    this.carouselScene.syncFills(this.fullscreenNavFillElements(), activeIndex, activeProgress);
  }

  private startProgress(index: number, startProgress = 0): void {
    if (this.mode() !== 'screenshot') return;

    const normalizedProgress = this.normalizeProgress(startProgress);

    this.inlineProgressState = {
      index,
      startValue: normalizedProgress,
      startedAt: this.now(),
      paused: false,
    };

    this.carouselScene.startProgress('inline', {
      fills: this.navFillElements(),
      extraFills: this.fullscreenNavFillElements(),
      index,
      startProgress: normalizedProgress,
      durationMs: this.autoPlayDuration(),
      onComplete: () => {
        this.next();
      },
    });
  }

  private startFullscreenProgress(index: number, startProgress = 0): void {
    if (this.mode() !== 'screenshot') return;

    const normalizedProgress = this.normalizeProgress(startProgress);

    this.fullscreenProgressState = {
      index,
      startValue: normalizedProgress,
      startedAt: this.now(),
      paused: false,
    };

    this.carouselScene.startProgress('fullscreen', {
      fills: this.fullscreenNavFillElements(),
      extraFills: this.navFillElements(),
      index,
      startProgress: normalizedProgress,
      durationMs: this.autoPlayDuration(),
      onComplete: () => {
        this.fullscreenNext();
      },
    });
  }

  private stopProgress(): void {
    this.carouselScene.stopProgress('inline');
  }

  private stopFullscreenProgress(): void {
    this.carouselScene.stopProgress('fullscreen');
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
    return this.carouselScene.getFillProgress(this.navFillElements(), index);
  }

  private getFullscreenDomProgress(index: number): number {
    return this.carouselScene.getFillProgress(this.fullscreenNavFillElements(), index);
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

  private navigate(newIndex: number, direction: CarouselDirection): void {
    const now = Date.now();
    const total = this.itemsLength();

    if (!this.isBrowser || total <= 1 || now - this.lastNavigationTime < this.NAVIGATION_THROTTLE) return;

    const current = this.currentIndex();

    if (newIndex === current) return;

    this.lastNavigationTime = now;
    const animationId = ++this.navigationId;

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
      this.animateCards(newIndex, animationId);
      return;
    }

    this.animateSlides(current, newIndex, direction, animationId);
  }

  private navigateFullscreen(newIndex: number, direction: CarouselDirection): void {
    const now = Date.now();
    const total = this.images().length;
    const current = this.fullscreenActiveIndex();

    if (!this.isBrowser || total <= 1 || now - this.lastFullscreenNavigationTime < this.NAVIGATION_THROTTLE) return;
    if (newIndex === current) return;

    this.lastFullscreenNavigationTime = now;
    const animationId = ++this.fullscreenNavigationId;

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

    this.animateFullscreenSlides(current, newIndex, direction, animationId);
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
    if (!this.isDragging) return;

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
    if (this.itemsLength() <= 1) return;

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
