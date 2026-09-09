"""Unit tests for Phase 3B: BIS Document Acquisition & Verification Engine."""

import json
from pathlib import Path
import pytest

from app.schemas.bis_document_acquisition import (
    AcquisitionStatus,
    VerificationStatus,
)
from app.services.bis_document_acquisition import (
    BISDocumentAcquisitionService,
    generate_acquisition_manifest_markdown,
    run_acquisition_manifest_and_save,
)
from app.services.bis_document_verifier import (
    BISDocumentVerifier,
    check_pdf_format_and_safety,
    compute_file_sha256,
    sanitize_filename,
)
from app.services.bis_resolver import parse_is_number


@pytest.fixture
def sample_corpus_map():
    return {
        "IS_2082_2018": {
            "is_number": "IS 2082:2018",
            "standard_id": 18707,
            "title": "Stationary storage type electric water heaters",
            "category": "Electrical Appliances & Accessories",
        },
        "IS_302_PART_1_2024": {
            "is_number": "IS 302 (Part 1):2024",
            "standard_id": 31712,
            "title": "Safety of household appliances - Part 1",
            "category": "Electrical Appliances & Accessories",
        },
        "IS_302_PART_2_SEC_3_2024": {
            "is_number": "IS 302 (Part 2/Sec 3):2024",
            "standard_id": 31713,
            "title": "Safety of household appliances - Part 2 Sec 3",
            "category": "Electrical Appliances & Accessories",
        },
    }


def test_sanitize_filename():
    """Verify filename sanitization prevents path traversal and dangerous characters."""
    assert sanitize_filename("../../../etc/passwd.pdf") == "passwd.pdf"
    assert sanitize_filename("..\\..\\secret.pdf") == "secret.pdf"
    assert sanitize_filename("IS_2082\x00_test.pdf") == "IS_2082_test.pdf"
    assert sanitize_filename("IS 2082:2018.pdf") == "IS_2082_2018.pdf"


def test_check_pdf_format_and_safety(tmp_path):
    """Verify magic byte detection and empty/corrupted file rejection."""
    # 1. Valid PDF header
    valid_pdf = tmp_path / "valid.pdf"
    valid_pdf.write_bytes(b"%PDF-1.7\n%dummy pdf content")
    is_safe, err = check_pdf_format_and_safety(valid_pdf)
    assert is_safe is True
    assert err is None

    # 2. Empty file
    empty_file = tmp_path / "empty.pdf"
    empty_file.write_bytes(b"")
    is_safe, err = check_pdf_format_and_safety(empty_file)
    assert is_safe is False
    assert "empty" in (err or "").lower()

    # 3. Non-PDF binary
    fake_pdf = tmp_path / "fake.pdf"
    fake_pdf.write_bytes(b"MZ\x90\x00executable content")
    is_safe, err = check_pdf_format_and_safety(fake_pdf)
    assert is_safe is False
    assert "invalid pdf header" in (err or "").lower()


def test_compute_file_sha256(tmp_path):
    """Verify cryptographic SHA-256 hash generation."""
    f = tmp_path / "test.pdf"
    f.write_bytes(b"%PDF-1.7\nHello World")
    sha = compute_file_sha256(f)
    assert len(sha) == 64
    assert sha.isalnum()


def test_verifier_accepts_valid_standard(tmp_path, sample_corpus_map):
    """Test successful verification and transition from quarantine to verified."""
    q_dir = tmp_path / "quarantine"
    v_dir = tmp_path / "verified"
    r_dir = tmp_path / "rejected"

    verifier = BISDocumentVerifier(q_dir, v_dir, r_dir)

    # Place candidate file in quarantine
    cand_file = q_dir / "IS_2082_2018.pdf"
    cand_file.write_bytes(b"%PDF-1.7\nSample Standard Content for IS 2082")

    res = verifier.verify_and_stage_document(cand_file, sample_corpus_map, move_file=True)

    assert res.is_valid is True
    assert res.status == VerificationStatus.VERIFIED
    assert res.matched_is_number == "IS 2082:2018"
    assert res.standard_id == 18707
    assert (v_dir / "IS_2082_2018.pdf").exists()
    assert not cand_file.exists()


def test_verifier_part_section_disambiguation(tmp_path, sample_corpus_map):
    """Ensure Part 2/Sec 3 candidate is never assigned to Part 1."""
    q_dir = tmp_path / "quarantine"
    v_dir = tmp_path / "verified"
    r_dir = tmp_path / "rejected"

    verifier = BISDocumentVerifier(q_dir, v_dir, r_dir)

    cand_file = q_dir / "IS_302_Part_2_Sec_3_2024.pdf"
    cand_file.write_bytes(b"%PDF-1.7\nIS 302 Part 2 Sec 3 content")

    res = verifier.verify_and_stage_document(cand_file, sample_corpus_map, move_file=True)

    assert res.is_valid is True
    assert res.matched_is_number == "IS 302 (Part 2/Sec 3):2024"
    assert res.standard_id == 31713


