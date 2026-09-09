"""Tests for BIS API reconnaissance parsers using offline JSON fixtures."""

import json
from pathlib import Path
import pytest

from app.services.bis_parser import (
    parse_departments_response,
    parse_groups_response,
    parse_laboratories_response,
    parse_licenses_response,
    parse_standards_list_response,
    parse_subgroups_response,
)

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "docs" / "bis_api_samples"


@pytest.fixture
def groups_fixture():
    path = FIXTURES_DIR / "groups_sample.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def subgroups_fixture():
    path = FIXTURES_DIR / "subgroups_sample.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def departments_fixture():
    path = FIXTURES_DIR / "technical_departments_sample.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def standards_list_fixture():
    path = FIXTURES_DIR / "standard_list_sample.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def laboratories_fixture():
    path = FIXTURES_DIR / "standard_laboratory_sample.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def licenses_fixture():
    path = FIXTURES_DIR / "standard_license_sample.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_parse_groups(groups_fixture):
    groups = parse_groups_response(groups_fixture)
    assert len(groups) > 0
    first = groups[0]
    assert "group_id" in first
    assert "group_name" in first
    assert "encrypted_group_id" in first
    assert isinstance(first["group_id"], int)


def test_parse_subgroups(subgroups_fixture):
    subgroups = parse_subgroups_response(subgroups_fixture)
    assert len(subgroups) > 0
    first = subgroups[0]
    assert "sub_group_id" in first
    assert "sub_group_name" in first
    assert "group_id" in first
    assert isinstance(first["sub_group_id"], int)


def test_parse_departments(departments_fixture):
    depts = parse_departments_response(departments_fixture)
    assert len(depts) > 0
    first = depts[0]
    assert "department_id" in first
    assert "department_name" in first


def test_parse_standards_list(standards_list_fixture):
    parsed = parse_standards_list_response(standards_list_fixture)
    assert parsed["total"] > 0
    assert parsed["page"] == 1
    assert len(parsed["standards"]) > 0
    first = parsed["standards"][0]
    assert "standard_id" in first
    assert "standard_enc_id" in first
    assert "standard_number" in first
    assert "title" in first
    assert first["standard_number"].startswith("IS ")


def test_parse_laboratories(laboratories_fixture):
    labs = parse_laboratories_response(laboratories_fixture)
    assert len(labs) > 0
    first = labs[0]
    assert "lab_name" in first
    assert "contact_person" in first
    assert "lab_email" in first


def test_parse_licenses(licenses_fixture):
    licenses = parse_licenses_response(licenses_fixture)
    assert len(licenses) > 0
    first = licenses[0]
    assert "license_no" in first
    assert "firm_name" in first
    assert "status" in first
