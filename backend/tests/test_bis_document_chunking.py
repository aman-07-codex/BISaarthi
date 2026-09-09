"""Unit and integration tests for Phase 4C: Document Chunking & Semantic Partitioning."""

import json
from pathlib import Path
import pytest

from app.schemas.bis_document_chunking import (
    ChunkingStatus,
    ChunkType,
    DocumentChunkOutput,
)
from app.services.bis_chunk_validator import (
    validate_chunk_conservation_and_integrity,
    validate_normalization_input,
)
from app.services.bis_document_chunker import (
    chunk_normalized_document,
    parse_document_hierarchy,
    partition_into_chunks,
    run_chunking_manifest_and_save,
)


def test_parse_document_hierarchy_sections_clauses() -> None:
    """Tests hierarchical section and clause detection."""
    pages = [
        {
            "page_number": 1,
            "normalized_text": (
                "1 SCOPE\nThis standard specifies safety.\n\n"
                "6 PROTECTION AGAINST ELECTRIC SHOCK\nGeneral requirements for protection.\n\n"
                "6.1 Live Parts\nAppliance shall be constructed to prevent live contact.\n\n"
                "6.1.1 Test Probes\nStandard test probes shall be applied."
            ),
        }
    ]
    blocks = parse_document_hierarchy(pages)
    assert len(blocks) == 4
    assert blocks[0].clause == "1"
    assert blocks[0].chunk_type == ChunkType.SECTION
    assert blocks[1].section == "6"
    assert blocks[1].chunk_type == ChunkType.SECTION
    assert blocks[2].clause == "6.1"
    assert blocks[2].parent_clause == "6"
    assert blocks[2].chunk_type == ChunkType.CLAUSE
    assert blocks[3].clause == "6.1.1"
    assert blocks[3].parent_clause == "6.1"
    assert blocks[3].chunk_type == ChunkType.SUBCLAUSE


def test_parse_document_hierarchy_annexes_tables() -> None:
    """Tests detection of Annexes and Tables."""
    pages = [
        {
            "page_number": 2,
            "normalized_text": (
                "ANNEX A (Normative)\nTest procedures for water resistance.\n\n"
                "TABLE 1 Minimum Insulation Distances\nSpacing shall be at least 3.0 mm."
            ),
        }
    ]
    blocks = parse_document_hierarchy(pages)
    assert len(blocks) == 2
    assert blocks[0].chunk_type == ChunkType.ANNEX
    assert blocks[0].annex_id == "ANNEX A"
    assert blocks[1].chunk_type == ChunkType.TABLE
    assert blocks[1].table_id == "TABLE 1"


def test_parse_document_hierarchy_notes_warnings() -> None:
    """Tests detection of Notes, Warnings, and Cautions."""
    pages = [
        {
            "page_number": 1,
            "normalized_text": (
                "4 GENERAL CONDITIONS\n\n"
                "NOTE 1 Normal room temperature is assumed.\n\n"
                "WARNING High voltage test required."
            ),
        }
    ]
    blocks = parse_document_hierarchy(pages)
    assert len(blocks) == 3
    assert blocks[1].chunk_type == ChunkType.NOTE
    assert blocks[2].chunk_type == ChunkType.WARNING


def test_partition_into_chunks_atomic() -> None:
    """Tests that standard-sized clauses remain atomic single chunks."""
    pages = [
        {
            "page_number": 1,
            "normalized_text": "1 SCOPE\nThis is a standard scope description.",
        }
    ]
    blocks = parse_document_hierarchy(pages)
    meta = {"is_number": "IS 2082:2018", "category": "Electrical"}
    chunks = partition_into_chunks(blocks, meta, max_characters=1000)

    assert len(chunks) == 1
    assert chunks[0].chunk_sequence == 1
    assert chunks[0].is_oversized_subchunk is False
    assert "IS_2082_2018_c0001_section_1" in chunks[0].chunk_id


