# BISaarthi — Database Design

**Project:** BISaarthi — AI Guide to Indian Standards & BIS Compliance
**Context:** SIH26107 Prototype
**Companion docs:** BISaarthi PRD v1.1, `architecture.md`
**Scope of this document:** Full schema for the relational store (PostgreSQL), the vector store (pgvector), the cache layer (Redis), and object storage — with rationale tied back to specific PRD requirements.

---

## 1. Design Principles

These carry over from `architecture.md` §2 and are enforced at the schema level, not just in application code:

1. **Categories are data, not code.** `standard_requirements.category` and `standards.categories` are free text / text arrays, not enums — PRD §15 is explicit that "categories should reflect the actual standard rather than being rigidly hardcoded."
2. **Find Standards is ephemeral by design.** There is no `find_standards_sessions` table. PRD §13 calls it "a one-time answer/discovery experience, not a two-way conversation," and §19 says History stores chatbot conversations only. Nothing in this schema persists a Find Standards result set unless the user explicitly saves the standard.
3. **Every claim-bearing table has a source pointer.** `standard_requirements`, `tests`, `certification_steps`, and `laboratories` all carry a `source_id`, and `standards` carries a `primary_source_id`. This is the database-level enforcement of PRD §18/§20's "important claims must have source references."
4. **Uncertainty is representable, not omitted.** `tests.applicability` and `standards.status` include an explicit `unknown` value rather than forcing a guess — this is what lets the app say "cannot verify" honestly instead of defaulting to a plausible-sounding value.
5. **Uploaded documents are user-scoped and time-boxed**, never linked into the standards knowledge graph — they're context for one Find Standards request, not a data source the system learns from.

---

## 2. Entity-Relationship Overview

```
 users ──1:N── conversations ──1:N── messages
   │
   ├──1:N── saved_standards ──N:1── standards
   │
   ├──1:N── comparisons ──N:1── standards (standard_a)
   │              └────────N:1── standards (standard_b)
   │
   └──1:N── uploaded_documents

 standards ──1:N── standard_requirements ──N:1── sources
 standards ──1:N── tests ──────────────────N:1── sources
 standards ──1:N── certification_steps ────N:1── sources
 standards ──N:N── laboratories  (via standard_laboratories) ──N:1── sources
 standards ──N:N── standards      (via standard_related_standards, self-referencing)
 standards ──N:1── sources (primary_source_id)
```

---

## 3. Relational Schema (PostgreSQL)

### 3.0 Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy keyword search (FR-06)
CREATE EXTENSION IF NOT EXISTS "vector";     -- pgvector, see §4
```

### 3.1 `users`

Supports FR-01 (signup/login), FR-19 (language), FR-20 (theme).

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    auth_provider       VARCHAR(20) NOT NULL CHECK (auth_provider IN ('email', 'google')),
    password_hash       TEXT,                       -- null when auth_provider = 'google'
    google_id           VARCHAR(255) UNIQUE,
    preferred_language  VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    theme               VARCHAR(10) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 `conversations` and `messages`

Supports Feature 1 — FR-03, FR-04, FR-05, FR-17.

```sql
CREATE TABLE conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversations_user_recent ON conversations (user_id, updated_at DESC);

