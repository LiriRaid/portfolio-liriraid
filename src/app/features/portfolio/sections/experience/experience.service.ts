import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  async animateEntrance(hostRef: ElementRef<HTMLElement>, headerRef?: ElementRef<HTMLElement>, timelineRef?: ElementRef<HTMLElement>): Promise<void> {
    const { gsap } = await import('gsap');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (hostRef?.nativeElement) {
      tl.set(hostRef.nativeElement, {
        '--e-inner-opacity': 1,
        '--e-inner-visibility': 'visible',
        clearProps: '--e-inner-opacity,--e-inner-visibility',
      });
    }

    if (headerRef?.nativeElement) {
      tl.fromTo(headerRef.nativeElement.children, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }
      );
    }

    if (timelineRef?.nativeElement) {
      const items = timelineRef.nativeElement.querySelectorAll('.experience-item');
      
      if (items.length) {
        tl.fromTo(items, 
          { opacity: 0, x: -30 }, 
          { opacity: 1, x: 0, duration: 0.8, stagger: 0.2 }, 
          "-=0.4"
        );
      }
    }
  }
}
