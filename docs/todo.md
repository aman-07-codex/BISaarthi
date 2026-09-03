# BISaarthi — MVP Build TODO

**Project:** BISaarthi — AI Guide to Indian Standards & BIS Compliance
**Context:** SIH26107 Prototype
**Companion docs:** BISaarthi PRD v1.1, `architecture.md`, `database.md`, `api.md`
**Scope of this document:** An actionable, phase-ordered build checklist for the three-feature MVP, cross-referenced to PRD sections/FR IDs and the other three docs so nothing gets built out of spec.

---

## 0. Foundations & Setup

- [ ] Repo setup (frontend + backend, or monorepo)
- [ ] FastAPI project skeleton (`architecture.md` §8)
- [ ] Next.js project skeleton with Tailwind + i18next (`architecture.md` §8)
- [ ] Provision PostgreSQL; enable `pgcrypto`, `pg_trgm`, `vector` extensions (`database.md` §3.0)
- [ ] Provision Redis instance
- [ ] Provision S3-compatible bucket with the `uploads/` and `kb-source-docs/` prefixes (`database.md` §6)
- [ ] Set up Alembic and write the initial migration (`database.md` §8)
- [ ] Configure secrets: LLM API key, embeddings API key, DB/Redis/S3 credentials, JWT secret, Google OAuth client ID
- [ ] GitHub Actions CI: lint + test on push (`architecture.md` §8)

---

## 1. Database Layer (`database.md`)

- [ ] Migrate core tables: `users`, `conversations`, `messages`, `sources`, `standards`, `standard_requirements`, `standard_related_standards`, `tests`, `certification_steps`, `laboratories`, `standard_laboratories`, `saved_standards`, `comparisons`, `uploaded_documents`
- [ ] Migrate indexes: trigram + full-text + GIN on `standards` (FR-06), all composite indexes per `database.md` §9
- [ ] Finalize embedding model → confirm vector dimension → migrate `bis_kb_chunks` + HNSW index (`database.md` §4)
- [ ] Verify CHECK constraints, in particular `tests.applicability IN ('mandatory','voluntary','unknown')` and `standards.status` including `'unknown'`
- [ ] Seed 5–10 hand-curated standards for early dev/demo before the full ingestion pipeline is ready

---

## 2. Auth (PRD §9, FR-01, FR-02)

- [ ] `POST /auth/signup` (password hashing — bcrypt/argon2)
- [ ] `POST /auth/login`
- [ ] Google OAuth2 flow + `POST /auth/google`
- [ ] JWT issuance + `GET /auth/me`
- [ ] `POST /auth/logout` (invalidate `session:{user_id}` in Redis)
- [ ] Frontend: Login / Sign Up screens → Dashboard on success
- [ ] Frontend: session persistence + protected-route guard

---

## 3. Dashboard Shell (PRD §10)

- [ ] Sidebar: AI Chatbot, Find Standards, Compare Standards, Saved Standards, History, Settings
- [ ] Dashboard home: welcome area, "Ask BISaarthi" input, quick actions, recent activity
- [ ] Theme toggle (light/dark) wired to Settings (FR-20)
- [ ] Language toggle (EN/HI) wired to Settings (FR-19)

---

## 4. Knowledge Base Ingestion Pipeline (`architecture.md` §5)

This feeds all three core features — build and validate it before wiring the RAG Orchestrator.

- [ ] Identify the authoritative source set: BIS standards/scheme docs first, relevant gov sources second (PRD §20)
- [ ] Document parsing/cleaning step
- [ ] Chunking step — clause/section-aware, retaining `is_number` + `category` metadata
- [ ] Wire the embeddings API
- [ ] Vector-store upsert job → `bis_kb_chunks`
- [ ] Populate `sources`, `standards`, `standard_requirements`, `tests`, `certification_steps`, `laboratories` from the same ingestion run
- [ ] Scheduled/triggered re-sync job, updating `last_synced_at`
- [ ] Manual QA: spot-check 10+ ingested standards against the actual BIS source for accuracy

---

## 5. RAG Orchestrator (`architecture.md` §5)

- [ ] Query Understanding — intent + entity extraction (product category, IS-number references, mode routing: chat / find_standards / compare)
- [ ] Hybrid retrieval — vector search (fast path) + async live-retrieval fallback (freshness-only)
- [ ] Re-ranking & filtering — relevance scoring, de-dup, recency weighting, `reliability_tier` priority
- [ ] Grounded generation — strict "cite or omit" system prompt
- [ ] Verification layer — cross-check every generated IS number / test / lab / mandatory-voluntary claim against the retrieved set; strip and mark "cannot verify" on any mismatch
- [ ] Source mapping — attach `source_refs` to every claim/card field
- [ ] Structured output formatter — emit `StandardCard` / `StandardDetails` / `Comparison` / `ChatMessage` exactly per `api.md` §2
- [ ] Unit test: force a low-evidence case and confirm no unverified claim ever reaches the client

---

## 6. Feature 1 — AI Chatbot (PRD §11–12, FR-03–05, FR-17, `api.md` §4)

- [ ] `POST /chat/conversations`, `GET /chat/conversations`, `GET /chat/conversations/:id`, `POST /chat/conversations/:id/messages`
- [ ] Enforce conversation-scoped context only — new chats start with no prior context
- [ ] Confirm no multipart/upload route exists anywhere on this resource
- [ ] Wire orchestrator `mode: chat`; render `StandardCard`s inline when relevant
- [ ] Clarification-question path when query-understanding confidence is below threshold
- [ ] Frontend: full-screen chat UI, New Chat button, message list, inline source indicators
- [ ] Frontend: History list (chatbot conversations only) + resume-past-conversation flow

