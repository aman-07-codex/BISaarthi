# BISaarthi — Phase 4C: Document Chunking & Semantic Partitioning

## 1. Overview & Purpose

Phase 4C is the third stage of BISaarthi's offline document-processing pipeline. It transforms clean, normalized representations from Phase 4B into structured, retrieval-ready semantic chunks preserving document hierarchy, technical clauses, parent context, tables, annexes, and multi-page provenance for future vector indexing and RAG pipelines.

> [!IMPORTANT]
> **Strict Operational Boundaries & Scope Statement**:
> - **100% Offline Execution**: Zero HTTP requests, remote API calls, or external services.
> - **Structure-Aware Determinism**: Chunk boundaries are established strictly using deterministic document hierarchy parsing without non-deterministic heuristics.
> - **Zero AI/LLM / Vector Dependencies**: Phase 4C creates retrieval-ready structural chunks but does **not** generate embeddings, build vector indexes, or implement RAG.
> - **Strict Input Source**: Only consumes Phase 4B normalized JSON files from `backend/data/bis_documents/normalized/`.

---

## 2. Chunking Philosophy & Hierarchy Tracking

BIS Indian Standards are highly structured technical specifications. Naive fixed-token splitting (e.g. slicing every 500 tokens) breaks technical clauses, detaches notes from their parent requirements, and destroys clause numbering.

Phase 4C prioritizes document hierarchy:

```text
Document (e.g. IS 302 (Part 1))
  └── Major Section (e.g. "6 PROTECTION AGAINST ELECTRIC SHOCK")
       └── Clause (e.g. "6.1 Protection against access to live parts")
            └── Subclause (e.g. "6.1.1 Test probe application")
                 ├── Content paragraphs
                 ├── Numbered / bulleted lists
                 ├── Note / Warning / Caution
                 └── Cross-references
```

---

## 3. Supported Chunk Types

| Chunk Type | Description | Hierarchy Preserved |
| :--- | :--- | :--- |
| `section` | Major top-level section introduction / scope | Section ID & Title |
| `clause` | Standard numeric clause (e.g., `6.1`) | Section + Clause ID + Title |
| `subclause` | Deeply nested clause (e.g., `6.1.1`, `3.2.1.4`) | Section + Parent Clause + Subclause ID |
| `annex` | Normative or informative annex content | Annex Identifier (e.g. `ANNEX A`) |
| `table` | Extracted technical table content | Table Identifier (e.g. `TABLE 1`) |
| `note` | Clarifying technical notes attached to a clause | Parent Section/Clause |
| `warning` | Safety warnings or cautions | Parent Section/Clause |
| `list` | Discrete bullet or numbered requirement list | Parent Section/Clause |
| `content` | General standard requirements | Section/Clause |

---

## 4. Chunk ID Algorithm

Chunk IDs are deterministic, human-readable, and reproducible across runs:

$$\text{Chunk ID} = \texttt{\{safe\_is\_number\}\_c\{seq:04d\}\_\{chunk\_type\}\_\{slug\}}$$

For oversized clauses split into subchunks:
$$\text{Subchunk ID} = \texttt{\{safe\_is\_number\}\_c\{seq:04d\}\_\{chunk\_type\}\_\{slug\}\_p\{subchunk\_index\}}$$

Example: `IS_2082_2018_c0003_clause_1_SCOPE` or `IS_302_Part_1__c0012_subclause_6_1_p1`

---

## 5. Chunk Metadata Schema

Every generated chunk contains complete context and provenance:

```json
{
  "chunk_id": "IS_2082_2018_c0001_section_1_SCOPE",
  "chunk_sequence": 1,
  "chunk_type": "section",
  "standard_id": 1001,
  "standard_enc_id": "enc_1001",
  "is_number": "IS 2082:2018",
  "title": "Stationary storage type electric water heaters",
  "category": "Electrical Appliances & Accessories",
  "section": "1",
  "section_title": "SCOPE",
  "clause": "1",
  "clause_title": "SCOPE",
  "parent_clause": null,
  "annex_id": null,
  "table_id": null,
  "source_pages": [1, 2],
  "source_pdf": "data/bis_documents/verified/IS_2082_2018.pdf",
  "source_pdf_sha256": "abcdef1234567890",
  "source_extraction_path": "data/bis_documents/extracted/IS_2082_2018.json",
  "source_normalization_path": "data/bis_documents/normalized/IS_2082_2018.json",
  "text": "1 SCOPE\nThis standard specifies safety and performance requirements for electric water heaters...",
  "character_count": 845,
  "word_count": 120,
  "is_oversized_subchunk": false,
  "subchunk_index": null,
  "subchunk_total": null
}
```

---

## 6. Directory Structure

| Directory / File | Description | Git Tracking |
| :--- | :--- | :--- |
| `backend/data/bis_documents/normalized/` | Phase 4B normalized input JSONs | Ignored (`.gitkeep` tracked) |
| `backend/data/bis_documents/chunks/` | Phase 4C retrieval-ready chunk JSONs | Ignored (`.gitkeep` tracked) |
| `backend/docs/bis_document_chunking_manifest.json` | Authoritative 100-standard chunking manifest | Tracked in Git |
| `backend/docs/bis_document_chunking_manifest.md` | Authoritative human-readable chunking report | Tracked in Git |

---

## 7. CLI Usage

To run the offline chunking pipeline:

```bash
# Chunk all available normalized documents and update manifests
python scripts/chunk_normalized_documents.py

# Chunk a specific standard
python scripts/chunk_normalized_documents.py --single "IS 2082:2018"

# Customize maximum chunk size (default: 2000 chars)
python scripts/chunk_normalized_documents.py --max-chars 1500

# Force re-chunking
python scripts/chunk_normalized_documents.py --force
```

---

## 8. Integrity Validation & Auditability

The chunk validation engine enforces:
1. **Sequence Integrity**: Monotonically increasing 1-indexed sequences $[1, 2, \dots, N]$.
2. **Deterministic Uniqueness**: Zero chunk ID collisions across the document.
3. **Provenance Completeness**: All referenced `source_pages` exist in the upstream normalized document.
4. **Source Text Containment**: Verification that chunk text originates directly from normalized pages.
5. **No Silent Mutation**: Normative wording and technical numbers/units are preserved identically.
