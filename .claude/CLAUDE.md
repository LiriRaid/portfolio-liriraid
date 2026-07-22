# portfolio-liriraid — Project Context

## What it is
Professional developer portfolio. Showcases experience, projects (GitHub API), skills, and contact (EmailJS). Supports dynamic theming (13 primary colors × 8 surface palettes) and bilingual i18n (ES/EN) with GSAP-animated language switching.

## Architecture
- **Type:** Angular 21 — SSR + static prerendering (`outputMode: "static"`). All routes prerendered at build. No dynamic SSR server.
- **Pattern:** Screaming Architecture + Feature-first + Scope Rule.
- **Change detection:** Zoneless (`provideZonelessChangeDetection()`) + OnPush everywhere.
- **Aliases:** `@core/*` · `@features/*` · `@shared/*` · `@environments/*`
- **Hydration:** `provideClientHydration(withEventReplay(), withIncrementalHydration())`

## CRITICAL — always run preindex before build or serve

```bash
pnpm preindex   # runs pretheme + prelanguage — generates required index files
```

**Never skip this.** Missing indexes break the theme flash-prevention and i18n detection at boot. The `start`, `build`, and `watch` scripts all call `preindex` automatically — but if you run `ng` directly, you must run it manually first.

## SSR entrypoints

| File | Purpose |
|---|---|
| `src/main.server.ts` | SSR bootstrap entrypoint |
| `src/app/app.config.server.ts` | `mergeApplicationConfig(appConfig, serverConfig)` — SSR-specific providers |
| `src/app/app.routes.server.ts` | All routes use `RenderMode.Prerender` (wildcard `**`) |

**`isPlatformBrowser()` guard is mandatory** before any access to `window`, `document`, or `localStorage`.

## Route structure

```
'' (Layout — lazy)
└─ '' → Portfolio page (lazy)
   (wildcard ** → '' redirect)
```

View transitions enabled. Initial transition skipped to prevent flash on first load.

## Theme system

**Flow:** `tools/theme/generate-pretheme-index.ts` → generates index → `index.html` inline script (`#portfolio-pretheme`) → `ThemeService.initialize()` → PrimeUI runtime palette update

**`ThemeService` capabilities:**
- 13 primary colors: Angular red, black, indigo, blue, sky, cyan, teal, emerald, amber, orange, rose, pink, violet
- 8 surface palettes: slate, gray, zinc, neutral, stone, soho, viva, ocean
- Light/dark mode toggle — adds/removes `.dark` class on root
- Dynamic favicon tinting via SVG filter (matches selected primary color)
- Transition guard — adds `theme-switching` class to prevent flash during mode change
- Persistence in `localStorage` via `ThemePreferencesStorage`
- `isPlatformBrowser()` guards all DOM operations
- Removes `#portfolio-pretheme` script from DOM after boot
- Runtime palette updates via `updatePrimaryPalette()` and `updateSurfacePalette()` (PrimeUI)

**Preset:** `core/theme/portfolio-aura-preset.ts` — `createPortfolioAuraPreset(primaryPalette, surfacePalette)` factory. Extends PrimeUI Aura for: Button, Divider, Popover, Ripple, Toast, ToggleSwitch.

**Default:** Angular red (primary) + Neutral (surface).

## i18n system

**Flow:** `tools/i18n/generate-prelanguage-index.ts` → generates index → inline script detects language before boot → `I18nService.initialize()` → GSAP-animated language switch

**`I18nService` capabilities:**
- Supported: Spanish (`es`) / English (`en`)
- Language switching triggers GSAP FLIP animations on visible elements
- Viewport-aware: only animates elements in viewport + 120px buffer
- Respects `prefers-reduced-motion` (skips animation if reduced)
- Excludes form inputs, badges, skill badges from animation
- Stagger timings: free targets 0.58s · contained 0.34s · layout 1.05s · icons 0.82s
- SSR-safe: reads language from Accept-Language header or cookie on server
- Persistence in `localStorage`

**In components:** text is a `computed()` signal derived from i18n keys, not direct string binding.

