"""Tests for BISaarthi MVP Curated Corpus Manifest integrity."""

import json
from pathlib import Path
import pytest

MANIFEST_PATH = Path(__file__).resolve().parent.parent / "docs" / "bis_mvp_corpus_manifest.json"

APPROVED_CATEGORIES = {
    "Electrical Appliances & Accessories",
    "Construction, Cement & Concrete",
    "Food, Drinking Water & Food-Contact Products",
    "Steel, Metals & Industrial Materials",
    "Plastics, Packaging & Consumer Materials"
}


@pytest.fixture
def manifest_data():
    assert MANIFEST_PATH.exists(), "Manifest JSON file must exist"
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_manifest_structure(manifest_data):
    assert manifest_data.get("version") == "1.0"
    assert "categories" in manifest_data
    assert len(manifest_data["categories"]) == 5


def test_manifest_categories(manifest_data):
    found_categories = {cat["name"] for cat in manifest_data["categories"]}
    assert found_categories == APPROVED_CATEGORIES, f"Categories mismatch: {found_categories}"


def test_manifest_counts_and_uniqueness(manifest_data):
    total_count = 0
    seen_ids = set()
    seen_is_numbers = set()

    for cat in manifest_data["categories"]:
        stds = cat.get("standards", [])
        assert len(stds) > 0, f"Category {cat['name']} has no standards"
        total_count += len(stds)

        for std in stds:
            sid = std.get("standard_id")
            snum = std.get("is_number")
            senc = std.get("standard_enc_id")

            assert sid is not None, f"Standard {snum} missing standard_id"
            assert isinstance(sid, int), f"Standard ID {sid} must be integer"
            assert senc, f"Standard {snum} missing standard_enc_id"
            assert isinstance(senc, str) and len(senc) > 20, f"Invalid standard_enc_id for {snum}"

            assert sid not in seen_ids, f"Duplicate standard_id {sid} in manifest"
            assert snum not in seen_is_numbers, f"Duplicate IS number {snum} in manifest"

            seen_ids.add(sid)
            seen_is_numbers.add(snum)

            # Validate quality fields
            assert std.get("title"), f"Missing title for {snum}"
            assert std.get("reason_selected"), f"Missing reason_selected for {snum}"
            assert std.get("primary_use_case"), f"Missing primary_use_case for {snum}"
            assert std.get("selection_confidence") in {"high", "medium"}

    assert 90 <= total_count <= 110, f"Total standards count {total_count} outside 90-110 target range"
    assert total_count == 100, f"Expected exactly 100 curated standards, got {total_count}"
