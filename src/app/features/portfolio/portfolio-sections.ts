export const PORTFOLIO_SECTIONS = [
  { id: 'inicio', path: 'inicio', label: 'Inicio' },
  { id: 'proyectos', path: 'proyectos', label: 'Proyectos' },
  { id: 'habilidades', path: 'habilidades', label: 'Habilidades' },
  { id: 'sobre-mi', path: 'sobre-mi', label: 'Sobre mí' },
  { id: 'contacto', path: 'contacto', label: 'Contacto' },
] as const;

export type PortfolioSection = (typeof PORTFOLIO_SECTIONS)[number];
export type PortfolioSectionId = PortfolioSection['id'];
export type PortfolioSectionPath = PortfolioSection['path'];

export const DEFAULT_PORTFOLIO_SECTION: PortfolioSectionId = 'inicio';

const SECTION_PATHS = new Set<PortfolioSectionPath>(
  PORTFOLIO_SECTIONS.map((section) => section.path),
);

export function isPortfolioSectionPath(
  value: string | null | undefined,
): value is PortfolioSectionPath {
  return !!value && SECTION_PATHS.has(value as PortfolioSectionPath);
}

export function getPortfolioSectionById(
  sectionId: PortfolioSectionId,
): PortfolioSection {
  return PORTFOLIO_SECTIONS.find((section) => section.id === sectionId) ?? PORTFOLIO_SECTIONS[0];
}

export function getPortfolioSectionByPath(
  path: string | null | undefined,
): PortfolioSection | null {
  if (!isPortfolioSectionPath(path)) return null;
  return PORTFOLIO_SECTIONS.find((section) => section.path === path) ?? null;
}
