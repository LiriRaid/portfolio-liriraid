# docs/app/shared

Documentación de `src/app/shared`.

## ¿Qué vive aquí?

Solo lo que es genuinamente reutilizable entre dos o más features. Si algo solo lo usa una feature, debe quedarse dentro de esa feature.

## Áreas

| Carpeta | Contenido |
|---------|-----------|
| `animations/` | CSS de animaciones reutilizables entre features |
| `components/` | Componentes primitivos y controles de UI compartidos |
| `services/` | Servicios globales accesibles desde cualquier feature |
| `utils/` | Funciones utilitarias sin estado |

## Documentos

- [components.md](components.md) — componentes reutilizables del portfolio
- [animations.md](animations.md) — sistema de animaciones CSS
- [models.md](models.md) — tipos e interfaces compartidos

## Nota de mantenimiento

Los cambios en componentes de `shared/` pueden impactar múltiples features. Verificar todos los consumidores antes de modificar interfaces públicas (inputs, outputs).
