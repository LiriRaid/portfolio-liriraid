# Mobile Performance Optimization — Design Spec

**Date:** 2026-05-20
**Goal:** Llevar el score de Lighthouse Performance de 86 a ≥ 90 en mobile sin romper animaciones ni diseño.
**Scope:** Background animation (OffscreenCanvas), quick wins (LCP, content-visibility), bundle analysis.

---

## Context

- Build: Angular 21 + SSR (static prerender), Vite preview en `localhost:4173`
- Score actual: 86 (desktop Lighthouse DevTools)
- Target: ≥ 90 en mobile Lighthouse (CPU 4x throttle)

### Principales issues identificados

| Issue | Categoría Lighthouse | Impacto estimado |
|---|---|---|
| Canvas animation en hilo principal ~300ms/s | Main thread work / Other | Alto |
| Long task chunk-3CTLPVNK.js 654ms | TBT | Alto |
| LCP render delay 170ms | LCP | Medio |
| 124 animaciones no compuestas | Non-composited animations | Medio |
| Forced reflow 61ms sin asignación | Main thread work | Bajo |
| Unused JS ~55 KiB | Unused JS | Bajo-Medio |

---

## Parte 1: OffscreenCanvas + Web Worker

### Objetivo
Mover todo el pintado del canvas del hilo principal a un Web Worker dedicado. El hilo principal solo mantiene estado y envía mensajes; el worker hace todo el trabajo de renderizado.

### Archivos afectados
- **Nuevo**: `src/app/features/portfolio/ui/portfolio-background-animation/background-animation.worker.ts`
- **Refactorizado**: `src/app/features/portfolio/ui/portfolio-background-animation/portfolio-background-animation.service.ts`
- **Sin cambios**: `portfolio-background-animation.ts` (componente), `portfolio-background-animation.html`, `portfolio-background-animation.css`

### Arquitectura

```
Hilo principal                              Web Worker
──────────────────────────────────          ────────────────────────────────
PortfolioBackgroundAnimationService         background-animation.worker.ts
  enabled signal (público)                    OffscreenCanvas
  localStorage / matchMedia                   loop: setInterval(render, 1000/60)
  ResizeObserver → postMessage                buildCircuit()
  MutationObserver (tema) → postMessage       renderFrame()
  scroll listener → postMessage               drawAmbientGlow()
  isBrowser guard                             drawCircuitLines()
  worker lifecycle (create/destroy)           drawCircuitNodes()
                                              drawPackets()
                                              getIntensity() con flag isDark
```

### Protocolo de mensajes (main → worker)

Todos los mensajes son fire-and-forget; el worker no responde.

```typescript
type WorkerMessage =
  | { type: 'init';    canvas: OffscreenCanvas; width: number; height: number; dpr: number; primary: string; muted: string; isDark: boolean; enabled: boolean; scrollProgress: number }
  | { type: 'resize';  width: number; height: number; dpr: number }
  | { type: 'theme';   primary: string; muted: string; isDark: boolean }
  | { type: 'scroll';  progress: number }
  | { type: 'enabled'; value: boolean }
  | { type: 'destroy' }
```

### Loop en el worker

`setInterval(render, 1000/60)` con auto-corrección de drift usando `performance.now()`. Para una animación decorativa de circuitos no se requiere vsync exacto. Cuando `enabled === false` el worker limpia el canvas y para el interval.

### Fallback (browsers sin OffscreenCanvas)

Detección:
```typescript
const supportsOffscreen =
  typeof OffscreenCanvas !== 'undefined' &&
  'transferControlToOffscreen' in HTMLCanvasElement.prototype;
```

Si `supportsOffscreen === false`, el servicio mantiene el comportamiento actual (rAF en hilo principal). No hay cambio visual ni de API pública.

Soporte actual de OffscreenCanvas: ~97% (Chrome 69+, Firefox 105+, Safari 16.4+).

### Cambios en PortfolioBackgroundAnimationService

**Conservar sin cambios:**
- `enabled` signal (público — lo usa el componente y el toggle de settings)
- `toggle()` y `setEnabled()` — API pública
- Constructor: lógica de localStorage + matchMedia + `syncRootEnabledClass`
- `isBrowser` guard en todos los métodos públicos

**Remover:**
- Toda la lógica de canvas 2D: `buildCircuit`, `renderFrame`, `drawAmbientGlow`, `drawCircuitLines`, `drawCircuitNodes`, `drawPackets`, `getIntensity`, `withAlpha`, `clear`
- Los campos de estado del canvas: `canvas`, `ctx`, `nodes`, `lines`, `width`, `height`, `dpr`, `time`, `animationFrameId`, `cachedPrimaryColor`, `cachedMutedColor`, `scrollProgress`
- `startAnimationLoop` / `stopAnimationLoop` (el worker maneja su propio loop)

