import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_PORTFOLIO_SECTION,
  type PortfolioSectionId,
} from './portfolio-sections';

interface SectionNavigationRequest {
  id: number;
  sectionId: PortfolioSectionId;
}

@Injectable({ providedIn: 'root' })
export class PortfolioSectionNavigationService {
  readonly activeSectionId = signal<PortfolioSectionId>(DEFAULT_PORTFOLIO_SECTION);
  readonly navigationRequest = signal<SectionNavigationRequest | null>(null);

  private navigationRequestId = 0;

  requestNavigation(sectionId: PortfolioSectionId): void {
    this.navigationRequest.set({
      id: ++this.navigationRequestId,
      sectionId,
    });
  }

  setActiveSection(sectionId: PortfolioSectionId): void {
    this.activeSectionId.set(sectionId);
  }
}
