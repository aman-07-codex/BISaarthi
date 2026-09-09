"""Document text normalization service for Phase 4B: Corpus-Ready Representation."""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Set, Tuple

from app.schemas.bis_document_normalization import (
    BISDocumentNormalizationManifest,
    CategoryNormalizationBreakdown,
    NormalizationCategoryGroup,
    NormalizationManifestRecord,
    NormalizationQuality,
    NormalizationStatus,
    NormalizationSummary,
    NormalizedDocumentOutput,
    NormalizedPage,
)
from app.services.bis_normalization_validator import (
    detect_repeated_headers_footers,
    validate_extraction_input,
    validate_normalization_conservation,
)

# Standard heading and clause regex patterns in Indian Standards
HEADING_PATTERNS = [
    re.compile(r"^(?:ANNEX|APPENDIX|TABLE|FIGURE|FIG\.)\s+[A-Z0-9\.\-]+(?:\s+.*)?$", re.IGNORECASE),
    re.compile(r"^(?:SECTION|PART|CLAUSE)\s+[0-9]+(?:\s+.*)?$", re.IGNORECASE),
    re.compile(r"^(\d+(\.\d+)*)\s+([A-Z0-9][A-Za-z0-9\s,\-\(\)\/\.]{2,})$"),
]

# Bullet and list markers
LIST_MARKER_REGEX = re.compile(
    r"^(?:[\-\*•\u2022\u25E6\u2043\u2219]|(?:\([a-zA-Z0-9]+\)|[a-zA-Z0-9]+\))\s+)"
)


def normalize_unicode_and_whitespace(text: str) -> str:
    """Cleans Unicode whitespace, control characters, and line endings.
    
    Preserves meaningful technical symbols, degrees (°C), micro (µ), etc.
    """
    if not text:
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Replace non-breaking space and zero-width spaces
    text = text.replace("\u00A0", " ")
    text = text.replace("\u200B", "")
    text = text.replace("\uFEFF", "")

    # Replace other uncommon Unicode whitespace with regular space
    unicode_spaces = ["\u2000", "\u2001", "\u2002", "\u2003", "\u2004", "\u2005", "\u2006", "\u2007", "\u2008", "\u2009", "\u200A", "\u202F", "\u205F", "\u3000"]
    for u_space in unicode_spaces:
        text = text.replace(u_space, " ")

    # Normalize typographical smart quotes/dashes to clean standard ASCII/Unicode
    text = text.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    text = text.replace("—", " - ").replace("–", " - ")

    # Remove non-printable control characters (retain \t and \n)
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)

    # Collapse multiple horizontal spaces on each line
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]
    text = "\n".join(lines)

    return text



def cleanup_hyphenation(text: str) -> str:
    """Rejoins words split by hyphens at line breaks.
    
    Example: 'require-\\n ment' -> 'requirement'
    """
    if not text:
        return ""

    # Match word ending with hyphen, newline, and word continuation
    hyphen_pattern = re.compile(r"([a-zA-Z]{2,})-\n\s*([a-zA-Z]{2,})")
    return hyphen_pattern.sub(r"\1\2", text)


def is_heading_or_clause(line: str) -> bool:
    """Checks whether a single line matches heading or numbered clause patterns."""
    s_line = line.strip()
    if not s_line:
        return False
    for pattern in HEADING_PATTERNS:
        if pattern.match(s_line):
            return True
    return False


def is_list_item(line: str) -> bool:
    """Checks if a line begins with a list or bullet indicator."""
    return bool(LIST_MARKER_REGEX.match(line.strip()))


def cleanup_soft_linebreaks(text: str) -> str:
    """Conservatively joins soft line breaks while preserving paragraphs, headings, and lists."""
    if not text:
        return ""

    paragraphs = text.split("\n\n")
    cleaned_paragraphs: List[str] = []

    for para in paragraphs:
        lines = [line.strip() for line in para.split("\n") if line.strip()]
        if not lines:
            continue

        merged_lines: List[str] = []
        i = 0
        while i < len(lines):
            curr_line = lines[i]

            # If current line is a heading or list item, keep it distinct
            if is_heading_or_clause(curr_line) or is_list_item(curr_line):
                merged_lines.append(curr_line)
                i += 1
                continue

            # Lookahead to see if next line should be joined
            while i + 1 < len(lines):
                next_line = lines[i + 1]

                # Do not join if next line is a heading or list item
                if is_heading_or_clause(next_line) or is_list_item(next_line):
                    break

                # Do not join if current line ends with sentence punctuation and next starts with uppercase
                if curr_line.endswith((".", ":", ";", "?", "!")) and next_line[0].isupper():
                    break

                # Join current and next line with a single space
                curr_line = f"{curr_line} {next_line}"
                i += 1

            merged_lines.append(curr_line)
            i += 1

        cleaned_paragraphs.append("\n".join(merged_lines))

    return "\n\n".join(cleaned_paragraphs)


