"""BIS Document Verification Engine (Phase 3B).

Provides local file safety checks, magic byte header verification, cryptographic
SHA-256 hashing, exact IS identity disambiguation, and quarantine-to-verified staging.
"""

from datetime import datetime, timezone
import hashlib
from pathlib import Path
import re
import shutil
from typing import Any, Dict, List, Optional, Tuple

from pydantic import BaseModel

from app.core.logging import get_logger
from app.schemas.bis_document_acquisition import IdentityConfidence, VerificationStatus
from app.services.bis_resolver import clean_text, match_standard_identities, parse_is_number

logger = get_logger("bis_document_verifier")

# Maximum allowed PDF file size (50 MB)
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

# Canonical PDF magic byte prefix
PDF_MAGIC_BYTES = b"%PDF-"


class VerificationResult(BaseModel):
    """Result of verifying a document from the staging/quarantine directory."""
    is_valid: bool
    status: VerificationStatus
    matched_is_number: Optional[str] = None
    standard_id: Optional[int] = None
    canonical_filename: Optional[str] = None
    destination_path: Optional[str] = None
    sha256: Optional[str] = None
    file_size_bytes: Optional[int] = None
    identity_confidence: IdentityConfidence = IdentityConfidence.NONE
    reasons: List[str] = []


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and null byte attacks."""
    clean = Path(filename).name.replace("\x00", "")
    clean = re.sub(r"[\/\\]+", "_", clean)
    clean = re.sub(r"\.\.+", "_", clean)
    clean = re.sub(r"[^\w\-.]", "_", clean)
    return clean.strip("._")


def compute_file_sha256(file_path: Path) -> str:
    """Calculate SHA-256 hash using chunked streaming."""
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def check_pdf_format_and_safety(file_path: Path) -> Tuple[bool, Optional[str]]:
    """Validate file existence, size, and PDF magic bytes."""
    if not file_path.exists() or not file_path.is_file():
        return False, f"File does not exist: {file_path}"

    file_size = file_path.stat().st_size
    if file_size == 0:
        return False, "File is empty (0 bytes)"

    if file_size > MAX_FILE_SIZE_BYTES:
        return False, f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES} bytes"

    # Verify magic bytes
    with open(file_path, "rb") as f:
        header = f.read(1024)
        if not header.startswith(PDF_MAGIC_BYTES) and PDF_MAGIC_BYTES not in header[:1024]:
            return False, "Invalid PDF header signature (missing %PDF- magic bytes)"

    return True, None


class BISDocumentVerifier:
    """Service to verify staged documents and manage quarantine transitions."""

    def __init__(
        self,
        quarantine_dir: str | Path,
        verified_dir: str | Path,
        rejected_dir: str | Path,
    ):
        self.quarantine_dir = Path(quarantine_dir)
        self.verified_dir = Path(verified_dir)
        self.rejected_dir = Path(rejected_dir)

        self.quarantine_dir.mkdir(parents=True, exist_ok=True)
        self.verified_dir.mkdir(parents=True, exist_ok=True)
        self.rejected_dir.mkdir(parents=True, exist_ok=True)

    def verify_and_stage_document(
        self,
        source_file_path: Path,
        corpus_standards_map: Dict[str, Dict[str, Any]],
        move_file: bool = True,
    ) -> VerificationResult:
        """Verify an individual candidate PDF file and transition it to verified or rejected staging.
        
        corpus_standards_map maps normalized_key (e.g. 'IS_2082_2018') -> standard metadata dict.
        """
        reasons: List[str] = []
        filename = sanitize_filename(source_file_path.name)

        # 1. Format and safety check
        is_safe, safety_err = check_pdf_format_and_safety(source_file_path)
        if not is_safe:
            reasons.append(safety_err or "Safety check failed")
            dest_path = self.rejected_dir / filename
            if move_file and source_file_path != dest_path:
                shutil.move(str(source_file_path), str(dest_path))
            return VerificationResult(
                is_valid=False,
                status=VerificationStatus.REJECTED,
                destination_path=str(dest_path),
                reasons=reasons,
            )

        # 2. Cryptographic SHA-256 hash & file size
        sha256 = compute_file_sha256(source_file_path)
        file_size = source_file_path.stat().st_size

        # 3. Standard identity extraction from filename
        # Normalize filename (e.g. "IS_2082_2018.pdf" -> "IS 2082:2018")
        raw_name_hint = source_file_path.stem.replace("_", " ").replace("-", " ")
        candidate_identity = parse_is_number(raw_name_hint)

        # 4. Search for matching standard in the 100-standard corpus allowlist
        matched_standard: Optional[Dict[str, Any]] = None
        exact_match = False

        for std_info in corpus_standards_map.values():
            manifest_is_num = std_info.get("is_number", "")
            manifest_identity = parse_is_number(manifest_is_num)

            is_match, mismatch_reason = match_standard_identities(
                manifest_identity,
                candidate_identity,
                ignore_year=False,
            )
            if is_match:
                matched_standard = std_info
                exact_match = True
                break

        # Fallback: check match ignoring year if exact match not found
        if not matched_standard:
            for std_info in corpus_standards_map.values():
                manifest_is_num = std_info.get("is_number", "")
                manifest_identity = parse_is_number(manifest_is_num)

                is_match, mismatch_reason = match_standard_identities(
                    manifest_identity,
                    candidate_identity,
                    ignore_year=True,
                )
                if is_match:
                    matched_standard = std_info
                    reasons.append(f"Identity note: {mismatch_reason}")
                    break

        # 5. Evaluate allowlist match
        if not matched_standard:
            reasons.append(f"Document '{filename}' does not match any standard in the 100-standard corpus allowlist")
            dest_path = self.rejected_dir / filename
            if move_file and source_file_path != dest_path:
                shutil.move(str(source_file_path), str(dest_path))
            return VerificationResult(
                is_valid=False,
                status=VerificationStatus.REJECTED,
                destination_path=str(dest_path),
                sha256=sha256,
                file_size_bytes=file_size,
                identity_confidence=IdentityConfidence.NONE,
                reasons=reasons,
            )

        # Matched standard details
        matched_is = matched_standard.get("is_number", "")
        std_id = matched_standard.get("standard_id")
        canonical_name = f"{matched_is.replace(' ', '_').replace(':', '_').replace('/', '_').replace('(', '').replace(')', '')}.pdf"
        dest_path = self.verified_dir / canonical_name

        if move_file and source_file_path != dest_path:
            shutil.move(str(source_file_path), str(dest_path))

        reasons.append(f"Cryptographically verified (SHA-256: {sha256[:12]}...) and matched to {matched_is}")

        return VerificationResult(
            is_valid=True,
            status=VerificationStatus.VERIFIED,
            matched_is_number=matched_is,
            standard_id=std_id,
            canonical_filename=canonical_name,
            destination_path=str(dest_path),
            sha256=sha256,
            file_size_bytes=file_size,
            identity_confidence=IdentityConfidence.HIGH if exact_match else IdentityConfidence.MEDIUM,
            reasons=reasons,
        )
