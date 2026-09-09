# BISaarthi — Phase 5B: Retrieval Architecture & Hybrid Search Interface

## 1. Overview & Purpose

Phase 5B defines the provider-agnostic hybrid retrieval architecture for BISaarthi. It establishes the contracts for combining lexical (BM25) search, dense vector similarity search, structured metadata filtering, Reciprocal Rank Fusion (RRF), and verifiable citation building.

> [!IMPORTANT]
> **Strict Operational Boundaries & Scope Statement**:
> - **Architecture & Retrieval-Ready Interface**: Implements offline candidate ranking and citation formatting.
> - **Zero LLM Generation**: Does **not** perform generative question answering or call remote chat/completion APIs (reserved for Phase 6).
> - **Zero External Network / API Calls**: No external embedding APIs or remote vector databases are accessed.
> - **Zero Database Changes**: Operates through clean abstraction protocols (`BaseKeywordRetriever`, `BaseDenseRetriever`, `BaseVectorStore`).

---

## 2. Hybrid Retrieval Architecture

```text
                     RetrievalQuery (Natural Language / Keywords)
                                      │
                                      ▼
                        [Metadata Filter Validation]
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
     [BM25 Keyword Retriever]                 [Dense Vector Retriever]
     - Technical tokenization                 - Mock / local embeddings
     - Exact IS & unit matching               - Cosine similarity
     - k1=1.5, b=0.75                         - Top-K candidate ranking
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      ▼
                      [Reciprocal Rank Fusion (RRF)]
                      - Formula: RRF(d) = Σ w / (k + rank)
                      - Deduplication across chunk IDs
                      - Dual-method attribution tracking
                                      │
                                      ▼
                        [Non-Fabricating Citation Builder]
                        - Source page numbers & clause IDs
                        - SHA-256 PDF hash preservation
                                      │
                                      ▼
                               RetrievalResponse
```

---

## 3. Lexical Tokenization & BM25 Scoring

### A. Conservative Technical Tokenizer
Standard English stop-word filters destroy critical Indian Standard terms. The technical tokenizer explicitly identifies and preserves:
- **Standard Identifiers**: `IS 2082:2018`, `IS 302 (Part 1)` $\to$ `is_2082`, `2082`, `is_302_part_1`.
- **Clause Hierarchies**: `6.1.1` $\to$ `6.1.1`, `6.1`, `6`.
- **Engineering Units & Values**: `230 V`, `50 Hz`, `0.5 mm`, `°C` $\to$ `230v`, `230`, `v`, `50hz`, `50`, `hz`.
- **Regulatory Keywords**: Normative vocabulary (`SHALL`, `MANDATORY`, `REQUIREMENT`).

### B. BM25 Formula
$$\text{Score}(D, Q) = \sum_{q \in Q} \ln\left(1 + \frac{N - n(q) + 0.5}{n(q) + 0.5}\right) \cdot \frac{f(q, D) \cdot (k_1 + 1)}{f(q, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$
Parameters: $k_1 = 1.5, b = 0.75$.

---

## 4. Reciprocal Rank Fusion (RRF)

When executing in `HYBRID` mode, candidates from both lexical and dense retrieval are merged:

$$\text{RRF}(d) = w_{\text{dense}} \cdot \frac{1}{k + \text{rank}_{\text{dense}}(d)} + w_{\text{keyword}} \cdot \frac{1}{k + \text{rank}_{\text{keyword}}(d)}$$

- Default constant: $k = 60$.
- Duplicate candidates are deduplicated by `chunk_id`.
- Candidates appearing in both engines receive boosted RRF scores and record dual attribution `retrieval_methods: ["dense", "keyword"]`.

---

## 5. Non-Fabricating Citations

Every retrieved candidate receives a structured `CitationReference` derived strictly from verified upstream metadata:

```json
{
  "citation_id": "cite_001",
  "is_number": "IS 2082:2018",
  "title": "Stationary storage type electric water heaters",
  "section": "6",
  "clause": "6.1 (Protection against access to live parts)",
  "source_pages": [12, 13],
  "chunk_id": "IS_2082_2018_c0012_clause_6_1",
  "source_chunk_path": "data/bis_documents/chunks/IS_2082_2018.json",
  "source_pdf_sha256": "abcdef1234567890",
  "formatted_citation": "[1] IS 2082:2018 — Stationary storage type electric water heaters, Clause 6.1 (Protection against access to live parts), pp. 12-13"
}
```

If any metadata field is missing upstream, it is explicitly omitted rather than hallucinated or guessed.

---

## 6. CLI Usage

To test retrieval or verify production corpus index status:

```bash
# Check production index status
python scripts/search_chunks.py --query "electric water heater safety requirements"

# Specify search method
python scripts/search_chunks.py --query "IS 2082" --method keyword --top-k 3
```
