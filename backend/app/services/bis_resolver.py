"""BIS Standard Resolution & Identity Disambiguation Engine.

Provides exact parsing, normalization, and comparison for Indian Standard (IS)
identifiers, ensuring precise disambiguation of base numbers, part numbers,
section numbers, slashes, revision years, and prefix notations (e.g. IS/IEC, IS/ISO).
"""

import re
import unicodedata
from typing import Any, Dict, List, Optional, Tuple

from app.schemas.bis_validation import (
    StandardIdentity,
    StandardValidationResult,
    ValidationStatus,
)


def clean_text(text: Optional[str]) -> str:
    """Normalize unicode spaces, dashes, quotes, and whitespace."""
    if not text:
        return ""
    # Normalize unicode (e.g. em-dash, non-breaking space)
    normalized = unicodedata.normalize("NFKD", str(text))
    # Replace unicode dash variations with standard hyphen
    normalized = re.sub(r"[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]", "-", normalized)
    # Replace smart quotes
    normalized = re.sub(r"[\u2018\u2019\u201a\u201b]", "'", normalized)
    normalized = re.sub(r"[\u201c\u201d\u201e\u201f]", '"', normalized)
    # Replace multiple spaces with single space
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def parse_is_number(is_number_str: str) -> StandardIdentity:
    """Dissect and parse an Indian Standard number into its canonical structural components.
    
    Examples:
    - 'IS 2082:2018' -> prefix: 'IS', base: '2082', part: None, sec: None, year: '2018'
    - 'IS 302 (Part 1):2024' -> prefix: 'IS', base: '302', part: 'Part 1', sec: None, year: '2024'
    - 'IS 302 (Part 2/Sec 3):2024' -> prefix: 'IS', base: '302', part: 'Part 2', sec: 'Sec 3', year: '2024'
    - 'IS/IEC 60898 (Part 1):2015' -> prefix: 'IS/IEC', base: '60898', part: 'Part 1', sec: None, year: '2015'
    - 'IS 15885 (Part 2/Sec 13):2012' -> prefix: 'IS', base: '15885', part: 'Part 2', sec: 'Sec 13', year: '2012'
    """
    raw = clean_text(is_number_str)

    # 1. Extract prefix (IS/IEC, IS/ISO, IS / IEC, IS)
    prefix = "IS"
    if re.match(r"^IS\s*/\s*IEC", raw, re.IGNORECASE):
        prefix = "IS/IEC"
        raw = re.sub(r"^IS\s*/\s*IEC\s*", "", raw, flags=re.IGNORECASE)
    elif re.match(r"^IS\s*/\s*ISO", raw, re.IGNORECASE):
        prefix = "IS/ISO"
        raw = re.sub(r"^IS\s*/\s*ISO\s*", "", raw, flags=re.IGNORECASE)
    elif re.match(r"^IS\b", raw, re.IGNORECASE):
        prefix = "IS"
        raw = re.sub(r"^IS\s*", "", raw, flags=re.IGNORECASE)

    # 2. Extract revision year (:YYYY or YYYY at end)
    year = None
    year_match = re.search(r":\s*(\d{4})\b", raw)
    if year_match:
        year = year_match.group(1)
        raw = raw[:year_match.start()] + raw[year_match.end():]
    else:
        # Fallback: check if trailing 4 digits after space
        trailing_year = re.search(r"\s+(\d{4})$", raw)
        if trailing_year:
            year = trailing_year.group(1)
            raw = raw[:trailing_year.start()]

    raw = raw.strip()

    # 3. Extract Part and Section
    part_number = None
    sec_number = None

    # Check for (Part X/Sec Y) or Part X Sec Y or (Part X)
    part_sec_match = re.search(
        r"\(?\s*Part\s*(\d+)\s*(?:/|\s+)\s*(?:Sec|Section)\s*(\d+)\s*\)?",
        raw,
        re.IGNORECASE,
    )
    if part_sec_match:
        part_number = f"Part {part_sec_match.group(1)}"
        sec_number = f"Sec {part_sec_match.group(2)}"
        raw = raw[:part_sec_match.start()] + raw[part_sec_match.end():]
    else:
        part_only_match = re.search(
            r"\(?\s*Part\s*(\d+)\s*\)?",
            raw,
            re.IGNORECASE,
        )
        if part_only_match:
            part_number = f"Part {part_only_match.group(1)}"
            raw = raw[:part_only_match.start()] + raw[part_only_match.end():]

        sec_only_match = re.search(
            r"\(?\s*(?:Sec|Section)\s*(\d+)\s*\)?",
            raw,
            re.IGNORECASE,
        )
        if sec_only_match:
            sec_number = f"Sec {sec_only_match.group(1)}"
            raw = raw[:sec_only_match.start()] + raw[sec_only_match.end():]

    # 4. Extract base standard number
    raw = raw.strip(" :()-/.")
    base_match = re.search(r"(\d+[\w\-]*)", raw)
    base_number = base_match.group(1) if base_match else raw

    # Build canonical normalized key
    key_parts = [prefix.replace("/", "_"), base_number]
    if part_number:
        key_parts.append(part_number.replace(" ", "_").upper())
    if sec_number:
        key_parts.append(sec_number.replace(" ", "_").upper())
    if year:
        key_parts.append(year)

    normalized_key = "_".join(key_parts).upper()

    return StandardIdentity(
        prefix=prefix,
        base_number=base_number,
        part_number=part_number,
        section_number=sec_number,
        revision_year=year,
        normalized_key=normalized_key,
    )


