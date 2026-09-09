"""Document chunking and semantic partitioning service for Phase 4C: Corpus-Ready Chunks."""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Set, Tuple

from app.schemas.bis_document_chunking import (
    BISDocumentChunkingManifest,
    CategoryChunkingBreakdown,
    ChunkingCategoryGroup,
    ChunkingManifestRecord,
    ChunkingStatus,
    ChunkingSummary,
    ChunkType,
    DocumentChunk,
    DocumentChunkOutput,
)
from app.services.bis_chunk_validator import (
    validate_chunk_conservation_and_integrity,
    validate_normalization_input,
)

# Regex Patterns for BIS structural hierarchy
REGEX_ANNEX = re.compile(r"^(?:ANNEX|APPENDIX)\s+([A-Z0-9]+)(?:\s*[:\-\u2014]?\s*(.*))?$", re.IGNORECASE)
REGEX_TABLE = re.compile(r"^(?:TABLE)\s+([A-Z0-9\.\-]+)(?:\s*[:\-\u2014]?\s*(.*))?$", re.IGNORECASE)
REGEX_SECTION = re.compile(r"^(\d+)\s+([A-Z][A-Za-z0-9\s,\-\(\)\/\.]{2,})$")
REGEX_SUBCLAUSE = re.compile(r"^(\d+\.\d+(?:\.\d+)*)\s*(.*)$")
REGEX_NOTE = re.compile(r"^(?:NOTE|NOTES|WARNING|CAUTION)(?:\s+[0-9]+)?(?:\s*[:\-])?\s*(.*)$", re.IGNORECASE)



class RawBlock:
    """Internal structural block collected before chunk sizing and splitting."""

    def __init__(
        self,
        chunk_type: ChunkType,
        section: Optional[str] = None,
        section_title: Optional[str] = None,
        clause: Optional[str] = None,
        clause_title: Optional[str] = None,
        parent_clause: Optional[str] = None,
        annex_id: Optional[str] = None,
        table_id: Optional[str] = None,
    ) -> None:
        self.chunk_type = chunk_type
        self.section = section
        self.section_title = section_title
        self.clause = clause
        self.clause_title = clause_title
        self.parent_clause = parent_clause
        self.annex_id = annex_id
        self.table_id = table_id
        self.source_pages: Set[int] = set()
        self.paragraphs: List[str] = []

    def add_paragraph(self, text: str, page_number: int) -> None:
        clean_text = text.strip()
        if clean_text:
            self.paragraphs.append(clean_text)
            self.source_pages.add(page_number)

    @property
    def full_text(self) -> str:
        return "\n\n".join(self.paragraphs).strip()

    @property
    def character_count(self) -> int:
        return len(self.full_text)


