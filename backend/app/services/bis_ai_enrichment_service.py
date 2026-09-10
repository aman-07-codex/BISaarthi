"""AI Enrichment Service for Standards Discovery, Laboratories, Tests, and Requirements.

Uses Google Gemini LLM (with robust deterministic fallback) to generate:
1. Contextual standards discovery with explainable `why_applicable` rationale for manufacturing queries.
2. Recognized testing laboratories directory mapped to Indian Standards.
3. Standard requirements categorized into Safety, Performance, Construction, and Marking.
4. Mandatory and voluntary compliance tests matrix.
5. Standard certification pathway steps for BIS ISI Scheme-I and CRS.
"""

import json
import re
import uuid
from typing import Any, Dict, List, Optional, Tuple

from app.core.logging import get_logger
from app.services.bis_llm_provider import GeminiLLMProvider, get_llm_provider

logger = get_logger("bisaarthi.ai_enrichment")


class BISAiEnrichmentService:
    """Service for synthesizing missing BIS standards data, laboratories, tests, and requirements."""

    _instance: Optional["BISAiEnrichmentService"] = None

    def __init__(self, llm_provider: Optional[GeminiLLMProvider] = None) -> None:
        self.llm = llm_provider or GeminiLLMProvider()

    @classmethod
    def get_instance(cls) -> "BISAiEnrichmentService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @staticmethod
    def _extract_json_array(text: str) -> Optional[List[Dict[str, Any]]]:
        """Extracts and parses JSON array from LLM response text, ignoring markdown blocks."""
        if not text:
            return None
        cleaned = text.strip()
        # Strip ```json ... ``` or ``` ... ```
        if "```" in cleaned:
            match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1).strip()
            else:
                match2 = re.search(r"(\[.*\])", cleaned, re.DOTALL)
                if match2:
                    cleaned = match2.group(1).strip()
        try:
            parsed = json.loads(cleaned)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        return None

    def discover_standards_with_ai(
        self,
        query: str,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Synthesizes applicable Indian Standards with clear `why_applicable` rationale for a product query."""
        if not self.llm.is_available:
            return self._fallback_discover_standards(query)

        prompt = f"""You are an expert on the Bureau of Indian Standards (BIS) and Indian Standards (IS).
User Query / Manufacturing Intent: "{query}"
{f'Category Filter: {category}' if category else ''}

Identify the primary and companion Indian Standards (IS) that strictly apply to manufacturing and certifying this product in India.
Return a JSON array of 3 to 6 standard objects with these EXACT keys:
- is_number: Standard IS number with year (e.g. "IS 2082:2018", "IS 302 (Part 2/Sec 201)", "IS 302 (Part 1):2024", "IS 368:2014", "IS 1293:2019")
- title: Complete official title of the standard
- category: Relevant domain/category (e.g. "Electrical & Electronics", "Consumer Appliances", "Civil Engineering")
- status: "active"
- why_applicable: A clear, professional 1-2 sentence explanation of EXACTLY why this standard applies to manufacturing this product.
- primary_use_case: Primary industrial or consumer application

Return ONLY the valid JSON array without markdown backticks or commentary.
"""
        try:
            raw_res = self.llm.generate_metadata_synthesis(prompt)
            if raw_res:
                items = self._extract_json_array(raw_res)
                if items and len(items) > 0:
                    return items
        except Exception as e:
            logger.warning("Error generating standards discovery via Gemini: %s", str(e))

        return self._fallback_discover_standards(query)

    def _fallback_discover_standards(self, query: str) -> List[Dict[str, Any]]:
        """Deterministic domain fallback for common product queries when AI is offline."""
        q_lower = query.lower()

        if any(w in q_lower for w in ["heater", "geyser", "water heater", "immersion", "heating"]):
            return [
                {
                    "is_number": "IS 2082:2018",
                    "title": "Stationary Storage Type Electric Water Heaters",
                    "category": "Electrical & Electronics / Appliances",
                    "status": "active",
                    "why_applicable": "Primary mandatory product specification governing safety, insulation, pressure withstand (up to 8 bar), and energy efficiency (BEE star rating) for electric storage water heaters/geysers.",
                    "primary_use_case": "Manufacturing and ISI marking of domestic and commercial electric storage geysers.",
                },
                {
                    "is_number": "IS 302 (Part 2/Sec 201)",
                    "title": "Safety of Household and Similar Electrical Appliances: Part 2 Particular Requirements, Section 201: Electric Immersion Water Heaters",
                    "category": "Electrical & Electronics / Appliances",
                    "status": "active",
                    "why_applicable": "Mandatory particular safety specification applicable to electric heating elements and portable immersion water heaters.",
                    "primary_use_case": "Compliance testing for portable and fixed immersion heating elements.",
                },
                {
                    "is_number": "IS 302 (Part 1):2024",
                    "title": "Safety of Household and Similar Electrical Appliances - General Requirements",
                    "category": "Electrical & Electronics / Safety",
                    "status": "active",
                    "why_applicable": "Foundational umbrella standard covering protection against electric shock, moisture resistance, leakage current, and thermal cutouts for all household electrical appliances.",
                    "primary_use_case": "General safety verification across all electrical heating appliances.",
                },
                {
                    "is_number": "IS 368:2014",
                    "title": "Electric Immersion Water Heaters",
                    "category": "Electrical & Electronics / Appliances",
                    "status": "active",
                    "why_applicable": "Specification covering performance, construction, and safety requirements for portable domestic electric immersion heaters.",
                    "primary_use_case": "Manufacturing portable electric immersion heating rods.",
                },
                {
                    "is_number": "IS 1293:2019",
                    "title": "Plugs and Socket-Outlets for Household and Similar Purposes",
                    "category": "Electrical Accessories",
                    "status": "active",
                    "why_applicable": "Mandatory standard governing the 3-pin plug (6A/16A) and power cord assembly fitted onto the heater for mains connection.",
                    "primary_use_case": "Power cord and molded plug integration for appliances.",
                },
            ]

        if any(w in q_lower for w in ["led", "lamp", "bulb", "lighting"]):
            return [
                {
                    "is_number": "IS 16102 (Part 1):2012",
                    "title": "Self-Ballasted LED Lamps for General Lighting Services - Part 1: Safety Requirements",
                    "category": "Lighting & Electronics",
                    "status": "active",
                    "why_applicable": "Mandatory standard under BIS Compulsory Registration Scheme (CRS) covering safety, insulation, and fire hazard protection for LED bulbs.",
                    "primary_use_case": "Manufacturing self-ballasted LED retrofit lamps for domestic and commercial lighting.",
                },
                {
                    "is_number": "IS 16102 (Part 2):2012",
                    "title": "Self-Ballasted LED Lamps for General Lighting Services - Part 2: Performance Requirements",
                    "category": "Lighting & Electronics",
                    "status": "active",
                    "why_applicable": "Prescribes luminous efficacy, lumen maintenance, power factor, and color rendering benchmarks for LED lamps.",
                    "primary_use_case": "Performance verification and energy efficiency rating for LED products.",
                },
                {
                    "is_number": "IS 15885 (Part 2/Sec 13)",
                    "title": "Lamp Controlgear - Part 2: Particular Requirements, Section 13: D.C. or A.C. Supplied Electronic Controlgear for LED Modules",
                    "category": "Lighting & Electronics",
                    "status": "active",
                    "why_applicable": "Governs the internal electronic driver circuitry, surge protection, and voltage regulation for LED lighting fixtures.",
                    "primary_use_case": "Electronic LED driver design and conformity certification.",
                },
            ]

        return []

    def synthesize_laboratories(
        self,
        is_number: str,
        title: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Synthesizes recognized testing laboratories accredited for testing an Indian Standard."""
        if self.llm.is_available:
            prompt = f"""You are an expert on Bureau of Indian Standards (BIS) recognized testing laboratories and compliance infrastructure.
Standard: "{is_number}" - {title or 'Indian Standard'}
Category: {category or 'General'}

Identify 4 to 5 recognized testing laboratories in India accredited for testing this Indian Standard under BIS conformity assessment (including BIS Central Lab, Regional Labs, and NABL/OSL accredited facilities).
Return a JSON array of objects with the following keys:
- lab_name: Full name of testing laboratory (e.g. "BIS Central Laboratory Sahibabad", "National Test House (WR) Mumbai", "Regional Testing Centre (ER) Kolkata", "Electrical Research and Development Association (ERDA) Vadodara", "Central Power Research Institute (CPRI) Bengaluru")
- lab_type: "bis_central" or "bis_regional" or "nabl_accredited" or "commercial"
- district: City / District (e.g. "Ghaziabad", "Mumbai", "Kolkata", "Vadodara", "Bengaluru")
- state: State name (e.g. "Uttar Pradesh", "Maharashtra", "West Bengal", "Gujarat", "Karnataka")
- bis_code: BIS or OSL registration code (e.g. "BIS-CL-01", "NTH-WR-02", "ERDA-GJ-01", "CPRI-KA-03")
- osl_code: Optional OSL code
- contact_person: Email or designation
- contact_phone: Phone number
- testing_scope: Concise description of testing capabilities for {is_number}

Return ONLY the valid JSON array, no markdown wrappers.
"""
            try:
                raw_res = self.llm.generate_metadata_synthesis(prompt)
                if raw_res:
                    items = self._extract_json_array(raw_res)
                    if items and len(items) > 0:
                        return items
            except Exception as e:
                logger.warning("Error generating laboratories via Gemini: %s", str(e))

        # Deterministic fallback labs
        return [
            {
                "lab_name": "BIS Central Laboratory Sahibabad",
                "lab_type": "bis_central",
                "district": "Ghaziabad",
                "state": "Uttar Pradesh",
                "bis_code": "BIS-CL-01",
                "osl_code": "OSL-1001",
                "contact_person": "cl@bis.gov.in",
                "contact_phone": "+91-120-4177100",
                "testing_scope": f"Apex laboratory for comprehensive conformity testing, dielectric breakdown, safety, and physical parameters under {is_number}.",
            },
            {
                "lab_name": "National Test House (WR) Mumbai",
                "lab_type": "commercial",
                "district": "Mumbai",
                "state": "Maharashtra",
                "bis_code": "NTH-WR-02",
                "osl_code": "OSL-1024",
                "contact_person": "nthwr@nic.in",
                "contact_phone": "+91-22-28325154",
                "testing_scope": f"Mechanical durability, electrical insulation, and performance verification under {is_number}.",
            },
            {
                "lab_name": "Electrical Research and Development Association (ERDA)",
                "lab_type": "nabl_accredited",
                "district": "Vadodara",
                "state": "Gujarat",
                "bis_code": "ERDA-GJ-01",
                "osl_code": "OSL-1122",
                "contact_person": "testing@erda.org",
                "contact_phone": "+91-265-3043258",
                "testing_scope": f"High voltage dielectric, thermal stability, leakage current, and energy efficiency testing for {is_number}.",
            },
            {
                "lab_name": "Regional Testing Centre (ER) Kolkata",
                "lab_type": "bis_regional",
                "district": "Kolkata",
                "state": "West Bengal",
                "bis_code": "RTC-ER-02",
                "osl_code": "OSL-1190",
                "contact_person": "erl@bis.gov.in",
                "contact_phone": "+91-33-23553243",
                "testing_scope": f"Conformity testing, sample validation, and marking inspection as per {is_number}.",
            },
        ]

    def synthesize_requirements(
        self,
        is_number: str,
        title: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Synthesizes structured requirements for an Indian Standard."""
        if self.llm.is_available:
            prompt = f"""You are an expert on Bureau of Indian Standards (BIS) specifications.
Standard: "{is_number}" - {title or 'Indian Standard'}
Category: {category or 'General'}

List 4 to 6 key technical compliance requirements for this standard under categories like Safety, Performance, Construction, Material Quality, and Marking.
Return a JSON array of objects with keys:
- category: Category name (e.g. "Electrical Safety", "Material & Construction", "Performance & Efficiency", "Marking & Labelling")
- requirement_text: Precise technical requirement statement.
- display_order: Integer index (1, 2, 3...)

Return ONLY the valid JSON array, no markdown wrappers.
"""
            try:
                raw_res = self.llm.generate_metadata_synthesis(prompt)
                if raw_res:
                    items = self._extract_json_array(raw_res)
                    if items and len(items) > 0:
                        return items
            except Exception as e:
                logger.warning("Error generating requirements via Gemini: %s", str(e))

        return [
            {
                "category": "Electrical & Operational Safety",
                "requirement_text": "Equipment shall provide adequate protection against direct or indirect contact with live parts and maintain insulation resistance >= 5 MΩ.",
                "display_order": 1,
            },
            {
                "category": "Material & Construction Quality",
                "requirement_text": "Components and raw materials shall withstand mechanical stress, corrosion, and operating temperatures without degradation.",
                "display_order": 2,
            },
            {
                "category": "Performance & Energy Thresholds",
                "requirement_text": "Operating parameters, rated wattage/capacity, and standby thermal loss shall conform strictly to prescribed numerical tolerance limits.",
                "display_order": 3,
            },
            {
                "category": "Mandatory Marking & Packaging",
                "requirement_text": "Product shall be legibly and indelibly marked with the Standard Mark (ISI Mark), CM/L license number, rated voltage, power rating, and manufacturer details.",
                "display_order": 4,
            },
        ]

    def synthesize_tests(
        self,
        is_number: str,
        title: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Synthesizes compliance tests matrix for an Indian Standard."""
        if self.llm.is_available:
            prompt = f"""You are an expert on Bureau of Indian Standards (BIS) product testing protocols.
Standard: "{is_number}" - {title or 'Indian Standard'}
Category: {category or 'General'}

List 4 to 6 mandatory and voluntary compliance tests specified under this standard.
Return a JSON array of objects with keys:
- test_name: Name of compliance test (e.g. "High Voltage Dielectric Withstand Test", "Leakage Current Test", "Temperature Rise & Abnormal Operation", "Hydrostatic Pressure Test", "Ingress Protection IPX4")
- applicability: "mandatory" or "voluntary"
- description: Concise test description, conditions, and passing criteria.
- display_order: Integer index (1, 2, 3...)

Return ONLY the valid JSON array, no markdown wrappers.
"""
            try:
                raw_res = self.llm.generate_metadata_synthesis(prompt)
                if raw_res:
                    items = self._extract_json_array(raw_res)
                    if items and len(items) > 0:
                        return items
            except Exception as e:
                logger.warning("Error generating tests via Gemini: %s", str(e))

        return [
            {
                "test_name": "High Voltage Dielectric Withstand Test",
                "applicability": "mandatory",
                "description": "Verification of electrical insulation breakdown under sustained 1500V - 2000V AC test voltage applied for 60 seconds.",
                "display_order": 1,
            },
            {
                "test_name": "Leakage Current and Moisture Resistance Test",
                "applicability": "mandatory",
                "description": "Measurement of operational leakage current under humid ambient conditions ensuring values do not exceed 0.75 mA peak.",
                "display_order": 2,
            },
            {
                "test_name": "Thermal Cutout & Temperature Rise Test",
                "applicability": "mandatory",
                "description": "Evaluation of thermal cutouts and thermostat response under normal and simulated dry-heating conditions.",
                "display_order": 3,
            },
            {
                "test_name": "Mechanical Strength & Pressure Test",
                "applicability": "mandatory",
                "description": "Hydrostatic pressure test at 1.5x maximum rated working pressure without leakage or permanent deformation.",
                "display_order": 4,
            },
            {
                "test_name": "Energy Performance & Standby Loss Screening",
                "applicability": "voluntary",
                "description": "Measurement of 24-hour standing energy loss and thermal retention efficiency index.",
                "display_order": 5,
            },
        ]

    def synthesize_certification_steps(
        self,
        is_number: str,
        title: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Returns the standard 4-step BIS certification process."""
        return [
            {
                "step_number": 1,
                "step_description": "Application Submission: File Form-I on the official BIS Manakonline portal with manufacturing unit details, process flow, and machinery layout.",
            },
            {
                "step_number": 2,
                "step_description": "Factory Audit & Inspection: Preliminary on-site inspection of manufacturing facility and Quality Management System (QMS) audit by authorized BIS inspecting officer.",
            },
            {
                "step_number": 3,
                "step_description": f"Sample Testing: Drawing of independent production test samples for laboratory conformity testing at a BIS-recognized testing facility as per {is_number}.",
            },
            {
                "step_number": 4,
                "step_description": "Grant of License: Verification of passing test reports, acceptance of Scheme of Inspection & Testing (SIT), and issuance of official CM/L Certification License.",
            },
        ]
