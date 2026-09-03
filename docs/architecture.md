# BISaarthi — System Architecture

**Project:** BISaarthi — AI Guide to Indian Standards & BIS Compliance
**Context:** SIH26107 Prototype
**Companion doc:** BISaarthi PRD v1.1
**Scope of this document:** Technical architecture for the three-feature MVP (AI Chatbot, Find Standards, Compare Standards) and their supporting screens.

---

## 1. Overview

BISaarthi is a Retrieval-Augmented Generation (RAG) application layered over an authoritative BIS/government knowledge base. The architecture is built around one non-negotiable constraint from the PRD: **every substantive claim the system makes must be traceable to a retrieved source, and the system must explicitly say when it cannot verify something** (PRD §20, §28, §29, Appendix B). This shapes almost every design choice below — the retrieval layer is not an optimization, it is the thing that makes the product trustworthy.

The system is designed as a **modular monolith for the MVP**: one deployable backend with clearly separated internal modules that map 1:1 to the three core features and their supporting workflows. This matches the hackathon timeline while keeping module boundaries clean enough to peel off into microservices later (see §13).

---

## 2. Architectural Principles

These are derived directly from the PRD's goals and are meant to constrain implementation choices, not just describe them:

1. **Grounded-first.** No feature-facing response is generated without retrieval. The LLM is never asked to answer from parametric memory alone for standards, tests, labs, schemes, or clauses.
2. **Feature-boundary discipline.** The PRD is explicit that document upload belongs to Find Standards only, that History stores chatbot conversations only, and that Find Standards is a one-time (not conversational) experience. The architecture must enforce these as structural facts, not UI-level suggestions — e.g., the Chat Service has no upload endpoint at all, and Find Standards responses are not written to any conversation/history table.
3. **One feature, one module.** Find Standards + its Results + Standard Details are one PRD feature (§13, §15), so they live in one service module, not three. Splitting them into separate microservices would recreate a false boundary the product spec explicitly rejects.
4. **Progressive disclosure as a data contract.** The UI's progressive disclosure requirement (§25) is implemented as layered response payloads: summary-level fields for chat/results, full detail only on explicit drill-down (Standard Details, Tests & Certification, Laboratories).
5. **Verifiability is a field, not a footnote.** Every entity and every API response that carries a compliance claim has a `source_refs` field. There is no response schema without one.
6. **Fail closed on uncertainty.** If retrieval confidence is low or a claim can't be matched to a source, the system returns an explicit "cannot verify" state rather than a best-guess answer (PRD §20, §28).

---

## 3. High-Level Architecture

```
                         ┌───────────────────────────┐
                         │        Client Layer         │
                         │  Next.js (React) Web App    │
                         │  EN/HI · Light/Dark theme   │
                         └──────────────┬───────────────┘
                                        │ HTTPS/REST
                         ┌──────────────▼───────────────┐
                         │      API Gateway / BFF         │
                         │  AuthN/AuthZ · Rate limiting   │
                         │  Request validation             │
                         └──────────────┬───────────────┘
                                        │
        ┌───────────────┬──────────────┼──────────────┬───────────────┐
        │                │              │              │               │
┌───────▼──────┐ ┌───────▼───────┐ ┌────▼────────┐ ┌───▼──────────┐ ┌──▼────────────┐
│ Chat Service  │ │ Find Standards │ │  Compare    │ │ Saved/History│ │ Settings/Auth │
│ (Feature 1)   │ │ Service        │ │  Service    │ │ Service      │ │ Service       │
│               │ │ (Feature 2:    │ │  (Feature 3)│ │ (supporting) │ │ (supporting)  │
│               │ │ search+results │ │             │ │              │ │               │
│               │ │ +details+tools)│ │             │ │              │ │               │
└───────┬──────┘ └───────┬───────┘ └────┬────────┘ └───┬──────────┘ └──┬────────────┘
        │                │               │              │               │
        └────────┬───────┴──────┬────────┘              │               │
                  │              │                       │               │
         ┌────────▼────────┐ ┌──▼─────────────┐   ┌──────▼──────┐ ┌──────▼──────┐
         │  RAG Orchestrator │ │ Document        │   │ PostgreSQL  │ │ Firebase /  │
         │  (retrieval +     │ │ Processor       │   │ (relational │ │ OAuth2      │
         │  grounded LLM)    │ │ (upload, extract│   │  data)      │ │ (Google)    │
         └────────┬─────────┘ │  — Find Standards│   └─────────────┘ └─────────────┘
                  │            │  only)           │
    ┌─────────────┼──────────┐ └───────┬─────────┘
    │             │          │         │
┌───▼───┐  ┌──────▼──────┐ ┌─▼───────┐ ┌▼────────────┐
│ Vector │  │ Live Fetch  │ │Redis    │ │ Object       │
│ Store  │  │ (BIS portal │ │ Cache   │ │ Storage (S3) │
│ (BIS   │  │ + gov       │ │         │ │ uploaded docs│
│ KB)    │  │ sources)    │ │         │ │              │
└────────┘  └─────────────┘ └─────────┘ └──────────────┘
```

