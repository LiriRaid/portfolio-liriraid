# docs/assets

Documentación de `src/assets/`.

## Estructura

```
assets/
├── docs/   → documentos descargables
├── img/    → imágenes de perfil
└── svg/    → logos de tecnologías en SVG
```

## `assets/docs/`

| Archivo | Descripción |
|---------|-------------|
| `gabriel-cruz-cv.pdf` | CV de Gabriel Cruz, descargable desde la sección Hero |

El botón de descarga en `hero.ts` apunta directamente a esta ruta. Actualizar el archivo aquí es suficiente para que el portfolio sirva la versión más reciente.

## `assets/img/`

| Archivo | Descripción |
|---------|-------------|
| `Me.jpg` | Fotografía de perfil usada en la sección About |

## `assets/svg/`

Logos de tecnologías que no están disponibles en skillicons.dev o que requieren una versión específica de marca:

| Archivo | Tecnología |
|---------|-----------|
| `angular-logo.svg` | Angular (logo oficial) |
| `primeng-logo.svg` | PrimeNG |
| `gsap-black.svg` | GSAP (versión oscura) |
| `npm-logo.svg` | NPM |
| `vitest-logo.svg` | Vitest |

Estos SVG los consume `shared/utils/tech-icons.ts` para resolver nombres de tecnologías a URLs de icono.

## Relación con `core/common/portfolio-icons.ts`

`portfolio-icons.ts` en core registra los SVG que se usan como iconos de componente (por ejemplo, el logo de Angular en el bloque de código del Hero). Los SVG de `assets/svg/` son recursos estáticos que se sirven como imágenes, no como componentes.
