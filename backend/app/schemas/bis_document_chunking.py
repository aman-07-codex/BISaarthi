"""Pydantic schemas for Phase 4C: Document Chunking & Semantic Partitioning."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ChunkType(str, Enum):
    """Semantic category of document chunk."""
    SECTION = "section"
    CLAUSE = "clause"
    SUBCLAUSE = "subclause"
    ANNEX = "annex"
    TABLE = "table"
    NOTE = "note"
    WARNING = "warning"
    LIST = "list"
    CONTENT = "content"


class ChunkingStatus(str, Enum):
    """Lifecycle status of document chunking."""
    CHUNKED = "chunked"
    NOT_CHUNKED = "not_chunked"
    CHUNKING_FAILED = "chunking_failed"
    REQUIRES_MANUAL_REVIEW = "requires_manual_review"


class DocumentChunk(BaseModel):
    """Retrieval-ready structural chunk of an Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    chunk_id: str = Field(..., description="Deterministic unique identifier for this chunk")
    chunk_sequence: int = Field(..., ge=1, description="1-indexed sequence number in document")
    chunk_type: ChunkType = Field(default=ChunkType.CONTENT, description="Semantic type of chunk")

    standard_id: Optional[int] = Field(default=None, description="BIS standard ID from corpus manifest")
    standard_enc_id: Optional[str] = Field(default=None, description="BIS encrypted standard ID")
    is_number: str = Field(..., description="Authoritative Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Official title of the standard")
    category: str = Field(..., description="Corpus category")

    section: Optional[str] = Field(default=None, description="Section identifier or heading (e.g. '6')")
    section_title: Optional[str] = Field(default=None, description="Section title text")
    clause: Optional[str] = Field(default=None, description="Clause or subclause number (e.g. '6.1')")
    clause_title: Optional[str] = Field(default=None, description="Clause title text")
    parent_clause: Optional[str] = Field(default=None, description="Parent clause number if nested (e.g. '6')")
    annex_id: Optional[str] = Field(default=None, description="Annex identifier if within an annex (e.g. 'ANNEX A')")
    table_id: Optional[str] = Field(default=None, description="Table identifier if within a table (e.g. 'TABLE 1')")

    source_pages: List[int] = Field(
        default_factory=list,
        description="List of 1-indexed source PDF pages this chunk spans"
    )
    source_pdf: str = Field(..., description="Relative path to verified source PDF")
    source_pdf_sha256: str = Field(..., description="Cryptographic SHA-256 digest of original source PDF")
    source_extraction_path: str = Field(..., description="Relative path to Phase 4A extraction JSON")
    source_normalization_path: str = Field(..., description="Relative path to Phase 4B normalized JSON")

    text: str = Field(..., description="Cleaned, normalized text content of this chunk")
    character_count: int = Field(default=0, ge=0, description="Total characters in chunk text")
    word_count: int = Field(default=0, ge=0, description="Total words in chunk text")

    is_oversized_subchunk: bool = Field(
        default=False,
        description="Whether this chunk resulted from splitting an oversized clause"
    )
    subchunk_index: Optional[int] = Field(
        default=None,
        description="1-indexed subchunk index if split from an oversized clause"
    )
    subchunk_total: Optional[int] = Field(
        default=None,
        description="Total subchunks resulting from the split"
    )


class DocumentChunkOutput(BaseModel):
    """Complete collection of retrieval-ready chunks for an Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="Standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Standard Encrypted ID")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Standard title")
    category: str = Field(..., description="Corpus category")

    source_pdf: str = Field(..., description="Source PDF path")
    source_pdf_sha256: str = Field(..., description="Source PDF SHA-256 digest")
    source_extraction_path: str = Field(..., description="Phase 4A extraction JSON path")
    source_normalization_path: str = Field(..., description="Phase 4B normalized JSON path")

    total_chunks: int = Field(default=0, ge=0, description="Total number of chunks produced")
    total_characters: int = Field(default=0, ge=0, description="Total characters across all chunks")
    average_chunk_characters: float = Field(default=0.0, ge=0.0, description="Mean character length per chunk")
    chunk_type_counts: Dict[str, int] = Field(default_factory=dict, description="Distribution of chunk types")

    chunking_status: ChunkingStatus = Field(
        default=ChunkingStatus.CHUNKED,
        description="Chunking lifecycle status"
    )
    issues: List[str] = Field(default_factory=list, description="Warnings or issues during chunking")
    chunked_at: str = Field(..., description="ISO timestamp when chunking was performed")
    chunking_version: str = Field(default="1.0.0", description="Chunking engine version")
    chunks: List[DocumentChunk] = Field(default_factory=list, description="Ordered retrieval-ready chunks")


class ChunkingManifestRecord(BaseModel):
    """Manifest record tracking chunking status for a standard in the 100-corpus."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="Standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Standard Encrypted ID")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Standard title")
    category: str = Field(..., description="Corpus category")

    source_pdf: Optional[str] = Field(default=None, description="Path to verified PDF if present")
    source_normalization_path: Optional[str] = Field(default=None, description="Path to normalized JSON if present")
    chunking_status: ChunkingStatus = Field(
        default=ChunkingStatus.NOT_CHUNKED,
        description="Chunking lifecycle state"
    )

    total_chunks: Optional[int] = Field(default=None, description="Total chunks produced")
    total_characters: Optional[int] = Field(default=None, description="Total characters across chunks")
    average_chunk_characters: Optional[float] = Field(default=None, description="Average chunk character length")
    sha256: Optional[str] = Field(default=None, description="Source PDF SHA-256 digest")
    output_path: Optional[str] = Field(default=None, description="Relative path to chunks JSON file")
    chunked_at: Optional[str] = Field(default=None, description="Chunking ISO timestamp")
    validation_issues: List[str] = Field(default_factory=list, description="Validation issues or warnings")


class ChunkingCategoryGroup(BaseModel):
    """Category grouping of chunking records."""
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Category name")
    standards: List[ChunkingManifestRecord] = Field(
        default_factory=list,
        description="Chunking records in this category"
    )


class ChunkingSummary(BaseModel):
    """Aggregate statistics for the chunking manifest."""
    model_config = ConfigDict(from_attributes=True)

    total_standards: int = Field(default=0)
    chunked_count: int = Field(default=0)
    not_chunked_count: int = Field(default=0)
    chunking_failed_count: int = Field(default=0)
    manual_review_count: int = Field(default=0)
    total_chunks_produced: int = Field(default=0)
    total_characters_chunked: int = Field(default=0)
    average_chunk_size: float = Field(default=0.0)


class CategoryChunkingBreakdown(BaseModel):
    """Category-level summary statistics for chunking."""
    model_config = ConfigDict(from_attributes=True)

    category_name: str = Field(..., description="Category name")
    total_standards: int = Field(default=0)
    chunked_count: int = Field(default=0)
    not_chunked_count: int = Field(default=0)
    total_chunks: int = Field(default=0)


class BISDocumentChunkingManifest(BaseModel):
    """Top-level BIS document chunking manifest."""
    model_config = ConfigDict(from_attributes=True)

    schema_version: str = Field(default="1.0.0")
    generated_at: str = Field(...)
    description: str = Field(
        default="Official chunking status and retrieval-ready chunk manifest for 100 BISaarthi MVP standards"
    )
    summary: ChunkingSummary = Field(default_factory=ChunkingSummary)
    categories_breakdown: List[CategoryChunkingBreakdown] = Field(default_factory=list)
    categories: List[ChunkingCategoryGroup] = Field(default_factory=list)
