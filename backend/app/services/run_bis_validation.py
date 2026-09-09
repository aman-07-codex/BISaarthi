"""Execution script to validate the BISaarthi MVP corpus manifest against official BIS APIs.

Generates:
- backend/docs/bis_mvp_corpus_validation.json
- backend/docs/bis_mvp_corpus_validation.md
"""

from pathlib import Path
import sys

from app.core.logging import get_logger, setup_logging
from app.services.bis_client import BISClient
from app.services.bis_validator import BISManifestValidator

setup_logging()
logger = get_logger("run_bis_validation")


def main() -> int:
    backend_root = Path(__file__).resolve().parent.parent.parent
    manifest_path = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    json_out_path = backend_root / "docs" / "bis_mvp_corpus_validation.json"
    md_out_path = backend_root / "docs" / "bis_mvp_corpus_validation.md"

    logger.info("Initializing BIS Client & Manifest Validator...")
    with BISClient(timeout=25.0, rate_limit_delay=0.15) as client:
        validator = BISManifestValidator(manifest_path=manifest_path, client=client)

        logger.info("Verifying manifest structural integrity...")
        integrity = validator.validate_manifest_integrity()
        if not integrity.is_valid:
            logger.error(f"Manifest integrity failed: {integrity.missing_required_fields}")
            return 1

        logger.info(f"Integrity verified for {integrity.total_standards} standards across 5 categories.")
        logger.info("Executing manifest resolution against official BIS APIs (with caching)...")

        summary = validator.validate_all(use_cache=True)

        logger.info(f"Resolution complete: {summary.resolved_count}/{summary.total_manifest_standards} resolved.")
        logger.info(f"Exact Matches: {summary.exact_match_count}, Metadata Changed: {summary.metadata_changed_count}, Requires Review: {summary.requires_review_count}")

        validator.generate_json_report(summary, json_out_path)
        validator.generate_markdown_report(summary, md_out_path)

        print("\n" + "=" * 60)
        print("BISAARTHI MVP CORPUS VALIDATION COMPLETE")
        print("=" * 60)
        print(f"Total Standards:      {summary.total_manifest_standards}")
        print(f"Successfully Resolved: {summary.resolved_count}")
        print(f"Exact Matches:        {summary.exact_match_count}")
        print(f"Metadata Changed:     {summary.metadata_changed_count}")
        print(f"Requires Review:      {summary.requires_review_count}")
        print(f"Unresolved:           {summary.unresolved_count}")
        print(f"JSON Report:          {json_out_path}")
        print(f"Markdown Report:      {md_out_path}")
        print("=" * 60 + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
