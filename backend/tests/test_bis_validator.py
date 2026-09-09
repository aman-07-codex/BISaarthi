"""Offline unit tests for BISResolver, BISManifestValidator, and reporting."""

import copy
import json
from pathlib import Path
import tempfile
import httpx
import pytest

from app.schemas.bis_validation import ValidationStatus
from app.services.bis_cache import BISCache
from app.services.bis_client import BISClient
from app.services.bis_resolver import (
    clean_text,
    evaluate_manifest_standard,
    is_obsolete_or_withdrawn,
    match_standard_identities,
    parse_is_number,
)
from app.services.bis_validator import APPROVED_CATEGORIES, BISManifestValidator

MANIFEST_FIXTURE_PATH = Path(__file__).resolve().parent.parent / "docs" / "bis_mvp_corpus_manifest.json"


def test_parse_is_number_variations():
    """Verify standard number parsing across diverse BIS structural formats."""
    # 1. Simple standard with year
    id1 = parse_is_number("IS 2082:2018")
    assert id1.prefix == "IS"
    assert id1.base_number == "2082"
    assert id1.part_number is None
    assert id1.section_number is None
    assert id1.revision_year == "2018"
    assert id1.normalized_key == "IS_2082_2018"

    # 2. Standard with Part
    id2 = parse_is_number("IS 302 (Part 1):2024")
    assert id2.prefix == "IS"
    assert id2.base_number == "302"
    assert id2.part_number == "Part 1"
    assert id2.section_number is None
    assert id2.revision_year == "2024"
    assert id2.normalized_key == "IS_302_PART_1_2024"

    # 3. Standard with Part and Section
    id3 = parse_is_number("IS 302 (Part 2/Sec 3):2024")
    assert id3.prefix == "IS"
    assert id3.base_number == "302"
    assert id3.part_number == "Part 2"
    assert id3.section_number == "Sec 3"
    assert id3.revision_year == "2024"
    assert id3.normalized_key == "IS_302_PART_2_SEC_3_2024"

    # 4. Standard with IS/IEC prefix
    id4 = parse_is_number("IS/IEC 60898 (Part 1):2015")
    assert id4.prefix == "IS/IEC"
    assert id4.base_number == "60898"
    assert id4.part_number == "Part 1"
    assert id4.section_number is None
    assert id4.revision_year == "2015"
    assert id4.normalized_key == "IS_IEC_60898_PART_1_2015"

    # 5. Complex Part/Section
    id5 = parse_is_number("IS 15885 (Part 2/Sec 13):2012")
    assert id5.prefix == "IS"
    assert id5.base_number == "15885"
    assert id5.part_number == "Part 2"
    assert id5.section_number == "Sec 13"
    assert id5.revision_year == "2012"
    assert id5.normalized_key == "IS_15885_PART_2_SEC_13_2012"


def test_match_standard_identities_disambiguation():
    """Verify that similar or related standards are never erroneously confused."""
    id_2082 = parse_is_number("IS 2082:2018")
    id_12082_p1 = parse_is_number("IS 12082 (Part 1):2006")
    id_302_p1 = parse_is_number("IS 302 (Part 1):2024")
    id_302_p2_s3 = parse_is_number("IS 302 (Part 2/Sec 3):2024")
    id_302_p2_s16 = parse_is_number("IS 302 (Part 2/Sec 16):2026")
    id_2062_p1 = parse_is_number("IS 2062 (Part 1):2025")
    id_2062_p2 = parse_is_number("IS 2062 (Part 2):2026")
    id_iec_60898_p1 = parse_is_number("IS/IEC 60898 (Part 1):2015")
    id_plain_60898_p1 = parse_is_number("IS 60898 (Part 1):2015")

    # 1. Base number collision: 2082 vs 12082
    match, reason = match_standard_identities(id_2082, id_12082_p1)
    assert not match
    assert "Base number mismatch" in reason

    # 2. Part mismatch: IS 302 Part 1 vs IS 302 Part 2/Sec 3
    match, reason = match_standard_identities(id_302_p1, id_302_p2_s3)
    assert not match
    assert "Part number mismatch" in reason

    # 3. Section mismatch: IS 302 Part 2/Sec 3 vs IS 302 Part 2/Sec 16
    match, reason = match_standard_identities(id_302_p2_s3, id_302_p2_s16)
    assert not match
    assert "Section number mismatch" in reason

    # 4. Part 1 vs Part 2 for structural steel
    match, reason = match_standard_identities(id_2062_p1, id_2062_p2)
    assert not match
    assert "Part number mismatch" in reason

    # 5. Prefix mismatch: IS vs IS/IEC
    match, reason = match_standard_identities(id_iec_60898_p1, id_plain_60898_p1)
    assert not match
    assert "Prefix mismatch" in reason

    # 6. Identical standards match
    match, reason = match_standard_identities(id_302_p2_s3, parse_is_number("IS 302 (Part 2/Sec 3):2024"))
    assert match
    assert reason is None


