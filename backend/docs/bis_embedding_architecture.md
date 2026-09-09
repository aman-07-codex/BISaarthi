# BISaarthi — Phase 5A: Embedding Architecture & Vector Store Interface

## 1. Overview & Purpose

Phase 5A defines the provider-agnostic embedding pipeline and vector store interface for BISaarthi. It establishes the contracts for converting Phase 4C retrieval chunks into dense vectors, storing vector records with complete provenance, and performing dense similarity search.

> [!IMPORTANT]
> **Strict Operational Boundaries & Scope Statement**:
> - **Architecture & Interface Phase**: Establishes provider protocols, data schemas, validation logic, and in-memory test stores only.
> - **Zero Production Embeddings**: No production BIS standard text is embedded during Phase 5A.
> - **Zero External Network / API Calls**: No calls to Gemini, OpenAI, Hugging Face, or remote embedding endpoints.
> - **Zero Database Changes**: No pgvector schemas, Supabase tables, or Alembic migrations are introduced in this phase.

---

## 2. Pipeline Architecture

```text
  Phase 4C DocumentChunk (backend/data/bis_documents/chunks/)
                          │
                          ▼
            [Embedding Input Validation]
                          │
                          ▼
            [BaseEmbeddingProvider Protocol]
              ├── MockEmbeddingProvider (Deterministic test-only)
              ├── LocalEmbeddingProvider (Future on-prem/local models)
              └── ExternalEmbeddingProvider (Future cloud APIs)
                          │
                          ▼
            [Dense Float Vector Array]
                          │
                          ▼
            [Vector Record & ID Assembly]
              └── {chunk_id}__emb_{provider}_{model}_{dimension}
                          │
                          ▼
            [Vector Integrity Validation]
              ├── Dimensionality match
              └── Finite float verification
                          │
                          ▼
              [BaseVectorStore Protocol]
              ├── InMemoryVectorStore (Test implementation)
              └── Supabase/pgvector Store (Future production)
```

---

## 3. Embedding Provider Interface

The `BaseEmbeddingProvider` protocol ensures complete decoupling between embedding clients and backend RAG services:

```python
class BaseEmbeddingProvider(Protocol):
    def embed_text(self, text: str) -> List[float]:
        """Embeds a single string into a dense float vector."""
        ...

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embeds a batch of strings into a list of dense float vectors."""
        ...

    @property
    def dimension(self) -> int: ...

    @property
    def model_name(self) -> str: ...

    @property
    def provider_type(self) -> EmbeddingProviderType: ...
```

---

## 4. Deterministic Mock Provider

The `MockEmbeddingProvider` generates reproducible unit vectors derived deterministically from a SHA-256 hash of the input text combined with the model configuration:

- **Reproducibility**: `embed_text("1 SCOPE")` will always yield the exact same vector across runs.
- **Distinctness**: Different inputs produce distinct vectors.
- **Dimension Exactness**: Always yields vectors with `len(v) == dimension`.
- **Unit Normalization**: Vectors are L2 normalized ($\|v\|_2 = 1.0$) to support direct cosine similarity via dot product.

---

## 5. Vector Record & Deterministic Vector ID Schema

Each vector is stored with full provenance back to the source PDF and Phase 4C chunk:

$$\text{Vector ID} = \texttt{\{chunk\_id\}\_\_emb\_\{provider\}\_\{model\}\_\{dimension\}}$$

Example Vector Record:
```json
{
  "vector_id": "IS_2082_2018_c0001_section_1_SCOPE__emb_mock_mock_embedding_v1_768",
  "chunk_id": "IS_2082_2018_c0001_section_1_SCOPE",
  "standard_id": 1001,
  "standard_enc_id": "enc_1001",
  "is_number": "IS 2082:2018",
  "title": "Stationary storage type electric water heaters",
  "category": "Electrical Appliances & Accessories",
  "chunk_type": "section",
  "section": "1",
  "clause": "1",
  "parent_clause": null,
  "source_pages": [1, 2],
  "source_pdf": "data/bis_documents/verified/IS_2082_2018.pdf",
  "source_pdf_sha256": "abcdef1234567890",
  "source_chunk_path": "data/bis_documents/chunks/IS_2082_2018.json",
  "embedding_provider": "mock",
  "embedding_model": "mock-embedding-v1",
  "embedding_dimension": 768,
  "embedding": [0.03451, -0.01294, 0.08123, ...],
  "metadata": {
    "section_title": "SCOPE",
    "clause_title": "SCOPE",
    "word_count": 120
  },
  "created_at": "2026-09-08T18:00:00Z"
}
```

---

## 6. Vector Store Interface & Search

The `BaseVectorStore` protocol defines operations:
- `upsert(records)`: Ingest or update vectors.
- `delete(vector_ids)`: Remove vectors by ID.
- `get(vector_id)`: Retrieve record by ID.
- `similarity_search(query_vector, top_k, filters)`: Compute cosine similarity and return ranked matches.

### Metadata Filtering
The vector store supports filtering on standard fields (`is_number`, `category`, `clause`, `chunk_type`, `standard_id`) or custom metadata fields before computing top-$k$ ranking.

---

## 7. Future Provider & Database Contracts

When selecting and activating production providers in future phases:
1. **Embedding Provider Evaluation**:
   - Technical text retrieval quality on standard specifications.
   - Cost, rate limits, and latency for batch processing.
   - On-prem / sovereign hosting options for sensitive regulatory text.
2. **pgvector / Supabase Schema**:
   - Dimension: Fixed to provider dimension (e.g. 768 or 1536).
   - Index: HNSW with `vector_cosine_ops`.
   - Partitioning: By `category` or `standard_id`.
