"""Unit tests for Phase 4A: Offline PDF Extraction & Structural Validation."""

import json
from pathlib import Path
import pytest

from app.schemas.bis_document_extraction import (
    ExtractionQuality,
    ExtractionStatus,
)
from app.services.bis_document_extractor import (
    BISDocumentExtractorService,
    generate_extraction_manifest_markdown,
    run_extraction_manifest_and_save,
)
from app.services.bis_extraction_validator import (
    assess_extraction_quality,
    detect_is_number_in_text,
    validate_pdf_structure,
    verify_extracted_identity,
)


def make_synthetic_pdf(pages_text: list[str]) -> bytes:
    """Generate a minimal, valid, multi-page PDF byte stream containing text operators."""
    pdf = [
        b"%PDF-1.4",
        b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj",
    ]
    page_objs = []
    content_objs = []

    for i, t in enumerate(pages_text):
        p_num = 4 + i * 2
        c_num = 5 + i * 2
        page_objs.append(p_num)
        content_objs.append((c_num, t))

    kids = " ".join(f"{p} 0 R" for p in page_objs)
    pdf.append(f"2 0 obj <</Type /Pages /Kids [{kids}] /Count {len(page_objs)}>> endobj".encode())
    pdf.append(b"3 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj")

    for c_num, text_content in content_objs:
        clean_stream = text_content.replace("(", "").replace(")", "")
        stream_data = f"BT /F1 12 Tf 72 712 Td ({clean_stream}) Tj ET".encode("latin-1")
        pdf.append(f"{c_num} 0 obj <</Length {len(stream_data)}>> stream\n".encode() + stream_data + b"\nendstream endobj")
        p_num = c_num - 1
        pdf.append(f"{p_num} 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 3 0 R>>>> /Contents {c_num} 0 R>> endobj".encode())

    pdf_bytes = b"\n".join(pdf) + b"\nxref\n0 1\n0000000000 65535 f \ntrailer <</Size 1 /Root 1 0 R>>\nstartxref\n" + str(len(b"\n".join(pdf))).encode() + b"\n%%EOF"
    return pdf_bytes


@pytest.fixture
def sample_standard_info():
    return {
        "is_number": "IS 2082:2018",
        "standard_id": 18707,
        "standard_enc_id": "enc_2082",
        "title": "Stationary storage type electric water heaters",
        "category": "Electrical Appliances & Accessories",
    }


def test_detect_is_number_in_text():
    """Verify regex and pattern detection for IS numbers in text."""
    t1 = "BUREAU OF INDIAN STANDARDS\nIS 2082:2018\nStationary storage type electric water heaters"
    assert detect_is_number_in_text(t1) == "IS 2082:2018"

    t2 = "Indian Standard IS 302 (Part 2/Sec 3):2024 Safety of Electric Irons"
    assert "IS 302" in (detect_is_number_in_text(t2) or "")

    t3 = "Random document text without any standard reference"
    assert detect_is_number_in_text(t3) is None


def test_verify_extracted_identity():
    """Verify identity checking against expected standard numbers."""
    text_match = "INDIAN STANDARD IS 2082:2018 SPECIFICATION FOR WATER HEATERS"
    ok, detected, conf, issues = verify_extracted_identity(text_match, "IS 2082:2018", "Water Heaters")
    assert ok is True
    assert conf == "high"

    # Identity mismatch
    text_mismatch = "INDIAN STANDARD IS 456:2000 PLAIN AND REINFORCED CONCRETE"
    ok2, detected2, conf2, issues2 = verify_extracted_identity(text_mismatch, "IS 2082:2018")
    assert ok2 is False
    assert conf2 == "none"
    assert any("mismatch" in i.lower() for i in issues2)


def test_extract_pdf_pages_multi_page(tmp_path):
    """Verify page-by-page extraction preserves 1-indexed page numbers and character counts."""
    service = BISDocumentExtractorService(verified_dir=tmp_path / "v", extracted_dir=tmp_path / "e")
    pdf_path = tmp_path / "test_doc.pdf"
    pdf_bytes = make_synthetic_pdf([
        "Page 1 Title Header IS 2082:2018",
        "Page 2 Section 1 Scope",
        "Page 3 Section 2 Normative References",
    ])
    pdf_path.write_bytes(pdf_bytes)

    pages, count, err = service.extract_pdf_pages(pdf_path)
    assert err is None
    assert count == 3
    assert len(pages) == 3
    assert pages[0].page_number == 1
    assert "IS 2082:2018" in pages[0].text
    assert pages[1].page_number == 2
    assert "Scope" in pages[1].text
    assert pages[2].page_number == 3
    assert "Normative" in pages[2].text


def test_extract_single_document_good_quality(tmp_path, sample_standard_info):
    """Test full document extraction on a synthetic valid standard."""
    service = BISDocumentExtractorService(verified_dir=tmp_path / "v", extracted_dir=tmp_path / "e")
    pdf_path = tmp_path / "IS_2082_2018.pdf"
    long_text = "Detailed specification for stationary storage type electric water heaters. " * 5
    pdf_bytes = make_synthetic_pdf([
        "INDIAN STANDARD IS 2082:2018 SPECIFICATION FOR ELECTRIC WATER HEATERS",
        long_text,
        long_text,
    ])
    pdf_path.write_bytes(pdf_bytes)

    doc_out = service.extract_single_document(pdf_path, sample_standard_info)

    assert doc_out.is_number == "IS 2082:2018"
    assert doc_out.standard_id == 18707
    assert doc_out.page_count == 3
    assert doc_out.extracted_page_count == 3
    assert doc_out.total_character_count > 100
    assert doc_out.extraction_status == ExtractionStatus.EXTRACTED
    assert doc_out.extraction_quality == ExtractionQuality.GOOD
    assert doc_out.identity_verified is True
    assert doc_out.identity_confidence == "high"


