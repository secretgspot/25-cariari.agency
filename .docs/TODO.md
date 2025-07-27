# Todo (will be implemented at user specified request)

## API Enhancements for AI/MCP Interaction

### 1. Enhance Data Retrieval (`GET` Endpoints)

- [x] **Filtering:** Implement query parameters to filter properties by fields (e.g., `?property_for=Sale&price_max=500000`).
- [ ] **Full-Text Search:** Add a `q` parameter for keyword searches on description and address.

### 2. Enable Actions (Add `POST`, `PUT`, `DELETE`)

- [ ] **Create Property:** `POST /api/properties`
- [ ] **Update Property:** `PUT /api/properties/{id}` or `PATCH /api/properties/{id}`
- [ ] **Delist/Deactivate Property:** `POST /api/properties/{id}/delist` or similar.
- [ ] **Delete Property:** `DELETE /api/properties/{id}`

### 3. Implement Robust Standards for Machine Readability

- [ ] **OpenAPI (Swagger) Specification:** Create a `GET /api/openapi.json` endpoint.
- [x] **Structured JSON Responses:** Wrap responses with metadata (e.g., pagination info).
- [x] **Detailed JSON Error Messages:** Provide structured errors with codes and details.

### 4. Add Security and Access Control

- [ ] **API Key Authentication:** Secure `POST`, `PUT`, `DELETE` endpoints with API keys.
- [ ] **Rate Limiting:** Implement rate limiting to prevent abuse.

### 5. General Tweaks

- [x] main map on mobile horizontally rotated needs proper styling
- [x] refactor helpers functions
- [x] should url be uuid or msl? in case of edit they should remain uuid

## Dependency Management

- [ ] **Outdated Packages:** Several npm packages are outdated. Updating them can provide access to new features, security patches, and performance enhancements. Key packages to update include:
  - `@supabase/supabase-js`
  - `@sveltejs/kit`
  - `vite`
  - `nodemailer`
  - `leaflet`

- [ ] implement Leaflet.markedcluster [github](https://github.com/Leaflet/Leaflet.markercluster?tab=readme-ov-file)
