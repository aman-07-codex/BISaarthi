"""CLI runner to verify and ingest candidate BIS documents from quarantine staging.

Scans data/bis_documents/quarantine/, verifies PDF format, cryptographic hash,
and standard identity match, moves files to verified/ or rejected/, and synchronizes
the authoritative bis_document_acquisition_manifest.json and Markdown reports.
"""

import json
from pathlib import Path
import sys

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from app.core.logging import get_logger
from app.services.bis_document_acquisition import run_acquisition_manifest_and_save
from app.services.bis_document_verifier import BISDocumentVerifier
from app.services.bis_resolver import parse_is_number

logger = get_logger("verify_and_ingest_documents")

if __name__ == "__main__":
    corpus_path = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    output_json = backend_root / "docs" / "bis_document_acquisition_manifest.json"
    output_md = backend_root / "docs" / "bis_document_acquisition_manifest.md"

    base_data_dir = backend_root / "data" / "bis_documents"
    quarantine_dir = base_data_dir / "quarantine"
    verified_dir = base_data_dir / "verified"
    rejected_dir = base_data_dir / "rejected"
    metadata_dir = base_data_dir / "metadata"

    for d in [quarantine_dir, verified_dir, rejected_dir, metadata_dir]:
        d.mkdir(parents=True, exist_ok=True)

    logger.info("Starting BIS Document Ingestion & Verification Runner")

    # 1. Load corpus standards map
    with open(corpus_path, "r", encoding="utf-8") as f:
        corpus_data = json.load(f)

    corpus_map: dict = {}
    for cat in corpus_data.get("categories", []):
        for std in cat.get("standards", []):
            is_num = std.get("is_number", "")
            identity = parse_is_number(is_num)
            corpus_map[identity.normalized_key] = std

    # 2. Process quarantine files
    verifier = BISDocumentVerifier(
        quarantine_dir=quarantine_dir,
        verified_dir=verified_dir,
        rejected_dir=rejected_dir,
    )

    quarantine_files = list(quarantine_dir.glob("*.pdf"))
    logger.info(f"Found {len(quarantine_files)} candidate PDFs in quarantine")

    for qf in quarantine_files:
        logger.info(f"Verifying candidate file: {qf.name}")
        res = verifier.verify_and_stage_document(
            source_file_path=qf,
            corpus_standards_map=corpus_map,
            move_file=True,
        )
        if res.is_valid:
            logger.info(f"ACCEPTED: {qf.name} -> {res.matched_is_number} ({res.canonical_filename})")
        else:
            logger.warning(f"REJECTED: {qf.name} (Reasons: {'; '.join(res.reasons)})")

    # 3. Synchronize acquisition manifest
    manifest = run_acquisition_manifest_and_save(
        corpus_manifest_path=corpus_path,
        output_json_path=output_json,
        output_md_path=output_md,
        verified_dir=verified_dir,
    )

    logger.info("Acquisition manifest synchronized successfully!")
    logger.info(f"Total standards tracked: {manifest.total_standards}")
    logger.info(f"Verified & Staged: {manifest.summary.verified_count}")
    logger.info(f"Pending Acquisition: {manifest.summary.not_acquired_count}")
    logger.info(f"Rejected: {manifest.summary.rejected_count}")
