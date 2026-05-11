import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { gsap } from 'gsap';

import { I18N_MESSAGES } from './i18n.messages';
import { getInitialLanguage, setStoredLanguage } from './i18n-storage';

export type PortfolioLanguage = 'es' | 'en';

type LanguageRevealClips = {
  newStart: string;
  newEnd: string;
  oldEnd: string;
};

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly language = signal<PortfolioLanguage>('es');

  readonly isSpanish = computed(() => this.language() === 'es');
  readonly isEnglish = computed(() => this.language() === 'en');

  private switchingLanguage = false;

  private readonly textSelector = ['header .p-button-label', 'main h1 span', 'main h2', 'main h3', 'main h4', 'main p', 'main .p-button-label', 'main .hero-badge span', 'footer h2', 'footer h3', 'footer p', 'footer a', 'footer span', 'footer .p-button-label'].join(',');

  constructor() {
    const initialLanguage = getInitialLanguage();

    this.language.set(initialLanguage);
    this.applyDocumentLanguage(initialLanguage);
  }

  setLanguage(language: PortfolioLanguage): void {
    if (this.language() === language || this.switchingLanguage) {
      return;
    }

    if (!this.isBrowser || this.prefersReducedMotion()) {
      this.commitLanguage(language);
      return;
    }

    this.animateLanguageChange(language);
  }

  toggleLanguage(): void {
    this.setLanguage(this.language() === 'es' ? 'en' : 'es');
  }

  t(key: string): string {
    return I18N_MESSAGES[this.language()][key] ?? key;
  }

  private animateLanguageChange(language: PortfolioLanguage): void {
    const currentLanguage = this.language();
    const beforeTargets = this.getTranslatedTextTargets(currentLanguage);

    if (!beforeTargets.length) {
      this.commitLanguage(language);
      return;
    }

    this.switchingLanguage = true;

    const clips = this.getRevealClips(language);
    const clones = this.createTextClones(beforeTargets);

    gsap.killTweensOf(beforeTargets);
    gsap.killTweensOf(clones);

    gsap.set(beforeTargets, {
      opacity: 0,
    });

    this.commitLanguage(language);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const afterTargets = this.getTranslatedTextTargets(language);

        if (!afterTargets.length) {
          this.removeClones(clones);
          this.restoreTargets(beforeTargets);
          this.switchingLanguage = false;
          return;
        }

        this.runLanguageReveal({
          beforeTargets,
          afterTargets,
          clones,
          clips,
        });
      });
    });
  }

  private runLanguageReveal(options: { beforeTargets: HTMLElement[]; afterTargets: HTMLElement[]; clones: HTMLElement[]; clips: LanguageRevealClips }): void {
    const { beforeTargets, afterTargets, clones, clips } = options;
    const allTargets = Array.from(new Set([...beforeTargets, ...afterTargets]));

    gsap.killTweensOf(allTargets);
    gsap.killTweensOf(clones);

    gsap.set(afterTargets, {
      opacity: 0,
      filter: 'blur(2px)',
      clipPath: clips.newStart,
      willChange: 'opacity, filter, clip-path',
    });

    gsap.set(clones, {
      opacity: 1,
      filter: 'blur(0px)',
      clipPath: clips.newEnd,
      willChange: 'opacity, filter, clip-path',
    });

    const timeline = gsap.timeline({
      defaults: {
        overwrite: true,
      },
      onComplete: () => {
        this.removeClones(clones);
        this.restoreTargets(allTargets);
        this.switchingLanguage = false;
      },
    });

    timeline.to(
      clones,
      {
        opacity: 0.12,
        filter: 'blur(2px)',
        clipPath: clips.oldEnd,
        duration: 0.24,
        ease: 'power4.inOut',
        stagger: {
          each: 0.006,
          from: 'start',
        },
      },
      0,
    );

    timeline.to(
      afterTargets,
      {
        opacity: 1,
        filter: 'blur(0px)',
        clipPath: clips.newEnd,
        duration: 0.42,
        ease: 'expo.out',
        stagger: {
          each: 0.008,
          from: 'start',
        },
      },
      0.08,
    );
  }

  private getRevealClips(language: PortfolioLanguage): LanguageRevealClips {
    const verticalBleed = '-0.45em';

    if (language === 'en') {
      return {
        newStart: `inset(${verticalBleed} 100% ${verticalBleed} 0)`,
        newEnd: `inset(${verticalBleed} 0% ${verticalBleed} 0)`,
        oldEnd: `inset(${verticalBleed} 0 ${verticalBleed} 100%)`,
      };
    }

    return {
      newStart: `inset(${verticalBleed} 0 ${verticalBleed} 100%)`,
      newEnd: `inset(${verticalBleed} 0 ${verticalBleed} 0%)`,
      oldEnd: `inset(${verticalBleed} 100% ${verticalBleed} 0)`,
    };
  }

  private createTextClones(elements: HTMLElement[]): HTMLElement[] {
    return elements.map((element) => this.createTextClone(element)).filter((clone): clone is HTMLElement => Boolean(clone));
  }

  private createTextClone(element: HTMLElement): HTMLElement | null {
    const rect = element.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const computedStyle = getComputedStyle(element);
    const fontSize = Number.parseFloat(computedStyle.fontSize) || 16;

    const verticalBleed = Math.max(8, fontSize * 0.45);
    const horizontalBleed = Math.max(3, fontSize * 0.12);

    const clone = this.document.createElement('span');

    clone.textContent = element.textContent ?? '';

    clone.style.position = 'fixed';
    clone.style.left = `${rect.left - horizontalBleed}px`;
    clone.style.top = `${rect.top - verticalBleed}px`;
    clone.style.width = `${rect.width + horizontalBleed * 2}px`;
    clone.style.height = `${rect.height + verticalBleed * 2}px`;
    clone.style.zIndex = '2147483000';
    clone.style.pointerEvents = 'none';
    clone.style.overflow = 'hidden';
    clone.style.display = 'block';
    clone.style.boxSizing = 'border-box';

    clone.style.fontFamily = computedStyle.fontFamily;
    clone.style.fontSize = computedStyle.fontSize;
    clone.style.fontWeight = computedStyle.fontWeight;
    clone.style.fontStyle = computedStyle.fontStyle;
    clone.style.lineHeight = computedStyle.lineHeight;
    clone.style.letterSpacing = computedStyle.letterSpacing;
    clone.style.textAlign = computedStyle.textAlign;
    clone.style.textTransform = computedStyle.textTransform;
    clone.style.whiteSpace = computedStyle.whiteSpace;
    clone.style.color = computedStyle.color;

    clone.style.padding = `${verticalBleed}px ${horizontalBleed}px`;
    clone.style.margin = '0';
    clone.style.border = '0';
    clone.style.background = 'transparent';

    this.document.body.appendChild(clone);

    return clone;
  }

  private removeClones(clones: HTMLElement[]): void {
    for (const clone of clones) {
      gsap.killTweensOf(clone);
      clone.remove();
    }
  }

  private restoreTargets(elements: HTMLElement[]): void {
    const uniqueElements = Array.from(new Set(elements));

    for (const element of uniqueElements) {
      gsap.killTweensOf(element);

      gsap.set(element, {
        clearProps: 'opacity,filter,clipPath,willChange',
      });
    }
  }

  private commitLanguage(language: PortfolioLanguage): void {
    this.language.set(language);
    setStoredLanguage(language);
    this.applyDocumentLanguage(language);
  }

  private applyDocumentLanguage(language: PortfolioLanguage): void {
    if (!this.isBrowser) {
      return;
    }

    this.document.documentElement.lang = language;
  }

  private getTranslatedTextTargets(language: PortfolioLanguage): HTMLElement[] {
    const translatedTexts = this.getDictionaryValues(language);
    const elements = Array.from(this.document.querySelectorAll<HTMLElement>(this.textSelector));

    return elements.filter((element) => {
      if (!this.isValidTextTarget(element)) {
        return false;
      }

      const text = this.normalizeText(element.textContent);

      if (!translatedTexts.has(text)) {
        return false;
      }

      const rect = element.getBoundingClientRect();

      return rect.width > 0 && rect.height > 0;
    });
  }

  private getDictionaryValues(language: PortfolioLanguage): Set<string> {
    return new Set(
      Object.values(I18N_MESSAGES[language])
        .map((value) => this.normalizeText(value))
        .filter(Boolean),
    );
  }

  private normalizeText(value: string | null | undefined): string {
    return value?.replace(/\s+/g, ' ').trim() ?? '';
  }

  private isValidTextTarget(element: HTMLElement): boolean {
    if (element.closest('[aria-hidden="true"]')) {
      return false;
    }

    if (element.closest('portfolio-language-toggle')) {
      return false;
    }

    if (element.closest('portfolio-background-animation')) {
      return false;
    }

    if (element.closest('.hero-tech')) {
      return false;
    }

    const text = element.textContent?.trim();

    return Boolean(text);
  }

  private prefersReducedMotion(): boolean {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