def test_partition_into_chunks_oversized_clause() -> None:
    """Tests splitting of oversized clauses across paragraph boundaries."""
    pages = [
        {
            "page_number": 1,
            "normalized_text": (
                "6.1 Protection\n"
                + "Paragraph 1 with requirement details. " * 10
                + "\n\n"
                + "Paragraph 2 with testing instructions. " * 10
            ),
        }
    ]
    blocks = parse_document_hierarchy(pages)
    meta = {"is_number": "IS 302:2024", "category": "Electrical"}
    # Set small max_characters to trigger split
    chunks = partition_into_chunks(blocks, meta, max_characters=150)

    assert len(chunks) == 2
    assert chunks[0].is_oversized_subchunk is True
    assert chunks[0].subchunk_index == 1
    assert chunks[0].subchunk_total == 2
    assert chunks[1].subchunk_index == 2
    assert "_p1" in chunks[0].chunk_id
    assert "_p2" in chunks[1].chunk_id


def test_deterministic_chunk_ids() -> None:
    """Tests that chunk ID generation is 100% deterministic and reproducible."""
    pages = [
        {
            "page_number": 1,
            "normalized_text": "1 SCOPE\nScope text.\n\n2 REFERENCES\nRef text.",
        }
    ]
    meta = {"is_number": "IS 694:2010", "category": "Cables"}
    blocks1 = parse_document_hierarchy(pages)
    chunks1 = partition_into_chunks(blocks1, meta)

    blocks2 = parse_document_hierarchy(pages)
    chunks2 = partition_into_chunks(blocks2, meta)

    assert len(chunks1) == len(chunks2)
    for c1, c2 in zip(chunks1, chunks2):
        assert c1.chunk_id == c2.chunk_id
        assert c1.chunk_sequence == c2.chunk_sequence


def test_multi_page_chunk_provenance() -> None:
    """Tests that blocks spanning multiple pages record all source page numbers."""
    pages = [
        {
            "page_number": 1,
            "normalized_text": "6.1 Continuous Requirement\nPart A on page 1.",
        },
        {
            "page_number": 2,
            "normalized_text": "Part B on page 2.",
        },
    ]
    blocks = parse_document_hierarchy(pages)
    meta = {"is_number": "IS 302:2024", "category": "Electrical"}
    chunks = partition_into_chunks(blocks, meta)

    assert len(chunks) == 1
    assert chunks[0].source_pages == [1, 2]


def test_validate_normalization_input() -> None:
    """Tests validation of Phase 4B input document structure."""
    valid_doc = {
        "is_number": "IS 2082:2018",
        "source_pdf": "data/IS_2082.pdf",
        "source_pdf_sha256": "abc12345",
        "page_count": 1,
        "pages": [{"page_number": 1, "normalized_text": "Scope"}],
    }
    is_valid, issues = validate_normalization_input(valid_doc)
    assert is_valid is True
    assert len(issues) == 0

    invalid_doc = {"is_number": "IS 2082:2018"}
    is_valid, issues = validate_normalization_input(invalid_doc)
    assert is_valid is False
    assert len(issues) > 0


def test_validate_chunk_conservation_and_integrity_success() -> None:
    """Tests chunk integrity validation with valid sequence, IDs, and pages."""
    norm_doc = {
        "is_number": "IS 2082:2018",
        "source_pdf_sha256": "hash123",
        "pages": [{"page_number": 1, "normalized_text": "1 SCOPE\nScope text."}],
    }
    chunk_output = {
        "is_number": "IS 2082:2018",
        "source_pdf_sha256": "hash123",
        "chunks": [
            {
                "chunk_id": "IS_2082_2018_c0001_section_1",
                "chunk_sequence": 1,
                "text": "1 SCOPE\nScope text.",
                "character_count": 19,
                "source_pages": [1],
            }
        ],
    }
    is_valid, issues = validate_chunk_conservation_and_integrity(norm_doc, chunk_output)
    assert is_valid is True
    assert len(issues) == 0


def test_validate_chunk_conservation_and_integrity_failures() -> None:
    """Tests detection of duplicate chunk IDs and sequence gaps."""
    norm_doc = {
        "is_number": "IS 2082:2018",
        "source_pdf_sha256": "hash123",
        "pages": [{"page_number": 1, "normalized_text": "Text"}],
    }
    bad_chunk_output = {
        "is_number": "IS 2082:2018",
        "source_pdf_sha256": "hash123",
        "chunks": [
            {
                "chunk_id": "duplicate_id",
                "chunk_sequence": 1,
                "text": "Text 1",
                "character_count": 6,
                "source_pages": [1],
            },
            {
                "chunk_id": "duplicate_id",
                "chunk_sequence": 3,  # Sequence gap
                "text": "Text 2",
                "character_count": 6,
                "source_pages": [99],  # Invalid page
            },
        ],
    }
    is_valid, issues = validate_chunk_conservation_and_integrity(norm_doc, bad_chunk_output)
    assert is_valid is False
    assert any("Duplicate chunk_id" in i for i in issues)
    assert any("sequence" in i for i in issues)
    assert any("invalid page number" in i for i in issues)


