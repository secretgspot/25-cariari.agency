# Cariari Agency — Status Report (June 2026)

> Generated: 2026-06-03

---

## Project Overview

| Property | Value |
|---|---|
| **Framework** | SvelteKit 5 (Svelte 5 runes) |
| **Language** | JavaScript (ESM) + minimal TypeScript types |
| **Database** | Supabase (PostgreSQL, Auth, Storage) |
|| **Maps** | Leaflet (MapLibre removed, consolidated) |
| **Email** | Nodemailer + Gmail SMTP |
| **Hosting** | Vercel |
| **Auth** | Supabase OTP magic link + `@supabase/ssr` |
| **CSS** | Open Props (partial) + custom properties |
| **QR** | `@svelte-put/qr/svg` |
| **Other** | CompressorJS, Web Audio API, Vibration API |

---

## 🔴 High Priority

### 🔐 Security

| # | Issue | Location | Fix |
|---|---|---|---|
| 1 | **XSS vector in Icon.svelte** — fetches SVG from `/icons/${kind}.svg` and renders via `{@html svgContent}` without sanitization | `src/lib/Icon.svelte:10,47` | Sanitize SVG content with DOMParser allowlist, or inline SVGs directly |
| 2 | **`.env` tracked in git** — visible in directory listing | Project root | Add to `.gitignore` immediately; rotate any leaked keys |
| 3 | **No CSRF protection** on form actions | All `+page.server.js` form actions (add, edit, delete, toggle_active, contact) | Add CSRF tokens or check `origin` header |
| 4 | **No rate limiting** on auth/login or contact form | `login/+page.svelte`, `about/+page.server.js` | Add in-memory or Supabase rate limiting |
| 5 | **Auth state change listener leak** — `onAuthStateChange` registered in `hooks.server.js` on every HTTP request | `src/hooks.server.js:57` | Move listener to client-side root layout, not server hooks |

### ♿ Accessibility

| # | Issue | Location | Fix |
|---|---|---|---|
| 6 | **No `<main>` or `<nav>` landmarks** | `src/app.html` + all pages | Wrap page content in `<main>`, navigation in `<nav aria-label="Main">` |
| 7 | **Map controls not keyboard accessible** (GPS toggle, layer switcher) | `src/lib/map/Map.svelte` | Add `role`, `aria-label`, keyboard event handlers to custom Leaflet controls |
| 8 | **Uploader drop zone has `role="region"` but no label** | `src/lib/Uploader.svelte:159` | Add `aria-label="Photo upload drop zone"` |
| 9 | **Login OTP inputs lack labels and autocomplete** | `login/+page.svelte` | Add `<label>` elements and `autocomplete="one-time-code"` |
| 10 | **No focus management** on page navigation | All pages | Use SvelteKit's `afterNavigate` to focus `<h1>` or skip-link |
| 11 | **`data-sveltekit-prefetch` on `<body>`** prefetches all links by default | `src/app.html:25` | Remove or use per-link `data-sveltekit-preload-data` to save mobile bandwidth |

### ⚡ Performance / Bundle

| # | Issue | Location | Fix |
|---|---|---|---|
|| 12 | **No lazy/dynamic import for heavy map deps** in static/picker components | `MapStatic.svelte`, `MapPicker.svelte` | Use `await import('leaflet')` inside `onMount` (Map.svelte already does this correctly) |
| 13 | **`open-props` full package bundled** despite only using CSS variable tokens | `package.json` + `static/css/styles.css` | Replace with only needed custom properties inline, or use `open-props/postcss` to tree-shake |
| 14 | **No Core Web Vitals optimization** | Global | Optimize LCP (hero image priority), INP (map interaction responsiveness), CLS (map container aspect ratio) |
| 15 | **Images lack explicit dimensions** | Throughout add/edit pages, property cards | Add `width`/`height` to avoid CLS; consider `fetchpriority="high"` on first meaningful image |

### 🏗 Architecture

| # | Issue | Location | Fix |
|---|---|---|---|
| 16 | **Add/Edit forms are ~80% duplicated code** | `properties/add/+page.svelte` vs `[id]/edit/+page.svelte` | Extract shared form into reusable `PropertyForm.svelte` component |
| 17 | **No TypeScript usage** despite having `database.types.ts` with full schema | All `.svelte` and `.js` files | Add `// @ts-check` incrementally; import generated types in load functions |
| 18 | **No error boundaries** — one unhandled promise = blank page | `+error.svelte` exists but no granular per-component boundaries | Add Svelte 5 `onerror` or try/catch in `$effect` blocks |
| 19 | **Filter store is client-only** — no URL sync, not shareable | `properties/filter-store.js` | Sync filter state to URL search params for shareability and back-button support |

