import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  async animateEntrance(): Promise<void> {
    const { gsap } = await import('gsap');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Stagger for content items (badge, title, desc, buttons, tech stack)
    tl.fromTo('.hero-content > *', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
    )
    // Avatar animation with a slight bounce
    .fromTo('.hero-avatar', 
      { opacity: 0, scale: 0.8, rotation: -8 }, 
      { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.5)' }, 
      "-=0.6"
    )
    // Code block slide in
    .fromTo('.font-mono', 
      { opacity: 0, x: 40 }, 
      { opacity: 1, x: 0, duration: 0.8 }, 
      "-=0.7"
    );
  }
}