def detect_headings_in_text(text: str) -> List[str]:
    """Detects and extracts section headings and clause numbers from text."""
    headings: List[str] = []
    seen: Set[str] = set()

    for line in text.splitlines():
        line_clean = " ".join(line.split())
        if is_heading_or_clause(line_clean) and line_clean not in seen:
            headings.append(line_clean)
            seen.add(line_clean)

    return headings


def normalize_page_text(
    raw_text: str,
    repeated_headers: Set[str],
    repeated_footers: Set[str]
) -> Tuple[str, List[str], List[str]]:
    """Normalizes an individual page's text and strips confirmed repetitive headers/footers.
    
    Returns:
        Tuple of (normalized_text, detected_headings, removed_header_footer_lines)
    """
    if not raw_text or not raw_text.strip():
        return "", [], []

    # 1. Unicode cleanup
    text = normalize_unicode_and_whitespace(raw_text)

    # 2. Filter repeated headers and footers
    lines = text.splitlines()
    filtered_lines: List[str] = []
    removed_lines: List[str] = []

    for line in lines:
        line_clean = " ".join(line.split())
        if line_clean in repeated_headers or line_clean in repeated_footers:
            removed_lines.append(line_clean)
        else:
            filtered_lines.append(line)

    text = "\n".join(filtered_lines)

    # 3. Hyphenation cleanup
    text = cleanup_hyphenation(text)

    # 4. Linebreak and paragraph cleanup
    text = cleanup_soft_linebreaks(text)

    # 5. Heading detection
    headings = detect_headings_in_text(text)

    # 6. Final whitespace tidy
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    return text, headings, removed_lines


def normalize_extracted_document(
    extracted_data: Dict[str, Any],
    output_dir: Optional[Path] = None
) -> NormalizedDocumentOutput:
    """Transforms a Phase 4A extracted document JSON into a corpus-ready normalized document.
    
    Args:
        extracted_data: Phase 4A extraction output dictionary.
        output_dir: Optional directory to save the resulting JSON file.
        
    Returns:
        NormalizedDocumentOutput object.
    """
    # 1. Input validation
    is_valid, validation_issues = validate_extraction_input(extracted_data)
    if not is_valid:
        raise ValueError(f"Invalid extraction input: {'; '.join(validation_issues)}")

    raw_pages = extracted_data.get("pages", [])
    
    # 2. Statistical repetitive header/footer detection
    rep_headers, rep_footers = detect_repeated_headers_footers(raw_pages)

    normalized_pages: List[NormalizedPage] = []
    all_headings: List[str] = []
    seen_headings: Set[str] = set()
    total_source_chars = 0
    total_norm_chars = 0

    rules_applied = [
        "unicode_whitespace_normalization",
        "control_character_cleanup",
        "hyphenated_linebreak_rejoining",
        "soft_wrap_paragraph_normalization",
    ]
    if rep_headers or rep_footers:
        rules_applied.append("repeated_header_footer_filtering")

    # 3. Page-by-page processing
    for p in raw_pages:
        page_num = p.get("page_number", 1)
        source_text = p.get("text", "") or p.get("source_text", "")
        source_chars = len(source_text)
        total_source_chars += source_chars

        norm_text, page_headings, removed_hf = normalize_page_text(
            source_text, rep_headers, rep_footers
        )
        norm_chars = len(norm_text)
        total_norm_chars += norm_chars

        for h in page_headings:
            if h not in seen_headings:
                all_headings.append(h)
                seen_headings.add(h)

        retention = (norm_chars / source_chars) if source_chars > 0 else 1.0

        normalized_pages.append(
            NormalizedPage(
                page_number=page_num,
                source_text=source_text,
                normalized_text=norm_text,
                source_character_count=source_chars,
                normalized_character_count=norm_chars,
                character_retention_ratio=round(retention, 4),
                detected_headings=page_headings,
                removed_header_footer_lines=removed_hf,
                status="success" if norm_text else "empty",
            )
        )

    overall_retention = (
        (total_norm_chars / total_source_chars) if total_source_chars > 0 else 1.0
    )

    doc_dict_for_validation = {
        "pages": [p.model_dump() for p in normalized_pages],
        "normalized_total_character_count": total_norm_chars,
    }

    # 4. Conservation and quality validation
    quality, quality_issues = validate_normalization_conservation(
        extracted_data, doc_dict_for_validation
    )

    output = NormalizedDocumentOutput(
        standard_id=extracted_data.get("standard_id"),
        standard_enc_id=extracted_data.get("standard_enc_id"),
        is_number=extracted_data["is_number"],
        title=extracted_data.get("title"),
        category=extracted_data.get("category", "General"),
        source_extraction_file=extracted_data.get("output_path", ""),
        source_pdf=extracted_data.get("source_pdf", ""),
        source_pdf_sha256=extracted_data.get("sha256", ""),
        source_total_character_count=total_source_chars,
        normalized_total_character_count=total_norm_chars,
        character_retention_ratio=round(overall_retention, 4),
        page_count=len(raw_pages),
        normalized_page_count=len([p for p in normalized_pages if p.normalized_text]),
        normalization_status=NormalizationStatus.NORMALIZED,
        normalization_quality=quality,
        detected_headings_count=len(all_headings),
        detected_headings=all_headings[:50],  # Keep first 50 top headings in summary
        normalization_rules_applied=rules_applied,
        issues=validation_issues + quality_issues,
        normalized_at=datetime.now(timezone.utc).isoformat(),
        normalization_version="1.0.0",
        pages=normalized_pages,
    )

    # 5. Save if output directory specified
    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        safe_name = re.sub(r"[^\w\-]", "_", extracted_data["is_number"])
        out_file = output_dir / f"{safe_name}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(output.model_dump_json(indent=2))

    return output


