# Testing

Cómo se ejecutan y configuran las pruebas unitarias del portfolio.

## ¿Con qué se testea?

**Vitest** es el runner oficial de este proyecto (la mejor alternativa de testing para Angular según el criterio del equipo). Se ejecuta a través del plugin **`@analogjs/vite-plugin-angular`**, que compila los componentes Angular y aplica el **Angular Linker** a las librerías de `node_modules`.

```bash
pnpm test         # ejecuta toda la suite una vez (vitest run)
pnpm test:watch   # modo watch (vitest)
```

> ⚠️ **No usar `ng test`.** Ver [Decisiones](#decisiones).

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `vitest.config.ts` | Config de Vitest: plugin `@analogjs/vite-plugin-angular`, `vite-tsconfig-paths` (aliases `@core`, `@shared`, …), entorno `jsdom`, `setupFiles: ['src/test-setup.ts']`. |
| `src/test-setup.ts` | Setup global: `import '@angular/compiler'` (JIT), `setupTestBed({ zoneless: true, providers })` con el token `LUCIDE_ICONS`, y polyfills de jsdom (`matchMedia`, `ResizeObserver`, `IntersectionObserver`). |
| `tsconfig.spec.json` | TSConfig de specs (incluye `src/test-setup.ts`, `**/*.spec.ts`, tipos `vitest/globals`). |
| `package.json` → `scripts.test` | `vitest run` (NO `ng test`). |

## Patrones de testing

- **Zoneless**: el TestBed se configura con `zoneless: true` (la app usa `provideZonelessChangeDetection`). Las señales (`signal`/`computed`) se prueban llamándolas como función: `component.experiences()`, no `component.experiences`.
- **Iconos Lucide**: `LUCIDE_ICONS` se provee globalmente en `src/test-setup.ts` (apunta a `PORTFOLIO_LUCIDE_ICONS`) para que `<portfolio-icon>` renderice SVGs reales.
- **Bloques `@defer`** (secciones del portfolio): por defecto no renderizan su contenido en un test. Para verificarlo:
  ```ts
  import { DeferBlockBehavior, DeferBlockState } from '@angular/core/testing';

  TestBed.configureTestingModule({ /* … */, deferBlockBehavior: DeferBlockBehavior.Manual });

  const blocks = await fixture.getDeferBlocks();
  for (const block of blocks) await block.render(DeferBlockState.Complete);
  ```
- **jsdom**: no implementa `matchMedia`, `ResizeObserver` ni `IntersectionObserver`. Están polyfilleados en `src/test-setup.ts`; los componentes que los usan al construirse/renderizar fallarían sin esos stubs.

## Decisiones

- **`pnpm test` = `vitest run`, no `ng test`.** El builder `@angular/build:unit-test` (que invoca `ng test`) **no aplica el Angular Linker** a librerías *partial-compiled* como `@lucide/angular` en su pipeline de Vitest. En runtime eso provoca:

  > `The component 'LucideIconBase' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.`

  y crashea todo spec que renderice un icono. El build de producción **sí** enlaza correctamente; solo el pipeline de test del builder fallaba. La ruta de Vitest + `@analogjs/vite-plugin-angular` (`vitest.config.ts`) sí aplica linker + JIT, por lo que es la forma correcta de ejecutar los tests.

  No es un problema de hoisting de pnpm (se descartó: `shamefully-hoist=true` no lo soluciona). El síntoma apareció al migrar a pnpm solo porque antes el script seguía apuntando a `ng test`; la corrección de raíz fue cambiar `scripts.test` a `vitest run`.

- **Setup analog en vez de la config nativa del builder.** Se mantiene `src/test-setup.ts` con `setupTestBed` de `@analogjs/vitest-angular`, que es lo que el plugin de Vitest espera.
