#!/usr/bin/env python3
"""CLI runner for Phase 4B: Text Normalization & Corpus-Ready Representation."""

import argparse
import os
from pathlib import Path
import sys

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.services.bis_document_normalizer import run_normalization_manifest_and_save


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run Phase 4B offline text normalization on Phase 4A extracted BIS documents."
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=backend_root / "docs" / "bis_mvp_corpus_manifest.json",
        help="Path to authoritative 100-standard corpus manifest JSON",
    )
    parser.add_argument(
        "--extracted-dir",
        type=Path,
        default=backend_root / "data" / "bis_documents" / "extracted",
        help="Directory containing Phase 4A extracted JSON files",
    )
    parser.add_argument(
        "--normalized-dir",
        type=Path,
        default=backend_root / "data" / "bis_documents" / "normalized",
        help="Directory to save normalized corpus-ready JSON files",
    )
    parser.add_argument(
        "--docs-manifest",
        type=Path,
        default=backend_root / "docs" / "bis_document_normalization_manifest.json",
        help="Output path for normalization manifest JSON",
    )
    parser.add_argument(
        "--docs-md",
        type=Path,
        default=backend_root / "docs" / "bis_document_normalization_manifest.md",
        help="Output path for normalization manifest Markdown",
    )
    parser.add_argument(
        "--single",
        type=str,
        default=None,
        help="Specific IS number to normalize (e.g. 'IS 2082:2018')",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-normalization of already normalized documents",
    )

    args = parser.parse_args()

    manifest = run_normalization_manifest_and_save(
        manifest_path=args.manifest,
        extracted_dir=args.extracted_dir,
        normalized_dir=args.normalized_dir,
        docs_manifest_path=args.docs_manifest,
        docs_md_path=args.docs_md,
        force=args.force,
        single_is=args.single,
    )

    print("=" * 60)
    print("BISaarthi Phase 4B — Document Normalization Completed")
    print("=" * 60)
    print(f"Total Standards:      {manifest.summary.total_standards}")
    print(f"Normalized:           {manifest.summary.normalized_count}")
    print(f"Not Normalized:       {manifest.summary.not_normalized_count}")
    print(f"Failed:               {manifest.summary.normalization_failed_count}")
    print(f"Manual Review:        {manifest.summary.manual_review_count}")
    print(f"Good Quality:         {manifest.summary.good_quality_count}")
    print(f"Warning Quality:      {manifest.summary.warning_quality_count}")
    print(f"Total Source Chars:   {manifest.summary.total_source_characters}")
    print(f"Total Norm Chars:     {manifest.summary.total_normalized_characters}")
    print(f"Manifest JSON:        {args.docs_manifest}")
    print(f"Manifest MD:          {args.docs_md}")
    print("=" * 60)


if __name__ == "__main__":
    main()