---

## 7. Feature 2 — Find Standards (PRD §13–17, FR-06–13, `api.md` §5)

- [ ] `POST /find-standards/documents`, `GET /find-standards/documents/:id`
- [ ] `POST /find-standards/search` (keyword / filters / product description + optional `document_id`)
- [ ] `GET /standards/:isNumber`, `/related`, `/tests-certification`, `/laboratories`
- [ ] Enforce one-time, non-persisted result semantics — no session/history row written on search
- [ ] Document pipeline: type/size validation → text extraction → OCR fallback for scanned files
- [ ] Frontend: search bar + filters + product-description field + optional upload control
- [ ] Frontend: ranked results view (relevance, IS number, title, status, why applicable, source — FR-10)
- [ ] Frontend: Standard Details view (scope, categorized key requirements, revision info, related standards, sources)
- [ ] Frontend: Related Tools entry points → Tests & Certification, Laboratories
- [ ] Frontend: Tests & Certification page — test list with `mandatory / voluntary / unknown`, certification steps
- [ ] Frontend: Laboratories page — name, location, contact

---

## 8. Feature 3 — Compare Standards (PRD §18, FR-14–15, `api.md` §6)

- [ ] `POST /compare` — enforce exactly-two, distinct, valid IS numbers
- [ ] Verification rule: any difference not backed by both standards' sources is replaced with a "could not be verified" note, never dropped silently or guessed
- [ ] Reuse an existing `comparisons` row for the same canonical pair before recomputing (`database.md` §3.10)
- [ ] Confirm **no** `GET /compare` or `GET /comparisons` list route exists — comparisons are cache/persistence only, not a History feature (per the explicit correction already applied to `database.md` and `api.md`)
- [ ] Frontend: two-IS-number input, structured comparison view (summary, similarities, differences, sources)

---

## 9. Supporting Features

- [ ] Saved Standards: `POST/GET/DELETE /saved-standards` + frontend list view (FR-16)
- [ ] Settings: `GET/PUT /settings`, language + theme persistence (FR-19, FR-20)
- [ ] Sources: `GET /sources/:id` + consolidated Sources section in the UI (PRD §20)

---

## 10. Trust, Grounding & Guardrail QA (PRD §20, §28, §29)

- [ ] Build an eval set: product descriptions → expected relevant standards
- [ ] Automate "correct standard appears in top results" check in CI
- [ ] Automate groundedness check: `why_applicable` text must map to retrieved evidence
- [ ] Automate `applicability` check: nothing becomes `mandatory`/`voluntary` without a matching authoritative source; otherwise stays `unknown`
- [ ] Automate comparison unsupported-difference check
- [ ] Manual pass: English and Hindi responses for meaning preservation
- [ ] Manual pass: force at least one "cannot verify" scenario end-to-end
- [ ] Manual pass: confirm document upload only works within Find Standards, never in Chatbot

---

## 11. Security & Privacy Hardening (`architecture.md` §9, `database.md` §7)

- [ ] Rate limiting on `/chat/*`, `/find-standards/search`, `/compare`
- [ ] Signed-URL-only access to uploaded documents; bucket not publicly readable
- [ ] Scheduled purge job for `uploaded_documents` past `purge_at`
- [ ] Upload validation: file type/size limits, sandboxed extraction step
- [ ] Confirm the chatbot's system prompt stays BIS-domain-scoped and declines off-topic requests gracefully

---

## 12. i18n & Accessibility (FR-19, FR-20, PRD §24–25)

- [ ] i18next setup for EN/HI UI strings
- [ ] Locale-aware prompt templates for Hindi generation
- [ ] Theme via CSS variables (light/dark)
- [ ] Keyboard navigation + contrast pass on all core screens

---

## 13. Deployment & Demo Prep (`architecture.md` §11)

- [ ] Deploy frontend (Vercel) + backend (Render/Railway)
- [ ] Point to managed Postgres (Mumbai region) + Redis + S3
- [ ] Smoke-test all three end-to-end flows in the deployed environment
- [ ] Prepare demo script around PRD §27's electric-heater scenario
- [ ] Confirm the Product Disclaimer (PRD §31) is visibly present in the app

---

## 14. MVP Definition of Done

Directly from PRD §3's success indicators:

- [ ] A user can describe a product and receive a ranked set of potentially applicable standards
- [ ] Each recommendation includes an understandable reason for relevance
- [ ] Important claims are visibly traceable to authoritative sources in the UI
- [ ] A user can move from a standard result → Standard Details → Related Tools
- [ ] A user can compare exactly two standards
- [ ] The system can be shown explicitly saying "cannot verify" rather than guessing, in at least one demo scenario
- [ ] All three core flows work end-to-end without crossing feature boundaries: no upload in Chatbot, no conversational follow-up in Find Standards, no more/fewer than two standards in Compare

---

## 15. Explicitly Out of Scope — Do Not Build (PRD §30, `architecture.md` §15)

- Advanced compliance tracking, enterprise/multi-tenant accounts, admin/CMS tooling, change notifications
- Advanced document analysis beyond text extraction, direct BIS service/application integrations
- Multilingual support beyond English/Hindi, advanced laboratory discovery/filtering
- Personalized compliance journeys, analytics/reporting dashboards
- **A Comparison History page or endpoint** — the `comparisons` table exists for caching/persistence only; it must not be surfaced as a user-facing history feature in this MVP
