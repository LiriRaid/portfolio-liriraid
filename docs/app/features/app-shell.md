# Feature: App Shell

Documentación de `src/app/features/app-shell/`.

## Objetivo

Proporcionar la estructura visual que envuelve toda la aplicación: el header de navegación, el footer y el contenedor donde se renderizan las rutas hijas.

## Estructura

```
app-shell/
├── header/
│   ├── header.ts
│   ├── header.html
│   └── header.css
├── footer/
│   ├── footer.ts
│   ├── footer.html
│   └── footer.css
└── layout/
    ├── layout.ts
    ├── layout.html
    └── layout.css
```

## Archivos clave

### `layout/layout.ts`
Componente contenedor que monta `Header`, `Footer`, `RouterOutlet` y `PortfolioToast`.

Incluye un listener de resize que mantiene el scroll en la sección correcta cuando cambia el ancho del viewport.

**IDs de sección conocidos:**
```
inicio, experiencia, proyectos, habilidades, sobre-mi, contacto
```

### `header/header.ts`
Componente `OnPush` con la siguiente funcionalidad:

| Función | Descripción |
|---------|-------------|
| Navegación | Links a cada sección del portfolio con scroll suave |
| Sección activa | Calcula qué sección está visible según posición de scroll (umbral: 42% del viewport) |
| Menú móvil | Toggle para pantallas pequeñas |
| Theme toggle | Cambia entre modo claro y oscuro |
| Color picker | Abre un popover con las paletas de color disponibles |

**Lógica de scroll:**
El header detecta si el scroll es manual o programático y bloquea actualizaciones de sección activa durante los scrolls suaves para evitar parpadeos en el indicador.

### `footer/footer.ts`
Componente simple con:
- Brand: Liriraid + tagline
- Links a GitHub y sección de contacto
- Año dinámico de copyright

## Notas

- `Layout` se carga con `loadComponent` (lazy loading) para no contaminar el bundle inicial del portfolio.
- `Header` usa `ChangeDetectionStrategy.OnPush` para evitar re-renders innecesarios durante el scroll.
