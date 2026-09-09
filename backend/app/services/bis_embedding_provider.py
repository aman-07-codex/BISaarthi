"""Embedding provider abstractions and mock implementation for Phase 5A."""

import hashlib
import math
import random
from typing import List, Protocol, runtime_checkable

from app.schemas.bis_embedding import EmbeddingProviderType


@runtime_checkable
class BaseEmbeddingProvider(Protocol):
    """Protocol for provider-agnostic embedding services."""

    def embed_text(self, text: str) -> List[float]:
        """Embeds a single string into a dense float vector."""
        ...

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embeds a batch of strings into a list of dense float vectors."""
        ...

    @property
    def dimension(self) -> int:
        """Dimensionality of produced vectors."""
        ...

    @property
    def model_name(self) -> str:
        """Name or identifier of the underlying model."""
        ...

    @property
    def provider_type(self) -> EmbeddingProviderType:
        """Type of provider (MOCK, LOCAL, EXTERNAL)."""
        ...


class MockEmbeddingProvider:
    """Deterministic, local, test-only mock embedding provider.
    
    Generates reproducible unit-normalized vectors derived from a SHA-256
    hash of the input text and configuration seed.
    """

    def __init__(
        self,
        model_name: str = "mock-embedding-v1",
        dimension: int = 768,
        normalize: bool = True
    ) -> None:
        if dimension < 1:
            raise ValueError(f"Dimension must be positive integer, got {dimension}")
        self._model_name = model_name
        self._dimension = dimension
        self._normalize = normalize

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def provider_type(self) -> EmbeddingProviderType:
        return EmbeddingProviderType.MOCK

    def embed_text(self, text: str) -> List[float]:
        """Embeds text into a deterministic mock vector."""
        if not text or not text.strip():
            raise ValueError("Cannot embed empty or whitespace-only text")

        # Create deterministic seed integer from text and model metadata
        seed_payload = f"{self._model_name}:{self._dimension}:{text.strip()}"
        seed_digest = hashlib.sha256(seed_payload.encode("utf-8")).hexdigest()
        seed_int = int(seed_digest[:16], 16)

        rng = random.Random(seed_int)
        raw_vector = [rng.uniform(-1.0, 1.0) for _ in range(self._dimension)]

        if self._normalize:
            norm = math.sqrt(sum(x * x for x in raw_vector))
            if norm == 0.0:
                raw_vector = [1.0 / math.sqrt(self._dimension)] * self._dimension
            else:
                raw_vector = [x / norm for x in raw_vector]

        return [round(x, 7) for x in raw_vector]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embeds a batch of texts deterministically."""
        return [self.embed_text(t) for t in texts]
