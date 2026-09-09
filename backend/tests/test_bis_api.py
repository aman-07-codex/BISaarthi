"""Comprehensive test suite for Phase 7A: FastAPI MVP Backend Integration."""

import httpx
import pytest

from app.api.routes.chat import get_rag_service
from app.main import app
from app.schemas.bis_rag import GroundingStatus, RAGLanguage
from app.services.bis_rag import BISRAGService
from app.services.bis_retrieval import BISRetrievalService


# =====================================================================
# 1. Health Endpoint Tests
# =====================================================================

@pytest.mark.asyncio
async def test_api_health_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {
            "status": "ok",
            "service": "BISaarthi API",
        }


# =====================================================================
# 2. Find Standards & Corpus Discovery Tests
# =====================================================================

@pytest.mark.asyncio
async def test_find_standards_corpus_fallback():
    """When db is None, lists all 100 authoritative standards from corpus manifest."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/standards")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 100
        assert len(data["items"]) == 20
        assert data["page"] == 1
        assert data["page_size"] == 20


@pytest.mark.asyncio
async def test_find_standards_keyword_search_geyser():
    """Search for 'geyser' matches IS 2082:2018 in authoritative corpus with reason_selected."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/standards?q=geyser")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        is_numbers = [item["is_number"] for item in data["items"]]
        assert any("2082" in is_num for is_num in is_numbers)
        matching_2082 = next(item for item in data["items"] if "2082" in item["is_number"])
        assert matching_2082.get("reason_selected") is not None
        assert "storage electric water heaters" in matching_2082["reason_selected"].lower()
        assert matching_2082.get("primary_use_case") is not None


@pytest.mark.asyncio
async def test_find_standards_keyword_search_cement():
    """Search for 'cement' matches cement and concrete standards."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/standards?q=cement")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 5
        is_numbers = [item["is_number"] for item in data["items"]]
        assert any("269" in is_num or "455" in is_num or "1489" in is_num for is_num in is_numbers)


@pytest.mark.asyncio
async def test_find_standards_category_filter():
    """Filter by Electrical category."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/standards?category=Electrical")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 21
        for item in data["items"]:
            assert "Electrical" in item["categories"][0]


@pytest.mark.asyncio
async def test_find_standards_pagination():
    """Pagination works deterministically."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res1 = await client.get("/api/standards?page=1&page_size=10")
        assert res1.status_code == 200
        data1 = res1.json()
        assert len(data1["items"]) == 10
        assert data1["page"] == 1

        res2 = await client.get("/api/standards?page=2&page_size=10")
        assert res2.status_code == 200
        data2 = res2.json()
        assert len(data2["items"]) == 10
        assert data2["page"] == 2

        # Check disjoint sets
        items1 = {it["is_number"] for it in data1["items"]}
        items2 = {it["is_number"] for it in data2["items"]}
        assert items1.isdisjoint(items2)


# =====================================================================
# 3. Standard Details Tests
# =====================================================================

@pytest.mark.asyncio
async def test_get_standard_detail_by_is_number():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/standards/IS 2082:2018")
        assert response.status_code == 200
        data = response.json()
        assert data["is_number"] == "IS 2082:2018"
        assert "water heaters" in data["title"].lower()
        assert "Electrical" in data["categories"][0]


@pytest.mark.asyncio
async def test_get_standard_detail_by_standard_id():
    """Resolving by standard_id 18707 (IS 2082)."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/standards/18707")
        assert response.status_code == 200
        data = response.json()
        assert data["is_number"] == "IS 2082:2018"


@pytest.mark.asyncio
async def test_get_standard_detail_not_found():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/standards/IS-NONEXISTENT-99999")
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "NOT_FOUND"


# =====================================================================
# 4. Compare Standards Tests
# =====================================================================

