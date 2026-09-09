"""Pydantic schemas for Phase 3A: Official BIS Document Acquisition Reconnaissance."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AccessType(str, Enum):
    """Controlled classification of document access type."""
    PUBLIC = "public"
    AUTHENTICATED = "authenticated"
    PAID = "paid"
    MANUAL = "manual"
    UNKNOWN = "unknown"
    NOT_EXPOSED = "not_exposed"


class AcquisitionMethod(str, Enum):
    """Controlled classification of legitimate acquisition method."""
    PUBLIC_API = "public_api"
    PUBLIC_WEB_PAGE = "public_web_page"
    PUBLIC_DOCUMENT_ENDPOINT = "public_document_endpoint"
    OFFICIAL_PORTAL_MANUAL = "official_portal_manual"
    MANUAL_REVIEW = "manual_review"
    NOT_AVAILABLE = "not_available"


class AcquisitionCategory(str, Enum):
    """Authoritative acquisition conclusion categories."""
    PUBLIC_AUTOMATABLE = "PUBLIC_AUTOMATABLE"
    PUBLIC_MANUAL = "PUBLIC_MANUAL"
    AUTHENTICATED = "AUTHENTICATED"
    PAID_OR_LICENSED = "PAID_OR_LICENSED"
    NOT_EXPOSED = "NOT_EXPOSED"
    UNKNOWN = "UNKNOWN"


class StandardAcquisitionAssessment(BaseModel):
    """Detailed acquisition reconnaissance record for a single Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="BIS standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="BIS encrypted standard ID")
    is_number: str = Field(..., description="Indian Standard identifier from manifest")
    title: Optional[str] = Field(default=None, description="Standard title")
    category: Optional[str] = Field(default=None, description="Corpus manifest category")

    current_discovery_status: str = Field(
        default="not_exposed_by_api",
        description="Phase 2B discovery status reference"
    )

    document_reference_found: bool = Field(
        default=False,
        description="Whether an explicit document URL or reference was observed"
    )
    document_reference_type: Optional[str] = Field(
        default=None,
        description="Type of document reference observed (e.g. PDF, portal_view, None)"
    )
    document_url: Optional[str] = Field(
        default=None,
        description="Observed official document URL (null if not exposed)"
    )

    official_source: str = Field(
        default="BIS",
        description="Official authority or infrastructure"
    )
    access_type: AccessType = Field(
        default=AccessType.NOT_EXPOSED,
        description="Access type classification"
    )
    authentication_required: bool = Field(
        default=False,
        description="Whether accessing the official document requires legitimate authentication"
    )
    payment_required: bool = Field(
        default=False,
        description="Whether accessing the official document requires license purchase"
    )
    public_download_available: bool = Field(
        default=False,
        description="Whether public unauthenticated direct download is available"
    )
    automatable: bool = Field(
        default=False,
        description="Whether legitimate automated acquisition is feasible without bypassing controls"
    )

    acquisition_method: AcquisitionMethod = Field(
        default=AcquisitionMethod.NOT_AVAILABLE,
        description="Legitimate acquisition method"
    )
    acquisition_category: AcquisitionCategory = Field(
        default=AcquisitionCategory.NOT_EXPOSED,
        description="Top-level acquisition conclusion"
    )

    evidence: Optional[str] = Field(
        default=None,
        description="Observed technical evidence (e.g. verified_api_field, verified_portal_behavior)"
    )
    confidence: str = Field(
        default="high",
        description="Confidence of assessment"
    )
    notes: List[str] = Field(
        default_factory=list,
        description="Reconnaissance findings and access notes"
    )


class AcquisitionCategorySummary(BaseModel):
    """Category breakdown counts for acquisition."""
    model_config = ConfigDict(from_attributes=True)

    category_name: str = Field(..., description="Corpus category name")
    total_standards: int = Field(default=0)
    public_automatable_count: int = Field(default=0)
    public_manual_count: int = Field(default=0)
    authenticated_count: int = Field(default=0)
    paid_or_licensed_count: int = Field(default=0)
    not_exposed_count: int = Field(default=0)
    unknown_count: int = Field(default=0)


class AcquisitionReconSummary(BaseModel):
    """Aggregated acquisition summary counts."""
    model_config = ConfigDict(from_attributes=True)

    total_standards: int = Field(default=0)
    public_automatable: int = Field(default=0)
    public_manual: int = Field(default=0)
    authenticated: int = Field(default=0)
    paid_or_licensed: int = Field(default=0)
    not_exposed: int = Field(default=0)
    unknown: int = Field(default=0)

    official_references_discovered: int = Field(default=0)
    public_automated_candidates: int = Field(default=0)
    manual_acquisition_candidates: int = Field(default=0)
    requiring_authentication: int = Field(default=0)
    requiring_paid_or_licensed: int = Field(default=0)


class AcquisitionReconReport(BaseModel):
    """Complete report schema for Phase 3A Official BIS Document Acquisition Reconnaissance."""
    model_config = ConfigDict(from_attributes=True)

    version: str = Field(default="1.0", description="Report version")
    purpose: str = Field(
        default="BISaarthi MVP Official BIS Document Acquisition Reconnaissance",
        description="Report purpose"
    )
    source_corpus: str = Field(
        default="bis_mvp_corpus_manifest.json",
        description="Source corpus manifest reference"
    )
    total_standards: int = Field(default=0, description="Total standards evaluated")
    reconnaissance_timestamp: str = Field(..., description="Timestamp of reconnaissance evaluation")
    summary: AcquisitionReconSummary = Field(..., description="Aggregate summary metrics")
    category_breakdown: List[AcquisitionCategorySummary] = Field(
        default_factory=list,
        description="Breakdown by corpus category"
    )
    assessments: List[StandardAcquisitionAssessment] = Field(
        default_factory=list,
        description="List of assessments for all 100 manifest standards"
    )
