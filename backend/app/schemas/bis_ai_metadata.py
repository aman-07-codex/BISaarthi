"""Pydantic schemas for AI-Derived Search and Relevance Metadata.

Captures offline AI-derived product terminology, conversational aliases, manufacturing query terms,
and application domains for the 100 curated Indian Standards to improve retrieval precision.
Explicitly labeled with source_type = 'ai_derived_metadata' to preserve boundary with official BIS facts.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AIMetadataItem(BaseModel):
    """AI-derived search and relevance metadata for an individual Indian Standard."""
    model_config = ConfigDict(from_attributes=True)

    is_number: str = Field(..., description="Indian Standard identifier (e.g. 'IS 2082:2018')")
    source_type: str = Field(
        default="ai_derived_metadata",
        description="Explicit provenance marker ensuring distinction from official BIS facts"
    )
    product_aliases: List[str] = Field(
        default_factory=list,
        description="Colloquial and commercial product names/aliases (e.g. 'geyser', 'electric water heater')"
    )
    query_terms: List[str] = Field(
        default_factory=list,
        description="Conversational intent search phrases (e.g. 'manufacture geyser', 'make water heater')"
    )
    manufacturing_use_cases: List[str] = Field(
        default_factory=list,
        description="Specific manufacturing and industrial compliance scenarios"
    )
    application_domains: List[str] = Field(
        default_factory=list,
        description="Broader engineering and consumer product domains"
    )
    relevance_description: str = Field(
        default="",
        description="High-level relevance summary describing when this standard applies"
    )
    derived_at: Optional[str] = Field(
        default=None,
        description="ISO 8601 timestamp of metadata derivation"
    )


class AIMetadataCorpus(BaseModel):
    """Collection container for all AI-derived metadata records across the 100-standard corpus."""
    model_config = ConfigDict(from_attributes=True)

    version: str = Field(default="1.0", description="Dataset schema version")
    source_type: str = Field(
        default="ai_derived_metadata",
        description="Dataset-level provenance marker"
    )
    total_standards: int = Field(default=0, description="Total enriched standards")
    standards: Dict[str, AIMetadataItem] = Field(
        default_factory=dict,
        description="Mapping from normalized IS number to AIMetadataItem"
    )