@pytest.mark.asyncio
async def test_compare_standards_valid_pair():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "standard_a": "IS 2082:2018",
            "standard_b": "IS 302 (Part 1):2024",
        }
        response = await client.post("/api/standards/compare", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["standard_a"]["is_number"] == "IS 2082:2018"
        assert data["standard_b"]["is_number"] == "IS 302 (Part 1):2024"
        assert "comparison" in data
        assert data["comparison"]["category"]["same"] is True
        assert data["comparison"]["department"]["same"] is True
        assert data["document_technical_comparison_available"] is False
        assert "technical clause difference analysis is currently unavailable" in data["message"]
        # Phase 8A-2: Natural comparison summary & relevance hint
        assert data.get("comparison_summary") is not None
        assert len(data["comparison_summary"]) > 50
        assert "IS 2082:2018" in data["comparison_summary"]
        assert "IS 302 (Part 1):2024" in data["comparison_summary"]
        assert "Electrical Appliances & Accessories" in data["comparison_summary"]
        assert data.get("relevance_hint") is not None


@pytest.mark.asyncio
async def test_compare_standards_plastics_food_contact():
    """Phase 8A-2 Test 2: IS 10146:1982 vs IS 10151:2019 without fabricated claims."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "standard_a": "IS 10146:1982",
            "standard_b": "IS 10151:2019",
        }
        response = await client.post("/api/standards/compare", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("comparison_summary") is not None
        assert "IS 10146:1982" in data["comparison_summary"]
        assert "IS 10151:2019" in data["comparison_summary"]
        # Must not fabricate legal mandate or clause claims
        assert "legally applies" not in data["comparison_summary"].lower()
        assert "qco applies" not in data["comparison_summary"].lower()
        assert "mandatory" not in data["comparison_summary"].lower() or "Technical Clause Limitation" in data["comparison_summary"]


def test_comparison_summary_insufficient_metadata_fallback():
    """Phase 8A-2 Test 3: Insufficient metadata returns neutral fallback."""
    from app.services.bis_corpus_service import BISCorpusService
    from app.schemas.bis_api import StandardDetailsResponse

    dummy_a = StandardDetailsResponse(
        is_number="IS DUMMY 1",
        title="Dummy Standard One",
        category="General",
        document_available=False,
    )
    dummy_b = StandardDetailsResponse(
        is_number="IS DUMMY 2",
        title="Dummy Standard Two",
        category="General",
        document_available=False,
    )
    summary, hint = BISCorpusService._generate_comparison_summary(dummy_a, dummy_b)
    assert "not sufficient to determine their detailed technical differences" in summary
    assert "official BIS documents are required" in summary
    assert hint is None


@pytest.mark.asyncio
async def test_compare_standards_cross_category():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "standard_a": "IS 2082:2018",  # Electrical
            "standard_b": "IS 456:2000",   # Construction
        }
        response = await client.post("/api/standards/compare", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["comparison"]["category"]["same"] is False
        assert data["comparison"]["category"]["a"] != data["comparison"]["category"]["b"]


@pytest.mark.asyncio
async def test_compare_standards_unknown_standard_404():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "standard_a": "IS 2082:2018",
            "standard_b": "IS 999999",
        }
        response = await client.post("/api/standards/compare", json=payload)
        assert response.status_code == 404


# =====================================================================
# 5. AI Chat Endpoint Tests
# =====================================================================

@pytest.mark.asyncio
async def test_chat_empty_retrieval_insufficient_context():
    """Without chunks in production retrieval index, chat returns insufficient_context."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "message": "What are the test requirements for water heaters?",
            "language": "en",
        }
        response = await client.post("/api/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["grounding_status"] == "insufficient_context"
        assert data["grounded"] is False
        assert data["citations"] == []
        assert "not contain sufficient information" in data["answer"].lower()


@pytest.mark.asyncio
async def test_chat_hindi_language_insufficient_context():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "message": "पानी के हीटर के लिए सुरक्षा आवश्यकताएं क्या हैं?",
            "language": "hi",
        }
        response = await client.post("/api/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "hi"
        assert data["grounding_status"] == "insufficient_context"
        assert "पर्याप्त जानकारी नहीं है" in data["answer"]


@pytest.mark.asyncio
async def test_chat_empty_message_validation_error():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "message": "",
            "language": "en",
        }
        response = await client.post("/api/chat", json=payload)
        assert response.status_code == 400
        data = response.json()
        assert data["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_chat_with_synthetic_rag_service():
    """Verify end-to-end grounded answer generation when synthetic chunks are present."""
    synthetic_chunks = [
        {
            "chunk_id": "SYN-API-001",
            "standard_id": 18707,
            "is_number": "IS 2082:2018",
            "title": "Stationary storage type electric water heaters",
            "category": "Electrical Appliances & Accessories",
            "chunk_type": "clause",
            "section": "6",
            "clause": "6.1",
            "parent_clause": "6",
            "source_pages": [12],
            "source_pdf": "IS.2082.2018.pdf",
            "source_pdf_sha256": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "source_chunk_path": "data/bis_chunks/IS_2082_2018/chunk_001.json",
            "text": "The water heater shall incorporate a non-self-resetting thermal cut-out to prevent water overheating beyond 95 degrees C.",
        }
    ]

    retrieval_service = BISRetrievalService()
    retrieval_service.index_chunks(synthetic_chunks)
    custom_rag_service = BISRAGService(retrieval_service=retrieval_service)

    app.dependency_overrides[get_rag_service] = lambda: custom_rag_service

    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "message": "What is the requirement for thermal cutout in water heaters?",
                "language": "en",
                "top_k": 3,
            }
            response = await client.post("/api/chat", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["grounding_status"] == "grounded"
            assert data["grounded"] is True
            assert len(data["citations"]) >= 1
            assert "IS 2082:2018" in data["answer"]
            assert "SYN-API-001" in data["retrieved_chunk_ids"]
    finally:
        app.dependency_overrides.pop(get_rag_service, None)


# =====================================================================
# 6. OpenAPI Documentation Tests
# =====================================================================

@pytest.mark.asyncio
async def test_openapi_documentation_includes_mvp_routes():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        paths = schema["paths"]
        assert "/api/health" in paths
        assert "/api/standards" in paths
        assert "/api/standards/compare" in paths
        assert "/api/standards/{is_number}" in paths
        assert "/api/chat" in paths
