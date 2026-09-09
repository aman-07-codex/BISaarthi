"""Unit tests for Phase 3A: Official BIS Document Acquisition Reconnaissance."""

import json
from pathlib import Path
from unittest.mock import MagicMock
import pytest

from app.schemas.bis_acquisition import (
    AccessType,
    AcquisitionCategory,
    AcquisitionMethod,
)
from app.services.bis_acquisition_recon import (
    BISAcquisitionReconService,
    generate_acquisition_recon_markdown,
    run_acquisition_recon_and_save,
)
from app.services.bis_client import BISClient


@pytest.fixture
def mock_bis_client():
    client = MagicMock(spec=BISClient)
    return client


@pytest.fixture
def sample_standard():
    return {
        "is_number": "IS 2082:2018",
        "standard_id": 18707,
        "standard_enc_id": "test_enc_2082",
        "title": "Stationary storage type electric water heaters",
        "category": "Electrical Appliances & Accessories",
    }


def test_assess_standard_not_exposed_by_api(mock_bis_client, sample_standard):
    """Test assessment when standard is confirmed in catalogue but PDF is not exposed via public API."""
    mock_bis_client.resolve_standard_candidates.return_value = [
        {
            "standard_id": 18707,
            "standard_number": "IS 2082:2018",
            "title": "Stationary storage type electric water heaters",
            # No document_url in payload
        }
    ]

    service = BISAcquisitionReconService(bis_client=mock_bis_client)
    assessment = service.assess_standard(sample_standard, "Electrical")

    assert assessment.is_number == "IS 2082:2018"
    assert assessment.standard_id == 18707
    assert assessment.document_reference_found is False
    assert assessment.document_url is None
    assert assessment.access_type == AccessType.NOT_EXPOSED
    assert assessment.authentication_required is True
    assert assessment.payment_required is True
    assert assessment.public_download_available is False
    assert assessment.automatable is False
    assert assessment.acquisition_method == AcquisitionMethod.OFFICIAL_PORTAL_MANUAL
    assert assessment.acquisition_category == AcquisitionCategory.NOT_EXPOSED
    assert assessment.official_source == "BIS"
    assert assessment.confidence == "high"


def test_assess_standard_with_verified_public_url(mock_bis_client, sample_standard):
    """Test assessment when standard has a verified public document URL."""
    mock_bis_client.resolve_standard_candidates.return_value = [
        {
            "standard_id": 18707,
            "standard_number": "IS 2082:2018",
            "title": "Stationary storage type electric water heaters",
            "document_url": "https://standardsadmin.bis.gov.in/docs/IS_2082_2018.pdf",
        }
    ]

    service = BISAcquisitionReconService(bis_client=mock_bis_client)
    assessment = service.assess_standard(sample_standard, "Electrical")

    assert assessment.document_reference_found is True
    assert assessment.document_url == "https://standardsadmin.bis.gov.in/docs/IS_2082_2018.pdf"
    assert assessment.access_type == AccessType.PUBLIC
    assert assessment.public_download_available is True
    assert assessment.automatable is True
    assert assessment.acquisition_method == AcquisitionMethod.PUBLIC_DOCUMENT_ENDPOINT
    assert assessment.acquisition_category == AcquisitionCategory.PUBLIC_AUTOMATABLE


def test_no_fabricated_urls(mock_bis_client, sample_standard):
    """Ensure service never constructs or fabricates URLs when not explicitly in payload."""
    mock_bis_client.resolve_standard_candidates.return_value = [
        {
            "standard_id": 18707,
            "standard_number": "IS 2082:2018",
            "title": "Stationary storage type electric water heaters",
        }
    ]

    service = BISAcquisitionReconService(bis_client=mock_bis_client)
    assessment = service.assess_standard(sample_standard, "Electrical")

    assert assessment.document_url is None
    assert "https://" not in (assessment.document_url or "")