## Portfolio sections

| Section | Path | Notes |
|---|---|---|
| Hero | `features/portfolio/sections/hero/` | GSAP entrance via `HeroService`, CV download, `afterNextRender()` trigger |
| Experience | `features/portfolio/sections/experience/` | Timeline layout |
| Projects | `features/portfolio/sections/projects/` | GitHub API — no backend |
| Skills | `features/portfolio/sections/skills/` | |
| About | `features/portfolio/sections/about/` | Has `mocks/` + `ui/` subfolders |
| Contact | `features/portfolio/sections/contact/` | EmailJS — no backend |

**Section file pattern:**
```
sections/<section>/
├─ <section>.ts        # component (OnPush, no encapsulation)
├─ <section>.html
├─ <section>.css
├─ <section>.service.ts  # GSAP animations
├─ <section>.spec.ts
└─ mocks/              # mock data if needed
```

**GSAP pattern:** always encapsulated in `<section>.service.ts`, never in the component directly. Called from `afterNextRender()` in the component, only when `isPlatformBrowser()`.

## Portfolio entities

All in `features/portfolio/entities/` (NOT `shared/models/` — portfolio-specific data):
`about.entity.ts` · `contact.entity.ts` · `experience.entity.ts` · `hero.entity.ts` · `projects.entity.ts` · `skills.entity.ts` · `index.ts` (re-exports all)

## Core infrastructure

| Module | Path | Purpose |
|---|---|---|
| Theme | `core/theme/` | `portfolio-aura-preset.ts`, `theme.service.ts`, `theme.initializer.ts`, `theme-palettes.ts`, `pretheme.script.ts` |
| i18n | `core/i18n/` | `i18n.service.ts`, `i18n.initializer.ts`, `i18n.messages.ts`, `i18n-storage.ts`, `prelanguage-toggle.script.ts` |
| Icons | `core/common/icons/` | Lucide + custom portfolio icons, provider |
| Forms | `core/forms/` | `control-value-accessor.provider.ts` |

## Shared components

`portfolio-button` · `portfolio-carousel` · `portfolio-icon` · `portfolio-input` · `portfolio-language-toggle` · `portfolio-scroll-progress` · `portfolio-search` · `portfolio-theme-color-picker` · `portfolio-toast`

## Custom tooling (`tools/`)

| Script | File | What it generates |
|---|---|---|
| `pnpm pretheme` | `tools/theme/generate-pretheme-index.ts` | Theme index — enables pretheme inline script to prevent flash |
| `pnpm prelanguage` | `tools/i18n/generate-prelanguage-index.ts` | i18n index — language detection before Angular boots |
| `pnpm preindex` | both above | Runs pretheme + prelanguage |
| (util) | `tools/update-index-html-block.ts` | Injects script blocks into `index.html` |

Run with: `tsx --tsconfig tsconfig.tools.json`. Config: `tsconfig.tools.json` (separate from app).

## Environment (`src/environments/environment.ts`)
```typescript
{ production: false, emailJs: { serviceId, templateId, publicKey } }
```
EmailJS credentials for the contact section form.

## Key technical decisions
- **Static prerendering only** — no dynamic SSR server at runtime. Every route is prerendered at `pnpm build`.
- **Pretheme inline script** in `index.html` — generated by tools/, prevents white flash before Angular boots.
- **`@defer` on heavy sections** — incremental hydration, not all-at-once.
- **No backend** — GitHub API for projects, EmailJS for contact, everything else is static data.
- **CSS layer order in `app.config.ts`**: `base, components, primeng, utilities` — this order is intentional.
- **Dark mode selector** is `.dark` class on root (not `prefers-color-scheme` media query).

## Commands
```bash
pnpm preindex       # generate indexes (REQUIRED before build/serve)
pnpm start          # preindex + ng serve
pnpm build          # preindex + ng build (SSR + static prerender)
pnpm watch          # preindex + ng build --watch
pnpm test           # vitest run
pnpm test:watch     # vitest
pnpm audit:safe     # pnpm audit --audit-level=moderate
```
