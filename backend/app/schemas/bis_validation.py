"""Pydantic schemas for BIS standard resolution, identity validation, and manifest validation reports."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ValidationStatus(str, Enum):
    """Validation status classification for a standard."""
    EXACT_MATCH = "exact_match"
    METADATA_CHANGED = "metadata_changed"
    MISSING_FROM_CURRENT_API = "missing_from_current_api"
    UNRESOLVED = "unresolved"
    REQUIRES_MANUAL_REVIEW = "requires_manual_review"


class StandardIdentity(BaseModel):
    """Normalized identity components of an Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    prefix: str = Field(default="IS", description="Standard prefix, e.g. IS, IS/IEC, IS/ISO")
    base_number: str = Field(..., description="Base standard number, e.g. 2082, 302, 2062")
    part_number: Optional[str] = Field(default=None, description="Part number, e.g. Part 1, Part 2")
    section_number: Optional[str] = Field(default=None, description="Section number, e.g. Sec 3, Sec 16")
    revision_year: Optional[str] = Field(default=None, description="Revision year string, e.g. 2018, 2024")
    normalized_key: str = Field(..., description="Normalized alphanumeric standard key for matching")


class StandardValidationResult(BaseModel):
    """Comprehensive validation result for a manifest standard against official BIS data."""
    model_config = ConfigDict(from_attributes=True)

    is_number: str = Field(..., description="Indian Standard identifier from manifest")
    manifest_standard_id: Optional[int] = Field(default=None, description="Standard ID recorded in manifest")
    manifest_standard_enc_id: Optional[str] = Field(default=None, description="Encrypted standard ID from manifest")
    manifest_title: Optional[str] = Field(default=None, description="Title recorded in manifest")
    manifest_category: Optional[str] = Field(default=None, description="Assigned category in manifest")

    resolved: bool = Field(default=False, description="Whether the standard was successfully resolved against BIS API")
    bis_standard_id: Optional[int] = Field(default=None, description="Official standard ID returned by BIS API")
    bis_standard_enc_id: Optional[str] = Field(default=None, description="Official encrypted standard ID from BIS API")
    bis_standard_number: Optional[str] = Field(default=None, description="Official standard number formatted by BIS")

    title: Optional[str] = Field(default=None, description="Official standard title from BIS")
    department: Optional[str] = Field(default=None, description="BIS Technical Department")
    committee: Optional[str] = Field(default=None, description="Sectional Committee")
    group: Optional[str] = Field(default=None, description="Top-level group name if available")
    subgroup: Optional[str] = Field(default=None, description="Sub-group name if available")
    type: Optional[str] = Field(default=None, description="Type of standard (e.g. Product Specification)")
    status: Optional[str] = Field(default=None, description="Official BIS status (e.g. Active / Published)")
    publication_date: Optional[str] = Field(default=None, description="Publication date (YYYY-MM-DD)")
    formatted_date: Optional[str] = Field(default=None, description="Formatted publication date (e.g. 30 Apr 2018)")
    review_or_reaffirmation: Optional[str] = Field(default=None, description="Review or reaffirmation status/date")
    certification: Optional[Dict[str, Any]] = Field(default=None, description="Laboratory and license summary")

    metadata_match: bool = Field(default=False, description="Whether key manifest metadata exactly matches BIS API")
    validation_status: ValidationStatus = Field(
        default=ValidationStatus.UNRESOLVED,
        description="Categorization of the validation outcome"
    )
    issues: List[str] = Field(default_factory=list, description="List of warnings, mismatches, or notes")


class CategoryValidationCount(BaseModel):
    """Validation metrics for a specific category."""
    model_config = ConfigDict(from_attributes=True)

    category_name: str = Field(..., description="Category name")
    manifest_count: int = Field(default=0, description="Number of standards in manifest")
    resolved_count: int = Field(default=0, description="Successfully resolved standards")
    exact_match_count: int = Field(default=0, description="Exact match count")
    metadata_changed_count: int = Field(default=0, description="Metadata changed count")
    requires_review_count: int = Field(default=0, description="Standards requiring review")
    unresolved_count: int = Field(default=0, description="Unresolved count")


class ManifestIntegrityResult(BaseModel):
    """Integrity checks for the manifest itself."""
    model_config = ConfigDict(from_attributes=True)

    is_valid: bool = Field(default=True, description="Whether manifest structure and rules are valid")
    total_standards: int = Field(default=0, description="Total standards in manifest")
    approved_categories_present: List[str] = Field(default_factory=list)
    unexpected_categories: List[str] = Field(default_factory=list)
    duplicate_is_numbers: List[str] = Field(default_factory=list)
    duplicate_standard_ids: List[int] = Field(default_factory=list)
    duplicate_standard_enc_ids: List[str] = Field(default_factory=list)
    missing_required_fields: List[str] = Field(default_factory=list)


class ManifestValidationSummary(BaseModel):
    """Complete summary of a manifest validation run."""
    model_config = ConfigDict(from_attributes=True)

    validation_timestamp: str = Field(..., description="ISO timestamp of validation run")
    manifest_version: str = Field(default="1.0", description="Manifest version")
    manifest_file: str = Field(..., description="Path or name of manifest file")
    total_manifest_standards: int = Field(default=0, description="Total standards processed")
    resolved_count: int = Field(default=0, description="Total resolved count")
    unresolved_count: int = Field(default=0, description="Total unresolved count")
    exact_match_count: int = Field(default=0, description="Total exact match count")
    metadata_changed_count: int = Field(default=0, description="Total metadata changed count")
    requires_review_count: int = Field(default=0, description="Total standards requiring review")
    warnings: List[str] = Field(default_factory=list, description="Global warnings")
    errors: List[str] = Field(default_factory=list, description="Global errors")
    category_summary: List[CategoryValidationCount] = Field(default_factory=list)
    results: List[StandardValidationResult] = Field(default_factory=list)
