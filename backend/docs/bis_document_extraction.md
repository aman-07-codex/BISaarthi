# BISaarthi — Phase 4A: Offline PDF Extraction & Structural Validation

## 1. Overview & Purpose

**Phase 4A** implements the first stage of BISaarthi's offline document-processing pipeline. It takes official Bureau of Indian Standards (BIS) publications that have been legitimately acquired and verified by the Phase 3B pipeline, performs deterministic page-by-page text extraction, validates document identity and structural integrity, and produces structured JSON representations for subsequent normalization (Phase 4B) and search embeddings (Phase 5).

> [!IMPORTANT]
> **Strict Offline & Isolation Policy**:
> - **100% Offline**: Zero HTTP requests, zero external APIs, zero LLM calls.
> - **Input Boundary**: Reads exclusively from `backend/data/bis_documents/verified/`. Never processes candidate files from `quarantine/` or `rejected/`.
> - **No Fabricated Extractions**: With 0 real verified BIS PDFs in production, the manifest accurately records all 100 standards as `not_extracted`.

---

## 2. Extraction Pipeline Architecture

```text
backend/data/bis_documents/verified/ (Verified PDFs)
                        ↓
         [BIS Extraction Validator]
         ├─ Magic Byte Check (%PDF-)
         ├─ File Size Bounds (Max 50 MB)
         └─ Object Tree Structural Safety
                        ↓
         [Local Text Extractor (pypdf)]
         └─ Page-by-page extraction (1-indexed)
                        ↓
         [Page-Level Representation]
         ├─ page_number
         ├─ text
         ├─ character_count
         └─ extraction_status
                        ↓
         [Identity & Quality Validator]
         ├─ Header IS Number & Title Matching
         ├─ Part / Section Disambiguation
         └─ Character Density / Scan Detection
                        ↓
       ┌────────────────┴────────────────┐
 [EXTRACTED (Good/Poor)]        [FAILED / MANUAL REVIEW]
       ↓                                 ↓
data/bis_documents/extracted/IS_XXXXX.json
                        ↓
docs/bis_document_extraction_manifest.json & .md
```

---

## 3. Directory Layout

```text
backend/
└── data/
    └── bis_documents/
        ├── quarantine/   # Staging area for newly supplied files (Phase 3B)
        ├── verified/     # Cryptographically verified source PDFs (Phase 3B output / Phase 4A input)
        ├── rejected/     # Malformed or unverified files
        ├── extracted/    # Structured page-level JSON extractions (Phase 4A output)
        └── metadata/     # Per-document provenance & audit sidecars
```

---

## 4. Extraction & Quality Statuses

### Extraction Statuses (`ExtractionStatus`)
* `extracted`: Text extracted successfully and structured JSON written.
* `not_extracted`: Default state. No verified PDF present in `verified/`.
* `extraction_failed`: Parser error, corrupt PDF object tree, or unreadable structure.
* `manual_review`: Document text extracted, but identity could not be verified or quality is ambiguous.

### Quality Classifications (`ExtractionQuality`)
* `good`: Healthy digital extraction with verified standard identity, high character count (> 100 chars), and consistent text-bearing page ratio (>= 30%).
* `poor`: Low character count or fragmented text-bearing page ratio (< 30%).
* `requires_ocr`: Document contains minimal or zero extractable digital text (< 100 chars across document), indicating a scanned/rasterized document.
* `corrupted`: Unreadable or empty PDF object structure.

---

## 5. Page Preservation & Citation Grounding

Page boundaries are preserved during extraction:
* Every page retains its exact 1-indexed `page_number`.
* Text content is preserved per page without collapsing into an opaque block.
* This allows future RAG pipelines (Phase 5) to generate precise section and page-number citations back to the source PDF.

---

## 6. Document Identity Validation

To prevent misattributed documents from entering the knowledge pipeline, the validator inspects the header text of the first 3 pages:
1. Detects IS numbers using pattern matching (e.g. `IS 2082:2018`, `IS 302 (Part 2/Sec 3):2024`).
2. Dissects detected identifiers into prefix, base number, part number, section number, and revision year via `bis_resolver`.
3. Verifies exact match against the expected standard in `bis_mvp_corpus_manifest.json`.
4. Disambiguates multi-part standards (e.g. confirming Part 1 vs Part 2/Sec 3).

---

## 7. Synthetic Testing Approach

Because the production system currently contains 0 verified BIS PDFs (pending authorized manual acquisition), automated tests utilize synthetic in-memory/temporary PDF fixtures generated strictly inside isolated `pytest` `tmp_path` fixtures.

Synthetic test cases cover:
* Multi-page digital text PDFs
* Page boundary preservation
* Exact IS number and Part/Section matching
* Low-character / scanned document detection (`requires_ocr`)
* Mismatched standard identification (`manual_review`)
* Corrupted file handling (`extraction_failed`)
* Strict production input boundary enforcement

*Synthetic test files are strictly isolated from production directories and never committed as corpus data.*

---

## 8. Why OCR & RAG Are Excluded From Phase 4A

* **No OCR**: Phase 4A focuses exclusively on direct local digital text extraction. Documents flagged as `requires_ocr` are explicitly cataloged for dedicated offline OCR handling in a future phase.
* **No RAG / Embeddings / Chunking**: Semantic normalization and section partitioning occur in Phase 4B, and embedding generation occurs in Phase 5. Phase 4A is strictly page-level raw text extraction.

---

## 9. Consumer Contract for Phase 4B & Phase 5

Phase 4B (Normalization) and Phase 5 (RAG) consume files from `backend/data/bis_documents/extracted/` with the following schema guarantees:
* Valid `DocumentExtractionOutput` JSON per standard.
* Explicit `pages[]` array with 1-indexed `page_number` and `text`.
* SHA-256 integrity hash matching source PDF.
* Explicit `identity_verified` boolean and `extraction_quality` tag.
