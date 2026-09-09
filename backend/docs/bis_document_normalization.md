# BISaarthi — Phase 4B: Text Normalization & Corpus-Ready Representation

## 1. Overview & Purpose

Phase 4B is the second stage of BISaarthi's offline document-processing pipeline. It transforms raw, page-level text extracted in Phase 4A into a clean, structured, machine-readable, corpus-ready representation suitable for future document chunking, indexing, and retrieval.

> [!IMPORTANT]
> **Strict Operational Boundaries & Scope Statement**:
> - **100% Offline Execution**: No HTTP requests, remote API calls, or web scraping.
> - **Zero LLM / Generative Dependencies**: All normalization and structural detection rules are deterministic, rule-based algorithms.
> - **Strict Input Source**: Only processes JSON files from `backend/data/bis_documents/extracted/` that originated from verified PDFs.
> - **No RAG or Embeddings**: Phase 4B does **not** create retrieval chunks, compute vector embeddings, or interact with a vector database.

---

## 2. Pipeline Architecture

```text
  Phase 4A Extracted JSON (backend/data/bis_documents/extracted/)
                            │
                            ▼
              [Input Schema Validation]
                            │
                            ▼
         [Statistical Header/Footer Detection]
                            │
                            ▼
            [Page-by-Page Text Normalization]
              ├── Unicode whitespace normalization
              ├── Control character cleanup
              ├── Running header/footer stripping
              ├── Hyphenated word break rejoining
              └── Conservative soft-wrap joining
                            │
                            ▼
           [Structure & Heading Identification]
              ├── Clause numbers (e.g. "1 SCOPE", "2.1 Definitions")
              ├── Standard sections ("ANNEX A", "TABLE 1")
              └── Lists & bullet points
                            │
                            ▼
          [Fidelity & Conservation Validation]
              ├── Character retention ratio (>= 60%)
              ├── Standard identity retention
              └── Technical token conservation (numbers + units)
                            │
                            ▼
  Corpus-Ready Output (backend/data/bis_documents/normalized/)
```

---

## 3. Directory Layout

| Directory / File | Description | Git Tracking |
| :--- | :--- | :--- |
| `backend/data/bis_documents/extracted/` | Raw page-by-page extractions from Phase 4A | Ignored (`.gitkeep` tracked) |
| `backend/data/bis_documents/normalized/` | Corpus-ready normalized JSON documents | Ignored (`.gitkeep` tracked) |
| `backend/docs/bis_document_normalization_manifest.json` | Authoritative 100-standard normalization status manifest | Tracked in Git |
| `backend/docs/bis_document_normalization_manifest.md` | Authoritative human-readable normalization report | Tracked in Git |

---

## 4. Normalization Rules & Principles

The normalization engine operates under a strict principle of **conservative fidelity**: improving machine readability while preventing any distortion of technical requirements.

### A. Unicode & Whitespace Normalization
- Converts non-breaking spaces (`\u00A0`), en-spaces, em-spaces, and zero-width spaces into standard space representations.
- Replaces non-standard typographical quotes and dashes with standardized representations (`"` and `-`).
- Removes non-printable control characters while preserving `\n` and `\t`.
- Collapses consecutive horizontal whitespace to a single space while keeping deliberate paragraph breaks (maximum 2 consecutive newlines).

### B. Hyphenation & Line-Break Rejoining
- Reconnects words broken across line breaks by PDF wrapping (e.g., `require-\n ment` $\to$ `requirement`).
- Conservative joining: Does **not** join lines if the line represents a clause heading, bullet point, table row, or ends with terminal sentence punctuation followed by a capitalized sentence.

### C. Repetitive Header & Footer Filtering
- Automatically inspects the top 2 and bottom 2 lines across all pages.
- Identifies running header/footer artifacts if identical non-clause lines appear across $\ge 50\%$ of pages.
- Strips the repetitive lines from `normalized_text` while logging them in `removed_header_footer_lines` and preserving the raw text in `source_text`.

### D. Structure & Heading Preservation
- Detects standardized BIS clause hierarchies:
  - Clauses: `1 SCOPE`, `2 REFERENCES`, `3 TERMINOLOGY`, `4.1 General Requirements`
  - Annexures / Appendices: `ANNEX A`, `APPENDIX B`
  - Tables / Figures: `TABLE 1`, `FIG. 2`
- Preserves distinct line breaks around identified headings.

### E. Technical Token Conservation
- Verifies that critical numbers, tolerances, units, and electrical/physical parameters (`230 V`, `50 Hz`, `0.5 mm`, `10 %`, `°C`, `IS 302`) are retained without alteration.

---

## 5. Schema & Provenance

Every normalized document retains complete provenance back to the source PDF:

```json
{
  "standard_id": 1001,
  "is_number": "IS 2082:2018",
  "title": "Stationary storage type electric water heaters",
  "category": "Electrical Appliances & Accessories",
  "source_extraction_file": "backend/data/bis_documents/extracted/IS_2082_2018.json",
  "source_pdf": "backend/data/bis_documents/verified/IS_2082_2018.pdf",
  "source_pdf_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "source_total_character_count": 18500,
  "normalized_total_character_count": 17200,
  "character_retention_ratio": 0.9297,
  "page_count": 14,
  "normalized_page_count": 14,
  "normalization_status": "normalized",
  "normalization_quality": "good",
  "detected_headings_count": 18,
  "detected_headings": ["1 SCOPE", "2 REFERENCES", "3 TERMINOLOGY", ...],
  "normalization_rules_applied": [
    "unicode_whitespace_normalization",
    "control_character_cleanup",
    "hyphenated_linebreak_rejoining",
    "soft_wrap_paragraph_normalization",
    "repeated_header_footer_filtering"
  ],
  "issues": [],
  "normalized_at": "2026-09-08T17:30:00Z",
  "normalization_version": "1.0.0",
  "pages": [
    {
      "page_number": 1,
      "source_text": "...",
      "normalized_text": "...",
      "source_character_count": 1250,
      "normalized_character_count": 1180,
      "character_retention_ratio": 0.944,
      "detected_headings": ["1 SCOPE"],
      "removed_header_footer_lines": ["IS 2082 : 2018"],
      "status": "success"
    }
  ]
}
```

---

## 6. CLI Usage

To run the offline normalization pipeline across all extracted documents:

```bash
# Normalize all available extracted documents and update manifests
python scripts/normalize_extracted_documents.py

# Normalize a specific standard
python scripts/normalize_extracted_documents.py --single "IS 2082:2018"

# Force re-normalization of existing files
python scripts/normalize_extracted_documents.py --force
```

---

## 7. Reversibility & Auditability

The normalization pipeline is strictly non-destructive:
1. `source_text` is preserved verbatim on each `NormalizedPage`.
2. Phase 4A extraction JSONs in `backend/data/bis_documents/extracted/` are never overwritten or modified by Phase 4B.
3. Every citation or chunk created in future phases can trace back from:
   $$\text{RAG Citation} \longrightarrow \text{Chunk} \longrightarrow \text{Normalized Page} \longrightarrow \text{Extracted Page} \longrightarrow \text{PDF Page}$$
