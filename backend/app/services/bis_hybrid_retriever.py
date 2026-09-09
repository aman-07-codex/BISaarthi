"""Hybrid retrieval engine with Reciprocal Rank Fusion (RRF) for Phase 5B."""

from typing import Any, Dict, List, Optional

from app.schemas.bis_retrieval import (
    RetrievalCandidate,
    RetrievalMethod,
    RetrievalQuery,
)
from app.services.bis_citation_builder import CitationBuilder
from app.services.bis_dense_retriever import BaseDenseRetriever
from app.services.bis_keyword_retriever import BaseKeywordRetriever


class HybridRetriever:
    """Combines lexical BM25 and dense vector search results using Reciprocal Rank Fusion (RRF)."""

    def __init__(
        self,
        keyword_retriever: BaseKeywordRetriever,
        dense_retriever: BaseDenseRetriever,
        citation_builder: Optional[CitationBuilder] = None
    ) -> None:
        self.keyword_retriever = keyword_retriever
        self.dense_retriever = dense_retriever
        self.citation_builder = citation_builder or CitationBuilder()

    def _extract_filters(self, query: RetrievalQuery) -> Dict[str, Any]:
        """Extracts structured metadata filters from query model."""
        filters: Dict[str, Any] = {}
        if query.category:
            filters["category"] = query.category
        if query.standard_id is not None:
            filters["standard_id"] = query.standard_id
        if query.is_number:
            filters["is_number"] = query.is_number
        if query.clause:
            filters["clause"] = query.clause
        if query.chunk_type:
            filters["chunk_type"] = query.chunk_type
        return filters

    def search(self, query: RetrievalQuery) -> List[RetrievalCandidate]:
        """Executes retrieval according to specified query method (KEYWORD, DENSE, or HYBRID)."""
        filters = self._extract_filters(query)
        fetch_k = max(query.top_k * 2, 20)

        # 1. Keyword-only path
        if query.retrieval_method == RetrievalMethod.KEYWORD:
            results = self.keyword_retriever.search(
                query=query.query_text,
                top_k=query.top_k,
                filters=filters if filters else None,
                score_threshold=query.score_threshold,
            )
            for idx, c in enumerate(results, start=1):
                c.citation = self.citation_builder.build_citation(c.model_dump(), citation_index=idx)
            return results

        # 2. Dense-only path
        if query.retrieval_method == RetrievalMethod.DENSE:
            results = self.dense_retriever.search(
                query=query.query_text,
                top_k=query.top_k,
                filters=filters if filters else None,
                score_threshold=query.score_threshold,
            )
            for idx, c in enumerate(results, start=1):
                c.citation = self.citation_builder.build_citation(c.model_dump(), citation_index=idx)
            return results

        # 3. Hybrid RRF fusion path
        kw_results = self.keyword_retriever.search(
            query=query.query_text,
            top_k=fetch_k,
            filters=filters if filters else None,
        )
        dense_results = self.dense_retriever.search(
            query=query.query_text,
            top_k=fetch_k,
            filters=filters if filters else None,
        )

        merged_candidates: Dict[str, RetrievalCandidate] = {}
        rrf_scores: Dict[str, float] = {}

        rrf_k = query.rrf_k
        w_kw = query.keyword_weight
        w_dense = query.dense_weight

        # Add Dense results to RRF
        for rank, c in enumerate(dense_results, start=1):
            cid = c.chunk_id
            c.dense_rank = rank
            dense_rrf = w_dense * (1.0 / (rrf_k + rank))
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + dense_rrf
            merged_candidates[cid] = c

        # Add Keyword results to RRF
        for rank, c in enumerate(kw_results, start=1):
            cid = c.chunk_id
            kw_rrf = w_kw * (1.0 / (rrf_k + rank))
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + kw_rrf

            if cid in merged_candidates:
                # Merge attribution and scores
                existing = merged_candidates[cid]
                existing.keyword_score = c.keyword_score
                existing.keyword_rank = rank
                if RetrievalMethod.KEYWORD not in existing.retrieval_methods:
                    existing.retrieval_methods.append(RetrievalMethod.KEYWORD)
                if not existing.text and c.text:
                    existing.text = c.text
            else:
                c.keyword_rank = rank
                merged_candidates[cid] = c

        # Assign final combined scores
        final_list: List[RetrievalCandidate] = []
        for cid, cand in merged_candidates.items():
            final_score = rrf_scores.get(cid, 0.0)
            if query.score_threshold is not None and final_score < query.score_threshold:
                continue
            cand.score = round(final_score, 6)
            final_list.append(cand)

        # Sort descending by RRF score
        final_list.sort(key=lambda x: (x.score, x.chunk_id), reverse=True)
        top_results = final_list[: query.top_k]

        # Attach non-fabricated citations
        for idx, c in enumerate(top_results, start=1):
            c.citation = self.citation_builder.build_citation(c.model_dump(), citation_index=idx)

        return top_results
