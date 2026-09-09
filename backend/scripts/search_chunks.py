#!/usr/bin/env python3
"""CLI runner for Phase 5B: Hybrid Retrieval and Production Corpus Search Status."""

import argparse
import json
from pathlib import Path
import sys

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.schemas.bis_retrieval import RetrievalMethod, RetrievalQuery
from app.services.bis_retrieval import BISRetrievalService


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Phase 5B hybrid retrieval CLI and production corpus search interface."
    )
    parser.add_argument(
        "--query",
        type=str,
        required=True,
        help="Search query string (e.g. 'electric water heater safety requirements')",
    )
    parser.add_argument(
        "--method",
        type=str,
        default="hybrid",
        choices=["keyword", "dense", "hybrid"],
        help="Retrieval methodology (default: hybrid)",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=5,
        help="Maximum candidates to return (default: 5)",
    )
    parser.add_argument(
        "--category",
        type=str,
        default=None,
        help="Filter by category",
    )
    parser.add_argument(
        "--is-number",
        type=str,
        default=None,
        help="Filter by IS number",
    )
    parser.add_argument(
        "--chunks-dir",
        type=Path,
        default=backend_root / "data" / "bis_documents" / "chunks",
        help="Path to production chunks directory",
    )

    args = parser.parse_args()

    service = BISRetrievalService()

    # Check production chunks directory
    chunk_files = list(args.chunks_dir.glob("*.json")) if args.chunks_dir.exists() else []

    print("=" * 60)
    print("BISaarthi Phase 5B — Hybrid Retrieval Interface")
    print("=" * 60)
    print(f"Query:              '{args.query}'")
    print(f"Method:             {args.method.upper()}")
    print(f"Top-K:              {args.top_k}")
    print(f"Production Chunks:  {len(chunk_files)} available")

    if not chunk_files:
        print("\n[INFO] Production chunk index is currently empty (0 chunks).")
        print("Status: Waiting for authorized document acquisition & embedding pipeline.")
        print("=" * 60)
        return

    # If chunks exist, load and index them
    loaded_chunks = []
    for cf in chunk_files:
        try:
            with open(cf, "r", encoding="utf-8") as f:
                c_data = json.load(f)
                loaded_chunks.extend(c_data.get("chunks", []))
        except Exception:
            pass

    service.index_chunks(loaded_chunks)

    query_obj = RetrievalQuery(
        query_text=args.query,
        top_k=args.top_k,
        retrieval_method=RetrievalMethod(args.method),
        category=args.category,
        is_number=args.is_number,
    )

    response = service.retrieve(query_obj)
    print(f"Results Found:      {len(response.results)}")
    print("-" * 60)
    for idx, res in enumerate(response.results, start=1):
        print(f"\n{idx}. [{res.score:.4f}] {res.is_number} - {res.clause or res.section or 'General'}")
        print(f"   Attribution: {[m.value for m in res.retrieval_methods]}")
        if res.citation:
            print(f"   Citation:    {res.citation.formatted_citation}")
        print(f"   Snippet:     {res.text[:120]}...")
    print("=" * 60)


if __name__ == "__main__":
    main()
