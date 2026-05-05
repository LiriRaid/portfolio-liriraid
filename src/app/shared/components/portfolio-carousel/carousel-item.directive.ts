import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[carouselItem]',
  standalone: true,
  host: { class: 'carousel-item' },
})
export class CarouselItem {
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
