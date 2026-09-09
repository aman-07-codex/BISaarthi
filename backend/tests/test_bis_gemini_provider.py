"""Unit and integration tests for Phase 8A-4: Google Gemini Provider & RAG Integration."""

from unittest.mock import MagicMock, patch
import pytest

from app.schemas.bis_rag import GroundingStatus, RAGContext, RAGLanguage, RAGQuery
from app.schemas.bis_retrieval import CitationReference
from app.services.bis_grounding_validator import GroundingValidator
from app.services.bis_llm_provider import GeminiLLMProvider, MockLLMProvider, get_llm_provider
from app.services.bis_rag import BISRAGService
from app.services.bis_retrieval import BISRetrievalService


class MockModelResponse:
    """Mock structure mimicking Google GenAI GenerateContentResponse."""
    def __init__(self, text: str):
        self.text = text


@pytest.fixture
def mock_context():
    """Sample RAGContext fixtures for testing."""
    return [
        RAGContext(
            chunk_id="chunk-001",
            is_number="IS 2082:2018",
            title="Stationary storage type electric water heaters",
            category="Electrical Appliances & Accessories",
            chunk_type="normative_clause",
            clause="5.2",
            source_pages=[12],
            source_pdf="IS_2082_2018.pdf",
            source_pdf_sha256="abc123sha",
            source_chunk_path="chunks/chunk_001.json",
            text="The standing loss of stationary storage water heaters shall not exceed 1.2 kWh per 24 hours.",
            citation=CitationReference(
                citation_id="cit-001",
                is_number="IS 2082:2018",
                clause="5.2",
                chunk_id="chunk-001",
                formatted_citation="IS 2082:2018, Clause 5.2",
            ),
        )
    ]


def test_gemini_provider_successful_synthesis(mock_context):
    """Test 1: Mocked Gemini client returns grounded output."""
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = MockModelResponse(
        "According to IS 2082:2018, Clause 5.2, standing loss must not exceed 1.2 kWh per 24 hours."
    )

    provider = GeminiLLMProvider(api_key="test-dummy-key", client=mock_client)
    assert provider.provider_name == "gemini:gemini-3.5-flash-lite"
    assert provider.is_available is True

    answer = provider.generate_answer(
        prompt="Test Prompt",
        context=mock_context,
        language=RAGLanguage.EN,
    )

    assert "IS 2082:2018" in answer
    assert "Clause 5.2" in answer
    assert "1.2 kWh" in answer
    mock_client.models.generate_content.assert_called_once()


def test_gemini_provider_timeout_handling(mock_context):
    """Test 2: Timeout exception triggers fallback gracefully."""
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = TimeoutError("Request timed out")

    provider = GeminiLLMProvider(api_key="test-dummy-key", client=mock_client)
    answer = provider.generate_answer(
        prompt="Test Prompt",
        context=mock_context,
        language=RAGLanguage.EN,
    )

    # Should fall back to mock deterministic output without raising
    assert "IS 2082:2018" in answer
    assert "Clause 5.2" in answer


def test_gemini_provider_api_error_handling(mock_context):
    """Test 3: API exception triggers fallback gracefully."""
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = RuntimeError("503 Service Unavailable")

    provider = GeminiLLMProvider(api_key="test-dummy-key", client=mock_client)
    answer = provider.generate_answer(
        prompt="Test Prompt",
        context=mock_context,
        language=RAGLanguage.EN,
    )

    assert "IS 2082:2018" in answer


def test_gemini_provider_empty_response_handling(mock_context):
    """Test 4: Empty response text from Gemini triggers fallback."""
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = MockModelResponse("")

    provider = GeminiLLMProvider(api_key="test-dummy-key", client=mock_client)
    answer = provider.generate_answer(
        prompt="Test Prompt",
        context=mock_context,
        language=RAGLanguage.EN,
    )

    assert "IS 2082:2018" in answer


def test_gemini_provider_missing_key_fallback(mock_context):
    """Test 5: Provider with missing API key falls back seamlessly."""
    provider = GeminiLLMProvider(api_key=None, client=None)
    assert provider.is_available is False

    answer = provider.generate_answer(
        prompt="Test Prompt",
        context=mock_context,
        language=RAGLanguage.EN,
    )
    assert "IS 2082:2018" in answer


