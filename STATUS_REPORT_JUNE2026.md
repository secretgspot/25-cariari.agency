# Cariari Agency — Technical Status & Architecture Review

> **Status:** Production Active (131+ listings)  
> **Last Updated:** 2026-08-30 (Supersedes June 2026 draft)

---

## 🌟 Production Features & Strengths

| Feature | Implementation | Status |
|---|---|---|
| **Map Explorer** | Leaflet with custom clustering & markers | ✅ Production Live |
| **Lead Capture** | `InquiryForm.svelte` + DB + Nodemailer | ✅ Production Live |
| **Auth System** | Supabase OTP magic link + `TokenVerification.svelte` | ✅ Production Live |
| **Field Add Workflow** | Client CompressorJS + GPS Geolocation | ✅ Production Live |
| **Print Flyers** | QR code generation via `@svelte-put/qr` | ✅ Production Live |
| **SEO & Sitemap** | Dynamic `/sitemap.xml` from active listings | ✅ Production Live |
| **Public REST API** | JSON API with multi-field filtering | ✅ Production Live |
| **AI Integration** | Stdio MCP server for LLMs in `cariari-agency-mcp/` | ✅ Production Live |

---

## 🔒 Security Triage Status

1. **Icon.svelte SVG Rendering (Closed — Theoretical)**:
   - Call sites pass fixed string literals (`kind="phone"`, etc.).
   - SVGs are sanitized/parsed via `DOMParser` from local `static/icons/`.
   - Per HTML5 specification, script tags in innerHTML SVG elements are inert.
2. **CSRF (Closed — Native SvelteKit)**:
   - Protected natively by SvelteKit's Origin header validation and SameSite cookie settings.
3. **Rate Limiting (Focused on Public Forms)**:
   - Streamlined `src/lib/utils/rateLimit.js` prepared strictly for public `inquiry` and `contact` forms to guard Gmail SMTP quotas from automated scripts. Add/Edit are unrestricted for agents; Auth OTP is rate-limited by Supabase.
4. **Environment Variables (Verified Clean)**:
   - Verified that `.env` is not tracked in git. All secrets are maintained in private config.

---

## 📦 Dependency Rollback Summary

Major dependency versions have been locked to stable releases:
- **Vite:** 5.4.21
- **@sveltejs/kit:** 2.5.27
- **@sveltejs/adapter-auto:** 3.3.0
- **@sveltejs/vite-plugin-svelte:** 4.0.0
- **nodemailer:** 7.0.13
- **uuid:** 11.1.1

---

## 📋 Roadmap Next Steps

See [PLAN.md](../../PLAN.md) in the workspace root for detailed phase milestones:
1. **Phase 1b**: Agent Inquiries Dashboard UI.
2. **Phase 1c**: Public Form Rate Limiting connection (`inquiry` and `contact`).
3. **Phase 2**: Listing Quality UX (incomplete badges and enrichment helpers).
4. **Phase 3**: Accessibility Remediation (semantic landmarks, focus management, labels).
