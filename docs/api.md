# BISaarthi — API Reference

**Project:** BISaarthi — AI Guide to Indian Standards & BIS Compliance
**Context:** SIH26107 Prototype
**Companion docs:** BISaarthi PRD v1.1, `architecture.md`, `database.md`
**Scope of this document:** Full REST contract for the routes sketched in `architecture.md` §7 — request/response shapes, status codes, and the PRD requirement each route satisfies.

---

## 1. Conventions

- **Base URL:** `/api` (no version segment for the MVP).
- **Auth:** `Authorization: Bearer <jwt>` on every route except `/auth/signup`, `/auth/login`, `/auth/google`. Token is issued by those three routes.
- **Content type:** `application/json` for all routes except `POST /find-standards/documents`, which is `multipart/form-data`.
- **List responses** use the envelope:
  ```json
  { "items": [ /* ... */ ], "total": 42, "limit": 20, "offset": 0 }
  ```
  via `?limit=` / `?offset=` query params (default `limit=20`, `offset=0`, max `limit=100`).
- **Error responses** use a single envelope:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Human-readable explanation." } }
  ```

**Error codes:**

| Code | HTTP status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Malformed or missing required fields |
| `UNAUTHORIZED` | 401 | Missing/invalid/expired token |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | e.g. email already registered, standard already saved |
| `DOCUMENT_NOT_READY` | 422 | `document_id` referenced before extraction finished |
| `RATE_LIMITED` | 429 | Rate limit exceeded (see below) |
| `RETRIEVAL_UNAVAILABLE` | 503 | Both indexed and live retrieval failed for this request |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

**Rate limiting** (architecture.md §9) applies to AI-heavy routes only: `POST /chat/conversations/:id/messages`, `POST /find-standards/search`, `POST /compare`. Responses on these routes include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers; exceeding the limit returns `429 RATE_LIMITED`.

---

## 2. Shared Response Objects

These shapes recur across multiple endpoints and are defined once here.

**`SourceRef`** — the database-level enforcement point (database.md §1, principle 3) made visible in the API:
```json
{
  "source_id": "uuid",
  "title": "string",
  "reference_url": "string",
  "reliability_tier": "primary | secondary"
}
```

**`StandardCard`** — used identically in Find Standards results and in AI Chatbot replies, per PRD §12 ("results use the same structured standard presentation as Find Standards"):
```json
{
  "is_number": "IS 302 (Part 1)",
  "title": "string",
  "relevance": "highly_relevant | relevant | possibly_relevant",
  "status": "active | superseded | withdrawn | under_revision | unknown",
  "why_applicable": "string",
  "source_refs": [ "SourceRef" ]
}
```
`relevance` and `why_applicable` are computed per-query by the RAG Orchestrator (architecture.md §5) — they are never stored on the `standards` table (database.md §3.4) and will differ across two searches for the same standard.

**`StandardDetails`** — the canonical, query-independent reference record for one IS number (`GET /standards/:isNumber`). It deliberately does **not** include `why_applicable` or `relevance`, since those are query-specific and only appear in `StandardCard` (see §5.4 below for the reasoning):
```json
{
  "is_number": "IS 302 (Part 1)",
  "title": "string",
  "status": "active | superseded | withdrawn | under_revision | unknown",
  "scope": "string",
  "key_requirements": [
    { "category": "Safety", "points": ["string", "string"] }
  ],
  "revision_info": "string",
  "publication_date": "YYYY-MM-DD",
  "related_standards_preview": [
    { "is_number": "IS 302 (Part 2)", "title": "string", "relation_note": "string" }
  ],
  "source_refs": [ "SourceRef" ],
  "last_synced_at": "ISO-8601 timestamp"
}
```

**`Comparison`**:
```json
{
  "id": "uuid",
  "standard_a": "IS 302 (Part 1)",
  "standard_b": "IS 302 (Part 2)",
  "summary": "string — plain-language overview",
  "similarities": ["string", "string"],
  "differences": [
    {
      "aspect": "string",
      "standard_a_value": "string",
      "standard_b_value": "string",
      "verified": true,
      "note": "string — populated only when verified is false, e.g. 'could not be verified from authoritative sources'"
    }
  ],
  "source_refs": [ "SourceRef" ],
  "created_at": "ISO-8601 timestamp"
}
```

**`ChatMessage`**:
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "role": "assistant",
  "content": "string — plain-language answer",
  "standard_cards": [ "StandardCard" ],
  "source_refs": [ "SourceRef" ],
  "created_at": "ISO-8601 timestamp"
}
```
`standard_cards` is an empty array when the turn didn't surface any standards (e.g. a clarifying question). `verification_status` (database.md §3.2) is logged server-side for the evaluation loop but is not part of the client-facing payload.

---