def test_official_domain_integrity():
    """Verify that only official BIS domains are recognized and third-party mirrors are rejected."""
    allowed_domains = ["bis.gov.in", "standardsadmin.bis.gov.in", "standardsbis.bsbedge.com", "manakonline.in"]
    third_party_samples = [
        "https://www.scribd.com/document/12345/IS-2082",
        "https://drive.google.com/file/d/abcdef/view",
        "https://archive.org/details/gov.in.is.2082.2018",
        "https://github.com/fake/bis-standards/is2082.pdf",
    ]

    for url in third_party_samples:
        is_official = any(domain in url for domain in allowed_domains)
        assert not is_official, f"Third party URL {url} must not be accepted as official BIS domain"


def test_acquisition_recon_markdown_generation(tmp_path, mock_bis_client):
    """Test full acquisition reconnaissance run, summary calculation, and markdown generation."""
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
            }
        ]
    }

    corpus_file = tmp_path / "test_corpus.json"
    with open(corpus_file, "w", encoding="utf-8") as f:
        json.dump(mock_corpus, f)

    mock_bis_client.resolve_standard_candidates.return_value = [
        {
            "standard_id": 18707,
            "standard_number": "IS 2082:2018",
            "title": "Electric water heaters",
        }
    ]

    out_json = tmp_path / "recon.json"
    out_md = tmp_path / "recon.md"

    report = run_acquisition_recon_and_save(
        corpus_manifest_path=corpus_file,
        output_json_path=out_json,
        output_md_path=out_md,
        bis_client=mock_bis_client,
    )

    assert report.total_standards == 1
    assert report.summary.not_exposed == 1
    assert report.summary.public_automatable == 0
    assert report.summary.requiring_authentication == 1
    assert report.summary.requiring_paid_or_licensed == 1

    assert out_json.exists()
    assert out_md.exists()

    with open(out_md, "r", encoding="utf-8") as f:
        md_text = f.read()

    assert "# BISaarthi — Phase 3A: Official BIS Document Acquisition Reconnaissance" in md_text
    assert "IS 2082:2018" in md_text
    assert "`not_exposed`" in md_text


def test_official_acquisition_recon_report_integrity():
    """Verify that the generated bis_document_acquisition_reconnaissance.json matches the corpus manifest."""
    backend_root = Path(__file__).resolve().parent.parent
    corpus_file = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    recon_json_file = backend_root / "docs" / "bis_document_acquisition_reconnaissance.json"
    recon_md_file = backend_root / "docs" / "bis_document_acquisition_reconnaissance.md"

    if not recon_json_file.exists():
        pytest.skip("Reconnaissance artifacts not generated yet")

    with open(corpus_file, "r", encoding="utf-8") as f:
        corpus = json.load(f)

    with open(recon_json_file, "r", encoding="utf-8") as f:
        recon = json.load(f)

    # 1. Total count checks
    assert recon["summary"]["total_standards"] == 100
    assert len(recon["assessments"]) == 100
    assert recon["source_corpus"] == "bis_mvp_corpus_manifest.json"

    # 2. Strict 1:1 match with corpus standards
    corpus_is_numbers = [s["is_number"] for cat in corpus["categories"] for s in cat["standards"]]
    recon_is_numbers = [a["is_number"] for a in recon["assessments"]]
    assert corpus_is_numbers == recon_is_numbers

    corpus_std_ids = [s["standard_id"] for cat in corpus["categories"] for s in cat["standards"]]
    recon_std_ids = [a["standard_id"] for a in recon["assessments"]]
    assert corpus_std_ids == recon_std_ids

    # 3. Verify zero fabricated URLs across all assessments
    for a in recon["assessments"]:
        assert a["official_source"] == "BIS"
        if not a["document_reference_found"]:
            assert a["document_url"] is None

    # 4. Markdown summary alignment
    with open(recon_md_file, "r", encoding="utf-8") as f:
        md_text = f.read()

    assert "- **Total Standards Assessed**: 100" in md_text
    assert "- **NOT_EXPOSED**: 100" in md_text
    assert "- **PUBLIC_AUTOMATABLE**: 0" in md_text