---

## 🟡 Medium Priority

| # | Issue | Location | Fix |
|---|---|---|---|
| 20 | **Sitemap includes inactive (unpublished) properties** | sitemap generation vs `properties_preview` view | Filter `is_active = true` in sitemap to avoid indexing unpublished listings |
| 21 | **No pagination on property listing** | `properties/+page.svelte` | Add server-side pagination + infinite scroll or load-more button |
| 22 | **GPS map bounds hardcoded** to ~2km² area | All map components: `maxBounds` constant | Make bounds configurable or remove for production flexibility |
| 23 | **Console.log / debug statements in production code** | `Map.svelte:258`, `hooks.server.js:38,46,59,61`, `Icon.svelte:24` | Remove or gate behind `dev` check |
| 24 | **Contact form has no visual feedback** on submit | `about/+page.svelte` + `about/+page.server.js` | Add loading spinner + success/error toast (currently redirects with `?sent=true` query param) |
|| 25 | **MapLibre components removed** — consolidated to Leaflet | — | Done |

---

## 🟢 Low Priority / Enhancements

| # | Issue | Location | Fix |
|---|---|---|---|
| 26 | **No Offline fallback page** in service worker | `src/service-worker.js` | Add offline.html for when network + cache both miss |
| 27 | **No PWA theme-color meta tag** | `src/app.html` | Add `<meta name="theme-color" content="...">` for installed PWA |
| 28 | **Missing apple-touch-icon and favicon variations** | `src/app.html` — only links `favicon.svg` | Add icons for various device sizes |
| 29 | **No proper validation styling** — forms don't use `:user-valid` / `:user-invalid` | `static/css/styles.css` | Add CSS for `:user-valid`, `:user-invalid`, `:user-out-of-range` for better form UX |
| 30 | **`@svelte-put/qr` could be lazy-loaded** — only needed on print page | `package.json` + print page | Dynamic import only when navigating to print route |
| 31 | **Settings page is referenced but not implemented** | `settings/settings.js` exists, no settings UI | User preferences page for theme/sound/vibration toggles |
| 32 | **Toast system could use animation** — no enter/exit transitions | `toasts/Toasts.svelte` | Add Svelte `fly` or `slide` transitions for smoother toast appearance |
| 33 | **No automated tests** at any level | Project root | Add Vitest + Testing Library for components, Playwright for E2E |

---

## 🔧 Developer Experience

| # | Item | Status |
|---|---|---|
| 34 | ESLint configured | ❌ Missing |
| 35 | Prettier configured | ❌ Missing |
| 36 | Husky / pre-commit hooks | ❌ Missing |
| 37 | VS Code workspace settings | ✅ Present (`.vscode/settings.json`) |
| 38 | TypeScript strict mode | ❌ Not configured |
| 39 | CI/CD pipeline | ❌ Missing |

---

## 📝 TODO Checklist (from project `.docs/TODO.md`)

| Item | Status | Notes |
|---|---|---|
| Property deletion toast notification | ❌ Not done | No toast on delete success/fail |
|| Map library consolidation (Leaflet vs MapLibre) | ✅ Done | Consolidated to Leaflet; MapLibre removed |
| Zustand or global state management | ❌ Not done | Currently using Svelte stores + runes |
| Component size analysis (>200 lines) | ❌ Not done | |
| Server-side image processing (Sharp/WebP) | ❌ Not done | Client-side CompressorJS only |
| Testing framework (Vitest + Playwright) | ❌ Not done | |
| API: POST/PUT/DELETE endpoints | ❌ Not done | Only GET exists |
| OpenAPI spec | ❌ Not done | |
| API key auth for external access | ❌ Not done | |
| Dark mode theming | ✅ Done | Via `prefers-color-scheme` + attribute toggle |
| Print-friendly pages | ✅ Done | Dedicated print CSS + flyer layout |
| QR code on print flyers | ✅ Done | Via `@svelte-put/qr` |
| Sitemap (dynamic XML) | ✅ Done | |
| PWA service worker | ✅ Done | Cache-first for build assets |
| Responsive design | ✅ Done | CSS custom properties + media queries |
| Supabase auth (OTP magic link) | ✅ Done | |
| Admin role checks | ✅ Done | Via `app_metadata.claims_admin` |
| Image upload + compression | ✅ Done | Client-side CompressorJS |
| GPS location tracking on map | ✅ Done | Via Geolocation API + Leaflet |

---

*Generated from comprehensive code audit using modern-web-guidance and best-practice analysis.*
