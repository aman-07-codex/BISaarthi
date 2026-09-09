"""Official BIS Document Acquisition Manifest Service (Phase 3B).

Builds, synchronizes, and maintains the authoritative acquisition manifest
for the 100-standard corpus based on verified local staging and official provenance.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.logging import get_logger
from app.schemas.bis_document_acquisition import (
    AcquisitionCategoryGroup,
    AcquisitionStatus,
    AcquisitionSummary,
    BISDocumentAcquisitionManifest,
    BISDocumentAcquisitionRecord,
    CategoryAcquisitionBreakdown,
    IdentityConfidence,
    VerificationStatus,
)
from app.services.bis_document_verifier import compute_file_sha256
from app.services.bis_resolver import clean_text, parse_is_number

logger = get_logger("bis_document_acquisition")


class BISDocumentAcquisitionService:
    """Service to generate and synchronize the document acquisition manifest."""

    def __init__(self, verified_dir: Optional[str | Path] = None):
        self.verified_dir = Path(verified_dir) if verified_dir else Path("data/bis_documents/verified")

    def build_acquisition_manifest(
        self,
        corpus_manifest_path: str | Path,
    ) -> BISDocumentAcquisitionManifest:
        """Construct the acquisition manifest strictly covering the 100 corpus standards."""
        path = Path(corpus_manifest_path)
        if not path.exists():
            raise FileNotFoundError(f"Corpus manifest not found at {path}")

        with open(path, "r", encoding="utf-8") as f:
            corpus_data = json.load(f)

        raw_categories = corpus_data.get("categories", [])
        if not raw_categories:
            raise ValueError("Corpus manifest contains no categories")

        # Scan verified directory for existing canonical files
        verified_files_by_is: Dict[str, Path] = {}
        if self.verified_dir.exists():
            for p in self.verified_dir.glob("*.pdf"):
                raw_stem = p.stem.replace("_", " ")
                identity = parse_is_number(raw_stem)
                verified_files_by_is[identity.normalized_key] = p

        total_standards = 0
        status_counts = {
            VerificationStatus.VERIFIED: 0,
            VerificationStatus.REJECTED: 0,
            VerificationStatus.PENDING_VERIFICATION: 0,
            VerificationStatus.NOT_ACQUIRED: 0,
            VerificationStatus.MANUAL_REVIEW: 0,
        }

        category_groups: List[AcquisitionCategoryGroup] = []
        category_breakdowns: List[CategoryAcquisitionBreakdown] = []

        now_iso = datetime.now(timezone.utc).isoformat()

        for cat_data in raw_categories:
            cat_name = cat_data.get("name", "Uncategorized")
            stds = cat_data.get("standards", [])

            cat_records: List[BISDocumentAcquisitionRecord] = []
            cat_ver = 0
            cat_not_acq = 0
            cat_rej = 0

            for std in stds:
                total_standards += 1
                is_num = std.get("is_number", "").strip()
                std_id = std.get("standard_id")
                enc_id = std.get("standard_enc_id")
                title = clean_text(std.get("title", ""))

                std_identity = parse_is_number(is_num)
                verified_file = verified_files_by_is.get(std_identity.normalized_key)

                if verified_file and verified_file.exists():
                    f_size = verified_file.stat().st_size
                    f_sha = compute_file_sha256(verified_file)
                    record = BISDocumentAcquisitionRecord(
                        standard_id=std_id,
                        standard_enc_id=enc_id,
                        is_number=is_num,
                        title=title,
                        category=cat_name,
                        acquisition_status=AcquisitionStatus.ACQUIRED,
                        acquisition_method="official_portal_manual",
                        official_source="BIS",
                        local_path=str(verified_file).replace("\\", "/"),
                        file_name=verified_file.name,
                        file_size_bytes=f_size,
                        sha256=f_sha,
                        mime_type="application/pdf",
                        acquired_at=now_iso,
                        verification_status=VerificationStatus.VERIFIED,
                        verification_reasons=["Cryptographically verified and matched to corpus standard."],
                        identity_match_confidence=IdentityConfidence.HIGH,
                        provenance="Official BIS Portal / Manakonline Repository",
                        redistribution_restricted=True,
                        license_note="Restricted official Bureau of Indian Standards publication; internal RAG analysis only.",
                    )
                    cat_ver += 1
                    status_counts[VerificationStatus.VERIFIED] += 1
                else:
                    record = BISDocumentAcquisitionRecord(
                        standard_id=std_id,
                        standard_enc_id=enc_id,
                        is_number=is_num,
                        title=title,
                        category=cat_name,
                        acquisition_status=AcquisitionStatus.NOT_ACQUIRED,
                        acquisition_method="official_portal_manual",
                        official_source="BIS",
                        local_path=None,
                        file_name=None,
                        file_size_bytes=None,
                        sha256=None,
                        mime_type="application/pdf",
                        acquired_at=None,
                        verification_status=VerificationStatus.NOT_ACQUIRED,
                        verification_reasons=["Awaiting legitimate manual portal acquisition & staging."],
                        identity_match_confidence=IdentityConfidence.NONE,
                        provenance="Official BIS Portal / Manakonline Repository",
                        redistribution_restricted=True,
                        license_note="Restricted official Bureau of Indian Standards publication; internal RAG analysis only.",
                    )
                    cat_not_acq += 1
                    status_counts[VerificationStatus.NOT_ACQUIRED] += 1

                cat_records.append(record)

            category_groups.append(
                AcquisitionCategoryGroup(
                    name=cat_name,
                    standards=cat_records,
                )
            )
            category_breakdowns.append(
                CategoryAcquisitionBreakdown(
                    category_name=cat_name,
                    total_standards=len(stds),
                    verified_count=cat_ver,
                    not_acquired_count=cat_not_acq,
                    rejected_count=cat_rej,
                )
            )

        summary = AcquisitionSummary(
            total_standards=total_standards,
            verified_count=status_counts[VerificationStatus.VERIFIED],
            quarantined_count=0,
            not_acquired_count=status_counts[VerificationStatus.NOT_ACQUIRED],
            rejected_count=status_counts[VerificationStatus.REJECTED],
            manual_review_count=status_counts[VerificationStatus.MANUAL_REVIEW],
            redistribution_restricted_count=total_standards,
        )

        return BISDocumentAcquisitionManifest(
            version="1.0",
            purpose="BISaarthi MVP Official BIS Document Acquisition Manifest",
            source_corpus="bis_mvp_corpus_manifest.json",
            total_standards=total_standards,
            acquisition_timestamp=now_iso,
            summary=summary,
            category_breakdown=category_breakdowns,
            categories=category_groups,
        )


def generate_acquisition_manifest_markdown(manifest: BISDocumentAcquisitionManifest) -> str:
    """Generate Markdown report for the document acquisition manifest."""
    lines = [
        "# BISaarthi — Phase 3B: Official BIS Document Acquisition Manifest",
        "",
        "## 1. Executive Summary",
        "",
        "This document manifest tracks the verified acquisition state and cryptographic integrity of official Bureau of Indian Standards (BIS) publications strictly for the 100-standard MVP corpus (`backend/docs/bis_mvp_corpus_manifest.json`).",
        "",
        "> [!IMPORTANT]",
        "> **Strict Licensing & Intellectual Property Boundaries**:",
        "> - All acquired documents are tagged `redistribution_restricted = True`.",
        "> - Documents serve strictly as internal sources for local text extraction and search embeddings in subsequent phases.",
        "> - BISaarthi does **not** serve or expose raw full-text PDF binaries as public file downloads.",
        "",
        "## 2. Acquisition Summary Metrics",
        "",
        f"- **Total Standards Tracked**: {manifest.total_standards}",
        f"- **Verified & Staged in Corpus**: {manifest.summary.verified_count}",
        f"- **Pending / Not Yet Acquired**: {manifest.summary.not_acquired_count}",
        f"- **Quarantined Files**: {manifest.summary.quarantined_count}",
        f"- **Rejected Files**: {manifest.summary.rejected_count}",
        f"- **Manual Review Records**: {manifest.summary.manual_review_count}",
        f"- **Redistribution Restricted Records**: {manifest.summary.redistribution_restricted_count} / {manifest.total_standards}",
        "",
        "## 3. Category Breakdown",
        "",
        "| Category | Total Standards | Verified Acquired | Pending Acquisition | Rejected |",
        "| -------- | --------------- | ----------------- | ------------------- | -------- |",
    ]

    for cat in manifest.category_breakdown:
        lines.append(
            f"| {cat.category_name} | {cat.total_standards} | {cat.verified_count} | {cat.not_acquired_count} | {cat.rejected_count} |"
        )

    lines.extend([
        "",
        "## 4. Document Acquisition Inventory",
        "",
        "| IS Number | Title | Status | Acquisition Channel | Verification | SHA-256 | Restricted |",
        "| --------- | ----- | ------ | ------------------- | ------------ | ------- | ---------- |",
    ])

    for cat_group in manifest.categories:
        for std in cat_group.standards:
            clean_title = clean_text(std.title or "").replace("|", "-")
            if len(clean_title) > 50:
                clean_title = clean_title[:47] + "..."
            sha_display = f"`{std.sha256[:8]}...`" if std.sha256 else "N/A"
            restricted_display = "Yes (Internal Only)" if std.redistribution_restricted else "No"

            lines.append(
                f"| {std.is_number} | {clean_title} | `{std.acquisition_status.value}` | `{std.acquisition_method}` | `{std.verification_status.value}` | {sha_display} | {restricted_display} |"
            )

    lines.extend([
        "",
        "## 5. Next Pipeline Phase (Phase 4)",
        "",
        "Documents verified and recorded in this manifest will serve as inputs to **Phase 4: Document Text Extraction & Parsing** once authorized.",
        "",
    ])

    return "\n".join(lines)


def run_acquisition_manifest_and_save(
    corpus_manifest_path: str | Path,
    output_json_path: str | Path,
    output_md_path: str | Path,
    verified_dir: Optional[str | Path] = None,
) -> BISDocumentAcquisitionManifest:
    """Build acquisition manifest and persist JSON and Markdown report artifacts."""
    service = BISDocumentAcquisitionService(verified_dir=verified_dir)
    manifest = service.build_acquisition_manifest(corpus_manifest_path=corpus_manifest_path)

    # 1. Save JSON
    json_path = Path(output_json_path)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))
    logger.info(f"Saved acquisition manifest JSON to {json_path}")

    # 2. Save Markdown
    md_text = generate_acquisition_manifest_markdown(manifest)
    md_path = Path(output_md_path)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_text)
    logger.info(f"Saved acquisition manifest Markdown to {md_path}")

    return manifest
