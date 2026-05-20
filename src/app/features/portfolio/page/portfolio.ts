import { Component, afterNextRender, signal } from '@angular/core';
import { Hero } from '../sections/hero/hero';
import { Experience } from '../sections/experience/experience';
import { Projects } from '../sections/projects/projects';
import { Skills } from '../sections/skills/skills';
import { About } from '../sections/about/about';
import { Contact } from '../sections/contact/contact';
import { PortfolioBackgroundAnimation } from '../ui/portfolio-background-animation/portfolio-background-animation';

const INTERACTION_EVENTS = ['pointerdown', 'pointerover', 'wheel', 'touchstart', 'keydown', 'scroll'] as const;

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [Hero, Experience, Projects, Skills, About, Contact, PortfolioBackgroundAnimation],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class Portfolio {
  // Gates @defer prefetch of the below-the-fold sections until the user shows
  // intent. Avoids downloading those chunks eagerly (Lighthouse "unused JS")
  // while keeping section-jump navigation correct: the first interaction fires
  // before the user reaches the nav, so chunks are prefetched in time.
  protected readonly hasInteracted = signal(false);

  constructor() {
    afterNextRender(() => {
      const onFirstInteraction = (): void => {
        this.hasInteracted.set(true);

        for (const eventName of INTERACTION_EVENTS) {
          window.removeEventListener(eventName, onFirstInteraction);
        }
      };

      for (const eventName of INTERACTION_EVENTS) {
        window.addEventListener(eventName, onFirstInteraction, { once: true, passive: true });
      }
    });
  }
}
