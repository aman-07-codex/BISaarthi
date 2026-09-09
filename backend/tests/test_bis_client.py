"""Offline unit tests for BISClient and BISCache using mock HTTP transport."""

import json
import os
from pathlib import Path
import tempfile
import httpx
import pytest

from app.services.bis_cache import BISCache
from app.services.bis_client import BISAPIError, BISClient


def test_bis_cache_operations():
    """Test get, set, has, and clear in BISCache."""
    with tempfile.TemporaryDirectory() as tmpdir:
        cache = BISCache(cache_dir=Path(tmpdir), enabled=True)
        endpoint = "https://example.com/api/test"
        payload = {"search": "cement", "page": 1}
        data = {"status": "SUCCESS", "total": 10, "data": []}

        # Initially empty
        assert not cache.has(endpoint, payload)
        assert cache.get(endpoint, payload) is None

        # Save to cache
        cache.set(endpoint, payload, data)
        assert cache.has(endpoint, payload)

        # Retrieve
        cached = cache.get(endpoint, payload)
        assert cached == data

        # Clear
        cleared_count = cache.clear()
        assert cleared_count == 1
        assert not cache.has(endpoint, payload)


def test_bis_cache_disabled():
    """Test that cache does nothing when disabled."""
    with tempfile.TemporaryDirectory() as tmpdir:
        cache = BISCache(cache_dir=Path(tmpdir), enabled=False)
        endpoint = "https://example.com/api/test"
        payload = {"search": "cement"}
        data = {"status": "SUCCESS"}

        cache.set(endpoint, payload, data)
        assert not cache.has(endpoint, payload)
        assert cache.get(endpoint, payload) is None


def test_bis_client_mock_search():
    """Test BISClient standard search with mock HTTP transport."""
    mock_payload = {
        "status": "SUCCESS",
        "statusCode": 200,
        "totalRecord": 1,
        "page": 1,
        "pageSize": 20,
        "data": [
            {
                "standardId": 18707,
                "standardEncId": "token123",
                "standardNumber": "IS 2082:2018",
                "standardName": "Stationary storage electric water heaters",
                "standardLabel": "IS 2082:2018 Stationary storage...",
                "departmentName": "ELECTROTECHNICAL DEPARTMENT (ETD)",
                "sectionalCommitteeName": "ETD 32 - Electrical Appliances",
                "typeOfStandardName": "Product Specification",
                "publishedOn": "2018-04-30",
                "publishedOnFormatted": "30 Apr 2018",
            }
        ],
    }

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/getWebsiteIndianStandardsList")
        return httpx.Response(200, json=mock_payload)

    transport = httpx.MockTransport(handler)
    with tempfile.TemporaryDirectory() as tmpdir:
        cache = BISCache(cache_dir=Path(tmpdir), enabled=False)
        with BISClient(transport=transport, cache=cache, rate_limit_delay=0.0) as client:
            result = client.search_standards("IS 2082")
            assert result["total"] == 1
            assert len(result["standards"]) == 1
            std = result["standards"][0]
            assert std["standard_id"] == 18707
            assert std["standard_number"] == "IS 2082:2018"
            assert std["department_name"] == "ELECTROTECHNICAL DEPARTMENT (ETD)"


def test_bis_client_retry_on_transient_error():
    """Test retry mechanism on HTTP 500 / 503 errors."""
    attempts = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            return httpx.Response(503, text="Service Unavailable")
        return httpx.Response(200, json={"status": "SUCCESS", "totalRecord": 0, "data": []})

    transport = httpx.MockTransport(handler)
    with tempfile.TemporaryDirectory() as tmpdir:
        cache = BISCache(cache_dir=Path(tmpdir), enabled=False)
        with BISClient(transport=transport, cache=cache, max_retries=3, rate_limit_delay=0.0) as client:
            result = client.search_standards("test")
            assert result["total"] == 0
            assert attempts == 3


def test_bis_client_error_on_persistent_failure():
    """Test that BISAPIError is raised when max retries are exceeded."""
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, text="Internal Server Error")

    transport = httpx.MockTransport(handler)
    with tempfile.TemporaryDirectory() as tmpdir:
        cache = BISCache(cache_dir=Path(tmpdir), enabled=False)
        with BISClient(transport=transport, cache=cache, max_retries=2, rate_limit_delay=0.0) as client:
            with pytest.raises(BISAPIError):
                client.search_standards("fail")


def test_bis_client_detail_endpoints():
    """Test parsing of laboratory and license details."""
    lab_payload = {
        "status": "SUCCESS",
        "data": [
            {
                "id": 1,
                "labName": "NATIONAL TEST HOUSE",
                "oslCode": "8123456",
                "bisCode": "NTH01",
                "labType": "govt",
                "contactPerson": "Dr. A. Sharma",
                "contactNumber": "+91 9999999999",
                "labEmail": "nth@gov.in",
                "district": "KOLKATA",
                "state": "WEST BENGAL",
                "pincode": "700027",
                "validityDate": "2028-12-31",
            }
        ],
    }

    lic_payload = {
        "status": "SUCCESS",
        "data": [
            {
                "licenseNo": "CM/L-1234567",
                "firmName": "ABC CEMENT LTD",
                "firmAddress": "Industrial Area",
                "district": "JAIPUR",
                "state": "RAJASTHAN",
                "validityDate": "2027-06-30",
                "status": "Operative",
                "scale": "Large",
            }
        ],
    }

    def handler(request: httpx.Request) -> httpx.Response:
        if "getStandardLaboratoryDetails" in request.url.path:
            return httpx.Response(200, json=lab_payload)
        if "getStandardLicenseDetails" in request.url.path:
            return httpx.Response(200, json=lic_payload)
        return httpx.Response(404)

    transport = httpx.MockTransport(handler)
    with tempfile.TemporaryDirectory() as tmpdir:
        cache = BISCache(cache_dir=Path(tmpdir), enabled=False)
        with BISClient(transport=transport, cache=cache, rate_limit_delay=0.0) as client:
            labs = client.get_laboratory_details("enc_token_123")
            assert len(labs) == 1
            assert labs[0]["lab_name"] == "NATIONAL TEST HOUSE"

            lics = client.get_license_details("enc_token_123")
            assert len(lics) == 1
            assert lics[0]["license_no"] == "CM/L-1234567"
            assert lics[0]["status"] == "Operative"
