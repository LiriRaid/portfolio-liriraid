# docs/app/features

Documentación de `src/app/features`.

## Features actuales

| Feature | Descripción |
|---------|-------------|
| [`app-shell/`](app-shell.md) | Layout principal: header con navegación, footer y contenedor de rutas |
| [`portfolio/`](portfolio.md) | Página principal del portfolio con todas sus secciones |

## Regla de alcance

Si un componente, servicio o utilidad solo lo usa una feature, vive dentro de esa feature. Solo se mueve a `shared/` cuando lo necesitan dos o más features.

## Estructura general de una feature

```
feature-name/
├── components/     → subcomponentes internos (si existen)
├── entities/       → interfaces y DTOs propios
├── services/       → servicios propios
├── sections/       → páginas o secciones de la feature
└── page/           → componente raíz de la feature (si aplica)
```