def test_is_obsolete_or_withdrawn():
    """Verify obsolescence detection flags."""
    obs1, reason1 = is_obsolete_or_withdrawn("Withdrawn", "Specification for something")
    assert obs1
    assert "Withdrawn" in reason1

    obs2, reason2 = is_obsolete_or_withdrawn("Active", "Specification (Superseded by IS 123)")
    assert obs2
    assert "Superseded" in reason2

    obs3, reason3 = is_obsolete_or_withdrawn("Active / Published", "Stationary electric water heaters")
    assert not obs3
    assert reason3 is None


def test_evaluate_manifest_standard_exact_match():
    """Verify exact match evaluation."""
    manifest_rec = {
        "is_number": "IS 2082:2018",
        "standard_id": 18707,
        "standard_enc_id": "token_abc",
        "title": "Stationary storage type electric water heaters - Specification",
        "department": "ELECTROTECHNICAL DEPARTMENT (ETD)",
        "committee": "ETD 32 - Electrical Appliances",
        "publication_date": "2018-04-30",
        "status": "Active / Published",
        "type": "Product Specification",
    }

    bis_candidate = {
        "standardId": 18707,
        "standardEncId": "token_abc",
        "standardNumber": "IS 2082:2018",
        "standardName": "Stationary storage type electric water heaters - Specification",
        "departmentName": "ELECTROTECHNICAL DEPARTMENT (ETD)",
        "sectionalCommitteeName": "ETD 32 - Electrical Appliances",
        "typeOfStandardName": "Product Specification",
        "publishedOn": "2018-04-30",
        "publishedOnFormatted": "30 Apr 2018",
    }

    result = evaluate_manifest_standard(manifest_rec, [bis_candidate], "Electrical Appliances & Accessories")
    assert result.resolved
    assert result.validation_status == ValidationStatus.EXACT_MATCH
    assert result.metadata_match
    assert result.bis_standard_id == 18707
    assert len(result.issues) == 0


def test_evaluate_manifest_standard_metadata_changed():
    """Verify metadata changed evaluation when title or committee differs."""
    manifest_rec = {
        "is_number": "IS 2082:2018",
        "standard_id": 18707,
        "standard_enc_id": "token_abc",
        "title": "Stationary storage electric water heaters",
        "department": "ELECTROTECHNICAL DEPARTMENT (ETD)",
        "committee": "ETD 32 - Electrical Appliances",
        "publication_date": "2018-04-30",
    }

    bis_candidate = {
        "standardId": 18707,
        "standardEncId": "token_new",
        "standardNumber": "IS 2082:2018",
        "standardName": "Stationary storage type electric water heaters - Specification (Fifth Revision)",
        "departmentName": "ELECTROTECHNICAL DEPARTMENT (ETD)",
        "sectionalCommitteeName": "ETD 32 - Electrical Appliances",
        "publishedOn": "2018-04-30",
    }

    result = evaluate_manifest_standard(manifest_rec, [bis_candidate], "Electrical Appliances & Accessories")
    assert result.resolved
    assert result.validation_status == ValidationStatus.METADATA_CHANGED
    assert not result.metadata_match
    assert any("Title variation" in iss for iss in result.issues)


def test_evaluate_manifest_standard_id_mismatch():
    """Verify that standard ID mismatch triggers manual review."""
    manifest_rec = {
        "is_number": "IS 2082:2018",
        "standard_id": 18707,
        "standard_enc_id": "token_abc",
        "title": "Electric water heaters",
    }

    bis_candidate = {
        "standardId": 99999,  # Mismatched ID
        "standardEncId": "token_xyz",
        "standardNumber": "IS 2082:2018",
        "standardName": "Electric water heaters",
    }

    result = evaluate_manifest_standard(manifest_rec, [bis_candidate])
    assert result.resolved
    assert result.validation_status == ValidationStatus.REQUIRES_MANUAL_REVIEW
    assert any("Standard ID mismatch" in iss for iss in result.issues)


