# Puntos de entrada de la aplicación

Documentación de `src/app/app.ts`, `src/app/app.config.ts` y `src/app/app.routes.ts`.

---

## `app.ts`

Componente raíz standalone (`portfolio-root`).

- Monta únicamente el `RouterOutlet`.
- No contiene lógica; delega todo al router y a los providers configurados en `app.config.ts`.

---

## `app.config.ts`

Centraliza los providers globales de la aplicación:

| Provider | Propósito |
|----------|-----------|
| `provideRouter(routes)` | Activa el sistema de rutas |
| `provideClientHydration()` | Habilita la hidratación del SSR |
| `provideAnimationsAsync()` | Animaciones nativas sin `@angular/animations` |
| `providePrimeNG({ theme })` | Registra el preset Aura personalizado del portfolio |
| `provideZonelessChangeDetection()` | Elimina ZoneJS; detección de cambios basada en signals |
| `APP_INITIALIZER` (ThemeInitializer) | Inicializa tema, color y superficie antes del primer render |
| `LucideAngularModule.pick(LucideIcons)` | Registra el catálogo de iconos Lucide disponibles |
| `MessageService` | Servicio de PrimeNG requerido por el sistema de toasts |

---

## `app.routes.ts`

```typescript
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/app-shell/layout/layout').then(m => m.Layout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/portfolio/page/portfolio').then(m => m.Portfolio)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
```

**Decisiones:**

- `Layout` se lazy-loadea para no contaminar el bundle inicial.
- `Portfolio` se carga como hijo de `Layout`, heredando el shell (header + footer).
- El catch-all redirige a raíz para mantener la SPA funcional con SSR prerendered.
