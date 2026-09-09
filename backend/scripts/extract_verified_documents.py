"""CLI runner to extract text from verified BIS PDFs and synchronize the extraction manifest.

Scans data/bis_documents/verified/, performs offline page-by-page extraction,
generates structured JSON in data/bis_documents/extracted/, and synchronizes
bis_document_extraction_manifest.json and bis_document_extraction_manifest.md.
"""

from pathlib import Path
import sys

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from app.core.logging import get_logger
from app.services.bis_document_extractor import run_extraction_manifest_and_save

logger = get_logger("extract_verified_documents")

if __name__ == "__main__":
    corpus_path = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
    output_json = backend_root / "docs" / "bis_document_extraction_manifest.json"
    output_md = backend_root / "docs" / "bis_document_extraction_manifest.md"

    base_data_dir = backend_root / "data" / "bis_documents"
    verified_dir = base_data_dir / "verified"
    extracted_dir = base_data_dir / "extracted"

    verified_dir.mkdir(parents=True, exist_ok=True)
    extracted_dir.mkdir(parents=True, exist_ok=True)

    logger.info("Starting Phase 4A Document Extraction Pipeline")

    manifest = run_extraction_manifest_and_save(
        corpus_manifest_path=corpus_path,
        output_json_path=output_json,
        output_md_path=output_md,
        verified_dir=verified_dir,
        extracted_dir=extracted_dir,
    )

    logger.info("Phase 4A Document Extraction Pipeline complete!")
    logger.info(f"Total standards tracked: {manifest.total_standards}")
    logger.info(f"Successfully Extracted: {manifest.summary.extracted_count}")
    logger.info(f"Pending Acquisition / Not Extracted: {manifest.summary.not_extracted_count}")
    logger.info(f"Extraction Failures: {manifest.summary.extraction_failed_count}")
    logger.info(f"Manual Review Required: {manifest.summary.manual_review_count}")
    logger.info(f"Good Quality Extractions: {manifest.summary.good_quality_count}")
    logger.info(f"Requires OCR / Scanned: {manifest.summary.requires_ocr_count}")
    logger.info(f"Total Pages Extracted: {manifest.summary.total_pages_extracted}")
    logger.info(f"Total Characters Extracted: {manifest.summary.total_characters_extracted}")
