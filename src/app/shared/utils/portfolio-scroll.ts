function getHeaderHeight(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--app-header-height').trim();
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed)) {
    return 64;
  }

  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  return value.endsWith('rem') ? parsed * rootFontSize : parsed;
}

export function getPortfolioScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.layout-scroll-root');
}

export function scrollToPortfolioSection(sectionId: string, behavior: ScrollBehavior = 'smooth'): void {
  const scrollRoot = getPortfolioScrollRoot();
  const section = document.getElementById(sectionId);

  if (!scrollRoot || !section) {
    return;
  }

  const scrollRootRect = scrollRoot.getBoundingClientRect();
  const sectionRect = section.getBoundingClientRect();
  const headerHeight = getHeaderHeight();

  const top = sectionRect.top - scrollRootRect.top + scrollRoot.scrollTop - headerHeight;

  scrollRoot.scrollTo({
    top: Math.max(0, Math.round(top)),
    behavior,
  });
}
