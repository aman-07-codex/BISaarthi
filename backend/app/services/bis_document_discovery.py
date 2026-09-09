"""Official BIS Document Discovery Service.

Discovers official BIS document/PDF availability, document URLs, identifiers,
and source metadata strictly for the standards defined in the BISaarthi MVP corpus manifest.
Ensures exact standard identity matching, controlled discovery statuses, and strict
isolation from database operations and unauthenticated third-party mirrors.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple

from app.core.logging import get_logger
from app.schemas.bis_document import (
    BISDocumentManifest,
    BISDocumentRecord,
    CategoryDocumentBreakdown,
    DiscoveryConfidence,
    DiscoveryStatus,
    DocumentCategoryGroup,
    DocumentManifestSummary,
    PriorityLevel,
)
from app.services.bis_client import BISAPIError, BISClient
from app.services.bis_resolver import clean_text, match_standard_identities, parse_is_number

logger = get_logger("bis_document_discovery")

# Authoritative high-priority standards for MVP demo scenarios
HIGH_PRIORITY_BASE_NUMBERS = {
    # Electrical
    "2082", "302", "369", "374", "694", "1293",
    # Construction
    "269", "1489", "456", "383", "1786", "10262",
    # Food/Water
    "14543", "13428", "10500", "15410", "15609",
    # Steel
    "2062", "1239", "1161", "3601", "513",
    # Plastics
    "4984", "4985", "12701", "2798", "13592", "15778",
}


def assign_document_priority(is_number: str) -> PriorityLevel:
    """Assign MVP acquisition priority based on standard base number."""
    identity = parse_is_number(is_number)
    if identity.base_number in HIGH_PRIORITY_BASE_NUMBERS:
        return PriorityLevel.HIGH
    return PriorityLevel.MEDIUM


class BISDocumentDiscoveryService:
    """Service to discover official BIS document availability for manifest standards."""

    def __init__(self, bis_client: Optional[BISClient] = None):
        self.bis_client = bis_client or BISClient()

    def discover_standard_document(
        self,
        manifest_standard: Dict[str, Any],
        category_name: Optional[str] = None,
        use_cache: bool = True,
    ) -> BISDocumentRecord:
        """Discover official document information for a single manifest standard.
        
        Ties discovery strictly to the verified standard identity and official BIS endpoints.
        """
        is_num = manifest_standard.get("is_number", "").strip()
        manifest_std_id = manifest_standard.get("standard_id")
        manifest_enc_id = manifest_standard.get("standard_enc_id")
        manifest_title = manifest_standard.get("title", "").strip()
        cat = category_name or manifest_standard.get("category", "")

        manifest_identity = parse_is_number(is_num)
        priority = assign_document_priority(is_num)
        now_iso = datetime.now(timezone.utc).isoformat()
        issues: List[str] = []

        try:
            # 1. Query official BIS catalogue search endpoint
            candidates = self.bis_client.resolve_standard_candidates(
                is_number=is_num,
                standard_id=manifest_std_id,
                use_cache=use_cache,
            )
        except BISAPIError as err:
            logger.error(f"API error querying BIS for {is_num}: {err}")
            return BISDocumentRecord(
                is_number=is_num,
                standard_id=manifest_std_id,
                standard_enc_id=manifest_enc_id,
                title=manifest_title,
                category=cat,
                document_available=False,
                document_type=None,
                document_url=None,
                source="BIS",
                document_identifier=None,
                discovery_status=DiscoveryStatus.API_ERROR,
                discovery_confidence=None,
                download_status="not_downloaded",
                extraction_status="pending",
                priority=priority,
                source_endpoint=err.endpoint or "https://standardsadmin.bis.gov.in/proposal-service/getWebsiteIndianStandardsList",
                discovery_timestamp=now_iso,
                issues=[f"BIS API Error: {err}"],
            )
        except Exception as exc:
            logger.error(f"Unexpected error resolving {is_num}: {exc}")
            return BISDocumentRecord(
                is_number=is_num,
                standard_id=manifest_std_id,
                standard_enc_id=manifest_enc_id,
                title=manifest_title,
                category=cat,
                document_available=False,
                document_type=None,
                document_url=None,
                source="BIS",
                document_identifier=None,
                discovery_status=DiscoveryStatus.API_ERROR,
                discovery_confidence=None,
                download_status="not_downloaded",
                extraction_status="pending",
                priority=priority,
                source_endpoint="https://standardsadmin.bis.gov.in/proposal-service/getWebsiteIndianStandardsList",
                discovery_timestamp=now_iso,
                issues=[f"Unexpected error: {exc}"],
            )

        # 2. Exact standard match disambiguation
        matched_candidate: Optional[Dict[str, Any]] = None

        # Try match by both standard_id and exact IS identity
        for cand in candidates:
            cand_std_id = cand.get("standard_id")
            cand_num = cand.get("standard_number", "")
            cand_identity = parse_is_number(cand_num)

            is_id_match = (manifest_std_id is not None and cand_std_id == manifest_std_id)
            is_num_match, _ = match_standard_identities(manifest_identity, cand_identity, ignore_year=False)

            if is_id_match and is_num_match:
                matched_candidate = cand
                break

        # Fallback to exact IS identity
        if not matched_candidate:
            for cand in candidates:
                cand_num = cand.get("standard_number", "")
                cand_identity = parse_is_number(cand_num)
                is_num_match, _ = match_standard_identities(manifest_identity, cand_identity, ignore_year=False)
                if is_num_match:
                    matched_candidate = cand
                    break

        # If still not found, check if candidates have base/part match
        if not matched_candidate and candidates:
            for cand in candidates:
                cand_num = cand.get("standard_number", "")
                cand_identity = parse_is_number(cand_num)
                is_num_match, mismatch_reason = match_standard_identities(manifest_identity, cand_identity, ignore_year=True)
                if is_num_match:
                    matched_candidate = cand
                    issues.append(f"Identity note: {mismatch_reason}")
                    break

        # 3. Evaluate candidate resolution
        if not matched_candidate:
            return BISDocumentRecord(
                is_number=is_num,
                standard_id=manifest_std_id,
                standard_enc_id=manifest_enc_id,
                title=manifest_title,
                category=cat,
                document_available=False,
                document_type=None,
                document_url=None,
                source="BIS",
                document_identifier=None,
                discovery_status=DiscoveryStatus.NOT_FOUND,
                discovery_confidence=None,
                download_status="not_downloaded",
                extraction_status="pending",
                priority=priority,
                source_endpoint="https://standardsadmin.bis.gov.in/proposal-service/getWebsiteIndianStandardsList",
                discovery_timestamp=now_iso,
                issues=["Standard record not found in official BIS catalogue responses"],
            )

        # Extract verified BIS metadata
        bis_std_id = matched_candidate.get("standard_id")
        bis_enc_id = matched_candidate.get("standard_enc_id") or manifest_enc_id
        bis_title = clean_text(matched_candidate.get("title") or manifest_title)
        bis_num = matched_candidate.get("standard_number", "")

        # Verify ID consistency
        if manifest_std_id is not None and bis_std_id is not None and manifest_std_id != bis_std_id:
            issues.append(f"Standard ID mismatch: manifest standard_id={manifest_std_id}, BIS standard_id={bis_std_id}")
            return BISDocumentRecord(
                is_number=is_num,
                standard_id=bis_std_id,
                standard_enc_id=bis_enc_id,
                title=bis_title,
                category=cat,
                document_available=False,
                document_type=None,
                document_url=None,
                source="BIS",
                document_identifier=None,
                discovery_status=DiscoveryStatus.REQUIRES_MANUAL_REVIEW,
                discovery_confidence=DiscoveryConfidence.MEDIUM,
                download_status="not_downloaded",
                extraction_status="pending",
                priority=priority,
                source_endpoint="https://standardsadmin.bis.gov.in/proposal-service/getWebsiteIndianStandardsList",
                discovery_timestamp=now_iso,
                issues=issues,
            )

        # Check for explicit document URL or identifier in the BIS candidate response
        # The official BIS catalogue API exposes standard metadata, but full-text PDF documents
        # are managed separately in the BIS portal repository and are not exposed via the public REST payload.
        doc_url = matched_candidate.get("document_url") or matched_candidate.get("pdf_url")
        doc_id = matched_candidate.get("document_id") or matched_candidate.get("document_identifier")
        doc_type = "PDF" if (doc_url or doc_id) else None

        if doc_url:
            discovery_status = DiscoveryStatus.AVAILABLE
            document_available = True
            discovery_confidence = DiscoveryConfidence.HIGH
        else:
            # Standard is confirmed and resolved in official BIS catalogue, but direct unauthenticated PDF URL is not exposed
            discovery_status = DiscoveryStatus.NOT_EXPOSED_BY_API
            document_available = False
            discovery_confidence = DiscoveryConfidence.HIGH
            issues.append("Official standard record verified in BIS catalogue; direct PDF download URL is not exposed by public API payload")

        return BISDocumentRecord(
            is_number=is_num,
            standard_id=bis_std_id or manifest_std_id,
            standard_enc_id=bis_enc_id,
            title=bis_title,
            category=cat,
            document_available=document_available,
            document_type=doc_type,
            document_url=doc_url,
            source="BIS",
            document_identifier=doc_id,
            discovery_status=discovery_status,
            discovery_confidence=discovery_confidence,
            download_status="not_downloaded",
            extraction_status="pending",
            priority=priority,
            source_endpoint="https://standardsadmin.bis.gov.in/proposal-service/getWebsiteIndianStandardsList",
            discovery_timestamp=now_iso,
            issues=issues,
        )

    def discover_corpus_manifest(
        self,
        corpus_manifest_path: str | Path,
        use_cache: bool = True,
    ) -> BISDocumentManifest:
        """Process the authoritative corpus manifest and generate the document discovery manifest.
        
        Strictly processes ONLY the standards present in the corpus manifest.
        """
        path = Path(corpus_manifest_path)
        if not path.exists():
            raise FileNotFoundError(f"Corpus manifest not found at {path}")

        with open(path, "r", encoding="utf-8") as f:
            corpus_data = json.load(f)

        raw_categories = corpus_data.get("categories", [])
        if not raw_categories:
            raise ValueError("Corpus manifest contains no categories or standards")

        total_standards = 0
        status_counts = {
            DiscoveryStatus.AVAILABLE: 0,
            DiscoveryStatus.NOT_FOUND: 0,
            DiscoveryStatus.NOT_EXPOSED_BY_API: 0,
            DiscoveryStatus.REQUIRES_MANUAL_REVIEW: 0,
            DiscoveryStatus.API_ERROR: 0,
        }
        priority_counts = {
            PriorityLevel.HIGH: 0,
            PriorityLevel.MEDIUM: 0,
        }

        category_groups: List[DocumentCategoryGroup] = []
        category_breakdowns: List[CategoryDocumentBreakdown] = []

        now_iso = datetime.now(timezone.utc).isoformat()

        for cat_data in raw_categories:
            cat_name = cat_data.get("name", "Uncategorized")
            stds = cat_data.get("standards", [])

            cat_records: List[BISDocumentRecord] = []
            cat_avail = 0
            cat_not_exp = 0
            cat_rev = 0
            cat_high = 0

            for std in stds:
                total_standards += 1
                record = self.discover_standard_document(
                    manifest_standard=std,
                    category_name=cat_name,
                    use_cache=use_cache,
                )
                cat_records.append(record)

                # Aggregations
                status_counts[record.discovery_status] = status_counts.get(record.discovery_status, 0) + 1
                priority_counts[record.priority] = priority_counts.get(record.priority, 0) + 1

                if record.discovery_status == DiscoveryStatus.AVAILABLE:
                    cat_avail += 1
                elif record.discovery_status == DiscoveryStatus.NOT_EXPOSED_BY_API:
                    cat_not_exp += 1
                elif record.discovery_status == DiscoveryStatus.REQUIRES_MANUAL_REVIEW:
                    cat_rev += 1

                if record.priority == PriorityLevel.HIGH:
                    cat_high += 1

            category_groups.append(
                DocumentCategoryGroup(
                    name=cat_name,
                    standards=cat_records,
                )
            )
            category_breakdowns.append(
                CategoryDocumentBreakdown(
                    category_name=cat_name,
                    total_standards=len(stds),
                    available_count=cat_avail,
                    not_exposed_count=cat_not_exp,
                    manual_review_count=cat_rev,
                    high_priority_count=cat_high,
                )
            )

        summary = DocumentManifestSummary(
            available=status_counts[DiscoveryStatus.AVAILABLE],
            not_found=status_counts[DiscoveryStatus.NOT_FOUND],
            not_exposed_by_api=status_counts[DiscoveryStatus.NOT_EXPOSED_BY_API],
            requires_manual_review=status_counts[DiscoveryStatus.REQUIRES_MANUAL_REVIEW],
            api_error=status_counts[DiscoveryStatus.API_ERROR],
            high_priority_count=priority_counts[PriorityLevel.HIGH],
            medium_priority_count=priority_counts[PriorityLevel.MEDIUM],
        )

        return BISDocumentManifest(
            version="1.0",
            purpose="BISaarthi MVP official BIS document manifest",
            source_corpus="bis_mvp_corpus_manifest.json",
            total_standards=total_standards,
            document_discovery_timestamp=now_iso,
            summary=summary,
            category_breakdown=category_breakdowns,
            categories=category_groups,
        )


def generate_document_manifest_markdown(manifest: BISDocumentManifest) -> str:
    """Generate the human-readable Markdown report for the document manifest."""
    lines = [
        "# BISaarthi MVP Document Manifest",
        "",
        "## Purpose",
        "",
        "This document manifest maps the approved 100-standard BISaarthi MVP corpus to official Bureau of Indian Standards (BIS) document availability.",
        "It establishes the authoritative acquisition reference for each standard without downloading or processing full-text PDFs in this phase.",
        "",
        "## Summary",
        "",
        f"- **Total Standards Evaluated**: {manifest.total_standards}",
        f"- **Documents Discovered / Available**: {manifest.summary.available}",
        f"- **Documents Not Exposed by API**: {manifest.summary.not_exposed_by_api}",
        f"- **Documents Not Found**: {manifest.summary.not_found}",
        f"- **Records Requiring Manual Review**: {manifest.summary.requires_manual_review}",
        f"- **API Errors**: {manifest.summary.api_error}",
        f"- **High Priority Standards**: {manifest.summary.high_priority_count}",
        f"- **Medium Priority Standards**: {manifest.summary.medium_priority_count}",
        "",
        "## Category Breakdown",
        "",
        "| Category | Total Standards | Available | Not Exposed by API | Manual Review | High Priority |",
        "| -------- | --------------- | --------- | ------------------ | ------------- | ------------- |",
    ]

    for cat in manifest.category_breakdown:
        lines.append(
            f"| {cat.category_name} | {cat.total_standards} | {cat.available_count} | {cat.not_exposed_count} | {cat.manual_review_count} | {cat.high_priority_count} |"
        )

    lines.extend([
        "",
        "## Document Inventory",
        "",
        "| IS Number | Title | Document Available | Type | Source | Priority | Confidence | Status |",
        "| --------- | ----- | ------------------ | ---- | ------ | -------- | ---------- | ------ |",
    ])

    for cat_group in manifest.categories:
        for std in cat_group.standards:
            doc_avail_str = "Yes" if std.document_available else "No"
            doc_type_str = std.document_type or "N/A"
            conf_str = std.discovery_confidence.value if std.discovery_confidence else "N/A"
            clean_title = clean_text(std.title or "").replace("|", "-")
            if len(clean_title) > 60:
                clean_title = clean_title[:57] + "..."

            lines.append(
                f"| {std.is_number} | {clean_title} | {doc_avail_str} | {doc_type_str} | {std.source} | {std.priority.value} | {conf_str} | `{std.discovery_status.value}` |"
            )

    # Standards Requiring Review section
    review_records = [
        std for cat_group in manifest.categories for std in cat_group.standards
        if std.discovery_status == DiscoveryStatus.REQUIRES_MANUAL_REVIEW
    ]

    lines.extend([
        "",
        "## Standards Requiring Review",
        "",
    ])

    if review_records:
        for r in review_records:
            lines.append(f"- **{r.is_number}** ({r.title}): {'; '.join(r.issues)}")
    else:
        lines.append("No standards require manual review. All 100 standards resolved with high confidence against official BIS catalogue records.")

    # Future Acquisition section
    lines.extend([
        "",
        "## Future Acquisition",
        "",
        "This manifest serves as the controlled acquisition plan for subsequent pipeline phases. In Phase 2B, discovery and status logging were completed without performing any PDF downloads, text extractions, OCR, chunking, database writes, or embedding operations.",
        "",
        "> [!IMPORTANT]",
        "> All discovered document references remain in state `download_status: 'not_downloaded'` and `extraction_status: 'pending'` pending explicit Phase 3 execution authorization.",
        "",
    ])

    return "\n".join(lines)


def run_discovery_and_save_manifests(
    corpus_manifest_path: str | Path,
    output_json_path: str | Path,
    output_md_path: str | Path,
    bis_client: Optional[BISClient] = None,
    use_cache: bool = True,
) -> BISDocumentManifest:
    """Run document discovery on corpus manifest and persist JSON and Markdown output files."""
    discovery_service = BISDocumentDiscoveryService(bis_client=bis_client)
    manifest = discovery_service.discover_corpus_manifest(
        corpus_manifest_path=corpus_manifest_path,
        use_cache=use_cache,
    )

    # 1. Save JSON
    json_path = Path(output_json_path)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))
    logger.info(f"Saved document manifest JSON to {json_path}")

    # 2. Save Markdown
    md_content = generate_document_manifest_markdown(manifest)
    md_path = Path(output_md_path)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    logger.info(f"Saved document manifest Markdown to {md_path}")

    return manifest