## 3. Auth

### `POST /api/auth/signup`
FR-01. Auth not required.

Request:
```json
{ "name": "string", "email": "string", "password": "string" }
```
Response `201`:
```json
{
  "user": { "id": "uuid", "name": "string", "email": "string", "auth_provider": "email", "preferred_language": "en", "theme": "light" },
  "token": "jwt", "expires_in": 3600
}
```
Errors: `409 CONFLICT` (email already registered), `400 VALIDATION_ERROR`.

### `POST /api/auth/login`
Request: `{ "email": "string", "password": "string" }`
Response `200`: same shape as signup. Errors: `401 UNAUTHORIZED`.

### `POST /api/auth/google`
Request: `{ "id_token": "string" }` — Google ID token from the client-side OAuth flow.
Response `200`: same shape as signup (`auth_provider: "google"`).

### `GET /api/auth/me`
Auth required. Response `200`: `{ "user": { ...same shape as above... } }`.

### `POST /api/auth/logout`
Auth required. Invalidates the `session:{user_id}` Redis key (database.md §5). Response `204`.

---

## 4. AI Chatbot (Feature 1 — PRD §11–12)

### `POST /api/chat/conversations`
FR-03. Creates a new, context-free conversation.
Request: `{}` (empty body).
Response `201`: `{ "id": "uuid", "title": "New Chat", "created_at": "...", "updated_at": "..." }`

### `GET /api/chat/conversations`
FR-17 — this **is** the History feature; there is no separate history endpoint.
Response `200`:
```json
{ "items": [ { "id": "uuid", "title": "string", "updated_at": "..." } ], "total": 5, "limit": 20, "offset": 0 }
```

### `GET /api/chat/conversations/:id`
Response `200`: `{ "id": "uuid", "title": "string", "messages": [ "ChatMessage" ], "created_at": "...", "updated_at": "..." }`
Errors: `404 NOT_FOUND`.

### `POST /api/chat/conversations/:id/messages`
FR-04, FR-05. Rate-limited. Persists the user's turn, runs the RAG Orchestrator in `mode: chat` against the conversation's existing message window only (no cross-conversation context), persists and returns the assistant's turn.
Request: `{ "content": "string" }`
Response `201`: `ChatMessage`
Errors: `422 VALIDATION_ERROR` (empty content), `429 RATE_LIMITED`, `503 RETRIEVAL_UNAVAILABLE`.

**Note:** no route on this resource accepts a file. Document upload is not reachable from the Chatbot, matching PRD §11/§6 and architecture.md §4.1.

---

## 5. Find Standards (Feature 2 — PRD §13–17)

### `POST /api/find-standards/documents`
FR-08. `multipart/form-data`, field `file`. Optional pre-step to `search`, below.
Response `201`: `{ "id": "uuid", "file_name": "string", "file_type": "string", "status": "uploaded", "created_at": "..." }`
Errors: `400 VALIDATION_ERROR` (unsupported type/oversized file).

### `GET /api/find-standards/documents/:id`
Poll for extraction status before referencing the document in a search.
Response `200`: `{ "id": "uuid", "status": "uploaded | processing | processed | failed", "error_message": "string | null" }`

### `POST /api/find-standards/search`
FR-06, FR-07, FR-09, FR-10. Rate-limited. **One-time, stateless** — nothing here is written to any history table (architecture.md §4.2, database.md §1 principle 2).

Request — at least one of `keyword` or `product_description` is required:
```json
{
  "keyword": "string (optional)",
  "filters": { "category": "string (optional)" },
  "product_description": "string (optional)",
  "document_id": "uuid (optional — must have status: processed)"
}
```
Response `200`:
```json
{ "results": [ "StandardCard" ] }
```
Errors: `400 VALIDATION_ERROR` (neither keyword nor product_description given), `422 DOCUMENT_NOT_READY`, `429 RATE_LIMITED`, `503 RETRIEVAL_UNAVAILABLE`.

### `GET /api/standards/:isNumber`
FR-11. Returns `StandardDetails` (see §2). No "View on official BIS website" link is ever included in the payload (PRD §15).
Errors: `404 NOT_FOUND`.

### `GET /api/standards/:isNumber/related`
Full Related Standards list (the main details response above only carries a lightweight `related_standards_preview`, per the progressive-disclosure principle in architecture.md §2.4).
Response `200`: `{ "related_standards": [ { "is_number": "string", "title": "string", "relation_note": "string" } ] }`

### `GET /api/standards/:isNumber/tests-certification`
FR-12. Response `200`:
```json
{
  "is_number": "string",
  "tests": [
    { "test_name": "string", "applicability": "mandatory | voluntary | unknown", "description": "string", "source_refs": [ "SourceRef" ] }
  ],
  "certification_steps": [
    { "step_number": 1, "description": "string", "source_refs": [ "SourceRef" ] }
  ]
}
```
`applicability` uses `unknown` — not a guessed value — when authoritative evidence is insufficient (matches the `tests.applicability` constraint in `database.md` §3.7).