**Layer responsibilities:**

| Layer | Responsibility |
|---|---|
| Client | Rendering, theming, i18n, client-side session handling, structured cards for results/details/comparison |
| API Gateway / BFF | Auth verification, rate limiting (esp. on AI-heavy routes), request shaping |
| Feature Services | One module per core feature + supporting workflows; own their response contracts |
| RAG Orchestrator | Query understanding → hybrid retrieval → generation → verification → source mapping (§5) |
| Document Processor | Extraction pipeline for Find Standards' optional upload only |
| Data Layer | Postgres (system-of-record), Vector Store (BIS KB embeddings), Redis (cache), S3 (files) |
| External Sources | BIS official standards/scheme data, relevant government sources, live retrieval fallback |

---

## 4. Core Feature Architecture

### 4.1 AI Chatbot Service (Feature 1)

- Stateful within a conversation, stateless across conversations (PRD §11: "new chats do not inherit old context").
- On each user turn: loads current conversation's message window → sends to RAG Orchestrator with `mode: chat` → orchestrator returns a grounded answer, optionally including standard cards (using the same structured presentation as Find Standards, per §12) → response + source refs persisted to `messages`.
- **No upload endpoint exists in this service.** This is enforced at the API layer (route doesn't accept multipart bodies), not just hidden in the UI.
- Clarification behavior (§11: "clarification only when genuinely necessary") is implemented as a confidence threshold in query understanding — below threshold, the orchestrator asks one targeted clarifying question instead of retrieving.
- Auto-saves every turn to History; History surfaces **chatbot conversations only** (PRD §19) — Find Standards sessions are never written here.

### 4.2 Find Standards Service (Feature 2 — search, results, details, related tools)

This is intentionally **one module** with several internal handlers, mirroring the PRD's framing that Find Standards, its results, and Standard Details are a single feature (§13, §15):

- **Search/discovery handler** — accepts keyword/filter input, free-text product description, and an optional `document_id` (from the Document Processor). Calls the RAG Orchestrator in `mode: find_standards` and returns a **one-time, non-conversational** ranked result set. Results are not persisted to any history table by design (§13: "one-time answer/discovery experience, not a two-way conversation").
- **Standard Details handler** — `GET /standards/:isNumber`, returns scope, key requirements (categorized), status, revision info, related standards, sources. No "View on Official BIS Website" redirect (§15) — sources are shown in-app.
- **Related Tools handlers** — Tests & Certification and Laboratories are sub-resources reached from a Standard Details context, not top-level nav items in the architecture (they have no independent discovery entry point, matching §16–17).

### 4.3 Compare Standards Service (Feature 3)

- Single endpoint accepting **exactly two** IS numbers; validation rejects any other count at the API layer (matches the PRD's insistence on "exactly two," §18).
- Calls the RAG Orchestrator in `mode: compare`, which retrieves context for both standards independently, then generates similarities, differences, and a plain-language summary — grounded per-claim.
- Verification layer applies a stricter rule here: if a claimed difference isn't backed by retrieved content from **both** standards' sources, it is dropped and replaced with an explicit "could not be verified" note (§18).

### 4.4 Supporting Services

| Service | Role |
|---|---|
| Saved Standards | User ↔ Standard bookmark relationship; re-opens Standard Details |
| History | Chatbot conversations only (read/list/delete) |
| Settings | Profile, language (en/hi), theme (light/dark) |
| Auth | Email/password + Google OAuth2, session issuance |

---

## 5. AI / RAG Pipeline

This expands PRD §21 ("Query Understanding → Authoritative Retrieval → Grounded LLM Response → Source Mapping → Structured UI") into concrete stages, with an explicit verification stage added to operationalize the anti-hallucination requirements in §20/§28/§29.

```
 User Query / Product Description / IS Number(s)
              │
              ▼
 ┌─────────────────────────────┐
 │ 1. Query Understanding        │  intent + entity extraction
 │    (LLM-assisted)             │  (product category, IS refs,
 │                                │   keywords, mode: chat/find/compare)
 └──────────────┬────────────────┘
                │
 ┌──────────────▼────────────────┐
 │ 2. Hybrid Retrieval             │
 │  a) Vector search — indexed     │◄── Indexed BIS Knowledge Base
 │     BIS KB (fast path)          │    (standards, schemes, requirements,
 │  b) Live retrieval — BIS/gov    │     tests, lab registries)
 │     sources (freshness path,    │◄── BIS portal / govt sources
 │     async, used for status/     │    (live fallback for gaps or
 │     date-sensitive claims)      │     staleness)
 └──────────────┬────────────────┘
                │ retrieved chunks + metadata + source_ids
 ┌──────────────▼────────────────┐
 │ 3. Re-ranking & Filtering        │  relevance scoring, de-dup,
 │                                   │  recency weighting
 └──────────────┬────────────────┘
                │
 ┌──────────────▼────────────────┐
 │ 4. Grounded Generation           │  LLM generates structured output
 │    (strict grounding prompt —    │  using ONLY retrieved content;
 │     "cite or omit")              │  no free-recall of IS numbers
 └──────────────┬────────────────┘
                │
 ┌──────────────▼────────────────┐
 │ 5. Verification Layer            │  every generated IS number, test,
 │    (hallucination guard)         │  lab, and mandatory/voluntary
 │                                   │  claim is checked against the
 │                                   │  retrieved set; unmatched claims
 │                                   │  are stripped and replaced with
 │                                   │  "cannot verify"
 └──────────────┬────────────────┘
                │
 ┌──────────────▼────────────────┐
 │ 6. Source Mapping                │  attach source_id(s) to each
 │                                   │  claim/card field
 └──────────────┬────────────────┘
                │
 ┌──────────────▼────────────────┐
 │ 7. Structured Output              │  JSON matching the feature's
 │                                   │  response schema → rendered as
 │                                   │  cards (relevance, why-applicable,
 │                                   │  key requirements, comparison, etc.)
 └─────────────────────────────────┘
```

**Knowledge base ingestion (offline/background pipeline, feeds step 2a):**

```
BIS standards, scheme docs, gazette notices, govt sources (PDFs/HTML)
        │
        ▼
  Document parsing & cleaning
        │
        ▼
  Chunking (by clause/section, with IS number + category metadata retained)
        │
        ▼
  Embedding generation
        │
        ▼
  Vector Store upsert (with metadata: is_number, title, status, category,
  publication_date, source_url, reliability_tier)
```

Source priority is enforced at retrieval time, not left to the LLM: BIS standards/authoritative BIS information rank first, relevant government sources second (§20).

### 5.1 Document Upload Pipeline (Find Standards only)

```
 User uploads file (Find Standards screen)
        │
        ▼
 Document Processor: virus/type/size check
        │
        ▼
 Text extraction (native text / OCR for scanned docs)
        │
        ▼
 Stored: Object Storage (raw file) + extracted text (Postgres/S3)
        │
        ▼
 Passed as additional context into Query Understanding (step 1)
 for the current Find Standards request only
```

This pipeline is **not reachable from the Chat Service** — it is wired only into the Find Standards search handler's request contract, per PRD §6/§11/§21.

---

## 6. Data Architecture

### 6.1 Relational Schema (PostgreSQL) — expands PRD §22's conceptual model

| Table | Key fields |
|---|---|
| `users` | id, name, email (unique), auth_provider (email/google), password_hash (nullable), preferred_language (en/hi), theme (light/dark), created_at |
| `conversations` | id, user_id (fk), title, created_at, updated_at |
| `messages` | id, conversation_id (fk), role (user/assistant), content, source_refs (jsonb), created_at |
| `standards` | is_number (pk), title, status, scope, publication_date, revision_info, categories (jsonb), last_synced_at, source_id (fk) |
| `standard_requirements` | id, standard_id (fk), category (Safety/Performance/Construction/Marking & Labelling/…), requirement_text, source_id (fk) |
| `tests` | id, standard_id (fk), test_name, applicability (mandatory/voluntary/unspecified), source_id (fk) |
| `laboratories` | id, name, location, contact_info (jsonb), source_id (fk) |
| `saved_standards` | id, user_id (fk), standard_id (fk), saved_at |
| `comparisons` | id, user_id (fk), standard_id_a (fk), standard_id_b (fk), result_json, created_at |
| `sources` | id, reference_url, source_type (bis_standard/bis_scheme/gov_portal/other), title, retrieved_at, reliability_tier (primary/secondary) |
| `uploaded_documents` | id, user_id (fk), file_name, file_type, storage_path, extracted_text_ref, status (uploaded/processing/processed/failed), created_at |

**Deliberate omission — and why it matters:** there is no `find_standards_sessions` table for user-facing history. The PRD is explicit that Find Standards is one-time and that History stores chatbot conversations only (§13, §19). Result sets are computed, returned, and discarded unless the user explicitly saves the standard via `saved_standards`. (An anonymized, non-user-linked query log may exist separately for the evaluation pipeline in §12 — that's an analytics concern, not part of the user data model.)

### 6.2 Vector Store Schema (BIS Knowledge Base)

| Field | Purpose |
|---|---|
| `embedding` | dense vector for similarity search |
| `chunk_text` | source passage |
| `is_number` | linked standard, if applicable |
| `section_type` | scope / requirement / test / scheme-procedure / lab-registry |
| `category` | Safety / Performance / Construction / Marking & Labelling / etc. |
| `status`, `publication_date` | for recency-aware ranking |
| `source_url`, `reliability_tier` | for source mapping and priority ranking |

### 6.3 Object Storage

`s3://bisaarthi/uploads/{user_id}/{document_id}/` — raw uploaded files, access via signed URLs only, retention governed by the app's privacy policy (§24).

---

## 7. API Surface (REST)

```
Auth
  POST /api/auth/signup
  POST /api/auth/login
  POST /api/auth/google
  GET  /api/auth/me

AI Chatbot
  POST /api/chat/conversations                     # new chat
  GET  /api/chat/conversations                      # history list
  GET  /api/chat/conversations/:id
  POST /api/chat/conversations/:id/messages         # send + get grounded reply

Find Standards
  POST /api/find-standards/documents                 # optional upload, returns document_id
  POST /api/find-standards/search                     # keyword/filter/NL description
                                                       # + optional document_id → one-time results
  GET  /api/standards/:isNumber                        # Standard Details
  GET  /api/standards/:isNumber/tests-certification
  GET  /api/standards/:isNumber/laboratories
  GET  /api/standards/:isNumber/related

Compare Standards
  POST /api/compare                                    # body: { isNumberA, isNumberB }

Saved Standards
  POST   /api/saved-standards
  GET    /api/saved-standards
  DELETE /api/saved-standards/:id

Settings
  GET /api/settings
  PUT /api/settings                                     # language, theme

Sources
  GET /api/sources/:id                                    # consolidated source lookup
```

---

## 8. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React + TypeScript), Tailwind CSS, i18next | fast to build for a hackathon timeline; SSR helps the landing page; i18next covers EN/HI |
| Backend | FastAPI (Python) | native access to the Python RAG/ML ecosystem (embeddings, PDF/OCR libs) without a separate ML service |
| LLM | Anthropic Claude API | grounded generation + query understanding |
| Embeddings | A managed embeddings API (e.g., Voyage AI / OpenAI) | indexing the BIS KB and query-time similarity search |
| Vector store | `pgvector` (Postgres extension) for MVP | avoids standing up a separate vector DB during the hackathon; can migrate to Qdrant/Pinecone if scale demands it |
| Relational DB | PostgreSQL (managed — e.g., Supabase/RDS, Mumbai region) | system of record; data residency alignment for a govt-adjacent product |
| Cache | Redis | session cache, rate limiting, hot standard lookups |
| Object storage | S3-compatible (e.g., AWS S3, Mumbai region) | uploaded documents |
| Auth | Firebase Auth or Supabase Auth | quick email/password + Google OAuth |
| Document processing | pdfplumber/PyMuPDF + Tesseract OCR | text extraction for uploaded product documents |
| Background jobs | Celery or RQ | async doc processing, live-retrieval fallback, KB refresh |
| Hosting (prototype) | Vercel (frontend) + Render/Railway (backend) | fast to deploy for a hackathon demo |
| CI/CD | GitHub Actions | |
| Monitoring | Sentry + structured logs | error tracking, groundedness/eval logging |

---

## 9. Security & Privacy

- TLS everywhere; JWT-based session auth; passwords hashed (bcrypt/argon2); Google sign-in via standard OAuth2/OIDC.
- Uploaded documents encrypted at rest, accessed only via short-lived signed URLs, retained per the app's privacy policy (§24) with a defined purge schedule for documents not tied to a saved standard.
- Rate limiting on all AI-heavy routes (`/chat/*`, `/find-standards/search`, `/compare`) to control cost and abuse.
- File type/size validation on uploads; extraction pipeline is sandboxed from the rest of the system.
- The chatbot's system prompt is scoped to BIS-domain topics only (§11: "not a general-purpose chatbot") — enforced at the orchestrator level, not just via UI copy.
- No user PII is forwarded to the LLM beyond what's required for the current query.

---

## 10. Non-Functional Requirements → Architecture Mapping

| PRD NFR (§24) | Architectural mechanism |
|---|---|
| Accuracy | RAG grounding + verification/hallucination-guard stage (§5, step 5) |
| Transparency | `source_refs` on every entity/response + consolidated Sources endpoint |
| Usability | Structured, card-shaped response schemas; progressive disclosure between summary and detail endpoints |
| Performance | Redis caching of hot lookups; indexed vector search as the fast path, live retrieval only when needed and run async |
| Security | JWT + TLS + encryption at rest |
| Privacy | Scoped, time-limited document retention; signed-URL access |
| Accessibility | Theming via CSS variables (light/dark); i18next-driven EN/HI copy; semantic, keyboard-navigable components (frontend concern) |
| Maintainability | Modular monolith with feature-aligned module boundaries; KB ingestion pipeline is independently re-runnable without a backend redeploy |

---

## 11. Deployment Architecture

**Phase 1 — Hackathon/MVP (single region, modular monolith):**

```
Vercel (Next.js) ──HTTPS──▶ FastAPI monolith (Render/Railway)
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
               PostgreSQL     Redis Cache    S3 (uploads)
               (+pgvector)
```

**Phase 2 — Post-hackathon scale path (noted for future, not built now):**
- Split RAG Orchestrator and Document Processor into independently scalable services behind a message queue (async live-retrieval and OCR jobs shouldn't block request threads).
- Move vector search to a dedicated store (Qdrant/Pinecone) once KB size or query volume outgrows `pgvector`.
- Add read replicas for Postgres; add a CDN in front of the frontend; consider multi-region for latency if usage grows beyond India.

---

## 12. Observability & AI Evaluation Hooks

Directly supports PRD §29 (AI Evaluation & Quality Strategy):

- Every RAG response logs: retrieved source IDs, re-ranking scores, which claims passed/failed the verification stage, and final grounded vs. "cannot verify" outcome.
- A held-out eval set of product descriptions → expected standards is run against the pipeline in CI to catch retrieval regressions.
- Comparison outputs are specifically checked for unsupported differences (§18, §29) as part of this eval loop.
- Sentry (or equivalent) captures pipeline errors (retrieval timeouts, extraction failures) separately from generation-quality issues.

---

## 13. Key Architectural Decisions

| Decision | Choice for MVP | Trade-off accepted |
|---|---|---|
| Monolith vs. microservices | Modular monolith, feature-aligned modules | Faster to build/ship for the hackathon; revisit if team splits or scale demands independent deploys |
| Find Standards internal structure | One service module for search + results + details + related tools | Matches PRD's explicit "one feature" framing (§13, §15); avoids a false service boundary |
| Retrieval strategy | Hybrid — indexed vector search (fast) + live retrieval (async, freshness-only) | Slightly more complex than pure-indexed, but needed because standard status/dates can change (§20) |
| Vector store | `pgvector` inside the existing Postgres instance | One less moving piece for a hackathon build; revisit at scale (Phase 2) |
| Chat vs. Find Standards upload | Upload endpoint exists only in Find Standards' request contract | Enforces §6/§11's hard requirement at the API layer, not just in the UI |

---

## 14. Functional Requirement Traceability

| PRD ID | Requirement | Architecture component |
|---|---|---|
| FR-01 | Signup/login (email + Google) | Auth Service |
| FR-02 | Land on Dashboard | Frontend routing + session middleware |
| FR-03 | Start chatbot conversation | Chat Service, `conversations` table |
| FR-04 | Chat maintains context | Chat Service (conversation-scoped message window passed to orchestrator) |
| FR-05 | Auto-save to History | `messages` table, write-on-every-turn |
| FR-06 | Keyword/filter search | Find Standards search handler |
| FR-07 | NL product description | Query Understanding stage |
| FR-08 | Optional document upload | Document Processor (Find Standards only) |
| FR-09 | One-time ranked result | Find Standards search handler (stateless, not persisted) |
| FR-10 | Result fields (relevance/IS/title/status/why/source) | Structured output schema, RAG step 7 |
| FR-11 | Standard Details from result | `GET /standards/:isNumber` |
| FR-12 | Tests & Certification | Related Tool sub-handler |
| FR-13 | Laboratories | Related Tool sub-handler |
| FR-14 | Compare exactly two IS numbers | Compare Service (input validation) |
| FR-15 | Comparison fields | Compare Service response schema |
| FR-16 | Save standards | Saved Standards Service |
| FR-17 | View chatbot history | Chat Service history endpoints |
| FR-18 | Source references | `source_refs` field, `sources` table |
| FR-19 | English + Hindi | i18next (frontend) + locale-aware prompt templates (backend) |
| FR-20 | Light/dark theme | Frontend theming + Settings Service |

---

## 15. Explicit Non-Goals (per PRD §30, Future Scope)

The architecture deliberately does not build for, in this MVP: enterprise/multi-tenant workspaces, admin/CMS tooling, change notifications, advanced document analysis beyond text extraction, direct BIS service integrations, or analytics dashboards. Module boundaries above are drawn so these can be added later without restructuring the core three-feature system.