def run_normalization_manifest_and_save(
    manifest_path: Path,
    extracted_dir: Path,
    normalized_dir: Path,
    docs_manifest_path: Path,
    docs_md_path: Path,
    force: bool = False,
    single_is: Optional[str] = None
) -> BISDocumentNormalizationManifest:
    """Processes extracted documents according to the MVP manifest and writes normalization manifests.
    
    Args:
        manifest_path: Path to authoritative 100-standard corpus manifest.
        extracted_dir: Directory containing Phase 4A extraction JSONs.
        normalized_dir: Directory where Phase 4B normalized JSONs are saved.
        docs_manifest_path: Output path for JSON manifest.
        docs_md_path: Output path for Markdown manifest.
        force: Whether to re-normalize already normalized documents.
        single_is: Optional specific IS number to process.
    """
    with open(manifest_path, "r", encoding="utf-8") as f:
        corpus_data = json.load(f)

    standards_list: List[Dict[str, Any]] = []
    if "categories" in corpus_data:
        for cat in corpus_data["categories"]:
            for std in cat.get("standards", []):
                std_copy = dict(std)
                std_copy["category"] = cat.get("name", "General")
                standards_list.append(std_copy)
    elif "standards" in corpus_data:
        standards_list = corpus_data["standards"]

    normalized_dir.mkdir(parents=True, exist_ok=True)

    records: List[NormalizationManifestRecord] = []
    category_map: Dict[str, List[NormalizationManifestRecord]] = {}

    for std in standards_list:
        is_num = std["is_number"]
        if single_is and is_num.strip().lower() != single_is.strip().lower():
            continue

        cat_name = std.get("category", "General")
        if cat_name not in category_map:
            category_map[cat_name] = []

        safe_name = re.sub(r"[^\w\-]", "_", is_num)
        extracted_file = extracted_dir / f"{safe_name}.json"
        normalized_file = normalized_dir / f"{safe_name}.json"

        if extracted_file.exists():
            try:
                with open(extracted_file, "r", encoding="utf-8") as ef:
                    ext_data = json.load(ef)

                if normalized_file.exists() and not force:
                    with open(normalized_file, "r", encoding="utf-8") as nf:
                        norm_doc = json.load(nf)
                    rec = NormalizationManifestRecord(
                        standard_id=std.get("standard_id"),
                        standard_enc_id=std.get("standard_enc_id"),
                        is_number=is_num,
                        title=std.get("title"),
                        category=cat_name,
                        source_pdf=ext_data.get("source_pdf"),
                        source_extraction_file=str(extracted_file),
                        normalization_status=NormalizationStatus.NORMALIZED,
                        normalization_quality=NormalizationQuality(norm_doc.get("normalization_quality", "good")),
                        page_count=norm_doc.get("page_count"),
                        source_character_count=norm_doc.get("source_total_character_count"),
                        normalized_character_count=norm_doc.get("normalized_total_character_count"),
                        character_retention_ratio=norm_doc.get("character_retention_ratio"),
                        sha256=norm_doc.get("source_pdf_sha256"),
                        output_path=str(normalized_file),
                        normalized_at=norm_doc.get("normalized_at"),
                        validation_issues=norm_doc.get("issues", []),
                    )
                else:
                    norm_out = normalize_extracted_document(ext_data, output_dir=normalized_dir)
                    rec = NormalizationManifestRecord(
                        standard_id=std.get("standard_id"),
                        standard_enc_id=std.get("standard_enc_id"),
                        is_number=is_num,
                        title=std.get("title"),
                        category=cat_name,
                        source_pdf=ext_data.get("source_pdf"),
                        source_extraction_file=str(extracted_file),
                        normalization_status=NormalizationStatus.NORMALIZED,
                        normalization_quality=norm_out.normalization_quality,
                        page_count=norm_out.page_count,
                        source_character_count=norm_out.source_total_character_count,
                        normalized_character_count=norm_out.normalized_total_character_count,
                        character_retention_ratio=norm_out.character_retention_ratio,
                        sha256=norm_out.source_pdf_sha256,
                        output_path=str(normalized_file),
                        normalized_at=norm_out.normalized_at,
                        validation_issues=norm_out.issues,
                    )
            except Exception as e:
                rec = NormalizationManifestRecord(
                    standard_id=std.get("standard_id"),
                    standard_enc_id=std.get("standard_enc_id"),
                    is_number=is_num,
                    title=std.get("title"),
                    category=cat_name,
                    source_extraction_file=str(extracted_file),
                    normalization_status=NormalizationStatus.NORMALIZATION_FAILED,
                    validation_issues=[f"Normalization error: {str(e)}"],
                )
        else:
            # Not extracted yet
            rec = NormalizationManifestRecord(
                standard_id=std.get("standard_id"),
                standard_enc_id=std.get("standard_enc_id"),
                is_number=is_num,
                title=std.get("title"),
                category=cat_name,
                normalization_status=NormalizationStatus.NOT_NORMALIZED,
            )

        records.append(rec)
        category_map[cat_name].append(rec)

    # Build Summary
    summary = NormalizationSummary(
        total_standards=len(records),
        normalized_count=len([r for r in records if r.normalization_status == NormalizationStatus.NORMALIZED]),
        not_normalized_count=len([r for r in records if r.normalization_status == NormalizationStatus.NOT_NORMALIZED]),
        normalization_failed_count=len([r for r in records if r.normalization_status == NormalizationStatus.NORMALIZATION_FAILED]),
        manual_review_count=len([r for r in records if r.normalization_status == NormalizationStatus.REQUIRES_MANUAL_REVIEW or r.normalization_quality == NormalizationQuality.REQUIRES_MANUAL_REVIEW]),
        good_quality_count=len([r for r in records if r.normalization_quality == NormalizationQuality.GOOD]),
        warning_quality_count=len([r for r in records if r.normalization_quality == NormalizationQuality.WARNING]),
        total_pages_normalized=sum(r.page_count or 0 for r in records if r.normalization_status == NormalizationStatus.NORMALIZED),
        total_source_characters=sum(r.source_character_count or 0 for r in records if r.normalization_status == NormalizationStatus.NORMALIZED),
        total_normalized_characters=sum(r.normalized_character_count or 0 for r in records if r.normalization_status == NormalizationStatus.NORMALIZED),
    )

    cat_breakdowns: List[CategoryNormalizationBreakdown] = []
    cat_groups: List[NormalizationCategoryGroup] = []

    for cat_name, cat_records in category_map.items():
        cat_breakdowns.append(
            CategoryNormalizationBreakdown(
                category_name=cat_name,
                total_standards=len(cat_records),
                normalized_count=len([r for r in cat_records if r.normalization_status == NormalizationStatus.NORMALIZED]),
                not_normalized_count=len([r for r in cat_records if r.normalization_status == NormalizationStatus.NOT_NORMALIZED]),
                manual_review_count=len([r for r in cat_records if r.normalization_status == NormalizationStatus.REQUIRES_MANUAL_REVIEW]),
            )
        )
        cat_groups.append(
            NormalizationCategoryGroup(name=cat_name, standards=cat_records)
        )

    manifest = BISDocumentNormalizationManifest(
        schema_version="1.0.0",
        generated_at=datetime.now(timezone.utc).isoformat(),
        description="Official normalization status and corpus-ready manifest for 100 BISaarthi MVP standards",
        summary=summary,
        categories_breakdown=cat_breakdowns,
        categories=cat_groups,
    )

    # Save JSON manifest
    docs_manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(docs_manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))

    # Save Markdown manifest
    generate_markdown_manifest(manifest, docs_md_path)

    return manifest


