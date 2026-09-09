"""Pydantic schemas for Phase 5B: Retrieval Architecture & Hybrid Search Interface."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RetrievalMethod(str, Enum):
    """Supported retrieval methodologies."""
    KEYWORD = "keyword"
    DENSE = "dense"
    HYBRID = "hybrid"


class RetrievalQuery(BaseModel):
    """Query model for retrieving relevant standard chunks."""
    model_config = ConfigDict(from_attributes=True)

    query_text: str = Field(..., min_length=1, description="Natural language search or keyword query")
    top_k: int = Field(default=5, ge=1, le=100, description="Maximum candidate chunks to return")

    category: Optional[str] = Field(default=None, description="Filter by corpus category")
    standard_id: Optional[int] = Field(default=None, description="Filter by standard ID")
    is_number: Optional[str] = Field(default=None, description="Filter by Indian Standard number")
    clause: Optional[str] = Field(default=None, description="Filter by clause identifier")
    chunk_type: Optional[str] = Field(default=None, description="Filter by chunk type (e.g. 'clause', 'table')")

    score_threshold: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Minimum score threshold for returned candidates"
    )
    retrieval_method: RetrievalMethod = Field(
        default=RetrievalMethod.HYBRID,
        description="Retrieval engine to employ"
    )

    rrf_k: int = Field(
        default=60,
        ge=1,
        description="Reciprocal Rank Fusion smoothing parameter constant"
    )
    dense_weight: float = Field(default=1.0, ge=0.0, description="Relative weight for dense retrieval")
    keyword_weight: float = Field(default=1.0, ge=0.0, description="Relative weight for keyword retrieval")


class CitationReference(BaseModel):
    """Audit-ready source reference linking a candidate chunk to its source PDF."""
    model_config = ConfigDict(from_attributes=True)

    citation_id: str = Field(..., description="Unique identifier for citation in response")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Standard title")
    section: Optional[str] = Field(default=None, description="Section heading or number")
    clause: Optional[str] = Field(default=None, description="Clause or subclause number")
    source_pages: List[int] = Field(default_factory=list, description="Source PDF page numbers")
    chunk_id: str = Field(..., description="Referenced chunk identifier")
    source_chunk_path: Optional[str] = Field(default=None, description="Relative path to chunk JSON")
    source_pdf_sha256: Optional[str] = Field(default=None, description="Cryptographic SHA-256 digest of source PDF")
    formatted_citation: str = Field(..., description="Human-readable citation string")


class RetrievalCandidate(BaseModel):
    """A matched standard chunk returned by the retrieval engine."""
    model_config = ConfigDict(from_attributes=True)

    chunk_id: str = Field(..., description="Unique chunk identifier")
    standard_id: Optional[int] = Field(default=None, description="Standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Standard Encrypted ID")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Standard title")
    category: str = Field(..., description="Corpus category")

    chunk_type: str = Field(..., description="Chunk semantic type")
    section: Optional[str] = Field(default=None, description="Section number")
    section_title: Optional[str] = Field(default=None, description="Section title")
    clause: Optional[str] = Field(default=None, description="Clause number")
    clause_title: Optional[str] = Field(default=None, description="Clause title")
    parent_clause: Optional[str] = Field(default=None, description="Parent clause number")
    annex_id: Optional[str] = Field(default=None, description="Annex identifier")
    table_id: Optional[str] = Field(default=None, description="Table identifier")

    source_pages: List[int] = Field(default_factory=list, description="Source PDF pages")
    source_pdf: str = Field(..., description="Relative path to source PDF")
    source_pdf_sha256: str = Field(..., description="Source PDF SHA-256 digest")
    source_chunk_path: str = Field(..., description="Relative path to chunk file")
    text: str = Field(..., description="Text content of the chunk")

    score: float = Field(..., description="Overall combined or normalized retrieval score")
    dense_score: Optional[float] = Field(default=None, description="Cosine similarity score from dense search")
    keyword_score: Optional[float] = Field(default=None, description="Lexical BM25 score from keyword search")
    dense_rank: Optional[int] = Field(default=None, description="1-indexed rank in dense retrieval")
    keyword_rank: Optional[int] = Field(default=None, description="1-indexed rank in keyword retrieval")

    retrieval_methods: List[RetrievalMethod] = Field(
        default_factory=list,
        description="Methods through which this candidate was retrieved"
    )
    citation: Optional[CitationReference] = Field(
        default=None,
        description="Structured citation reference for this candidate"
    )


class RetrievalResponse(BaseModel):
    """Complete response payload for a retrieval query."""
    model_config = ConfigDict(from_attributes=True)

    query: RetrievalQuery = Field(..., description="Query object that generated this response")
    results: List[RetrievalCandidate] = Field(
        default_factory=list,
        description="Ranked candidate chunks meeting query criteria"
    )
    total_candidates: int = Field(default=0, ge=0, description="Total matching candidates found")
    retrieval_methods_used: List[RetrievalMethod] = Field(
        default_factory=list,
        description="Retrieval methodologies active during execution"
    )
    filters_applied: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata filters enforced during retrieval"
    )
    citations: List[CitationReference] = Field(
        default_factory=list,
        description="Unique citations generated for the returned candidates"
    )
    execution_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Engine timing and execution details"
    )
