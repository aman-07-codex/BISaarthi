import datetime
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SourceRef(BaseModel):
    """Source reference shape backing compliance data."""
    model_config = ConfigDict(from_attributes=True)

    source_id: Optional[uuid.UUID] = Field(default=None, description="UUID of source")
    title: str = Field(..., description="Title of authoritative document")
    reference_url: str = Field(..., description="URL of authoritative reference")
    reliability_tier: str = Field(..., description="Reliability tier (primary | secondary)")


class StandardSummary(BaseModel):
    """Summary of an Indian Standard for list views and search results."""
    model_config = ConfigDict(from_attributes=True)

    is_number: str = Field(..., description="Indian Standard identifier (e.g. IS 302 (Part 1))")
    title: str = Field(..., description="Title of the standard")
    status: str = Field(default="unknown", description="Standard status: active, superseded, withdrawn, under_revision, unknown")
    scope: Optional[str] = Field(default=None, description="Scope and applicability summary")
    publication_date: Optional[datetime.date] = Field(default=None, description="Date of publication")
    revision_info: Optional[str] = Field(default=None, description="Revision history or amendment info")
    categories: List[str] = Field(default_factory=list, description="Categories and domains")
    reason_selected: Optional[str] = Field(default=None, description="Rationale for inclusion in MVP corpus")
    primary_use_case: Optional[str] = Field(default=None, description="Primary industry/consumer use case")
    last_synced_at: Optional[datetime.datetime] = Field(default=None, description="Timestamp when standard was last synced")
    created_at: Optional[datetime.datetime] = Field(default=None, description="Record creation timestamp")
    updated_at: Optional[datetime.datetime] = Field(default=None, description="Record update timestamp")


class StandardDetail(StandardSummary):
    """Detailed canonical Indian Standard record."""
    primary_source_id: Optional[uuid.UUID] = Field(default=None, description="Primary source reference ID")
    primary_source: Optional[SourceRef] = Field(default=None, description="Primary authoritative source")


class StandardListResponse(BaseModel):
    """Paginated list of standards."""
    items: List[StandardSummary] = Field(default_factory=list, description="List of standard summaries")
    page: int = Field(default=1, ge=1, description="Current page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Number of items per page")
    total: int = Field(default=0, ge=0, description="Total matching standards count")


class StandardRequirementResponse(BaseModel):
    """Requirement associated with an Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Requirement ID")
    standard_is_number: str = Field(..., description="Associated standard IS number")
    category: str = Field(..., description="Requirement category (Safety, Performance, Marking, etc.)")
    requirement_text: str = Field(..., description="Full requirement text")
    source_id: Optional[uuid.UUID] = Field(default=None, description="Source reference ID")
    display_order: int = Field(default=0, description="Ordering priority")


class StandardRequirementsListResponse(BaseModel):
    """List of requirements for a specific standard."""
    standard_is_number: str = Field(..., description="Associated standard IS number")
    requirements: List[StandardRequirementResponse] = Field(default_factory=list, description="Requirements list")


class StandardTestResponse(BaseModel):
    """Compliance test associated with an Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Test ID")
    standard_is_number: str = Field(..., description="Associated standard IS number")
    test_name: str = Field(..., description="Name of the test")
    applicability: str = Field(default="unknown", description="Test applicability (mandatory | voluntary | unknown)")
    description: Optional[str] = Field(default=None, description="Detailed test description and parameters")
    source_id: Optional[uuid.UUID] = Field(default=None, description="Source reference ID")
    display_order: int = Field(default=0, description="Ordering priority")


class StandardTestsListResponse(BaseModel):
    """List of tests for a specific standard."""
    standard_is_number: str = Field(..., description="Associated standard IS number")
    tests: List[StandardTestResponse] = Field(default_factory=list, description="Tests list")


class RelatedStandardResponse(BaseModel):
    """Related Indian Standard reference."""
    model_config = ConfigDict(from_attributes=True)

    standard_is_number: str = Field(..., description="Parent standard IS number")
    related_is_number: str = Field(..., description="Related standard IS number")
    relation_note: Optional[str] = Field(default=None, description="Relationship note (companion, supersedes, etc.)")
    title: Optional[str] = Field(default=None, description="Title of the related standard")
    status: Optional[str] = Field(default=None, description="Status of the related standard")


class StandardRelatedListResponse(BaseModel):
    """List of related standards for a specific standard."""
    standard_is_number: str = Field(..., description="Associated standard IS number")
    related_standards: List[RelatedStandardResponse] = Field(default_factory=list, description="Related standards list")


class CertificationStepResponse(BaseModel):
    """Sequential certification step for acquiring compliance certification."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Step ID")
    standard_is_number: str = Field(..., description="Associated standard IS number")
    step_number: int = Field(..., description="Sequential step number (1, 2, 3...)")
    step_description: str = Field(..., description="Step description")
    source_id: Optional[uuid.UUID] = Field(default=None, description="Source reference ID")


class CertificationStepsListResponse(BaseModel):
    """List of certification steps for a specific standard."""
    standard_is_number: str = Field(..., description="Associated standard IS number")
    certification_steps: List[CertificationStepResponse] = Field(default_factory=list, description="Ordered certification steps")


class LaboratoryResponse(BaseModel):
    """Recognized testing laboratory."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Laboratory UUID")
    name: str = Field(..., description="Laboratory name")
    location: Optional[str] = Field(default=None, description="Location / Address")
    contact_info: Optional[Dict[str, Any]] = Field(default=None, description="Contact details (phone, email, address)")
    source_id: Optional[uuid.UUID] = Field(default=None, description="Source reference ID")
    created_at: Optional[datetime.datetime] = Field(default=None, description="Record creation timestamp")


class StandardLaboratoriesListResponse(BaseModel):
    """List of recognized testing laboratories for a standard."""
    standard_is_number: str = Field(..., description="Associated standard IS number")
    laboratories: List[LaboratoryResponse] = Field(default_factory=list, description="Laboratories list")


class SavedStandardResponse(BaseModel):
    """User bookmarked standard response."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Saved standard entry ID")
    user_id: uuid.UUID = Field(..., description="User ID")
    standard_is_number: str = Field(..., description="Saved Indian Standard IS number")
    saved_at: datetime.datetime = Field(..., description="Timestamp when bookmarked")
    standard: Optional[StandardSummary] = Field(default=None, description="Standard details")


class SavedStandardListResponse(BaseModel):
    """Paginated list of saved standards."""
    items: List[SavedStandardResponse] = Field(default_factory=list, description="Saved standards list")
    total: int = Field(default=0, ge=0, description="Total saved standards count")
    page: int = Field(default=1, ge=1, description="Current page")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")


class SaveStandardActionResponse(BaseModel):
    """Response returned when saving or unsaving a standard."""
    status: str = Field(..., description="Action status (saved | removed)")
    is_number: str = Field(..., description="IS Number of the standard")
    message: str = Field(..., description="Human-readable result message")
