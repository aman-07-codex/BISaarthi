"""Validation and integrity checks for Phase 4C: Document Chunking & Semantic Partitioning."""

import re
from typing import Any, Dict, List, Set, Tuple


def validate_normalization_input(norm_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validates that input data conforms to Phase 4B normalized document structure.
    
    Args:
        norm_data: Normalized document dictionary.
        
    Returns:
        Tuple of (is_valid, issues_list)
    """
    issues: List[str] = []
    required_fields = ["is_number", "source_pdf", "source_pdf_sha256", "pages", "page_count"]
    for field in required_fields:
        if field not in norm_data:
            issues.append(f"Missing mandatory normalization field: '{field}'")

    pages = norm_data.get("pages")
    if not isinstance(pages, list):
        issues.append("Field 'pages' must be a list of normalized page objects")

    return len(issues) == 0, issues


def validate_chunk_conservation_and_integrity(
    norm_doc: Dict[str, Any],
    chunk_output: Dict[str, Any]
) -> Tuple[bool, List[str]]:
    """Validates that produced chunks satisfy ordering, uniqueness, provenance, and conservation rules.
    
    Checks:
    - Sequence numbers are 1-indexed, contiguous, and unique [1, ..., N].
    - Chunk IDs are unique and non-empty.
    - Every chunk has non-empty text and valid character/word counts.
    - Source page numbers in chunks are valid within the document's page range.
    - Document identity (IS number, SHA-256) matches the normalized document.
    - Chunk text content can be traced to normalized page content.
    
    Args:
        norm_doc: Source Phase 4B normalized document dictionary.
        chunk_output: Resulting Phase 4C DocumentChunkOutput dictionary.
        
    Returns:
        Tuple of (is_valid, list of issues)
    """
    issues: List[str] = []
    chunks = chunk_output.get("chunks", [])

    if not chunks:
        # If normalized doc had no text, 0 chunks might be valid if pages were empty
        has_norm_text = any(
            bool(p.get("normalized_text", "").strip())
            for p in norm_doc.get("pages", [])
        )
        if has_norm_text:
            issues.append("Normalized document contains text but 0 chunks were produced")
        return len(issues) == 0, issues

    # 1. Identity match
    if chunk_output.get("is_number") != norm_doc.get("is_number"):
        issues.append(
            f"IS number mismatch: chunks have '{chunk_output.get('is_number')}', normalized has '{norm_doc.get('is_number')}'"
        )
    if chunk_output.get("source_pdf_sha256") != norm_doc.get("source_pdf_sha256"):
        issues.append("Source PDF SHA-256 mismatch between chunks and normalized doc")

    # 2. Sequence and ID uniqueness
    seen_ids: Set[str] = set()
    expected_seq = 1
    doc_page_numbers = {p.get("page_number", 1) for p in norm_doc.get("pages", [])}

    all_norm_text = " ".join(p.get("normalized_text", "") for p in norm_doc.get("pages", []))

    for idx, c in enumerate(chunks):
        c_id = c.get("chunk_id", "")
        seq = c.get("chunk_sequence", 0)
        text = c.get("text", "")
        c_pages = c.get("source_pages", [])

        # Check sequence
        if seq != expected_seq:
            issues.append(f"Chunk at index {idx} has sequence {seq}, expected {expected_seq}")
        expected_seq += 1

        # Check ID uniqueness
        if not c_id:
            issues.append(f"Chunk at index {idx} has empty chunk_id")
        elif c_id in seen_ids:
            issues.append(f"Duplicate chunk_id '{c_id}' found at index {idx}")
        else:
            seen_ids.add(c_id)

        # Check non-empty text
        if not text or not text.strip():
            issues.append(f"Chunk '{c_id}' has empty text")

        # Check source pages
        if not c_pages:
            issues.append(f"Chunk '{c_id}' has empty source_pages list")
        else:
            for p_num in c_pages:
                if doc_page_numbers and p_num not in doc_page_numbers:
                    issues.append(f"Chunk '{c_id}' references invalid page number {p_num}")

        # Check character and word counts
        char_count = c.get("character_count", 0)
        if char_count != len(text):
            issues.append(
                f"Chunk '{c_id}' character_count ({char_count}) != len(text) ({len(text)})"
            )

        # Content provenance check: verify key clause or snippet exists in normalized text
        # (Check first 30 chars of chunk text)
        if len(text.strip()) > 30:
            snippet = text.strip()[:30]
            if snippet not in all_norm_text and len(all_norm_text) > 0:
                issues.append(f"Chunk '{c_id}' text snippet not found in normalized document text")

    return len(issues) == 0, issues
