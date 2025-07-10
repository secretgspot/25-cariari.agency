# Cariari.Agency Project Memory

## Overview

Cariari.Agency is a real estate listing platform for Costa Rica, built with SvelteKit and Supabase, and is hosted on Vercel. It allows users to browse, add, edit, and print property listings. The project is structured as a modern SvelteKit app with a focus on property data management, user authentication, and map-based property browsing.

## Supabase Type Generation

To ensure the project has up-to-date TypeScript definitions for the Supabase database schema, you need to generate the `database.types.ts` file. This is crucial for type safety and autocompletion, even in a JavaScript-based project.

1.  **Log in to the Supabase CLI:**
    ```bash
    npx supabase login
    ```
2.  **Generate the types:**
    Replace `<your-project-id>` with the actual ID from your Supabase project dashboard.
    ```bash
    npx supabase gen types typescript --project-id <your-project-id> > src/database.types.ts
    ```
3.  **Update `src/app.d.ts`:**
    Ensure the `app.d.ts` file points to the newly generated types file.
    ```typescript
    // src/app.d.ts
    declare namespace App {
      interface Supabase {
        Database: import('./database.types').Database;
        SchemaName: 'public';
      }
      // ... other interfaces
    }
    ```

## Development Guidelines

- **Frameworks**: Always use Svelte 5 and SvelteKit 2 for all new features and refactoring.
  - Svelte 5 Docs: <https://svelte.dev/docs/svelte/overview>
  - SvelteKit 2 Docs: <https://svelte.dev/docs/kit/introduction>

## Tech Stack

- **Frontend:** SvelteKit 2 (Svelte 5), Vite
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

- Supabase Auth (magic link/OTP)
- Only authenticated users can add/edit/delete their own listings
- Admins can edit/delete any listing
- For detailed implementation, refer to: <https://supabase.com/docs/guides/auth/server-side/sveltekit>

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

## Project Structure

- **`.docs/`**: Contains project documentation, including memory files, setup guides, and other relevant markdown files.
- **`src/`**: Contains the main application source code.
- **`static/`**: Contains static assets served directly by the web server.
  - `favicon.png`, `favicon.svg`: Favicon files.
  - `robots.txt`: Defines rules for web crawlers.
  - `ads/`: Contains advertisement images.
  - `css/`: Contains global CSS files, including `leaflet.css` (for maps), `normalize.css` (CSS reset), `print.css` (print-specific styles), and `styles.css` (main application styles).
  - `icons/`: Contains SVG icons used throughout the application (e.g., `icon_arrow_left.svg`, `icon_baths.svg`).
  - `logo/`: Contains various versions of the company logo in different formats and colors.
  - `map/`: Contains assets related to the map functionality, such as Leaflet marker icons and property type SVG markers (`Rent.svg`, `Sale.svg`).
  - `placeholder/`: Contains placeholder images for various purposes.

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
*Generated July 7, 2025. This file is intended as a memory/context file for rebuilding Cariari.Agency with a new tech stack. It summarizes all key features, data, and flows.*

## Refactoring of `/properties` Page (July 8, 2025)

The `/properties` page underwent significant refactoring to improve filtering and overall user experience.

**Key Changes:**

*   **Client-Side Filtering:** The filtering logic for properties was moved from server-side to client-side. This eliminates complex URL parameters and simplifies the server-side data fetching, which now retrieves all properties.
    *   `src/routes/(app)/properties/+page.server.js`: Reverted to fetching all properties without filtering.
    *   `src/routes/(app)/properties/filter-store.js`: The `getFilteredProperties` function was re-introduced to handle client-side filtering based on the `filterStore` values.
    *   `src/routes/(app)/properties/+page.svelte`: No longer uses URL parameters for filtering. The `loading` state and related logic were removed.
*   **Improved Property Type Selection:**
    *   The default "Property Type" in the filter is now pre-selected to 'Residential'.
    *   The "Select Property Type" placeholder option was removed from the dropdown in `src/lib/Select.svelte`.
*   **Removed 'Investment' Filter:** The 'Investment' option was removed from the property transaction type filters, as it is no longer used.
*   **Beds/Baths Filtering Improvements:**
    *   The number inputs for beds and baths were replaced with `Select` dropdowns offering predefined options (e.g., 'Any', '1+', '2+').
    *   The filtering logic in `filter-store.js` was updated to correctly parse these 'X+' values and handle potential `null`/`undefined` property values by defaulting them to 0 for comparison.
    *   The 'rooms' filter was completely removed.
*   **Lot Size Filter:** A new text input filter for 'Lot Size' was added to the 'Features' section, allowing users to filter properties by minimum lot size.
*   **Property Count Display:** The property count display was updated to show both the filtered count and the total count (`{filtered.length} / {data.properties.length}`). The total count now dynamically reflects the total number of properties that match both the `active` status and the selected `property_type`.
*   **Supabase Function for `jsonb` Array Overlaps:** A custom PostgreSQL function `jsonb_array_overlaps` was added to the Supabase database to handle `jsonb` array filtering more robustly. This function checks if any elements from a provided text array exist within a `jsonb` array column.
    *   **SQL for Function Creation:**
        ```sql
        CREATE OR REPLACE FUNCTION public.jsonb_array_overlaps(
            jsonb_array jsonb,
            text_array text[]
        )
        RETURNS boolean
        LANGUAGE plpgsql
        AS $function$
        BEGIN
            RETURN jsonb_array @> to_jsonb(text_array);
        END;f
        $function$;
        ```
    *   **Note:** While the function was added, the client-side filtering approach was ultimately adopted to simplify the URL and address immediate issues. The function remains available for potential future server-side filtering needs.
*   **Code Cleanliness:** Removed commented-out code and debug `console.log` statements.
*   **New Component:** A `NothingToSee.svelte` component was created in `src/lib/` to encapsulate the empty state message.

## Current State Update (July 8, 2025)

The edit form functionality has been thoroughly refactored and tested.

*   **Edit Form Submission:** Changing random values on the edit form and submitting now works correctly. Updates are reflected in the database and visible upon page refresh.
*   **UI Notifications:** Error notifications are now correctly displayed in the UI for failed form submissions, addressing previous issues where only console errors were visible.
*   **Uploader Component:** The `Uploader.svelte` component has been refactored to implement direct client-side uploads and deletions to Supabase Storage, aligning with recommended best practices for file integrity and efficiency. This involved significant changes to `Uploader.svelte`, `+page.svelte`, and `+page.server.js`.
*   **Photo Management:** Photo data is now managed in a separate `photos` table, linked to the `properties` table. The server-side logic (`+page.server.js`) correctly handles adding and deleting photo records in the database based on changes made via the `Uploader` component.

We are now proceeding with testing the Uploader functionality.