"""Unit and integration tests for Phase 4B: Text Normalization & Corpus-Ready Representation."""

import json
from pathlib import Path
import pytest

from app.schemas.bis_document_normalization import (
    NormalizationQuality,
    NormalizationStatus,
    NormalizedDocumentOutput,
)
from app.services.bis_document_normalizer import (
    cleanup_hyphenation,
    cleanup_soft_linebreaks,
    detect_headings_in_text,
    normalize_extracted_document,
    normalize_page_text,
    normalize_unicode_and_whitespace,
    run_normalization_manifest_and_save,
)
from app.services.bis_normalization_validator import (
    detect_repeated_headers_footers,
    validate_extraction_input,
    validate_normalization_conservation,
)


def test_normalize_unicode_and_whitespace() -> None:
    """Tests cleanup of Unicode whitespace, zero-width characters, smart quotes, and control chars."""
    raw = "IS\u00A0302\u200B\uFEFF (Part 1)\r\n“Safety” Requirements\x07 — Test"
    cleaned = normalize_unicode_and_whitespace(raw)
    assert cleaned == 'IS 302 (Part 1)\n"Safety" Requirements - Test'


def test_cleanup_hyphenation() -> None:
    """Tests rejoining words split by hyphens at line breaks."""
    raw = "This is a standard require-\n  ment for electric water hea-\nters."
    cleaned = cleanup_hyphenation(raw)
    assert cleaned == "This is a standard requirement for electric water heaters."


def test_cleanup_soft_linebreaks() -> None:
    """Tests conservative joining of soft sentence wraps while preserving headings and lists."""
    raw = (
        "1 SCOPE\n\n"
        "This standard applies to stationary\n"
        "storage type electric water heaters\n"
        "for household use.\n\n"
        "2 REFERENCES\n\n"
        "- IS 302 (Part 1) Safety\n"
        "- IS 694 PVC Cables"
    )
    cleaned = cleanup_soft_linebreaks(raw)
    assert "1 SCOPE" in cleaned
    assert "This standard applies to stationary storage type electric water heaters for household use." in cleaned
    assert "- IS 302 (Part 1) Safety\n- IS 694 PVC Cables" in cleaned


def test_detect_headings_in_text() -> None:
    """Tests detection of clause numbers, annexures, and tables."""
    text = (
        "1 SCOPE\n"
        "Standard scope text.\n"
        "2.1 General Definitions\n"
        "Definition text.\n"
        "ANNEX A (Normative)\n"
        "TABLE 1 Minimum Thickness Requirements"
    )
    headings = detect_headings_in_text(text)
    assert "1 SCOPE" in headings
    assert "2.1 General Definitions" in headings
    assert "ANNEX A (Normative)" in headings
    assert "TABLE 1 Minimum Thickness Requirements" in headings


def test_detect_repeated_headers_footers() -> None:
    """Tests statistical detection of repeated header and footer lines across pages."""
    pages = [
        {"text": "BUREAU OF INDIAN STANDARDS\nIS 2082:2018\nPage 1 content.\nPage 1 of 4"},
        {"text": "BUREAU OF INDIAN STANDARDS\nIS 2082:2018\nPage 2 content.\nPage 2 of 4"},
        {"text": "BUREAU OF INDIAN STANDARDS\nIS 2082:2018\nPage 3 content.\nPage 3 of 4"},
        {"text": "BUREAU OF INDIAN STANDARDS\nIS 2082:2018\nPage 4 content.\nPage 4 of 4"},
    ]
    headers, footers = detect_repeated_headers_footers(pages, repetition_threshold=0.50)
    assert "BUREAU OF INDIAN STANDARDS" in headers
    assert "IS 2082:2018" in headers


