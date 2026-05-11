import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ApplicationRef, Injectable, NgZone, PLATFORM_ID, REQUEST, computed, inject, signal } from '@angular/core';
import { gsap } from 'gsap';

import { I18N_MESSAGES } from './i18n.messages';
import { resolveInitialLanguage, setStoredLanguage } from './i18n-storage';

export type PortfolioLanguage = 'es' | 'en';

type TargetGroups = {
  freeTargets: HTMLElement[];
  containedTargets: HTMLElement[];
};

type LayoutSectionConfig = {
  sectionClass: string;
  selectors: string[];
};

type FlipOptions = {
  duration: number;
  ease: string;
  transformOrigin?: string;
};

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly appRef = inject(ApplicationRef);
  private readonly ngZone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly language = signal<PortfolioLanguage>('es');

  readonly isSpanish = computed(() => this.language() === 'es');
  readonly isEnglish = computed(() => this.language() === 'en');

  private switchingLanguage = false;
  private pendingLanguage: PortfolioLanguage | null = null;

  private animationRunId = 0;
  private activeTimeline: gsap.core.Timeline | null = null;
  private activeTweens: gsap.core.Tween[] = [];
  private activeTextTargets: HTMLElement[] = [];
  private activeLayoutTargets: HTMLElement[] = [];
  private activeIconTargets: HTMLElement[] = [];

  private readonly switchingClass = 'portfolio-i18n-switching';
  private readonly switchingStyleId = 'portfolio-i18n-switching-style';
  private readonly viewportBuffer = 120;

  private readonly translatedTexts = this.createTranslatedTexts();

  private readonly animatedTextSelector = ['main h1 span', 'main h2', 'main h3', 'main h4', 'main p', 'main .p-button-label', 'main .hero-badge span', 'main .stat-label', 'main .github-label', 'main label', 'main input', 'main textarea', 'main li > span:not([aria-hidden="true"])', 'main [data-i18n-text]', 'header nav a', 'header .p-button-label', 'footer .footer-tagline', 'footer .footer-copy', 'footer .p-button-label', 'footer [data-i18n-text]'].join(',');

  private readonly iconFollowSelector = ['.p-button-icon', 'lucide-icon', 'portfolio-icon', 'svg[role="img"]', '[data-i18n-follow]'].join(',');

  private readonly animatedTextExcludedClosestSelectors = ['[aria-hidden="true"]', 'portfolio-language-toggle', 'portfolio-background-animation', '.no-i18n-animation', '.hero-tech', 'portfolio-icon', 'lucide-icon'];

  private readonly translatedOnlyExcludedClosestSelectors = ['.experience-tags', '.projects-tags', '.projects-selected-tag', '.projects-filter-option', '.skill-badge', '.github-strong', '.github-languages'];

  private readonly iconExcludedClosestSelectors = ['portfolio-language-toggle', 'portfolio-github-stats', 'portfolio-background-animation', '.hero-tech', '.experience-tags', '.projects-tags', '.projects-selected-tag', '.projects-filter-option', '.skill-badge', '.github-strong', '.github-languages', '.projects-stat', '.projects-filter-button', 'portfolio-input'];

  private readonly layoutExcludedClosestSelectors = ['header', 'portfolio-language-toggle', 'portfolio-background-animation', '.no-i18n-animation'];

  private readonly layoutExcludedMatchesSelectors = ['.projects-carousel', 'portfolio-carousel', '.carousel-root', '.carousel-root--card', '.carousel-track', '.projects-card-shell', '.projects-card', '.projects-card-carousel'].join(',');

  private readonly nestedLayoutKeepSelector = ['.projects-toolbar', '.projects-selected-tags', '.projects-results', '.skills-grid', '.contact-content', '.contact-social', '.contact-social portfolio-button', '.contact-form-wrap', '.contact-form', '.about-content', '.about-stats', '.github-stats', '[data-i18n-layout]'].join(',');

  private readonly layoutSections: LayoutSectionConfig[] = [
    {
      sectionClass: 'projects',
      selectors: ['.projects-toolbar', '.projects-selected-tags', '.projects-results'],
    },
    {
      sectionClass: 'skills',
      selectors: ['.skills-grid'],
    },
    {
      sectionClass: 'contact',
      selectors: ['.contact-content', '.contact-social', '.contact-social portfolio-button', '.contact-form-wrap', '.contact-form'],
    },
    {
      sectionClass: 'about',
      selectors: ['.about-content', '.about-stats', '.github-stats'],
    },
    {
      sectionClass: 'experience',
      selectors: ['.experience-timeline', '.experience-card', '.experience-content'],
    },
  ];

  private readonly githubDynamicKeys = ['about.github.updated', 'about.github.syncing', 'about.github.language'];

  initialize(): void {
    const acceptLanguage = this.request?.headers?.get('accept-language') ?? null;
    const cookieHeader = this.request?.headers?.get('cookie') ?? null;

    const initial = resolveInitialLanguage({
      cookieHeader,
      acceptLanguage,
      isBrowser: this.isBrowser,
    });

    this.language.set(initial);
    this.applyDocumentLanguage(initial);
  }

  setLanguage(language: PortfolioLanguage): void {
    if (this.switchingLanguage) {
      this.pendingLanguage = language;
      return;
    }

    if (this.language() === language) {
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
    this.ensureSwitchingStyle();
    this.cancelActiveAnimation();

    const targets = this.collectAnimationTargets();

    if (!targets.length) {
      this.commitLanguage(language);
      return;
    }

    const runId = ++this.animationRunId;
    const { freeTargets, containedTargets } = this.groupTargets(targets);

    this.switchingLanguage = true;
    this.document.documentElement.classList.add(this.switchingClass);

    this.activeTextTargets = [...targets];

    gsap.killTweensOf(targets);

    const icons = this.collectIconsToFlip(targets);
    const iconRects = this.createRectMap(icons);

    const layoutElements = this.collectLayoutElements(targets);
    const layoutRects = this.createRectMap(layoutElements);

    this.activeIconTargets = [...icons];
    this.activeLayoutTargets = [...layoutElements];

    const timeline = gsap.timeline();
    this.activeTimeline = timeline;

    this.animateCurrentLanguageOut(timeline, freeTargets, containedTargets);

    timeline.call(() => {
      if (!this.isCurrentRun(runId)) {
        return;
      }

      this.commitLanguageAndFlush(language);
      this.playFlipOnLayout(layoutElements, layoutRects);
      this.playFlipOnIcons(icons, iconRects);
      this.animateNextLanguageTargets(runId);
    });
  }

  private animateCurrentLanguageOut(timeline: gsap.core.Timeline, freeTargets: HTMLElement[], containedTargets: HTMLElement[]): void {
    if (freeTargets.length) {
      timeline.to(
        freeTargets,
        {
          opacity: 0,
          yPercent: -52,
          duration: 0.24,
          ease: 'power2.in',
          stagger: {
            each: 0.024,
            from: 'start',
            grid: 'auto',
          },
        },
        0,
      );
    }

    if (containedTargets.length) {
      timeline.to(
        containedTargets,
        {
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in',
          stagger: {
            each: 0.01,
            from: 'start',
            grid: 'auto',
          },
        },
        0,
      );
    }
  }

  private animateNextLanguageTargets(runId: number): void {
    const nextTargets = this.collectAnimationTargets();

    if (!this.isCurrentRun(runId)) {
      return;
    }

    if (!nextTargets.length) {
      this.finishLanguageSwitch(runId);
      return;
    }

    const { freeTargets, containedTargets } = this.groupTargets(nextTargets);

    this.activeTextTargets = this.uniqueElements([...this.activeTextTargets, ...nextTargets]);

    gsap.killTweensOf(nextTargets);

    const totalAnimations = Number(freeTargets.length > 0) + Number(containedTargets.length > 0);

    if (!totalAnimations) {
      this.finishLanguageSwitch(runId);
      return;
    }

    let completedAnimations = 0;

    const completeOneAnimation = (): void => {
      if (!this.isCurrentRun(runId)) {
        return;
      }

      completedAnimations += 1;

      if (completedAnimations >= totalAnimations) {
        this.finishLanguageSwitch(runId);
      }
    };

    if (freeTargets.length) {
      gsap.set(freeTargets, {
        opacity: 0,
        yPercent: 52,
      });

      this.trackTween(
        gsap.to(freeTargets, {
          opacity: 1,
          yPercent: 0,
          duration: 0.58,
          ease: 'power2.out',
          stagger: {
            each: 0.045,
            from: 'start',
            grid: 'auto',
          },
          clearProps: 'opacity,transform,willChange',
          onComplete: completeOneAnimation,
        }),
      );
    }

    if (containedTargets.length) {
      gsap.set(containedTargets, {
        opacity: 0,
      });

      this.trackTween(
        gsap.to(containedTargets, {
          opacity: 1,
          duration: 0.34,
          ease: 'power2.out',
          stagger: {
            each: 0.01,
            from: 'start',
            grid: 'auto',
          },
          clearProps: 'opacity,willChange',
          onComplete: completeOneAnimation,
        }),
      );
    }
  }

  private commitLanguageAndFlush(language: PortfolioLanguage): void {
    this.ngZone.run(() => {
      this.commitLanguage(language);
      this.appRef.tick();
    });
  }

  private finishLanguageSwitch(runId?: number): void {
    if (runId !== undefined && !this.isCurrentRun(runId)) {
      return;
    }

    this.resetActiveAnimationState();
    this.clearActiveAnimationState();

    this.document.documentElement.classList.remove(this.switchingClass);

    this.switchingLanguage = false;

    const pending = this.pendingLanguage;
    this.pendingLanguage = null;

    if (pending !== null && pending !== this.language()) {
      this.setLanguage(pending);
    }
  }

  private cancelActiveAnimation(): void {
    this.activeTimeline?.kill();
    this.activeTimeline = null;

    this.activeTweens.forEach((tween) => tween.kill());
    this.activeTweens = [];

    this.resetActiveAnimationState();
    this.clearActiveAnimationState();

    this.document.documentElement.classList.remove(this.switchingClass);
  }

  private resetActiveAnimationState(): void {
    if (!this.isBrowser) {
      return;
    }

    const textTargets = this.uniqueElements(this.activeTextTargets);
    const layoutTargets = this.uniqueElements(this.activeLayoutTargets);
    const iconTargets = this.uniqueElements(this.activeIconTargets);
    const { freeTargets, containedTargets } = this.groupTargets(textTargets);

    gsap.killTweensOf([...textTargets, ...layoutTargets, ...iconTargets]);

    if (freeTargets.length) {
      gsap.set(freeTargets, {
        opacity: 1,
        yPercent: 0,
        y: 0,
        clearProps: 'opacity,transform,willChange',
      });
    }

    if (containedTargets.length) {
      gsap.set(containedTargets, {
        opacity: 1,
        clearProps: 'opacity,willChange',
      });
    }

    if (layoutTargets.length) {
      gsap.set(layoutTargets, {
        x: 0,
        y: 0,
        clearProps: 'transform,willChange',
      });
    }

    if (iconTargets.length) {
      gsap.set(iconTargets, {
        x: 0,
        y: 0,
        clearProps: 'transform,willChange',
      });
    }
  }

  private clearActiveAnimationState(): void {
    this.activeTimeline = null;
    this.activeTweens = [];
    this.activeTextTargets = [];
    this.activeLayoutTargets = [];
    this.activeIconTargets = [];
  }

  private ensureSwitchingStyle(): void {
    if (!this.isBrowser || this.document.getElementById(this.switchingStyleId)) {
      return;
    }

    const style = this.document.createElement('style');

    style.id = this.switchingStyleId;
    style.textContent = `
      html.${this.switchingClass} portfolio-input label {
        transition-property: top, right, bottom, left, transform, color, background-color, font-size, line-height !important;
        transition-duration: 180ms !important;
        transition-timing-function: ease !important;
      }

      html.${this.switchingClass} portfolio-input legend {
        transition-property: max-width !important;
        transition-duration: 180ms !important;
        transition-timing-function: ease !important;
      }

      html.${this.switchingClass} portfolio-input .portfolio-input-field,
      html.${this.switchingClass} portfolio-input .portfolio-input-field::placeholder,
      html.${this.switchingClass} textarea,
      html.${this.switchingClass} textarea::placeholder {
        animation: none !important;
      }
    `;

    this.document.head.appendChild(style);
  }

  private collectAnimationTargets(): HTMLElement[] {
    const elements = Array.from(this.document.querySelectorAll<HTMLElement>(this.animatedTextSelector));

    return elements.filter((element) => this.canAnimateTextElement(element, elements));
  }

  private canAnimateTextElement(element: HTMLElement, allCandidates: HTMLElement[]): boolean {
    const isExplicitI18nText = element.hasAttribute('data-i18n-text');

    if (this.hasClosest(element, this.animatedTextExcludedClosestSelectors)) {
      return false;
    }

    if (!isExplicitI18nText && this.hasClosest(element, this.translatedOnlyExcludedClosestSelectors)) {
      return false;
    }

    if (element.classList.contains('stat-value')) {
      return false;
    }

    if (this.hasAnimatedAncestor(element, allCandidates)) {
      return false;
    }

    if (!this.isVisibleElement(element) || !this.isInsideAnimationViewport(element)) {
      return false;
    }

    return this.isTranslatedElement(element);
  }

  private hasAnimatedAncestor(element: HTMLElement, targets: HTMLElement[]): boolean {
    let parent = element.parentElement;

    while (parent) {
      if (targets.includes(parent)) {
        return true;
      }

      parent = parent.parentElement;
    }

    return false;
  }

  private groupTargets(targets: HTMLElement[]): TargetGroups {
    return {
      freeTargets: targets.filter((target) => !this.isContainedTextTarget(target)),
      containedTargets: targets.filter((target) => this.isContainedTextTarget(target)),
    };
  }

  private isContainedTextTarget(element: HTMLElement): boolean {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || Boolean(element.closest('portfolio-input')) || Boolean(element.closest('.textarea'));
  }

  private collectIconsToFlip(animatedTargets: HTMLElement[]): HTMLElement[] {
    return Array.from(this.document.querySelectorAll<HTMLElement>(this.iconFollowSelector)).filter((element) => {
      if (this.hasClosest(element, this.iconExcludedClosestSelectors)) {
        return false;
      }

      if (!this.isVisibleElement(element) || !this.isInsideAnimationViewport(element)) {
        return false;
      }

      if (element.hasAttribute('data-i18n-follow')) {
        return true;
      }

      return this.isIconBesideAnimatedText(element, animatedTargets);
    });
  }

  private isIconBesideAnimatedText(icon: HTMLElement, animatedTargets: HTMLElement[]): boolean {
    const container = icon.closest<HTMLElement>('button, a, .p-button, [role="button"], li, .inline-flex');

    if (!container) {
      return false;
    }

    return animatedTargets.some((target) => container.contains(target) && target !== container);
  }

  private collectLayoutElements(animatedTargets: HTMLElement[]): HTMLElement[] {
    const elements = new Set<HTMLElement>();

    animatedTargets.forEach((target) => {
      const explicitLayout = target.closest<HTMLElement>('[data-i18n-layout]');

      if (explicitLayout) {
        elements.add(explicitLayout);
      }

      this.collectSectionLayoutElements(target).forEach((element) => {
        elements.add(element);
      });
    });

    return this.filterLayoutElements(Array.from(elements), animatedTargets);
  }

  private collectSectionLayoutElements(target: HTMLElement): HTMLElement[] {
    const section = target.closest<HTMLElement>('section');

    if (!section) {
      return [];
    }

    const config = this.layoutSections.find((item) => section.classList.contains(item.sectionClass));

    if (!config) {
      return [];
    }

    return config.selectors.flatMap((selector) => Array.from(section.querySelectorAll<HTMLElement>(selector)));
  }

  private filterLayoutElements(elements: HTMLElement[], animatedTargets: HTMLElement[]): HTMLElement[] {
    const visible = elements.filter((element) => this.canAnimateLayoutElement(element, animatedTargets));

    return visible.filter((element) => !this.hasNestedPreferredLayoutElement(element, visible));
  }

  private canAnimateLayoutElement(element: HTMLElement, animatedTargets: HTMLElement[]): boolean {
    if (animatedTargets.includes(element)) {
      return false;
    }

    if (this.hasClosest(element, this.layoutExcludedClosestSelectors)) {
      return false;
    }

    if (element.matches(this.layoutExcludedMatchesSelectors)) {
      return false;
    }

    if (element.closest('.projects-card')) {
      return false;
    }

    return this.isVisibleElement(element) && this.isInsideAnimationViewport(element);
  }

  private hasNestedPreferredLayoutElement(element: HTMLElement, visibleElements: HTMLElement[]): boolean {
    return visibleElements.some((other) => {
      if (other === element) {
        return false;
      }

      if (!element.contains(other)) {
        return false;
      }

      return other.matches(this.nestedLayoutKeepSelector);
    });
  }

  private playFlipOnLayout(elements: HTMLElement[], previous: Map<HTMLElement, DOMRect>): void {
    elements.forEach((element) => {
      this.trackTween(
        this.playFlip(element, previous, {
          duration: 1.05,
          ease: 'power4.out',
        }),
      );
    });
  }

  private playFlipOnIcons(icons: HTMLElement[], previous: Map<HTMLElement, DOMRect>): void {
    icons.forEach((icon) => {
      this.trackTween(
        this.playFlip(icon, previous, {
          duration: 0.82,
          ease: 'power4.out',
          transformOrigin: '50% 50%',
        }),
      );
    });
  }

  private playFlip(element: HTMLElement, previous: Map<HTMLElement, DOMRect>, options: FlipOptions): gsap.core.Tween | null {
    const before = previous.get(element);

    if (!before) {
      return null;
    }

    const after = element.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;

    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      return null;
    }

    gsap.killTweensOf(element);

    return gsap.fromTo(
      element,
      {
        x: dx,
        y: dy,
        force3D: true,
        willChange: 'transform',
        ...(options.transformOrigin ? { transformOrigin: options.transformOrigin } : {}),
      },
      {
        x: 0,
        y: 0,
        duration: options.duration,
        ease: options.ease,
        force3D: true,
        overwrite: 'auto',
        clearProps: 'transform,willChange',
      },
    );
  }

  private trackTween(tween: gsap.core.Tween | null): void {
    if (tween) {
      this.activeTweens.push(tween);
    }
  }

  private isTranslatedElement(element: HTMLElement): boolean {
    if (this.isGithubDynamicText(element)) {
      return true;
    }

    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return this.isTranslatedText(element.placeholder);
    }

    return this.isTranslatedText(element.textContent ?? '');
  }

  private isGithubDynamicText(element: HTMLElement): boolean {
    if (!element.closest('portfolio-github-stats')) {
      return false;
    }

    if (element.closest('.github-languages')) {
      return false;
    }

    if (element.closest('.github-strong')) {
      return false;
    }

    if (element.classList.contains('github-eyebrow')) {
      return false;
    }

    const text = this.normalizeText(element.textContent ?? '');

    if (!text) {
      return false;
    }

    return this.githubDynamicPrefixes().some((prefix) => text === prefix || text.startsWith(`${prefix} `));
  }

  private githubDynamicPrefixes(): string[] {
    return this.githubDynamicKeys
      .flatMap((key) => [I18N_MESSAGES.es[key], I18N_MESSAGES.en[key]])
      .map((value) => this.normalizeText(value ?? ''))
      .filter(Boolean);
  }

  private isTranslatedText(value: string): boolean {
    const text = this.normalizeText(value);

    if (!text) {
      return false;
    }

    if (this.translatedTexts.has(text)) {
      return true;
    }

    return this.containsTranslatedPhrase(text) || this.matchesParameterizedTranslation(text);
  }

  private containsTranslatedPhrase(text: string): boolean {
    for (const translatedText of this.translatedTexts) {
      if (translatedText.length >= 8 && text.includes(translatedText)) {
        return true;
      }
    }

    return false;
  }

  private matchesParameterizedTranslation(text: string): boolean {
    for (const template of this.translatedTexts) {
      if (!template.includes('{')) {
        continue;
      }

      const pattern = '^' + this.escapeRegExp(template).replace(/\\\{[^}]+\\\}/g, '.+') + '$';

      if (new RegExp(pattern).test(text)) {
        return true;
      }
    }

    return false;
  }

  private createTranslatedTexts(): ReadonlySet<string> {
    const texts = new Set<string>();

    Object.keys(I18N_MESSAGES.es).forEach((key) => {
      const esText = this.normalizeText(I18N_MESSAGES.es[key]);
      const enText = this.normalizeText(I18N_MESSAGES.en[key]);

      if (!esText || !enText || esText === enText) {
        return;
      }

      texts.add(esText);
      texts.add(enText);
    });

    return texts;
  }

  private createRectMap(elements: HTMLElement[]): Map<HTMLElement, DOMRect> {
    return new Map(elements.map((element): [HTMLElement, DOMRect] => [element, element.getBoundingClientRect()]));
  }

  private isCurrentRun(runId: number): boolean {
    return runId === this.animationRunId;
  }

  private hasClosest(element: HTMLElement, selectors: string[]): boolean {
    return selectors.some((selector) => Boolean(element.closest(selector)));
  }

  private isVisibleElement(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();

    return rect.width > 0 && rect.height > 0;
  }

  private isInsideAnimationViewport(element: HTMLElement): boolean {
    if (!this.isBrowser) {
      return true;
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || this.document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || this.document.documentElement.clientWidth;
    const buffer = this.viewportBuffer;

    return rect.bottom >= -buffer && rect.top <= viewportHeight + buffer && rect.right >= -buffer && rect.left <= viewportWidth + buffer;
  }

  private uniqueElements(elements: HTMLElement[]): HTMLElement[] {
    return Array.from(new Set(elements));
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private commitLanguage(language: PortfolioLanguage): void {
    this.language.set(language);
    setStoredLanguage(language);
    this.applyDocumentLanguage(language);
  }

  private applyDocumentLanguage(language: PortfolioLanguage): void {
    this.document.documentElement.lang = language;
  }

  private prefersReducedMotion(): boolean {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
