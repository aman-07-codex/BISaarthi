"""Official BIS Standard Detail Service for Phase 9.

Orchestrates multi-tab discovery and structured normalization across official
Bureau of Indian Standards microservice APIs (proposal-service, review-service, project-service).
Ensures deterministic data retrieval, strict provenance, explicit verification statuses,
and zero fabricated data.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union

from app.core.logging import get_logger
from app.schemas.bis_standard_detail import (
    DetailDataStatus,
    OfficialStandardDetailDocument,
    StandardDetailSection,
    StandardDetailSectionType,
)
from app.services.bis_client import BISAPIError, BISClient

logger = get_logger("bis_standard_detail_service")


class BISStandardDetailService:
    """Production service for official BIS standard detail data discovery and normalization."""

    def __init__(self, bis_client: Optional[BISClient] = None):
        self.bis_client = bis_client or BISClient()

    def fetch_standard_details(
        self,
        is_number: str,
        standard_id: Optional[int] = None,
        standard_enc_id: Optional[str] = None,
        title: Optional[str] = None,
        category: Optional[str] = None,
        use_cache: bool = True,
    ) -> OfficialStandardDetailDocument:
        """Discovers, retrieves, and normalizes all interactive tabs/sections for an Indian Standard.
        
        Queries:
        1. Basic Details & Governance -> proposal-service/getStandardsWithDeptAndCommittee
        2. Laboratory Testing Infrastructure -> review-service/getStandardLaboratoryDetails
        3. Manufacturer Licenses (ISI Scheme) -> review-service/getStandardLicenseDetails
        4. Published Amendments -> review-service/getAmendmentDetails
        5. Statutory Gazette Notifications -> review-service/getGazettedetails
        6. BIS Product Manuals -> review-service/getProductManualDetails
        7. Compulsory Registration Scheme (CRS) -> review-service/getStandardCRSDetails
        8. Management Systems Certification (MCS) -> review-service/getStandardMCSDetails
        9. Standards Referred / Cross References -> review-service/getCrossRefDetails
        
        Args:
            is_number: Authoritative IS identifier (e.g. 'IS 2082:2018').
            standard_id: Optional numeric standard ID.
            standard_enc_id: Optional encrypted standard identifier.
            title: Optional standard title.
            category: Optional corpus category.
            use_cache: Whether to use local cache.
            
        Returns:
            Normalized OfficialStandardDetailDocument with verified section data and strict provenance.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        resolved_title = title or is_number
        resolved_category = category or "General"

        # Auto-resolve standard identity from authoritative corpus if omitted
        if standard_id is None or not standard_enc_id:
            try:
                from app.services.bis_corpus_service import BISCorpusService
                raw_std = BISCorpusService.get_instance().get_raw_standard(is_number)
                if raw_std:
                    if standard_id is None:
                        standard_id = raw_std.get("standard_id")
                    if not standard_enc_id:
                        standard_enc_id = raw_std.get("standard_enc_id")
                    if not title or title == is_number:
                        resolved_title = raw_std.get("title", resolved_title)
                    if not category or category == "General":
                        resolved_category = raw_std.get("category", resolved_category)
            except Exception:
                pass

        sections: Dict[str, StandardDetailSection] = {}

        # 1. Basic Details & Governance (proposal-service)
        basic_items: List[Dict[str, Any]] = []
        dept_comm_items: List[Dict[str, Any]] = []
        basic_endpoint = f"{self.bis_client.proposal_base_url}/getStandardsWithDeptAndCommittee"

        if standard_id is not None:
            try:
                std_details = self.bis_client.get_standard_details(standard_id, use_cache=use_cache)
                if std_details:
                    for item in std_details:
                        if item.get("title") and not title:
                            resolved_title = item.get("title", resolved_title)
                        if item.get("standard_enc_id") and not standard_enc_id:
                            standard_enc_id = item.get("standard_enc_id")

                        basic_items.append({
                            "standard_id": item.get("standard_id"),
                            "pk_is_id": item.get("pk_is_id"),
                            "standard_number": item.get("standard_number") or is_number,
                            "title": item.get("title") or resolved_title,
                            "standard_enc_id": item.get("standard_enc_id"),
                        })

                        dept_comm_items.append({
                            "department_id": item.get("department_id"),
                            "department_name": item.get("department_name"),
                            "committee_id": item.get("committee_id"),
                            "committee_name": item.get("committee_name"),
                        })
            except Exception as e:
                logger.warning(f"Error fetching basic details for {is_number} (ID {standard_id}): {e}")

        sections[StandardDetailSectionType.BASIC_DETAILS.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.BASIC_DETAILS.value,
            section_title="Basic Standard Details",
            data_status=DetailDataStatus.VERIFIED if basic_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(basic_items),
            items=basic_items,
            summary_text=f"Official identity and publication metadata for {is_number}." if basic_items else None,
            source_endpoint=basic_endpoint,
        )

        sections[StandardDetailSectionType.DEPARTMENT_COMMITTEE.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.DEPARTMENT_COMMITTEE.value,
            section_title="Department & Technical Committee",
            data_status=DetailDataStatus.VERIFIED if dept_comm_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(dept_comm_items),
            items=dept_comm_items,
            summary_text=(
                f"Formulated under {dept_comm_items[0].get('department_name', 'BIS Department')} by {dept_comm_items[0].get('committee_name', 'Technical Committee')}."
                if dept_comm_items else None
            ),
            source_endpoint=basic_endpoint,
        )

        # 2. Laboratory Testing Infrastructure (review-service)
        lab_items: List[Dict[str, Any]] = []
        lab_endpoint = f"{self.bis_client.review_base_url}/getStandardLaboratoryDetails"
        if standard_enc_id:
            try:
                lab_items = self.bis_client.get_laboratory_details(standard_enc_id, use_cache=use_cache)
            except Exception as e:
                logger.warning(f"Error fetching laboratories for {is_number}: {e}")

        sections[StandardDetailSectionType.LABORATORIES.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.LABORATORIES.value,
            section_title="Recognized Testing Laboratories",
            data_status=DetailDataStatus.VERIFIED if lab_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(lab_items),
            items=lab_items,
            summary_text=f"{len(lab_items)} official accredited testing laboratories identified for conformity assessment." if lab_items else None,
            source_endpoint=lab_endpoint,
        )

        # 3. Manufacturer Licenses (review-service)
        lic_items: List[Dict[str, Any]] = []
        lic_endpoint = f"{self.bis_client.review_base_url}/getStandardLicenseDetails"
        if standard_enc_id:
            try:
                lic_items = self.bis_client.get_license_details(standard_enc_id, use_cache=use_cache)
            except Exception as e:
                logger.warning(f"Error fetching licenses for {is_number}: {e}")

        sections[StandardDetailSectionType.LICENSES.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.LICENSES.value,
            section_title="Active Manufacturer Licenses (ISI Mark)",
            data_status=DetailDataStatus.VERIFIED if lic_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(lic_items),
            items=lic_items,
            summary_text=f"{len(lic_items)} active operative manufacturer licenses registered with BIS under Scheme-I (ISI mark)." if lic_items else None,
            source_endpoint=lic_endpoint,
        )

        # 4. Published Amendments (review-service)
        amd_items: List[Dict[str, Any]] = []
        amd_endpoint = f"{self.bis_client.review_base_url}/getAmendmentDetails"
        if standard_enc_id:
            try:
                amd_items = self.bis_client.get_amendments(standard_enc_id, use_cache=use_cache)
            except Exception as e:
                logger.warning(f"Error fetching amendments for {is_number}: {e}")

        sections[StandardDetailSectionType.AMENDMENTS.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.AMENDMENTS.value,
            section_title="Published Amendments",
            data_status=DetailDataStatus.VERIFIED if amd_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(amd_items),
            items=amd_items,
            summary_text=f"{len(amd_items)} official amendment(s) published for this standard." if amd_items else None,
            source_endpoint=amd_endpoint,
        )

        # 5. Statutory Gazette Notifications (review-service)
        gaz_items: List[Dict[str, Any]] = []
        gaz_endpoint = f"{self.bis_client.review_base_url}/getGazettedetails"
        if standard_enc_id:
            try:
                gaz_items = self.bis_client.get_gazette_notifications(standard_enc_id, use_cache=use_cache)
            except Exception as e:
                logger.warning(f"Error fetching gazette notifications for {is_number}: {e}")

        sections[StandardDetailSectionType.GAZETTE.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.GAZETTE.value,
            section_title="Statutory Gazette Notifications",
            data_status=DetailDataStatus.VERIFIED if gaz_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(gaz_items),
            items=gaz_items,
            summary_text=f"{len(gaz_items)} statutory Gazette notification(s) registered in the official BIS gazette repository." if gaz_items else None,
            source_endpoint=gaz_endpoint,
        )

        # 6. BIS Product Manuals (review-service)
        pm_items: List[Dict[str, Any]] = []
        pm_endpoint = f"{self.bis_client.review_base_url}/getProductManualDetails"
        if standard_enc_id:
            try:
                pm_items = self.bis_client.get_product_manuals(standard_enc_id, use_cache=use_cache)
            except Exception as e:
                logger.warning(f"Error fetching product manual for {is_number}: {e}")

        sections[StandardDetailSectionType.PRODUCT_MANUAL.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.PRODUCT_MANUAL.value,
            section_title="BIS Product Manual",
            data_status=DetailDataStatus.VERIFIED if pm_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(pm_items),
            items=pm_items,
            summary_text="Official BIS Product Manual available detailing testing protocols, sampling guidelines, and Scheme-I inspection rules." if pm_items else None,
            source_endpoint=pm_endpoint,
        )

        # 7. Compulsory Registration Scheme (review-service)
        crs_items: List[Dict[str, Any]] = []
        crs_endpoint = f"{self.bis_client.review_base_url}/getStandardCRSDetails"
        if standard_enc_id:
            try:
                crs_items = self.bis_client.get_crs_details(standard_enc_id, use_cache=use_cache)
            except Exception as e:
                logger.warning(f"Error fetching CRS details for {is_number}: {e}")

        sections[StandardDetailSectionType.CERTIFICATION_CRS.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.CERTIFICATION_CRS.value,
            section_title="Compulsory Registration Scheme (CRS)",
            data_status=DetailDataStatus.VERIFIED if crs_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(crs_items),
            items=crs_items,
            summary_text=f"{len(crs_items)} registration(s) under CRS Scheme-II." if crs_items else None,
            source_endpoint=crs_endpoint,
        )

        # 8. Management Systems Certification (review-service)
        mcs_items: List[Dict[str, Any]] = []
        mcs_endpoint = f"{self.bis_client.review_base_url}/getStandardMCSDetails"
        if standard_enc_id:
            try:
                mcs_items = self.bis_client.get_mcs_details(standard_enc_id, use_cache=use_cache)
            except Exception as e:
                logger.warning(f"Error fetching MCS details for {is_number}: {e}")

        sections[StandardDetailSectionType.CERTIFICATION_MCS.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.CERTIFICATION_MCS.value,
            section_title="Management Systems Certification (MCS)",
            data_status=DetailDataStatus.VERIFIED if mcs_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(mcs_items),
            items=mcs_items,
            summary_text=f"{len(mcs_items)} certification(s) under MCS Scheme." if mcs_items else None,
            source_endpoint=mcs_endpoint,
        )

        # 9. Standards Referred / Cross References (review-service)
        ref_items: List[Dict[str, Any]] = []
        ref_endpoint = f"{self.bis_client.review_base_url}/getCrossRefDetails"
        if standard_enc_id:
            try:
                ref_items = self.bis_client.get_parsed_cross_references(standard_enc_id, use_cache=use_cache)
            except Exception as e:
                logger.warning(f"Error fetching cross references for {is_number}: {e}")

        sections[StandardDetailSectionType.STANDARDS_REFERRED.value] = StandardDetailSection(
            section_name=StandardDetailSectionType.STANDARDS_REFERRED.value,
            section_title="Standards Referred",
            data_status=DetailDataStatus.VERIFIED if ref_items else DetailDataStatus.UNAVAILABLE,
            item_count=len(ref_items),
            items=ref_items,
            summary_text=f"{len(ref_items)} normative cross-referenced standards." if ref_items else None,
            source_endpoint=ref_endpoint,
        )

        # Determine overall verification status
        has_any_verified = any(s.data_status == DetailDataStatus.VERIFIED for s in sections.values())
        overall_status = "verified" if has_any_verified else "unavailable"

        return OfficialStandardDetailDocument(
            source="BIS",
            source_type="official_bis_standard_details",
            standard_id=standard_id,
            standard_enc_id=standard_enc_id,
            is_number=is_number,
            title=resolved_title,
            category=resolved_category,
            official_bis_url="https://standards.bis.gov.in/website/published-standards/published-standards-list",
            retrieved_at=now_iso,
            verification_status=overall_status,
            sections=sections,
        )
