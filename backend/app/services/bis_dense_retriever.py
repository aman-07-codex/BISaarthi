"""Dense vector retriever using Phase 5A vector store and embedding provider for Phase 5B."""

from typing import Any, Dict, List, Optional, Protocol, runtime_checkable

from app.schemas.bis_retrieval import RetrievalCandidate, RetrievalMethod
from app.services.bis_embedding_provider import BaseEmbeddingProvider
from app.services.bis_vector_store import BaseVectorStore


@runtime_checkable
class BaseDenseRetriever(Protocol):
    """Protocol for dense vector retrieval engines."""

    def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        score_threshold: Optional[float] = None
    ) -> List[RetrievalCandidate]:
        """Performs dense vector similarity search for a query string."""
        ...


class VectorStoreDenseRetriever:
    """Retrieves candidates from a BaseVectorStore using dense embeddings."""

    def __init__(
        self,
        vector_store: BaseVectorStore,
        provider: BaseEmbeddingProvider,
        chunk_lookup: Optional[Dict[str, Dict[str, Any]]] = None
    ) -> None:
        self.vector_store = vector_store
        self.provider = provider
        self._chunk_lookup = chunk_lookup or {}

    def register_chunk_lookup(self, chunks: List[Dict[str, Any]]) -> None:
        """Registers Phase 4C chunks to populate full text if not present in vector record."""
        for c in chunks:
            self._chunk_lookup[c["chunk_id"]] = c

    def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        score_threshold: Optional[float] = None
    ) -> List[RetrievalCandidate]:
        """Embeds query text and retrieves top-k similar chunks from vector store."""
        if not query or not query.strip():
            return []

        query_vector = self.provider.embed_text(query)
        search_results = self.vector_store.similarity_search(
            query_vector=query_vector,
            top_k=top_k,
            filters=filters,
        )

        candidates: List[RetrievalCandidate] = []
        for rank, res in enumerate(search_results, start=1):
            if score_threshold is not None and res.score < score_threshold:
                continue

            rec = res.record
            # Retrieve text from lookup if available, otherwise record metadata
            chunk_data = self._chunk_lookup.get(rec.chunk_id, {})
            text_content = chunk_data.get("text") or rec.metadata.get("text", "")

            cand = RetrievalCandidate(
                chunk_id=rec.chunk_id,
                standard_id=rec.standard_id,
                standard_enc_id=rec.standard_enc_id,
                is_number=rec.is_number,
                title=rec.title,
                category=rec.category,
                chunk_type=rec.chunk_type,
                section=rec.section,
                section_title=rec.metadata.get("section_title"),
                clause=rec.clause,
                clause_title=rec.metadata.get("clause_title"),
                parent_clause=rec.parent_clause,
                annex_id=rec.annex_id,
                table_id=rec.table_id,
                source_pages=rec.source_pages,
                source_pdf=rec.source_pdf,
                source_pdf_sha256=rec.source_pdf_sha256,
                source_chunk_path=rec.source_chunk_path,
                text=text_content,
                score=round(res.score, 4),
                dense_score=round(res.score, 4),
                dense_rank=rank,
                retrieval_methods=[RetrievalMethod.DENSE],
            )
            candidates.append(cand)

        return candidates
