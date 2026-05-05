import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import gsap from 'gsap';

import { PortfolioIcon } from '../portfolio-icon/portfolio-icon';
import { CarouselItem } from './carousel-item.directive';

type CarouselMode = 'card' | 'screenshot';
type SlidePosition = 'center' | 'left' | 'right' | 'hidden';
type Direction = 'left' | 'right';

@Component({
  selector: 'portfolio-carousel',
  standalone: true,
  imports: [PortfolioIcon],
  templateUrl: './portfolio-carousel.html',
  styleUrl: './portfolio-carousel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioCarousel implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);

  readonly mode = input<CarouselMode>('screenshot');
  readonly images = input<string[]>([]);
  readonly autoPlay = input<boolean>(true);
  readonly autoPlayDuration = input<number>(4000);

  protected readonly currentIndex = signal(0);
  protected readonly fullscreenIndex = signal<number | null>(null);
  protected readonly isAnimating = signal(false);

  protected readonly cardItems = contentChildren(CarouselItem, { descendants: true });

  @ViewChildren('slideRef') private slideRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('navFillRef') private navFillRefs!: QueryList<ElementRef<HTMLElement>>;

  protected readonly itemsLength = computed(() => {
    return this.mode() === 'card' ? this.cardItems().length : this.images().length;
  });

  protected readonly fullscreenSrc = computed(() => {
    const index = this.fullscreenIndex();
    return index === null ? null : (this.images()[index] ?? null);
  });

  private didInit = false;
  private lastDirection: Direction = 'right';

  private isDragging = false;
  private wasDragging = false;
  private dragStartX = 0;
  private dragStartTime = 0;
  private touchStartX = 0;

  private progressTween?: gsap.core.Tween;

  private readonly DRAG_THRESHOLD = 50;
  private readonly DRAG_TIME_THRESHOLD = 120;
  private readonly CARD_DURATION = 0.6;
  private readonly SLIDE_DURATION = 0.72;

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;

      this.didInit = true;
      this.initPositions();
    });

    effect(() => {
      const mode = this.mode();
      const imagesLength = this.images().length;
      const cardsLength = this.cardItems().length;

      if (!this.isBrowser || !this.didInit) return;

      const total = mode === 'card' ? cardsLength : imagesLength;

      if (total <= 0) {
        this.currentIndex.set(0);
        this.stopProgress();
        return;
      }

      if (this.currentIndex() >= total) {
        this.currentIndex.set(0);
      }

      queueMicrotask(() => {
        this.initPositions();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.stopProgress();
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const slideChangesSubscription = this.slideRefs.changes.subscribe(() => {
      if (this.mode() === 'screenshot') {
        queueMicrotask(() => this.initScreenshotPositions());
      }
    });

    const navChangesSubscription = this.navFillRefs.changes.subscribe(() => {
      if (this.mode() === 'screenshot') {
        queueMicrotask(() => {
          this.syncNavFills(this.currentIndex());

          if (this.autoPlay() && this.images().length > 1) {
            this.startProgress(this.currentIndex());
          }
        });
      }
    });

    this.destroyRef.onDestroy(() => {
      slideChangesSubscription.unsubscribe();
      navChangesSubscription.unsubscribe();
    });
  }

  private initPositions(): void {
    if (!this.isBrowser) return;

    if (this.mode() === 'card') {
      this.initCardPositions();
      return;
    }

    this.initScreenshotPositions();
  }

  private initCardPositions(): void {
    const items = this.cardItems();
    const total = items.length;

    if (!total) return;

    this.stopProgress();

    items.forEach((item, index) => {
      const element = item.elementRef.nativeElement;

      gsap.killTweensOf(element);
      gsap.set(element, {
        clearProps: 'transform',
      });

      gsap.set(element, this.cardProps(this.resolvePosition(index, this.currentIndex(), total)));
    });

    this.isAnimating.set(false);
  }

  private initScreenshotPositions(): void {
    const slides = this.slideRefs?.toArray() ?? [];

    if (!slides.length) return;

    this.stopProgress();

    slides.forEach((ref, index) => {
      gsap.killTweensOf(ref.nativeElement);

      gsap.set(ref.nativeElement, {
        xPercent: index === this.currentIndex() ? 0 : 100,
        zIndex: index === this.currentIndex() ? 10 : 1,
        opacity: 1,
      });
    });

    this.syncNavFills(this.currentIndex());

    if (this.autoPlay() && this.images().length > 1) {
      this.startProgress(this.currentIndex());
    }
  }

  private resolvePosition(index: number, current: number, total: number): SlidePosition {
    if (index === current) return 'center';
    if (total <= 1) return 'hidden';
    if (index === (current - 1 + total) % total) return 'left';
    if (index === (current + 1) % total) return 'right';

    return 'hidden';
  }

  private cardProps(position: SlidePosition): gsap.TweenVars {
    const hiddenX = this.lastDirection === 'right' ? 230 : -330;

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
        xPercent: -132,
        yPercent: 0,
        scale: 0.86,
        opacity: 0.42,
        zIndex: 20,
        filter: 'blur(0.2px)',
        pointerEvents: 'auto',
      },
      right: {
        xPercent: 32,
        yPercent: 0,
        scale: 0.86,
        opacity: 0.42,
        zIndex: 20,
        filter: 'blur(0.2px)',
        pointerEvents: 'auto',
      },
      hidden: {
        xPercent: hiddenX,
        yPercent: 0,
        scale: 0.86,
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

    items.forEach((item, index) => {
      gsap.to(item.elementRef.nativeElement, {
        ...this.cardProps(this.resolvePosition(index, newIndex, total)),
        duration: this.CARD_DURATION,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    });

    gsap.delayedCall(this.CARD_DURATION, () => {
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
          this.syncNavFills(toIndex);

          if (this.autoPlay()) {
            this.startProgress(toIndex);
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

  protected onSlideClick(): void {
    if (this.isAnimating() || this.wasDragging) {
      this.wasDragging = false;
      return;
    }

    this.openFullscreen(this.currentIndex());
  }

  private syncNavFills(activeIndex: number): void {
    const fills = this.navFillRefs?.toArray() ?? [];

    fills.forEach((ref, index) => {
      gsap.set(ref.nativeElement, {
        scaleX: index < activeIndex ? 1 : 0,
      });
    });
  }

  private startProgress(index: number): void {
    if (this.mode() !== 'screenshot') return;

    this.stopProgress();

    const fills = this.navFillRefs?.toArray() ?? [];
    const fill = fills[index]?.nativeElement;

    if (!fill) return;

    gsap.set(fill, { scaleX: 0 });

    this.progressTween = gsap.to(fill, {
      scaleX: 1,
      duration: this.autoPlayDuration() / 1000,
      ease: 'none',
      onComplete: () => {
        this.next();
      },
    });
  }

  private stopProgress(): void {
    this.progressTween?.kill();
    this.progressTween = undefined;
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

    if (this.mode() === 'card') {
      this.animateCards(newIndex);
      return;
    }

    this.animateSlides(current, newIndex, direction);
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

    this.isDragging = true;
    this.wasDragging = false;
    this.dragStartX = event.clientX;
    this.dragStartTime = Date.now();
  }

  protected onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.isAnimating()) return;

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

  protected onMouseUp(): void {
    this.isDragging = false;
  }

  protected onTrackMouseEnter(): void {
    if (this.mode() === 'screenshot' && this.autoPlay()) {
      this.progressTween?.pause();
    }
  }

  protected onTrackMouseLeave(): void {
    this.isDragging = false;

    if (this.mode() === 'screenshot' && this.autoPlay() && !this.isAnimating()) {
      this.progressTween?.resume();
    }
  }

  protected onTouchStart(event: TouchEvent): void {
    if (this.itemsLength() <= 1) return;

    this.wasDragging = false;
    this.touchStartX = event.touches[0]?.clientX ?? 0;
  }

  protected onTouchEnd(event: TouchEvent): void {
    if (this.itemsLength() <= 1 || this.isAnimating()) return;

    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = endX - this.touchStartX;

    if (Math.abs(delta) < this.DRAG_THRESHOLD) return;

    this.wasDragging = true;

    delta > 0 ? this.prev() : this.next();
  }

  protected openFullscreen(index: number): void {
    if (this.mode() !== 'screenshot') return;

    this.stopProgress();
    this.fullscreenIndex.set(index);
  }

  protected closeFullscreen(): void {
    this.fullscreenIndex.set(null);

    if (this.mode() === 'screenshot' && this.autoPlay() && this.images().length > 1) {
      this.startProgress(this.currentIndex());
    }
  }

  protected fullscreenPrev(): void {
    const index = this.fullscreenIndex();
    const total = this.images().length;

    if (index === null || total <= 1) return;

    this.fullscreenIndex.set((index - 1 + total) % total);
  }

  protected fullscreenNext(): void {
    const index = this.fullscreenIndex();
    const total = this.images().length;

    if (index === null || total <= 1) return;

    this.fullscreenIndex.set((index + 1) % total);
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
