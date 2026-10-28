# Cariari.Agency — Web Application

Production real estate listing platform for Cariari / La Asunción de Heredia, Costa Rica. Built with SvelteKit 2 (Svelte 5 Runes) and Supabase, deployed on Vercel.

---

## 🚀 Tech Stack

- **Framework:** [SvelteKit 2](https://svelte.dev/docs/kit/introduction) with [Svelte 5 Runes](https://svelte.dev/docs/svelte/overview)
- **Bundler:** Vite 5
- **Backend / Database:** [Supabase](https://supabase.com/docs) (PostgreSQL, SSR Auth, Storage)
- **Maps:** [Leaflet](https://leafletjs.com/reference.html) (interactive property markers & static preview)
- **Email:** Nodemailer (Gmail SMTP transport) for contact form & property inquiry alerts
- **QR Codes:** `@svelte-put/qr` (dynamic printable flyer QR codes)
- **Image Optimization:** CompressorJS (client-side image compression before upload)
- **Styling:** Open Props + Custom CSS design tokens
- **Hosting:** Vercel (`@sveltejs/adapter-auto`)

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
│   │   ├── map/                # Leaflet map explorer & picker components
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

Create a `.env` file in the `cariari-agency/` root (do NOT commit to git):

```env
# Public Supabase Config
PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Server Private Config (Email Notifications)
VITE_GOOGLE_EMAIL=<your-gmail-address>
VITE_GOOGLE_PASSWORD=<your-gmail-app-password>
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

# Preview production build locally
npm run preview
```

---

## 📡 Public REST API

All responses return standard JSON envelopes:

- `{"status": "success", "data": ...}`
- `{"status": "error", "error": {"code": "...", "message": "..."}}`

### 1. List Properties

`GET /api/properties`

**Available Query Parameters:**

- `property_for` (string): Filter by type (`Sale`, `Rent`)
- `price_max` (number): Maximum sale price
- `rent_max` (number): Maximum rent price
- `beds_min` (number): Minimum bedroom count
- `baths_min` (number): Minimum bathroom count
- `lot_size_min` (number): Minimum lot size in m²
- `building_size_min` / `building_size_max` (number): Living area range in m²
- `year_built_min` / `year_built_max` (number): Construction year range
- `land_use` (string): Filter by zoning / property type (e.g., residential)
- `msl` (string): Filter by MLS reference (partial match, e.g., `cr-001`)
- `sort` (string): Field to sort by (`price`, `created_at`, `updated_at`)
- `order` (`asc` | `desc`): Sort order

### 2. Get Single Property

`GET /api/properties/:id`

Supports retrieval by UUID or MLS identifier (e.g. `cr-003`).

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
