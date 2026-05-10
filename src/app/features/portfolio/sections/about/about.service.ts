import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  async animateEntrance(hostRef: ElementRef<HTMLElement>, contentRef?: ElementRef<HTMLElement>, statsRef?: ElementRef<HTMLElement>): Promise<void> {
    const { gsap } = await import('gsap');
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (hostRef?.nativeElement) {
      tl.set(hostRef.nativeElement, {
        '--a-inner-opacity': 1,
        '--a-inner-visibility': 'visible',
        clearProps: '--a-inner-opacity,--a-inner-visibility',
      });
    }

    if (contentRef?.nativeElement) {
      tl.fromTo(contentRef.nativeElement.children, 
        { opacity: 0, x: -30 }, 
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.15 }
      );
    }

    if (statsRef?.nativeElement) {
      tl.fromTo(statsRef.nativeElement.children, 
        { opacity: 0, x: 30 }, 
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.15 }, 
        "-=0.4"
      );
    }
  }
}
