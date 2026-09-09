"""Unit and integration tests for Phase 5A: Embedding Architecture & Vector Store Interface."""

import json
from pathlib import Path
import pytest

from app.schemas.bis_embedding import (
    EmbeddingConfig,
    EmbeddingProviderType,
    EmbeddingStatus,
    VectorRecord,
)
from app.services.bis_embedding import (
    EmbeddingService,
    run_embedding_manifest_and_save,
)
from app.services.bis_embedding_provider import MockEmbeddingProvider
from app.services.bis_embedding_validator import (
    generate_deterministic_vector_id,
    validate_chunk_input_for_embedding,
    validate_vector_record,
)
from app.services.bis_vector_store import (
    InMemoryVectorStore,
    cosine_similarity,
)


def test_mock_embedding_provider_determinism() -> None:
    """Tests that MockEmbeddingProvider generates identical vectors for identical inputs."""
    provider = MockEmbeddingProvider(dimension=256)
    v1 = provider.embed_text("1 SCOPE - Electric Water Heaters")
    v2 = provider.embed_text("1 SCOPE - Electric Water Heaters")
    assert v1 == v2
    assert len(v1) == 256


def test_mock_embedding_provider_distinctness() -> None:
    """Tests that distinct inputs produce distinct mock vectors."""
    provider = MockEmbeddingProvider(dimension=128)
    v1 = provider.embed_text("1 SCOPE")
    v2 = provider.embed_text("6 PROTECTION AGAINST ELECTRIC SHOCK")
    assert v1 != v2


def test_mock_embedding_provider_dimension() -> None:
    """Tests that configured dimensions are strictly respected."""
    p1 = MockEmbeddingProvider(dimension=64)
    p2 = MockEmbeddingProvider(dimension=1024)
    assert len(p1.embed_text("Text")) == 64
    assert len(p2.embed_text("Text")) == 1024


def test_mock_embedding_provider_empty_input_rejection() -> None:
    """Tests that empty or whitespace-only inputs are rejected."""
    provider = MockEmbeddingProvider()
    with pytest.raises(ValueError, match="Cannot embed empty"):
        provider.embed_text("")
    with pytest.raises(ValueError, match="Cannot embed empty"):
        provider.embed_text("   \n  \t ")


def test_mock_embedding_provider_batch() -> None:
    """Tests batch embedding behavior matches sequential embedding."""
    provider = MockEmbeddingProvider(dimension=128)
    texts = ["1 SCOPE", "2 REFERENCES", "3 TERMINOLOGY"]
    batch_vecs = provider.embed_batch(texts)
    assert len(batch_vecs) == 3
    for text, vec in zip(texts, batch_vecs):
        assert vec == provider.embed_text(text)


def test_deterministic_vector_id_generation() -> None:
    """Tests that vector ID generation is deterministic and structured."""
    v_id = generate_deterministic_vector_id(
        chunk_id="IS_2082_2018_c0001_section_1",
        provider="mock",
        model_name="mock-embedding-v1",
        dimension=768,
    )
    assert v_id == "IS_2082_2018_c0001_section_1__emb_mock_mock_embedding_v1_768"


def test_validate_chunk_input_for_embedding() -> None:
    """Tests validation of Phase 4C chunk input before embedding."""
    valid_chunk = {
        "chunk_id": "IS_2082_2018_c0001_section_1",
        "is_number": "IS 2082:2018",
        "text": "1 SCOPE\nThis standard specifies requirements.",
        "source_pdf_sha256": "abcdef123",
        "source_pages": [1],
    }
    is_valid, issues = validate_chunk_input_for_embedding(valid_chunk)
    assert is_valid is True
    assert len(issues) == 0

    invalid_chunk = {
        "chunk_id": "IS_2082_2018_c0001_section_1",
        "text": "",  # Empty text
    }
    is_valid, issues = validate_chunk_input_for_embedding(invalid_chunk)
    assert is_valid is False
    assert len(issues) > 0


def test_validate_vector_record() -> None:
    """Tests vector record dimension and finiteness validation."""
    record = VectorRecord(
        vector_id="vec_1",
        chunk_id="chunk_1",
        is_number="IS 2082:2018",
        category="Electrical",
        chunk_type="clause",
        source_pdf="pdf.pdf",
        source_pdf_sha256="hash123",
        source_chunk_path="chunk.json",
        embedding_provider="mock",
        embedding_model="mock-v1",
        embedding_dimension=4,
        embedding=[0.5, -0.5, 0.5, -0.5],
        created_at="2026-09-08T18:00:00Z",
    )
    is_valid, issues = validate_vector_record(record, expected_dimension=4)
    assert is_valid is True

    # Test dimension mismatch
    is_valid_bad, issues_bad = validate_vector_record(record, expected_dimension=8)
    assert is_valid_bad is False
    assert any("dimension" in i.lower() for i in issues_bad)


def test_in_memory_vector_store_crud() -> None:
    """Tests CRUD operations in InMemoryVectorStore."""
    store = InMemoryVectorStore(expected_dimension=3)
    rec1 = VectorRecord(
        vector_id="vec_1",
        chunk_id="c_1",
        is_number="IS 2082:2018",
        category="Electrical",
        chunk_type="clause",
        source_pdf="pdf1.pdf",
        source_pdf_sha256="hash1",
        source_chunk_path="c1.json",
        embedding_provider="mock",
        embedding_model="mock-v1",
        embedding_dimension=3,
        embedding=[1.0, 0.0, 0.0],
        created_at="2026-09-08T18:00:00Z",
    )
    store.upsert([rec1])
    assert store.count() == 1
    assert store.get("vec_1") is not None

    deleted = store.delete(["vec_1"])
    assert deleted == 1
    assert store.count() == 0
    assert store.get("vec_1") is None


