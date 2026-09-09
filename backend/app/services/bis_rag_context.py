"""Context assembly and provenance preservation service for Phase 6A RAG."""

from typing import List, Optional

from app.schemas.bis_rag import RAGContext
from app.schemas.bis_retrieval import RetrievalCandidate


class RAGContextBuilder:
    """Transforms retrieval candidates into validated RAGContext items while preserving provenance."""

    def __init__(self, max_context_chars: int = 12000) -> None:
        self.max_context_chars = max_context_chars

    def candidate_to_context(self, candidate: RetrievalCandidate) -> RAGContext:
        """Converts a single RetrievalCandidate into a strongly typed RAGContext model."""
        return RAGContext(
            chunk_id=candidate.chunk_id,
            is_number=candidate.is_number,
            title=candidate.title,
            category=candidate.category,
            chunk_type=candidate.chunk_type,
            section=candidate.section,
            clause=candidate.clause,
            parent_clause=candidate.parent_clause,
            annex_id=candidate.annex_id,
            table_id=candidate.table_id,
            source_pages=candidate.source_pages,
            source_pdf=candidate.source_pdf,
            source_pdf_sha256=candidate.source_pdf_sha256,
            source_chunk_path=candidate.source_chunk_path,
            text=candidate.text,
            citation=candidate.citation,
        )

    def build_context(
        self,
        candidates: List[RetrievalCandidate],
        max_chars: Optional[int] = None,
    ) -> List[RAGContext]:
        """Assembles a list of RAGContext items within character budget constraints.
        
        Args:
            candidates: Ranked list of retrieval candidates from Phase 5B.
            max_chars: Optional character limit override (defaults to self.max_context_chars).
            
        Returns:
            List of RAGContext objects that fit into the configured budget.
        """
        budget = max_chars if max_chars is not None else self.max_context_chars
        assembled_context: List[RAGContext] = []
        current_chars = 0

        for candidate in candidates:
            ctx = self.candidate_to_context(candidate)
            chunk_length = len(ctx.text)

            # If adding the whole chunk fits the budget
            if current_chars + chunk_length <= budget:
                assembled_context.append(ctx)
                current_chars += chunk_length
            elif not assembled_context:
                # If even the very first chunk exceeds budget, truncate the text safely
                truncated_text = ctx.text[:budget] + "..."
                truncated_ctx = ctx.model_copy(update={"text": truncated_text})
                assembled_context.append(truncated_ctx)
                break
            else:
                # Budget exhausted, stop adding further candidates to keep whole chunks intact
                break

        return assembled_context
