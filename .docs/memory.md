# Cariari.Agency Project Memory

## Overview
Cariari.Agency is a real estate listing platform for Costa Rica, built with SvelteKit, Supabase, and Vercel. It allows users to browse, add, edit, and print property listings. The project is structured as a modern SvelteKit app with a focus on property data management, user authentication, and map-based property browsing.

## Tech Stack
- **Frontend:** SvelteKit (Svelte 3), Vite
- **Backend/DB:** Supabase (PostgreSQL, Auth)
- **Hosting:** Vercel
- **Other:** Leaflet (maps), QR.js (QR codes), @neoconfetti/svelte (confetti), Splide (carousel)

## Main Features
- Property listing, filtering, and detail views
- Add/Edit/Delete/Delist property (CRUD)
- Print-friendly property pages with QR codes
- Map-based property browsing (Leaflet)
- User authentication (Supabase Auth)
- Admin and regular user flows
- Responsive, modern UI with reusable Svelte components

## Data Model: Property
Properties are the core data entity. Main fields:
- id (uuid)
- user_id
- msl (listing number)
- is_active (bool)
- description (string)
- address (string)
- location (object: {lat, lng})
- land_use (string)
- property_for (array: e.g. ["Sale", "Rent", "Investment"])
- lot_size (number, m²)
- year_built (number)
- building_size (number, m²)
- building_style (string)
- rooms, beds, baths, half_baths, parking_spaces (numbers)
- features (array of strings)
- photos (array of URLs)
- price (number)
- rent (number)
- fees (number)
- taxes (number)
- contact_email, contact_phone, contact_realtor (strings)
- created_at, updated_at (timestamps)

## API Endpoints (via SvelteKit server actions)
- **GET /properties**: List all properties (uses `properties_preview` view for public, `properties` for admin)
- **POST /properties/add**: Add new property (requires user session)
- **POST /properties/[id]/edit**: Edit property (requires user session, admin can edit any)
- **POST /properties/[id]/delete**: Delete property (admin only)
- **POST /properties/[id]/remove**: Delist property (set is_active=false)
- **GET /properties/[id]**: Get property details
- **GET /properties/[id]/print**: Print-friendly property page with QR code

## Authentication & Authorization
- Supabase Auth (email/password, magic link)
- Session is available in all server actions via `getSupabase(event)`
- Only authenticated users can add/edit/delete their own listings
- Admins can edit/delete any listing

## Main User Flows
- **Browse Properties:** Map and list view, filter by type, price, beds, etc.
- **View Property:** Detail page with all property info, features, photos, contact info
- **Add Property:** Form with all property fields, photo upload, map picker
- **Edit Property:** Same as add, pre-filled, with delete/delist options
- **Print Property:** Print-optimized page with QR code for sharing

## Svelte Components
- `/src/lib/` contains reusable UI: Badge, Button, Checkbox, Editor, Map, Nav, Notify, Preview, QR, Splash, Uploader, etc.
- `/src/routes/(app)/` contains main app pages: map, property detail, add/edit/print, about
- `/src/routes/(app)/properties/` contains property list, add, filter logic

## Utilities
- `/src/lib/utils/` contains helpers for formatting, validation, local storage, time, etc.
- `/src/lib/db.js` sets up Supabase client and user store

## Data Usage
- All property data is stored in Supabase tables: `properties`, `properties_preview`, `photos`
- Filtering and sorting is done client-side and server-side
- Photos are stored as URLs (potentially in a separate `photos` table)

## External Services
- Supabase (DB, Auth)
- Google Analytics (gtag.js)

## Configuration
- Environment variables for Supabase URL and anon key
- SvelteKit config for Vite, adapters, etc.

## Deployment
- Deployed to Vercel
- Static assets in `/static/`

## Notes for Rebuild
- All property CRUD is via SvelteKit server actions using Supabase
- Auth is required for all property modifications
- Map and photo features are important for UX
- Print view is a separate route with QR code
- Admin/regular user logic is handled in server actions and UI

---
*Generated July 2, 2025. This file is intended as a memory/context file for rebuilding Cariari.Agency with a new tech stack. It summarizes all key features, data, and flows.*