def test_extract_single_document_scanned_requires_ocr(tmp_path, sample_standard_info):
    """Test document with empty/minimal digital text triggers requires_ocr classification."""
    service = BISDocumentExtractorService(verified_dir=tmp_path / "v", extracted_dir=tmp_path / "e")
    pdf_path = tmp_path / "IS_2082_2018.pdf"
    # Create pages with almost 0 characters
    pdf_bytes = make_synthetic_pdf(["", " "])
    pdf_path.write_bytes(pdf_bytes)

    doc_out = service.extract_single_document(pdf_path, sample_standard_info)

    assert doc_out.page_count == 2
    assert doc_out.extraction_quality == ExtractionQuality.REQUIRES_OCR
    assert any("ocr" in i.lower() for i in doc_out.issues)


def test_extract_single_document_corrupted_file(tmp_path, sample_standard_info):
    """Test corrupted/empty PDF handles gracefully without crashing."""
    service = BISDocumentExtractorService(verified_dir=tmp_path / "v", extracted_dir=tmp_path / "e")
    pdf_path = tmp_path / "corrupted.pdf"
    pdf_path.write_bytes(b"corrupted binary data")

    doc_out = service.extract_single_document(pdf_path, sample_standard_info)

    assert doc_out.extraction_status == ExtractionStatus.EXTRACTION_FAILED
    assert doc_out.extraction_quality == ExtractionQuality.CORRUPTED
    assert len(doc_out.issues) > 0


def test_build_extraction_manifest_and_markdown(tmp_path):
    """Test manifest building with a mix of verified and unacquired standards."""
    mock_corpus = {
        "categories": [
            {
                "name": "Electrical Appliances & Accessories",
                "standards": [
                    {
                        "is_number": "IS 2082:2018",
                        "standard_id": 18707,
                        "title": "Electric water heaters",
                    },
                    {
                        "is_number": "IS 456:2000",
                        "standard_id": 1234,
                        "title": "Plain concrete",
                    }
                ]
            }
        ]
    }

    corpus_file = tmp_path / "corpus.json"
    with open(corpus_file, "w", encoding="utf-8") as f:
        json.dump(mock_corpus, f)

    v_dir = tmp_path / "verified"
    e_dir = tmp_path / "extracted"
    v_dir.mkdir()
    e_dir.mkdir()

    # Place synthetic verified PDF for IS 2082 only
    pdf_bytes = make_synthetic_pdf([
        "INDIAN STANDARD IS 2082:2018 SPECIFICATION FOR WATER HEATERS",
        "Detailed clauses and requirements " * 5,
    ])
    (v_dir / "IS_2082_2018.pdf").write_bytes(pdf_bytes)

    out_json = tmp_path / "extraction_manifest.json"
    out_md = tmp_path / "extraction_manifest.md"

    manifest = run_extraction_manifest_and_save(
        corpus_manifest_path=corpus_file,
        output_json_path=out_json,
        output_md_path=out_md,
        verified_dir=v_dir,
        extracted_dir=e_dir,
    )

    assert manifest.total_standards == 2
    assert manifest.summary.extracted_count == 1
    assert manifest.summary.not_extracted_count == 1
    assert manifest.summary.good_quality_count == 1

    # Verify extracted JSON was saved
    saved_json = e_dir / "IS_2082_2018.json"
    assert saved_json.exists()
    with open(saved_json, "r", encoding="utf-8") as f:
        saved_data = json.load(f)
    assert saved_data["is_number"] == "IS 2082:2018"
    assert len(saved_data["pages"]) == 2

    # Verify Markdown report was saved
    assert out_md.exists()
    with open(out_md, "r", encoding="utf-8") as f:
        md_text = f.read()
    assert "# BISaarthi — Phase 4A: Official BIS Document Extraction Manifest" in md_text
    assert "IS 2082:2018" in md_text


def test_production_extraction_manifest_initial_state():
    """Verify that the production extraction manifest accurately records 100 not_extracted standards."""
    backend_root = Path(__file__).resolve().parent.parent
    corpus_file = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    ext_json_file = backend_root / "docs" / "bis_document_extraction_manifest.json"
    ext_md_file = backend_root / "docs" / "bis_document_extraction_manifest.md"

    if not ext_json_file.exists():
        pytest.skip("Production extraction manifest not generated yet")

    with open(corpus_file, "r", encoding="utf-8") as f:
        corpus = json.load(f)

    with open(ext_json_file, "r", encoding="utf-8") as f:
        ext_manifest = json.load(f)

    # 1. Total standards check
    assert ext_manifest["total_standards"] == 100
    assert ext_manifest["summary"]["total_standards"] == 100
    assert ext_manifest["summary"]["extracted_count"] == 0
    assert ext_manifest["summary"]["not_extracted_count"] == 100
    assert ext_manifest["summary"]["extraction_failed_count"] == 0

    # 2. 1:1 match with corpus standards
    corpus_is_numbers = [s["is_number"] for cat in corpus["categories"] for s in cat["standards"]]
    ext_is_numbers = [s["is_number"] for cat in ext_manifest["categories"] for s in cat["standards"]]
    assert corpus_is_numbers == ext_is_numbers

    # 3. Markdown alignment
    with open(ext_md_file, "r", encoding="utf-8") as f:
        md_text = f.read()

    assert "- **Total Standards Tracked**: 100" in md_text
    assert "- **Successfully Extracted**: 0" in md_text
    assert "- **Pending Acquisition / Not Extracted**: 100" in md_text
