# Cariari.Agency

```ansi
                          ,,▄▄▄▄▄████▄▄▄▄▄,
                    ,╓▄▓███▀▀▀▀▀`'`'`▀▀▀▀▀████▄▄,
                 ▄███▀"_                     _▀▀██▓▄
              ▄███▀                              _"▀▓▓▄
           ,▄██▀                                     ╙███,
          ▄██`_         ,,,                ,,          `███
        ▄██▀_         _███▓▄,,         ,,▄█▓▓▓µ          `██▄
       ██▀_           _███▓▓▓██████████████▓▓▓_           _▀██
      ██▀_             _▀█▓▓▓███████████████▀               ╙██
    _██▀        ▄█████▄▄, _"▀████████████▀__ ,▄▄█████        "██
    ██▌       ╒███████████▓▄▄▄,▀██████▀▄▄▄██▓▓▓███████▄       ▐██_
   ]██_       _▀▀▀████████▓▓▓██████████████▓▓▓▓████▀▀▀'        ██▌
   ██▌              _▀████▓▓▓██████████████▓▓▓▓▀`_             ]██
  _██_                _▀██▓▓▓██████████████▓▓▀                 _██
  _██_                   ▀▓▓▓██████████████▀                    ██
  _██_                     ╙█████████████▀                     _██
   ██U                      ╓███████████▄                      _██_
   ▐█▌                    a▓▓█████████████▄                    ▐█▌
   _██                  ▄█▓▓▓███████████████▄                 _██_
    ╙██               ▄███▓▓▓██████████████▓▓▓▄,              ██▌
     ▐██          ,▄▄█████▓▓▓██████████████▓▓▓▓██▄,          ██▀_
      ╙██     ▐███████████▓▓▓█████▀▀███████▓▓▓▓████████_   ,██▀_
       _██▄   _▀██████████▓▀▀`__     __"▀▀██▓▓▓███████'   ▄██"
        _▀██▄   "▀█▀▀▀▀` _                   _`▀▀▀██▀_  ╓██▀_
          _▀██▄                                       ▄██▀
            _▀███▄                                 ,▄██▀
               _▀███▄,                         ,▄▄█▓▀ _
                  _"▀▓▓▓▄▄▄,             ,▄▄▄███▀"
                       _"▀▀▀██████████████▀▀▀__
```

[Cariari.Agency](https://cariari.agency)

Cariari.Agency is a real estate listing platform for Costa Rica, built with SvelteKit, Supabase, and hosted on Vercel. It allows users to browse, add, edit, and print property listings.

## Tech Stack

- **Frontend:** SvelteKit [SvelteLit Docs](https://svelte.dev/docs/kit/introduction)
- **Backend/DB:** Supabase [Supabase Docs](https://supabase.com/docs)
- **Hosting:** Vercel [Vercel Docs](https://vercel.com/docs)
- **Map:** Leaflet/MapLibre (maps) [Leaflet Docs](https://leafletjs.com/reference.html) [Maplibre Docs](https://maplibre.org/maplibre-gl-js/docs/)
- **QR:** QR [QR Docs](https://github.com/Castlenine/svelte-qrcode)

## Main Features

- Property listing, filtering, and detail views
- Add/Edit/Delete/Delist property (CRUD)
- Print-friendly property pages with QR codes
- Map-based property browsing (Leaflet/MapLibre)
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
- property_for (array: e.g. ["Sale", "Rent"])
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
- **GET /sitemap.xml**: Get dynamically generated sitemap for SEO

## API Endpoints

The following API endpoints are available for programmatic access to property data. All responses are in JSON format and follow a consistent `{"status": "success", "data": ...}` or `{"status": "error", "error": {...}}` structure.

### Get All Properties

`GET /api/properties`

Retrieves a list of all properties. Supports filtering and sorting via query parameters.

**Query Parameters:**

- `property_for` (string, optional): Filter by property type (e.g., `Sale`, `Rent`).
  - **Example:** `?property_for=Sale`
- `price_max` (number, optional): Maximum price for sale properties.
  - **Example:** `?price_max=500000`
- `rent_max` (number, optional): Maximum rent for rental properties.
  - **Example:** `?rent_max=2000`
- `beds_min` (number, optional): Minimum number of bedrooms.
  - **Example:** `?beds_min=3`
- `baths_min` (number, optional): Minimum number of bathrooms.
  - **Example:** `?baths_min=2`
- `lot_size_min` (number, optional): Minimum lot size in square meters.
  - **Example:** `?lot_size_min=500`
- `contact_phone` (string, optional): Filter by contact phone (partial, case-insensitive match).
  - **Example:** `?contact_phone=506`
- `contact_realtor` (string, optional): Filter by contact realtor (partial, case-insensitive match).
  - **Example:** `?contact_realtor=John`
- `contact_email` (string, optional): Filter by contact email (partial, case-insensitive match).
  - **Example:** `?contact_email=example.com`
- `year_built_min` (number, optional): Minimum year built.
  - **Example:** `?year_built_min=2000`
- `year_built_max` (number, optional): Maximum year built.
  - **Example:** `?year_built_max=2020`
- `land_use` (string, optional): Filter by land use (partial, case-insensitive match).
  - **Example:** `?land_use=residential`
- `building_size_min` (number, optional): Minimum building size in square meters.
  - **Example:** `?building_size_min=100`
- `building_size_max` (number, optional): Maximum building size in square meters.
  - **Example:** `?building_size_max=500`
- `msl` (string, optional): Filter by MLS number (partial, case-insensitive match).
  - **Example:** `?msl=ABC`
- `sort` (string, optional): Field to sort the results by (e.g., `price`, `created_at`, `updated_at`).
- `order` (string, optional): Sort order (`asc` for ascending, `desc` for descending). Requires `sort` to be specified.
  - **Example:** `?sort=price&order=desc`

**Examples:**

- Get all properties for sale under $300,000, sorted by price descending:
    `GET /api/properties?property_for=Sale&price_max=300000&sort=price&order=desc`
- Get all properties with at least 2 bedrooms:
    `GET /api/properties?beds_min=2`

### Get Single Property

`GET /api/properties/:id`

Retrieves details for a single property by its unique ID.

**Path Parameters:**

- `id` (string, required): The UUID of the property or MSL (cr-001).

**Example:**

- `GET /api/properties/877ac9dd-0941-4e25-ac8f-70bcedd2377b`
- `GET /api/properties/cr-003`

## Main User Flows

- **Browse Properties:** Map and list view, filter by type, price, beds, etc.
- **View Property:** Detail page with all property info, features, photos, contact info
- **Add Property:** Form with all property fields, photo upload, map picker
- **Edit Property:** Same as add, pre-filled, with delete/delist options
- **Print Property:** Print-optimized page with QR code for sharing
