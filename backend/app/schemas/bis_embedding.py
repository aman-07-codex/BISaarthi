"""Pydantic schemas for Phase 5A: Embedding Architecture & Vector Store Interface."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class EmbeddingProviderType(str, Enum):
    """Supported embedding provider types."""
    MOCK = "mock"
    LOCAL = "local"
    EXTERNAL = "external"


class EmbeddingStatus(str, Enum):
    """Lifecycle status of document embedding."""
    EMBEDDED = "embedded"
    NOT_EMBEDDED = "not_embedded"
    EMBEDDING_FAILED = "embedding_failed"
    REQUIRES_MANUAL_REVIEW = "requires_manual_review"


class EmbeddingConfig(BaseModel):
    """Configuration for embedding models and batching."""
    model_config = ConfigDict(from_attributes=True)

    provider: EmbeddingProviderType = Field(
        default=EmbeddingProviderType.MOCK,
        description="Embedding provider identifier"
    )
    model_name: str = Field(
        default="mock-embedding-v1",
        description="Model identifier or name"
    )
    dimension: int = Field(
        default=768,
        ge=1,
        description="Expected embedding vector dimensionality"
    )
    batch_size: int = Field(
        default=32,
        ge=1,
        description="Number of chunks to embed per batch"
    )
    normalize_embeddings: bool = Field(
        default=True,
        description="Whether output vectors should be L2 normalized"
    )
    timeout_seconds: float = Field(
        default=30.0,
        ge=1.0,
        description="Timeout for embedding requests in seconds"
    )
    enabled: bool = Field(
        default=True,
        description="Whether this provider is currently active"
    )


class VectorRecord(BaseModel):
    """Dense vector record representing an embedded document chunk."""
    model_config = ConfigDict(from_attributes=True)

    vector_id: str = Field(..., description="Deterministic unique identifier for this vector")
    chunk_id: str = Field(..., description="Foreign key to Phase 4C DocumentChunk")

    standard_id: Optional[int] = Field(default=None, description="Standard ID from corpus manifest")
    standard_enc_id: Optional[str] = Field(default=None, description="Standard Encrypted ID")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Official standard title")
    category: str = Field(..., description="Corpus category")

    chunk_type: str = Field(..., description="Semantic chunk type (e.g. 'clause', 'section')")
    section: Optional[str] = Field(default=None, description="Section number")
    clause: Optional[str] = Field(default=None, description="Clause number")
    parent_clause: Optional[str] = Field(default=None, description="Parent clause number")
    annex_id: Optional[str] = Field(default=None, description="Annex identifier")
    table_id: Optional[str] = Field(default=None, description="Table identifier")

    source_pages: List[int] = Field(default_factory=list, description="Source PDF pages")
    source_pdf: str = Field(..., description="Relative path to verified source PDF")
    source_pdf_sha256: str = Field(..., description="Cryptographic SHA-256 digest of original source PDF")
    source_chunk_path: str = Field(..., description="Relative path to Phase 4C chunks JSON")

    embedding_provider: str = Field(..., description="Provider name used to generate embedding")
    embedding_model: str = Field(..., description="Model name used to generate embedding")
    embedding_dimension: int = Field(..., ge=1, description="Vector dimension")
    embedding: List[float] = Field(..., description="Float array representing the dense embedding")

    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional structured metadata for filtering"
    )
    created_at: str = Field(..., description="ISO timestamp when vector was generated")


class SearchResult(BaseModel):
    """Result of a vector similarity search."""
    model_config = ConfigDict(from_attributes=True)

    record: VectorRecord = Field(..., description="Matched vector record")
    score: float = Field(..., description="Similarity score (e.g. Cosine Similarity)")


class EmbeddingManifestRecord(BaseModel):
    """Manifest record tracking embedding status for a standard in the 100-corpus."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="Standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Standard Encrypted ID")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Standard title")
    category: str = Field(..., description="Corpus category")

    source_pdf: Optional[str] = Field(default=None, description="Path to verified PDF if present")
    source_chunks_path: Optional[str] = Field(default=None, description="Path to chunks JSON if present")
    embedding_status: EmbeddingStatus = Field(
        default=EmbeddingStatus.NOT_EMBEDDED,
        description="Embedding lifecycle state"
    )

    total_chunks: Optional[int] = Field(default=None, description="Total chunks in document")
    total_vectors: Optional[int] = Field(default=None, description="Total vectors generated")
    embedding_model: Optional[str] = Field(default=None, description="Embedding model name")
    embedding_dimension: Optional[int] = Field(default=None, description="Vector dimension")
    sha256: Optional[str] = Field(default=None, description="Source PDF SHA-256 digest")
    embedded_at: Optional[str] = Field(default=None, description="Embedding ISO timestamp")
    validation_issues: List[str] = Field(default_factory=list, description="Validation issues or warnings")


class EmbeddingCategoryGroup(BaseModel):
    """Category grouping of embedding records."""
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Category name")
    standards: List[EmbeddingManifestRecord] = Field(
        default_factory=list,
        description="Embedding records in this category"
    )


class EmbeddingSummary(BaseModel):
    """Aggregate statistics for the embedding manifest."""
    model_config = ConfigDict(from_attributes=True)

    total_standards: int = Field(default=0)
    embedded_count: int = Field(default=0)
    not_embedded_count: int = Field(default=0)
    embedding_failed_count: int = Field(default=0)
    manual_review_count: int = Field(default=0)
    total_vectors_generated: int = Field(default=0)


class CategoryEmbeddingBreakdown(BaseModel):
    """Category-level summary statistics for embeddings."""
    model_config = ConfigDict(from_attributes=True)

    category_name: str = Field(..., description="Category name")
    total_standards: int = Field(default=0)
    embedded_count: int = Field(default=0)
    not_embedded_count: int = Field(default=0)
    total_vectors: int = Field(default=0)


class BISDocumentEmbeddingManifest(BaseModel):
    """Top-level BIS document embedding manifest."""
    model_config = ConfigDict(from_attributes=True)

    schema_version: str = Field(default="1.0.0")
    generated_at: str = Field(...)
    description: str = Field(
        default="Official embedding status and vector manifest for 100 BISaarthi MVP standards"
    )
    summary: EmbeddingSummary = Field(default_factory=EmbeddingSummary)
    categories_breakdown: List[CategoryEmbeddingBreakdown] = Field(default_factory=list)
    categories: List[EmbeddingCategoryGroup] = Field(default_factory=list)
