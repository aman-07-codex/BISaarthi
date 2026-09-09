"""Pydantic schemas for Phase 4A: Offline PDF Extraction & Structural Validation."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ExtractionStatus(str, Enum):
    """Lifecycle status of document text extraction."""
    EXTRACTED = "extracted"
    NOT_EXTRACTED = "not_extracted"
    EXTRACTION_FAILED = "extraction_failed"
    MANUAL_REVIEW = "manual_review"


class ExtractionQuality(str, Enum):
    """Quality classification of extracted PDF text."""
    GOOD = "good"
    POOR = "poor"
    REQUIRES_OCR = "requires_ocr"
    CORRUPTED = "corrupted"
    UNKNOWN = "unknown"


class PageExtraction(BaseModel):
    """Structured extraction representation for an individual PDF page."""
    model_config = ConfigDict(from_attributes=True)

    page_number: int = Field(..., ge=1, description="1-indexed physical page number in PDF")
    text: str = Field(..., description="Extracted textual content of the page")
    character_count: int = Field(default=0, ge=0, description="Total characters extracted from page")
    extraction_status: str = Field(default="success", description="Status ('success', 'empty', 'error')")
    has_images: bool = Field(default=False, description="Whether visual image objects are present on page")


class DocumentExtractionOutput(BaseModel):
    """Complete structured JSON representation of an extracted Indian Standard PDF."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="BIS standard ID from manifest")
    standard_enc_id: Optional[str] = Field(default=None, description="BIS encrypted standard ID")
    is_number: str = Field(..., description="Indian Standard identifier from manifest")
    title: Optional[str] = Field(default=None, description="Official title of the standard")
    category: str = Field(..., description="Corpus category")

    source_pdf: str = Field(..., description="Relative path to verified source PDF")
    file_name: str = Field(..., description="Canonical filename of source PDF")
    file_size_bytes: int = Field(..., ge=0, description="Size of source PDF in bytes")
    sha256: str = Field(..., description="Cryptographic SHA-256 digest of source PDF")

    page_count: int = Field(..., ge=0, description="Total physical pages in PDF")
    extracted_page_count: int = Field(default=0, ge=0, description="Number of pages containing extractable text")
    total_character_count: int = Field(default=0, ge=0, description="Total character count across all pages")

    extraction_status: ExtractionStatus = Field(
        default=ExtractionStatus.EXTRACTED,
        description="Overall extraction status"
    )
    extraction_quality: ExtractionQuality = Field(
        default=ExtractionQuality.GOOD,
        description="Extraction quality assessment"
    )

    identity_verified: bool = Field(
        default=False,
        description="Whether extracted text confirms standard identity"
    )
    identity_confidence: str = Field(
        default="none",
        description="Confidence of standard identity match ('high', 'medium', 'none')"
    )
    detected_is_number: Optional[str] = Field(
        default=None,
        description="Standard identifier detected from extracted text"
    )

    extracted_at: str = Field(..., description="ISO timestamp when extraction was completed")
    issues: List[str] = Field(default_factory=list, description="Warnings, quality notes, or parser logs")
    pages: List[PageExtraction] = Field(default_factory=list, description="Page-by-page extracted content")


class ExtractionManifestRecord(BaseModel):
    """Manifest record tracking extraction status for a standard in the 100-corpus."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="Standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Standard Encrypted ID")
    is_number: str = Field(..., description="Indian Standard identifier")
    title: Optional[str] = Field(default=None, description="Standard title")
    category: str = Field(..., description="Corpus category")

    source_pdf: Optional[str] = Field(default=None, description="Path to verified PDF if present")
    extraction_status: ExtractionStatus = Field(
        default=ExtractionStatus.NOT_EXTRACTED,
        description="Extraction lifecycle state"
    )
    extraction_quality: Optional[ExtractionQuality] = Field(
        default=None,
        description="Quality classification if extracted"
    )

    page_count: Optional[int] = Field(default=None, description="Total physical pages")
    extracted_page_count: Optional[int] = Field(default=None, description="Pages with text")
    total_character_count: Optional[int] = Field(default=None, description="Total characters")
    sha256: Optional[str] = Field(default=None, description="Source PDF SHA-256 digest")
    output_path: Optional[str] = Field(default=None, description="Relative path to extracted JSON file")
    extracted_at: Optional[str] = Field(default=None, description="Extraction ISO timestamp")
    validation_issues: List[str] = Field(default_factory=list, description="Validation issues or notes")


class ExtractionCategoryGroup(BaseModel):
    """Category grouping of extraction records."""
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Category name")
    standards: List[ExtractionManifestRecord] = Field(
        default_factory=list,
        description="Extraction records in this category"
    )


class ExtractionSummary(BaseModel):
    """Aggregate statistics for the extraction manifest."""
    model_config = ConfigDict(from_attributes=True)

    total_standards: int = Field(default=0)
    extracted_count: int = Field(default=0)
    not_extracted_count: int = Field(default=0)
    extraction_failed_count: int = Field(default=0)
    manual_review_count: int = Field(default=0)
    good_quality_count: int = Field(default=0)
    requires_ocr_count: int = Field(default=0)
    total_pages_extracted: int = Field(default=0)
    total_characters_extracted: int = Field(default=0)


class CategoryExtractionBreakdown(BaseModel):
    """Category-level summary statistics."""
    model_config = ConfigDict(from_attributes=True)

    category_name: str = Field(..., description="Category name")
    total_standards: int = Field(default=0)
    extracted_count: int = Field(default=0)
    not_extracted_count: int = Field(default=0)
    manual_review_count: int = Field(default=0)


class BISDocumentExtractionManifest(BaseModel):
    """Top-level BIS document extraction manifest."""
    model_config = ConfigDict(from_attributes=True)

    version: str = Field(default="1.0", description="Manifest schema version")
    purpose: str = Field(
        default="BISaarthi MVP Official BIS Document Extraction Manifest",
        description="Manifest purpose"
    )
    source_corpus: str = Field(
        default="bis_mvp_corpus_manifest.json",
        description="Source corpus manifest reference"
    )
    total_standards: int = Field(default=0, description="Total standards tracked")
    extraction_manifest_timestamp: str = Field(..., description="Manifest timestamp")
    summary: ExtractionSummary = Field(..., description="Aggregate extraction summary metrics")
    category_breakdown: List[CategoryExtractionBreakdown] = Field(
        default_factory=list,
        description="Category level breakdown"
    )
    categories: List[ExtractionCategoryGroup] = Field(
        default_factory=list,
        description="Category groups containing extraction records"
    )
