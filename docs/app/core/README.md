# docs/app/core

Documentación de `src/app/core`.

## ¿Qué vive aquí?

Infraestructura global que ninguna feature debería implementar por su cuenta:

| Carpeta | Contenido |
|---------|-----------|
| `common/` | Catálogo de iconos Lucide + SVG custom del portfolio |
| `forms/` | Helper para registrar `NG_VALUE_ACCESSOR` en componentes de formulario |
| `theme/` | ThemeService, paletas de color, inicializador, preset PrimeNG Aura |

## Regla

Solo pertenece a `core/` lo que es transversal a toda la aplicación o que constituye la base sobre la que se construye. Utilidades de una sola feature no van aquí.

## Documentos

- [icons.md](icons.md) — sistema de iconos Lucide y SVG custom
- [theme.md](theme.md) — sistema de tema dinámico
- [ui-and-forms.md](ui-and-forms.md) — helper de formularios
- [reserved-areas.md](reserved-areas.md) — carpetas reservadas para crecimiento futuro
