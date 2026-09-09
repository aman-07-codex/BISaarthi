"""Unit and integration tests for Phase 5B: Retrieval Architecture & Hybrid Search Interface."""

import pytest

from app.schemas.bis_embedding import EmbeddingConfig, EmbeddingProviderType
from app.schemas.bis_retrieval import (
    RetrievalCandidate,
    RetrievalMethod,
    RetrievalQuery,
    RetrievalResponse,
)
from app.services.bis_citation_builder import CitationBuilder
from app.services.bis_dense_retriever import VectorStoreDenseRetriever
from app.services.bis_embedding import EmbeddingService
from app.services.bis_embedding_provider import MockEmbeddingProvider
from app.services.bis_hybrid_retriever import HybridRetriever
from app.services.bis_keyword_retriever import (
    BM25KeywordRetriever,
    tokenize_technical_text,
)
from app.services.bis_retrieval import BISRetrievalService
from app.services.bis_vector_store import InMemoryVectorStore


def test_query_validation() -> None:
    """Tests validation of RetrievalQuery model."""
    valid = RetrievalQuery(query_text="water heater requirements", top_k=5)
    assert valid.query_text == "water heater requirements"
    assert valid.top_k == 5

    # Empty query rejected
    with pytest.raises(ValueError):
        RetrievalQuery(query_text="")

    # Out of bounds top_k rejected
    with pytest.raises(ValueError):
        RetrievalQuery(query_text="test", top_k=0)
    with pytest.raises(ValueError):
        RetrievalQuery(query_text="test", top_k=500)


def test_tokenize_technical_text() -> None:
    """Tests conservative extraction of IS numbers, units, and clause numbers."""
    text = "IS 2082:2018 Clause 6.1.1 specifies 230 V, 50 Hz at 0.5 mm thickness."
    tokens = tokenize_technical_text(text)
    assert "2082" in tokens
    assert "is_2082" in tokens
    assert "230v" in tokens
    assert "50hz" in tokens
    assert "6.1.1" in tokens
    assert "6.1" in tokens
    assert "thickness" in tokens


def test_bm25_keyword_retriever_ranking() -> None:
    """Tests relevance ranking using BM25 keyword retriever on synthetic chunks."""
    retriever = BM25KeywordRetriever()
    chunks = [
        {
            "chunk_id": "c1",
            "is_number": "IS 2082:2018",
            "title": "Water Heaters",
            "category": "Electrical",
            "text": "Electric water heater storage tanks shall withstand hydrostatic pressure.",
        },
        {
            "chunk_id": "c2",
            "is_number": "IS 269:2015",
            "title": "Ordinary Portland Cement",
            "category": "Construction",
            "text": "Compressive strength requirements for 33 grade Portland cement.",
        },
    ]
    retriever.index_chunks(chunks)

    results = retriever.search("water heater hydrostatic pressure", top_k=2)
    assert len(results) == 1
    assert results[0].chunk_id == "c1"
    assert results[0].keyword_score is not None
    assert results[0].keyword_score > 0.0


def test_bm25_keyword_retriever_filtering() -> None:
    """Tests structured metadata filtering in BM25 keyword retriever."""
    retriever = BM25KeywordRetriever()
    chunks = [
        {
            "chunk_id": "c1",
            "is_number": "IS 2082:2018",
            "category": "Electrical",
            "clause": "6.1",
            "text": "Safety requirements for live parts.",
        },
        {
            "chunk_id": "c2",
            "is_number": "IS 302:2024",
            "category": "Electrical",
            "clause": "6.1",
            "text": "Safety requirements for household appliances.",
        },
    ]
    retriever.index_chunks(chunks)

    results = retriever.search(
        "Safety requirements",
        top_k=5,
        filters={"is_number": "IS 302:2024"}
    )
    assert len(results) == 1
    assert results[0].chunk_id == "c2"


def test_dense_retriever_search() -> None:
    """Tests dense vector retriever with mock embeddings."""
    provider = MockEmbeddingProvider(dimension=64)
    v_store = InMemoryVectorStore(expected_dimension=64)
    emb_service = EmbeddingService(
        config=EmbeddingConfig(dimension=64),
        provider=provider,
        vector_store=v_store,
    )

    chunks = [
        {
            "chunk_id": "c_dense_1",
            "is_number": "IS 2082:2018",
            "title": "Water Heaters",
            "category": "Electrical",
            "chunk_type": "clause",
            "source_pdf": "pdf.pdf",
            "source_pdf_sha256": "sha123",
            "source_chunk_path": "c.json",
            "source_pages": [1],
            "text": "Electric water heater insulation resistance test.",
        }
    ]
    emb_service.embed_chunks(chunks, upsert_to_store=True)

    dense_retriever = VectorStoreDenseRetriever(vector_store=v_store, provider=provider)
    dense_retriever.register_chunk_lookup(chunks)

    results = dense_retriever.search("insulation resistance test", top_k=2)
    assert len(results) == 1
    assert results[0].chunk_id == "c_dense_1"
    assert results[0].dense_score is not None
    assert results[0].retrieval_methods == [RetrievalMethod.DENSE]


