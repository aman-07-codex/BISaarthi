# BISaarthi Phase 6A — RAG Synthesis & Context-Grounded Answering Engine Architecture

> **Notice**: Phase 6A implements the RAG synthesis and grounding architecture using offline synthetic fixtures. No production BIS documents, production embeddings, or external LLM calls are used.

---

## 1. Architectural Overview

The **Phase 6A RAG Synthesis Engine** bridges the gap between semantic/lexical candidate retrieval (Phase 5B) and final verified response generation. It provides a strictly governed, provider-agnostic pipeline that translates raw standard excerpts into verifiable, citation-backed technical answers.

```text
                                  ┌───────────────────────────┐
                                  │      User RAG Query       │
                                  │    (Text, Language, TopK) │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Phase 5B Hybrid Engine  │
                                  │ (BM25 + Dense + RRF + Cit)│
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │              Retrieval Response              │
                         │    (Candidate Chunks + Source Provenance)    │
                         └──────────────────────┬───────────────────────┘
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          │                                           │
                [0 Candidates Found]                          [>=1 Candidates Found]
                          │                                           │
                          ▼                                           ▼
              ┌───────────────────────┐                  ┌───────────────────────────┐
              │ Safe Short-Circuit:   │                  │    RAG Context Builder    │
              │ INSUFFICIENT_CONTEXT  │                  │ (Budget & Provenance Pack)│
              └───────────────────────┘                  └─────────────┬─────────────┘
                                                                       │
                                                                       ▼
                                                         ┌───────────────────────────┐
                                                         │  Grounded Prompt Builder  │
                                                         │ (Anti-Extrapolation Rules)│
                                                         └─────────────┬─────────────┘
                                                                       │
                                                                       ▼
                                                         ┌───────────────────────────┐
                                                         │     BaseLLMProvider       │
                                                         │  (Mock Provider in Test)  │
                                                         └─────────────┬─────────────┘
                                                                       │
                                                                       ▼
                                                         ┌───────────────────────────┐
                                                         │    Grounding Validator    │
                                                         │  (Citation & IS Checks)   │
                                                         └─────────────┬─────────────┘
                                                                       │
                                                                       ▼
                                                         ┌───────────────────────────┐
                                                         │     Verified RAGAnswer    │
                                                         │ (Grounding Status & Audits│
                                                         └───────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Schema Layer (`app/schemas/bis_rag.py`)
- **`RAGContext`**: Encapsulates retrieved evidence chunks along with complete source provenance (`chunk_id`, `is_number`, `title`, `clause`, `section`, `source_pages`, `source_pdf_sha256`, and `CitationReference`).
- **`RAGQuery`**: Validated query request supporting `language` state (`en` and `hi`), `top_k`, filters (`category`, `is_number`, `clause`, `chunk_type`), score thresholds, and context budget limits (`max_context_chars`).
- **`GroundingValidationResult`**: Detailed verification report detailing grounding status, verified claims, unsupported references, citation errors, and security warnings.
- **`RAGAnswer`**: Structured response payload with verified answer text, audit-ready citations, grounding status, and comprehensive execution metadata.

### 2.2 LLM Provider Abstraction (`app/services/bis_llm_provider.py`)
- **`BaseLLMProvider` Protocol**: Provider-agnostic interface requiring `generate_answer(prompt, context, language)`. It decouples BISaarthi from any proprietary SDK (e.g., Google Gemini, OpenAI, Anthropic, Hugging Face).
- **`MockLLMProvider`**: 100% offline, deterministic provider for automated unit and integration tests. Synthesizes structured citations directly from supplied `RAGContext` without external network activity.

### 2.3 Grounded Prompt Builder (`app/services/bis_rag_prompt.py`)
Enforces strict anti-hallucination guardrails:
1. **Zero Extrapolation**: Directs the LLM to answer strictly from the bounded context blocks.
2. **Identification Boundaries**: Embeds explicit source tags (`--- START SOURCE ... ---`) with chunk IDs, IS numbers, and page numbers.
3. **Domain Integrity**: Forbids fabricating Indian Standard numbers, clauses, test limits, or page references.
4. **Language Directives**: Supports language switches (`en` / `hi`) without external machine translation services.

### 2.4 Context Builder (`app/services/bis_rag_context.py`)
- Transforms ranked `RetrievalCandidate` records into `RAGContext` instances.
- Preserves full upstream provenance, including SHA-256 digests and chunk paths.
- Enforces strict character and token budgets, prioritizing whole chunks rather than fragmenting requirements.

### 2.5 Grounding & Anti-Hallucination Validator (`app/services/bis_grounding_validator.py`)
A deterministic validation layer ensuring factual fidelity:
- **Citation Validity**: Ensures all cited chunk IDs exist in the retrieved candidate context.
- **Citation Provenance**: Verifies that standard numbers and clause identifiers match chunk metadata.
- **Hallucinated IS Detection**: Scans the answer text for Indian Standard identifiers (e.g., `IS 456`) and flags any reference not present in the retrieved context.
- **Clause Consistency**: Checks for references to clauses absent from the evidence.
- **Grounding Classification**:
  - `GROUNDED`: All claims, IS numbers, and citations verified against evidence.
  - `PARTIALLY_GROUNDED`: Minor unverified statements or warnings present.
  - `UNSUPPORTED`: Non-existent citations or ungrounded claims detected.
  - `INSUFFICIENT_CONTEXT`: Retrieval returned zero candidates or insufficient evidence.

### 2.6 Orchestration Service (`app/services/bis_rag.py`)
- Coordinates the end-to-end flow from query to verified answer.
- Implements mandatory **insufficient-context short-circuiting**: if 0 candidate chunks are retrieved, it immediately returns a safe, ungrounded notification without invoking the LLM provider.

---

## 3. Anti-Hallucination & Citation Policy

1. **Mandatory Attribution**: Technical claims must be backed by a `CitationReference` referencing a validated `chunk_id`.
2. **Never Fabricate Metadata**: The system will never generate synthetic IS numbers, clauses, or page numbers when answering questions.
3. **Empty Retrieval Handling**: If no relevant standard chunks are indexed or retrieved, the system states insufficient context rather than hallucinating an answer.

---

## 4. Language State Management

- The architecture supports `RAGLanguage.EN` (English) and `RAGLanguage.HI` (Hindi) as request parameters.
- Prompts and system instructions adapt to the requested language.
- Deterministic mock providers return language-appropriate fallback and synthetic responses.
- No external machine translation APIs are utilized in Phase 6A.

---

## 5. Security, Privacy & Boundary Guarantees

- **Zero Network Egress**: The entire Phase 6A implementation operates 100% locally.
- **No Third-Party SDKs**: No dependency on proprietary cloud LLM client libraries.
- **Unchanged Production Corpus**: Production manifests remain at 100 authoritative standards, 0 verified PDFs, and 0 production embeddings.
