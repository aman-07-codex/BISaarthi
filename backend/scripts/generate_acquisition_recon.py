"""Runner script for Phase 3A: Official BIS Document Acquisition Reconnaissance.

Evaluates the 100 manifest standards against verified official BIS access capabilities
and generates bis_document_acquisition_reconnaissance.json and bis_document_acquisition_reconnaissance.md.
"""

from pathlib import Path
import sys

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from app.core.logging import get_logger
from app.services.bis_client import BISClient
from app.services.bis_acquisition_recon import run_acquisition_recon_and_save

logger = get_logger("generate_acquisition_recon")

if __name__ == "__main__":
    corpus_path = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    output_json = backend_root / "docs" / "bis_document_acquisition_reconnaissance.json"
    output_md = backend_root / "docs" / "bis_document_acquisition_reconnaissance.md"

    logger.info(f"Starting Phase 3A Acquisition Reconnaissance on {corpus_path}")

    with BISClient(rate_limit_delay=0.15, timeout=25.0, verify_ssl=True) as client:
        report = run_acquisition_recon_and_save(
            corpus_manifest_path=corpus_path,
            output_json_path=output_json,
            output_md_path=output_md,
            bis_client=client,
            use_cache=True,
        )

    logger.info("Phase 3A Acquisition Reconnaissance complete!")
    logger.info(f"Total standards assessed: {report.summary.total_standards}")
    logger.info(f"PUBLIC_AUTOMATABLE: {report.summary.public_automatable}")
    logger.info(f"PUBLIC_MANUAL: {report.summary.public_manual}")
    logger.info(f"AUTHENTICATED: {report.summary.authenticated}")
    logger.info(f"PAID_OR_LICENSED: {report.summary.paid_or_licensed}")
    logger.info(f"NOT_EXPOSED: {report.summary.not_exposed}")
    logger.info(f"UNKNOWN: {report.summary.unknown}")
    logger.info(f"Official document references discovered: {report.summary.official_references_discovered}")
    logger.info(f"Manual portal candidates: {report.summary.manual_acquisition_candidates}")
    logger.info(f"Standards requiring authentication: {report.summary.requiring_authentication}")
    logger.info(f"Standards requiring licensing/payment: {report.summary.requiring_paid_or_licensed}")