def test_in_memory_vector_store_cosine_similarity() -> None:
    """Tests cosine similarity ranking in InMemoryVectorStore."""
    store = InMemoryVectorStore(expected_dimension=3)
    r1 = VectorRecord(
        vector_id="v_x",
        chunk_id="c_x",
        is_number="IS 100",
        category="CatA",
        chunk_type="clause",
        source_pdf="pdf.pdf",
        source_pdf_sha256="hash",
        source_chunk_path="c.json",
        embedding_provider="mock",
        embedding_model="m",
        embedding_dimension=3,
        embedding=[1.0, 0.0, 0.0],
        created_at="2026-09-08T18:00:00Z",
    )
    r2 = VectorRecord(
        vector_id="v_y",
        chunk_id="c_y",
        is_number="IS 200",
        category="CatB",
        chunk_type="clause",
        source_pdf="pdf.pdf",
        source_pdf_sha256="hash",
        source_chunk_path="c.json",
        embedding_provider="mock",
        embedding_model="m",
        embedding_dimension=3,
        embedding=[0.0, 1.0, 0.0],
        created_at="2026-09-08T18:00:00Z",
    )
    store.upsert([r1, r2])

    query = [1.0, 0.1, 0.0]
    results = store.similarity_search(query, top_k=2)

    assert len(results) == 2
    assert results[0].record.vector_id == "v_x"
    assert results[0].score > results[1].score


def test_in_memory_vector_store_metadata_filtering() -> None:
    """Tests structured metadata filtering during vector similarity search."""
    store = InMemoryVectorStore(expected_dimension=2)
    r1 = VectorRecord(
        vector_id="v1",
        chunk_id="c1",
        is_number="IS 2082:2018",
        category="Electrical",
        chunk_type="clause",
        clause="1.1",
        source_pdf="pdf.pdf",
        source_pdf_sha256="hash",
        source_chunk_path="c.json",
        embedding_provider="mock",
        embedding_model="m",
        embedding_dimension=2,
        embedding=[1.0, 0.0],
        created_at="2026-09-08T18:00:00Z",
    )
    r2 = VectorRecord(
        vector_id="v2",
        chunk_id="c2",
        is_number="IS 302:2024",
        category="Electrical",
        chunk_type="clause",
        clause="6.1",
        source_pdf="pdf.pdf",
        source_pdf_sha256="hash",
        source_chunk_path="c.json",
        embedding_provider="mock",
        embedding_model="m",
        embedding_dimension=2,
        embedding=[0.9, 0.1],
        created_at="2026-09-08T18:00:00Z",
    )
    store.upsert([r1, r2])

    # Search filtered by is_number="IS 302:2024"
    results = store.similarity_search(
        [1.0, 0.0],
        top_k=5,
        filters={"is_number": "IS 302:2024"}
    )
    assert len(results) == 1
    assert results[0].record.vector_id == "v2"


def test_embedding_service_end_to_end() -> None:
    """Tests end-to-end embedding orchestration from synthetic chunk to search."""
    config = EmbeddingConfig(
        provider=EmbeddingProviderType.MOCK,
        model_name="mock-test-v1",
        dimension=128,
        batch_size=2,
    )
    service = EmbeddingService(config=config)

    chunks = [
        {
            "chunk_id": "chunk_1",
            "is_number": "IS 2082:2018",
            "title": "Water Heaters",
            "category": "Electrical",
            "chunk_type": "section",
            "source_pdf": "pdf.pdf",
            "source_pdf_sha256": "sha123",
            "source_chunk_path": "c.json",
            "source_pages": [1],
            "text": "1 SCOPE - Electric Water Heaters",
        },
        {
            "chunk_id": "chunk_2",
            "is_number": "IS 2082:2018",
            "title": "Water Heaters",
            "category": "Electrical",
            "chunk_type": "clause",
            "source_pdf": "pdf.pdf",
            "source_pdf_sha256": "sha123",
            "source_chunk_path": "c.json",
            "source_pages": [2],
            "text": "2 TERMINOLOGY - Storage capacity",
        },
    ]

    records = service.embed_chunks(chunks, upsert_to_store=True)
    assert len(records) == 2
    assert service.vector_store.count() == 2

    search_res = service.search("SCOPE", top_k=2)
    assert len(search_res) == 2
    assert search_res[0].record.is_number == "IS 2082:2018"


def test_embedding_service_unsupported_provider() -> None:
    """Tests that unconfigured external providers fail explicitly."""
    config = EmbeddingConfig(provider=EmbeddingProviderType.EXTERNAL)
    with pytest.raises(ValueError, match="is not configured"):
        EmbeddingService(config=config)


def test_production_embedding_manifest_initial_state() -> None:
    """Verifies that the production embedding manifest accurately reflects 100 standards, 0 embedded."""
    manifest_path = Path(__file__).resolve().parent.parent / "docs" / "bis_embedding_manifest.json"
    assert manifest_path.exists(), "Production embedding manifest JSON must exist"

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["summary"]["total_standards"] == 100
    assert data["summary"]["embedded_count"] == 0
    assert data["summary"]["not_embedded_count"] == 100
    assert data["summary"]["total_vectors_generated"] == 0
    assert len(data["categories_breakdown"]) == 5
