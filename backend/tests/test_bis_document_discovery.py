"""Unit tests for BIS document discovery service, classification, and manifest generation."""

from datetime import datetime, timezone
import json
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest

from app.schemas.bis_document import (
    BISDocumentManifest,
    BISDocumentRecord,
    DiscoveryConfidence,
    DiscoveryStatus,
    PriorityLevel,
)
from app.services.bis_client import BISAPIError, BISClient
from app.services.bis_document_discovery import (
    BISDocumentDiscoveryService,
    assign_document_priority,
    generate_document_manifest_markdown,
    run_discovery_and_save_manifests,
)


@pytest.fixture
def mock_bis_client():
    """Mocked BIS client for offline testing."""
    client = MagicMock(spec=BISClient)
    return client


@pytest.fixture
def sample_manifest_standard():
    return {
        "is_number": "IS 2082:2018",
        "standard_id": 18707,
        "standard_enc_id": "test_enc_id_2082",
        "title": "Stationary storage type electric water heaters - Specification",
        "category": "Electrical Appliances & Accessories",
    }


def test_priority_assignment():
    """Verify priority assignment matches MVP demo guidelines."""
    # High priority standards
    assert assign_document_priority("IS 2082:2018") == PriorityLevel.HIGH
    assert assign_document_priority("IS 302 (Part 1):2024") == PriorityLevel.HIGH
    assert assign_document_priority("IS 302 (Part 2/Sec 3):2024") == PriorityLevel.HIGH
    assert assign_document_priority("IS 269:2015") == PriorityLevel.HIGH
    assert assign_document_priority("IS 456:2000") == PriorityLevel.HIGH
    assert assign_document_priority("IS 14543:2024") == PriorityLevel.HIGH
    assert assign_document_priority("IS 2062:2011") == PriorityLevel.HIGH
    assert assign_document_priority("IS 4984:2016") == PriorityLevel.HIGH

    # Medium priority standards
    assert assign_document_priority("IS 99999:2020") == PriorityLevel.MEDIUM
    assert assign_document_priority("IS 12252:2017") == PriorityLevel.MEDIUM


def test_document_discovery_with_exposed_url(mock_bis_client, sample_manifest_standard):
    """Test standard discovery when an official document URL is exposed."""
    mock_bis_client.resolve_standard_candidates.return_value = [
        {
            "standard_id": 18707,
            "standard_enc_id": "test_enc_id_2082",
            "standard_number": "IS 2082:2018",
            "title": "Stationary storage type electric water heaters - Specification",
            "document_url": "https://standardsadmin.bis.gov.in/docs/IS_2082_2018.pdf",
            "document_identifier": "DOC-18707",
        }
    ]

    service = BISDocumentDiscoveryService(bis_client=mock_bis_client)
    record = service.discover_standard_document(sample_manifest_standard, "Electrical")

    assert record.is_number == "IS 2082:2018"
    assert record.standard_id == 18707
    assert record.document_available is True
    assert record.document_url == "https://standardsadmin.bis.gov.in/docs/IS_2082_2018.pdf"
    assert record.document_type == "PDF"
    assert record.document_identifier == "DOC-18707"
    assert record.discovery_status == DiscoveryStatus.AVAILABLE
    assert record.discovery_confidence == DiscoveryConfidence.HIGH
    assert record.download_status == "not_downloaded"
    assert record.extraction_status == "pending"
    assert record.priority == PriorityLevel.HIGH


def test_document_discovery_not_exposed_by_api(mock_bis_client, sample_manifest_standard):
    """Test standard discovery when standard is confirmed but PDF URL is not exposed by public API."""
    mock_bis_client.resolve_standard_candidates.return_value = [
        {
            "standard_id": 18707,
            "standard_enc_id": "test_enc_id_2082",
            "standard_number": "IS 2082:2018",
            "title": "Stationary storage type electric water heaters - Specification",
            # No document_url or pdf_url exposed
        }
    ]

    service = BISDocumentDiscoveryService(bis_client=mock_bis_client)
    record = service.discover_standard_document(sample_manifest_standard, "Electrical")

    assert record.is_number == "IS 2082:2018"
    assert record.standard_id == 18707
    assert record.document_available is False
    assert record.document_url is None
    assert record.document_type is None
    assert record.discovery_status == DiscoveryStatus.NOT_EXPOSED_BY_API
    assert record.discovery_confidence == DiscoveryConfidence.HIGH
    assert record.download_status == "not_downloaded"
    assert record.extraction_status == "pending"


