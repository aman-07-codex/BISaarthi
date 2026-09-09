"""Embedding orchestration service and manifest generator for Phase 5A."""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple

from app.schemas.bis_embedding import (
    BISDocumentEmbeddingManifest,
    CategoryEmbeddingBreakdown,
    EmbeddingCategoryGroup,
    EmbeddingConfig,
    EmbeddingManifestRecord,
    EmbeddingProviderType,
    EmbeddingStatus,
    EmbeddingSummary,
    SearchResult,
    VectorRecord,
)
from app.services.bis_embedding_provider import (
    BaseEmbeddingProvider,
    MockEmbeddingProvider,
)
from app.services.bis_embedding_validator import (
    generate_deterministic_vector_id,
    validate_chunk_input_for_embedding,
    validate_vector_record,
)
from app.services.bis_vector_store import (
    BaseVectorStore,
    InMemoryVectorStore,
)


class EmbeddingService:
    """Orchestrates chunk embedding, vector record generation, validation, and vector storage."""

    def __init__(
        self,
        config: Optional[EmbeddingConfig] = None,
        provider: Optional[BaseEmbeddingProvider] = None,
        vector_store: Optional[BaseVectorStore] = None
    ) -> None:
        self.config = config or EmbeddingConfig()

        if provider is not None:
            self.provider = provider
        elif self.config.provider == EmbeddingProviderType.MOCK:
            self.provider = MockEmbeddingProvider(
                model_name=self.config.model_name,
                dimension=self.config.dimension,
                normalize=self.config.normalize_embeddings,
            )
        else:
            raise ValueError(
                f"Provider type '{self.config.provider.value}' is not configured. "
                "Only 'mock' provider is enabled in Phase 5A."
            )

        self.vector_store = vector_store or InMemoryVectorStore(
            expected_dimension=self.config.dimension
        )

    def embed_chunks(
        self,
        chunks: List[Dict[str, Any]],
        upsert_to_store: bool = True
    ) -> List[VectorRecord]:
        """Embeds a list of Phase 4C chunks and produces validated VectorRecord objects.
        
        Args:
            chunks: List of DocumentChunk dicts.
            upsert_to_store: Whether to insert generated vectors into vector_store.
            
        Returns:
            List of VectorRecord objects.
        """
        if not chunks:
            return []

        # 1. Validate chunks
        validated_chunks: List[Dict[str, Any]] = []
        for c in chunks:
            is_valid, issues = validate_chunk_input_for_embedding(c)
            if not is_valid:
                raise ValueError(
                    f"Chunk validation failed for '{c.get('chunk_id', 'unknown')}': {'; '.join(issues)}"
                )
            validated_chunks.append(c)

        # 2. Extract texts and batch embed
        texts = [c["text"] for c in validated_chunks]
        all_embeddings: List[List[float]] = []

        batch_size = max(1, self.config.batch_size)
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            batch_vectors = self.provider.embed_batch(batch)
            all_embeddings.extend(batch_vectors)

        # 3. Assemble VectorRecord objects
        now_iso = datetime.now(timezone.utc).isoformat()
        records: List[VectorRecord] = []

        for chunk_data, emb in zip(validated_chunks, all_embeddings):
            chunk_id = chunk_data["chunk_id"]
            vec_id = generate_deterministic_vector_id(
                chunk_id=chunk_id,
                provider=self.provider.provider_type.value,
                model_name=self.provider.model_name,
                dimension=self.provider.dimension,
            )

            rec = VectorRecord(
                vector_id=vec_id,
                chunk_id=chunk_id,
                standard_id=chunk_data.get("standard_id"),
                standard_enc_id=chunk_data.get("standard_enc_id"),
                is_number=chunk_data["is_number"],
                title=chunk_data.get("title"),
                category=chunk_data.get("category", "General"),
                chunk_type=chunk_data.get("chunk_type", "content"),
                section=chunk_data.get("section"),
                clause=chunk_data.get("clause"),
                parent_clause=chunk_data.get("parent_clause"),
                annex_id=chunk_data.get("annex_id"),
                table_id=chunk_data.get("table_id"),
                source_pages=chunk_data.get("source_pages", []),
                source_pdf=chunk_data.get("source_pdf", ""),
                source_pdf_sha256=chunk_data.get("source_pdf_sha256", ""),
                source_chunk_path=chunk_data.get("source_chunk_path", ""),
                embedding_provider=self.provider.provider_type.value,
                embedding_model=self.provider.model_name,
                embedding_dimension=self.provider.dimension,
                embedding=emb,
                metadata={
                    "section_title": chunk_data.get("section_title"),
                    "clause_title": chunk_data.get("clause_title"),
                    "word_count": chunk_data.get("word_count", len(chunk_data["text"].split())),
                },
                created_at=now_iso,
            )

            # Validate record
            is_valid_rec, rec_issues = validate_vector_record(rec, self.provider.dimension)
            if not is_valid_rec:
                raise ValueError(f"Vector validation failed for '{vec_id}': {'; '.join(rec_issues)}")

            records.append(rec)

        # 4. Upsert if requested
        if upsert_to_store and self.vector_store is not None:
            self.vector_store.upsert(records)

        return records

    def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Performs semantic similarity search for a query string."""
        if not query or not query.strip():
            raise ValueError("Query string cannot be empty")

        query_vector = self.provider.embed_text(query)
        return self.vector_store.similarity_search(
            query_vector=query_vector,
            top_k=top_k,
            filters=filters,
        )


def run_embedding_manifest_and_save(
    manifest_path: Path,
    chunks_dir: Path,
    docs_manifest_path: Path,
    docs_md_path: Path,
    config: Optional[EmbeddingConfig] = None
) -> BISDocumentEmbeddingManifest:
    """Generates the authoritative embedding manifest reflecting current corpus state.
    
    Args:
        manifest_path: Path to authoritative 100-standard corpus manifest JSON.
        chunks_dir: Directory containing Phase 4C chunks JSON files.
        docs_manifest_path: Output path for embedding manifest JSON.
        docs_md_path: Output path for embedding manifest Markdown.
        config: Embedding configuration.
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

    records: List[EmbeddingManifestRecord] = []
    category_map: Dict[str, List[EmbeddingManifestRecord]] = {}

    for std in standards_list:
        is_num = std["is_number"]
        cat_name = std.get("category", "General")
        if cat_name not in category_map:
            category_map[cat_name] = []

        safe_name = re.sub(r"[^\w\-]", "_", is_num)
        chunk_file = chunks_dir / f"{safe_name}.json"

        # Production state: zero production embeddings generated
        rec = EmbeddingManifestRecord(
            standard_id=std.get("standard_id"),
            standard_enc_id=std.get("standard_enc_id"),
            is_number=is_num,
            title=std.get("title"),
            category=cat_name,
            source_chunks_path=str(chunk_file) if chunk_file.exists() else None,
            embedding_status=EmbeddingStatus.NOT_EMBEDDED,
        )

        records.append(rec)
        category_map[cat_name].append(rec)

    # Build Summary
    summary = EmbeddingSummary(
        total_standards=len(records),
        embedded_count=len([r for r in records if r.embedding_status == EmbeddingStatus.EMBEDDED]),
        not_embedded_count=len([r for r in records if r.embedding_status == EmbeddingStatus.NOT_EMBEDDED]),
        embedding_failed_count=len([r for r in records if r.embedding_status == EmbeddingStatus.EMBEDDING_FAILED]),
        manual_review_count=len([r for r in records if r.embedding_status == EmbeddingStatus.REQUIRES_MANUAL_REVIEW]),
        total_vectors_generated=sum(r.total_vectors or 0 for r in records if r.embedding_status == EmbeddingStatus.EMBEDDED),
    )

    cat_breakdowns: List[CategoryEmbeddingBreakdown] = []
    cat_groups: List[EmbeddingCategoryGroup] = []

    for cat_name, cat_records in category_map.items():
        cat_breakdowns.append(
            CategoryEmbeddingBreakdown(
                category_name=cat_name,
                total_standards=len(cat_records),
                embedded_count=len([r for r in cat_records if r.embedding_status == EmbeddingStatus.EMBEDDED]),
                not_embedded_count=len([r for r in cat_records if r.embedding_status == EmbeddingStatus.NOT_EMBEDDED]),
                total_vectors=sum(r.total_vectors or 0 for r in cat_records if r.embedding_status == EmbeddingStatus.EMBEDDED),
            )
        )
        cat_groups.append(
            EmbeddingCategoryGroup(name=cat_name, standards=cat_records)
        )

    manifest = BISDocumentEmbeddingManifest(
        schema_version="1.0.0",
        generated_at=datetime.now(timezone.utc).isoformat(),
        description="Official embedding status and vector manifest for 100 BISaarthi MVP standards",
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


def generate_markdown_manifest(manifest: BISDocumentEmbeddingManifest, md_path: Path) -> None:
    """Generates an authoritative GitHub-flavored Markdown representation of the embedding manifest."""
    lines = [
        "# BISaarthi — Phase 5A: Official BIS Document Embedding Manifest",
        "",
        "## 1. Executive Summary",
        "",
        "This manifest tracks the embedding status, vector dimensionalities, and vector store readiness for the 100-standard BISaarthi MVP corpus (`backend/docs/bis_mvp_corpus_manifest.json`).",
        "",
        "> [!IMPORTANT]",
        "> **Strict Offline Execution & Boundaries**:",
        "> - Phase 5A establishes the **architecture and interfaces** only. No production BIS documents are embedded.",
        "> - Zero external embedding APIs (Gemini, OpenAI, Hugging Face) are called during production execution.",
        f"> - Current production state tracks **{manifest.summary.total_standards}** standards: **{manifest.summary.embedded_count}** embedded, **{manifest.summary.not_embedded_count}** not embedded.",
        "",
        "## 2. Embedding Summary Metrics",
        "",
        f"- **Total Standards Tracked**: {manifest.summary.total_standards}",
        f"- **Successfully Embedded**: {manifest.summary.embedded_count}",
        f"- **Pending / Not Embedded**: {manifest.summary.not_embedded_count}",
        f"- **Embedding Failures**: {manifest.summary.embedding_failed_count}",
        f"- **Manual Review Required**: {manifest.summary.manual_review_count}",
        f"- **Total Vectors Generated**: {manifest.summary.total_vectors_generated}",
        "",
        "## 3. Category Breakdown",
        "",
        "| Category | Total Standards | Embedded | Not Embedded | Total Vectors |",
        "| -------- | --------------- | -------- | ------------ | ------------- |",
    ]

    for cb in manifest.categories_breakdown:
        lines.append(
            f"| {cb.category_name} | {cb.total_standards} | {cb.embedded_count} | {cb.not_embedded_count} | {cb.total_vectors} |"
        )

    lines.extend([
        "",
        "## 4. Document Embedding Inventory",
        "",
        "| IS Number | Title | Status | Vectors | Dimension | Model | Output |",
        "| --------- | ----- | ------ | ------- | --------- | ----- | ------ |",
    ])

    for cat in manifest.categories:
        for std in cat.standards:
            title_trunc = (std.title[:40] + "...") if std.title and len(std.title) > 43 else (std.title or "N/A")
            vecs_str = str(std.total_vectors) if std.total_vectors is not None else "N/A"
            dim_str = str(std.embedding_dimension) if std.embedding_dimension is not None else "N/A"
            model_str = std.embedding_model or "N/A"

            lines.append(
                f"| {std.is_number} | {title_trunc} | `{std.embedding_status.value}` | {vecs_str} | {dim_str} | {model_str} | N/A |"
            )

    lines.append("")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
