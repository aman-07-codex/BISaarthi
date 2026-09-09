"""Official BIS API Client.

Handles interaction with the official Bureau of Indian Standards microservice APIs
with strict SSL verification, exponential backoff retries, rate limiting, and local caching.
"""

import time
from typing import Any, Dict, List, Optional
import httpx

from app.core.logging import get_logger
from app.services.bis_cache import BISCache
from app.services.bis_parser import (
    parse_amendments_response,
    parse_cross_references_response,
    parse_crs_response,
    parse_departments_response,
    parse_gazette_response,
    parse_groups_response,
    parse_laboratories_response,
    parse_licenses_response,
    parse_mcs_response,
    parse_product_manual_response,
    parse_standard_details_response,
    parse_standards_list_response,
    parse_subgroups_response,
)

logger = get_logger("bis_client")


class BISAPIError(Exception):
    """Exception raised when a BIS API request fails."""
    def __init__(self, message: str, status_code: Optional[int] = None, endpoint: Optional[str] = None):
        super().__init__(message)
        self.status_code = status_code
        self.endpoint = endpoint


class BISClient:
    """Production-grade reusable client for official BIS catalogue APIs."""

    DEFAULT_PROPOSAL_URL = "https://standardsadmin.bis.gov.in/proposal-service/"
    DEFAULT_REVIEW_URL = "https://standardsadmin.bis.gov.in/review-service/"
    DEFAULT_PROJECT_URL = "https://standardsadmin.bis.gov.in/project-service/"

    def __init__(
        self,
        proposal_base_url: Optional[str] = None,
        review_base_url: Optional[str] = None,
        project_base_url: Optional[str] = None,
        timeout: float = 20.0,
        rate_limit_delay: float = 0.15,
        max_retries: int = 3,
        verify_ssl: bool = True,
        cache: Optional[BISCache] = None,
        transport: Optional[httpx.BaseTransport] = None,
    ):
        self.proposal_base_url = (proposal_base_url or self.DEFAULT_PROPOSAL_URL).rstrip("/")
        self.review_base_url = (review_base_url or self.DEFAULT_REVIEW_URL).rstrip("/")
        self.project_base_url = (project_base_url or self.DEFAULT_PROJECT_URL).rstrip("/")
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.max_retries = max_retries
        self.verify_ssl = verify_ssl
        self.cache = cache if cache is not None else BISCache()
        self._last_request_time = 0.0

        headers = {
            "User-Agent": "BISaarthi-Validator/1.0 (Mozilla/5.0)",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://standards.bis.gov.in",
            "Referer": "https://standards.bis.gov.in/",
        }

        self.client = httpx.Client(
            headers=headers,
            timeout=self.timeout,
            verify=self.verify_ssl,
            transport=transport,
        )

    def __enter__(self) -> "BISClient":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()

    def close(self) -> None:
        """Close the underlying HTTP client."""
        if hasattr(self, "client") and not self.client.is_closed:
            self.client.close()

    def _apply_rate_limit(self) -> None:
        """Enforce rate-limiting delay between network calls."""
        if self.rate_limit_delay <= 0:
            return
        now = time.time()
        elapsed = now - self._last_request_time
        if elapsed < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - elapsed)
        self._last_request_time = time.time()

    def _post(self, url: str, payload: Optional[Dict[str, Any]] = None, use_cache: bool = True) -> Dict[str, Any]:
        """Execute a POST request with caching, rate limiting, and exponential retries."""
        payload = payload or {}

        # 1. Check local cache
        if use_cache and self.cache:
            cached_data = self.cache.get(url, payload)
            if cached_data is not None:
                return cached_data

        # 2. Network request with retries
        last_exception: Optional[Exception] = None
        for attempt in range(1, self.max_retries + 1):
            self._apply_rate_limit()
            try:
                logger.debug(f"POST {url} (attempt {attempt}/{self.max_retries})")
                response = self.client.post(url, json=payload)

                if response.status_code == 200:
                    try:
                        data = response.json()
                    except Exception as json_err:
                        raise BISAPIError(f"Malformed JSON response from {url}: {json_err}", 200, url)

                    if use_cache and self.cache:
                        self.cache.set(url, payload, data)
                    return data

                # Retry on 429 or 5xx
                if response.status_code in (429, 500, 502, 503, 504):
                    logger.warning(f"Transient HTTP {response.status_code} from {url}, retry {attempt}")
                    time.sleep(0.5 * (2 ** (attempt - 1)))
                    continue

                raise BISAPIError(
                    f"BIS API HTTP {response.status_code} from {url}: {response.text[:200]}",
                    status_code=response.status_code,
                    endpoint=url,
                )

            except (httpx.RequestError, httpx.TimeoutException) as req_err:
                last_exception = req_err
                logger.warning(f"Network error on {url} (attempt {attempt}): {req_err}")
                if attempt < self.max_retries:
                    time.sleep(0.5 * (2 ** (attempt - 1)))

        raise BISAPIError(
            f"Failed to query BIS API endpoint {url} after {self.max_retries} attempts: {last_exception}",
            endpoint=url,
        )

    def search_standards(
        self,
        query: str,
        page_number: int = 1,
        page_size: int = 20,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """Search Indian Standards listing endpoint."""
        url = f"{self.proposal_base_url}/getWebsiteIndianStandardsList"
        payload = {
            "pageNumber": page_number,
            "pageSize": page_size,
            "search": query,
        }
        raw_response = self._post(url, payload, use_cache=use_cache)
        return parse_standards_list_response(raw_response)

    def resolve_standard_candidates(
        self,
        is_number: str,
        standard_id: Optional[int] = None,
        use_cache: bool = True,
    ) -> List[Dict[str, Any]]:
        """Multi-strategy search to resolve candidate standard records for an IS number."""
        candidates_map: Dict[int, Dict[str, Any]] = {}

        # Strategy 1: Exact search with full is_number
        res1 = self.search_standards(is_number, page_number=1, page_size=20, use_cache=use_cache)
        for std in res1.get("standards", []):
            sid = std.get("standard_id")
            if sid is not None:
                candidates_map[sid] = std

        # Strategy 2: If standard_id is known and not found in Strategy 1, search by base IS identifier
        if not candidates_map or (standard_id and standard_id not in candidates_map):
            if ":" in is_number:
                base_q = is_number.split(":")[0].strip()
                res2 = self.search_standards(base_q, page_number=1, page_size=20, use_cache=use_cache)
                for std in res2.get("standards", []):
                    sid = std.get("standard_id")
                    if sid is not None:
                        candidates_map[sid] = std

        # Strategy 3: Numeric search if still not found
        if not candidates_map or (standard_id and standard_id not in candidates_map):
            import re
            m = re.search(r"\d+", is_number)
            if m:
                res3 = self.search_standards(m.group(0), page_number=1, page_size=20, use_cache=use_cache)
                for std in res3.get("standards", []):
                    sid = std.get("standard_id")
                    if sid is not None:
                        candidates_map[sid] = std

        return list(candidates_map.values())

    def get_laboratory_details(self, standard_enc_id: str, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch accredited laboratories for a standard by standardEncId."""
        url = f"{self.review_base_url}/getStandardLaboratoryDetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_laboratories_response(raw)

    def get_license_details(self, standard_enc_id: str, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch active manufacturer licenses for a standard by standardEncId."""
        url = f"{self.review_base_url}/getStandardLicenseDetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_licenses_response(raw)

    def get_cross_references(self, standard_enc_id: str, use_cache: bool = True) -> Dict[str, Any]:
        """Fetch cross-referenced standards by standardEncId."""
        url = f"{self.review_base_url}/getCrossRefDetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return raw.get("data", {}) if isinstance(raw, dict) else {}

    def get_groups(self, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch all top-level technical groups."""
        url = f"{self.project_base_url}/getWebsiteGroupName"
        raw = self._post(url, {}, use_cache=use_cache)
        return parse_groups_response(raw)

    def get_departments(self, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch all technical departments."""
        url = f"{self.project_base_url}/getWebsiteTechnicalDepartments"
        raw = self._post(url, {}, use_cache=use_cache)
        return parse_departments_response(raw)

    def get_standard_details(self, standard_id: Any, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch official standard details from proposal-service/getStandardsWithDeptAndCommittee."""
        url = f"{self.proposal_base_url}/getStandardsWithDeptAndCommittee"
        payload = {"StandardId": standard_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_standard_details_response(raw)

    def get_amendments(self, standard_enc_id: str, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch published amendment records from review-service/getAmendmentDetails."""
        url = f"{self.review_base_url}/getAmendmentDetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_amendments_response(raw)

    def get_gazette_notifications(self, standard_enc_id: str, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch statutory Gazette notifications from review-service/getGazettedetails."""
        url = f"{self.review_base_url}/getGazettedetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_gazette_response(raw)

    def get_product_manuals(self, standard_enc_id: str, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch official BIS product manuals from review-service/getProductManualDetails."""
        url = f"{self.review_base_url}/getProductManualDetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_product_manual_response(raw)

    def get_crs_details(self, standard_enc_id: str, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch Compulsory Registration Scheme details from review-service/getStandardCRSDetails."""
        url = f"{self.review_base_url}/getStandardCRSDetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_crs_response(raw)

    def get_mcs_details(self, standard_enc_id: str, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch Management Systems Certification details from review-service/getStandardMCSDetails."""
        url = f"{self.review_base_url}/getStandardMCSDetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_mcs_response(raw)

    def get_parsed_cross_references(self, standard_enc_id: str, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch parsed cross-referenced standards from review-service/getCrossRefDetails."""
        url = f"{self.review_base_url}/getCrossRefDetails"
        payload = {"standardId": standard_enc_id}
        raw = self._post(url, payload, use_cache=use_cache)
        return parse_cross_references_response(raw)


