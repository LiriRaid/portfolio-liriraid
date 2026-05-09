# Sistema de iconos

Documentación de `src/app/core/common/`.

## Archivos clave

| Archivo | Descripción |
|---------|-------------|
| `lucide-icons.ts` | Construye el mapa de nombres cortos a íconos Lucide y exporta el tipo `LucideIconName` |
| `lucide-icons.provider.ts` | Expone el token `PORTFOLIO_LUCIDE_ICONS` para inyección |
| `portfolio-icons.ts` | Define iconos SVG custom propios del portfolio (interfaz `PortfolioSvg`) |

## ¿Cómo funciona?

`lucide-icons.ts` exporta un objeto `LucideIcons` que mapea nombres de uso interno (string cortos) a los componentes de iconos de `@lucide/angular`. Este mapa se registra globalmente en `app.config.ts` mediante `LucideAngularModule.pick(LucideIcons)`.

Los componentes usan `<lucide-icon [name]="iconName" />` o el componente wrapper `PortfolioIcon` de `shared/components/portfolio-icon/`.

`portfolio-icons.ts` gestiona SVG que no existen en Lucide (logos de tecnologías propias). Actualmente incluye el logo de Angular.

## Relaciones

- `app.config.ts` registra el catálogo Lucide globalmente.
- `shared/components/portfolio-icon/` consume los iconos Lucide.
- `shared/utils/tech-icons.ts` gestiona URLs a iconos de tecnologías (skillicons.dev + SVG locales), independiente de este módulo.

## Decisión

Centralizar el catálogo evita que cada componente importe su propio icono con `import { IconName } from 'lucide-angular'`, lo que en SSR/SSG podría generar bundles innecesariamente grandes si los tree-shaking no actúan correctamente. Un único mapa permite revisar de un vistazo qué iconos usa el portfolio.
