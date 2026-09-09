"""Pydantic schemas for Phase 4B: Text Normalization & Corpus-Ready Representation."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class NormalizationStatus(str, Enum):
    """Lifecycle status of document text normalization."""
    NORMALIZED = "normalized"
    NOT_NORMALIZED = "not_normalized"
    NORMALIZATION_FAILED = "normalization_failed"
    REQUIRES_MANUAL_REVIEW = "requires_manual_review"


class NormalizationQuality(str, Enum):
    """Quality classification of normalized document text."""
    GOOD = "good"
    WARNING = "warning"
    REQUIRES_MANUAL_REVIEW = "requires_manual_review"


class NormalizedPage(BaseModel):
    """Structured normalization representation for an individual page."""
    model_config = ConfigDict(from_attributes=True)

    page_number: int = Field(..., ge=1, description="1-indexed physical page number from PDF/extraction")
    source_text: str = Field(..., description="Verbatim raw text extracted in Phase 4A")
    normalized_text: str = Field(..., description="Cleaned, normalized, machine-readable text")
    source_character_count: int = Field(default=0, ge=0, description="Raw character count before normalization")
    normalized_character_count: int = Field(default=0, ge=0, description="Character count after normalization")
    character_retention_ratio: float = Field(
        default=1.0,
        ge=0.0,
        description="Ratio of normalized characters to source characters"
    )
    detected_headings: List[str] = Field(
        default_factory=list,
        description="Clause numbers or section headings detected on this page"
    )
    removed_header_footer_lines: List[str] = Field(
        default_factory=list,
        description="Repetitive running header or footer lines stripped from this page"
    )
    status: str = Field(default="success", description="Page status ('success', 'empty', 'warning')")


class NormalizedDocumentOutput(BaseModel):
    """Corpus-ready structured representation of a normalized Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="BIS standard ID from corpus manifest")
    standard_enc_id: Optional[str] = Field(default=None, description="BIS encrypted standard ID")
    is_number: str = Field(..., description="Authoritative Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Official title of the standard")
    category: str = Field(..., description="Corpus category")

    source_extraction_file: str = Field(..., description="Relative path to Phase 4A extraction JSON file")
    source_pdf: str = Field(..., description="Relative path to verified source PDF")
    source_pdf_sha256: str = Field(..., description="Cryptographic SHA-256 digest of original source PDF")

    source_total_character_count: int = Field(default=0, ge=0, description="Total characters before normalization")
    normalized_total_character_count: int = Field(default=0, ge=0, description="Total characters after normalization")
    character_retention_ratio: float = Field(
        default=1.0,
        ge=0.0,
        description="Overall document character retention ratio"
    )

    page_count: int = Field(..., ge=0, description="Total physical pages in document")
    normalized_page_count: int = Field(default=0, ge=0, description="Number of pages with normalized text")

    normalization_status: NormalizationStatus = Field(
        default=NormalizationStatus.NORMALIZED,
        description="Overall normalization lifecycle state"
    )
    normalization_quality: NormalizationQuality = Field(
        default=NormalizationQuality.GOOD,
        description="Quality classification based on conservation rules"
    )

    detected_headings_count: int = Field(
        default=0,
        ge=0,
        description="Total detected clause numbers and section headings"
    )
    detected_headings: List[str] = Field(
        default_factory=list,
        description="Sample or list of detected section headings and clause identifiers"
    )
    normalization_rules_applied: List[str] = Field(
        default_factory=list,
        description="List of transformation and cleanup rules applied"
    )

    issues: List[str] = Field(default_factory=list, description="Warnings, conservation notes, or issues")
    normalized_at: str = Field(..., description="ISO timestamp when normalization was performed")
    normalization_version: str = Field(default="1.0.0", description="Normalization algorithm version")
    pages: List[NormalizedPage] = Field(default_factory=list, description="Page-by-page normalized content")


class NormalizationManifestRecord(BaseModel):
    """Manifest record tracking normalization status for a standard in the 100-corpus."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="Standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Standard Encrypted ID")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Standard title")
    category: str = Field(..., description="Corpus category")

    source_pdf: Optional[str] = Field(default=None, description="Path to verified PDF if present")
    source_extraction_file: Optional[str] = Field(default=None, description="Path to extracted JSON if present")
    normalization_status: NormalizationStatus = Field(
        default=NormalizationStatus.NOT_NORMALIZED,
        description="Normalization lifecycle state"
    )
    normalization_quality: Optional[NormalizationQuality] = Field(
        default=None,
        description="Quality classification if normalized"
    )

    page_count: Optional[int] = Field(default=None, description="Total physical pages")
    source_character_count: Optional[int] = Field(default=None, description="Raw extracted characters")
    normalized_character_count: Optional[int] = Field(default=None, description="Normalized characters")
    character_retention_ratio: Optional[float] = Field(default=None, description="Character retention ratio")
    sha256: Optional[str] = Field(default=None, description="Source PDF SHA-256 digest")
    output_path: Optional[str] = Field(default=None, description="Relative path to normalized JSON file")
    normalized_at: Optional[str] = Field(default=None, description="Normalization ISO timestamp")
    validation_issues: List[str] = Field(default_factory=list, description="Validation issues or warnings")


class NormalizationCategoryGroup(BaseModel):
    """Category grouping of normalization records."""
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Category name")
    standards: List[NormalizationManifestRecord] = Field(
        default_factory=list,
        description="Normalization records in this category"
    )


class NormalizationSummary(BaseModel):
    """Aggregate statistics for the normalization manifest."""
    model_config = ConfigDict(from_attributes=True)

    total_standards: int = Field(default=0)
    normalized_count: int = Field(default=0)
    not_normalized_count: int = Field(default=0)
    normalization_failed_count: int = Field(default=0)
    manual_review_count: int = Field(default=0)
    good_quality_count: int = Field(default=0)
    warning_quality_count: int = Field(default=0)
    total_pages_normalized: int = Field(default=0)
    total_source_characters: int = Field(default=0)
    total_normalized_characters: int = Field(default=0)


class CategoryNormalizationBreakdown(BaseModel):
    """Category-level summary statistics for normalization."""
    model_config = ConfigDict(from_attributes=True)

    category_name: str = Field(..., description="Category name")
    total_standards: int = Field(default=0)
    normalized_count: int = Field(default=0)
    not_normalized_count: int = Field(default=0)
    manual_review_count: int = Field(default=0)


class BISDocumentNormalizationManifest(BaseModel):
    """Top-level BIS document normalization manifest."""
    model_config = ConfigDict(from_attributes=True)

    schema_version: str = Field(default="1.0.0")
    generated_at: str = Field(...)
    description: str = Field(
        default="Official normalization status and corpus-ready manifest for 100 BISaarthi MVP standards"
    )
    summary: NormalizationSummary = Field(default_factory=NormalizationSummary)
    categories_breakdown: List[CategoryNormalizationBreakdown] = Field(default_factory=list)
    categories: List[NormalizationCategoryGroup] = Field(default_factory=list)
