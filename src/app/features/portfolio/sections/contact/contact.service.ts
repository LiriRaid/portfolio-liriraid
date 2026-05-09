import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  async animateEntrance(contentRef?: ElementRef<HTMLElement>, formRef?: ElementRef<HTMLElement>): Promise<void> {
    const { gsap } = await import('gsap');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (contentRef?.nativeElement) {
      tl.fromTo(contentRef.nativeElement.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 });
    }

    if (formRef?.nativeElement) {
      tl.fromTo(formRef.nativeElement, { opacity: 0, x: 30, scale: 0.98 }, { opacity: 1, x: 0, scale: 1, duration: 0.8 }, '-=0.5');
    }
  }
}
