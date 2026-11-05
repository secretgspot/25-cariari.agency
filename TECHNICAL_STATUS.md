# Cariari Agency — Technical Status

> **Reviewed:** 2026-11-05
> **Evidence:** Repository source, local production build, focused unit tests, `npm audit --omit=dev`, and read-only inspection of the live Supabase project.
> **Not verified:** Live Vercel deployment, full production schema export, and runtime behavior against Supabase.

## Current implementation

| Area | Source-level status |
|---|---|
| Property browsing | MapLibre map, property filters, detail and print views are implemented. |
| Listing management | Authenticated add/edit flows, image uploads, GPS capture, and property ownership checks are implemented. |
| Inquiries | Public inquiry/contact forms save inquiries or send email notifications. User-provided email-template values are now validated and HTML-escaped. |
| Authentication | Supabase SSR authentication and magic-link login are implemented. |
| API and SEO | Read-only property API and dynamic sitemap routes are implemented. |
| Tests and CI | Node test runner and GitHub Actions build/test workflow are configured. |
| Dependency security | `npm audit --omit=dev` reported no production dependency advisories. |

## Remaining priorities

1. Replace process-local public-form rate limiting with a shared, atomic production-safe mechanism.
2. Make MSL allocation atomic and enforce uniqueness in the database.
3. Add deterministic pagination to property and API reads.
4. Reconcile the local/remote migration histories and capture a canonical database baseline. This is currently blocked: the checked-in July 2025 dump is stale, and an exact schema-only export requires database credentials not available in the workspace. Do not replay or repair production migration history until the export is reviewed.
5. Add static analysis/type checks and broaden critical-path test coverage.
6. Measure and reduce the large map-related client chunk; remove only confirmed-unused map implementations and dependencies.
7. Reconcile the legacy checklist in `.docs/TODO.md` with the current task tracker.
8. Product follow-ups: property comparison, featured/status listings, and a mobile filter drawer. Multi-agency support needs an authorization and data-isolation design before implementation.

See [README.md](./README.md) for setup and commands. The session task tracker contains the detailed work breakdown and dependencies.

The database drift, live security-advisor findings, and safe baseline procedure are recorded in [supabase/README.md](./supabase/README.md). The old restore instructions in `.docs/memory.md` have been withdrawn.
