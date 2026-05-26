import { Injectable } from '@angular/core';

import { GsapInstance, loadGsap } from '@shared/utils/gsap-loader';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private animateCodeCard(gsap: GsapInstance): void {
    if (window.matchMedia('(max-width: 1024px)').matches) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const codeCard = document.querySelector('.hero-code-card');

    if (!codeCard) {
      return;
    }

    const lines = codeCard.querySelectorAll('.whitespace-pre');

    if (!lines.length) {
      return;
    }

    const coloredTokens = codeCard.querySelectorAll<HTMLElement>(
      '.code-keyword, .code-prop, .code-string, .code-class',
    );

    gsap.set(lines, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(coloredTokens, { filter: 'saturate(0) brightness(0.7)' });

    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.style.cssText = 'display:inline-block;opacity:1;margin-left:1px;font-weight:300;';
    lines[lines.length - 1].appendChild(cursor);

    const tl = gsap.timeline({ delay: 0.8 });
    const blinkTl = gsap.timeline({ repeat: -1, yoyo: true, delay: 0.8 });
    blinkTl.to(cursor, { opacity: 0, duration: 0.35, ease: 'none' });

    const linesArray = Array.from(lines);

    linesArray.forEach((line, i) => {
      tl.to(
        line,
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.22,
          ease: 'steps(8)',
          onStart: () => {
            cursor.parentElement?.removeChild(cursor);
            line.appendChild(cursor);
          },
        },
        i * 0.1,
      );
    });

    const typingEnd = (linesArray.length - 1) * 0.1 + 0.22;

    tl.add(() => blinkTl.kill(), typingEnd + 0.05);
    tl.to(cursor, { opacity: 0, duration: 0.2, onComplete: () => cursor.remove() }, typingEnd + 0.05);

    if (coloredTokens.length) {
      tl.to(
        coloredTokens,
        {
          filter: 'saturate(1) brightness(1)',
          duration: 0.18,
          stagger: 0.03,
          ease: 'power2.out',
          onComplete: () => gsap.set(coloredTokens, { clearProps: 'filter' }),
        },
        typingEnd,
      );
    }
  }

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
      tl.fromTo(
        heroCodeCard,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.8, onStart: () => this.animateCodeCard(gsap) },
        '-=0.7',
      );
    }
  }
}
