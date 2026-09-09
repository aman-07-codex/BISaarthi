"""Validation and deterministic ID generation for Phase 5A: Embedding Pipeline."""

import math
import re
from typing import Any, Dict, List, Tuple

from app.schemas.bis_embedding import VectorRecord


def generate_deterministic_vector_id(
    chunk_id: str,
    provider: str,
    model_name: str,
    dimension: int
) -> str:
    """Generates a deterministic unique vector ID from chunk identity and embedding config."""
    model_slug = re.sub(r"[^\w]", "_", model_name)
    provider_slug = re.sub(r"[^\w]", "_", provider)
    return f"{chunk_id}__emb_{provider_slug}_{model_slug}_{dimension}"



def validate_chunk_input_for_embedding(chunk: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validates that a chunk contains mandatory metadata and non-empty text before embedding.
    
    Args:
        chunk: Phase 4C DocumentChunk dictionary.
        
    Returns:
        Tuple of (is_valid, list of issues)
    """
    issues: List[str] = []
    required_fields = ["chunk_id", "is_number", "text", "source_pdf_sha256", "source_pages"]

    for field in required_fields:
        if field not in chunk:
            issues.append(f"Missing mandatory chunk field for embedding: '{field}'")

    text = chunk.get("text", "")
    if not isinstance(text, str) or not text.strip():
        issues.append(f"Chunk '{chunk.get('chunk_id', 'unknown')}' has empty text")

    return len(issues) == 0, issues


def validate_vector_record(
    record: VectorRecord,
    expected_dimension: int
) -> Tuple[bool, List[str]]:
    """Validates vector array dimension, finiteness, and provenance metadata.
    
    Args:
        record: VectorRecord object to validate.
        expected_dimension: Configured expected embedding dimension.
        
    Returns:
        Tuple of (is_valid, list of issues)
    """
    issues: List[str] = []

    if not record.vector_id:
        issues.append("VectorRecord has empty vector_id")

    if record.embedding_dimension != expected_dimension:
        issues.append(
            f"VectorRecord embedding_dimension ({record.embedding_dimension}) != expected ({expected_dimension})"
        )

    if len(record.embedding) != expected_dimension:
        issues.append(
            f"Vector array length ({len(record.embedding)}) != expected dimension ({expected_dimension})"
        )

    for idx, val in enumerate(record.embedding):
        if not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
            issues.append(f"Invalid non-finite float value at index {idx}: {val}")
            break

    return len(issues) == 0, issues