def parse_document_hierarchy(pages: List[Dict[str, Any]]) -> List[RawBlock]:
    """Parses normalized pages into ordered structural blocks respecting BIS standard hierarchy."""
    blocks: List[RawBlock] = []

    active_section: Optional[str] = None
    active_section_title: Optional[str] = None
    active_clause: Optional[str] = None
    active_clause_title: Optional[str] = None
    active_parent_clause: Optional[str] = None
    active_annex_id: Optional[str] = None
    active_table_id: Optional[str] = None

    current_block: Optional[RawBlock] = None

    def start_new_block(
        c_type: ChunkType,
        clause: Optional[str] = None,
        clause_title: Optional[str] = None,
        parent: Optional[str] = None,
        annex: Optional[str] = None,
        table: Optional[str] = None,
    ) -> RawBlock:
        nonlocal current_block
        if current_block and current_block.character_count > 0:
            blocks.append(current_block)
        current_block = RawBlock(
            chunk_type=c_type,
            section=active_section,
            section_title=active_section_title,
            clause=clause or active_clause,
            clause_title=clause_title or active_clause_title,
            parent_clause=parent or active_parent_clause,
            annex_id=annex or active_annex_id,
            table_id=table or active_table_id,
        )
        return current_block

    for p in pages:
        p_num = p.get("page_number", 1)
        p_text = p.get("normalized_text", "")
        if not p_text or not p_text.strip():
            continue

        paragraphs = p_text.split("\n\n")

        for para in paragraphs:
            p_strip = para.strip()
            if not p_strip:
                continue

            first_line = p_strip.splitlines()[0].strip()

            # 1. Check Annex
            annex_match = REGEX_ANNEX.match(first_line)
            if annex_match:
                active_annex_id = f"ANNEX {annex_match.group(1)}"
                active_table_id = None
                active_section = None
                active_section_title = None
                active_clause = None
                active_clause_title = annex_match.group(2)
                start_new_block(ChunkType.ANNEX, annex=active_annex_id, clause_title=active_clause_title)
                if current_block:
                    current_block.add_paragraph(p_strip, p_num)
                continue

            # 2. Check Table
            table_match = REGEX_TABLE.match(first_line)
            if table_match:
                active_table_id = f"TABLE {table_match.group(1)}"
                tbl_title = table_match.group(2)
                start_new_block(ChunkType.TABLE, table=active_table_id, clause_title=tbl_title)
                if current_block:
                    current_block.add_paragraph(p_strip, p_num)
                continue

            # 3. Check Major Section (e.g. "1 SCOPE" or "6 PROTECTION AGAINST...")
            section_match = REGEX_SECTION.match(first_line)
            if section_match:
                sec_num = section_match.group(1)
                sec_title = section_match.group(2).strip()
                active_section = sec_num
                active_section_title = sec_title
                active_clause = sec_num
                active_clause_title = sec_title
                active_parent_clause = None
                active_table_id = None
                start_new_block(ChunkType.SECTION, clause=sec_num, clause_title=sec_title)
                if current_block:
                    current_block.add_paragraph(p_strip, p_num)
                continue

            # 4. Check Subclause (e.g. "6.1" or "6.1.1")
            subclause_match = REGEX_SUBCLAUSE.match(first_line)
            if subclause_match:
                sub_num = subclause_match.group(1)
                sub_title = subclause_match.group(2).strip()
                parts = sub_num.split(".")
                parent_num = ".".join(parts[:-1]) if len(parts) > 1 else active_section
                active_clause = sub_num
                active_clause_title = sub_title if sub_title else active_clause_title
                active_parent_clause = parent_num
                active_table_id = None
                c_type = ChunkType.SUBCLAUSE if len(parts) > 2 else ChunkType.CLAUSE
                start_new_block(c_type, clause=sub_num, clause_title=sub_title, parent=parent_num)
                if current_block:
                    current_block.add_paragraph(p_strip, p_num)
                continue

            # 5. Check Note / Warning
            note_match = REGEX_NOTE.match(first_line)
            if note_match:
                first_upper = first_line.split()[0].upper()
                c_type = ChunkType.WARNING if "WARNING" in first_upper or "CAUTION" in first_upper else ChunkType.NOTE
                # Start note block or keep attached
                start_new_block(c_type)
                if current_block:
                    current_block.add_paragraph(p_strip, p_num)
                continue

            # 6. Regular content paragraph
            if current_block is None:
                start_new_block(ChunkType.CONTENT)
            if current_block:
                current_block.add_paragraph(p_strip, p_num)

    if current_block and current_block.character_count > 0:
        blocks.append(current_block)

    return blocks