def test_normalize_page_text() -> None:
    """Tests end-to-end normalization of a single page's text."""
    raw = (
        "BUREAU OF INDIAN STANDARDS\n"
        "IS 2082 : 2018\n"
        "1 SCOPE\n"
        "This standard specifies require-\n"
        "ments for storage heaters at 230\u00A0V, 50\u00A0Hz.\n"
        "Page 1 of 5"
    )
    headers = {"BUREAU OF INDIAN STANDARDS", "IS 2082 : 2018"}
    footers = {"Page 1 of 5"}

    norm_text, headings, removed = normalize_page_text(raw, headers, footers)

    assert "BUREAU OF INDIAN STANDARDS" not in norm_text
    assert "Page 1 of 5" not in norm_text
    assert "1 SCOPE" in headings
    assert "requirements for storage heaters at 230 V, 50 Hz." in norm_text
    assert "BUREAU OF INDIAN STANDARDS" in removed


def test_validate_extraction_input() -> None:
    """Tests validation of Phase 4A extraction JSON input structure."""
    valid_doc = {
        "is_number": "IS 2082:2018",
        "source_pdf": "data/bis_documents/verified/IS_2082_2018.pdf",
        "sha256": "abc12345",
        "page_count": 2,
        "pages": [{"page_number": 1, "text": "Page 1 text"}],
    }
    is_valid, issues = validate_extraction_input(valid_doc)
    assert is_valid is True
    assert len(issues) == 0

    invalid_doc = {"is_number": "IS 2082:2018"}
    is_valid, issues = validate_extraction_input(invalid_doc)
    assert is_valid is False
    assert any("Missing mandatory extraction field" in i for i in issues)


def test_validate_normalization_conservation_good() -> None:
    """Tests conservation validation on high-fidelity normalized output."""
    source_doc = {
        "is_number": "IS 2082:2018",
        "total_character_count": 1000,
        "pages": [{"page_number": 1, "text": "IS 2082:2018 Scope at 230 V and 50 Hz." * 20}],
    }
    norm_doc = {
        "normalized_total_character_count": 920,
        "pages": [{"page_number": 1, "normalized_text": "IS 2082:2018 Scope at 230 V and 50 Hz." * 19}],
    }
    quality, issues = validate_normalization_conservation(source_doc, norm_doc)
    assert quality == NormalizationQuality.GOOD
    assert len(issues) == 0


def test_validate_normalization_conservation_severe_loss() -> None:
    """Tests detection and warning when normalization reduces content excessively (<40%)."""
    source_doc = {
        "is_number": "IS 2082:2018",
        "total_character_count": 1000,
        "pages": [{"page_number": 1, "text": "Detailed standard requirements text..." * 30}],
    }
    norm_doc = {
        "normalized_total_character_count": 200,
        "pages": [{"page_number": 1, "normalized_text": "Short."}],
    }
    quality, issues = validate_normalization_conservation(source_doc, norm_doc)
    assert quality == NormalizationQuality.REQUIRES_MANUAL_REVIEW
    assert any("Severe content reduction" in i for i in issues)


def test_normalize_extracted_document_end_to_end(tmp_path: Path) -> None:
    """Tests full document normalization workflow on synthetic Phase 4A extraction JSON."""
    synthetic_extraction = {
        "standard_id": 1001,
        "standard_enc_id": "enc_1001",
        "is_number": "IS 2082:2018",
        "title": "Stationary storage type electric water heaters",
        "category": "Electrical Appliances & Accessories",
        "source_pdf": "data/bis_documents/verified/IS_2082_2018.pdf",
        "file_name": "IS_2082_2018.pdf",
        "file_size_bytes": 10240,
        "sha256": "abcdef1234567890",
        "page_count": 3,
        "extracted_page_count": 3,
        "total_character_count": 800,
        "pages": [
            {
                "page_number": 1,
                "text": "BUREAU OF INDIAN STANDARDS\nIS 2082:2018\n1 SCOPE\nThis standard covers electric water\nheaters at 230 V, 50 Hz.\nPage 1 of 3",
            },
            {
                "page_number": 2,
                "text": "BUREAU OF INDIAN STANDARDS\nIS 2082:2018\n2 TERMINOLOGY\nDefinitions of storage heaters.\nPage 2 of 3",
            },
            {
                "page_number": 3,
                "text": "BUREAU OF INDIAN STANDARDS\nIS 2082:2018\n3 REQUIREMENTS\nMinimum wall thickness shall be 0.5 mm.\nPage 3 of 3",
            },
        ],
    }

    norm_output = normalize_extracted_document(synthetic_extraction, output_dir=tmp_path)

    assert norm_output.is_number == "IS 2082:2018"
    assert norm_output.page_count == 3
    assert norm_output.normalization_status == NormalizationStatus.NORMALIZED
    assert norm_output.normalization_quality == NormalizationQuality.GOOD
    assert "1 SCOPE" in norm_output.detected_headings
    assert "2 TERMINOLOGY" in norm_output.detected_headings
    assert "3 REQUIREMENTS" in norm_output.detected_headings

    # Verify output JSON was written
    out_file = tmp_path / "IS_2082_2018.json"
    assert out_file.exists()