def match_standard_identities(
    manifest_id: StandardIdentity,
    bis_id: StandardIdentity,
    ignore_year: bool = False,
) -> Tuple[bool, Optional[str]]:
    """Compare two standard identities. Returns (is_match, mismatch_reason)."""
    # 1. Prefix check (IS vs IS/IEC)
    if manifest_id.prefix.upper() != bis_id.prefix.upper():
        return False, f"Prefix mismatch: manifest={manifest_id.prefix}, bis={bis_id.prefix}"

    # 2. Base number check (must be exact, e.g. 2082 vs 12082 must NEVER match)
    if manifest_id.base_number != bis_id.base_number:
        return False, f"Base number mismatch: manifest={manifest_id.base_number}, bis={bis_id.base_number}"

    # 3. Part number check (Part 1 vs Part 2 or None)
    if (manifest_id.part_number or "").upper() != (bis_id.part_number or "").upper():
        return False, f"Part number mismatch: manifest={manifest_id.part_number}, bis={bis_id.part_number}"

    # 4. Section number check (Sec 3 vs Sec 16 or None)
    if (manifest_id.section_number or "").upper() != (bis_id.section_number or "").upper():
        return False, f"Section number mismatch: manifest={manifest_id.section_number}, bis={bis_id.section_number}"

    # 5. Year check
    if not ignore_year and manifest_id.revision_year and bis_id.revision_year:
        if manifest_id.revision_year != bis_id.revision_year:
            return False, f"Revision year mismatch: manifest={manifest_id.revision_year}, bis={bis_id.revision_year}"

    return True, None


def is_obsolete_or_withdrawn(status_text: Optional[str], title_text: Optional[str]) -> Tuple[bool, Optional[str]]:
    """Check if standard status or title contains indications of obsolescence or withdrawal."""
    combined = f"{status_text or ''} {title_text or ''}".lower()
    patterns = [
        (r"\bwithdrawn\b", "Standard is marked as Withdrawn"),
        (r"\bsuperseded\b", "Standard is marked as Superseded"),
        (r"\bcancelled\b", "Standard is marked as Cancelled"),
        (r"\bobsolete\b", "Standard is marked as Obsolete"),
        (r"\breplaced\b", "Standard is marked as Replaced"),
    ]
    for pat, desc in patterns:
        if re.search(pat, combined):
            return True, desc
    return False, None