def test_document_discovery_not_found(mock_bis_client, sample_manifest_standard):
    """Test standard discovery when standard is not found in BIS catalogue."""
    mock_bis_client.resolve_standard_candidates.return_value = []

    service = BISDocumentDiscoveryService(bis_client=mock_bis_client)
    record = service.discover_standard_document(sample_manifest_standard, "Electrical")

    assert record.is_number == "IS 2082:2018"
    assert record.document_available is False
    assert record.discovery_status == DiscoveryStatus.NOT_FOUND
    assert record.discovery_confidence is None
    assert len(record.issues) > 0


def test_document_discovery_id_mismatch(mock_bis_client, sample_manifest_standard):
    """Test standard discovery when candidate has standard ID mismatch."""
    mock_bis_client.resolve_standard_candidates.return_value = [
        {
            "standard_id": 99999,  # Mismatched ID
            "standard_enc_id": "diff_enc_id",
            "standard_number": "IS 2082:2018",
            "title": "Stationary storage type electric water heaters",
        }
    ]

    service = BISDocumentDiscoveryService(bis_client=mock_bis_client)
    record = service.discover_standard_document(sample_manifest_standard, "Electrical")

    assert record.discovery_status == DiscoveryStatus.REQUIRES_MANUAL_REVIEW
    assert record.discovery_confidence == DiscoveryConfidence.MEDIUM
    assert any("Standard ID mismatch" in issue for issue in record.issues)


def test_document_discovery_part_section_disambiguation(mock_bis_client):
    """Ensure IS 302 Part 1 is never confused with IS 302 Part 2/Sec 3."""
    mock_bis_client.resolve_standard_candidates.return_value = [
        {
            "standard_id": 31713,
            "standard_number": "IS 302 (Part 2/Sec 3):2024",
            "title": "Safety of household and similar electrical appliances: Part 2 Section 3",
        },
        {
            "standard_id": 31712,
            "standard_number": "IS 302 (Part 1):2024",
            "title": "Safety of household and similar electrical appliances: Part 1 General requirements",
        }
    ]

    service = BISDocumentDiscoveryService(bis_client=mock_bis_client)

    part1_std = {
        "is_number": "IS 302 (Part 1):2024",
        "standard_id": 31712,
        "title": "Safety of household - Part 1",
    }
    record1 = service.discover_standard_document(part1_std, "Electrical")
    assert record1.standard_id == 31712
    assert record1.discovery_status == DiscoveryStatus.NOT_EXPOSED_BY_API

    part2_std = {
        "is_number": "IS 302 (Part 2/Sec 3):2024",
        "standard_id": 31713,
        "title": "Safety of household - Part 2 Sec 3",
    }
    record2 = service.discover_standard_document(part2_std, "Electrical")
    assert record2.standard_id == 31713
    assert record2.discovery_status == DiscoveryStatus.NOT_EXPOSED_BY_API


def test_document_discovery_api_error(mock_bis_client, sample_manifest_standard):
    """Test standard discovery when an API error occurs."""
    mock_bis_client.resolve_standard_candidates.side_effect = BISAPIError(
        "Service Unavailable", status_code=503, endpoint="https://standardsadmin.bis.gov.in/proposal-service/getWebsiteIndianStandardsList"
    )

    service = BISDocumentDiscoveryService(bis_client=mock_bis_client)
    record = service.discover_standard_document(sample_manifest_standard, "Electrical")

    assert record.discovery_status == DiscoveryStatus.API_ERROR
    assert record.discovery_confidence is None
    assert any("BIS API Error" in issue for issue in record.issues)