def test_verifier_rejects_unlisted_standard(tmp_path, sample_corpus_map):
    """Ensure standards outside the 100-standard allowlist are rejected."""
    q_dir = tmp_path / "quarantine"
    v_dir = tmp_path / "verified"
    r_dir = tmp_path / "rejected"

    verifier = BISDocumentVerifier(q_dir, v_dir, r_dir)

    unlisted_file = q_dir / "IS_99999_2020.pdf"
    unlisted_file.write_bytes(b"%PDF-1.7\nUnlisted Standard Content")

    res = verifier.verify_and_stage_document(unlisted_file, sample_corpus_map, move_file=True)

    assert res.is_valid is False
    assert res.status == VerificationStatus.REJECTED
    assert (r_dir / "IS_99999_2020.pdf").exists()
    assert not unlisted_file.exists()


def test_acquisition_manifest_generation(tmp_path):
    """Test full acquisition manifest generation and markdown rendering."""
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

    corpus_file = tmp_path / "corpus.json"
    with open(corpus_file, "w", encoding="utf-8") as f:
        json.dump(mock_corpus, f)

    v_dir = tmp_path / "verified"
    v_dir.mkdir(parents=True, exist_ok=True)

    # 1. Generate before file acquisition
    out_json = tmp_path / "manifest.json"
    out_md = tmp_path / "manifest.md"

    manifest = run_acquisition_manifest_and_save(
        corpus_manifest_path=corpus_file,
        output_json_path=out_json,
        output_md_path=out_md,
        verified_dir=v_dir,
    )

    assert manifest.total_standards == 1
    assert manifest.summary.not_acquired_count == 1
    assert manifest.summary.verified_count == 0
    assert manifest.summary.redistribution_restricted_count == 1

    # 2. Add verified file and re-run
    std_file = v_dir / "IS_2082_2018.pdf"
    std_file.write_bytes(b"%PDF-1.7\nVerified content")

    manifest2 = run_acquisition_manifest_and_save(
        corpus_manifest_path=corpus_file,
        output_json_path=out_json,
        output_md_path=out_md,
        verified_dir=v_dir,
    )

    assert manifest2.summary.verified_count == 1
    assert manifest2.summary.not_acquired_count == 0
    assert manifest2.categories[0].standards[0].acquisition_status == AcquisitionStatus.ACQUIRED
    assert manifest2.categories[0].standards[0].sha256 is not None


def test_official_acquisition_manifest_integrity():
    """Verify that the generated bis_document_acquisition_manifest.json matches the 100-standard corpus."""
    backend_root = Path(__file__).resolve().parent.parent
    corpus_file = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    acq_json_file = backend_root / "docs" / "bis_document_acquisition_manifest.json"
    acq_md_file = backend_root / "docs" / "bis_document_acquisition_manifest.md"

    if not acq_json_file.exists():
        pytest.skip("Acquisition manifest not yet generated")

    with open(corpus_file, "r", encoding="utf-8") as f:
        corpus = json.load(f)

    with open(acq_json_file, "r", encoding="utf-8") as f:
        acq_manifest = json.load(f)

    # 1. Total standards count
    assert acq_manifest["total_standards"] == 100
    assert acq_manifest["source_corpus"] == "bis_mvp_corpus_manifest.json"

    # 2. Strict 1:1 match with corpus standards
    corpus_standards = [std for cat in corpus["categories"] for std in cat["standards"]]
    acq_standards = [std for cat in acq_manifest["categories"] for std in cat["standards"]]

    assert len(corpus_standards) == 100
    assert len(acq_standards) == 100

    corpus_is_numbers = [s["is_number"] for s in corpus_standards]
    acq_is_numbers = [s["is_number"] for s in acq_standards]
    assert corpus_is_numbers == acq_is_numbers

    corpus_std_ids = [s["standard_id"] for s in corpus_standards]
    acq_std_ids = [s["standard_id"] for s in acq_standards]
    assert corpus_std_ids == acq_std_ids

    # 3. All records must enforce redistribution restriction
    for std in acq_standards:
        assert std["redistribution_restricted"] is True
        assert std["official_source"] == "BIS"

    # 4. Markdown content check
    with open(acq_md_file, "r", encoding="utf-8") as f:
        md_text = f.read()

    assert "# BISaarthi — Phase 3B: Official BIS Document Acquisition Manifest" in md_text
    assert "- **Total Standards Tracked**: 100" in md_text
    assert "Redistribution Restricted" in md_text
