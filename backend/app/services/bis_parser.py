"""Helper parser utilities for official BIS API responses.

Used to parse JSON payloads returned by the Bureau of Indian Standards
microservice endpoints into structured, clean data dictionaries.
"""

from typing import Any, Dict, List, Optional


def parse_groups_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse the groups payload from /project-service/getWebsiteGroupName."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", {})
    if isinstance(data, dict):
        groups = data.get("groups", [])
        return [
            {
                "group_id": g.get("groupId"),
                "group_name": g.get("groupName", "").strip(),
                "encrypted_group_id": g.get("encryptedGroupId", ""),
                "is_current_group": g.get("isCurrentGroup", False),
            }
            for g in groups
            if isinstance(g, dict) and g.get("groupId") is not None
        ]
    return []


def parse_subgroups_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse the subgroups payload from /project-service/getWebsiteSubGroupsByGroupIds."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", {})
    if isinstance(data, dict):
        subgroups = data.get("subGroups", [])
        return [
            {
                "group_id": sg.get("groupId"),
                "sub_group_id": sg.get("subGroupId"),
                "sub_group_name": sg.get("subGroupName", "").strip(),
                "encrypted_sub_group_id": sg.get("encryptedSubGroupId", ""),
            }
            for sg in subgroups
            if isinstance(sg, dict) and sg.get("subGroupId") is not None
        ]
    return []


def parse_departments_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse technical departments from /project-service/getWebsiteTechnicalDepartments."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", [])
    if isinstance(data, list):
        return [
            {
                "department_id": d.get("departmentId") or d.get("DepartmentID"),
                "department_name": (d.get("deptName") or d.get("DepartmentName", "")).strip(),
                "department_code": (d.get("deptAliasName") or d.get("DepartmentCode", "")).strip(),
                "prepared_name": d.get("preparedName", "").strip(),
                "encrypted_department_id": d.get("encryptedDepartmentId", ""),
            }
            for d in data
            if isinstance(d, dict) and (d.get("departmentId") is not None or d.get("DepartmentID") is not None)
        ]
    return []


