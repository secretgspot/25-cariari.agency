# Legacy checklist audit

Reviewed against the application source and project configuration on 2026-11-05. This file records the audited state of the old checklist; it is not a commitment to implement optional or unmeasured work.

## Completed or already implemented

- [x] Property deletion reports success or failure with a toast.
- [x] API property listing has bounded page/limit pagination and tests.
- [x] Basic image optimization exists: uploads use browser-side CompressorJS; listing cards and uploader previews use lazy loading.
- [x] Database TypeScript definitions exist in `src/database.types.ts`. Their accuracy still needs to be checked against a canonical schema.
- [x] A Node built-in test suite is available through `npm test`; Vercel builds the app on deployment.
- [x] VS Code workspace settings exist.
- [x] Dark/system theme preferences and other local settings are implemented.
- [x] Loading feedback exists in several forms and views.
- [x] PWA manifest and service worker caching/offline fallback exist. This is basic offline support, not a verified offline-first application.
- [x] Responsive/mobile layouts exist; this does not certify every route or interaction for mobile.
- [x] Authenticated property create, edit, delist, and delete flows exist as SvelteKit form actions.

## Incomplete or potentially useful — decide whether to keep

### Performance and data

- [x] Measure live Core Web Vitals indicators and property payload/load times; record the local and deployed baselines in `TECHNICAL_STATUS.md`.
- [ ] Optional later follow-up: repeat mobile-throttled and field Core Web Vitals measurements, and investigate the slow first homepage navigation if it recurs or users report slowness. The current single-run results do not justify a performance code change.
- [ ] Revisit server-side property filtering and incremental loading if measurements show the current full initial property load is too large.
- [ ] Review indexes and profile slow queries after the canonical database schema is available. Current migration/schema drift makes a reliable index review premature.
- [ ] Further reduce the MapLibre client chunk only if replacing MapLibre or reducing map functionality is acceptable. Current measured chunk: 1,029.18 kB (273.62 kB gzip). Route-level splitting exists, but MapLibre remains a large chunk required by map routes.
- [ ] Review image output sizes/formats if real listing photos show a performance problem. Current client compression and lazy loading are already in place; server-side Sharp processing and automatic WebP conversion are not.

### Types, tests, and errors

- [ ] Add static analysis/type checking and decide whether to migrate selected JavaScript files to TypeScript. Do not treat a wholesale migration as required.
- [ ] Verify/regenerate `src/database.types.ts` from a reviewed canonical schema.
- [ ] Expand tests for critical flows. Current tests use Node's test runner (11 tests); component and browser end-to-end coverage are not configured.
- [ ] Standardize error handling where needed. A global error page and form/API error feedback already exist; separate Svelte error boundaries and generic retry mechanisms are not currently configured.
- [ ] Add targeted retry/recovery only for operations that can safely be retried. User-facing toast/error feedback is already used in key form flows.

### Cleanup and observability

- [ ] Review remaining debug logging selectively. Avoid deleting useful error/warning logs or adding a logging service without an operational need.
- [ ] Add production error/performance monitoring only if desired; no application monitoring service is configured.
- [ ] Continue removing code or dependencies only when unused status is confirmed.

### API and forms

- [x] API usage is described in `README.md`; no separate OpenAPI specification is currently needed.
- [x] Validate public property API filter inputs: numeric and year values, min/max ranges, property type, and text values; reject malformed inputs with `INVALID_FILTER`.
- [ ] Add rate limiting for the public read API only if abuse or traffic warrants it. CORS configuration is needed only if cross-origin clients are intended.
- [ ] **Deferred until database work resumes:** Replace the process-local public-form rate limiter with a shared, atomic mechanism using existing infrastructure. The current limit is best-effort per Vercel function instance. Avoid adding a new hosted service such as Redis.
- [ ] Decide whether there is a real machine-client use case for write API endpoints. This would add public HTTP operations for external software to create/update/delete listings; the current public API is read-only, while users already perform these actions through authenticated website forms.
- [ ] Add API-key authentication only if write access for external machine clients is approved. API keys would be credentials those clients must store and send; they are not needed for the current authenticated website forms.
- [ ] Improve the property feature/amenity input only if the existing comma-separated add/remove interaction is insufficient.
- [ ] Decide whether users need a settings page. Preferences are stored locally and theme/map settings already work, but there is no dedicated settings route.

### Tooling, deployment, and mobile

- [ ] Decide whether to add ESLint and Prettier; neither is configured.
- [ ] Decide whether Husky hooks are useful; they are not configured.
- [ ] Verify mobile usability and offline behavior on target devices before adding more mobile/PWA work.
- [ ] Tune touch gestures only if device testing identifies a problem; MapLibre already provides the map's core touch interactions.
- [ ] Decide whether production deployment configuration needs tuning; Vercel is the configured target, and no separate deployment workflow is checked in.

## Removed from this legacy list by request

- Map-specific enhancement checklist (the old Leaflet clustering, map interaction, accessibility, and progressive-loading bullets). The app now uses MapLibre; map bundle measurement/reduction is tracked separately in `TECHNICAL_STATUS.md`.

## Removed from consideration by user direction

- Replace Open Props with project-specific CSS variables. Open Props is intentionally used and should remain.
- Add Redis or another new hosted caching/rate-limiting service. Avoid new external service dependencies; consider solutions within existing infrastructure if needed.
- Add an OpenAPI endpoint/specification. The API is described in `README.md`; the user does not consider a separate OpenAPI spec necessary for current AI/MCP or developer use.
- Set a fixed 30–40% bundle-reduction target. Measure actual impact and choose a feasible target first.
- GitHub Actions CI. The validation workflow was removed by user choice; Vercel remains responsible for deployment builds and tests can be run locally with `npm test`.

Client-side CompressorJS is intentionally retained: it resizes/compresses photos before upload, which addresses large phone-camera files exceeding upload limits. Server-side image processing would happen after the original upload and would not solve that initial size constraint without changing the upload flow.
