# Servicios compartidos

Documentación de `src/app/shared/services/`.

## ¿Qué contiene?

| Archivo | Descripción |
|---------|-------------|
| `alert.service.ts` | `AlertService` — fachada sobre `MessageService` de PrimeNG para emitir toasts del portfolio |
| `portfolio-section-reveal.service.ts` | `PortfolioSectionRevealService` — revela secciones cuando entran al viewport |
| `index.ts` | Barrel export |

Ambos son `@Injectable({ providedIn: 'root' })`.

## `AlertService`

Punto único para mostrar notificaciones tipo toast. Encapsula `MessageService` de PrimeNG para que los consumidores no dependan directamente de la librería.

### API

| Método | Tipo de toast | Notas |
|--------|---------------|-------|
| `showSuccess(title, message, action?, duration?, position?)` | `Success` | Duración por defecto: 4000ms |
| `showInfo(title, message, action?, duration?, position?)` | `Info` | 4000ms |
| `showWarning(title, message, action?, duration?, persistent?, position?)` | `Warning` | 5000ms; admite `persistent: true` para no auto-cerrar |
| `showError(title, message, action?, duration?, position?)` | `Error` | 6000ms (más tiempo para que el usuario lea) |
| `showSecondary` / `showContrast` | variantes neutras | 4000ms |
| `showLoading(title, message, action?, duration?, position?)` | `Loading` | Persistente por defecto (no auto-cierra) |
| `showBasic(title, message, action?, duration?, context?, position?)` | `Info` | Acepta un `context` extra (`'view' \| 'edit' \| 'create'`) |
| `clear()` | — | Limpia todos los toasts activos |

### Posiciones disponibles

6 valores en `ToastPosition`: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`. La posición se expone también como signal (`toastPosition`) para que el componente `PortfolioToast` reaccione al cambio.

### Acción opcional

`PortfolioToastAction` permite añadir un botón al toast (texto + callback). Útil para "Reintentar", "Deshacer", etc.

## `PortfolioSectionRevealService`

Servicio que dispara la animación de aparición de una sección cuando entra al viewport. Lo consumen los componentes de sección (`Hero`, `About`, `Experience`, `Projects`, `Skills`, `Contact`) en su `afterNextRender`.

### API

```typescript
revealOnViewport(options: {
  hostRef: ElementRef<HTMLElement>;
  destroyRef: DestroyRef;
  threshold?: number;       // 0–1, default 0.1 (10% visible)
  onReveal: () => void;     // callback al revelar
}): void;
```

### Comportamiento

1. Si la sección ya es visible al montar (medido vía `getBoundingClientRect`), revela inmediatamente.
2. Si no, crea un `IntersectionObserver` con `rootMargin: 0 0 -8% 0` que dispara cuando cruza el threshold.
3. Fallback de 500ms que comprueba visibilidad por si el observer no se dispara.
4. Al revelar: agrega `.portfolio-section-reveal--ready` al elemento `.portfolio-section-reveal` (o al host como fallback) y ejecuta el callback.
5. Cleanup automático al destruir el componente via `destroyRef.onDestroy`.

Los estilos base/revelados viven en [general-styles.css](../../../src/styles/general-styles.css) (`.portfolio-section-reveal` → opacity 0 / visibility hidden; `.portfolio-section-reveal--ready` → opacity 1 / visibility visible). Si `prefers-reduced-motion: reduce` la sección es visible de entrada.

## Relaciones

- **`AlertService`** ← consumido por: `Contact` (feedback de envío de formulario), `Hero` (descarga del CV).
- **`AlertService`** → `MessageService` (PrimeNG), `PortfolioToast` (componente que renderiza).
- **`PortfolioSectionRevealService`** ← consumido por todas las secciones del portfolio.

## Decisiones

- **AlertService como fachada**: si en el futuro se reemplaza PrimeNG por otra librería, solo cambia este servicio.
- **Reveal por servicio**: la lógica (rect + IntersectionObserver + fallback) es delicada y repetirla en cada sección sería frágil. Centralizar evita inconsistencias.
- **No usar effects para revealar**: la revelación solo necesita correr una vez al montar; `afterNextRender` + service es más directo que un signal/effect.
