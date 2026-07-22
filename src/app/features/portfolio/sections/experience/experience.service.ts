import { ElementRef, Injectable, QueryList } from '@angular/core';

import { getGsapSync, loadGsap } from '@shared/utils/gsap-loader';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  async animateEntrance(_hostRef: ElementRef<HTMLElement>, headerRef?: ElementRef<HTMLElement>, timelineRef?: ElementRef<HTMLElement>, lineRefs?: QueryList<ElementRef<HTMLElement>>, dotRefs?: QueryList<ElementRef<HTMLElement>>): Promise<void> {
    const lines = lineRefs?.map((ref) => ref.nativeElement) ?? [];
    const dots = dotRefs?.map((ref) => ref.nativeElement) ?? [];

    const cachedGsap = getGsapSync();

    if (cachedGsap) {
      if (lines.length) {
        cachedGsap.set(lines, { scaleY: 0, transformOrigin: 'center bottom' });
      }

      if (dots.length) {
        cachedGsap.set(dots, { scale: 0, opacity: 0, transformOrigin: 'center center' });
      }
    }

    const gsap = await loadGsap();
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (!cachedGsap) {
      if (lines.length) {
        gsap.set(lines, { scaleY: 0, transformOrigin: 'center bottom' });
      }

      if (dots.length) {
        gsap.set(dots, { scale: 0, opacity: 0, transformOrigin: 'center center' });
      }
    }

    if (headerRef?.nativeElement) {
      tl.fromTo(headerRef.nativeElement.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, clearProps: 'opacity,transform' });
    }

    if (timelineRef?.nativeElement) {
      const items = timelineRef.nativeElement.querySelectorAll('.experience-item');

      if (items.length) {
        tl.fromTo(items, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, clearProps: 'opacity,transform' }, '-=0.4');
      }
    }

    const lineDuration = 1.5;
    const lineStagger = 0.18;

    if (lines.length) {
      tl.to(lines, { scaleY: 1, duration: lineDuration, ease: 'power2.inOut', stagger: lineStagger, clearProps: 'transform' }, '+=0.15');
    }

    if (dots.length) {
      const dotStart = lines.length ? `<+=${lineDuration}` : '+=0.1';

      tl.to(dots, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.7)', stagger: lineStagger, clearProps: 'transform,opacity' }, dotStart);
    }
  }
}
