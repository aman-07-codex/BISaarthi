"""Authoritative corpus service for Phase 7A: Discovery and Comparison over 100-standard MVP."""

import json
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple, Union

from app.core.errors import NotFoundError, ValidationError
from app.schemas.bis_api import (
    CompareStandardsResponse,
    ComparisonFieldMatch,
    StandardDetailsResponse,
    StandardListItem,
    StandardSearchResponse,
)


class BISCorpusService:
    """Service for accessing, searching, and comparing standards from the authoritative 100-standard manifest."""

    _instance: Optional["BISCorpusService"] = None

    def __init__(self, manifest_path: Optional[Path] = None) -> None:
        if manifest_path is None:
            backend_root = Path(__file__).resolve().parent.parent.parent
            self.manifest_path = backend_root / "docs" / "bis_mvp_corpus_manifest.json"
        else:
            self.manifest_path = Path(manifest_path)

        self._standards: List[Dict[str, Any]] = []
        self._by_standard_id: Dict[int, Dict[str, Any]] = {}
        self._by_is_normalized: Dict[str, Dict[str, Any]] = {}
        self._by_enc_id: Dict[str, Dict[str, Any]] = {}
        self._ai_metadata: Dict[str, Dict[str, Any]] = {}

        self._load_corpus()

    @classmethod
    def get_instance(cls) -> "BISCorpusService":
        """Singleton accessor for efficient in-memory corpus querying."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @staticmethod
    def _normalize_is_key(is_number: str) -> str:
        """Normalizes Indian Standard string for resilient lookup (e.g. 'is20822018')."""
        return re.sub(r"[^a-zA-Z0-9]", "", is_number).lower()

    def _load_corpus(self) -> None:
        """Loads and indexes the 100-standard authoritative MVP corpus manifest and AI-derived search metadata."""
        if not self.manifest_path.exists():
            return

        with open(self.manifest_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        standards_list: List[Dict[str, Any]] = []
        for cat in data.get("categories", []):
            cat_name = cat.get("name", "General")
            for std in cat.get("standards", []):
                std_copy = dict(std)
                std_copy["category"] = cat_name
                std_copy["document_available"] = False
                standards_list.append(std_copy)

        self._standards = standards_list

        for std in self._standards:
            std_id = std.get("standard_id")
            if std_id is not None:
                self._by_standard_id[int(std_id)] = std

            is_num = std.get("is_number", "")
            if is_num:
                norm_key = self._normalize_is_key(is_num)
                self._by_is_normalized[norm_key] = std
                # Also index base number without year (e.g. 'is2082')
                base_is = is_num.split(":")[0]
                base_key = self._normalize_is_key(base_is)
                if base_key not in self._by_is_normalized:
                    self._by_is_normalized[base_key] = std

            enc_id = std.get("standard_enc_id")
            if enc_id:
                self._by_enc_id[enc_id] = std

        # Load AI-derived search metadata cache if available
        ai_meta_path = self.manifest_path.parent.parent / "data" / "bis_ai_metadata.json"
        if ai_meta_path.exists():
            try:
                with open(ai_meta_path, "r", encoding="utf-8") as f_ai:
                    ai_data = json.load(f_ai)
                    self._ai_metadata = ai_data.get("standards", {})
            except Exception:
                self._ai_metadata = {}

    def get_ai_metadata(self, identifier: Union[int, str]) -> Optional[Dict[str, Any]]:
        """Retrieves AI-derived search terminology and query aliases for a standard."""
        raw_std = self.get_raw_standard(identifier)
        if not raw_std:
            return None
        is_num = raw_std.get("is_number", "")
        return self._ai_metadata.get(is_num)

    @property
    def total_count(self) -> int:
        return len(self._standards)

    def list_standards(
        self,
        q: Optional[str] = None,
        category: Optional[str] = None,
        is_number: Optional[str] = None,
        status_filter: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> StandardSearchResponse:
        """Search and filter standards from the authoritative MVP corpus with deterministic pagination."""
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 20

        # If query string is provided, use semantic and keyword discovery with AI aliases
        if q and q.strip():
            tokens = [t.lower() for t in q.strip().split() if len(t) > 1]
            discovered = self.discover_standards_for_query(
                query_text=q.strip(),
                category=category,
                top_k=100,
            )
            raw_items = [self.get_raw_standard(s.is_number) for s, _ in discovered]
            discovered_ids = {s.is_number for s, _ in discovered}

            # For concise 1-2 word keyword queries (e.g. 'cement', 'geyser'), also append direct keyword matches
            if len(tokens) <= 2:
                for std in self._standards:
                    if std.get("is_number") not in discovered_ids:
                        text_to_check = f"{std.get('title', '')} {std.get('primary_use_case', '')} {std.get('category', '')}".lower()
                        if any(t in text_to_check for t in tokens):
                            raw_items.append(std)

            filtered = [s for s in raw_items if s is not None]
            if not filtered:
                def matches(item: Dict[str, Any]) -> bool:
                    combined = " ".join([
                        item.get("is_number", ""),
                        item.get("title", ""),
                        item.get("category", ""),
                        item.get("department", ""),
                        item.get("committee", ""),
                        item.get("reason_selected", ""),
                        item.get("primary_use_case", ""),
                    ]).lower()
                    return any(term in combined for term in tokens)

                filtered = [s for s in self._standards if matches(s)]
                filtered.sort(key=lambda x: x.get("is_number", ""))
        else:
            filtered = list(self._standards)

            # Category filter
            if category and category.strip():
                cat_clean = category.strip().lower()
                filtered = [
                    s for s in filtered
                    if cat_clean in s.get("category", "").lower()
                ]

            # IS number exact / substring filter
            if is_number and is_number.strip():
                is_clean = self._normalize_is_key(is_number.strip())
                filtered = [
                    s for s in filtered
                    if is_clean in self._normalize_is_key(s.get("is_number", ""))
                ]

            # Deterministic sort by is_number
            filtered.sort(key=lambda x: x.get("is_number", ""))

        # Status filter
        if status_filter and status_filter.strip():
            stat_clean = status_filter.strip().lower()
            filtered = [
                s for s in filtered
                if stat_clean in s.get("status", "active").lower()
            ]

        total = len(filtered)
        total_pages = max(1, (total + page_size - 1) // page_size) if total > 0 else 1

        offset = (page - 1) * page_size
        paged_items = filtered[offset : offset + page_size]

        items = [
            StandardListItem(
                standard_id=item.get("standard_id"),
                standard_enc_id=item.get("standard_enc_id"),
                is_number=item.get("is_number", ""),
                title=item.get("title", ""),
                category=item.get("category", ""),
                department=item.get("department"),
                committee=item.get("committee"),
                type=item.get("type"),
                status=item.get("status"),
                document_available=item.get("document_available", False),
                reason_selected=item.get("reason_selected"),
                primary_use_case=item.get("primary_use_case"),
            )
            for item in paged_items
        ]

        return StandardSearchResponse(
            items=items,
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

    def get_raw_standard(self, identifier: Union[int, str]) -> Optional[Dict[str, Any]]:
        """Resolves raw standard dictionary from manifest by numeric ID, encrypted ID, or IS number."""
        # Check integer standard_id
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            int_id = int(identifier)
            raw_std = self._by_standard_id.get(int_id)
            if raw_std is not None:
                return raw_std

        # Check encrypted standard ID
        if isinstance(identifier, str):
            raw_std = self._by_enc_id.get(identifier)
            if raw_std is not None:
                return raw_std

        # Check normalized IS number string
        if isinstance(identifier, str):
            norm_key = self._normalize_is_key(identifier)
            raw_std = self._by_is_normalized.get(norm_key)
            if raw_std is not None:
                return raw_std

        return None

    def get_standard(self, identifier: Union[int, str]) -> Optional[StandardDetailsResponse]:
        """Resolves a standard by numeric ID, encrypted ID, or IS number string."""
        raw_std = self.get_raw_standard(identifier)
        if raw_std is None:
            return None

        return StandardDetailsResponse(
            standard_id=raw_std.get("standard_id"),
            standard_enc_id=raw_std.get("standard_enc_id"),
            is_number=raw_std.get("is_number", ""),
            title=raw_std.get("title", ""),
            category=raw_std.get("category", ""),
            department=raw_std.get("department"),
            committee=raw_std.get("committee"),
            type=raw_std.get("type"),
            status=raw_std.get("status"),
            publication_date=raw_std.get("publication_date"),
            formatted_date=raw_std.get("formatted_date"),
            bis_url=raw_std.get("bis_url"),
            document_available=raw_std.get("document_available", False),
            selection_confidence=raw_std.get("selection_confidence"),
            reason_selected=raw_std.get("reason_selected"),
            primary_use_case=raw_std.get("primary_use_case"),
            related_selected_standards=raw_std.get("related_selected_standards", []),
        )

    def get_enriched_standard_detail(
        self,
        identifier: Union[int, str],
        use_cache: bool = True,
    ) -> Optional[Any]:
        """Fetches and normalizes multi-tab official BIS Standard Details for a manifest standard."""
        from app.services.bis_standard_detail_service import BISStandardDetailService

        raw_std = self.get_raw_standard(identifier)
        if raw_std is None:
            return None

        detail_service = BISStandardDetailService()
        return detail_service.fetch_standard_details(
            is_number=raw_std.get("is_number", ""),
            standard_id=raw_std.get("standard_id"),
            standard_enc_id=raw_std.get("standard_enc_id"),
            title=raw_std.get("title"),
            category=raw_std.get("category"),
            use_cache=use_cache,
        )

    @staticmethod
    def _generate_comparison_summary(
        std_a: StandardDetailsResponse,
        std_b: StandardDetailsResponse,
    ) -> Tuple[str, Optional[str]]:
        """
        Generates a deterministic, metadata-grounded natural-language comparison summary
        and optional relevance hint between two Indian Standards without LLM calls.
        """
        has_meta_a = bool(std_a.reason_selected or std_a.primary_use_case)
        has_meta_b = bool(std_b.reason_selected or std_b.primary_use_case)

        if not (has_meta_a or has_meta_b):
            fallback = (
                "These standards are both represented in the BISaarthi corpus, but the available "
                "metadata is not sufficient to determine their detailed technical differences. "
                "The official BIS documents are required for clause-level comparison."
            )
            return fallback, None

        desc_a = std_a.reason_selected or std_a.primary_use_case or std_a.title
        desc_b = std_b.reason_selected or std_b.primary_use_case or std_b.title

        cat_a = (std_a.category or "").strip()
        cat_b = (std_b.category or "").strip()
        same_cat = bool(cat_a and cat_b and cat_a.lower() == cat_b.lower())

        parts = []

        # 1. Standard A association
        parts.append(f"{std_a.is_number} ({std_a.title}):\n{desc_a}")

        # 2. Standard B association
        parts.append(f"{std_b.is_number} ({std_b.title}):\n{desc_b}")

        # 3. Practical domain distinction
        if same_cat:
            gen_keywords = ["general", "foundational", "code of practice", "guidelines", "test method", "part 1"]
            text_a = f"{std_a.title} {std_a.reason_selected or ''} {std_a.primary_use_case or ''}".lower()
            text_b = f"{std_b.title} {std_b.reason_selected or ''} {std_b.primary_use_case or ''}".lower()

            is_gen_a = any(k in text_a for k in gen_keywords) and not ("storage" in text_a or "heater" in text_a)
            is_gen_b = any(k in text_b for k in gen_keywords) and not ("storage" in text_b or "heater" in text_b)

            if is_gen_b and not is_gen_a:
                distinction = (
                    f"Application Domain Distinction: Both standards belong to '{cat_a}'. "
                    f"{std_a.is_number} is a dedicated product-specific standard, "
                    f"whereas {std_b.is_number} establishes overarching foundational safety or general requirements across the domain."
                )
            elif is_gen_a and not is_gen_b:
                distinction = (
                    f"Application Domain Distinction: Both standards belong to '{cat_a}'. "
                    f"{std_b.is_number} is a dedicated product-specific standard, "
                    f"whereas {std_a.is_number} establishes overarching foundational safety or general requirements across the domain."
                )
            else:
                distinction = (
                    f"Application Domain Distinction: Both standards operate within '{cat_a}', "
                    f"governing distinct material formulations or product types as described in their respective scopes."
                )
            parts.append(distinction)
        else:
            distinction = (
                f"Application Domain Distinction: These standards operate across different domains: "
                f"{std_a.is_number} is categorized under '{cat_a or 'General'}', "
                f"whereas {std_b.is_number} is categorized under '{cat_b or 'General'}'."
            )
            parts.append(distinction)

        # 4. Technical limitation
        limitation = (
            "Technical Clause Limitation: Detailed clause-level requirements, test methods, numerical thresholds, "
            "and specific conformity criteria are unavailable until official BIS full-text documents are acquired and verified."
        )
        parts.append(limitation)

        summary = "\n\n".join(parts)

        relevance_hint = None
        if std_a.primary_use_case and std_b.primary_use_case:
            relevance_hint = (
                f"- For {std_a.primary_use_case.rstrip('.')}: {std_a.is_number} is the relevant corpus standard.\n"
                f"- For {std_b.primary_use_case.rstrip('.')}: {std_b.is_number} is the relevant corpus standard."
            )

        return summary, relevance_hint

    @staticmethod
    def is_product_discovery_intent(query_text: str) -> bool:
        """
        Determines if a conversational query is seeking product-to-standard discovery
        (e.g., 'I want to manufacture X', 'Which standard applies to Y')
        versus querying for specific normative clause text / test procedures / numerical values
        which require full-text document RAG.
        """
        if not query_text or not query_text.strip():
            return False

        text = query_text.lower().strip()

        # Explicit non-existent / negative triggers
        if any(neg in text for neg in ["non-existent", "nonexistent", "fake standard", "invalid standard"]):
            return False

        # Clause / specific technical requirement indicators (require full-text chunks)
        clause_indicators = [
            "test requirement", "test requirements", "testing requirement", "testing requirements",
            "test procedure", "test procedures", "testing procedure", "testing procedures",
            "clause requirement", "clause requirements", "numerical limit", "numerical limits",
            "tolerance limit", "tolerance limits", "exact dimension", "exact dimensions",
            "परीक्षण आवश्यकता", "परीक्षण आवश्यकताएं", "सुरक्षा आवश्यकताएं",
        ]
        if any(ind in text for ind in clause_indicators) and not any(m in text for m in ["manufacture", "manufacturing", "बनाना", "निर्माण"]):
            return False

        # Discovery intent keywords
        discovery_indicators = [
            "manufacture", "manufacturing", "make", "making", "produce", "producing",
            "which standard", "which standards", "what standard", "what standards",
            "which bis", "what bis", "standard for", "standards for", "standard of",
            "standards of", "know about", "applicable standard", "applicable standards",
            "suggest", "recommend", "identify", "find standard", "find standards",
            "geyser", "water heater", "electric iron", "ceiling fan", "cement", "concrete",
            "drinking water", "cable", "wire", "helmet", "steel", "rebar", "pipe",
            # Hindi discovery indicators
            "बनाना", "निर्माण", "उत्पादन", "किन मानक", "किन मानकों", "कौन सा मानक",
            "कौन से मानक", "किन bis", "कौन से bis", "लागू मानक", "जानकारी", "पता होना",
        ]
        return any(ind in text for ind in discovery_indicators) or len(text.split()) <= 4

    def discover_standards_for_query(
        self,
        query_text: str,
        top_k: int = 5,
        category: Optional[str] = None,
    ) -> List[Tuple[StandardDetailsResponse, float]]:
        """
        Discovers and ranks relevant Indian Standards from the authoritative 100-standard corpus
        based on conversational natural-language product queries (e.g. 'I want to manufacture a 15-litre electric geyser').
        
        Deterministic, metadata-grounded, zero hallucination. Returns empty list if query does not meet
        relevance confidence thresholds or product discovery intent.
        """
        if not self.is_product_discovery_intent(query_text):
            return []

        raw_query = query_text.strip().lower()

        # 1. Strip physical capacity/rating modifiers (e.g., '15-litre', '15L', '2000W') from keyword matching
        clean_text = re.sub(
            r"\b\d+[\s\-]*(litre|litres|liter|liters|l|kg|gm|g|ml|watt|watts|w|kw|volt|volts|v|amp|amps|ah|mm|cm|m|inch|inches|star|stars)\b",
            " ",
            raw_query,
            flags=re.IGNORECASE,
        )

        # 2. Hindi-to-English product terminology translation
        hindi_map = {
            "गीजर": "geyser water heater",
            "गीज़र": "geyser water heater",
            "इलेक्ट्रिक": "electric",
            "इलेक्ट्रिकल": "electrical",
            "विद्युत": "electric electrical",
            "पानी": "water",
            "वॉटर": "water",
            "हीटर": "heater",
            "सीमेंट": "cement",
            "कंक्रीट": "concrete",
            "स्टील": "steel rebar",
            "सरिया": "rebar reinforcement steel",
            "तार": "wire cable",
            "केबल": "cable wire",
            "पंखा": "fan ceiling fan",
            "एलईडी": "led lamp lighting",
            "बल्ब": "bulb lamp lighting",
            "हेलमेट": "helmet",
            "सौर": "solar photovoltaic",
            "सोलर": "solar photovoltaic",
            "बैटरी": "battery accumulator",
            "पाइप": "pipe",
            "प्लास्टिक": "plastic polymer",
            "कांच": "glass",
            "दवा": "pharma medical",
            "मास्क": "mask surgical",
            "खाद्य": "food",
            "दूध": "milk dairy",
            "तेल": "oil",
            "गैस": "gas lpg cylinder",
            "सिलेंडर": "cylinder",
            "साबुन": "soap detergent",
            "खिलौने": "toys",
            "खिलौना": "toy toys",
            "जूता": "footwear shoe",
            "जूते": "footwear shoe",
            "कपड़ा": "textile fabric cloth",
            "वस्त्र": "textile fabric cloth",
            "आयरन": "iron electric iron",
            "प्रेस": "iron electric iron",
        }

        translated_words = []
        for word in clean_text.split():
            clean_w = re.sub(r"[^\w\u0900-\u097F]", "", word)
            if clean_w in hindi_map:
                translated_words.append(hindi_map[clean_w])
            else:
                translated_words.append(word)

        normalized_search_text = f"{clean_text} {' '.join(translated_words)}".lower()

        # 3. Filter stopwords and conversational fluff
        stopwords = {
            "i", "want", "to", "manufacture", "manufacturing", "make", "making", "produce",
            "producing", "producer", "which", "bis", "standard", "standards", "should",
            "know", "about", "me", "tell", "what", "is", "are", "for", "please", "can",
            "you", "a", "an", "the", "in", "of", "on", "and", "or", "with", "any", "how",
            "do", "get", "need", "requirements", "requirement", "specification",
            "specifications", "rule", "rules", "guide", "guidance", "applicable", "apply",
            "applies", "comply", "compliance", "indian", "india", "isi", "mark", "marking",
            "product", "products", "item", "items", "good", "goods", "help", "information",
            "details", "suggest", "recommend", "looking", "start", "starting",
            # Hindi conversational stopwords
            "मैं", "चाहता", "चाहती", "हूँ", "हूं", "मुझे", "किन", "के", "बारे", "में", "पता",
            "होना", "चाहिए", "क्या", "है", "हैं", "बताएं", "बताइए", "बनाना", "निर्माण",
            "उत्पादन", "करना", "लागू", "मानक", "मानकों", "बीआईएस", "जानकारी", "दें", "दीजिए",
            "कृपया", "कौन", "से", "का", "की", "को", "पर", "और", "या", "भारतीय", "नियम",
        }

        tokens = [
            re.sub(r"[^\w]", "", w)
            for w in normalized_search_text.split()
            if len(re.sub(r"[^\w]", "", w)) > 1
        ]
        product_keywords = [t for t in tokens if t not in stopwords]

        if not product_keywords:
            return []

        # 4. Synonym expansion for product search
        synonym_map = {
            "geyser": ["geyser", "water heater", "stationary storage", "water heaters"],
            "geysers": ["geyser", "water heater", "stationary storage", "water heaters"],
            "heater": ["water heater", "geyser", "stationary storage"],
            "heaters": ["water heater", "geyser", "stationary storage"],
            "iron": ["electric iron", "irons", "dry and steam irons"],
            "irons": ["electric iron", "irons", "dry and steam irons"],
            "cement": ["cement", "portland", "pozzolana", "opc", "ppc"],
            "fan": ["electric fan", "ceiling fan", "fans"],
            "fans": ["electric fan", "ceiling fan", "fans"],
            "cable": ["cable", "cables", "pvc insulated", "copper wire", "wire"],
            "cables": ["cable", "cables", "pvc insulated", "copper wire", "wire"],
            "wire": ["wire", "wires", "cable", "cables", "conductor"],
            "wires": ["wire", "wires", "cable", "cables", "conductor"],
            "pipe": ["pipe", "pipes", "pvc pipes", "polyethylene"],
            "pipes": ["pipe", "pipes", "pvc pipes", "polyethylene"],
            "mask": ["face mask", "surgical mask", "respiratory", "protective"],
            "masks": ["face mask", "surgical mask", "respiratory", "protective"],
            "battery": ["battery", "batteries", "lead-acid", "lithium", "secondary cells"],
            "batteries": ["battery", "batteries", "lead-acid", "lithium", "secondary cells"],
            "solar": ["solar", "photovoltaic", "pv modules"],
            "rebar": ["steel bars", "reinforcement", "deformed steel", "tmt"],
            "concrete": ["concrete", "reinforced concrete", "plain and reinforced", "cement concrete"],
            "structure": ["structures", "structure", "code of practice", "construction"],
            "structures": ["structures", "structure", "code of practice", "construction"],
            "water": ["water", "drinking water", "potable water"],
        }

        expanded_terms = set(product_keywords)
        for kw in product_keywords:
            if kw in synonym_map:
                expanded_terms.update(synonym_map[kw])

        # 5. Deterministic multi-tier scoring across 100 corpus standards
        scored_standards: List[Tuple[Dict[str, Any], float]] = []

        for std in self._standards:
            title = std.get("title", "").lower()
            reason = (std.get("reason_selected") or "").lower()
            primary_use = (std.get("primary_use_case") or "").lower()
            std_cat = (std.get("category") or "").lower()
            is_num = std.get("is_number", "").lower()

            score = 0.0

            # Direct IS Number match in query
            norm_is = self._normalize_is_key(is_num)
            base_norm_is = self._normalize_is_key(is_num.split(":")[0])
            if base_norm_is in self._normalize_is_key(raw_query):
                score += 50.0

            # Match individual expanded terms
            for term in expanded_terms:
                term_len = len(term)
                if term_len < 2:
                    continue

                if term in title:
                    score += 10.0
                if term in primary_use:
                    score += 6.0
                if term in reason:
                    score += 5.0
                if term in std_cat:
                    score += 2.0

            # Multi-word phrase matching bonus
            for phrase in ["water heater", "electric water heater", "electric geyser", "storage water heater", "electric iron", "ceiling fan", "pvc insulated"]:
                if phrase in normalized_search_text:
                    if phrase in title:
                        score += 15.0
                    if phrase in primary_use:
                        score += 10.0
                    if phrase in reason:
                        score += 8.0

            # 4. AI-Derived Search Metadata Scoring (source_type = ai_derived_metadata)
            ai_meta = self.get_ai_metadata(is_num)
            if ai_meta:
                # Query terms match (e.g. "manufacture geyser", "make geyser", "electric water heater manufacturing")
                for q_term in ai_meta.get("query_terms", []):
                    qt_clean = q_term.lower().strip()
                    if qt_clean and (qt_clean in raw_query or qt_clean in normalized_search_text):
                        score += 35.0
                    elif any(w in raw_query for w in qt_clean.split() if len(w) > 3):
                        score += 8.0

                # Product aliases match (e.g. "geyser", "electric geyser", "water heater")
                for alias in ai_meta.get("product_aliases", []):
                    al_clean = alias.lower().strip()
                    if al_clean and (al_clean in raw_query or al_clean in normalized_search_text):
                        score += 25.0

                # Manufacturing use cases match
                for m_use in ai_meta.get("manufacturing_use_cases", []):
                    mu_clean = m_use.lower()
                    if any(w in raw_query for w in mu_clean.split() if len(w) > 4):
                        score += 12.0

                # Application domains match
                for dom in ai_meta.get("application_domains", []):
                    d_clean = dom.lower()
                    if d_clean in raw_query or d_clean in normalized_search_text:
                        score += 6.0

            if score > 0.0:
                scored_standards.append((std, score))

        if category and category.strip():
            cat_clean = category.strip().lower()
            scored_standards = [
                s for s in scored_standards
                if cat_clean in s[0].get("category", "").lower()
            ]

        if not scored_standards:
            return []

        # Find max score
        max_score = max(s[1] for s in scored_standards)
        # Strict threshold: Must have substantial match (> 18.0)
        if max_score < 18.0:
            return []

        # Top product match
        top_std = max(scored_standards, key=lambda x: x[1])[0]
        top_related = top_std.get("related_selected_standards", [])

        # Boost foundational related standards in the same category if explicitly referenced
        rescored: List[Tuple[Dict[str, Any], float]] = []
        for std, s_val in scored_standards:
            is_num = std.get("is_number", "")
            if is_num in top_related and std.get("category") == top_std.get("category"):
                # E.g. IS 302 (Part 1):2024 general safety context
                s_val += 4.0
            rescored.append((std, s_val))

        # Precision filtering: Return only top standards that score at least 50% of max_score or > 18.0
        min_allowed = max(18.0, max_score * 0.50)
        filtered = [item for item in rescored if item[1] >= min_allowed]

        # Deterministic sort: descending score, then ascending is_number
        filtered.sort(key=lambda x: (-x[1], x[0].get("is_number", "")))

        results: List[Tuple[StandardDetailsResponse, float]] = []
        for raw_item, score_val in filtered[:top_k]:
            details = self.get_standard(raw_item.get("is_number", ""))
            if details:
                results.append((details, round(score_val, 2)))

        return results

    def compare_standards(self, standard_a: str, standard_b: str) -> CompareStandardsResponse:
        """Generates a structured comparison between two Indian Standards in the authoritative corpus."""
        std_a = self.get_standard(standard_a)
        if std_a is None:
            raise NotFoundError(f"Standard A '{standard_a}' was not found in the authoritative corpus.")

        std_b = self.get_standard(standard_b)
        if std_b is None:
            raise NotFoundError(f"Standard B '{standard_b}' was not found in the authoritative corpus.")

        fields_to_compare = [
            ("category", std_a.category, std_b.category),
            ("department", std_a.department, std_b.department),
            ("committee", std_a.committee, std_b.committee),
            ("type", std_a.type, std_b.type),
            ("status", std_a.status, std_b.status),
            ("document_available", str(std_a.document_available), str(std_b.document_available)),
        ]

        comparison: Dict[str, ComparisonFieldMatch] = {}
        for field_name, val_a, val_b in fields_to_compare:
            same = (val_a or "").strip().lower() == (val_b or "").strip().lower() if (val_a and val_b) else (val_a == val_b)
            comparison[field_name] = ComparisonFieldMatch(
                same=same,
                a=val_a,
                b=val_b,
            )

        comparison_summary, relevance_hint = self._generate_comparison_summary(std_a, std_b)

        message = (
            "Metadata comparison generated from the authoritative 100-standard corpus. "
            "Full-text technical clause difference analysis is currently unavailable as official PDFs have not yet been acquired."
        )

        return CompareStandardsResponse(
            standard_a=std_a,
            standard_b=std_b,
            comparison=comparison,
            document_technical_comparison_available=False,
            message=message,
            comparison_summary=comparison_summary,
            relevance_hint=relevance_hint,
        )