def partition_into_chunks(
    blocks: List[RawBlock],
    standard_meta: Dict[str, Any],
    max_characters: int = 2000
) -> List[DocumentChunk]:
    """Partitions structural blocks into retrieval-ready DocumentChunk objects with deterministic IDs."""
    chunks: List[DocumentChunk] = []
    chunk_sequence = 1

    safe_is = re.sub(r"[^\w\-]", "_", standard_meta.get("is_number", "IS"))

    for block in blocks:
        block_text = block.full_text
        if not block_text:
            continue

        pages_sorted = sorted(list(block.source_pages))

        # Check if oversized
        if len(block_text) <= max_characters or len(block.paragraphs) <= 1:
            # Atomic single chunk
            slug = block.clause or block.section or block.annex_id or block.table_id or "content"
            slug_clean = re.sub(r"[^\w\-]", "_", str(slug)).strip("_")
            chunk_id = f"{safe_is}_c{chunk_sequence:04d}_{block.chunk_type.value}_{slug_clean}"

            chunk = DocumentChunk(
                chunk_id=chunk_id,
                chunk_sequence=chunk_sequence,
                chunk_type=block.chunk_type,
                standard_id=standard_meta.get("standard_id"),
                standard_enc_id=standard_meta.get("standard_enc_id"),
                is_number=standard_meta["is_number"],
                title=standard_meta.get("title"),
                category=standard_meta.get("category", "General"),
                section=block.section,
                section_title=block.section_title,
                clause=block.clause,
                clause_title=block.clause_title,
                parent_clause=block.parent_clause,
                annex_id=block.annex_id,
                table_id=block.table_id,
                source_pages=pages_sorted,
                source_pdf=standard_meta.get("source_pdf", ""),
                source_pdf_sha256=standard_meta.get("source_pdf_sha256", ""),
                source_extraction_path=standard_meta.get("source_extraction_file", ""),
                source_normalization_path=standard_meta.get("source_normalization_path", ""),
                text=block_text,
                character_count=len(block_text),
                word_count=len(block_text.split()),
                is_oversized_subchunk=False,
            )
            chunks.append(chunk)
            chunk_sequence += 1
        else:
            # Oversized block: split across paragraph boundaries
            sub_groups: List[List[str]] = []
            curr_group: List[str] = []
            curr_len = 0

            for para in block.paragraphs:
                para_len = len(para) + 2
                if curr_len + para_len > max_characters and curr_group:
                    sub_groups.append(curr_group)
                    curr_group = [para]
                    curr_len = len(para)
                else:
                    curr_group.append(para)
                    curr_len += para_len

            if curr_group:
                sub_groups.append(curr_group)

            sub_total = len(sub_groups)
            for sub_idx, sub_paras in enumerate(sub_groups, start=1):
                sub_text = "\n\n".join(sub_paras).strip()
                slug = block.clause or block.section or block.annex_id or block.table_id or "content"
                slug_clean = re.sub(r"[^\w\-]", "_", str(slug)).strip("_")
                chunk_id = f"{safe_is}_c{chunk_sequence:04d}_{block.chunk_type.value}_{slug_clean}_p{sub_idx}"

                chunk = DocumentChunk(
                    chunk_id=chunk_id,
                    chunk_sequence=chunk_sequence,
                    chunk_type=block.chunk_type,
                    standard_id=standard_meta.get("standard_id"),
                    standard_enc_id=standard_meta.get("standard_enc_id"),
                    is_number=standard_meta["is_number"],
                    title=standard_meta.get("title"),
                    category=standard_meta.get("category", "General"),
                    section=block.section,
                    section_title=block.section_title,
                    clause=block.clause,
                    clause_title=block.clause_title,
                    parent_clause=block.parent_clause,
                    annex_id=block.annex_id,
                    table_id=block.table_id,
                    source_pages=pages_sorted,
                    source_pdf=standard_meta.get("source_pdf", ""),
                    source_pdf_sha256=standard_meta.get("source_pdf_sha256", ""),
                    source_extraction_path=standard_meta.get("source_extraction_file", ""),
                    source_normalization_path=standard_meta.get("source_normalization_path", ""),
                    text=sub_text,
                    character_count=len(sub_text),
                    word_count=len(sub_text.split()),
                    is_oversized_subchunk=True,
                    subchunk_index=sub_idx,
                    subchunk_total=sub_total,
                )
                chunks.append(chunk)
                chunk_sequence += 1

    return chunks