def test_hybrid_retriever_rrf_fusion_and_deduplication() -> None:
    """Tests RRF score fusion and candidate deduplication across keyword and dense search."""
    kw_retriever = BM25KeywordRetriever()
    provider = MockEmbeddingProvider(dimension=64)
    v_store = InMemoryVectorStore(expected_dimension=64)
    emb_service = EmbeddingService(
        config=EmbeddingConfig(dimension=64),
        provider=provider,
        vector_store=v_store,
    )

    chunks = [
        {
            "chunk_id": "c_both",
            "is_number": "IS 2082:2018",
            "title": "Water Heaters",
            "category": "Electrical",
            "chunk_type": "clause",
            "source_pdf": "pdf.pdf",
            "source_pdf_sha256": "sha123",
            "source_chunk_path": "c.json",
            "source_pages": [1],
            "text": "Hydrostatic pressure testing requirements.",
        },
        {
            "chunk_id": "c_kw_only",
            "is_number": "IS 2082:2018",
            "title": "Water Heaters",
            "category": "Electrical",
            "chunk_type": "clause",
            "source_pdf": "pdf.pdf",
            "source_pdf_sha256": "sha123",
            "source_chunk_path": "c.json",
            "source_pages": [2],
            "text": "Hydrostatic tank construction details.",
        },
    ]

    kw_retriever.index_chunks(chunks)
    emb_service.embed_chunks(chunks, upsert_to_store=True)

    dense_retriever = VectorStoreDenseRetriever(vector_store=v_store, provider=provider)
    dense_retriever.register_chunk_lookup(chunks)

    hybrid = HybridRetriever(keyword_retriever=kw_retriever, dense_retriever=dense_retriever)

    query = RetrievalQuery(
        query_text="Hydrostatic pressure testing",
        top_k=5,
        retrieval_method=RetrievalMethod.HYBRID,
    )
    results = hybrid.search(query)

    assert len(results) == 2
    # The chunk retrieved by both methods should have dual attribution
    c_both_match = next(c for c in results if c.chunk_id == "c_both")
    assert RetrievalMethod.KEYWORD in c_both_match.retrieval_methods
    assert RetrievalMethod.DENSE in c_both_match.retrieval_methods
    assert c_both_match.citation is not None


def test_citation_builder_formatting_and_no_fabrication() -> None:
    """Tests citation formatting and verification that missing fields are not fabricated."""
    data = {
        "is_number": "IS 2082:2018",
        "title": "Stationary storage type electric water heaters",
        "clause": "6.1",
        "clause_title": "Live parts",
        "source_pages": [12, 13],
        "chunk_id": "c12",
        "source_pdf_sha256": "abcdef1234567890",
        "source_chunk_path": "data/c12.json",
    }
    cite = CitationBuilder.build_citation(data, citation_index=1)
    assert cite.citation_id == "cite_001"
    assert cite.is_number == "IS 2082:2018"
    assert "Clause 6.1 (Live parts)" in cite.formatted_citation
    assert "pp. 12-13" in cite.formatted_citation
    assert cite.source_pdf_sha256 == "abcdef1234567890"

    # Test missing fields (no fabrication)
    minimal_data = {"is_number": "IS 456:2000"}
    cite_min = CitationBuilder.build_citation(minimal_data, citation_index=2)
    assert "General Requirements" in cite_min.formatted_citation
    assert "Page N/A" in cite_min.formatted_citation
    assert cite_min.source_pdf_sha256 is None


def test_retrieval_service_end_to_end_synthetic() -> None:
    """Tests full end-to-end BISRetrievalService workflow with synthetic chunks."""
    service = BISRetrievalService()

    synthetic_chunks = [
        {
            "chunk_id": "syn_1",
            "is_number": "IS 2082:2018",
            "title": "Water Heaters",
            "category": "Electrical Appliances",
            "chunk_type": "clause",
            "clause": "4.1",
            "source_pdf": "IS_2082.pdf",
            "source_pdf_sha256": "sha999",
            "source_chunk_path": "chunks/syn_1.json",
            "source_pages": [5],
            "text": "Rated input power of water heaters shall not exceed 3000 W at 230 V.",
        }
    ]

    service.index_chunks(synthetic_chunks)

    response = service.retrieve("input power in water heaters")
    assert isinstance(response, RetrievalResponse)
    assert response.total_candidates == 1
    assert response.results[0].chunk_id == "syn_1"
    assert len(response.citations) == 1
    assert "IS 2082:2018" in response.citations[0].formatted_citation


def test_retrieval_service_empty_corpus() -> None:
    """Tests that querying an empty retrieval index returns zero results safely."""
    service = BISRetrievalService()
    response = service.retrieve("nonexistent requirements")
    assert response.total_candidates == 0
    assert len(response.results) == 0
    assert len(response.citations) == 0
