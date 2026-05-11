import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  async animateEntrance(_hostRef: ElementRef<HTMLElement>, headerRef?: ElementRef<HTMLElement>, timelineRef?: ElementRef<HTMLElement>): Promise<void> {
    const { gsap } = await import('gsap');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (headerRef?.nativeElement) {
      tl.fromTo(headerRef.nativeElement.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, clearProps: 'opacity,transform' });
    }

    if (timelineRef?.nativeElement) {
      const items = timelineRef.nativeElement.querySelectorAll('.experience-item');

      if (items.length) {
        tl.fromTo(items, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, clearProps: 'opacity,transform' }, '-=0.4');
      }
    }
  }
}