def evaluate_manifest_standard(
    manifest_record: Dict[str, Any],
    bis_records: List[Dict[str, Any]],
    category_name: Optional[str] = None,
) -> StandardValidationResult:
    """Evaluate a single manifest record against candidate BIS search results.
    
    Applies exact identity resolution, metadata comparison, ID verification,
    and status/obsolescence checking.
    """
    manifest_is_num = manifest_record.get("is_number", "").strip()
    manifest_std_id = manifest_record.get("standard_id")
    manifest_enc_id = manifest_record.get("standard_enc_id", "").strip()
    manifest_title = manifest_record.get("title", "").strip()
    category = category_name or manifest_record.get("category", "")

    manifest_identity = parse_is_number(manifest_is_num)

    issues: List[str] = []

    # 1. Search for matching candidate in BIS results
    matched_bis_record: Optional[Dict[str, Any]] = None
    best_candidate: Optional[Dict[str, Any]] = None

    # Priority 1: Match by both standard_id and exact IS identity
    for candidate in bis_records:
        cand_std_id = candidate.get("standard_id") or candidate.get("standardId")
        cand_num_str = candidate.get("standard_number") or candidate.get("standardNumber") or ""
        cand_identity = parse_is_number(cand_num_str)

        is_id_match = (manifest_std_id is not None and cand_std_id is not None and manifest_std_id == cand_std_id)
        is_num_match, _ = match_standard_identities(manifest_identity, cand_identity, ignore_year=False)

        if is_id_match and is_num_match:
            matched_bis_record = candidate
            break

    # Priority 2: Match by exact IS identity (including year)
    if not matched_bis_record:
        for candidate in bis_records:
            cand_num_str = candidate.get("standard_number") or candidate.get("standardNumber") or ""
            cand_identity = parse_is_number(cand_num_str)
            is_num_match, _ = match_standard_identities(manifest_identity, cand_identity, ignore_year=False)
            if is_num_match:
                matched_bis_record = candidate
                break

    # Priority 3: Match by exact base/part/sec identity (ignoring year, flagging year difference)
    if not matched_bis_record:
        for candidate in bis_records:
            cand_num_str = candidate.get("standard_number") or candidate.get("standardNumber") or ""
            cand_identity = parse_is_number(cand_num_str)
            is_num_match, _ = match_standard_identities(manifest_identity, cand_identity, ignore_year=True)
            if is_num_match:
                best_candidate = candidate
                break

    # Priority 4: Match by standard_id if identity is close
    if not matched_bis_record and not best_candidate:
        for candidate in bis_records:
            cand_std_id = candidate.get("standard_id") or candidate.get("standardId")
            if manifest_std_id is not None and cand_std_id == manifest_std_id:
                best_candidate = candidate
                break

    resolved_record = matched_bis_record or best_candidate

    if not resolved_record:
        return StandardValidationResult(
            is_number=manifest_is_num,
            manifest_standard_id=manifest_std_id,
            manifest_standard_enc_id=manifest_enc_id,
            manifest_title=manifest_title,
            manifest_category=category,
            resolved=False,
            validation_status=ValidationStatus.UNRESOLVED,
            issues=["Could not resolve standard in BIS catalogue search results"],
        )

    # Extract BIS fields
    bis_id = resolved_record.get("standard_id") or resolved_record.get("standardId")
    bis_enc_id = resolved_record.get("standard_enc_id") or resolved_record.get("standardEncId") or ""
    bis_num = resolved_record.get("standard_number") or resolved_record.get("standardNumber") or ""
    bis_title = clean_text(resolved_record.get("title") or resolved_record.get("standardName") or "")
    bis_dept = clean_text(resolved_record.get("department_name") or resolved_record.get("departmentName") or "")
    bis_committee = clean_text(resolved_record.get("sectional_committee_name") or resolved_record.get("sectionalCommitteeName") or "")
    bis_type = clean_text(resolved_record.get("type_of_standard") or resolved_record.get("typeOfStandardName") or "")
    bis_pub_date = resolved_record.get("published_date") or resolved_record.get("publishedOn") or ""
    bis_formatted_date = clean_text(resolved_record.get("formatted_date") or resolved_record.get("publishedOnFormatted") or "")
    bis_status = clean_text(resolved_record.get("status") or ("Active / Published" if bis_pub_date else "Unknown"))

    # Identity Checks
    resolved_identity = parse_is_number(bis_num)
    is_exact_identity, mismatch_reason = match_standard_identities(manifest_identity, resolved_identity, ignore_year=False)

    if not is_exact_identity:
        issues.append(f"Identity note: {mismatch_reason}")

    # Standard ID check
    id_matched = True
    if manifest_std_id is not None and bis_id is not None:
        if manifest_std_id != bis_id:
            id_matched = False
            issues.append(f"Standard ID mismatch: manifest standard_id={manifest_std_id}, BIS standardId={bis_id}")

    # Standard Encrypted ID check
    if manifest_enc_id and bis_enc_id:
        if manifest_enc_id != bis_enc_id:
            issues.append("Standard Encrypted ID differs from manifest (server-side session/IV rotation)")

    # Obsolescence / Status check
    is_obs, obs_reason = is_obsolete_or_withdrawn(bis_status, bis_title)
    if is_obs and obs_reason:
        issues.append(f"Status alert: {obs_reason}")

    # Metadata Comparisons
    metadata_differences: List[str] = []

    # Title comparison (ignoring minor punctuation/quotes/dashes)
    clean_manifest_title = clean_text(manifest_title)
    if clean_manifest_title and bis_title:
        if clean_manifest_title.lower() != bis_title.lower():
            metadata_differences.append(f"Title variation: manifest='{clean_manifest_title}' vs BIS='{bis_title}'")

    # Department comparison
    manifest_dept = clean_text(manifest_record.get("department", ""))
    if manifest_dept and bis_dept:
        if manifest_dept.lower() != bis_dept.lower():
            metadata_differences.append(f"Department variation: manifest='{manifest_dept}' vs BIS='{bis_dept}'")

    # Committee comparison
    manifest_comm = clean_text(manifest_record.get("committee", ""))
    if manifest_comm and bis_committee:
        if manifest_comm.lower() != bis_committee.lower():
            metadata_differences.append(f"Committee variation: manifest='{manifest_comm}' vs BIS='{bis_committee}'")

    # Publication date comparison
    manifest_pub_date = manifest_record.get("publication_date", "")
    if manifest_pub_date and bis_pub_date:
        if str(manifest_pub_date).strip() != str(bis_pub_date).strip():
            metadata_differences.append(f"Publication date variation: manifest='{manifest_pub_date}' vs BIS='{bis_pub_date}'")

    issues.extend(metadata_differences)

    # Classify overall validation status
    if not id_matched or not is_exact_identity:
        validation_status = ValidationStatus.REQUIRES_MANUAL_REVIEW
        metadata_match = False
    elif metadata_differences:
        validation_status = ValidationStatus.METADATA_CHANGED
        metadata_match = False
    else:
        validation_status = ValidationStatus.EXACT_MATCH
        metadata_match = True

    return StandardValidationResult(
        is_number=manifest_is_num,
        manifest_standard_id=manifest_std_id,
        manifest_standard_enc_id=manifest_enc_id,
        manifest_title=manifest_title,
        manifest_category=category,
        resolved=True,
        bis_standard_id=bis_id,
        bis_standard_enc_id=bis_enc_id,
        bis_standard_number=bis_num,
        title=bis_title or manifest_title,
        department=bis_dept or manifest_dept,
        committee=bis_committee or manifest_comm,
        type=bis_type or manifest_record.get("type"),
        status=bis_status or manifest_record.get("status"),
        publication_date=bis_pub_date or manifest_pub_date,
        formatted_date=bis_formatted_date or manifest_record.get("formatted_date"),
        review_or_reaffirmation=None,
        certification=None,
        metadata_match=metadata_match,
        validation_status=validation_status,
        issues=issues,
    )
