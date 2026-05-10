import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  async animateEntrance(): Promise<void> {
    const { gsap } = await import('gsap');

    const isStackedLayout = window.matchMedia('(max-width: 1024px)').matches;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (isStackedLayout) {
      tl.fromTo('.hero-avatar', { opacity: 0, scale: 0.82, rotation: -6 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.75, ease: 'back.out(1.45)' }).fromTo('.hero-content > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=0.35');

      return;
    }

    tl.fromTo('.hero-content > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }).fromTo('.hero-avatar', { opacity: 0, scale: 0.8, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.5)' }, '-=0.6').fromTo('.font-mono', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8 }, '-=0.7');
  }
}
