"""Pydantic schemas for Phase 6A: RAG Synthesis & Context-Grounded Answering Engine."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.bis_retrieval import CitationReference, RetrievalMethod


class GroundingStatus(str, Enum):
    """Grounding classification for synthesized answers."""
    GROUNDED = "grounded"
    PARTIALLY_GROUNDED = "partially_grounded"
    UNSUPPORTED = "unsupported"
    INSUFFICIENT_CONTEXT = "insufficient_context"


class RAGLanguage(str, Enum):
    """Supported language preferences for RAG queries and responses."""
    EN = "en"
    HI = "hi"


class RAGContext(BaseModel):
    """Retrieved evidence context supplied to the prompt builder and LLM provider."""
    model_config = ConfigDict(from_attributes=True)

    chunk_id: str = Field(..., description="Referenced chunk identifier")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Standard title")
    category: str = Field(..., description="Standard category")
    chunk_type: str = Field(..., description="Semantic chunk type")
    section: Optional[str] = Field(default=None, description="Section heading or number")
    clause: Optional[str] = Field(default=None, description="Clause or subclause identifier")
    parent_clause: Optional[str] = Field(default=None, description="Parent clause identifier")
    annex_id: Optional[str] = Field(default=None, description="Annex identifier")
    table_id: Optional[str] = Field(default=None, description="Table identifier")
    source_pages: List[int] = Field(default_factory=list, description="Source PDF page numbers")
    source_pdf: Optional[str] = Field(default=None, description="Source PDF filename")
    source_pdf_sha256: str = Field(..., description="Cryptographic SHA-256 digest of source PDF")
    source_chunk_path: str = Field(..., description="Relative path to chunk file")
    text: str = Field(..., description="Normative text content of the chunk")
    citation: Optional[CitationReference] = Field(
        default=None,
        description="Structured citation reference"
    )


class RAGQuery(BaseModel):
    """Input query and retrieval parameters for context-grounded RAG synthesis."""
    model_config = ConfigDict(from_attributes=True)

    query_text: str = Field(..., min_length=1, description="Natural language user question")
    language: RAGLanguage = Field(
        default=RAGLanguage.EN,
        description="Requested language state for generation ('en' or 'hi')"
    )
    top_k: int = Field(default=5, ge=1, le=100, description="Maximum candidate chunks to retrieve")

    category: Optional[str] = Field(default=None, description="Optional category filter")
    is_number: Optional[str] = Field(default=None, description="Optional Indian Standard filter")
    clause: Optional[str] = Field(default=None, description="Optional clause filter")
    chunk_type: Optional[str] = Field(default=None, description="Optional chunk type filter")
    score_threshold: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Optional minimum retrieval score threshold"
    )
    retrieval_method: RetrievalMethod = Field(
        default=RetrievalMethod.HYBRID,
        description="Retrieval engine to employ"
    )
    max_context_chars: int = Field(
        default=12000,
        ge=500,
        description="Maximum character budget for assembled context"
    )


class GroundingValidationResult(BaseModel):
    """Detailed results of deterministic grounding validation on a generated answer."""
    model_config = ConfigDict(from_attributes=True)

    status: GroundingStatus = Field(..., description="Overall grounding status")
    grounded: bool = Field(..., description="True if status is strictly GROUNDED")
    supported_claims: List[str] = Field(
        default_factory=list,
        description="Claims verified against retrieved context"
    )
    unsupported_claims: List[str] = Field(
        default_factory=list,
        description="Claims lacking evidence in retrieved context"
    )
    citation_errors: List[str] = Field(
        default_factory=list,
        description="Citations pointing to nonexistent or mismatched chunks"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Validation advisories or caution flags"
    )


class RAGAnswer(BaseModel):
    """Final context-grounded answer payload returned by the BIS RAG engine."""
    model_config = ConfigDict(from_attributes=True)

    query: RAGQuery = Field(..., description="Original RAG query")
    answer_text: str = Field(..., description="Generated answer text")
    citations: List[CitationReference] = Field(
        default_factory=list,
        description="Traceable citations supporting the answer"
    )
    grounding_status: GroundingStatus = Field(..., description="Grounding status classification")
    grounded: bool = Field(..., description="True if answer is verified and grounded")
    retrieved_chunk_ids: List[str] = Field(
        default_factory=list,
        description="List of chunk IDs retrieved for context"
    )
    validation: GroundingValidationResult = Field(
        ...,
        description="Grounding validation report"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="General operational or domain warnings"
    )
    execution_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Timing, provider, and execution telemetry"
    )
