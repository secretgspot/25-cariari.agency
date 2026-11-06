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

## Remaining priorities

1. Add static analysis/type checks and broaden critical-path test coverage.
2. Measure Core Web Vitals and actual property payload/load times before setting optimization targets.
3. Further reduce the map-related client chunk only if replacing MapLibre or reducing map functionality is acceptable. The current chunk is 1,029.18 kB (273.62 kB gzip); confirmed-unused Leaflet components, CSS, and the unused map wrapper dependency have already been removed.
4. Verify mobile usability and offline behavior on target devices.
5. Reconcile the legacy checklist in `.docs/TODO.md` with the current task tracker.

## Deferred until database work resumes

- Replace process-local public-form rate limiting with a shared, atomic mechanism. The current in-memory limit remains best-effort per Vercel function instance; defer implementation until database changes are back in scope.
- Decide on a safe migration/baseline workflow for future database changes. The current production schema and data have been dumped outside the repository, but restore has not been tested. Do not run `supabase db push` or `migration repair` against production until a plan is reviewed.
- Review indexes/slow queries and verify or regenerate database types from a reviewed schema.

See [README.md](./README.md) for setup and commands. The session task tracker may contain additional detail when tasks are actively being worked.

The database migration status and backup limitations are recorded in [supabase/README.md](./supabase/README.md). The old restore instructions in `.docs/memory.md` have been withdrawn.
