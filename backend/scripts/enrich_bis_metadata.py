"""Offline One-Time Gemini & Deterministic AI Metadata Enrichment Script for BISaarthi.

Enriches the 100 curated Indian Standards with search aliases, conversational query terms,
and manufacturing use cases derived exclusively from existing verified metadata.
Saves results into backend/data/bis_ai_metadata.json with local caching to prevent runtime LLM calls.
"""

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import sys
import time
from typing import Any, Dict, List, Optional

# Add backend directory to sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from app.core.logging import get_logger
from app.schemas.bis_ai_metadata import AIMetadataCorpus, AIMetadataItem
from app.services.bis_llm_provider import GeminiLLMProvider

logger = get_logger("enrich_bis_metadata")


def generate_fallback_metadata(std: Dict[str, Any]) -> AIMetadataItem:
    """Deterministic, rule-based fallback metadata generator from verified manifest fields."""
    is_num = std.get("is_number", "")
    title = std.get("title", "")
    category = std.get("category", "")
    primary_use = std.get("primary_use_case", "")
    reason = std.get("reason_selected", "")

    # Clean text components
    clean_title = re.sub(r"-\s*Specification.*|-.*?Code of Practice.*|\(.*?\)", "", title, flags=re.IGNORECASE).strip()

    aliases = set()
    query_terms = set()
    use_cases = set()
    domains = set()

    # Extract nouns and key phrases
    if clean_title:
        aliases.add(clean_title.lower())
        query_terms.add(f"manufacture {clean_title.lower()}")
        query_terms.add(f"{clean_title.lower()} standard")

    # Specific well-known synonyms
    lower_title = title.lower()
    lower_use = (primary_use + " " + reason).lower()

    if "water heater" in lower_title or "geyser" in lower_use:
        aliases.update(["geyser", "electric geyser", "water heater", "storage water heater", "electric water heater", "domestic geyser"])
        query_terms.update(["manufacture geyser", "make geyser", "electric water heater manufacturing", "storage geyser bis mark"])
        use_cases.add("manufacturing electric storage water heaters and domestic geysers")
        domains.update(["domestic water heating", "electric appliances", "bathroom fixtures"])

    elif "electric iron" in lower_title or "iron" in lower_title:
        aliases.update(["electric iron", "dry iron", "steam iron", "cloth iron"])
        query_terms.update(["manufacture electric iron", "make electric iron", "steam iron manufacturing"])
        use_cases.add("manufacturing domestic dry and steam irons")
        domains.update(["household electrical appliances", "garment care"])

    elif "ceiling fan" in lower_title or "electric fan" in lower_title:
        aliases.update(["ceiling fan", "electric fan", "table fan", "pedestal fan"])
        query_terms.update(["manufacture ceiling fan", "make fan", "ceiling fan energy efficiency standard"])
        use_cases.add("manufacturing electric ceiling fans and domestic air circulators")
        domains.update(["ventilation and air circulation", "domestic electrical appliances"])

    elif "drinking water" in lower_title:
        aliases.update(["drinking water", "potable water", "packaged drinking water", "tap water quality"])
        query_terms.update(["drinking water specification", "potable water testing limits", "mineral water standard"])
        use_cases.add("testing and supplying potable drinking water")
        domains.update(["water quality and safety", "public health", "food and agriculture"])

    elif "concrete" in lower_title or "reinforced concrete" in lower_title:
        aliases.update(["reinforced concrete", "plain concrete", "rcc", "concrete design", "cement concrete"])
        query_terms.update(["manufacture concrete structures", "reinforced concrete code of practice", "rcc construction standard"])
        use_cases.add("designing and constructing plain and reinforced concrete structures")
        domains.update(["civil engineering", "structural construction", "building materials"])

    elif "cement" in lower_title:
        aliases.update(["cement", "opc", "ppc", "portland cement", "pozzolana cement"])
        query_terms.update(["manufacture cement", "portland pozzolana cement testing", "cement quality standard"])
        use_cases.add("manufacturing hydraulic cements and building binders")
        domains.update(["construction materials", "structural binders"])

    elif "cable" in lower_title or "wire" in lower_title:
        aliases.update(["electric cable", "pvc cable", "copper wire", "building wire", "power cable"])
        query_terms.update(["manufacture electric cables", "pvc insulated cable standard", "copper wiring specification"])
        use_cases.add("manufacturing insulated cables and electrical conductors")
        domains.update(["electrical transmission", "building electrification"])

    elif "helmet" in lower_title:
        aliases.update(["helmet", "two wheeler helmet", "protective helmet", "motorcycle helmet"])
        query_terms.update(["manufacture helmet", "two wheeler helmet safety standard", "isi mark helmet"])
        use_cases.add("manufacturing protective helmets for two-wheeler riders")
        domains.update(["road safety", "personal protective equipment"])

    elif "solar" in lower_title or "photovoltaic" in lower_title:
        aliases.update(["solar panel", "pv module", "photovoltaic module", "solar cell"])
        query_terms.update(["manufacture solar panel", "photovoltaic module certification", "solar pv standard"])
        use_cases.add("manufacturing terrestrial photovoltaic modules")
        domains.update(["renewable energy", "solar power"])

    elif "pipe" in lower_title or "polyethylene" in lower_title:
        aliases.update(["hdpe pipe", "pvc pipe", "water supply pipe", "plastic piping"])
        query_terms.update(["manufacture hdpe pipes", "plastic pipe for water supply", "polyethylene piping standard"])
        use_cases.add("manufacturing plastic piping systems for water supply")
        domains.update(["piping and drainage", "water conveyance"])

    # Default fallbacks if no specific trigger
    if not aliases:
        aliases.add(clean_title.lower())
    if not query_terms:
        query_terms.add(f"manufacture {clean_title.lower()}")
    if not use_cases and primary_use:
        use_cases.add(primary_use)
    if not domains and category:
        domains.add(category)

    rel_desc = reason or primary_use or f"Standard specification for {title}."

    return AIMetadataItem(
        is_number=is_num,
        source_type="ai_derived_metadata",
        product_aliases=sorted(list(aliases)),
        query_terms=sorted(list(query_terms)),
        manufacturing_use_cases=sorted(list(use_cases)),
        application_domains=sorted(list(domains)),
        relevance_description=rel_desc,
        derived_at=datetime.now(timezone.utc).isoformat(),
    )


