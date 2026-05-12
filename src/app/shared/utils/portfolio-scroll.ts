export const PORTFOLIO_SECTION_IDS = ['home', 'experience', 'projects', 'skills', 'about', 'contact'] as const;

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number];

export function getPortfolioScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.layout-scroll-root');
}

export function scrollToPortfolioSection(sectionId: string, behavior: ScrollBehavior = 'smooth'): void {
  const scrollRoot = getPortfolioScrollRoot();

  if (!scrollRoot) {
    return;
  }

  if (sectionId === 'home') {
    scrollRoot.scrollTo({ top: 0, behavior });
    return;
  }

  const sectionIndex = (PORTFOLIO_SECTION_IDS as readonly string[]).indexOf(sectionId);

  if (sectionIndex === -1) {
    return;
  }

  const top = sectionIndex * window.innerHeight;

  scrollRoot.scrollTo({
    top: Math.max(0, Math.round(top)),
    behavior,
  });
}
