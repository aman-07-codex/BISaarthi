#!/usr/bin/env python3
"""CLI runner for Phase 4C: Document Chunking & Semantic Partitioning."""

import argparse
import os
from pathlib import Path
import sys

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.services.bis_document_chunker import run_chunking_manifest_and_save


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run Phase 4C offline document chunking on Phase 4B normalized BIS documents."
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=backend_root / "docs" / "bis_mvp_corpus_manifest.json",
        help="Path to authoritative 100-standard corpus manifest JSON",
    )
    parser.add_argument(
        "--normalized-dir",
        type=Path,
        default=backend_root / "data" / "bis_documents" / "normalized",
        help="Directory containing Phase 4B normalized JSON files",
    )
    parser.add_argument(
        "--chunks-dir",
        type=Path,
        default=backend_root / "data" / "bis_documents" / "chunks",
        help="Directory to save retrieval-ready chunks JSON files",
    )
    parser.add_argument(
        "--docs-manifest",
        type=Path,
        default=backend_root / "docs" / "bis_document_chunking_manifest.json",
        help="Output path for chunking manifest JSON",
    )
    parser.add_argument(
        "--docs-md",
        type=Path,
        default=backend_root / "docs" / "bis_document_chunking_manifest.md",
        help="Output path for chunking manifest Markdown",
    )
    parser.add_argument(
        "--single",
        type=str,
        default=None,
        help="Specific IS number to chunk (e.g. 'IS 2082:2018')",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-chunking of already chunked documents",
    )
    parser.add_argument(
        "--max-chars",
        type=int,
        default=2000,
        help="Maximum character length per chunk before paragraph splitting (default: 2000)",
    )

    args = parser.parse_args()

    manifest = run_chunking_manifest_and_save(
        manifest_path=args.manifest,
        normalized_dir=args.normalized_dir,
        chunks_dir=args.chunks_dir,
        docs_manifest_path=args.docs_manifest,
        docs_md_path=args.docs_md,
        force=args.force,
        single_is=args.single,
        max_characters=args.max_chars,
    )

    print("=" * 60)
    print("BISaarthi Phase 4C — Document Chunking Completed")
    print("=" * 60)
    print(f"Total Standards:      {manifest.summary.total_standards}")
    print(f"Chunked:              {manifest.summary.chunked_count}")
    print(f"Not Chunked:          {manifest.summary.not_chunked_count}")
    print(f"Failed:               {manifest.summary.chunking_failed_count}")
    print(f"Manual Review:        {manifest.summary.manual_review_count}")
    print(f"Total Chunks:         {manifest.summary.total_chunks_produced}")
    print(f"Total Characters:     {manifest.summary.total_characters_chunked}")
    print(f"Average Chunk Size:   {manifest.summary.average_chunk_size} chars")
    print(f"Manifest JSON:        {args.docs_manifest}")
    print(f"Manifest MD:          {args.docs_md}")
    print("=" * 60)


if __name__ == "__main__":
    main()
