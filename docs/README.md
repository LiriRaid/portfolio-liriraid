# Documentación

Documentación técnica del portfolio de [Liriraid](https://github.com/liriraid).

La estructura de esta carpeta espeja la del código fuente: cada área documenta lo que contiene, por qué existe y qué decisiones se tomaron.

## Estructura

```
docs/
├── app/
│   ├── core/        → tema, iconos, infraestructura transversal
│   ├── features/    → app-shell y secciones del portfolio
│   └── shared/      → componentes, servicios y utilidades reutilizables
├── assets/          → recursos estáticos (CV, imágenes, SVG)
└── styles/          → sistema global de estilos
```

## Identidad visual

- **Color primario por defecto**: orange (`#f97316`)
- **Superficie por defecto**: neutral
- **Modo por defecto**: dark
- **Sistema de temas**: 13 colores primarios + 8 paletas de superficie, persistidos en `localStorage`

## Convención de documentación

Cada documento responde:
1. **¿Qué contiene?** — archivos y carpetas del área
2. **¿Para qué existe?** — responsabilidad y límites
3. **¿Archivos clave?** — los más importantes con descripción
4. **¿Relaciones?** — conexiones con otras partes del sistema
5. **¿Decisiones?** — por qué está organizado así

## Índices

- [docs/app/](app/README.md) — documentación de `src/app`
- [docs/assets/](assets/README.md) — documentación de `src/assets`
- [docs/styles/](styles/README.md) — documentación de `src/styles`
