# Todo (will be implemented at user specified request)

- [x] Icon refactored
- [ ] redo print page

## API Enhancements for AI/MCP Interaction

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

### 5. Other

- [ ] implement Leaflet.markedcluster [github](https://github.com/Leaflet/Leaflet.markercluster?tab=readme-ov-file)
