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

## TODO

- [ ] does confetti even fires properly, when, where should it fire?
- [ ] in property view should phone badge be clickable like realtor badge?
- [ ] on mobile devices should main map show my current position marker? but only if I am within.
- [ ] should map have boundary indicator of serviceable area?
- [ ] implement Leaflet.markedcluster [github](https://github.com/Leaflet/Leaflet.markercluster?tab=readme-ov-file)
- [ ] sometimes after user creates property it shows them print page and takes them back to add page to create new property. why?
- [ ] on mobile button should be visible for delete photos and edit property

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

## Main User Flows

- **Browse Properties:** Map and list view, filter by type, price, beds, etc.
- **View Property:** Detail page with all property info, features, photos, contact info
- **Add Property:** Form with all property fields, photo upload, map picker
- **Edit Property:** Same as add, pre-filled, with delete/delist options
- **Print Property:** Print-optimized page with QR code for sharing