**Agregar:**
- `private worker: Worker | null` — referencia al worker
- `private workerMode: 'offscreen' | 'fallback'` — determina el path en `initialize`
- `private rafId: number | null` — solo para el path de fallback
- En `initialize()`: bifurcar entre offscreen y fallback
- En `destroy()`: `this.worker?.terminate(); this.worker = null`
- En `setEnabled(value)`: `this.worker?.postMessage({ type: 'enabled', value })`

### Cambios en el componente

El componente no cambia su API ni template. Solo en `initialize()` del servicio se llama `canvas.transferControlToOffscreen()` antes de crear el worker. El componente sigue siendo el dueño del `<canvas>` en el DOM.

### Configuración Angular para Web Workers

Crear `tsconfig.worker.json` en la raíz del proyecto:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/worker",
    "lib": ["ES2022", "webworker"],
    "types": []
  },
  "include": ["src/**/*.worker.ts"]
}
```

Referenciar desde `tsconfig.app.json` agregando `"tsconfig.worker.json"` al array de references si existe, o simplemente asegurarse de que el build de Angular CLI incluya el archivo (Angular 21 detecta `.worker.ts` automáticamente cuando se importan con `new Worker(new URL('./...worker', import.meta.url))`).

---

## Parte 2: Quick Wins

### 2a — Preload de imágenes hero (LCP)

**Archivo**: `src/index.html` — agregar en `<head>` antes del script pretheme:

```html
<link rel="preload" as="image" href="assets/img/me-hero-mobile.webp"
      media="(max-width: 640px)" fetchpriority="high">
<link rel="preload" as="image" href="assets/img/me-hero.webp"
      media="(min-width: 641px)" fetchpriority="high">
```

La imagen ya tiene `fetchpriority="high"` en el `<img>` pero el browser la descubre tarde (dentro del HTML hidratado). El preload en `<head>` la inicia desde el principio del parse de HTML.

### 2b — `content-visibility: auto` en secciones deferred

Angular renderiza todas las secciones en SSR aunque estén en `@defer (hydrate on viewport)`. El browser aún tiene que calcular layout y paint de todas ellas en la carga inicial.

**Archivos**: los CSS de cada sección (`about.css`, `experience.css`, `projects/projects.css`, `skills/skills.css`, `contact/contact.css`).

Agregar al selector raíz de cada sección:
```css
.about-section { /* o el selector raíz correspondiente */
  content-visibility: auto;
  contain-intrinsic-size: auto 800px; /* estimado de altura */
}
```

Esto permite que el browser omita layout/paint de secciones fuera del viewport durante la carga. Cuando entran al viewport se calculan normalmente — no afecta las animaciones GSAP de entrada.

**Precaución**: no aplicar a la sección Hero (siempre visible) ni al Header/Footer.

### 2c — Limpieza de `will-change` fijos en carousel

`carousel-styles.css` tiene `will-change: transform, opacity, filter` declarado de forma fija en el item del carousel. `filter` en `will-change` crea una nueva capa GPU permanente en mobile, aumentando el uso de memoria y la cantidad de composición.

Cambiar para que `will-change` solo se aplique durante interacción activa:
```css
/* Antes */
.carousel-item { will-change: transform, opacity, filter; }

/* Después */
.carousel-item { will-change: auto; }
.carousel-item--active { will-change: transform, opacity; } /* sin filter */
```

---

## Parte 3: Bundle Analysis

### Objetivo
Identificar qué módulo compone el chunk de 654ms (chunk-3CTLPVNK.js) y evaluar si se puede lazy-load o tree-shake.

### Proceso
1. `ng build --stats-json` — genera `dist/.../stats.json`
2. `npx webpack-bundle-analyzer dist/portfolio-liriraid/browser/stats.json` — visualización interactiva
3. Identificar los módulos más pesados en el chunk inicial
4. Candidatos probables: PrimeNG components, @primeuix/themes, Lucide icons

### Acciones según resultado
- **PrimeNG components usados solo en secciones deferred**: moverlos a lazy-loaded feature modules o verificar que Angular los incluya en el chunk correcto del `@defer`
- **Lucide icons**: verificar que se importan individualmente (`import { Github } from '@lucide/angular'`) y no el barrel completo
- **@primeuix/themes**: evaluar si el theme completo es necesario en el bundle inicial o si se puede diferir

---

## Orden de implementación

1. Bundle analysis (diagnóstico antes de optimizar)
2. Quick wins (independientes, bajo riesgo, valor inmediato)
3. OffscreenCanvas migration (mayor impacto, mayor complejidad)

---

## Criterios de éxito

- Lighthouse Performance mobile ≥ 90 medido en `vite preview` (localhost:4173)
- Animación del fondo funciona visualmente igual que antes
- Toggle de animación sigue funcionando
- Fallback funciona en Safari < 16.4 (sin OffscreenCanvas)
- Tests existentes pasan sin modificación
