"""Pydantic schemas for Phase 9: Official BIS Standard Detail API & RAG Enrichment.

Represents structured, normalized official BIS Standard Details retrieved from
official BIS microservices (proposal-service, review-service, project-service)
with strict provenance, verification status, and RAG chunking capabilities.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DetailDataStatus(str, Enum):
    """Controlled status of retrieved standard detail section."""
    VERIFIED = "verified"
    UNAVAILABLE = "unavailable"
    FAILED = "failed"


class StandardDetailSectionType(str, Enum):
    """Enumeration of official BIS Standard Detail tabs / sections."""
    BASIC_DETAILS = "basic_details"
    DEPARTMENT_COMMITTEE = "department_committee"
    AMENDMENTS = "amendments"
    GAZETTE = "gazette"
    PRODUCT_MANUAL = "product_manual"
    LABORATORIES = "laboratories"
    LICENSES = "licenses"
    CERTIFICATION_CRS = "certification_crs"
    CERTIFICATION_MCS = "certification_mcs"
    STANDARDS_REFERRED = "standards_referred"
    SUMMARY = "summary"


class BasicDetailData(BaseModel):
    """Structured basic metadata for an Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    standard_id: Optional[int] = Field(default=None, description="Official BIS standard ID")
    pk_is_id: Optional[int] = Field(default=None, description="Internal primary standard key")
    standard_number: str = Field(..., description="Official standard number (e.g. IS 2082:2018)")
    title: str = Field(..., description="Official full title of standard")
    standard_enc_id: Optional[str] = Field(default=None, description="Encrypted standard ID")


class DepartmentCommitteeData(BaseModel):
    """Department and technical committee governance metadata."""
    model_config = ConfigDict(from_attributes=True)

    department_id: Optional[int] = Field(default=None, description="Department ID")
    department_name: Optional[str] = Field(default=None, description="Official department name")
    committee_id: Optional[int] = Field(default=None, description="Sectional committee ID")
    committee_name: Optional[str] = Field(default=None, description="Official technical committee name")


class AmendmentItem(BaseModel):
    """Amendment record issued for an Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    amendment_number: int = Field(..., description="Amendment sequence number")
    amendment_year: Optional[str] = Field(default=None, description="Year amendment was published")
    amendment_label: Optional[str] = Field(default=None, description="Label (e.g. First Amendment)")
    document_path: Optional[str] = Field(default=None, description="Relative document path on BIS portal")


class GazetteItem(BaseModel):
    """Statutory Gazette notification details."""
    model_config = ConfigDict(from_attributes=True)

    so_number: str = Field(..., description="Statutory Order (S.O.) Number")
    pki_id: Optional[int] = Field(default=None, description="Internal record ID")
    amendment_number: Optional[int] = Field(default=0, description="Associated amendment number")
    gazette_file: Optional[str] = Field(default=None, description="Gazette notification PDF path")


class ProductManualItem(BaseModel):
    """BIS Product Manual reference details."""
    model_config = ConfigDict(from_attributes=True)

    pk_is_id: Optional[str] = Field(default=None, description="Associated standard PK")
    is_number: Optional[str] = Field(default=None, description="IS number in manual")
    file_path: Optional[str] = Field(default=None, description="Product manual document path")


class LaboratoryItem(BaseModel):
    """Accredited testing laboratory for this standard."""
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = Field(default=None, description="Lab record ID")
    lab_name: str = Field(..., description="Official recognized laboratory name")
    osl_code: Optional[str] = Field(default=None, description="OSL code")
    bis_code: Optional[str] = Field(default=None, description="BIS internal code")
    lab_type: Optional[str] = Field(default=None, description="Laboratory type (e.g. osl / bis)")
    contact_person: Optional[str] = Field(default=None, description="Designated contact person")
    contact_number: Optional[str] = Field(default=None, description="Phone/mobile number")
    lab_email: Optional[str] = Field(default=None, description="Official email address")
    address: Optional[str] = Field(default=None, description="Physical address")
    district: Optional[str] = Field(default=None, description="District")
    state: Optional[str] = Field(default=None, description="State")
    validity_date: Optional[str] = Field(default=None, description="Accreditation validity date")


class LicenseItem(BaseModel):
    """Active manufacturer license under ISI mark scheme for this standard."""
    model_config = ConfigDict(from_attributes=True)

    license_no: str = Field(..., description="Official CM/L or license number")
    firm_name: str = Field(..., description="Name of licensed manufacturing firm")
    firm_address: Optional[str] = Field(default=None, description="Factory / firm location")
    district: Optional[str] = Field(default=None, description="District")
    state: Optional[str] = Field(default=None, description="State")
    validity_date: Optional[str] = Field(default=None, description="License validity date")
    status: Optional[str] = Field(default=None, description="Operational status (e.g. Operative)")
    scale: Optional[str] = Field(default=None, description="Enterprise scale (e.g. Small / Medium / Large)")


class CrossReferenceItem(BaseModel):
    """Referred or cross-referenced Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    referred_is_number: str = Field(..., description="Referred IS Number")
    referred_title: Optional[str] = Field(default=None, description="Title of referred standard")
    clause_reference: Optional[str] = Field(default=None, description="Clause where standard is referenced")


