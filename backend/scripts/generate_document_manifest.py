"""Runner script for Phase 2B: Manifest-Driven BIS Document Discovery.

Loads the authoritative bis_mvp_corpus_manifest.json, evaluates all 100 standards
against official BIS endpoints, and outputs bis_document_manifest.json and bis_document_manifest.md.
"""

from pathlib import Path
import sys

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from app.core.logging import get_logger
from app.services.bis_client import BISClient
from app.services.bis_document_discovery import run_discovery_and_save_manifests

logger = get_logger("generate_document_manifest")

if __name__ == "__main__":
    corpus_path = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    output_json = backend_root / "docs" / "bis_document_manifest.json"
    output_md = backend_root / "docs" / "bis_document_manifest.md"

    logger.info(f"Starting Phase 2B Document Discovery on {corpus_path}")

    with BISClient(rate_limit_delay=0.15, timeout=25.0, verify_ssl=True) as client:
        manifest = run_discovery_and_save_manifests(
            corpus_manifest_path=corpus_path,
            output_json_path=output_json,
            output_md_path=output_md,
            bis_client=client,
            use_cache=True,
        )

    logger.info("Phase 2B Document Discovery complete!")
    logger.info(f"Total standards processed: {manifest.total_standards}")
    logger.info(f"Available documents: {manifest.summary.available}")
    logger.info(f"Not exposed by API: {manifest.summary.not_exposed_by_api}")
    logger.info(f"Not found: {manifest.summary.not_found}")
    logger.info(f"Manual review: {manifest.summary.requires_manual_review}")
    logger.info(f"API errors: {manifest.summary.api_error}")
    logger.info(f"High priority documents: {manifest.summary.high_priority_count}")
    logger.info(f"Medium priority documents: {manifest.summary.medium_priority_count}")