def enrich_category_with_gemini(
    category_name: str,
    standards_batch: List[Dict[str, Any]],
    gemini_provider: GeminiLLMProvider,
) -> List[AIMetadataItem]:
    """Enriches a batch of standards in a single structured Gemini prompt."""
    logger.info("Calling Gemini for category '%s' (%d standards)...", category_name, len(standards_batch))

    standards_input = [
        {
            "is_number": s.get("is_number"),
            "title": s.get("title"),
            "category": s.get("category", category_name),
            "primary_use_case": s.get("primary_use_case"),
            "reason_selected": s.get("reason_selected"),
            "department": s.get("department"),
            "committee": s.get("committee"),
        }
        for s in standards_batch
    ]

    prompt = f"""You are a BIS metadata relevance extraction engine.
For the following verified Indian Standards, derive conversational product aliases, search query terms, manufacturing use cases, and application domains strictly from their verified titles and metadata.

DO NOT invent official departments, committees, mandatory status, or clause numbers.
Output ONLY a strict JSON array of objects conforming to this schema:
[
  {{
    "is_number": "IS 2082:2018",
    "product_aliases": ["geyser", "electric geyser", "water heater", "storage water heater", "stationary storage electric water heater"],
    "query_terms": ["manufacture geyser", "make geyser", "electric water heater manufacturing", "water heater compliance"],
    "manufacturing_use_cases": ["manufacturing electric storage water heaters and domestic geysers"],
    "application_domains": ["domestic water heating", "electrical appliances"],
    "relevance_description": "Specification for stationary storage type electric water heaters (geysers)."
  }}
]

Verified Standards Input:
{json.dumps(standards_input, indent=2)}
"""

    client = gemini_provider._get_client()
    if client is None:
        raise RuntimeError("Gemini client unavailable.")

    from google.genai import types

    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.1,
    )

    response = client.models.generate_content(
        model=gemini_provider.model_name,
        contents=prompt,
        config=config,
    )

    if not response or not response.text:
        raise ValueError("Empty response from Gemini API")

    raw_json = json.loads(response.text.strip())
    if isinstance(raw_json, dict) and "standards" in raw_json:
        raw_json = raw_json["standards"]
    elif isinstance(raw_json, dict) and "items" in raw_json:
        raw_json = raw_json["items"]

    items: List[AIMetadataItem] = []
    for entry in raw_json:
        entry["source_type"] = "ai_derived_metadata"
        entry["derived_at"] = datetime.now(timezone.utc).isoformat()
        items.append(AIMetadataItem.model_validate(entry))

    return items


