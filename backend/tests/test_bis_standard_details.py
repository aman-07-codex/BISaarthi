"""Comprehensive unit test suite for Phase 9: Official BIS Standard Detail API & RAG Enrichment."""

import json
from unittest.mock import MagicMock, patch
import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.bis_rag import GroundingStatus, RAGLanguage, RAGQuery
from app.schemas.bis_standard_detail import (
    DetailDataStatus,
    OfficialStandardDetailDocument,
    StandardDetailSection,
    StandardDetailSectionType,
)
from app.services.bis_client import BISClient
from app.services.bis_corpus_service import BISCorpusService
from app.services.bis_llm_provider import MockLLMProvider
from app.services.bis_parser import (
    parse_amendments_response,
    parse_cross_references_response,
    parse_crs_response,
    parse_gazette_response,
    parse_mcs_response,
    parse_product_manual_response,
    parse_standard_details_response,
)
from app.services.bis_rag import BISRAGService
from app.services.bis_standard_detail_service import BISStandardDetailService


# ---------------------------------------------------------------------------
# Deterministic Mock Payloads for BIS Microservices
# ---------------------------------------------------------------------------

MOCK_DEPT_COMMITTEE_PAYLOAD = {
    "status": "SUCCESS",
    "statusCode": 200,
    "msg": "Standard details fetched successfully",
    "data": [
        {
            "standardId": 18707,
            "pk_is_id": 18711,
            "standardEncId": "enc_2082_mock",
            "standardNumber": "IS 2082:2018",
            "standardName": "Stationary storage type electric water heaters - Specification (Fifth Revision)",
            "departmentId": 65,
            "deptPreparedName": "Electrotechnical Department(ETD)",
            "committeeId": 265,
            "secCommitteePreparedName": "ETD 32 - Electrical Appliances",
            "reviewId": "rev_2082_mock",
        }
    ],
}

MOCK_LABS_PAYLOAD = {
    "status": "SUCCESS",
    "statusCode": 200,
    "msg": "Laboratory details fetched successfully.",
    "data": [
        {
            "id": 1,
            "labName": "INTERNATIONAL TESTING AND COMPLIANCE (OPC) PRIVATE LIMITED",
            "oslCode": "8188026",
            "bisCode": "--",
            "labType": "osl",
            "contactPerson": "Princy Gupta",
            "contactNumber": "+91 9811499209",
            "labEmail": "info@itcindia.org",
            "labAddress": "PLOT NO 860 HSIIDC INDUSTRIAL AREA RAI",
            "district": "SONIPAT",
            "state": "HARYANA",
            "pincode": "131029",
            "validityDate": "2027-02-18",
        }
    ],
}

MOCK_LICENSES_PAYLOAD = {
    "status": "SUCCESS",
    "statusCode": 200,
    "msg": "License details fetched successfully.",
    "data": [
        {
            "id": 1,
            "licenseNo": "7500335110",
            "firmName": "KAIZEN ENGINEERING (INDIA) PRIVATE LIMITED",
            "firmAddress": "GAT NO 373/1, WMDC, NEAR RAJ PROCESS,KHARABWADI, KHED,PUNE",
            "district": "PUNE",
            "state": "MAHARASHTRA",
            "validityDate": "2031-05-01",
            "status": "Operative",
            "scale": "Small",
        }
    ],
}

MOCK_AMENDMENTS_PAYLOAD = {
    "status": "SUCCESS",
    "statusCode": 200,
    "msg": "Record fetched successfully.",
    "data": [
        {
            "standardId": 18707,
            "standardNumber": "IS 2082:2018",
            "noOfAmendment": 1,
            "amendmentYear": "2019",
            "is_documents": "BisProd/bisProd/oldStandards/S16/S16V01/2082A1.pdf",
            "amendmentLabel": "First Amendment",
        }
    ],
}

MOCK_GAZETTE_PAYLOAD = {
    "status": "SUCCESS",
    "statusCode": 200,
    "msg": "Gazette details fetched successfully.",
    "data": [
        {
            "IS_NO": 18711,
            "So_No": "1776(E) ",
            "migratedFiles": "BisProd/bisProd/oldStandardsFormulation/GazatteFiles/ETD/gf_265_18711.pdf",
            "pki_id": 405,
            "Amd_No": 0,
            "standardNumber": "IS 2082:2018",
            "standardId": 18707,
        }
    ],
}

