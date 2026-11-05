# Cariari Agency — Technical Status

> **Reviewed:** 2026-11-05
> **Evidence:** Repository source, local production build, focused unit tests, `npm audit --omit=dev`, read-only inspection of the live Supabase project, and local-browser verification against Supabase.
> **Not verified:** Live Vercel deployment and complete production schema export.

## Current implementation

| Area | Source-level status |
|---|---|
| Property browsing | MapLibre map, property filters, infinite-scroll listing presentation, detail and print views are implemented. |
| Listing management | Authenticated add/edit flows, image uploads, GPS capture, and property ownership checks are implemented. |
| Inquiries | Public inquiry/contact forms save inquiries or send email notifications. User-provided email-template values are now validated and HTML-escaped. |
| Authentication | Supabase SSR authentication and magic-link login are implemented. |
| API and SEO | Read-only property API and dynamic sitemap routes are implemented. |
| Tests and CI | Node test runner and GitHub Actions build/test workflow are configured. |
| Dependency security | `npm audit --omit=dev` reported no production dependency advisories. |

## Remaining priorities

1. Replace process-local public-form rate limiting with a shared, atomic production-safe mechanism.
2. Make MSL allocation atomic and enforce uniqueness in the database.
3. Bounded API pagination and progressively enhanced infinite scrolling on the properties route are implemented and verified. The route still loads its complete property set initially and filters it in the browser. Given the app's geographic scope, the expected dataset is no more than about 1,000 properties, so this is not an urgent optimization. Revisit after measuring real payload size and load time; if they become material, move property filtering and batch fetching to the server while keeping filter and cursor state out of the URL.
4. Reconcile the local/remote migration histories and capture a canonical database baseline. This is currently blocked: the checked-in July 2025 dump is stale, and an exact schema-only export requires database credentials not available in the workspace. Do not replay or repair production migration history until the export is reviewed.
5. Add static analysis/type checks and broaden critical-path test coverage.
6. Further reduce the map-related client chunk. The MapLibre chunk is 1,029.18 kB (273.62 kB gzip); the active package ships as a bundled UMD build, and the map is a primary feature. Confirmed-unused Leaflet components, CSS, and the unused map wrapper dependency have been removed. Further reduction requires choosing a replacement map implementation or reducing active map functionality.
7. Reconcile the legacy checklist in `.docs/TODO.md` with the current task tracker.

See [README.md](./README.md) for setup and commands. The session task tracker contains the detailed work breakdown and dependencies.

The database drift, live security-advisor findings, and safe baseline procedure are recorded in [supabase/README.md](./supabase/README.md). The old restore instructions in `.docs/memory.md` have been withdrawn.