class StandardDetailSection(BaseModel):
    """Container for an individual tabbed section of standard details."""
    model_config = ConfigDict(from_attributes=True)

    section_name: str = Field(..., description="Section identifier key")
    section_title: str = Field(..., description="Display title of the section / tab")
    data_status: DetailDataStatus = Field(
        default=DetailDataStatus.UNAVAILABLE,
        description="Verification and availability status"
    )
    item_count: int = Field(default=0, description="Number of items present in this section")
    items: List[Dict[str, Any]] = Field(default_factory=list, description="Raw/structured items list")
    summary_text: Optional[str] = Field(default=None, description="Natural language summary of section data")
    source_endpoint: str = Field(..., description="Official BIS microservice endpoint used")


class OfficialStandardDetailDocument(BaseModel):
    """Comprehensive, normalized representation of an Indian Standard's official details.
    
    Acts as the primary structured data object for RAG context assembly, semantic retrieval,
    and verified technical answering.
    """
    model_config = ConfigDict(from_attributes=True)

    source: str = Field(default="BIS", description="Official authoritative source")
    source_type: str = Field(
        default="official_bis_standard_details",
        description="Standardized source type identifier"
    )
    standard_id: Optional[int] = Field(default=None, description="Unique numeric standard ID")
    standard_enc_id: Optional[str] = Field(default=None, description="Encrypted BIS standard identifier")
    is_number: str = Field(..., description="Indian Standard identifier (e.g. IS 2082:2018)")
    title: str = Field(..., description="Official standard title")
    category: str = Field(..., description="Corpus domain category")
    official_bis_url: str = Field(
        default="https://standards.bis.gov.in/website/published-standards/published-standards-list",
        description="Authoritative BIS portal URL"
    )
    retrieved_at: str = Field(..., description="ISO 8601 retrieval timestamp")
    verification_status: str = Field(
        default="verified",
        description="Overall document verification status (verified / unavailable / failed)"
    )
    sections: Dict[str, StandardDetailSection] = Field(
        default_factory=dict,
        description="Dictionary of normalized tabbed sections"
    )

    def to_rag_text(self) -> str:
        """Converts structured sections into a deterministic, grounded markdown text representation."""
        lines = [
            f"# Official BIS Standard Details: {self.is_number}",
            f"**Title:** {self.title}",
            f"**Domain Category:** {self.category}",
            f"**Verification Status:** {self.verification_status.upper()} (Source: {self.source} - {self.source_type})",
            f"**Authoritative Portal:** {self.official_bis_url}",
            f"**Retrieved At:** {self.retrieved_at}",
            "",
        ]

        for sec_key, sec in self.sections.items():
            lines.append(f"## Section: {sec.section_title}")
            lines.append(f"**Data Status:** {sec.data_status.value.upper()} | **Endpoint:** `{sec.source_endpoint}`")
            if sec.summary_text:
                lines.append(f"{sec.summary_text}")

            if sec.data_status == DetailDataStatus.VERIFIED and sec.items:
                if sec_key == StandardDetailSectionType.DEPARTMENT_COMMITTEE.value:
                    item = sec.items[0] if sec.items else {}
                    dept = item.get("department_name") or item.get("deptPreparedName") or "N/A"
                    comm = item.get("committee_name") or item.get("secCommitteePreparedName") or "N/A"
                    lines.append(f"- **Department:** {dept}")
                    lines.append(f"- **Technical Committee:** {comm}")

                elif sec_key == StandardDetailSectionType.AMENDMENTS.value:
                    lines.append(f"- Total Amendments Issued: {len(sec.items)}")
                    for amd in sec.items[:5]:
                        num = amd.get("amendment_number") or amd.get("noOfAmendment") or "1"
                        yr = amd.get("amendment_year") or "N/A"
                        lbl = amd.get("amendment_label") or f"Amendment {num}"
                        lines.append(f"  • {lbl} (Year: {yr})")

                elif sec_key == StandardDetailSectionType.GAZETTE.value:
                    lines.append(f"- Statutory Gazette Notifications: {len(sec.items)}")
                    for gz in sec.items[:5]:
                        so = gz.get("so_number") or gz.get("So_No") or "N/A"
                        lines.append(f"  • Statutory Order (S.O.): {so.strip()}")

                elif sec_key == StandardDetailSectionType.PRODUCT_MANUAL.value:
                    lines.append(f"- BIS Product Manuals Available: {len(sec.items)}")
                    for pm in sec.items[:3]:
                        fp = pm.get("file_path") or "Available on BIS Portal"
                        lines.append(f"  • Reference: {fp}")

                elif sec_key == StandardDetailSectionType.LABORATORIES.value:
                    lines.append(f"- Recognized Testing Laboratories Sample ({len(sec.items)} total):")
                    for lab in sec.items[:4]:
                        name = lab.get("lab_name") or lab.get("labName") or "Laboratory"
                        loc = f"{lab.get('district', '')}, {lab.get('state', '')}".strip(", ")
                        lines.append(f"  • **{name}** ({loc or 'India'})")

                elif sec_key == StandardDetailSectionType.LICENSES.value:
                    lines.append(f"- Active Manufacturer Licensees Sample ({len(sec.items)} total):")
                    for lic in sec.items[:4]:
                        firm = lic.get("firm_name") or lic.get("firmName") or "Licensed Manufacturer"
                        lic_no = lic.get("license_no") or lic.get("licenseNo") or "N/A"
                        state = lic.get("state") or "India"
                        lines.append(f"  • **{firm}** (Lic: {lic_no}, State: {state})")

            elif sec.data_status == DetailDataStatus.UNAVAILABLE or not sec.items:
                lines.append("*(No separate records published under this section for this standard in official BIS microservices)*")

            lines.append("")

        return "\n".join(lines).strip()

    def to_rag_chunks(self) -> List[Dict[str, Any]]:
        """Splits the normalized document into granular RAG chunks compatible with HybridRetriever."""
        chunks: List[Dict[str, Any]] = []

        # 1. Overview chunk
        overview_text = (
            f"Official BIS Standard Detail Overview for {self.is_number} ({self.title}). "
            f"Category: {self.category}. Source: Official BIS Standard Details ({self.official_bis_url})."
        )
        dept_sec = self.sections.get(StandardDetailSectionType.DEPARTMENT_COMMITTEE.value)
        if dept_sec and dept_sec.items:
            item = dept_sec.items[0]
            dept = item.get("department_name") or item.get("deptPreparedName") or ""
            comm = item.get("committee_name") or item.get("secCommitteePreparedName") or ""
            if dept:
                overview_text += f" Governing Department: {dept}."
            if comm:
                overview_text += f" Technical Committee: {comm}."

        chunks.append({
            "chunk_id": f"chunk-{self.is_number.replace(' ', '_').replace(':', '_')}-overview",
            "is_number": self.is_number,
            "title": self.title,
            "category": self.category,
            "clause": "Official Details Overview",
            "section": "Basic Details & Governance",
            "text": overview_text,
            "chunk_type": "standard_details_overview",
            "source": self.source,
            "source_type": self.source_type,
            "verification_status": self.verification_status,
            "retrieved_at": self.retrieved_at,
        })

        # 2. Amendments & Gazette chunk
        amd_sec = self.sections.get(StandardDetailSectionType.AMENDMENTS.value)
        gaz_sec = self.sections.get(StandardDetailSectionType.GAZETTE.value)
        pm_sec = self.sections.get(StandardDetailSectionType.PRODUCT_MANUAL.value)

        compliance_text_parts = [f"Official Compliance & Gazette status for {self.is_number} ({self.title}):"]
        if amd_sec and amd_sec.items:
            compliance_text_parts.append(f"Amendments published: {len(amd_sec.items)} total.")
            for a in amd_sec.items[:3]:
                lbl = a.get("amendment_label") or f"Amendment {a.get('amendment_number', '')}"
                yr = a.get("amendment_year") or ""
                compliance_text_parts.append(f"- {lbl} ({yr})")
        else:
            compliance_text_parts.append("No separate amendments recorded.")

        if gaz_sec and gaz_sec.items:
            compliance_text_parts.append(f"Statutory Gazette notifications: {len(gaz_sec.items)}.")
            for g in gaz_sec.items[:3]:
                so = g.get("so_number") or g.get("So_No") or ""
                if so:
                    compliance_text_parts.append(f"- S.O. Number: {so.strip()}")

        if pm_sec and pm_sec.items:
            compliance_text_parts.append("Official BIS Product Manual is available for testing/certification guidelines.")

        chunks.append({
            "chunk_id": f"chunk-{self.is_number.replace(' ', '_').replace(':', '_')}-compliance",
            "is_number": self.is_number,
            "title": self.title,
            "category": self.category,
            "clause": "Statutory Gazette & Amendments",
            "section": "Amendments & Certification Documentation",
            "text": " ".join(compliance_text_parts),
            "chunk_type": "standard_details_compliance",
            "source": self.source,
            "source_type": self.source_type,
            "verification_status": self.verification_status,
            "retrieved_at": self.retrieved_at,
        })

        # 3. Laboratories & Licenses chunk
        lab_sec = self.sections.get(StandardDetailSectionType.LABORATORIES.value)
        lic_sec = self.sections.get(StandardDetailSectionType.LICENSES.value)

        infra_parts = [f"Testing Laboratories & License infrastructure for {self.is_number}:"]
        if lab_sec and lab_sec.items:
            infra_parts.append(f"Recognized testing labs: {len(lab_sec.items)} accredited facilities.")
            for l in lab_sec.items[:3]:
                nm = l.get("lab_name") or l.get("labName") or ""
                st = l.get("state") or ""
                infra_parts.append(f"- {nm} ({st})")
        else:
            infra_parts.append("Laboratory details queried from BIS microservice.")

        if lic_sec and lic_sec.items:
            infra_parts.append(f"Active operative licenses: {len(lic_sec.items)} manufacturers holding ISI certification.")
            for c in lic_sec.items[:3]:
                fn = c.get("firm_name") or c.get("firmName") or ""
                infra_parts.append(f"- {fn}")

        chunks.append({
            "chunk_id": f"chunk-{self.is_number.replace(' ', '_').replace(':', '_')}-infrastructure",
            "is_number": self.is_number,
            "title": self.title,
            "category": self.category,
            "clause": "Laboratory Testing & Licenses",
            "section": "Testing & Conformance Infrastructure",
            "text": " ".join(infra_parts),
            "chunk_type": "standard_details_infrastructure",
            "source": self.source,
            "source_type": self.source_type,
            "verification_status": self.verification_status,
            "retrieved_at": self.retrieved_at,
        })

        return chunks
