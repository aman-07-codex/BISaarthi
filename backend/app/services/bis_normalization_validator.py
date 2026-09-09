"""Validation and conservation heuristics for Phase 4B: Document Text Normalization."""

import re
from typing import Any, Dict, List, Optional, Set, Tuple
from app.schemas.bis_document_normalization import NormalizationQuality


def validate_extraction_input(extracted_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validates that the input data conforms to Phase 4A extraction JSON structure.
    
    Args:
        extracted_data: Raw JSON dictionary from Phase 4A extraction.
        
    Returns:
        Tuple of (is_valid, issues_list)
    """
    issues: List[str] = []
    required_fields = ["is_number", "source_pdf", "sha256", "pages", "page_count"]
    for field in required_fields:
        if field not in extracted_data:
            issues.append(f"Missing mandatory extraction field: '{field}'")

    pages = extracted_data.get("pages")
    if not isinstance(pages, list):
        issues.append("Field 'pages' must be a list of page objects")

    return len(issues) == 0, issues


def detect_repeated_headers_footers(
    pages: List[Dict[str, Any]],
    repetition_threshold: float = 0.50
) -> Tuple[Set[str], Set[str]]:
    """Analyzes pages to detect repeated header and footer lines across pages.
    
    Heuristics:
    - Inspects top 2 non-empty lines and bottom 2 non-empty lines of each page.
    - Excludes lines that look like normative clauses or short standard definitions.
    - Flags as repetitive if present on at least repetition_threshold (default 50%)
      of pages (for documents with at least 3 pages).
      
    Args:
        pages: List of page dictionaries containing 'text' or 'source_text'.
        repetition_threshold: Minimum fraction of pages where line must appear.
        
    Returns:
        Tuple of (detected_headers_set, detected_footers_set)
    """
    detected_headers: Set[str] = set()
    detected_footers: Set[str] = set()

    non_empty_pages = []
    for p in pages:
        raw_text = p.get("text", "") or p.get("source_text", "")
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        if lines:
            non_empty_pages.append(lines)

    total_pages = len(non_empty_pages)
    if total_pages < 3:
        # Too few pages to reliably detect statistical repetition
        return detected_headers, detected_footers

    header_candidates: Dict[str, int] = {}
    footer_candidates: Dict[str, int] = {}

    # Exclusion regex for genuine technical clauses / titles that shouldn't be stripped
    clause_regex = re.compile(r"^(\d+(\.\d+)*)\s+[A-Z]", re.IGNORECASE)

    for page_lines in non_empty_pages:
        # Top 2 lines
        top_lines = page_lines[:2]
        seen_top_on_page = set()
        for line in top_lines:
            norm_line = " ".join(line.split())
            if len(norm_line) > 3 and not clause_regex.match(norm_line):
                if norm_line not in seen_top_on_page:
                    header_candidates[norm_line] = header_candidates.get(norm_line, 0) + 1
                    seen_top_on_page.add(norm_line)

        # Bottom 2 lines
        bottom_lines = page_lines[-2:] if len(page_lines) >= 2 else page_lines[-1:]
        seen_bottom_on_page = set()
        for line in bottom_lines:
            norm_line = " ".join(line.split())
            if len(norm_line) > 1 and not clause_regex.match(norm_line):
                if norm_line not in seen_bottom_on_page:
                    footer_candidates[norm_line] = footer_candidates.get(norm_line, 0) + 1
                    seen_bottom_on_page.add(norm_line)

    min_occurrences = max(2, int(total_pages * repetition_threshold))

    for line, count in header_candidates.items():
        if count >= min_occurrences:
            detected_headers.add(line)

    for line, count in footer_candidates.items():
        if count >= min_occurrences:
            detected_footers.add(line)

    return detected_headers, detected_footers


def validate_normalization_conservation(
    source_doc: Dict[str, Any],
    normalized_doc: Dict[str, Any],
    min_retention_ratio: float = 0.60
) -> Tuple[NormalizationQuality, List[str]]:
    """Evaluates the conservation and fidelity of the normalized document.
    
    Checks:
    - Overall character retention ratio
    - Page count preservation
    - Standard identifier preservation
    - Critical technical token conservation (units, numbers)
    
    Args:
        source_doc: Raw extraction dictionary from Phase 4A.
        normalized_doc: Resulting normalized dictionary.
        min_retention_ratio: Minimum acceptable character retention ratio.
        
    Returns:
        Tuple of (NormalizationQuality, list of issues/warnings)
    """
    issues: List[str] = []
    
    # Calculate actual character counts from pages
    actual_source_chars = sum(
        len(p.get("text", "") or p.get("source_text", ""))
        for p in source_doc.get("pages", [])
    )
    source_chars = actual_source_chars if actual_source_chars > 0 else source_doc.get("total_character_count", 0)
    norm_chars = normalized_doc.get("normalized_total_character_count", 0)
    if norm_chars == 0:
        norm_chars = sum(
            len(p.get("normalized_text", ""))
            for p in normalized_doc.get("pages", [])
        )

    retention_ratio = (norm_chars / source_chars) if source_chars > 0 else 1.0

    # 1. Page count preservation
    source_pages = len(source_doc.get("pages", []))
    norm_pages = len(normalized_doc.get("pages", []))
    if source_pages != norm_pages:
        issues.append(
            f"Page count mismatch: source has {source_pages} pages, normalized has {norm_pages} pages"
        )

    # 2. Standard identifier preservation
    is_number = source_doc.get("is_number", "")
    all_normalized_text = " ".join(
        p.get("normalized_text", "") for p in normalized_doc.get("pages", [])
    )
    all_removed_text = " ".join(
        " ".join(p.get("removed_header_footer_lines", []))
        for p in normalized_doc.get("pages", [])
    )
    
    # Extract base digits from IS number, e.g. "IS 2082:2018" -> "2082"
    base_match = re.search(r"IS\s*(\d+)", is_number, re.IGNORECASE)
    if base_match:
        base_num = base_match.group(1)
        if (
            base_num not in all_normalized_text
            and base_num not in all_removed_text
            and source_chars > 200
        ):
            issues.append(f"Standard base number '{base_num}' not found in normalized text")

    # 3. Technical token checks (numbers with units)
    tech_units = [r"\b\d+\s*(?:V|kV|Hz|mm|cm|m|kg|g|%|°C|W|kW|A|mA)\b"]
    for pattern in tech_units:
        source_matches = set(re.findall(pattern, " ".join(p.get("text", "") or p.get("source_text", "") for p in source_doc.get("pages", []))))
        norm_matches = set(re.findall(pattern, all_normalized_text))
        if source_matches and len(norm_matches) < len(source_matches) * 0.70:
            missing_count = len(source_matches) - len(norm_matches)
            issues.append(f"Potential loss of technical tokens: {missing_count} unit-number tokens not preserved")

    # 4. Character retention ratio assessment
    if source_chars > 200:
        if retention_ratio < 0.40:
            issues.append(
                f"Severe content reduction: retention ratio is {retention_ratio:.2%} (< 40%)"
            )
            return NormalizationQuality.REQUIRES_MANUAL_REVIEW, issues
        elif retention_ratio < min_retention_ratio:
            issues.append(
                f"Moderate content reduction: retention ratio is {retention_ratio:.2%} (< {min_retention_ratio:.0%})"
            )
            return NormalizationQuality.WARNING, issues

    if any("mismatch" in issue or "not found" in issue for issue in issues):
        return NormalizationQuality.WARNING, issues

    return NormalizationQuality.GOOD, issues