def test_deterministic_normalization() -> None:
    """Tests that normalizing the same input twice produces identical results."""
    doc = {
        "is_number": "IS 302 (Part 1):2024",
        "source_pdf": "data/bis_documents/verified/IS_302_1_2024.pdf",
        "sha256": "9876543210fedcba",
        "page_count": 1,
        "total_character_count": 100,
        "pages": [
            {
                "page_number": 1,
                "text": "IS 302 (Part 1):2024\n1 SCOPE\nSafety requirements for appliances.",
            }
        ],
    }
    out1 = normalize_extracted_document(doc)
    out2 = normalize_extracted_document(doc)

    assert out1.pages[0].normalized_text == out2.pages[0].normalized_text
    assert out1.character_retention_ratio == out2.character_retention_ratio
    assert out1.detected_headings == out2.detected_headings


def test_reversibility_source_text_retention() -> None:
    """Tests that normalized pages retain exact source text for reversibility."""
    doc = {
        "is_number": "IS 694:2010",
        "source_pdf": "data/bis_documents/verified/IS_694_2010.pdf",
        "sha256": "1122334455667788",
        "page_count": 1,
        "total_character_count": 80,
        "pages": [{"page_number": 1, "text": "Raw extracted source text from IS 694:2010."}],
    }
    norm_doc = normalize_extracted_document(doc)
    assert norm_doc.pages[0].source_text == "Raw extracted source text from IS 694:2010."


def test_production_normalization_manifest_initial_state() -> None:
    """Verifies that the production normalization manifest accurately reflects 100 standards, 0 normalized."""
    manifest_path = Path(__file__).resolve().parent.parent / "docs" / "bis_document_normalization_manifest.json"
    assert manifest_path.exists(), "Production normalization manifest JSON must exist"

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["summary"]["total_standards"] == 100
    assert data["summary"]["normalized_count"] == 0
    assert data["summary"]["not_normalized_count"] == 100
    assert data["summary"]["normalization_failed_count"] == 0
    assert len(data["categories_breakdown"]) == 5


def test_run_normalization_manifest_and_save_synthetic(tmp_path: Path) -> None:
    """Tests end-to-end manifest generation and output saving on synthetic extracted files."""
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

    extracted_dir = tmp_path / "extracted"
    extracted_dir.mkdir()
    norm_dir = tmp_path / "normalized"
    docs_json = tmp_path / "norm_manifest.json"
    docs_md = tmp_path / "norm_manifest.md"

    # Create extracted file only for IS 2082:2018
    std1_data = {
        "standard_id": 1,
        "is_number": "IS 2082:2018",
        "title": "Water Heaters",
        "category": "Electrical Appliances",
        "source_pdf": "data/IS_2082.pdf",
        "sha256": "abcdef",
        "page_count": 1,
        "pages": [{"page_number": 1, "text": "IS 2082:2018\n1 SCOPE\nHeater scope at 230 V, 50 Hz."}],
    }
    with open(extracted_dir / "IS_2082_2018.json", "w", encoding="utf-8") as f:
        json.dump(std1_data, f)

    manifest = run_normalization_manifest_and_save(
        manifest_path=corpus_path,
        extracted_dir=extracted_dir,
        normalized_dir=norm_dir,
        docs_manifest_path=docs_json,
        docs_md_path=docs_md,
    )

    assert manifest.summary.total_standards == 2
    assert manifest.summary.normalized_count == 1
    assert manifest.summary.not_normalized_count == 1
    assert (norm_dir / "IS_2082_2018.json").exists()
    assert docs_json.exists()
    assert docs_md.exists()

