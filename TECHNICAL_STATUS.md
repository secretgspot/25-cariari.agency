# Cariari Agency — Technical Status

> **Reviewed:** 2026-11-04  
> **Evidence:** Repository source, local production build, focused unit tests, and `npm audit --omit=dev`.  
> **Not verified:** Live Vercel deployment, production database schema/data, and runtime behavior against Supabase.

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
4. Establish a complete, repeatable database migration baseline and verify storage cleanup behavior against the live Supabase project.
5. Add static analysis/type checks and broaden critical-path test coverage.
6. Measure and reduce the large map-related client chunk; remove only confirmed-unused map implementations and dependencies.
7. Reconcile the legacy checklist in `.docs/TODO.md` with the current task tracker.
8. Product follow-ups: property comparison, featured/status listings, and a mobile filter drawer. Multi-agency support needs an authorization and data-isolation design before implementation.

See [README.md](./README.md) for setup and commands. The session task tracker contains the detailed work breakdown and dependencies.
