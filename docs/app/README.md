# docs/app

Documentación de `src/app`.

## Subareas

| Carpeta | Responsabilidad |
|---------|----------------|
| [`core/`](core/README.md) | Infraestructura global: tema, iconos, inicializadores, formularios |
| [`features/`](features/README.md) | Funcionalidades: app-shell y secciones del portfolio |
| [`shared/`](shared/README.md) | Elementos reutilizables entre dos o más features |

## Archivos de entrada

| Archivo | Descripción |
|---------|-------------|
| `app.ts` | Componente raíz standalone, monta el router-outlet principal |
| `app.config.ts` | Centraliza todos los providers globales de la aplicación |
| `app.routes.ts` | Define las rutas con lazy loading por componente |

Consulta [app-entrypoints.md](app-entrypoints.md) para más detalle sobre los puntos de entrada.

## Regla de alcance

```
Una sola feature usa el elemento  →  vive dentro de esa feature
Dos o más features lo comparten  →  se mueve a shared/
Es infraestructura transversal   →  pertenece a core/
```