MOCK_PRODUCT_MANUAL_PAYLOAD = {
    "status": "SUCCESS",
    "statusCode": 200,
    "data": {
        "status": "success",
        "message": "Data Found",
        "product_manuals_details": [
            {
                "pk_is_id": "18711",
                "is_number": "IS 2082 : 2018",
                "file_path": "BisProd/bisProd/Standard_Product_Manual/product_manual_2082.pdf",
            }
        ],
    },
}

MOCK_CROSS_REF_PAYLOAD = {
    "status": "SUCCESS",
    "statusCode": 200,
    "msg": "Record fetched successfully.",
    "data": {
        "crossRefData": [
            {
                "referredStandardNumber": "IS 302 (Part 1)",
                "referredStandardName": "Safety of household and similar electrical appliances",
                "clauseNo": "Clause 3.1",
            }
        ],
        "crossFollowRefData": [],
    },
}


class MockBISTransport(httpx.BaseTransport):
    """Deterministic offline transport mapping BIS endpoints to test fixtures."""

    def handle_request(self, request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        content_body = json.loads(request.content.decode("utf-8")) if request.content else {}

        if "getStandardsWithDeptAndCommittee" in url_str:
            return httpx.Response(200, json=MOCK_DEPT_COMMITTEE_PAYLOAD)
        elif "getStandardLaboratoryDetails" in url_str:
            return httpx.Response(200, json=MOCK_LABS_PAYLOAD)
        elif "getStandardLicenseDetails" in url_str:
            return httpx.Response(200, json=MOCK_LICENSES_PAYLOAD)
        elif "getAmendmentDetails" in url_str:
            return httpx.Response(200, json=MOCK_AMENDMENTS_PAYLOAD)
        elif "getGazettedetails" in url_str:
            return httpx.Response(200, json=MOCK_GAZETTE_PAYLOAD)
        elif "getProductManualDetails" in url_str:
            return httpx.Response(200, json=MOCK_PRODUCT_MANUAL_PAYLOAD)
        elif "getCrossRefDetails" in url_str:
            return httpx.Response(200, json=MOCK_CROSS_REF_PAYLOAD)
        elif "getStandardCRSDetails" in url_str or "getStandardMCSDetails" in url_str:
            return httpx.Response(200, json={"status": "SUCCESS", "statusCode": 200, "data": []})

        return httpx.Response(404, json={"status": "ERROR", "msg": "Endpoint not found"})


# ---------------------------------------------------------------------------
# Test Cases 1 - 10
# ---------------------------------------------------------------------------

def test_1_retrieve_is_2082_standard_details():
    """Test 1: Retrieve IS 2082:2018 and verify identity, title, detail sections, provenance."""
    client = BISClient(transport=MockBISTransport())
    service = BISStandardDetailService(bis_client=client)

    doc = service.fetch_standard_details(
        is_number="IS 2082:2018",
        standard_id=18707,
        standard_enc_id="enc_2082_mock",
        title="Stationary storage type electric water heaters - Specification (Fifth Revision)",
        category="Electrical Appliances & Accessories",
        use_cache=False,
    )

    assert isinstance(doc, OfficialStandardDetailDocument)
    assert doc.is_number == "IS 2082:2018"
    assert doc.standard_id == 18707
    assert doc.source == "BIS"
    assert doc.source_type == "official_bis_standard_details"
    assert doc.verification_status == "verified"
    assert "basic_details" in doc.sections
    assert "department_committee" in doc.sections
    assert "amendments" in doc.sections
    assert "laboratories" in doc.sections
    assert "licenses" in doc.sections


def test_2_department_and_committee_parsed_correctly():
    """Test 2: Classification, Department and Committee data is parsed correctly."""
    parsed = parse_standard_details_response(MOCK_DEPT_COMMITTEE_PAYLOAD)
    assert len(parsed) == 1
    item = parsed[0]
    assert item["standard_id"] == 18707
    assert item["department_id"] == 65
    assert item["department_name"] == "Electrotechnical Department(ETD)"
    assert item["committee_id"] == 265
    assert item["committee_name"] == "ETD 32 - Electrical Appliances"


def test_3_amendment_data_parsed_correctly():
    """Test 3: Amendment data is parsed correctly when available."""
    parsed = parse_amendments_response(MOCK_AMENDMENTS_PAYLOAD)
    assert len(parsed) == 1
    amd = parsed[0]
    assert amd["amendment_number"] == 1
    assert amd["amendment_year"] == "2019"
    assert amd["amendment_label"] == "First Amendment"
    assert "2082A1.pdf" in amd["document_path"]


def test_4_referred_standards_and_cross_refs_parsed_correctly():
    """Test 4: Referred standards and cross references are parsed correctly."""
    parsed = parse_cross_references_response(MOCK_CROSS_REF_PAYLOAD)
    assert len(parsed) == 1
    ref = parsed[0]
    assert ref["referred_is_number"] == "IS 302 (Part 1)"
    assert "Safety of household" in ref["referred_title"]
    assert ref["clause_reference"] == "Clause 3.1"


def test_5_missing_tab_data_produces_unavailable_status():
    """Test 5: Missing tab/API data produces 'unavailable' rather than fabricated content."""
    empty_transport = httpx.MockTransport(lambda req: httpx.Response(200, json={"status": "SUCCESS", "statusCode": 200, "data": []}))
    client = BISClient(transport=empty_transport)
    service = BISStandardDetailService(bis_client=client)

    doc = service.fetch_standard_details(
        is_number="IS 9999:2099",
        standard_id=9999,
        standard_enc_id="enc_empty_mock",
        use_cache=False,
    )

    assert doc.sections[StandardDetailSectionType.AMENDMENTS.value].data_status == DetailDataStatus.UNAVAILABLE
    assert doc.sections[StandardDetailSectionType.AMENDMENTS.value].item_count == 0
    assert doc.sections[StandardDetailSectionType.LABORATORIES.value].data_status == DetailDataStatus.UNAVAILABLE
    assert doc.sections[StandardDetailSectionType.LICENSES.value].data_status == DetailDataStatus.UNAVAILABLE
    assert doc.sections[StandardDetailSectionType.PRODUCT_MANUAL.value].data_status == DetailDataStatus.UNAVAILABLE


def test_6_existing_metadata_fallback_still_works():
    """Test 6: Existing metadata fallback still functions seamlessly in RAG service."""
    corpus_svc = BISCorpusService.get_instance()
    rag_svc = BISRAGService(corpus_service=corpus_svc, llm_provider=MockLLMProvider())

    query = RAGQuery(query_text="I want to manufacture a 15-litre electric geyser. Which BIS standards apply?")
    answer = rag_svc.answer_query(query)

    assert answer.grounded is True
    assert answer.grounding_status == GroundingStatus.PARTIALLY_GROUNDED
    assert "IS 2082:2018" in answer.answer_text
    assert answer.execution_metadata.get("response_mode") == "metadata_fallback"
    assert len(answer.citations) > 0


def test_7_standards_detail_api_endpoint_compatible():
    """Test 7: Existing /api/standards/{is_number_or_id} endpoint remains compatible."""
    client = TestClient(app)
    response = client.get("/api/standards/IS 2082:2018")
    assert response.status_code == 200
    data = response.json()
    assert data["is_number"] == "IS 2082:2018"
    assert "Stationary storage type electric water heaters" in data["title"]
    assert "Electrical Appliances" in str(data.get("categories", [])) or "Electrical Appliances" in str(data.get("department", ""))


def test_8_standards_list_api_endpoint_unchanged():
    """Test 8: Existing /api/standards listing endpoint remains unchanged."""
    client = TestClient(app)
    response = client.get("/api/standards?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] == 100
    assert len(data["items"]) == 10


def test_9_standards_comparison_functionality_unchanged():
    """Test 9: Existing comparison functionality remains operational."""
    client = TestClient(app)
    payload = {
        "standard_a": "IS 2082:2018",
        "standard_b": "IS 302 (Part 1):2024",
    }
    response = client.post("/api/standards/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["standard_a"]["is_number"] == "IS 2082:2018"
    assert data["standard_b"]["is_number"] == "IS 302 (Part 1):2024"
    assert "comparison" in data


def test_10_chat_endpoint_remains_functional():
    """Test 10: Existing /api/chat endpoint remains functional."""
    client = TestClient(app)
    payload = {
        "message": "Which Indian standard applies to stationary electric water heaters?",
        "language": "en",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "IS 2082:2018" in data["answer"]
    assert data["grounding_status"] in ("grounded", "partially_grounded")
    assert len(data.get("citations", [])) > 0
