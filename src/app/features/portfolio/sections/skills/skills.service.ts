import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  async animateEntrance(hostRef: ElementRef<HTMLElement>, headerRef?: ElementRef<HTMLElement>, gridRef?: ElementRef<HTMLElement>): Promise<void> {
    const { gsap } = await import('gsap');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (hostRef?.nativeElement) {
      tl.set(hostRef.nativeElement, {
        '--s-inner-opacity': 1,
        '--s-inner-visibility': 'visible',
        clearProps: '--s-inner-opacity,--s-inner-visibility',
      });
    }

    if (headerRef?.nativeElement) {
      tl.fromTo(headerRef.nativeElement.children, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }
      );
    }

    if (gridRef?.nativeElement) {
      tl.fromTo(gridRef.nativeElement.children, 
        { opacity: 0, y: 50, scale: 0.9 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15 }, 
        "-=0.5"
      );
    }
  }
}
