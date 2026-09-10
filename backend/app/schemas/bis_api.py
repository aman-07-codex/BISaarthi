"""Pydantic schemas for Phase 7A: FastAPI MVP Backend Integration."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.bis_rag import GroundingStatus, RAGLanguage
from app.schemas.bis_retrieval import CitationReference, RetrievalMethod


class StandardListItem(BaseModel):
    """Authoritative standard summary item for Find Standards listing."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="Unique standard integer ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Encrypted BIS standard identifier")
    is_number: str = Field(..., description="Indian Standard number (e.g. 'IS 2082:2018')")
    title: str = Field(..., description="Official title of the standard")
    category: str = Field(..., description="Corpus category name")
    department: Optional[str] = Field(default=None, description="BIS Department")
    committee: Optional[str] = Field(default=None, description="Technical Committee")
    type: Optional[str] = Field(default=None, description="Standard publication type")
    status: Optional[str] = Field(default=None, description="Publication status")
    document_available: bool = Field(default=False, description="Whether legitimate document has been acquired")
    reason_selected: Optional[str] = Field(default=None, description="Rationale for inclusion in MVP corpus")
    primary_use_case: Optional[str] = Field(default=None, description="Primary industry/consumer use case")
    why_applicable: Optional[str] = Field(default=None, description="Why this standard applies to query")


class StandardSearchResponse(BaseModel):
    """Paginated search response for Find Standards."""
    model_config = ConfigDict(from_attributes=True)

    items: List[StandardListItem] = Field(default_factory=list, description="List of standard items")
    page: int = Field(default=1, ge=1, description="Current page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")
    total: int = Field(default=0, ge=0, description="Total matching standards")
    total_pages: int = Field(default=1, ge=1, description="Total pages available")


class StandardDetailsResponse(BaseModel):
    """Detailed metadata view for a specific Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="Unique standard integer ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Encrypted BIS standard identifier")
    is_number: str = Field(..., description="Indian Standard number")
    title: str = Field(..., description="Official title")
    category: str = Field(..., description="Corpus category")
    categories: List[str] = Field(default_factory=list, description="Category list for compatibility")
    department: Optional[str] = Field(default=None, description="BIS Department")
    committee: Optional[str] = Field(default=None, description="Technical Committee")
    type: Optional[str] = Field(default=None, description="Standard publication type")
    status: Optional[str] = Field(default=None, description="Publication status")
    publication_date: Optional[str] = Field(default=None, description="Publication date ISO")
    formatted_date: Optional[str] = Field(default=None, description="Human readable date")
    bis_url: Optional[str] = Field(default=None, description="Official BIS portal reference URL")
    document_available: bool = Field(default=False, description="Document acquisition status")
    selection_confidence: Optional[str] = Field(default=None, description="Corpus selection confidence")
    reason_selected: Optional[str] = Field(default=None, description="Rationale for inclusion in MVP corpus")
    primary_use_case: Optional[str] = Field(default=None, description="Primary industry/consumer use case")
    why_applicable: Optional[str] = Field(default=None, description="Contextual applicability rationale")
    scope: Optional[str] = Field(default=None, description="Scope description")
    revision_info: Optional[str] = Field(default=None, description="Revision information")
    related_selected_standards: List[str] = Field(
        default_factory=list,
        description="Cross-referenced standard numbers"
    )

    def model_post_init(self, __context: Any) -> None:
        if not self.categories and self.category:
            self.categories = [self.category]
        if not self.scope and self.primary_use_case:
            self.scope = self.primary_use_case
        if not self.revision_info and self.type:
            self.revision_info = self.type


class CompareStandardsRequest(BaseModel):
    """Request payload to compare two Indian Standards."""
    model_config = ConfigDict(from_attributes=True)

    standard_a: str = Field(..., min_length=1, description="First IS number or standard ID")
    standard_b: str = Field(..., min_length=1, description="Second IS number or standard ID")


class ComparisonFieldMatch(BaseModel):
    """Comparison evaluation between two standards on a specific metadata field."""
    same: bool = Field(..., description="Whether both standards share the same value")
    a: Optional[str] = Field(default=None, description="Value for standard A")
    b: Optional[str] = Field(default=None, description="Value for standard B")


class CompareStandardsResponse(BaseModel):
    """Structured response comparing two Indian Standards."""
    model_config = ConfigDict(from_attributes=True)

    standard_a: StandardDetailsResponse = Field(..., description="Full metadata for Standard A")
    standard_b: StandardDetailsResponse = Field(..., description="Full metadata for Standard B")
    comparison: Dict[str, ComparisonFieldMatch] = Field(
        default_factory=dict,
        description="Field-by-field comparative analysis"
    )
    document_technical_comparison_available: bool = Field(
        default=False,
        description="Whether full-text technical clause differences are available"
    )
    message: str = Field(..., description="Summary message regarding comparison capability")
    comparison_summary: Optional[str] = Field(
        default=None,
        description="Natural-language comparison of application domains based on authoritative metadata"
    )
    relevance_hint: Optional[str] = Field(
        default=None,
        description="Directional guidance note on use-case applicability when supported by metadata"
    )


class ChatRequest(BaseModel):
    """Request payload for the context-grounded AI Chatbot endpoint."""
    model_config = ConfigDict(from_attributes=True)

    message: str = Field(..., min_length=1, description="User question or query")
    language: RAGLanguage = Field(
        default=RAGLanguage.EN,
        description="Requested answer language ('en' or 'hi')"
    )
    top_k: int = Field(default=5, ge=1, le=100, description="Max candidate chunks to retrieve")
    category: Optional[str] = Field(default=None, description="Optional category filter")
    is_number: Optional[str] = Field(default=None, description="Optional standard filter")
    clause: Optional[str] = Field(default=None, description="Optional clause filter")
    chunk_type: Optional[str] = Field(default=None, description="Optional chunk type filter")
    score_threshold: Optional[float] = Field(default=None, ge=0.0, description="Minimum retrieval score")
    retrieval_method: RetrievalMethod = Field(
        default=RetrievalMethod.HYBRID,
        description="Retrieval engine to employ"
    )


class ChatResponse(BaseModel):
    """Response payload returned by the AI Chatbot endpoint."""
    model_config = ConfigDict(from_attributes=True)

    answer: str = Field(..., description="Synthesized technical response")
    language: RAGLanguage = Field(..., description="Response language")
    grounding_status: GroundingStatus = Field(..., description="Grounding status classification")
    grounded: bool = Field(..., description="True if answer is verified and supported")
    citations: List[CitationReference] = Field(
        default_factory=list,
        description="Verifiable source citations"
    )
    retrieved_chunk_ids: List[str] = Field(
        default_factory=list,
        description="List of chunk IDs in retrieved context"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Operational warnings or domain advisories"
    )
    execution_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Execution latency and provider telemetry"
    )