def chunk_normalized_document(
    norm_data: Dict[str, Any],
    output_dir: Optional[Path] = None,
    max_characters: int = 2000
) -> DocumentChunkOutput:
    """Transforms a Phase 4B normalized document into retrieval-ready DocumentChunkOutput.
    
    Args:
        norm_data: Phase 4B normalized document dictionary.
        output_dir: Optional directory to save the resulting JSON file.
        max_characters: Maximum preferred character limit per chunk before splitting.
        
    Returns:
        DocumentChunkOutput object.
    """
    is_valid, validation_issues = validate_normalization_input(norm_data)
    if not is_valid:
        raise ValueError(f"Invalid normalization input: {'; '.join(validation_issues)}")

    raw_pages = norm_data.get("pages", [])
    blocks = parse_document_hierarchy(raw_pages)

    standard_meta = {
        "standard_id": norm_data.get("standard_id"),
        "standard_enc_id": norm_data.get("standard_enc_id"),
        "is_number": norm_data["is_number"],
        "title": norm_data.get("title"),
        "category": norm_data.get("category", "General"),
        "source_pdf": norm_data.get("source_pdf", ""),
        "source_pdf_sha256": norm_data.get("source_pdf_sha256", ""),
        "source_extraction_file": norm_data.get("source_extraction_file", ""),
        "source_normalization_path": norm_data.get("source_normalization_path", ""),
    }

    chunks = partition_into_chunks(blocks, standard_meta, max_characters=max_characters)

    type_counts: Dict[str, int] = {}
    total_chars = 0
    for c in chunks:
        type_counts[c.chunk_type.value] = type_counts.get(c.chunk_type.value, 0) + 1
        total_chars += c.character_count

    avg_chars = round(total_chars / len(chunks), 2) if chunks else 0.0

    output = DocumentChunkOutput(
        standard_id=norm_data.get("standard_id"),
        standard_enc_id=norm_data.get("standard_enc_id"),
        is_number=norm_data["is_number"],
        title=norm_data.get("title"),
        category=norm_data.get("category", "General"),
        source_pdf=norm_data.get("source_pdf", ""),
        source_pdf_sha256=norm_data.get("source_pdf_sha256", ""),
        source_extraction_path=norm_data.get("source_extraction_file", ""),
        source_normalization_path=norm_data.get("source_normalization_path", ""),
        total_chunks=len(chunks),
        total_characters=total_chars,
        average_chunk_characters=avg_chars,
        chunk_type_counts=type_counts,
        chunking_status=ChunkingStatus.CHUNKED,
        issues=validation_issues,
        chunked_at=datetime.now(timezone.utc).isoformat(),
        chunking_version="1.0.0",
        chunks=chunks,
    )

    # Validate chunk integrity
    chunk_valid, chunk_issues = validate_chunk_conservation_and_integrity(
        norm_data, output.model_dump()
    )
    if chunk_issues:
        output.issues.extend(chunk_issues)
        if not chunk_valid:
            output.chunking_status = ChunkingStatus.REQUIRES_MANUAL_REVIEW

    # Save to output_dir if specified
    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        safe_name = re.sub(r"[^\w\-]", "_", norm_data["is_number"])
        out_file = output_dir / f"{safe_name}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(output.model_dump_json(indent=2))

    return output