def test_chunk_normalized_document_end_to_end(tmp_path: Path) -> None:
    """Tests full end-to-end chunking on synthetic normalized JSON."""
    synthetic_norm = {
        "standard_id": 1001,
        "standard_enc_id": "enc_1001",
        "is_number": "IS 2082:2018",
        "title": "Water Heaters",
        "category": "Electrical Appliances & Accessories",
        "source_pdf": "data/bis_documents/verified/IS_2082_2018.pdf",
        "source_pdf_sha256": "abc1234567890",
        "source_extraction_file": "data/bis_documents/extracted/IS_2082_2018.json",
        "source_normalization_path": "data/bis_documents/normalized/IS_2082_2018.json",
        "page_count": 2,
        "pages": [
            {
                "page_number": 1,
                "normalized_text": "1 SCOPE\nThis standard covers electric water heaters.\n\n2 REFERENCES\nIS 302 Safety.",
            },
            {
                "page_number": 2,
                "normalized_text": "3 REQUIREMENTS\nMinimum wall thickness shall be 0.5 mm at 230 V.",
            },
        ],
    }

    output = chunk_normalized_document(synthetic_norm, output_dir=tmp_path)

    assert output.is_number == "IS 2082:2018"
    assert output.total_chunks == 3
    assert output.chunking_status == ChunkingStatus.CHUNKED
    assert (tmp_path / "IS_2082_2018.json").exists()


def test_production_chunking_manifest_initial_state() -> None:
    """Verifies that the production chunking manifest accurately reflects 100 standards, 0 chunked."""
    manifest_path = Path(__file__).resolve().parent.parent / "docs" / "bis_document_chunking_manifest.json"
    assert manifest_path.exists(), "Production chunking manifest JSON must exist"

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["summary"]["total_standards"] == 100
    assert data["summary"]["chunked_count"] == 0
    assert data["summary"]["not_chunked_count"] == 100
    assert data["summary"]["total_chunks_produced"] == 0
    assert len(data["categories_breakdown"]) == 5


def test_run_chunking_manifest_and_save_synthetic(tmp_path: Path) -> None:
    """Tests manifest generation on synthetic normalized files."""
    corpus_manifest = {
        "categories": [
            {
                "name": "Electrical Appliances",
                "standards": [
                    {"standard_id": 1, "is_number": "IS 2082:2018", "title": "Water Heaters"},
                    {"standard_id": 2, "is_number": "IS 302:2024", "title": "Safety"},
                ],
            }
        ]
    }
    corpus_path = tmp_path / "corpus.json"
    with open(corpus_path, "w", encoding="utf-8") as f:
        json.dump(corpus_manifest, f)

    norm_dir = tmp_path / "normalized"
    norm_dir.mkdir()
    chunks_dir = tmp_path / "chunks"
    docs_json = tmp_path / "chunk_manifest.json"
    docs_md = tmp_path / "chunk_manifest.md"

    # Create normalized file only for IS 2082:2018
    std1_data = {
        "standard_id": 1,
        "is_number": "IS 2082:2018",
        "title": "Water Heaters",
        "category": "Electrical Appliances",
        "source_pdf": "data/IS_2082.pdf",
        "source_pdf_sha256": "abcdef",
        "source_extraction_file": "data/extracted.json",
        "source_normalization_path": "data/normalized.json",
        "page_count": 1,
        "pages": [{"page_number": 1, "normalized_text": "1 SCOPE\nScope content."}],
    }
    with open(norm_dir / "IS_2082_2018.json", "w", encoding="utf-8") as f:
        json.dump(std1_data, f)

    manifest = run_chunking_manifest_and_save(
        manifest_path=corpus_path,
        normalized_dir=norm_dir,
        chunks_dir=chunks_dir,
        docs_manifest_path=docs_json,
        docs_md_path=docs_md,
    )

    assert manifest.summary.total_standards == 2
    assert manifest.summary.chunked_count == 1
    assert manifest.summary.not_chunked_count == 1
    assert (chunks_dir / "IS_2082_2018.json").exists()
    assert docs_json.exists()
    assert docs_md.exists()
