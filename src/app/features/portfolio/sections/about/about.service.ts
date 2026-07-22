import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  async animateEntrance(_hostRef: ElementRef<HTMLElement>, contentRef?: ElementRef<HTMLElement>, statsRef?: ElementRef<HTMLElement>): Promise<void> {
    const { gsap } = await import('gsap');
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (contentRef?.nativeElement) {
      tl.fromTo(contentRef.nativeElement.children, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, clearProps: 'opacity,transform' });
    }

    if (statsRef?.nativeElement) {
      tl.fromTo(statsRef.nativeElement.children, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, clearProps: 'opacity,transform' }, '-=0.4');
    }
  }
}