CREATE TABLE messages (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id       UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role                  VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content               TEXT NOT NULL,
    source_refs           JSONB NOT NULL DEFAULT '[]',   -- [{source_id, claim}]
    verification_status   VARCHAR(20) CHECK (verification_status IN ('grounded', 'partially_verified', 'unverifiable')),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
```

`verification_status` is not shown raw in the UI — it feeds the evaluation/observability loop in `architecture.md` §12 (PRD §29).

### 3.3 `sources`

Referenced by nearly every other table; created first among the domain tables.

```sql
CREATE TABLE sources (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_url     TEXT NOT NULL UNIQUE,
    source_type       VARCHAR(20) NOT NULL CHECK (source_type IN ('bis_standard', 'bis_scheme', 'gov_portal', 'other')),
    title             VARCHAR(500) NOT NULL,
    reliability_tier  VARCHAR(10) NOT NULL CHECK (reliability_tier IN ('primary', 'secondary')),
    retrieved_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`reliability_tier` encodes PRD §20's source priority (BIS first, government sources second) directly in the data, so retrieval ranking can query on it instead of hardcoding domain lists in application code.

### 3.4 `standards`

The core reference entity behind Find Standards results, Standard Details, and Compare Standards.

```sql
CREATE TABLE standards (
    is_number          VARCHAR(50) PRIMARY KEY,       -- e.g. 'IS 302 (Part 1)'
    title              VARCHAR(500) NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'unknown'
                        CHECK (status IN ('active', 'superseded', 'withdrawn', 'under_revision', 'unknown')),
    scope              TEXT,
    publication_date   DATE,
    revision_info      TEXT,
    categories         TEXT[] NOT NULL DEFAULT '{}',  -- free-form, not enum (PRD §15)
    primary_source_id  UUID REFERENCES sources(id),
    last_synced_at     TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- keyword / filter search support (FR-06)
CREATE INDEX idx_standards_title_trgm ON standards USING gin (title gin_trgm_ops);
CREATE INDEX idx_standards_fulltext
    ON standards USING gin (to_tsvector('english', title || ' ' || coalesce(scope, '')));
CREATE INDEX idx_standards_categories ON standards USING gin (categories);
```

### 3.5 `standard_requirements` (Key Requirements — PRD §15)

```sql
CREATE TABLE standard_requirements (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_is_number VARCHAR(50) NOT NULL REFERENCES standards(is_number) ON DELETE CASCADE,
    category          VARCHAR(100) NOT NULL,          -- e.g. Safety, Performance, Construction, Marking & Labelling
    requirement_text  TEXT NOT NULL,
    source_id         UUID REFERENCES sources(id),
    display_order     INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_requirements_standard ON standard_requirements (standard_is_number, display_order);
```

### 3.6 `standard_related_standards` (Related Standards — PRD §15)

Self-referencing many-to-many.

```sql
CREATE TABLE standard_related_standards (
    standard_is_number VARCHAR(50) NOT NULL REFERENCES standards(is_number) ON DELETE CASCADE,
    related_is_number  VARCHAR(50) NOT NULL REFERENCES standards(is_number) ON DELETE CASCADE,
    relation_note      VARCHAR(255),                  -- e.g. 'supersedes', 'companion test standard'
    PRIMARY KEY (standard_is_number, related_is_number),
    CHECK (standard_is_number <> related_is_number)
);
```

### 3.7 `tests` and `certification_steps` (Tests & Certification — PRD §16)

`certification_steps` is an addition beyond the PRD's §22 conceptual model, needed because §16 explicitly requires "step-by-step certification process" as a distinct, ordered artifact.

```sql
CREATE TABLE tests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_is_number  VARCHAR(50) NOT NULL REFERENCES standards(is_number) ON DELETE CASCADE,
    test_name           VARCHAR(255) NOT NULL,
    applicability        VARCHAR(20) NOT NULL DEFAULT 'unknown'
                          CHECK (applicability IN ('mandatory', 'voluntary', 'unknown')),
    description          TEXT,
    source_id            UUID REFERENCES sources(id),
    display_order         INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_tests_standard ON tests (standard_is_number, display_order);

CREATE TABLE certification_steps (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_is_number  VARCHAR(50) NOT NULL REFERENCES standards(is_number) ON DELETE CASCADE,
    step_number         INT NOT NULL,
    step_description    TEXT NOT NULL,
    source_id           UUID REFERENCES sources(id),
    UNIQUE (standard_is_number, step_number)
);
```

### 3.8 `laboratories` (PRD §17)

Deliberately lightweight, matching the PRD's "intentionally lightweight in the MVP."

```sql
CREATE TABLE laboratories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    location      VARCHAR(255),
    contact_info  JSONB,                              -- {phone, email, address}
    source_id     UUID REFERENCES sources(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE standard_laboratories (
    standard_is_number  VARCHAR(50) NOT NULL REFERENCES standards(is_number) ON DELETE CASCADE,
    laboratory_id       UUID NOT NULL REFERENCES laboratories(id) ON DELETE CASCADE,
    PRIMARY KEY (standard_is_number, laboratory_id)
);
```

### 3.9 `saved_standards` (PRD §19, FR-16)

```sql
CREATE TABLE saved_standards (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    standard_is_number  VARCHAR(50) NOT NULL REFERENCES standards(is_number) ON DELETE CASCADE,
    saved_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, standard_is_number)
);
CREATE INDEX idx_saved_standards_user ON saved_standards (user_id, saved_at DESC);
```

### 3.10 `comparisons` (Feature 3 — FR-14, FR-15)

Mirrors PRD §22's conceptual model directly: "Comparison — User, two standards, result, source references."

```sql
CREATE TABLE comparisons (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    standard_a    VARCHAR(50) NOT NULL REFERENCES standards(is_number),
    standard_b    VARCHAR(50) NOT NULL REFERENCES standards(is_number),
    result_json   JSONB NOT NULL,     -- { similarities[], differences[], summary, source_refs[] }
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (standard_a <> standard_b)
);
CREATE INDEX idx_comparisons_user ON comparisons (user_id, created_at DESC);
```

**Performance note:** `result_json` for a given `(standard_a, standard_b)` pair is identical regardless of which user requested it — the comparison logic is grounded in standards content, not user identity. The service layer can therefore check for an existing row with the same canonical pair (order-independent) before recomputing, without needing a separate cache table.

**Note — not a History feature in the MVP:** this table is retained for caching, persistence, and potential future functionality. Per the PRD, the MVP's History contains chatbot conversations only (§19); `comparisons` rows must **not** be surfaced as a Comparison History page/feature in the current MVP.

### 3.11 `uploaded_documents` (Find Standards only — PRD §6, §13, §21)

```sql
CREATE TABLE uploaded_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    file_type       VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path    TEXT NOT NULL,                 -- object storage key, see §6
    extracted_text  TEXT,                           -- null until processed
    status          VARCHAR(20) NOT NULL DEFAULT 'uploaded'
                    CHECK (status IN ('uploaded', 'processing', 'processed', 'failed')),
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    purge_at        TIMESTAMPTZ                     -- retention cutoff, see §7
);
CREATE INDEX idx_uploaded_documents_user ON uploaded_documents (user_id, created_at DESC);
CREATE INDEX idx_uploaded_documents_purge ON uploaded_documents (purge_at) WHERE purge_at IS NOT NULL;
```

No foreign key connects this table to `standards`, `messages`, or any chat table — by design, it cannot leak into the chatbot's data path (PRD §11).

---

## 4. Vector Store — BIS Knowledge Base (pgvector)

Feeds RAG retrieval step 2a in `architecture.md` §5. Kept inside the same Postgres instance for the MVP (see architecture ADR in `architecture.md` §13).

```sql
CREATE TABLE bis_kb_chunks (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    embedding         VECTOR(1536) NOT NULL,          -- dimension depends on embedding model chosen
    chunk_text        TEXT NOT NULL,
    is_number         VARCHAR(50) REFERENCES standards(is_number),   -- nullable: scheme docs may not map to one standard
    section_type      VARCHAR(30) NOT NULL
                      CHECK (section_type IN ('scope', 'requirement', 'test', 'scheme_procedure', 'lab_registry', 'general')),
    category          VARCHAR(100),
    status            VARCHAR(20),
    publication_date  DATE,
    source_id         UUID REFERENCES sources(id),
    chunk_index       INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Approximate nearest-neighbor index for similarity search
CREATE INDEX idx_bis_kb_embedding ON bis_kb_chunks
    USING hnsw (embedding vector_cosine_ops);

-- Filtered retrieval support (retrieve within a standard or section type before ranking)
CREATE INDEX idx_bis_kb_is_number ON bis_kb_chunks (is_number);
CREATE INDEX idx_bis_kb_section_type ON bis_kb_chunks (section_type);
```

Ingestion (offline pipeline, `architecture.md` §5) upserts into this table; `is_number`, `status`, and `publication_date` are duplicated from `standards` at chunk time so retrieval can filter/rank without a join, and are refreshed whenever the source `standards` row's `last_synced_at` changes.

---

## 5. Cache Layer (Redis)

| Key pattern | Purpose | TTL |
|---|---|---|
| `session:{user_id}` | Auth session data | matches JWT expiry |
| `ratelimit:{user_id}:{route}` | Per-user rate limiting on AI-heavy routes | sliding window, e.g. 60s |
| `cache:standard:{is_number}` | Cached Standard Details payload | 1h, invalidated on `standards.updated_at` change |
| `cache:find_standards:{query_hash}` | Cached ranked results for an identical repeated query | 10 min (short — results should stay fresh) |
| `cache:compare:{canonical_pair_hash}` | Cached comparison payload, keyed on order-independent pair | 24h |

`query_hash` and `canonical_pair_hash` are computed from normalized input (lowercased, whitespace-trimmed, IS numbers sorted) so equivalent requests hit cache regardless of phrasing/order.

---

## 6. Object Storage Layout (S3-compatible)

```
s3://bisaarthi/
 └── uploads/
      └── {user_id}/
           └── {document_id}/
                └── {original_filename}
 └── kb-source-docs/            (optional — raw ingested BIS/gov docs, for provenance/audit)
      └── {source_id}/
           └── {filename}
```

Access to `uploads/*` is only via short-lived signed URLs generated per request; nothing under `uploads/` is publicly readable.

---

## 7. Data Retention & Privacy

| Table | Contains PII? | Retention |
|---|---|---|
| `users` | Yes (name, email) | Until account deletion |
| `conversations` / `messages` | Indirectly (user's own queries) | Until user deletes conversation or account |
| `uploaded_documents` | Potentially (product docs may contain business info) | Time-boxed via `purge_at`; auto-purged after a configurable window (e.g. 30 days) unless the resulting standard was saved via `saved_standards` |
| `saved_standards`, `comparisons` | Indirectly (tied to user_id) | Until user deletes / account deletion |
| `standards`, `standard_requirements`, `tests`, `certification_steps`, `laboratories`, `sources`, `bis_kb_chunks` | No | Indefinite — shared reference data, not user data |

A scheduled background job (same job runner as KB ingestion, `architecture.md` §8) sweeps `uploaded_documents` where `purge_at < now()`, deleting both the row and the corresponding S3 object.

---

## 8. Migrations Strategy

- Alembic (paired with the FastAPI backend chosen in `architecture.md` §8) manages schema migrations; every table above corresponds to one initial migration, with `bis_kb_chunks`'s vector index created in a follow-up migration once the embedding model (and thus dimension) is finalized.
- KB content itself (`standards`, `standard_requirements`, `tests`, `certification_steps`, `laboratories`, `sources`, `bis_kb_chunks`) is seeded and refreshed by the ingestion pipeline, not by migrations — migrations only own structure, never authoritative content.

---

## 9. Indexing Summary

| Table | Index | Supports |
|---|---|---|
| `conversations` | `(user_id, updated_at desc)` | History list, FR-17 |
| `messages` | `(conversation_id, created_at)` | In-conversation context load, FR-04 |
| `standards` | trigram + full-text + GIN on `categories` | Keyword/filter search, FR-06 |
| `standard_requirements`, `tests` | `(standard_is_number, display_order)` | Ordered rendering on Standard Details |
| `saved_standards` | `(user_id, saved_at desc)` | Saved Standards list, FR-16 |
| `comparisons` | `(user_id, created_at desc)` | Recent comparisons |
| `uploaded_documents` | `(user_id, created_at desc)`, partial index on `purge_at` | Upload status polling, retention sweep |
| `bis_kb_chunks` | HNSW on `embedding`, btree on `is_number`/`section_type` | RAG retrieval, `architecture.md` §5 |
