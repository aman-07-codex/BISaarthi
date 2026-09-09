"""Manifest-Driven BIS Validation Layer.

Loads the authoritative BISaarthi MVP corpus manifest, enforces category and duplicate
integrity, executes exact standard resolution via BISClient & BISResolver,
and produces comprehensive validation reports in JSON and Markdown formats.
"""

import datetime
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from app.core.logging import get_logger
from app.schemas.bis_validation import (
    CategoryValidationCount,
    ManifestIntegrityResult,
    ManifestValidationSummary,
    StandardValidationResult,
    ValidationStatus,
)
from app.services.bis_client import BISClient
from app.services.bis_resolver import evaluate_manifest_standard

logger = get_logger("bis_validator")

APPROVED_CATEGORIES = [
    "Electrical Appliances & Accessories",
    "Construction, Cement & Concrete",
    "Food, Drinking Water & Food-Contact Products",
    "Steel, Metals & Industrial Materials",
    "Plastics, Packaging & Consumer Materials",
]


class BISManifestValidator:
    """Validates the curated MVP corpus manifest against official BIS microservice data."""

    def __init__(self, manifest_path: Optional[Path] = None, client: Optional[BISClient] = None):
        if manifest_path is None:
            backend_root = Path(__file__).resolve().parent.parent.parent
            self.manifest_path = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
        else:
            self.manifest_path = Path(manifest_path)

        self.client = client or BISClient()

    def load_manifest(self) -> Dict[str, Any]:
        """Load manifest JSON file."""
        if not self.manifest_path.exists():
            raise FileNotFoundError(f"Corpus manifest file not found at: {self.manifest_path}")
        with open(self.manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def validate_manifest_integrity(self, manifest_data: Optional[Dict[str, Any]] = None) -> ManifestIntegrityResult:
        """Verify the integrity of the manifest itself (categories, uniqueness, required fields)."""
        data = manifest_data or self.load_manifest()

        categories = data.get("categories", [])
        approved_set = set(APPROVED_CATEGORIES)
        found_categories: List[str] = []
        unexpected_categories: List[str] = []

        seen_is_numbers: Set[str] = set()
        duplicate_is_numbers: List[str] = []

        seen_ids: Set[int] = set()
        duplicate_ids: List[int] = []

        seen_enc_ids: Set[str] = set()
        duplicate_enc_ids: List[str] = []

        missing_required: List[str] = []
        total_standards = 0

        for cat in categories:
            cat_name = cat.get("name", "").strip()
            if cat_name in approved_set:
                found_categories.append(cat_name)
            else:
                unexpected_categories.append(cat_name)

            for std in cat.get("standards", []):
                total_standards += 1
                is_num = std.get("is_number", "").strip()
                std_id = std.get("standard_id")
                std_enc_id = std.get("standard_enc_id", "").strip()

                # Check required fields
                if not is_num:
                    missing_required.append(f"Standard in category '{cat_name}' missing is_number")
                if std_id is None:
                    missing_required.append(f"Standard {is_num} missing standard_id")
                if not std_enc_id:
                    missing_required.append(f"Standard {is_num} missing standard_enc_id")
                if not std.get("title"):
                    missing_required.append(f"Standard {is_num} missing title")

                # Duplicate checks
                if is_num:
                    norm_num = is_num.lower()
                    if norm_num in seen_is_numbers:
                        duplicate_is_numbers.append(is_num)
                    seen_is_numbers.add(norm_num)

                if std_id is not None:
                    if std_id in seen_ids:
                        duplicate_ids.append(std_id)
                    seen_ids.add(std_id)

                if std_enc_id:
                    if std_enc_id in seen_enc_ids:
                        duplicate_enc_ids.append(std_enc_id)
                    seen_enc_ids.add(std_enc_id)

        is_valid = (
            len(unexpected_categories) == 0
            and len(duplicate_is_numbers) == 0
            and len(duplicate_ids) == 0
            and len(duplicate_enc_ids) == 0
            and len(missing_required) == 0
            and len(found_categories) == 5
        )

        return ManifestIntegrityResult(
            is_valid=is_valid,
            total_standards=total_standards,
            approved_categories_present=found_categories,
            unexpected_categories=unexpected_categories,
            duplicate_is_numbers=duplicate_is_numbers,
            duplicate_standard_ids=duplicate_ids,
            duplicate_standard_enc_ids=duplicate_enc_ids,
            missing_required_fields=missing_required,
        )

    def validate_all(self, use_cache: bool = True) -> ManifestValidationSummary:
        """Run full resolution and validation across the entire manifest allowlist."""
        manifest_data = self.load_manifest()
        manifest_version = str(manifest_data.get("version", "1.0"))

        integrity = self.validate_manifest_integrity(manifest_data)
        warnings: List[str] = []
        errors: List[str] = []

        if not integrity.is_valid:
            if integrity.unexpected_categories:
                errors.append(f"Unexpected categories found in manifest: {integrity.unexpected_categories}")
            if integrity.duplicate_is_numbers:
                errors.append(f"Duplicate IS numbers found in manifest: {integrity.duplicate_is_numbers}")
            if integrity.duplicate_standard_ids:
                errors.append(f"Duplicate standard IDs found in manifest: {integrity.duplicate_standard_ids}")
            if integrity.duplicate_standard_enc_ids:
                errors.append(f"Duplicate standardEncIds found in manifest: {len(integrity.duplicate_standard_enc_ids)}")
            if integrity.missing_required_fields:
                errors.append(f"Missing required fields: {integrity.missing_required_fields[:5]}")

        results: List[StandardValidationResult] = []
        category_summaries: List[CategoryValidationCount] = []

        resolved_count = 0
        unresolved_count = 0
        exact_match_count = 0
        metadata_changed_count = 0
        requires_review_count = 0

        categories = manifest_data.get("categories", [])
        for cat in categories:
            cat_name = cat.get("name", "")
            cat_standards = cat.get("standards", [])

            cat_resolved = 0
            cat_exact = 0
            cat_meta_changed = 0
            cat_review = 0
            cat_unresolved = 0

            for std_record in cat_standards:
                is_num = std_record.get("is_number", "")
                std_id = std_record.get("standard_id")

                logger.info(f"Validating {is_num} (ID: {std_id})...")

                # Fetch candidate records via BIS client
                candidates = self.client.resolve_standard_candidates(
                    is_number=is_num,
                    standard_id=std_id,
                    use_cache=use_cache,
                )

                # Evaluate record
                val_result = evaluate_manifest_standard(
                    manifest_record=std_record,
                    bis_records=candidates,
                    category_name=cat_name,
                )

                results.append(val_result)

                if val_result.resolved:
                    resolved_count += 1
                    cat_resolved += 1
                else:
                    unresolved_count += 1
                    cat_unresolved += 1

                if val_result.validation_status == ValidationStatus.EXACT_MATCH:
                    exact_match_count += 1
                    cat_exact += 1
                elif val_result.validation_status == ValidationStatus.METADATA_CHANGED:
                    metadata_changed_count += 1
                    cat_meta_changed += 1
                elif val_result.validation_status in (ValidationStatus.REQUIRES_MANUAL_REVIEW, ValidationStatus.UNRESOLVED):
                    requires_review_count += 1
                    cat_review += 1

            category_summaries.append(
                CategoryValidationCount(
                    category_name=cat_name,
                    manifest_count=len(cat_standards),
                    resolved_count=cat_resolved,
                    exact_match_count=cat_exact,
                    metadata_changed_count=cat_meta_changed,
                    requires_review_count=cat_review,
                    unresolved_count=cat_unresolved,
                )
            )

        summary = ManifestValidationSummary(
            validation_timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            manifest_version=manifest_version,
            manifest_file=self.manifest_path.name,
            total_manifest_standards=len(results),
            resolved_count=resolved_count,
            unresolved_count=unresolved_count,
            exact_match_count=exact_match_count,
            metadata_changed_count=metadata_changed_count,
            requires_review_count=requires_review_count,
            warnings=warnings,
            errors=errors,
            category_summary=category_summaries,
            results=results,
        )
        return summary

    def generate_json_report(self, summary: ManifestValidationSummary, output_path: Path) -> Path:
        """Write structured validation summary to JSON file."""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(summary.model_dump_json(indent=2))
        logger.info(f"Wrote JSON validation report to {output_path}")
        return output_path

    def generate_markdown_report(self, summary: ManifestValidationSummary, output_path: Path) -> Path:
        """Write human-readable validation report to Markdown file."""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        lines: List[str] = [
            "# BISaarthi MVP Corpus Validation Report",
            "",
            f"**Validation Timestamp**: `{summary.validation_timestamp}`  ",
            f"**Source Manifest**: `{summary.manifest_file}` (v{summary.manifest_version})  ",
            f"**Total Standards Processed**: `{summary.total_manifest_standards}`  ",
            "",
            "---",
            "",
            "## 1. Executive Summary",
            "",
            "| Metric | Count | Percentage |",
            "| :--- | :--- | :--- |",
            f"| **Total Manifest Standards** | `{summary.total_manifest_standards}` | 100.0% |",
            f"| **Successfully Resolved** | `{summary.resolved_count}` | {summary.resolved_count / (summary.total_manifest_standards or 1) * 100:.1f}% |",
            f"| **Exact Matches** | `{summary.exact_match_count}` | {summary.exact_match_count / (summary.total_manifest_standards or 1) * 100:.1f}% |",
            f"| **Metadata Changed** | `{summary.metadata_changed_count}` | {summary.metadata_changed_count / (summary.total_manifest_standards or 1) * 100:.1f}% |",
            f"| **Requires Manual Review** | `{summary.requires_review_count}` | {summary.requires_review_count / (summary.total_manifest_standards or 1) * 100:.1f}% |",
            f"| **Unresolved Standards** | `{summary.unresolved_count}` | {summary.unresolved_count / (summary.total_manifest_standards or 1) * 100:.1f}% |",
            "",
            "---",
            "",
            "## 2. Category Breakdown",
            "",
            "| Category Name | Manifest Target | Resolved | Exact Matches | Metadata Changed | Requires Review |",
            "| :--- | :--- | :--- | :--- | :--- | :--- |",
        ]

        for cat in summary.category_summary:
            lines.append(
                f"| **{cat.category_name}** | {cat.manifest_count} | {cat.resolved_count} | {cat.exact_match_count} | {cat.metadata_changed_count} | {cat.requires_review_count} |"
            )

        lines.extend([
            "",
            "---",
            "",
            "## 3. Standards Requiring Review",
            "",
        ])

        review_standards = [
            r for r in summary.results
            if r.validation_status in (ValidationStatus.REQUIRES_MANUAL_REVIEW, ValidationStatus.UNRESOLVED)
            or any("Status alert" in iss or "mismatch" in iss for iss in r.issues)
        ]

        if not review_standards:
            lines.append("No standards currently require manual review. All standards resolved with verified identities.")
        else:
            lines.append("| IS Number | Category | Status / Alert | Issues Identified |")
            lines.append("| :--- | :--- | :--- | :--- |")
            for r in review_standards:
                issue_bullets = "<br>".join(r.issues) if r.issues else "N/A"
                lines.append(
                    f"| `{r.is_number}` | {r.manifest_category or 'N/A'} | `{r.validation_status.value}` | {issue_bullets} |"
                )

        lines.extend([
            "",
            "---",
            "",
            "## 4. Successfully Validated Standards",
            "",
            "| IS Number | BIS Standard ID | Status | Department | Sectional Committee | Title |",
            "| :--- | :--- | :--- | :--- | :--- | :--- |",
        ])

        for r in summary.results:
            if r.resolved:
                clean_title = (r.title or "").replace("|", "-")
                clean_dept = (r.department or "").replace("|", "-")
                clean_comm = (r.committee or "").replace("|", "-")
                lines.append(
                    f"| `{r.is_number}` | `{r.bis_standard_id or 'N/A'}` | `{r.validation_status.value}` | {clean_dept} | {clean_comm} | {clean_title} |"
                )

        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")

        logger.info(f"Wrote Markdown validation report to {output_path}")
        return output_path
