# Cariari.Agency — Web Application

Real estate listing platform for Cariari / La Asunción de Heredia, Costa Rica. Built with SvelteKit 3, Svelte 5, and Supabase. Vercel is the configured deployment target; production deployment was not verified as part of the repository audit.

---

## 🚀 Tech Stack

- **Framework:** [SvelteKit](https://svelte.dev/docs/kit/introduction) 3 with [Svelte 5 Runes](https://svelte.dev/docs/svelte/overview)
- **Bundler:** Vite 8
- **Backend / Database:** [Supabase](https://supabase.com/docs) (PostgreSQL, SSR Auth, Storage)
- **Maps:** [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) for the active map, property preview, and listing-location picker.
- **Email:** Nodemailer (Gmail SMTP transport) for contact form & property inquiry alerts
- **QR Codes:** `@svelte-put/qr` (dynamic printable flyer QR codes)
- **Image Optimization:** CompressorJS (client-side image compression before upload)
- **Styling:** Open Props + Custom CSS design tokens
- **Hosting:** Vercel target (`@sveltejs/adapter-auto`)

---

## 📦 Project Structure

```
cariari-agency/
├── src/
│   ├── routes/
│   │   ├── (app)/              # Main application views
│   │   │   ├── +page.svelte    # Home map explorer with Sale/Rent toggle
│   │   │   ├── properties/     # Filterable listings grid & add/edit forms
│   │   │   ├── [id]/           # Property details + InquiryForm + Print flyer
│   │   │   └── about/          # Agency information & contact form
│   │   ├── (api)/api/          # Public JSON REST API (/api/properties)
│   │   ├── (auth)/             # Login (magic link OTP) & logout
│   │   └── sitemap.xml/        # Dynamic SEO XML sitemap generator
│   ├── lib/                    # Reusable Svelte 5 components & helpers
│   │   ├── InquiryForm.svelte  # Lead capture form with honeypot & email alerts
│   │   ├── map/                # MapLibre explorer, marker layer, controls, picker, and property preview
│   │   ├── auth/               # TokenVerification OTP component
│   │   ├── buttons/            # UI button primitives
│   │   ├── toasts/             # Toast notification state
│   │   └── utils/              # Formatters, GPS helpers, validators, email
│   ├── database.types.ts       # Generated Supabase TypeScript definitions
│   └── hooks.server.js         # Supabase SSR session initialization
└── static/                     # Static assets, icons, logos, manifest
```

---

## ⚙️ Environment Variables

Use Node.js 24.x and create a `.env` file in the project root (do NOT commit to git):

```env
# Public Supabase Config
PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Server Private Config (Email Notifications)
VITE_GOOGLE_EMAIL=<your-gmail-address>
VITE_GOOGLE_EMAIL_PASSWORD=<your-gmail-app-password>
DEFAULT_AGENT_EMAIL=<fallback-agency-email>
```

---

## 🛠 Development & Build Commands

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Start dev server accessible on local network (mobile testing)
npm run dev:host

# Production build
npm run build

# Run unit tests
npm test

# Preview production build locally
npm run preview
```

`package-lock.json` is checked in so installs use the same dependency tree. The local production build succeeds, but `adapter-auto` cannot identify a production platform when run outside the deployment environment. Vercel builds the app for deployment; run `npm test` locally to execute the test suite.

---

## 📡 Public REST API

The public API is read-only and does not require an API key. Successful responses use a JSON envelope:

- `{"status": "success", "data": ...}`

Errors use `{"status": "error", "error": {"code": "...", "message": "..."}}` and an appropriate HTTP status.

### 1. List Properties

`GET /api/properties`

Returns a page of property records from the public `properties_preview` view. Supported query parameters:

- `property_for` (`Sale` or `Rent`): Match a listing type.
- `price_max` (number): Maximum sale price; properties with a zero price are excluded.
- `rent_max` (number): Maximum rent; properties with a zero rent are excluded.
- `beds_min`, `baths_min` (number): Minimum bedroom/bathroom count; zero values are excluded.
- `lot_size_min` (number): Minimum lot size in m²; zero values are excluded.
- `building_size_min`, `building_size_max` (number): Minimum and maximum building size in m². A zero size is excluded when using the minimum.
- `year_built_min`, `year_built_max` (number): Minimum and maximum construction year. A zero year is excluded when using the minimum.
- `land_use` (string): Case-insensitive partial match.
- `msl` (string): Case-insensitive partial match, e.g. `CR-003`.
- `contact_phone`, `contact_realtor`, `contact_email` (string): Case-insensitive partial matches.
- `sort` (`price`, `created_at`, or `updated_at`) and `order` (`asc` or `desc`): Apply a sort when both are supplied. Without both, results default to `created_at` descending, then `updated_at` descending; ties are ordered by `id` descending.
- `page` (positive integer, default `1`): One-based results page.
- `limit` (positive integer, default `50`, maximum `100`): Results per page.

Pagination values must be valid positive integers, and `limit` cannot exceed 100. Invalid pagination returns HTTP `400` with code `INVALID_PAGINATION`. Invalid sort/order values return HTTP `400` with code `INVALID_SORT` when both parameters are supplied.

Example: `GET /api/properties?property_for=Sale&beds_min=3&page=1&limit=24`

Successful list responses preserve the `data` array and include pagination metadata:

```json
{
  "status": "success",
  "data": [],
  "pagination": { "page": 1, "limit": 50, "total": 0, "totalPages": 0 }
}
```

Database failures return HTTP `500` with code `DATABASE_ERROR`.

The properties page progressively reveals matching listings in 24-item batches as you scroll, with an enhanced “Load more properties” button as a manual fallback. The address bar stays at `/properties`, and existing filters reset the displayed results when changed. The route currently loads the complete property set and filters it in the browser, so this limits rendered cards but does not reduce the initial data transfer.

### 2. Get Single Property

`GET /api/properties/{id}`

Returns one property from `properties_preview`, identified by its UUID or MSL value (e.g. `CR-003`):

```json
{
  "status": "success",
  "data": {}
}
```

An identifier that is neither a UUID nor an MSL in the `CR-<digits>` format returns HTTP `404` with code `INVALID_ID`. A valid-format identifier with no matching property returns HTTP `404` with code `NOT_FOUND`.

The public API currently supports `GET` only. Property creation, editing, delisting, and deletion are available through the authenticated website workflows, not public API endpoints.

---

## 📄 Core User & Field Workflows

1. **Browse & Filter:** Map-first browsing with responsive cards, instant filtering by price, beds, and property type.
2. **Field-First Listing Flow:** Agents can snap a photo, capture GPS coordinates in 1 tap, enter minimal details from a yard sign, and submit in <60 seconds. Remaining details can be enriched later.
3. **Printable Flyers with QR Codes:** Dedicated print view (`/[id]/print`) generates print-ready marketing sheets with QR links directly to the property or agent editing screen.
4. **Buyer Inquiries:** Direct inquiry form on listing pages saves leads to the database and notifies the listing agent via email immediately.

## User added notes

- current default in localstorage is good, whenever any setting that changes after such as user changing filter fields, toggles, etc then they are get stored in localstorage in appsettings, when reset filters is activated then only filter related localstorage be updated.
- compare properties in properties route, compare as many properties as viewport allows, disabled/hidden on mobile
- MapLibre GL JS
- Filter Grouping/Collapsibility: Instead of one long list of checkboxes, group them logically: "Property Type," "Size Metrics," "Year Built." Allow the user to collapse these groups if they are on a smaller screen or just want to scan quickly.
- "Clear All" Button: A highly visible button at the top of the filter sidebar that instantly resets all selections, preventing users from getting lost in complex combinations.
- As a First-Time Visitor, I want to see a prominent "Quick Search Bar" above the map so that I can immediately type "3 bed, $400k" instead of digging through filters.
- As an Agent Viewing the Map, I want property markers to change color/icon based on their status (e.g., Green = Active Listing, Yellow = Pending Sale, Red = Sold) so that I can instantly scan the map for opportunities.
- As a Potential Buyer, I want a "Featured Listings Carousel" right below the main map view, showcasing 4-5 of the absolute best/most expensive properties with high-quality thumbnails, acting as an immediate visual hook before they even start filtering.
- Advanced Responsive Display Pattern: The "Drawer" or "Sheet"
Ditch the sticky sidebar that eats up screen real estate on tablets. Use a Slide-in Drawer (or Bottom Sheet) pattern:

Mobile View: The main content is the property grid/map. When the user taps an icon (e.g., a funnel), the filter options slide in from the left edge (Drawer) or slide up from the bottom (Sheet). This keeps the map/grid visible underneath, giving context.
Tablet View: The Drawer pattern works perfectly here—it's less intrusive than a fixed sidebar.
Desktop View: You can revert to the traditional sticky sidebar, but ensure it has clear visual separation and perhaps collapses into a smaller "filter summary" bar when the user hovers over it

- Build it to support Multi-State/Role. This makes your app infinitely more valuable when selling it. A single agency platform is a niche tool; a multi-agency marketplace is a platform.