def generate_markdown_manifest(manifest: BISDocumentNormalizationManifest, md_path: Path) -> None:
    """Generates an authoritative GitHub-flavored Markdown representation of the normalization manifest."""
    lines = [
        "# BISaarthi — Phase 4B: Official BIS Document Normalization Manifest",
        "",
        "## 1. Executive Summary",
        "",
        "This manifest tracks the text normalization, structural heading preservation, artifact cleanup, and corpus-ready status for the 100-standard BISaarthi MVP corpus (`backend/docs/bis_mvp_corpus_manifest.json`).",
        "",
        "> [!IMPORTANT]",
        "> **Strict Offline Execution & Boundaries**:",
        "> - Normalization runs **100% offline** on Phase 4A extracted documents without network requests or LLMs.",
        "> - Input is restricted strictly to `backend/data/bis_documents/extracted/`.",
        f"> - Current production state tracks **{manifest.summary.total_standards}** standards: **{manifest.summary.normalized_count}** normalized, **{manifest.summary.not_normalized_count}** not normalized.",
        "",
        "## 2. Normalization Summary Metrics",
        "",
        f"- **Total Standards Tracked**: {manifest.summary.total_standards}",
        f"- **Successfully Normalized**: {manifest.summary.normalized_count}",
        f"- **Pending Extraction / Not Normalized**: {manifest.summary.not_normalized_count}",
        f"- **Normalization Failures**: {manifest.summary.normalization_failed_count}",
        f"- **Manual Review Required**: {manifest.summary.manual_review_count}",
        f"- **Good Quality Normalizations**: {manifest.summary.good_quality_count}",
        f"- **Warning Quality Normalizations**: {manifest.summary.warning_quality_count}",
        f"- **Total Pages Normalized**: {manifest.summary.total_pages_normalized}",
        f"- **Total Source Characters**: {manifest.summary.total_source_characters}",
        f"- **Total Normalized Characters**: {manifest.summary.total_normalized_characters}",
        "",
        "## 3. Category Breakdown",
        "",
        "| Category | Total Standards | Normalized | Not Normalized | Manual Review |",
        "| -------- | --------------- | ---------- | -------------- | ------------- |",
    ]

    for cb in manifest.categories_breakdown:
        lines.append(
            f"| {cb.category_name} | {cb.total_standards} | {cb.normalized_count} | {cb.not_normalized_count} | {cb.manual_review_count} |"
        )

    lines.extend([
        "",
        "## 4. Document Normalization Inventory",
        "",
        "| IS Number | Title | Status | Quality | Pages | Source Chars | Norm Chars | Retention |",
        "| --------- | ----- | ------ | ------- | ----- | ------------ | ---------- | --------- |",
    ])

    for cat in manifest.categories:
        for std in cat.standards:
            title_trunc = (std.title[:40] + "...") if std.title and len(std.title) > 43 else (std.title or "N/A")
            pages_str = str(std.page_count) if std.page_count is not None else "N/A"
            src_chars_str = str(std.source_character_count) if std.source_character_count is not None else "N/A"
            norm_chars_str = str(std.normalized_character_count) if std.normalized_character_count is not None else "N/A"
            ret_str = f"{std.character_retention_ratio:.1%}" if std.character_retention_ratio is not None else "N/A"
            qual_str = f"`{std.normalization_quality.value}`" if std.normalization_quality else "`N/A`"

            lines.append(
                f"| {std.is_number} | {title_trunc} | `{std.normalization_status.value}` | {qual_str} | {pages_str} | {src_chars_str} | {norm_chars_str} | {ret_str} |"
            )

    lines.append("")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