def run_enrichment(force: bool = False, use_gemini: bool = True) -> AIMetadataCorpus:
    """Executes the one-time offline AI metadata enrichment process."""
    data_dir = backend_root / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    cache_path = data_dir / "bis_ai_metadata.json"
    manifest_path = backend_root / "docs" / "bis_mvp_corpus_manifest.json"

    if not manifest_path.exists():
        raise FileNotFoundError(f"Manifest not found at {manifest_path}")

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest_data = json.load(f)

    # 1. Check existing cached metadata
    existing_items: Dict[str, AIMetadataItem] = {}
    if cache_path.exists() and not force:
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached_json = json.load(f)
                corpus_obj = AIMetadataCorpus.model_validate(cached_json)
                existing_items = corpus_obj.standards
                logger.info("Loaded %d existing AI metadata records from cache.", len(existing_items))
        except Exception as err:
            logger.warning("Failed reading existing cache (%s). Will regenerate.", str(err))

    gemini_provider = GeminiLLMProvider() if use_gemini else None
    gemini_active = gemini_provider is not None and gemini_provider.is_available

    total_standards = 0
    enriched_map: Dict[str, AIMetadataItem] = dict(existing_items)
    gemini_requests_count = 0

    categories = manifest_data.get("categories", [])
    for cat in categories:
        cat_name = cat.get("name", "General")
        standards = cat.get("standards", [])
        total_standards += len(standards)

        # Filter standards that need enrichment
        missing_stds = [s for s in standards if s.get("is_number") not in enriched_map or force]

        if not missing_stds:
            continue

        if gemini_active:
            try:
                gemini_items = enrich_category_with_gemini(cat_name, missing_stds, gemini_provider)
                gemini_requests_count += 1
                for item in gemini_items:
                    enriched_map[item.is_number] = item
                logger.info("Successfully enriched %d standards via Gemini for category '%s'", len(gemini_items), cat_name)
                time.sleep(1.0)  # Gentle rate-limit pause between batches
                continue
            except Exception as err:
                logger.warning("Gemini batch enrichment failed for '%s' (%s). Using fallback generator.", cat_name, str(err))

        # Fallback deterministic generator
        for s in missing_stds:
            item = generate_fallback_metadata(s)
            enriched_map[item.is_number] = item

    corpus_result = AIMetadataCorpus(
        version="1.0",
        source_type="ai_derived_metadata",
        total_standards=len(enriched_map),
        standards=enriched_map,
    )

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(corpus_result.model_dump(), f, indent=2, ensure_ascii=False)

    print(f"\n=======================================================")
    print(f"AI METADATA ENRICHMENT COMPLETE")
    print(f"=======================================================")
    print(f"Total Standards Processed: {total_standards}")
    print(f"Total Enriched in Dataset: {len(enriched_map)}")
    print(f"Gemini API Requests Consumed: {gemini_requests_count}")
    print(f"Saved Cache File: {cache_path}")
    print(f"=======================================================\n")

    return corpus_result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Enrich BIS Standards with AI-derived search metadata.")
    parser.add_argument("--force", action="store_true", help="Force re-generation of all records")
    parser.add_argument("--no-gemini", action="store_true", help="Use deterministic offline generator without Gemini calls")
    args = parser.parse_args()

    run_enrichment(force=args.force, use_gemini=not args.no_gemini)
