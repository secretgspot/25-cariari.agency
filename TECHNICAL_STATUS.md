# Cariari Agency — Technical Status

> **Reviewed:** 2026-11-05
> **Evidence:** Repository source, local production build, focused unit tests, `npm audit --omit=dev`, read-only inspection of the live Supabase project, local-browser verification, and the user's confirmation of successful Vercel deployment and property add/remove.
> **Not verified:** Restore of the user's current schema/data dumps to another Supabase project.

## Current implementation

| Area | Source-level status |
|---|---|
| Property browsing | MapLibre map, property filters, infinite-scroll listing presentation, detail and print views are implemented. |
| Listing management | Authenticated add/edit flows, image uploads, GPS capture, and property ownership checks are implemented. |
| Inquiries | Public inquiry/contact forms save inquiries or send email notifications. User-provided email-template values are now validated and HTML-escaped. |
| Authentication | Supabase SSR authentication and magic-link login are implemented. |
| API and SEO | Read-only property API and dynamic sitemap routes are implemented. |
| Tests and deployment | Node test runner is available locally; Vercel builds the app on deployment. GitHub Actions CI was removed by user choice. |
| Dependency security | `npm audit --omit=dev` reported no production dependency advisories. |

## Performance measurements

### Live Vercel deployment

Measured on 2026-11-05 against `https://25-cariari-agency.vercel.app/` in Chromium at a 1609 × 909 desktop viewport, without CPU or network throttling. This is a lab run, not field Core Web Vitals.

| Route | TTFB | FCP | LCP | CLS | HTML response |
|---|---:|---:|---:|---:|---:|
| `/` (first browser load) | 2,350 ms | 2,812 ms | 2,812 ms | 0.0000 | 21,195 encoded bytes |
| `/properties` | 224 ms | 388 ms | 804 ms | 0.0000 | 172,023 encoded bytes |

The first homepage navigation is slow in this one browser run: its TTFB and LCP exceed the commonly used “good” thresholds of 800 ms and 2.5 s respectively. Repeated direct HTTP requests to the homepage completed in 368–692 ms, so the browser result needs repeat testing before attributing the delay to the server. It is a signal to investigate, not proof of consistently poor user experience.

The homepage loaded 57 resources totaling 458,471 transferred bytes (1,578,024 decoded). The MapLibre chunk transferred 277,355 bytes (1,029.18 kB decoded; 273.62 kB gzip in the build output). The properties route rendered 24 cards for 118 matched listings, but sent the full initial dataset in its 172,023-byte HTML response. The live property API returned 133 records across two pages: 91,514 bytes for 100 records (428 ms) and 33,482 bytes for 33 records (334 ms). Browser Resource Timing could not report transfer sizes for same-origin cached assets on the properties route or cross-origin property photos.

A 390 × 844 viewport check on the properties route found no horizontal overflow; it was not a throttled mobile performance run. INP, network/CPU-throttled results, and real-user/field data remain unmeasured.

### Local production-build reference

The local Vite preview run on 2026-11-05 at 1609 × 909, without CPU or network throttling, measured `/` at 748 ms TTFB / 812 ms FCP / 812 ms LCP and `/properties` at 498 ms / 620 ms / 984 ms. Its homepage resource total was 448,982 transferred bytes (1,578,274 decoded). These results are retained as a reference only; live Vercel measurements above are more representative of the deployed app.

## Remaining priorities

1. Add static analysis/type checks and broaden critical-path test coverage.
2. Further reduce the map-related client chunk only if replacing MapLibre or reducing map functionality is acceptable. The current chunk is 1,029.18 kB (273.62 kB gzip); confirmed-unused Leaflet components, CSS, and the unused map wrapper dependency have already been removed.
3. Verify mobile usability and offline behavior on target devices.
4. Reconcile the legacy checklist in `.docs/TODO.md` with the current task tracker.

Optional performance follow-up: repeat mobile-throttled and field Core Web Vitals measurements, and investigate the slow first homepage navigation if it recurs or users report slowness. The current single-run results do not justify a performance code change.

## Deferred until database work resumes

- Replace process-local public-form rate limiting with a shared, atomic mechanism. The current in-memory limit remains best-effort per Vercel function instance; defer implementation until database changes are back in scope.
- Decide on a safe migration/baseline workflow for future database changes. The current production schema and data have been dumped outside the repository, but restore has not been tested. Do not run `supabase db push` or `migration repair` against production until a plan is reviewed.
- Review indexes/slow queries and verify or regenerate database types from a reviewed schema.

See [README.md](./README.md) for setup and commands. The session task tracker may contain additional detail when tasks are actively being worked.

The database migration status and backup limitations are recorded in [supabase/README.md](./supabase/README.md). The old restore instructions in `.docs/memory.md` have been withdrawn.
