import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, afterNextRender, inject } from '@angular/core';
import { PortfolioBackgroundAnimationService } from './portfolio-background-animation.service';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly animationService = inject(PortfolioBackgroundAnimationService);

  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  protected readonly enabled = this.animationService.enabled;

  constructor() {
    afterNextRender(() => {
      this.animationService.initialize(
        this.canvasRef.nativeElement,
        this.elementRef.nativeElement,
      );
    });

    this.destroyRef.onDestroy(() => {
      this.animationService.destroy();
    });
  }
}