def parse_standards_list_response(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Parse standards list payload from /proposal-service/getWebsiteIndianStandardsList."""
    if not isinstance(payload, dict):
        return {"total": 0, "page": 1, "page_size": 10, "standards": []}

    total = payload.get("totalRecord", 0)
    page = payload.get("page", 1)
    page_size = payload.get("pageSize", 10)
    raw_list = payload.get("data", [])

    standards = []
    if isinstance(raw_list, list):
        for item in raw_list:
            if not isinstance(item, dict):
                continue
            standards.append({
                "standard_id": item.get("standardId"),
                "standard_enc_id": item.get("standardEncId", ""),
                "standard_number": item.get("standardNumber", "").strip(),
                "title": item.get("standardName", "").strip(),
                "label": item.get("standardLabel", "").strip(),
                "department_name": item.get("departmentName", "").strip(),
                "sectional_committee_name": item.get("sectionalCommitteeName", "").strip(),
                "type_of_standard": item.get("typeOfStandardName", "").strip(),
                "published_date": item.get("publishedOn"),
                "formatted_date": item.get("publishedOnFormatted", "").strip(),
            })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "standards": standards,
    }


def parse_laboratories_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse standard laboratories from /review-service/getStandardLaboratoryDetails."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", [])
    labs = []
    if isinstance(data, list):
        for lab in data:
            if not isinstance(lab, dict):
                continue
            labs.append({
                "id": lab.get("id"),
                "lab_name": lab.get("labName", "").strip(),
                "osl_code": lab.get("oslCode", "").strip(),
                "bis_code": lab.get("bisCode", "").strip(),
                "lab_type": lab.get("labType", "").strip(),
                "contact_person": lab.get("contactPerson", "").strip(),
                "contact_number": lab.get("contactNumber", "").strip(),
                "lab_email": lab.get("labEmail", "").strip(),
                "address": lab.get("labAddress", "").strip(),
                "district": lab.get("district", "").strip(),
                "state": lab.get("state", "").strip(),
                "pincode": lab.get("pincode", "").strip(),
                "validity_date": lab.get("validityDate"),
            })
    return labs


def parse_licenses_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse standard licenses from /review-service/getStandardLicenseDetails."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", [])
    licenses = []
    if isinstance(data, list):
        for lic in data:
            if not isinstance(lic, dict):
                continue
            licenses.append({
                "license_no": lic.get("licenseNo", "").strip(),
                "firm_name": lic.get("firmName", "").strip(),
                "firm_address": lic.get("firmAddress", "").strip(),
                "district": lic.get("district", "").strip(),
                "state": lic.get("state", "").strip(),
                "validity_date": lic.get("validityDate"),
                "status": lic.get("status", "").strip(),
                "scale": lic.get("scale", "").strip(),
            })
    return licenses


def parse_standard_details_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse standard details payload from /proposal-service/getStandardsWithDeptAndCommittee."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", [])
    if not isinstance(data, list):
        return []
    results = []
    for item in data:
        if not isinstance(item, dict):
            continue
        results.append({
            "standard_id": item.get("standardId"),
            "pk_is_id": item.get("pk_is_id"),
            "standard_enc_id": item.get("standardEncId", ""),
            "standard_number": item.get("standardNumber", "").strip(),
            "title": item.get("standardName", "").strip(),
            "department_id": item.get("departmentId"),
            "department_name": item.get("deptPreparedName", "").strip(),
            "committee_id": item.get("committeeId"),
            "committee_name": item.get("secCommitteePreparedName", "").strip(),
            "review_id": item.get("reviewId", ""),
        })
    return results


def parse_amendments_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse amendment records from /review-service/getAmendmentDetails."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", [])
    if not isinstance(data, list):
        return []
    amendments = []
    for item in data:
        if not isinstance(item, dict):
            continue
        amendments.append({
            "standard_id": item.get("standardId"),
            "standard_number": item.get("standardNumber", "").strip(),
            "amendment_number": item.get("noOfAmendment") or 1,
            "amendment_year": str(item.get("amendmentYear", "")).strip() if item.get("amendmentYear") else None,
            "amendment_label": item.get("amendmentLabel", "").strip() or f"Amendment {item.get('noOfAmendment', 1)}",
            "document_path": item.get("is_documents", "").strip(),
        })
    return amendments


def parse_gazette_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse statutory Gazette notifications from /review-service/getGazettedetails."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", [])
    if not isinstance(data, list):
        return []
    gazettes = []
    for item in data:
        if not isinstance(item, dict):
            continue
        raw_so = item.get("So_No")
        so_no = str(raw_so).strip() if raw_so is not None else ""
        if not so_no:
            continue
        raw_migrated = item.get("migratedFiles")
        migrated = str(raw_migrated).strip() if raw_migrated is not None else ""
        raw_std_num = item.get("standardNumber")
        std_num = str(raw_std_num).strip() if raw_std_num is not None else ""
        gazettes.append({
            "so_number": so_no,
            "pki_id": item.get("pki_id"),
            "amendment_number": item.get("Amd_No", 0),
            "gazette_file": migrated,
            "is_no": item.get("IS_NO"),
            "standard_number": std_num,
            "standard_id": item.get("standardId"),
        })
    return gazettes


def parse_product_manual_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse product manual documents from /review-service/getProductManualDetails."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", {})
    if isinstance(data, dict):
        manuals = data.get("product_manuals_details", [])
    elif isinstance(data, list):
        manuals = data
    else:
        manuals = []

    parsed = []
    for item in manuals:
        if not isinstance(item, dict):
            continue
        parsed.append({
            "pk_is_id": str(item.get("pk_is_id", "")).strip(),
            "is_number": item.get("is_number", "").strip(),
            "file_path": item.get("file_path", "").strip(),
        })
    return parsed


def parse_crs_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse Compulsory Registration Scheme details from /review-service/getStandardCRSDetails."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", [])
    if not isinstance(data, list):
        return []
    return [item for item in data if isinstance(item, dict)]


def parse_mcs_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse Management Systems Certification details from /review-service/getStandardMCSDetails."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", [])
    if not isinstance(data, list):
        return []
    return [item for item in data if isinstance(item, dict)]


def parse_cross_references_response(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse cross references from /review-service/getCrossRefDetails."""
    if not isinstance(payload, dict):
        return []
    data = payload.get("data", {})
    if not isinstance(data, dict):
        return []
    cross_refs = data.get("crossRefData", [])
    if not isinstance(cross_refs, list):
        return []
    parsed = []
    for item in cross_refs:
        if not isinstance(item, dict):
            continue
        parsed.append({
            "referred_is_number": item.get("referredStandardNumber", "").strip(),
            "referred_title": item.get("referredStandardName", "").strip(),
            "clause_reference": item.get("clauseNo", "").strip(),
        })
    return parsed


