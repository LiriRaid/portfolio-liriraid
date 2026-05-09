# Animaciones compartidas

Documentación de `src/app/shared/animations/`.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `animations.css` | Clases CSS de animaciones reutilizables |

## Objetivo

Concentrar las animaciones CSS reutilizables para garantizar consistencia visual y evitar duplicación entre features.

Importado globalmente desde `src/styles.css`:
```css
@import './app/shared/animations/animations.css';
```

## Relación con GSAP

Las animaciones de entrada complejas (como la del componente Hero) usan GSAP directamente desde el componente. Las animaciones CSS de este archivo son para transiciones más simples, estados de hover y efectos que se aplican mediante clases.

## Regla

Si una animación solo la usa una feature, puede vivir en el CSS local de esa feature. Si la necesitan dos o más features, se mueve aquí.
