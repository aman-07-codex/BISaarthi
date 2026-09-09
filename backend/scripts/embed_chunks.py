#!/usr/bin/env python3
"""CLI runner skeleton for Phase 5A: Embedding Pipeline & Vector Store Interface."""

import argparse
from pathlib import Path
import sys

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.schemas.bis_embedding import EmbeddingConfig, EmbeddingProviderType
from app.services.bis_embedding import run_embedding_manifest_and_save


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Phase 5A embedding pipeline CLI skeleton and manifest generator."
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=backend_root / "docs" / "bis_mvp_corpus_manifest.json",
        help="Path to authoritative 100-standard corpus manifest JSON",
    )
    parser.add_argument(
        "--chunks-dir",
        type=Path,
        default=backend_root / "data" / "bis_documents" / "chunks",
        help="Directory containing Phase 4C chunk JSON files",
    )
    parser.add_argument(
        "--docs-manifest",
        type=Path,
        default=backend_root / "docs" / "bis_embedding_manifest.json",
        help="Output path for embedding manifest JSON",
    )
    parser.add_argument(
        "--docs-md",
        type=Path,
        default=backend_root / "docs" / "bis_embedding_manifest.md",
        help="Output path for embedding manifest Markdown",
    )
    parser.add_argument(
        "--provider",
        type=str,
        default="mock",
        choices=["mock", "local", "external"],
        help="Embedding provider type (default: mock)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Dry run without embedding any chunks",
    )

    args = parser.parse_args()

    config = EmbeddingConfig(
        provider=EmbeddingProviderType(args.provider),
    )

    manifest = run_embedding_manifest_and_save(
        manifest_path=args.manifest,
        chunks_dir=args.chunks_dir,
        docs_manifest_path=args.docs_manifest,
        docs_md_path=args.docs_md,
        config=config,
    )

    print("=" * 60)
    print("BISaarthi Phase 5A — Embedding Architecture & Manifest")
    print("=" * 60)
    print(f"Total Standards:       {manifest.summary.total_standards}")
    print(f"Embedded:              {manifest.summary.embedded_count}")
    print(f"Not Embedded:          {manifest.summary.not_embedded_count}")
    print(f"Total Vectors:         {manifest.summary.total_vectors_generated}")
    print(f"Configured Provider:   {config.provider.value} ({config.model_name})")
    print(f"Configured Dimension:  {config.dimension}")
    print(f"Manifest JSON:         {args.docs_manifest}")
    print(f"Manifest MD:           {args.docs_md}")
    print("=" * 60)


if __name__ == "__main__":
    main()
