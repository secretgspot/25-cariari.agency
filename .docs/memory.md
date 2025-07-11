# Cariari.Agency Project Memory

## Overview

Cariari.Agency is a real estate listing platform for Costa Rica, built with SvelteKit and Supabase, and is hosted on Vercel. It allows users to browse, add, edit, and print property listings. The project is structured as a modern SvelteKit app with a focus on property data management, user authentication, and map-based property browsing.

## Supabase Database Setup

To set up the Supabase database for local development or a new environment, you can use the SQL backup files located in the `.docs/` directory. These files contain the database schema and sample data.

1.  **Navigate to the Supabase SQL Editor:**
    Go to your Supabase project's dashboard and open the "SQL Editor".

2.  **Restore the Schema:**
    Open the `july_2025_schema_backup.sql` file from the `.docs/` directory, copy its contents, and paste them into the Supabase SQL Editor. Run the query to create the database tables and relationships.

3.  **Populate the Database:**
    Open the `july_2025_data_backup.sql` file from the `.docs/` directory, copy its contents, and paste them into the Supabase SQL Editor. Run the query to populate the tables with sample data.

## Supabase Type Generation

To ensure the project has up-to-date TypeScript definitions for the Supabase database schema, you need to generate the `database.types.ts` file. This is crucial for type safety and autocompletion, even in a JavaScript-based project.

1. **Log in to the Supabase CLI:**

    ```bash
    npx supabase login
    ```

2. **Generate the types:**
    Replace `<your-project-id>` with the actual ID from your Supabase project dashboard.

    ```bash
    npx supabase gen types typescript --project-id <your-project-id> > src/database.types.ts
    ```

3. **Update `src/app.d.ts`:**
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
- **Other:** Leaflet and MapLibre (maps), QR.js (QR codes), @neoconfetti/svelte (confetti)

## Main Features

- Property listing, filtering, and detail views
- Add/Edit/Delete/Delist property (CRUD)
- Print-friendly property pages with QR codes
- Map-based property browsing (Leaflet or MapLibre)
- User authentication (Supabase Auth)
- Admin and regular user flows
- Responsive, modern UI with reusable Svelte components

## Project Structure

- **`.docs/`**: Contains project documentation, including memory files, setup guides, and other relevant markdown files.
- **`.vscode/`**: Contains VS Code workspace settings.
- **`src/`**: Contains the main application source code.
- **`static/`**: Contains static assets served directly by the web server.
- **`.gitignore`**: Specifies intentionally untracked files to ignore.
- **`.npmrc`**: Configuration file for npm.
- **`package.json`**: Lists the project dependencies and scripts.
- **`README.md`**: Contains project overview and setup instructions.
- **`svelte.config.js`**: SvelteKit configuration file.
- **`vite.config.js`**: Vite configuration file.

## Utilities

- `/src/lib/utils/`:
  - `dragable.js`: Utilities for making elements draggable.
  - `emailSetup.server.js`: Server-side utilities for email setup.
  - `helpers.js`: General helper functions.
  - `mapUtils.js`: Utilities for map functionality.
  - `storable.js`: Utilities for creating storable values.
  - `time.js`: Utilities for time-related operations.
  - `validators.js`: Validation functions.

## Deployment

- Deployed to Vercel
- Static assets in `/static/`

---
*Generated July 11, 2025. This file is intended as a memory/context file for rebuilding Cariari.Agency with a new tech stack. It summarizes all key features, data, and flows.*
