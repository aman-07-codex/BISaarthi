"""Chat route for Phase 7A: Context-Grounded AI Assistant."""

from typing import Optional
from fastapi import APIRouter, Depends, status

from app.core.logging import get_logger
from app.schemas.bis_api import ChatRequest, ChatResponse
from app.schemas.bis_rag import RAGQuery
from app.services.bis_rag import BISRAGService

logger = get_logger("bisaarthi.chat")
router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

# Global singleton or dependency for BISRAGService
_default_rag_service: Optional[BISRAGService] = None


def get_rag_service() -> BISRAGService:
    """Dependency provider for BISRAGService. Allows clean test overrides."""
    global _default_rag_service
    if _default_rag_service is None:
        _default_rag_service = BISRAGService()
    return _default_rag_service


@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask AI Assistant about Indian Standards",
    description=(
        "Submit a question to the BISaarthi context-grounded RAG engine. "
        "Returns verified technical answers backed by traceable citations from Indian Standards. "
        "If the corpus retrieval index is empty or context is insufficient, returns an honest 'insufficient_context' status."
    ),
)
async def chat_with_assistant(
    request: ChatRequest,
    rag_service: BISRAGService = Depends(get_rag_service),
) -> ChatResponse:
    """Processes natural language user questions through the context-grounded RAG engine."""
    logger.info("Chat query received (lang=%s, top_k=%d)", request.language.value, request.top_k)

    rag_query = RAGQuery(
        query_text=request.message,
        language=request.language,
        top_k=request.top_k,
        category=request.category,
        is_number=request.is_number,
        clause=request.clause,
        chunk_type=request.chunk_type,
        score_threshold=request.score_threshold,
        retrieval_method=request.retrieval_method,
    )

    answer = rag_service.answer_query(rag_query)

    return ChatResponse(
        answer=answer.answer_text,
        language=answer.query.language,
        grounding_status=answer.grounding_status,
        grounded=answer.grounded,
        citations=answer.citations,
        retrieved_chunk_ids=answer.retrieved_chunk_ids,
        warnings=answer.warnings,
        execution_metadata=answer.execution_metadata,
    )