def run_chunking_manifest_and_save(
    manifest_path: Path,
    normalized_dir: Path,
    chunks_dir: Path,
    docs_manifest_path: Path,
    docs_md_path: Path,
    force: bool = False,
    single_is: Optional[str] = None,
    max_characters: int = 2000
) -> BISDocumentChunkingManifest:
    """Processes normalized documents according to the MVP manifest and writes chunking manifests.
    
    Args:
        manifest_path: Path to authoritative 100-standard corpus manifest.
        normalized_dir: Directory containing Phase 4B normalized JSON files.
        chunks_dir: Directory where Phase 4C chunks JSON files are saved.
        docs_manifest_path: Output path for JSON manifest.
        docs_md_path: Output path for Markdown manifest.
        force: Whether to re-chunk already chunked documents.
        single_is: Optional specific IS number to process.
        max_characters: Maximum characters per chunk.
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

    chunks_dir.mkdir(parents=True, exist_ok=True)

    records: List[ChunkingManifestRecord] = []
    category_map: Dict[str, List[ChunkingManifestRecord]] = {}

    for std in standards_list:
        is_num = std["is_number"]
        if single_is and is_num.strip().lower() != single_is.strip().lower():
            continue

        cat_name = std.get("category", "General")
        if cat_name not in category_map:
            category_map[cat_name] = []

        safe_name = re.sub(r"[^\w\-]", "_", is_num)
        norm_file = normalized_dir / f"{safe_name}.json"
        chunk_file = chunks_dir / f"{safe_name}.json"

        if norm_file.exists():
            try:
                with open(norm_file, "r", encoding="utf-8") as nf:
                    norm_data = json.load(nf)
                norm_data["source_normalization_path"] = str(norm_file)

                if chunk_file.exists() and not force:
                    with open(chunk_file, "r", encoding="utf-8") as cf:
                        chunk_doc = json.load(cf)
                    rec = ChunkingManifestRecord(
                        standard_id=std.get("standard_id"),
                        standard_enc_id=std.get("standard_enc_id"),
                        is_number=is_num,
                        title=std.get("title"),
                        category=cat_name,
                        source_pdf=norm_data.get("source_pdf"),
                        source_normalization_path=str(norm_file),
                        chunking_status=ChunkingStatus(chunk_doc.get("chunking_status", "chunked")),
                        total_chunks=chunk_doc.get("total_chunks"),
                        total_characters=chunk_doc.get("total_characters"),
                        average_chunk_characters=chunk_doc.get("average_chunk_characters"),
                        sha256=norm_data.get("source_pdf_sha256"),
                        output_path=str(chunk_file),
                        chunked_at=chunk_doc.get("chunked_at"),
                        validation_issues=chunk_doc.get("issues", []),
                    )
                else:
                    chunk_out = chunk_normalized_document(
                        norm_data, output_dir=chunks_dir, max_characters=max_characters
                    )
                    rec = ChunkingManifestRecord(
                        standard_id=std.get("standard_id"),
                        standard_enc_id=std.get("standard_enc_id"),
                        is_number=is_num,
                        title=std.get("title"),
                        category=cat_name,
                        source_pdf=norm_data.get("source_pdf"),
                        source_normalization_path=str(norm_file),
                        chunking_status=chunk_out.chunking_status,
                        total_chunks=chunk_out.total_chunks,
                        total_characters=chunk_out.total_characters,
                        average_chunk_characters=chunk_out.average_chunk_characters,
                        sha256=norm_data.get("source_pdf_sha256"),
                        output_path=str(chunk_file),
                        chunked_at=chunk_out.chunked_at,
                        validation_issues=chunk_out.issues,
                    )
            except Exception as e:
                rec = ChunkingManifestRecord(
                    standard_id=std.get("standard_id"),
                    standard_enc_id=std.get("standard_enc_id"),
                    is_number=is_num,
                    title=std.get("title"),
                    category=cat_name,
                    source_normalization_path=str(norm_file),
                    chunking_status=ChunkingStatus.CHUNKING_FAILED,
                    validation_issues=[f"Chunking error: {str(e)}"],
                )
        else:
            rec = ChunkingManifestRecord(
                standard_id=std.get("standard_id"),
                standard_enc_id=std.get("standard_enc_id"),
                is_number=is_num,
                title=std.get("title"),
                category=cat_name,
                chunking_status=ChunkingStatus.NOT_CHUNKED,
            )

        records.append(rec)
        category_map[cat_name].append(rec)

    # Build Summary
    summary = ChunkingSummary(
        total_standards=len(records),
        chunked_count=len([r for r in records if r.chunking_status == ChunkingStatus.CHUNKED]),
        not_chunked_count=len([r for r in records if r.chunking_status == ChunkingStatus.NOT_CHUNKED]),
        chunking_failed_count=len([r for r in records if r.chunking_status == ChunkingStatus.CHUNKING_FAILED]),
        manual_review_count=len([r for r in records if r.chunking_status == ChunkingStatus.REQUIRES_MANUAL_REVIEW]),
        total_chunks_produced=sum(r.total_chunks or 0 for r in records if r.chunking_status == ChunkingStatus.CHUNKED),
        total_characters_chunked=sum(r.total_characters or 0 for r in records if r.chunking_status == ChunkingStatus.CHUNKED),
        average_chunk_size=round(
            (sum(r.total_characters or 0 for r in records if r.chunking_status == ChunkingStatus.CHUNKED) /
             sum(r.total_chunks or 0 for r in records if r.chunking_status == ChunkingStatus.CHUNKED)),
            2
        ) if sum(r.total_chunks or 0 for r in records if r.chunking_status == ChunkingStatus.CHUNKED) > 0 else 0.0,
    )

    cat_breakdowns: List[CategoryChunkingBreakdown] = []
    cat_groups: List[ChunkingCategoryGroup] = []

    for cat_name, cat_records in category_map.items():
        cat_breakdowns.append(
            CategoryChunkingBreakdown(
                category_name=cat_name,
                total_standards=len(cat_records),
                chunked_count=len([r for r in cat_records if r.chunking_status == ChunkingStatus.CHUNKED]),
                not_chunked_count=len([r for r in cat_records if r.chunking_status == ChunkingStatus.NOT_CHUNKED]),
                total_chunks=sum(r.total_chunks or 0 for r in cat_records if r.chunking_status == ChunkingStatus.CHUNKED),
            )
        )
        cat_groups.append(
            ChunkingCategoryGroup(name=cat_name, standards=cat_records)
        )

    manifest = BISDocumentChunkingManifest(
        schema_version="1.0.0",
        generated_at=datetime.now(timezone.utc).isoformat(),
        description="Official chunking status and retrieval-ready chunk manifest for 100 BISaarthi MVP standards",
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


def generate_markdown_manifest(manifest: BISDocumentChunkingManifest, md_path: Path) -> None:
    """Generates an authoritative GitHub-flavored Markdown representation of the chunking manifest."""
    lines = [
        "# BISaarthi — Phase 4C: Official BIS Document Chunking Manifest",
        "",
        "## 1. Executive Summary",
        "",
        "This manifest tracks the structural chunking, hierarchy preservation, and retrieval-ready status for the 100-standard BISaarthi MVP corpus (`backend/docs/bis_mvp_corpus_manifest.json`).",
        "",
        "> [!IMPORTANT]",
        "> **Strict Offline Execution & Boundaries**:",
        "> - Chunking runs **100% offline** on Phase 4B normalized documents without external APIs or LLMs.",
        "> - Input is restricted strictly to `backend/data/bis_documents/normalized/`.",
        f"> - Current production state tracks **{manifest.summary.total_standards}** standards: **{manifest.summary.chunked_count}** chunked, **{manifest.summary.not_chunked_count}** not chunked.",
        "",
        "## 2. Chunking Summary Metrics",
        "",
        f"- **Total Standards Tracked**: {manifest.summary.total_standards}",
        f"- **Successfully Chunked**: {manifest.summary.chunked_count}",
        f"- **Pending Normalization / Not Chunked**: {manifest.summary.not_chunked_count}",
        f"- **Chunking Failures**: {manifest.summary.chunking_failed_count}",
        f"- **Manual Review Required**: {manifest.summary.manual_review_count}",
        f"- **Total Chunks Produced**: {manifest.summary.total_chunks_produced}",
        f"- **Total Characters Chunked**: {manifest.summary.total_characters_chunked}",
        f"- **Average Chunk Size**: {manifest.summary.average_chunk_size} chars",
        "",
        "## 3. Category Breakdown",
        "",
        "| Category | Total Standards | Chunked | Not Chunked | Total Chunks |",
        "| -------- | --------------- | ------- | ----------- | ------------ |",
    ]

    for cb in manifest.categories_breakdown:
        lines.append(
            f"| {cb.category_name} | {cb.total_standards} | {cb.chunked_count} | {cb.not_chunked_count} | {cb.total_chunks} |"
        )

    lines.extend([
        "",
        "## 4. Document Chunking Inventory",
        "",
        "| IS Number | Title | Status | Total Chunks | Total Chars | Avg Chunk Size | Output Path |",
        "| --------- | ----- | ------ | ------------ | ----------- | -------------- | ----------- |",
    ])

    for cat in manifest.categories:
        for std in cat.standards:
            title_trunc = (std.title[:40] + "...") if std.title and len(std.title) > 43 else (std.title or "N/A")
            chunks_str = str(std.total_chunks) if std.total_chunks is not None else "N/A"
            chars_str = str(std.total_characters) if std.total_characters is not None else "N/A"
            avg_str = f"{std.average_chunk_characters:.1f}" if std.average_chunk_characters is not None else "N/A"
            out_str = f"`{std.output_path}`" if std.output_path else "N/A"

            lines.append(
                f"| {std.is_number} | {title_trunc} | `{std.chunking_status.value}` | {chunks_str} | {chars_str} | {avg_str} | {out_str} |"
            )

    lines.append("")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
