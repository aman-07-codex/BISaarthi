"""Structural, Identity & Quality Validator for Offline PDF Extraction (Phase 4A).

Provides deterministic validation of PDF structure, extractable character density,
and exact standard identity disambiguation against the 100-standard corpus allowlist.
"""

from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple

from app.core.logging import get_logger
from app.schemas.bis_document_extraction import ExtractionQuality, PageExtraction
from app.services.bis_document_verifier import check_pdf_format_and_safety
from app.services.bis_resolver import clean_text, match_standard_identities, parse_is_number

logger = get_logger("bis_extraction_validator")

# Thresholds for quality evaluation
MIN_CHARACTERS_FOR_DIGITAL_TEXT = 100
MIN_PAGE_TEXT_RATIO_GOOD = 0.30


def validate_pdf_structure(file_path: Path) -> Tuple[bool, Optional[str]]:
    """Validate file safety, size, and header signature."""
    return check_pdf_format_and_safety(file_path)


def detect_is_number_in_text(text: str) -> Optional[str]:
    """Search for Indian Standard numbers (e.g. 'IS 2082:2018', 'IS 302 (Part 1):2024') in text."""
    if not text:
        return None

    # Search for patterns like IS 1234, IS/IEC 60898, IS 302 (Part 1)
    matches = re.finditer(
        r"\b(IS(?:/IEC|/ISO)?\s+\d+[\w\-]*(?:\s*\(?\s*Part\s*\d+(?:/Sec\s*\d+)?\s*\)?)?(?::\s*\d{4})?)",
        text,
        re.IGNORECASE,
    )
    for m in matches:
        cand = m.group(1).strip()
        # Verify it has numeric base
        if re.search(r"\d+", cand):
            return cand
    return None


def verify_extracted_identity(
    first_pages_text: str,
    expected_is_number: str,
    expected_title: Optional[str] = None,
) -> Tuple[bool, Optional[str], str, List[str]]:
    """Validate that the extracted text matches the expected Indian Standard identity.
    
    Returns (is_verified, detected_is_number_str, confidence, issues).
    """
    issues: List[str] = []
    expected_identity = parse_is_number(expected_is_number)

    # 1. Search for IS number in text
    detected_is = detect_is_number_in_text(first_pages_text)

    if not detected_is:
        # Fallback: check if base number and 'IS' appear in text
        base_match = re.search(r"\bIS\b[\s\S]{0,40}\b" + re.escape(expected_identity.base_number) + r"\b", first_pages_text, re.IGNORECASE)
        if base_match:
            detected_is = base_match.group(0).replace("\n", " ").strip()

    if not detected_is:
        issues.append(f"Expected standard '{expected_is_number}' not explicitly detected in document header text")
        return False, None, "none", issues

    # 2. Dissect and compare detected identity
    detected_identity = parse_is_number(detected_is)
    is_exact_match, mismatch_reason = match_standard_identities(
        expected_identity,
        detected_identity,
        ignore_year=False,
    )

    if is_exact_match:
        return True, detected_is, "high", issues

    # 3. Check match ignoring revision year
    is_base_match, base_mismatch_reason = match_standard_identities(
        expected_identity,
        detected_identity,
        ignore_year=True,
    )

    if is_base_match:
        issues.append(f"Identity note: {mismatch_reason or 'Revision year variation'}")
        return True, detected_is, "medium", issues

    issues.append(f"Standard identity mismatch: expected '{expected_is_number}', detected '{detected_is}' ({mismatch_reason})")
    return False, detected_is, "none", issues


def assess_extraction_quality(
    page_count: int,
    pages: List[PageExtraction],
    identity_verified: bool,
) -> Tuple[ExtractionQuality, List[str]]:
    """Determine extraction quality (good, poor, requires_ocr, corrupted)."""
    issues: List[str] = []

    if page_count == 0:
        return ExtractionQuality.CORRUPTED, ["PDF has 0 physical pages"]

    total_chars = sum(p.character_count for p in pages)
    text_bearing_pages = sum(1 for p in pages if p.character_count > 30)
    page_ratio = text_bearing_pages / page_count if page_count > 0 else 0.0

    # Case 1: Almost zero characters across the entire document
    if total_chars < MIN_CHARACTERS_FOR_DIGITAL_TEXT:
        issues.append(
            f"Minimal digital text extracted ({total_chars} total characters across {page_count} pages). Document likely consists of rasterized/scanned pages requiring OCR."
        )
        return ExtractionQuality.REQUIRES_OCR, issues

    # Case 2: Low text-bearing page ratio (e.g. fragmented extraction)
    if page_ratio < MIN_PAGE_TEXT_RATIO_GOOD:
        issues.append(
            f"Low text-bearing page ratio ({text_bearing_pages}/{page_count} pages = {page_ratio:.1%}). Document contains fragmented or partial text."
        )
        return ExtractionQuality.POOR, issues

    # Case 3: Good character density but identity mismatch
    if not identity_verified:
        issues.append("Document text extracted successfully, but standard identity could not be verified.")
        return ExtractionQuality.POOR, issues

    # Case 4: High quality digital extraction
    return ExtractionQuality.GOOD, ["Healthy digital text extraction with verified standard identity."]