def test_manifest_integrity_on_real_manifest():
    """Verify the real authoritative manifest passes all integrity checks."""
    validator = BISManifestValidator(manifest_path=MANIFEST_FIXTURE_PATH)
    integrity = validator.validate_manifest_integrity()

    assert integrity.is_valid, f"Manifest integrity failed: {integrity.missing_required_fields}"
    assert integrity.total_standards == 100
    assert len(integrity.approved_categories_present) == 5
    assert len(integrity.unexpected_categories) == 0
    assert len(integrity.duplicate_is_numbers) == 0
    assert len(integrity.duplicate_standard_ids) == 0
    assert len(integrity.duplicate_standard_enc_ids) == 0


def test_manifest_integrity_detects_duplicates():
    """Verify that injected duplicate IS numbers or standard IDs are caught."""
    with open(MANIFEST_FIXTURE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Inject duplicate
    bad_data = copy.deepcopy(data)
    first_std = bad_data["categories"][0]["standards"][0]
    bad_data["categories"][0]["standards"].append(copy.deepcopy(first_std))

    validator = BISManifestValidator(manifest_path=MANIFEST_FIXTURE_PATH)
    integrity = validator.validate_manifest_integrity(bad_data)

    assert not integrity.is_valid
    assert len(integrity.duplicate_is_numbers) > 0
    assert len(integrity.duplicate_standard_ids) > 0


def test_manifest_integrity_detects_invalid_category():
    """Verify that unexpected categories are rejected."""
    with open(MANIFEST_FIXTURE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    bad_data = copy.deepcopy(data)
    bad_data["categories"].append({
        "name": "Invalid Aerospace Standards",
        "standards": []
    })

    validator = BISManifestValidator(manifest_path=MANIFEST_FIXTURE_PATH)
    integrity = validator.validate_manifest_integrity(bad_data)

    assert not integrity.is_valid
    assert "Invalid Aerospace Standards" in integrity.unexpected_categories


def test_full_validator_with_mock_client():
    """Test full validation workflow with a mock BISClient returning synthetic data."""
    # Synthetic small manifest
    small_manifest = {
        "version": "1.0",
        "categories": [
            {
                "name": "Electrical Appliances & Accessories",
                "standards": [
                    {
                        "is_number": "IS 2082:2018",
                        "title": "Stationary storage type electric water heaters",
                        "standard_id": 18707,
                        "standard_enc_id": "enc_123",
                        "department": "ELECTROTECHNICAL DEPARTMENT (ETD)",
                        "committee": "ETD 32 - Electrical Appliances",
                        "publication_date": "2018-04-30",
                    }
                ],
            }
        ],
    }

    mock_bis_response = {
        "status": "SUCCESS",
        "statusCode": 200,
        "totalRecord": 1,
        "page": 1,
        "pageSize": 20,
        "data": [
            {
                "standardId": 18707,
                "standardEncId": "enc_123",
                "standardNumber": "IS 2082:2018",
                "standardName": "Stationary storage type electric water heaters",
                "departmentName": "ELECTROTECHNICAL DEPARTMENT (ETD)",
                "sectionalCommitteeName": "ETD 32 - Electrical Appliances",
                "typeOfStandardName": "Product Specification",
                "publishedOn": "2018-04-30",
                "publishedOnFormatted": "30 Apr 2018",
            }
        ],
    }

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=mock_bis_response)

    transport = httpx.MockTransport(handler)

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_manifest_file = Path(tmpdir) / "test_manifest.json"
        with open(tmp_manifest_file, "w", encoding="utf-8") as f:
            json.dump(small_manifest, f)

        cache = BISCache(cache_dir=Path(tmpdir), enabled=False)
        with BISClient(transport=transport, cache=cache, rate_limit_delay=0.0) as client:
            validator = BISManifestValidator(manifest_path=tmp_manifest_file, client=client)
            summary = validator.validate_all(use_cache=False)

            assert summary.total_manifest_standards == 1
            assert summary.resolved_count == 1
            assert summary.exact_match_count == 1
            assert summary.unresolved_count == 0

            # Test report generation
            json_report = Path(tmpdir) / "report.json"
            md_report = Path(tmpdir) / "report.md"
            validator.generate_json_report(summary, json_report)
            validator.generate_markdown_report(summary, md_report)

            assert json_report.exists()
            assert md_report.exists()
            assert json_report.stat().st_size > 50
            assert md_report.stat().st_size > 50
