import { Injectable } from '@angular/core';

import { loadGsap } from '@shared/utils/gsap-loader';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  async animateEntrance(): Promise<void> {
    const gsap = await loadGsap();

    const heroAvatar = document.querySelector('.hero-avatar');
    const heroContentItems = document.querySelectorAll('.hero-content > *');
    const heroCodeCard = document.querySelector('.hero-code-card');

    if (!heroAvatar || heroContentItems.length === 0) {
      return;
    }

    const isStackedLayout = window.matchMedia('(max-width: 1024px)').matches;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (isStackedLayout) {
      tl.fromTo(heroAvatar, { opacity: 0, scale: 0.82, rotation: -6 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.75, ease: 'back.out(1.45)' }).fromTo(heroContentItems, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=0.35');

      return;
    }

    tl.fromTo(heroContentItems, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }).fromTo(heroAvatar, { opacity: 0, scale: 0.8, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.5)' }, '-=0.6');

    if (heroCodeCard) {
      tl.fromTo(heroCodeCard, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8 }, '-=0.7');
    }
  }
}
