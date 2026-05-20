# Directivas compartidas

Documentación de `src/app/shared/directives/`.

## ¿Qué contiene?

| Archivo | Descripción |
|---------|-------------|
| `portfolio-animated-border.directive.ts` | Directiva `[portfolioAnimatedBorder]` — borde con gradiente rotatorio (efecto "conic glow") activado por hover o tap |
| `index.ts` | Barrel export |

## `[portfolioAnimatedBorder]`

Aplica un borde con gradiente rotatorio sobre el elemento host. Se usa, por ejemplo, en las cards del carrusel y otros contenedores donde se quiere un acento visual al interactuar.

### Cómo se monta

```html
<div portfolioAnimatedBorder>...</div>
<div [portfolioAnimatedBorderActive]="isFocused()">...</div>
```

| Modo | Descripción |
|------|-------------|
| **Uncontrolled** (sin binding de `active`) | La directiva decide cuándo activarse: hover en escritorio, tap en touch |
| **Controlled** (con `[portfolioAnimatedBorderActive]`) | El consumidor controla el booleano; la directiva solo anima el borde según ese valor |

### Comportamiento por tipo de dispositivo

- **Hover devices** (`matchMedia('(hover: hover)')`):
  - Modo uncontrolled: `mouseenter` arranca la animación, `mouseleave` la detiene (fade out de 220ms).
  - Modo controlled: el `active` del consumidor decide; solo se detiene al volverse `false`.
- **Touch devices** (`hover: none, pointer: coarse`):
  - Tap (pointer down + up sin moverse > 10px) activa la animación.
  - Cuando se hace tap fuera de cualquier `.portfolio-animated-border`, todas las instancias uncontrolled se desactivan.
  - Solo una instancia uncontrolled puede estar activa a la vez (la última tapada gana).
- **Reduced motion** (`prefers-reduced-motion: reduce`): la directiva no anima nada.

### Detalles técnicos

- Usa GSAP (lazy via [`gsap-loader`](utils.md#gsap-loaderts)) para rotar la variable CSS `--portfolio-border-angle` de 0 → 360° en loop de 4.8s.
- Variables CSS expuestas por la directiva al host:
  - `--portfolio-border-angle`: ángulo actual del gradiente.
  - `--portfolio-border-opacity`: 0 cuando inactivo, 1 cuando activo.
- Clase host: `.portfolio-animated-border`. Estado activo: `.portfolio-animated-border--active`.
- Los estilos del borde viven en [animated-border-styles.css](../../../src/styles/animated-border-styles.css) y consumen esas variables.
- **Ángulo compartido entre instancias**: `sharedAngle` es estático en la clase para que todas las instancias activas roten sincronizadas (evita ver bordes desfasados cuando hay varios elementos visibles al mismo tiempo).

### Limpieza

- `destroyRef.onDestroy` mata los tweens y se desinscribe del set estático de instancias.
- `pointercancel` resetea el estado de tap.

## Relaciones

- **`gsap-loader`** ([utils.md](utils.md)): la directiva carga GSAP en lazy.
- **`animated-border-styles.css`** ([styles README](../../styles/README.md)): definición de cómo se pinta el borde a partir de las variables CSS.
- **Consumidores actuales**: principalmente cards de proyectos y otros contenedores destacados; ver uso real con búsqueda de `portfolioAnimatedBorder` en `src/app/features/`.

## Decisiones

- **Standalone directive**: se importa como cualquier otro standalone, sin NgModule.
- **Comportamiento dual (hover/tap)**: en desktop el hover se siente natural; en touch un toque "activa" el efecto sin esperar long-press y se desactiva al tocar fuera. Diferenciar por `matchMedia` evita el sticky-hover típico de touch.
- **Singleton de instancia activa en touch**: si hay varias cards visibles, mantener solo una activa a la vez evita ruido visual y simplifica la cancelación al tocar fuera.
- **`sharedAngle` estático**: garantiza coherencia visual cuando hay múltiples bordes activos a la vez (todos giran sincronizados).
