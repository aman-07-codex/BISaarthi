"""Vector store abstractions and in-memory test store for Phase 5A."""

import math
from typing import Any, Dict, List, Optional, Protocol, runtime_checkable

from app.schemas.bis_embedding import SearchResult, VectorRecord


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes exact cosine similarity between two float vectors."""
    if len(v1) != len(v2):
        raise ValueError(f"Dimension mismatch for cosine similarity: {len(v1)} != {len(v2)}")

    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a, b in zip(v1, v2)))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot_product / (norm_a * norm_b)


@runtime_checkable
class BaseVectorStore(Protocol):
    """Protocol for provider-agnostic vector database stores."""

    def upsert(self, records: List[VectorRecord]) -> None:
        """Upserts a list of vector records."""
        ...

    def delete(self, vector_ids: List[str]) -> int:
        """Deletes vector records by ID. Returns count of deleted records."""
        ...

    def get(self, vector_id: str) -> Optional[VectorRecord]:
        """Retrieves a single vector record by ID."""
        ...

    def similarity_search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Performs dense vector similarity search with optional metadata filtering."""
        ...

    def count(self) -> int:
        """Returns total vector records stored."""
        ...

    def clear(self) -> None:
        """Clears all records."""
        ...


class InMemoryVectorStore:
    """In-memory vector store for testing similarity search and metadata filtering."""

    def __init__(self, expected_dimension: Optional[int] = None) -> None:
        self._records: Dict[str, VectorRecord] = {}
        self._expected_dimension = expected_dimension

    def upsert(self, records: List[VectorRecord]) -> None:
        """Upserts vector records, checking dimension consistency."""
        for rec in records:
            if self._expected_dimension and rec.embedding_dimension != self._expected_dimension:
                raise ValueError(
                    f"Vector dimension mismatch for '{rec.vector_id}': got {rec.embedding_dimension}, expected {self._expected_dimension}"
                )
            if len(rec.embedding) != rec.embedding_dimension:
                raise ValueError(
                    f"Vector array length {len(rec.embedding)} does not match embedding_dimension {rec.embedding_dimension}"
                )
            self._records[rec.vector_id] = rec

    def delete(self, vector_ids: List[str]) -> int:
        """Deletes vector records by ID."""
        deleted_count = 0
        for vid in vector_ids:
            if vid in self._records:
                del self._records[vid]
                deleted_count += 1
        return deleted_count

    def get(self, vector_id: str) -> Optional[VectorRecord]:
        """Retrieves a vector record by ID."""
        return self._records.get(vector_id)

    def count(self) -> int:
        """Returns total vector records in store."""
        return len(self._records)

    def clear(self) -> None:
        """Clears all records in store."""
        self._records.clear()

    def _matches_filters(self, record: VectorRecord, filters: Dict[str, Any]) -> bool:
        """Checks if a record matches all filter criteria."""
        rec_dict = record.model_dump()
        rec_meta = record.metadata or {}

        for k, v in filters.items():
            if k in rec_dict and rec_dict[k] == v:
                continue
            if k in rec_meta and rec_meta[k] == v:
                continue
            return False
        return True

    def similarity_search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Performs cosine similarity search over stored vectors."""
        if not self._records:
            return []

        if self._expected_dimension and len(query_vector) != self._expected_dimension:
            raise ValueError(
                f"Query vector dimension {len(query_vector)} does not match store dimension {self._expected_dimension}"
            )

        candidates: List[SearchResult] = []
        for rec in self._records.values():
            if filters and not self._matches_filters(rec, filters):
                continue

            score = cosine_similarity(query_vector, rec.embedding)
            candidates.append(SearchResult(record=rec, score=round(score, 6)))

        # Sort descending by similarity score
        candidates.sort(key=lambda x: x.score, reverse=True)
        return candidates[:top_k]
