"""Pydantic schemas for BIS document discovery, classification, and manifest generation."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DiscoveryStatus(str, Enum):
    """Controlled vocabulary for document discovery status."""
    AVAILABLE = "available"
    NOT_FOUND = "not_found"
    NOT_EXPOSED_BY_API = "not_exposed_by_api"
    REQUIRES_MANUAL_REVIEW = "requires_manual_review"
    API_ERROR = "api_error"


class DiscoveryConfidence(str, Enum):
    """Confidence level of the discovered document association."""
    HIGH = "high"
    MEDIUM = "medium"


class PriorityLevel(str, Enum):
    """MVP priority tier for subsequent ingestion/acquisition."""
    HIGH = "high"
    MEDIUM = "medium"


class BISDocumentRecord(BaseModel):
    """Document discovery record for an Indian Standard from the corpus manifest."""
    model_config = ConfigDict(from_attributes=True)

    is_number: str = Field(..., description="Indian Standard identifier from manifest, e.g. IS 2082:2018")
    standard_id: Optional[int] = Field(default=None, description="BIS standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="BIS encrypted standard ID")
    title: Optional[str] = Field(default=None, description="Official title of the standard")
    category: Optional[str] = Field(default=None, description="Assigned MVP category")

    document_available: bool = Field(
        default=False,
        description="Whether a direct official document reference/URL is available"
    )
    document_type: Optional[str] = Field(
        default=None,
        description="Document type if resolved (e.g. PDF)"
    )
    document_url: Optional[str] = Field(
        default=None,
        description="Official BIS document URL or null if not exposed"
    )
    source: str = Field(
        default="BIS",
        description="Official source authority"
    )
    document_identifier: Optional[str] = Field(
        default=None,
        description="Official document or file identifier if exposed by BIS"
    )

    discovery_status: DiscoveryStatus = Field(
        default=DiscoveryStatus.NOT_EXPOSED_BY_API,
        description="Status of document discovery"
    )
    discovery_confidence: Optional[DiscoveryConfidence] = Field(
        default=None,
        description="Confidence level of document match"
    )

    download_status: str = Field(
        default="not_downloaded",
        description="State of acquisition pipeline (always 'not_downloaded' in Phase 2B)"
    )
    extraction_status: str = Field(
        default="pending",
        description="State of text extraction pipeline (always 'pending' in Phase 2B)"
    )

    priority: PriorityLevel = Field(
        default=PriorityLevel.MEDIUM,
        description="Acquisition priority for MVP demo scenarios"
    )

    source_endpoint: Optional[str] = Field(
        default=None,
        description="Official BIS API endpoint queried for discovery"
    )
    discovery_timestamp: Optional[str] = Field(
        default=None,
        description="ISO timestamp when document discovery was performed"
    )

    issues: List[str] = Field(
        default_factory=list,
        description="Notes, warnings, or review justifications"
    )


class DocumentCategoryGroup(BaseModel):
    """Category group containing standard document discovery records."""
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Category name")
    standards: List[BISDocumentRecord] = Field(
        default_factory=list,
        description="List of document records in this category"
    )


class DocumentManifestSummary(BaseModel):
    """Aggregated discovery summary metrics."""
    model_config = ConfigDict(from_attributes=True)

    available: int = Field(default=0, description="Documents available with official reference")
    not_found: int = Field(default=0, description="Standards not found in catalogue")
    not_exposed_by_api: int = Field(default=0, description="Standard found but document not exposed by API")
    requires_manual_review: int = Field(default=0, description="Records requiring manual review")
    api_error: int = Field(default=0, description="Discovery attempts resulting in API error")
    high_priority_count: int = Field(default=0, description="Total high priority documents")
    medium_priority_count: int = Field(default=0, description="Total medium priority documents")


class CategoryDocumentBreakdown(BaseModel):
    """Summary metrics per category."""
    model_config = ConfigDict(from_attributes=True)

    category_name: str = Field(..., description="Name of category")
    total_standards: int = Field(default=0, description="Total standards in category")
    available_count: int = Field(default=0, description="Available documents count")
    not_exposed_count: int = Field(default=0, description="Not exposed by API count")
    manual_review_count: int = Field(default=0, description="Requires manual review count")
    high_priority_count: int = Field(default=0, description="High priority count")


class BISDocumentManifest(BaseModel):
    """Top-level BISaarthi official BIS document manifest."""
    model_config = ConfigDict(from_attributes=True)

    version: str = Field(default="1.0", description="Document manifest schema version")
    purpose: str = Field(
        default="BISaarthi MVP official BIS document manifest",
        description="Manifest purpose"
    )
    source_corpus: str = Field(
        default="bis_mvp_corpus_manifest.json",
        description="Source corpus manifest reference"
    )
    total_standards: int = Field(default=0, description="Total evaluated standards")
    document_discovery_timestamp: str = Field(..., description="Timestamp of discovery run")
    summary: DocumentManifestSummary = Field(..., description="Aggregated summary counts")
    category_breakdown: List[CategoryDocumentBreakdown] = Field(
        default_factory=list,
        description="Category level breakdown"
    )
    categories: List[DocumentCategoryGroup] = Field(
        default_factory=list,
        description="List of categories and document records"
    )
