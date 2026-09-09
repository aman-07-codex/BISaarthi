"""Retrieval orchestration service for Phase 5B: Provider-Agnostic Hybrid Retrieval."""

from datetime import datetime, timezone
import time
from typing import Any, Dict, List, Optional, Union

from app.schemas.bis_retrieval import (
    CitationReference,
    RetrievalCandidate,
    RetrievalMethod,
    RetrievalQuery,
    RetrievalResponse,
)
from app.services.bis_citation_builder import CitationBuilder
from app.services.bis_dense_retriever import (
    BaseDenseRetriever,
    VectorStoreDenseRetriever,
)
from app.services.bis_embedding_provider import (
    BaseEmbeddingProvider,
    MockEmbeddingProvider,
)
from app.services.bis_hybrid_retriever import HybridRetriever
from app.services.bis_keyword_retriever import (
    BM25KeywordRetriever,
    BaseKeywordRetriever,
)
from app.services.bis_vector_store import (
    BaseVectorStore,
    InMemoryVectorStore,
)


class BISRetrievalService:
    """Orchestrates query validation, keyword & dense search, RRF fusion, and citation building."""

    def __init__(
        self,
        keyword_retriever: Optional[BaseKeywordRetriever] = None,
        dense_retriever: Optional[BaseDenseRetriever] = None,
        vector_store: Optional[BaseVectorStore] = None,
        embedding_provider: Optional[BaseEmbeddingProvider] = None,
        citation_builder: Optional[CitationBuilder] = None
    ) -> None:
        self.keyword_retriever = keyword_retriever or BM25KeywordRetriever()

        if dense_retriever is not None:
            self.dense_retriever = dense_retriever
        else:
            v_store = vector_store or InMemoryVectorStore(expected_dimension=768)
            e_provider = embedding_provider or MockEmbeddingProvider(dimension=768)
            self.dense_retriever = VectorStoreDenseRetriever(
                vector_store=v_store,
                provider=e_provider,
            )

        self.citation_builder = citation_builder or CitationBuilder()
        self.hybrid_retriever = HybridRetriever(
            keyword_retriever=self.keyword_retriever,
            dense_retriever=self.dense_retriever,
            citation_builder=self.citation_builder,
        )

    def index_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embed_vectors: bool = True
    ) -> None:
        """Indexes Phase 4C chunks into both lexical BM25 and dense vector stores for testing."""
        if not chunks:
            return

        # Index in keyword retriever
        self.keyword_retriever.index_chunks(chunks)

        # Register in dense retriever lookup
        if isinstance(self.dense_retriever, VectorStoreDenseRetriever):
            self.dense_retriever.register_chunk_lookup(chunks)

    def retrieve(self, query: Union[RetrievalQuery, Dict[str, Any], str]) -> RetrievalResponse:
        """Executes full retrieval workflow and builds verifiable citations.
        
        Args:
            query: RetrievalQuery object, query dictionary, or raw query string.
            
        Returns:
            RetrievalResponse payload.
        """
        start_time = time.perf_counter()

        if isinstance(query, str):
            query_obj = RetrievalQuery(query_text=query)
        elif isinstance(query, dict):
            query_obj = RetrievalQuery(**query)
        else:
            query_obj = query

        results = self.hybrid_retriever.search(query_obj)
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Determine active methods
        methods_used: List[RetrievalMethod] = []
        if query_obj.retrieval_method in (RetrievalMethod.KEYWORD, RetrievalMethod.HYBRID):
            methods_used.append(RetrievalMethod.KEYWORD)
        if query_obj.retrieval_method in (RetrievalMethod.DENSE, RetrievalMethod.HYBRID):
            methods_used.append(RetrievalMethod.DENSE)

        # Collect unique citations
        citations = [c.citation for c in results if c.citation is not None]

        filters_applied = self.hybrid_retriever._extract_filters(query_obj)

        return RetrievalResponse(
            query=query_obj,
            results=results,
            total_candidates=len(results),
            retrieval_methods_used=methods_used,
            filters_applied=filters_applied,
            citations=citations,
            execution_metadata={
                "elapsed_ms": elapsed_ms,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "fusion_algorithm": "RRF" if query_obj.retrieval_method == RetrievalMethod.HYBRID else "None",
            },
        )
