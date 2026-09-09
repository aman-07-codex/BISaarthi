"""Pydantic schemas for Phase 3B: Official BIS Document Acquisition & Verification."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class VerificationStatus(str, Enum):
    """Controlled status of document verification."""
    VERIFIED = "verified"
    REJECTED = "rejected"
    PENDING_VERIFICATION = "pending_verification"
    NOT_ACQUIRED = "not_acquired"
    MANUAL_REVIEW = "manual_review"


class AcquisitionStatus(str, Enum):
    """Lifecycle acquisition status."""
    NOT_ACQUIRED = "not_acquired"
    QUARANTINED = "quarantined"
    ACQUIRED = "acquired"
    REJECTED = "rejected"


class IdentityConfidence(str, Enum):
    """Confidence level of the verified standard identity match."""
    HIGH = "high"
    MEDIUM = "medium"
    NONE = "none"


class BISDocumentAcquisitionRecord(BaseModel):
    """Acquisition and verification record for an Indian Standard in the corpus."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="BIS standard ID from manifest")
    standard_enc_id: Optional[str] = Field(default=None, description="BIS encrypted standard ID")
    is_number: str = Field(..., description="Indian Standard identifier from manifest")
    title: Optional[str] = Field(default=None, description="Official title of the standard")
    category: str = Field(..., description="Corpus manifest category")

    acquisition_status: AcquisitionStatus = Field(
        default=AcquisitionStatus.NOT_ACQUIRED,
        description="Current acquisition state in local staging"
    )
    acquisition_method: str = Field(
        default="official_portal_manual",
        description="Legitimate acquisition channel (e.g. official_portal_manual)"
    )
    official_source: str = Field(
        default="BIS",
        description="Official issuing authority"
    )

    local_path: Optional[str] = Field(
        default=None,
        description="Relative path to verified document file if acquired"
    )
    file_name: Optional[str] = Field(
        default=None,
        description="Standardized filename of the document"
    )
    file_size_bytes: Optional[int] = Field(
        default=None,
        description="Verified file size in bytes"
    )
    sha256: Optional[str] = Field(
        default=None,
        description="Cryptographic SHA-256 digest of document body"
    )
    mime_type: Optional[str] = Field(
        default="application/pdf",
        description="Verified MIME type"
    )
    acquired_at: Optional[str] = Field(
        default=None,
        description="ISO timestamp of acquisition/verification"
    )

    verification_status: VerificationStatus = Field(
        default=VerificationStatus.NOT_ACQUIRED,
        description="Result of verification engine"
    )
    verification_reasons: List[str] = Field(
        default_factory=list,
        description="Verification audit logs or rejection explanations"
    )
    identity_match_confidence: IdentityConfidence = Field(
        default=IdentityConfidence.NONE,
        description="Confidence of standard identity match"
    )

    provenance: str = Field(
        default="Official BIS Portal / Manakonline Repository",
        description="Source provenance attribution"
    )
    redistribution_restricted: bool = Field(
        default=True,
        description="Strict copyright flag prohibiting public binary redistribution"
    )
    license_note: str = Field(
        default="Restricted official Bureau of Indian Standards publication; internal RAG analysis only.",
        description="License and compliance usage terms"
    )


class AcquisitionCategoryGroup(BaseModel):
    """Category grouping of acquisition records."""
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Category name")
    standards: List[BISDocumentAcquisitionRecord] = Field(
        default_factory=list,
        description="Acquisition records within category"
    )


class AcquisitionSummary(BaseModel):
    """Aggregate statistics for acquisition manifest."""
    model_config = ConfigDict(from_attributes=True)

    total_standards: int = Field(default=0)
    verified_count: int = Field(default=0)
    quarantined_count: int = Field(default=0)
    not_acquired_count: int = Field(default=0)
    rejected_count: int = Field(default=0)
    manual_review_count: int = Field(default=0)
    redistribution_restricted_count: int = Field(default=0)


class CategoryAcquisitionBreakdown(BaseModel):
    """Category-level summary statistics."""
    model_config = ConfigDict(from_attributes=True)

    category_name: str = Field(..., description="Category name")
    total_standards: int = Field(default=0)
    verified_count: int = Field(default=0)
    not_acquired_count: int = Field(default=0)
    rejected_count: int = Field(default=0)


class BISDocumentAcquisitionManifest(BaseModel):
    """Top-level BIS document acquisition manifest."""
    model_config = ConfigDict(from_attributes=True)

    version: str = Field(default="1.0", description="Manifest version")
    purpose: str = Field(
        default="BISaarthi MVP Official BIS Document Acquisition Manifest",
        description="Manifest purpose"
    )
    source_corpus: str = Field(
        default="bis_mvp_corpus_manifest.json",
        description="Authoritative corpus manifest reference"
    )
    total_standards: int = Field(default=0, description="Total standards tracked")
    acquisition_timestamp: str = Field(..., description="Manifest timestamp")
    summary: AcquisitionSummary = Field(..., description="Aggregate summary metrics")
    category_breakdown: List[CategoryAcquisitionBreakdown] = Field(
        default_factory=list,
        description="Category breakdown"
    )
    categories: List[AcquisitionCategoryGroup] = Field(
        default_factory=list,
        description="Category groups containing acquisition records"
    )
