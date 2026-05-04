# Sistema de tema

Documentación de `src/app/core/theme/`.

## Archivos clave

| Archivo | Descripción |
|---------|-------------|
| `theme.service.ts` | Lógica central: modo claro/oscuro, paletas de color, favicon dinámico |
| `theme-palettes.ts` | Definición estática de las 13 paletas primarias y 8 paletas de superficie |
| `theme-preferences.storage.ts` | Lectura y escritura de preferencias en `localStorage` |
| `theme.initializer.ts` | `APP_INITIALIZER` que ejecuta `ThemeService.initialize()` en el bootstrap |
| `portfolio-aura-preset.ts` | Preset PrimeNG Aura personalizado con los tokens del portfolio |

## Responsabilidades del ThemeService

| Método | Acción |
|--------|--------|
| `initialize()` | Lee preferencias de `localStorage` y aplica modo, color y superficie |
| `toggleMode()` | Alterna entre `light` y `dark` |
| `setMode(mode)` | Aplica un modo específico |
| `applyColor(key)` | Cambia el color primario y actualiza variables CSS + favicon |
| `applySurface(key)` | Cambia la paleta de superficie y actualiza variables CSS |

## Variables CSS generadas

```css
/* 11 shades de color primario */
--p-primary-50  … --p-primary-950
--p-primary-color   /* shade 500, color activo */

/* 12 shades de superficie */
--p-surface-0   … --p-surface-950
```

Estas variables las consume PrimeNG (preset Aura) y los estilos globales de `src/styles/theme-styles.css`.

## Atributos del DOM

```html
<html class="dark" data-primaryColor="orange" data-surfaceColor="neutral">
```

## Relación con el pretheme script de `index.html`

El script en `index.html` aplica las mismas variables CSS **antes** de que Angular cargue, leyendo desde `localStorage`. Esto previene el flash de colores por defecto durante la hidratación SSR.

El `ThemeService.initialize()` elimina el tag `<style id="portfolio-pretheme">` una vez que Angular ha tomado el control.

## Paletas disponibles

**Primarias (13):** black, indigo, blue, sky, cyan, teal, green, amber, orange, red, hotpink, pink, purple

**Superficies (8):** slate, gray, zinc, neutral, stone, soho, viva, ocean

**Defaults:** primario = `orange`, superficie = `neutral`, modo = `dark`