def test_rag_pipeline_with_gemini_provider(mock_context):
    """Test 6: Full RAG pipeline with Gemini provider and grounding validation."""
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = MockModelResponse(
        "Based on IS 2082:2018, Clause 5.2, stationary storage water heaters have a standing loss limit."
    )

    gemini_provider = GeminiLLMProvider(api_key="test-key", client=mock_client)
    
    # Mock retrieval service returning mock_context
    retrieval_service = BISRetrievalService()
    rag_service = BISRAGService(
        retrieval_service=retrieval_service,
        llm_provider=gemini_provider,
    )

    # Patch retrieval so it returns candidates
    with patch.object(retrieval_service, "retrieve") as mock_retrieve:
        from app.schemas.bis_retrieval import RetrievalCandidate, RetrievalResponse
        mock_cand = RetrievalCandidate(
            chunk_id="chunk-001",
            is_number="IS 2082:2018",
            title="Stationary storage type electric water heaters",
            category="Electrical Appliances & Accessories",
            chunk_type="normative_clause",
            clause="5.2",
            source_pages=[12],
            source_pdf="IS_2082_2018.pdf",
            source_pdf_sha256="abc123sha",
            source_chunk_path="chunks/chunk_001.json",
            text="Standing loss limit 1.2 kWh per 24 hours.",
            citation=mock_context[0].citation,
            score=0.95,
        )
        mock_retrieve.return_value = RetrievalResponse(
            query={"query_text": "water heater standing loss"},
            results=[mock_cand],
            total_candidates=1,
            retrieval_methods_used=[],
            filters_applied={},
            citations=[mock_context[0].citation],
            execution_metadata={},
        )

        query = RAGQuery(query_text="What is the standing loss requirement for water heaters?")
        answer = rag_service.answer_query(query)

        assert answer.grounded is True
        assert answer.grounding_status == GroundingStatus.GROUNDED
        assert "IS 2082:2018" in answer.answer_text
        assert "gemini:" in answer.execution_metadata.get("llm_provider", "")


def test_metadata_fallback_with_gemini_provider():
    """Test 7: Metadata fallback synthesized naturally via Gemini."""
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = MockModelResponse(
        "### Recommendation\n"
        "For manufacturing a 15-litre electric geyser, **IS 2082:2018** is the primary applicable Indian Standard in the BISaarthi corpus.\n\n"
        "### Why it is relevant\n"
        "It covers the product specifications for stationary storage type electric water heaters.\n\n"
        "### Other standards to review\n"
        "You may also review **IS 302 (Part 1):2024** for general appliance safety.\n\n"
        "### Evidence limitation\n"
        "This recommendation is based on BISaarthi's curated corpus metadata. Official BIS documents are required for exact compliance."
    )

    gemini_provider = GeminiLLMProvider(api_key="test-key", client=mock_client)
    rag_service = BISRAGService(llm_provider=gemini_provider)

    query = RAGQuery(query_text="I want to manufacture a 15-litre electric geyser. Which BIS standards should I know about?")
    answer = rag_service.answer_query(query)

    assert answer.grounded is True
    assert answer.grounding_status == GroundingStatus.PARTIALLY_GROUNDED
    assert "IS 2082:2018" in answer.answer_text
    assert "IS 302 (Part 1):2024" in answer.answer_text
    assert answer.execution_metadata.get("response_mode") == "metadata_fallback"
    assert "gemini:" in answer.execution_metadata.get("llm_provider", "")


def test_gemini_hallucination_detection(mock_context):
    """Test 8: Grounding validator catches and flags hallucinated standards or clauses from LLM."""
    validator = GroundingValidator()
    
    # LLM hallucinated non-existent standard IS 9999 and Clause 99.1
    hallucinated_answer = (
        "According to IS 9999, Clause 99.1, all water heaters must operate at exactly 5000 Volts."
    )

    citations = [mock_context[0].citation]
    val_result = validator.validate(
        answer_text=hallucinated_answer,
        context=mock_context,
        citations=citations,
    )

    assert val_result.grounded is False
    assert val_result.status in (GroundingStatus.UNSUPPORTED, GroundingStatus.PARTIALLY_GROUNDED)
    assert any("IS 9999" in u for u in val_result.unsupported_claims)


def test_gemini_hindi_synthesis():
    """Test 9: Hindi query synthesis preserves exact IS numbers."""
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = MockModelResponse(
        "### सिफारिश (अनुशंसा)\n"
        "इलेक्ट्रिक गीजर के लिए मुख्य मानक **IS 2082:2018** है।\n\n"
        "### यह क्यों प्रासंगिक है\n"
        "यह स्टेशनरी स्टोरेज इलेक्ट्रिक वॉटर हीटर के विनिर्देशों को निर्धारित करता है।\n\n"
        "### संदर्भ एवं साक्ष्य सीमा\n"
        "यह अनुशंसा बीआईएस सारथी के कॉर्पस मेटाडेटा पर आधारित है।"
    )

    gemini_provider = GeminiLLMProvider(api_key="test-key", client=mock_client)
    rag_service = BISRAGService(llm_provider=gemini_provider)

    query = RAGQuery(
        query_text="मैं इलेक्ट्रिक गीजर बनाना चाहता हूँ। मुझे किन BIS Standards के बारे में पता होना चाहिए?",
        language=RAGLanguage.HI,
    )
    answer = rag_service.answer_query(query)

    assert answer.grounded is True
    assert "IS 2082:2018" in answer.answer_text
    assert "सिफारिश" in answer.answer_text
    assert answer.execution_metadata.get("response_mode") == "metadata_fallback"


def test_get_llm_provider_factory():
    """Test 10: Provider factory selection."""
    from app.core.config import settings
    mock_p = get_llm_provider("mock")
    assert isinstance(mock_p, MockLLMProvider)

    with patch.object(settings, "GEMINI_API_KEY", "test-key"):
        gemini_p = get_llm_provider("gemini")
        assert isinstance(gemini_p, GeminiLLMProvider)

    with patch.object(settings, "GEMINI_API_KEY", None):
        fallback_p = get_llm_provider("gemini")
        assert isinstance(fallback_p, MockLLMProvider)

