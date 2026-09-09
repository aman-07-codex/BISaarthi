"""Offline BIS Document Text Extraction Service (Phase 4A).

Executes local page-by-page text extraction using pypdf, validates document identity
and extraction quality, and produces persistent structured JSON representations.
Operates 100% offline with zero network connectivity or LLM/embedding dependencies.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.core.logging import get_logger
from app.schemas.bis_document_extraction import (
    BISDocumentExtractionManifest,
    CategoryExtractionBreakdown,
    DocumentExtractionOutput,
    ExtractionCategoryGroup,
    ExtractionManifestRecord,
    ExtractionQuality,
    ExtractionStatus,
    ExtractionSummary,
    PageExtraction,
)
from app.services.bis_document_verifier import compute_file_sha256
from app.services.bis_extraction_validator import (
    assess_extraction_quality,
    validate_pdf_structure,
    verify_extracted_identity,
)
from app.services.bis_resolver import clean_text, parse_is_number

logger = get_logger("bis_document_extractor")


class BISDocumentExtractorService:
    """Service to execute local offline PDF extraction and maintain extraction manifests."""

    def __init__(
        self,
        verified_dir: Optional[str | Path] = None,
        extracted_dir: Optional[str | Path] = None,
    ):
        self.verified_dir = Path(verified_dir) if verified_dir else Path("data/bis_documents/verified")
        self.extracted_dir = Path(extracted_dir) if extracted_dir else Path("data/bis_documents/extracted")

        self.verified_dir.mkdir(parents=True, exist_ok=True)
        self.extracted_dir.mkdir(parents=True, exist_ok=True)

    def extract_pdf_pages(self, pdf_path: Path) -> Tuple[List[PageExtraction], int, Optional[str]]:
        """Extract text page-by-page using pypdf. Returns (pages, page_count, error)."""
        pages: List[PageExtraction] = []
        try:
            reader = PdfReader(str(pdf_path))
            page_count = len(reader.pages)

            for idx, page in enumerate(reader.pages, start=1):
                try:
                    page_text = page.extract_text() or ""
                except Exception as page_err:
                    logger.warning(f"Error extracting page {idx} from {pdf_path.name}: {page_err}")
                    page_text = ""

                # Check for images if accessible
                has_images = False
                try:
                    has_images = len(page.images) > 0
                except Exception:
                    pass

                char_count = len(page_text.strip())
                status = "success" if char_count > 0 else "empty"

                pages.append(
                    PageExtraction(
                        page_number=idx,
                        text=page_text,
                        character_count=char_count,
                        extraction_status=status,
                        has_images=has_images,
                    )
                )

            return pages, page_count, None

        except (PdfReadError, Exception) as exc:
            logger.error(f"Failed to read PDF {pdf_path.name}: {exc}")
            return [], 0, str(exc)

    def extract_single_document(
        self,
        pdf_path: Path,
        expected_standard: Dict[str, Any],
        now_iso: Optional[str] = None,
    ) -> DocumentExtractionOutput:
        """Extract and structurally validate an individual verified standard PDF."""
        timestamp = now_iso or datetime.now(timezone.utc).isoformat()
        is_num = expected_standard.get("is_number", "").strip()
        std_id = expected_standard.get("standard_id")
        enc_id = expected_standard.get("standard_enc_id")
        title = clean_text(expected_standard.get("title", ""))
        cat = expected_standard.get("category", "")

        issues: List[str] = []

        # 1. Structural and safety validation
        is_safe, safety_err = validate_pdf_structure(pdf_path)
        if not is_safe:
            issues.append(safety_err or "Safety check failed")
            return DocumentExtractionOutput(
                standard_id=std_id,
                standard_enc_id=enc_id,
                is_number=is_num,
                title=title,
                category=cat,
                source_pdf=str(pdf_path).replace("\\", "/"),
                file_name=pdf_path.name,
                file_size_bytes=pdf_path.stat().st_size if pdf_path.exists() else 0,
                sha256=compute_file_sha256(pdf_path) if pdf_path.exists() else "0" * 64,
                page_count=0,
                extracted_page_count=0,
                total_character_count=0,
                extraction_status=ExtractionStatus.EXTRACTION_FAILED,
                extraction_quality=ExtractionQuality.CORRUPTED,
                identity_verified=False,
                identity_confidence="none",
                detected_is_number=None,
                extracted_at=timestamp,
                issues=issues,
                pages=[],
            )

        file_size = pdf_path.stat().st_size
        sha256 = compute_file_sha256(pdf_path)

        # 2. Local page extraction
        pages, page_count, extract_err = self.extract_pdf_pages(pdf_path)
        if extract_err:
            issues.append(f"PDF extraction error: {extract_err}")
            return DocumentExtractionOutput(
                standard_id=std_id,
                standard_enc_id=enc_id,
                is_number=is_num,
                title=title,
                category=cat,
                source_pdf=str(pdf_path).replace("\\", "/"),
                file_name=pdf_path.name,
                file_size_bytes=file_size,
                sha256=sha256,
                page_count=page_count,
                extracted_page_count=0,
                total_character_count=0,
                extraction_status=ExtractionStatus.EXTRACTION_FAILED,
                extraction_quality=ExtractionQuality.CORRUPTED,
                identity_verified=False,
                identity_confidence="none",
                detected_is_number=None,
                extracted_at=timestamp,
                issues=issues,
                pages=[],
            )

        extracted_page_count = sum(1 for p in pages if p.character_count > 0)
        total_characters = sum(p.character_count for p in pages)

        # 3. Document identity validation (inspect first 3 pages)
        first_pages_text = "\n".join(p.text for p in pages[:3])
        id_verified, detected_is, id_conf, id_issues = verify_extracted_identity(
            first_pages_text=first_pages_text,
            expected_is_number=is_num,
            expected_title=title,
        )
        issues.extend(id_issues)

        # 4. Extraction quality assessment
        quality, quality_issues = assess_extraction_quality(
            page_count=page_count,
            pages=pages,
            identity_verified=id_verified,
        )
        issues.extend(quality_issues)

        # 5. Determine overall extraction status
        if quality == ExtractionQuality.CORRUPTED:
            extraction_status = ExtractionStatus.EXTRACTION_FAILED
        elif quality in (ExtractionQuality.REQUIRES_OCR, ExtractionQuality.POOR) and not id_verified:
            extraction_status = ExtractionStatus.MANUAL_REVIEW
        else:
            extraction_status = ExtractionStatus.EXTRACTED

        return DocumentExtractionOutput(
            standard_id=std_id,
            standard_enc_id=enc_id,
            is_number=is_num,
            title=title,
            category=cat,
            source_pdf=str(pdf_path).replace("\\", "/"),
            file_name=pdf_path.name,
            file_size_bytes=file_size,
            sha256=sha256,
            page_count=page_count,
            extracted_page_count=extracted_page_count,
            total_character_count=total_characters,
            extraction_status=extraction_status,
            extraction_quality=quality,
            identity_verified=id_verified,
            identity_confidence=id_conf,
            detected_is_number=detected_is,
            extracted_at=timestamp,
            issues=issues,
            pages=pages,
        )

    def build_extraction_manifest(
        self,
        corpus_manifest_path: str | Path,
    ) -> BISDocumentExtractionManifest:
        """Scan verified directory, extract any new verified PDFs, and build the extraction manifest."""
        path = Path(corpus_manifest_path)
        if not path.exists():
            raise FileNotFoundError(f"Corpus manifest not found at {path}")

        with open(path, "r", encoding="utf-8") as f:
            corpus_data = json.load(f)

        raw_categories = corpus_data.get("categories", [])
        if not raw_categories:
            raise ValueError("Corpus manifest contains no categories")

        # Map existing verified PDFs
        verified_files_by_is: Dict[str, Path] = {}
        if self.verified_dir.exists():
            for p in self.verified_dir.glob("*.pdf"):
                raw_stem = p.stem.replace("_", " ")
                identity = parse_is_number(raw_stem)
                verified_files_by_is[identity.normalized_key] = p

        total_standards = 0
        status_counts = {
            ExtractionStatus.EXTRACTED: 0,
            ExtractionStatus.NOT_EXTRACTED: 0,
            ExtractionStatus.EXTRACTION_FAILED: 0,
            ExtractionStatus.MANUAL_REVIEW: 0,
        }
        quality_counts = {
            ExtractionQuality.GOOD: 0,
            ExtractionQuality.POOR: 0,
            ExtractionQuality.REQUIRES_OCR: 0,
            ExtractionQuality.CORRUPTED: 0,
            ExtractionQuality.UNKNOWN: 0,
        }

        total_pages_all = 0
        total_chars_all = 0

        category_groups: List[ExtractionCategoryGroup] = []
        category_breakdowns: List[CategoryExtractionBreakdown] = []

        now_iso = datetime.now(timezone.utc).isoformat()

        for cat_data in raw_categories:
            cat_name = cat_data.get("name", "Uncategorized")
            stds = cat_data.get("standards", [])

            cat_records: List[ExtractionManifestRecord] = []
            cat_ext = 0
            cat_not_ext = 0
            cat_rev = 0

            for std in stds:
                total_standards += 1
                is_num = std.get("is_number", "").strip()
                std_id = std.get("standard_id")
                enc_id = std.get("standard_enc_id")
                title = clean_text(std.get("title", ""))

                std_identity = parse_is_number(is_num)
                verified_file = verified_files_by_is.get(std_identity.normalized_key)

                if verified_file and verified_file.exists():
                    # Execute or load extraction
                    canonical_json_name = f"{std_identity.normalized_key}.json"
                    json_out_path = self.extracted_dir / canonical_json_name

                    # Extract document
                    ext_output = self.extract_single_document(
                        pdf_path=verified_file,
                        expected_standard=std,
                        now_iso=now_iso,
                    )

                    # Save extracted structured JSON
                    with open(json_out_path, "w", encoding="utf-8") as f:
                        f.write(ext_output.model_dump_json(indent=2))

                    record = ExtractionManifestRecord(
                        standard_id=std_id,
                        standard_enc_id=enc_id,
                        is_number=is_num,
                        title=title,
                        category=cat_name,
                        source_pdf=str(verified_file).replace("\\", "/"),
                        extraction_status=ext_output.extraction_status,
                        extraction_quality=ext_output.extraction_quality,
                        page_count=ext_output.page_count,
                        extracted_page_count=ext_output.extracted_page_count,
                        total_character_count=ext_output.total_character_count,
                        sha256=ext_output.sha256,
                        output_path=str(json_out_path).replace("\\", "/"),
                        extracted_at=ext_output.extracted_at,
                        validation_issues=ext_output.issues,
                    )

                    status_counts[ext_output.extraction_status] += 1
                    quality_counts[ext_output.extraction_quality] += 1
                    total_pages_all += ext_output.page_count
                    total_chars_all += ext_output.total_character_count

                    if ext_output.extraction_status == ExtractionStatus.EXTRACTED:
                        cat_ext += 1
                    elif ext_output.extraction_status == ExtractionStatus.MANUAL_REVIEW:
                        cat_rev += 1
                else:
                    record = ExtractionManifestRecord(
                        standard_id=std_id,
                        standard_enc_id=enc_id,
                        is_number=is_num,
                        title=title,
                        category=cat_name,
                        source_pdf=None,
                        extraction_status=ExtractionStatus.NOT_EXTRACTED,
                        extraction_quality=None,
                        page_count=None,
                        extracted_page_count=None,
                        total_character_count=None,
                        sha256=None,
                        output_path=None,
                        extracted_at=None,
                        validation_issues=["No verified PDF present in data/bis_documents/verified/."],
                    )
                    status_counts[ExtractionStatus.NOT_EXTRACTED] += 1
                    cat_not_ext += 1

                cat_records.append(record)

            category_groups.append(
                ExtractionCategoryGroup(
                    name=cat_name,
                    standards=cat_records,
                )
            )
            category_breakdowns.append(
                CategoryExtractionBreakdown(
                    category_name=cat_name,
                    total_standards=len(stds),
                    extracted_count=cat_ext,
                    not_extracted_count=cat_not_ext,
                    manual_review_count=cat_rev,
                )
            )

        summary = ExtractionSummary(
            total_standards=total_standards,
            extracted_count=status_counts[ExtractionStatus.EXTRACTED],
            not_extracted_count=status_counts[ExtractionStatus.NOT_EXTRACTED],
            extraction_failed_count=status_counts[ExtractionStatus.EXTRACTION_FAILED],
            manual_review_count=status_counts[ExtractionStatus.MANUAL_REVIEW],
            good_quality_count=quality_counts[ExtractionQuality.GOOD],
            requires_ocr_count=quality_counts[ExtractionQuality.REQUIRES_OCR],
            total_pages_extracted=total_pages_all,
            total_characters_extracted=total_chars_all,
        )

        return BISDocumentExtractionManifest(
            version="1.0",
            purpose="BISaarthi MVP Official BIS Document Extraction Manifest",
            source_corpus="bis_mvp_corpus_manifest.json",
            total_standards=total_standards,
            extraction_manifest_timestamp=now_iso,
            summary=summary,
            category_breakdown=category_breakdowns,
            categories=category_groups,
        )


def generate_extraction_manifest_markdown(manifest: BISDocumentExtractionManifest) -> str:
    """Generate Markdown report for the document extraction manifest."""
    lines = [
        "# BISaarthi — Phase 4A: Official BIS Document Extraction Manifest",
        "",
        "## 1. Executive Summary",
        "",
        "This manifest tracks the local page-level text extraction, structural validation, and quality assessment status for the 100-standard BISaarthi MVP corpus (`backend/docs/bis_mvp_corpus_manifest.json`).",
        "",
        "> [!IMPORTANT]",
        "> **Strict Offline Execution & Boundaries**:",
        "> - Extraction runs **100% offline** on local verified PDFs without network requests or external API calls.",
        "> - Input is restricted strictly to `backend/data/bis_documents/verified/`.",
        "> - With 0 verified PDFs currently in production, the manifest accurately represents 100 standards in state `not_extracted` without fabricated data.",
        "",
        "## 2. Extraction Summary Metrics",
        "",
        f"- **Total Standards Tracked**: {manifest.total_standards}",
        f"- **Successfully Extracted**: {manifest.summary.extracted_count}",
        f"- **Pending Acquisition / Not Extracted**: {manifest.summary.not_extracted_count}",
        f"- **Extraction Failures**: {manifest.summary.extraction_failed_count}",
        f"- **Manual Review Required**: {manifest.summary.manual_review_count}",
        f"- **Good Quality Extractions**: {manifest.summary.good_quality_count}",
        f"- **Scanned / Requires OCR**: {manifest.summary.requires_ocr_count}",
        f"- **Total Pages Extracted**: {manifest.summary.total_pages_extracted}",
        f"- **Total Characters Extracted**: {manifest.summary.total_characters_extracted}",
        "",
        "## 3. Category Breakdown",
        "",
        "| Category | Total Standards | Extracted | Not Extracted | Manual Review |",
        "| -------- | --------------- | --------- | ------------- | ------------- |",
    ]

    for cat in manifest.category_breakdown:
        lines.append(
            f"| {cat.category_name} | {cat.total_standards} | {cat.extracted_count} | {cat.not_extracted_count} | {cat.manual_review_count} |"
        )

    lines.extend([
        "",
        "## 4. Document Extraction Inventory",
        "",
        "| IS Number | Title | Extraction Status | Quality | Pages | Characters | Output Path |",
        "| --------- | ----- | ----------------- | ------- | ----- | ---------- | ----------- |",
    ])

    for cat_group in manifest.categories:
        for std in cat_group.standards:
            clean_title = clean_text(std.title or "").replace("|", "-")
            if len(clean_title) > 45:
                clean_title = clean_title[:42] + "..."

            quality_str = std.extraction_quality.value if std.extraction_quality else "N/A"
            pages_str = str(std.page_count) if std.page_count is not None else "N/A"
            chars_str = f"{std.total_character_count:,}" if std.total_character_count is not None else "N/A"
            out_str = f"`{Path(std.output_path).name}`" if std.output_path else "N/A"

            lines.append(
                f"| {std.is_number} | {clean_title} | `{std.extraction_status.value}` | `{quality_str}` | {pages_str} | {chars_str} | {out_str} |"
            )

    lines.extend([
        "",
        "## 5. Next Pipeline Phase (Phase 4B)",
        "",
        "Extracted JSON documents will serve as deterministic inputs to **Phase 4B: Document Normalization & Semantic Section Partitioning** upon verified PDF acquisition.",
        "",
    ])

    return "\n".join(lines)


def run_extraction_manifest_and_save(
    corpus_manifest_path: str | Path,
    output_json_path: str | Path,
    output_md_path: str | Path,
    verified_dir: Optional[str | Path] = None,
    extracted_dir: Optional[str | Path] = None,
) -> BISDocumentExtractionManifest:
    """Run extraction on verified documents and persist JSON and Markdown manifest files."""
    service = BISDocumentExtractorService(
        verified_dir=verified_dir,
        extracted_dir=extracted_dir,
    )
    manifest = service.build_extraction_manifest(corpus_manifest_path=corpus_manifest_path)

    # 1. Save JSON
    json_path = Path(output_json_path)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))
    logger.info(f"Saved extraction manifest JSON to {json_path}")

    # 2. Save Markdown
    md_text = generate_extraction_manifest_markdown(manifest)
    md_path = Path(output_md_path)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_text)
    logger.info(f"Saved extraction manifest Markdown to {md_path}")

    return manifest