### `GET /api/standards/:isNumber/laboratories`
FR-13. Response `200`:
```json
{ "is_number": "string", "laboratories": [ { "id": "uuid", "name": "string", "location": "string", "contact_info": {}, "source_refs": [ "SourceRef" ] } ] }
```

---

## 6. Compare Standards (Feature 3 — PRD §18)

### `POST /api/compare`
FR-14, FR-15. Rate-limited.
Request: `{ "is_number_a": "string", "is_number_b": "string" }`
Response `200`: `Comparison` (see §2). May return a previously computed result for the same canonical pair rather than recomputing (`database.md` §3.10 performance note).
Errors: `400 VALIDATION_ERROR` (same value given twice), `404 NOT_FOUND` (either IS number unknown), `429 RATE_LIMITED`, `503 RETRIEVAL_UNAVAILABLE`.

**No list endpoint exists for past comparisons.** This is intentional: the `comparisons` table is retained for caching/persistence, but PRD §19 scopes History to chatbot conversations only, and there is no Comparison History feature in the MVP. A `GET /api/compare` or `GET /api/comparisons` route would recreate that feature through the back door — it is deliberately absent.

---

## 7. Saved Standards (PRD §19, FR-16)

### `POST /api/saved-standards`
Request: `{ "is_number": "string" }`
Response `201`: `{ "id": "uuid", "is_number": "string", "saved_at": "..." }`
Errors: `409 CONFLICT` (already saved), `404 NOT_FOUND` (unknown IS number).

### `GET /api/saved-standards`
Response `200`: `{ "items": [ { "id": "uuid", "is_number": "string", "title": "string", "status": "string", "saved_at": "..." } ], "total": N, "limit": 20, "offset": 0 }`

### `DELETE /api/saved-standards/:id`
Response `204`. Errors: `404 NOT_FOUND`.

---

## 8. Settings (PRD §19, FR-19, FR-20)

### `GET /api/settings`
Response `200`: `{ "preferred_language": "en | hi", "theme": "light | dark" }`

### `PUT /api/settings`
Request: `{ "preferred_language": "en | hi (optional)", "theme": "light | dark (optional)" }`
Response `200`: updated settings object.

---

## 9. Sources (PRD §20)

### `GET /api/sources/:id`
Backs the "consolidated Sources section" required by the PRD.
Response `200`: `SourceRef` shape plus `source_type` and `retrieved_at`:
```json
{ "id": "uuid", "reference_url": "string", "source_type": "bis_standard | bis_scheme | gov_portal | other", "title": "string", "reliability_tier": "primary | secondary", "retrieved_at": "..." }
```
Errors: `404 NOT_FOUND`.

---

## 10. Endpoint ↔ Requirement Traceability

| PRD ID | Endpoint(s) |
|---|---|
| FR-01 | `POST /auth/signup`, `POST /auth/login`, `POST /auth/google` |
| FR-02 | `GET /auth/me` (frontend routes to Dashboard on success) |
| FR-03 | `POST /chat/conversations` |
| FR-04 | `POST /chat/conversations/:id/messages` |
| FR-05 | `POST /chat/conversations/:id/messages` (auto-persist) |
| FR-06 | `POST /find-standards/search` (`keyword`, `filters`) |
| FR-07 | `POST /find-standards/search` (`product_description`) |
| FR-08 | `POST /find-standards/documents`, `GET /find-standards/documents/:id` |
| FR-09 | `POST /find-standards/search` (stateless response) |
| FR-10 | `POST /find-standards/search` → `StandardCard` fields |
| FR-11 | `GET /standards/:isNumber` |
| FR-12 | `GET /standards/:isNumber/tests-certification` |
| FR-13 | `GET /standards/:isNumber/laboratories` |
| FR-14 | `POST /compare` (exactly-two validation) |
| FR-15 | `POST /compare` → `Comparison` fields |
| FR-16 | `POST/GET/DELETE /saved-standards` |
| FR-17 | `GET /chat/conversations`, `GET /chat/conversations/:id` |
| FR-18 | `source_refs` on every response object in §2; `GET /sources/:id` |
| FR-19 | `GET/PUT /settings` (`preferred_language`) |
| FR-20 | `GET/PUT /settings` (`theme`) |

---

## 11. Explicit API Non-Goals

Matching `architecture.md` §15: no bulk/batch endpoints, no admin or content-management routes, no notification/webhook endpoints, no comparison-history or find-standards-history listing routes, no direct BIS service-integration routes. These are intentionally absent from the MVP surface.