def test_manifest_discovery_and_markdown_generation(tmp_path, mock_bis_client):
    """Test full corpus manifest processing, summary calculation, and markdown generation."""
    mock_corpus = {
        "categories": [
            {
                "name": "Electrical Appliances & Accessories",
                "standards": [
                    {
                        "is_number": "IS 2082:2018",
                        "standard_id": 18707,
                        "title": "Electric water heaters",
                    }
                ]
            },
            {
                "name": "Construction & Building Materials",
                "standards": [
                    {
                        "is_number": "IS 456:2000",
                        "standard_id": 1234,
                        "title": "Plain and reinforced concrete",
                    }
                ]
            }
        ]
    }

    corpus_file = tmp_path / "test_corpus.json"
    with open(corpus_file, "w", encoding="utf-8") as f:
        json.dump(mock_corpus, f)

    def side_effect_resolve(is_number, standard_id=None, use_cache=True):
        if "2082" in is_number:
            return [{
                "standard_id": 18707,
                "standard_number": "IS 2082:2018",
                "title": "Electric water heaters",
            }]
        elif "456" in is_number:
            return [{
                "standard_id": 1234,
                "standard_number": "IS 456:2000",
                "title": "Plain and reinforced concrete",
            }]
        return []

    mock_bis_client.resolve_standard_candidates.side_effect = side_effect_resolve

    out_json = tmp_path / "bis_document_manifest.json"
    out_md = tmp_path / "bis_document_manifest.md"

    manifest = run_discovery_and_save_manifests(
        corpus_manifest_path=corpus_file,
        output_json_path=out_json,
        output_md_path=out_md,
        bis_client=mock_bis_client,
    )

    assert manifest.total_standards == 2
    assert manifest.summary.not_exposed_by_api == 2
    assert manifest.summary.high_priority_count == 2
    assert manifest.summary.available == 0
    assert manifest.summary.not_found == 0
    assert len(manifest.categories) == 2

    # Verify JSON file exists and is valid
    assert out_json.exists()
    with open(out_json, "r", encoding="utf-8") as f:
        loaded_json = json.load(f)
    assert loaded_json["total_standards"] == 2
    assert loaded_json["source_corpus"] == "bis_mvp_corpus_manifest.json"

    # Verify Markdown file exists and contains table headers
    assert out_md.exists()
    with open(out_md, "r", encoding="utf-8") as f:
        md_text = f.read()
    assert "# BISaarthi MVP Document Manifest" in md_text
    assert "IS 2082:2018" in md_text
    assert "IS 456:2000" in md_text
    assert "| Category | Total Standards | Available |" in md_text


def test_official_document_manifest_integrity():
    """Verify that the generated bis_document_manifest.json perfectly matches the corpus manifest."""
    backend_root = Path(__file__).resolve().parent.parent
    corpus_file = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    doc_manifest_file = backend_root / "docs" / "bis_document_manifest.json"
    doc_md_file = backend_root / "docs" / "bis_document_manifest.md"

    assert corpus_file.exists(), "Corpus manifest must exist"
    assert doc_manifest_file.exists(), "Document manifest must exist"
    assert doc_md_file.exists(), "Document markdown report must exist"

    with open(corpus_file, "r", encoding="utf-8") as f:
        corpus = json.load(f)

    with open(doc_manifest_file, "r", encoding="utf-8") as f:
        doc_manifest = json.load(f)

    # 1. Total standards check
    assert doc_manifest["total_standards"] == 100
    assert doc_manifest["source_corpus"] == "bis_mvp_corpus_manifest.json"

    corpus_standards = [
        std for cat in corpus["categories"] for std in cat["standards"]
    ]
    doc_standards = [
        std for cat in doc_manifest["categories"] for std in cat["standards"]
    ]

    assert len(corpus_standards) == 100
    assert len(doc_standards) == 100

    # 2. IS number and standard_id exact match check
    corpus_is_numbers = [s["is_number"] for s in corpus_standards]
    doc_is_numbers = [s["is_number"] for s in doc_standards]
    assert corpus_is_numbers == doc_is_numbers

    corpus_std_ids = [s["standard_id"] for s in corpus_standards]
    doc_std_ids = [s["standard_id"] for s in doc_standards]
    assert corpus_std_ids == doc_std_ids

    # 3. Category structure match
    corpus_cats = [c["name"] for c in corpus["categories"]]
    doc_cats = [c["name"] for c in doc_manifest["categories"]]
    assert corpus_cats == doc_cats

    # 4. Zero duplicates
    assert len(set(doc_is_numbers)) == 100
    assert len(set(doc_std_ids)) == 100

    # 5. Strict lifecycle states for Phase 2B
    for std in doc_standards:
        assert std["download_status"] == "not_downloaded"
        assert std["extraction_status"] == "pending"
        assert std["source"] == "BIS"
        assert std["discovery_status"] in [
            "available", "not_exposed_by_api", "requires_manual_review", "not_found", "api_error"
        ]

    # 6. Markdown content verification
    with open(doc_md_file, "r", encoding="utf-8") as f:
        md_text = f.read()

    assert "- **Total Standards Evaluated**: 100" in md_text
    assert "- **Documents Discovered / Available**: 0" in md_text
    assert "- **Documents Not Exposed by API**: 100" in md_text
    assert "- **Records Requiring Manual Review**: 0" in md_text
    assert "- **High Priority Standards**: 35" in md_text
    assert "- **Medium Priority Standards**: 65" in md_text

