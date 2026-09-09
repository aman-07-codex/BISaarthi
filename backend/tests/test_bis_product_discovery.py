"""Unit and integration tests for Phase 8A-3: Conversational Product -> Standard Discovery."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.bis_rag import GroundingStatus, RAGLanguage, RAGQuery
from app.services.bis_corpus_service import BISCorpusService
from app.services.bis_rag import BISRAGService


@pytest.fixture
def corpus_service():
    """Provides BISCorpusService instance."""
    return BISCorpusService.get_instance()


@pytest.fixture
def rag_service():
    """Provides BISRAGService instance."""
    return BISRAGService()


@pytest.fixture
def client():
    """Provides TestClient for API endpoint integration tests."""
    return TestClient(app)


def test_geyser_product_discovery_full_query(corpus_service, rag_service):
    """Test 1: Complex product query with capacity ('15-litre electric geyser')."""
    query_text = "I want to manufacture a 15-litre electric geyser. Which BIS standards should I know about?"
    
    # 1. Corpus service discovery test
    discovered = corpus_service.discover_standards_for_query(query_text, top_k=5)
    assert len(discovered) > 0
    top_standard, score = discovered[0]
    assert top_standard.is_number == "IS 2082:2018"
    assert "water heaters" in top_standard.title.lower() or "stationary storage" in top_standard.title.lower()
    assert score > 15.0

    # 2. RAG answering test
    rag_query = RAGQuery(query_text=query_text, language=RAGLanguage.EN)
    answer = rag_service.answer_query(rag_query)

    assert answer.grounding_status == GroundingStatus.PARTIALLY_GROUNDED
    assert answer.grounded is True
    assert "IS 2082:2018" in answer.answer_text
    assert "### Recommendation" in answer.answer_text
    assert "### Why it is relevant" in answer.answer_text
    assert "### Evidence limitation" in answer.answer_text
    assert answer.execution_metadata.get("response_mode") == "metadata_fallback"
    assert len(answer.citations) > 0
    assert any(c.is_number == "IS 2082:2018" for c in answer.citations)


def test_simple_geyser_query(corpus_service, rag_service):
    """Test 2: Simple product query ('I want to manufacture a geyser')."""
    query_text = "I want to manufacture a geyser"
    
    discovered = corpus_service.discover_standards_for_query(query_text, top_k=5)
    assert len(discovered) > 0
    assert discovered[0][0].is_number == "IS 2082:2018"

    rag_query = RAGQuery(query_text=query_text, language=RAGLanguage.EN)
    answer = rag_service.answer_query(rag_query)

    assert answer.grounded is True
    assert "IS 2082:2018" in answer.answer_text
    assert answer.execution_metadata.get("response_mode") == "metadata_fallback"


def test_hindi_geyser_query(corpus_service, rag_service):
    """Test 3: Hindi product query ('मैं इलेक्ट्रिक गीजर बनाना चाहता हूँ। मुझे किन BIS Standards के बारे में पता होना चाहिए?')."""
    query_text = "मैं इलेक्ट्रिक गीजर बनाना चाहता हूँ। मुझे किन BIS Standards के बारे में पता होना चाहिए?"
    
    # Corpus service discovers IS 2082:2018 for Hindi input
    discovered = corpus_service.discover_standards_for_query(query_text, top_k=5)
    assert len(discovered) > 0
    assert discovered[0][0].is_number == "IS 2082:2018"

    # RAG service generates structured Hindi response
    rag_query = RAGQuery(query_text=query_text, language=RAGLanguage.HI)
    answer = rag_service.answer_query(rag_query)

    assert answer.grounded is True
    assert "IS 2082:2018" in answer.answer_text
    assert "### सिफारिश (अनुशंसा)" in answer.answer_text
    assert "### यह क्यों प्रासंगिक है" in answer.answer_text
    assert "### संदर्भ एवं साक्ष्य सीमा" in answer.answer_text
    assert answer.execution_metadata.get("response_mode") == "metadata_fallback"


def test_unsupported_product_query(corpus_service, rag_service):
    """Test 4: Unsupported product query ('I want to manufacture a motorcycle helmet')."""
    query_text = "I want to manufacture a motorcycle helmet"
    
    # Should not find helmet standard in the curated 100-standard corpus
    discovered = corpus_service.discover_standards_for_query(query_text, top_k=5)
    assert len(discovered) == 0

    # RAG service should return honest insufficient_context
    rag_query = RAGQuery(query_text=query_text, language=RAGLanguage.EN)
    answer = rag_service.answer_query(rag_query)

    assert answer.grounding_status == GroundingStatus.INSUFFICIENT_CONTEXT
    assert answer.grounded is False
    assert len(answer.citations) == 0
    assert "does not contain sufficient information" in answer.answer_text
    assert answer.execution_metadata.get("response_mode") == "insufficient_context"


def test_generic_unsupported_query(corpus_service, rag_service):
    """Test 5: Generic conversational query without specific product ('Tell me something about Indian Standards')."""
    query_text = "Tell me something about Indian Standards"
    
    discovered = corpus_service.discover_standards_for_query(query_text, top_k=5)
    assert len(discovered) == 0

    rag_query = RAGQuery(query_text=query_text, language=RAGLanguage.EN)
    answer = rag_service.answer_query(rag_query)

    assert answer.grounding_status == GroundingStatus.INSUFFICIENT_CONTEXT
    assert answer.grounded is False


def test_deterministic_discovery_results(corpus_service, rag_service):
    """Test 6: Repeated queries produce strictly deterministic standards and ordering."""
    query_text = "I want to manufacture a 15-litre electric geyser. Which BIS standards should I know about?"
    
    results = [corpus_service.discover_standards_for_query(query_text, top_k=5) for _ in range(5)]
    first_run_standards = [s.is_number for s, _ in results[0]]
    first_run_scores = [score for _, score in results[0]]

    for run in results[1:]:
        assert [s.is_number for s, _ in run] == first_run_standards
        assert [score for _, score in run] == first_run_scores


def test_chat_api_endpoint_metadata_discovery(client):
    """Test 7: Chat API endpoint returns metadata discovery fallback with full execution metadata."""
    payload = {
        "message": "I want to manufacture a 15-litre electric geyser. Which BIS standards should I know about?",
        "language": "en",
        "top_k": 5
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["grounded"] is True
    assert data["grounding_status"] == "partially_grounded"
    assert "IS 2082:2018" in data["answer"]
    assert data["execution_metadata"].get("response_mode") == "metadata_fallback"
    assert len(data["citations"]) > 0
