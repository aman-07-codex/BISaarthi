"""Citation builder service for Phase 5B: Traceable, Non-Fabricating Citations."""

from typing import Any, Dict, List, Optional

from app.schemas.bis_retrieval import CitationReference


class CitationBuilder:
    """Builds verifiable, audit-ready citations preserving exact upstream provenance."""

    @staticmethod
    def format_page_range(pages: List[int]) -> str:
        """Formats a list of page numbers into a clean string (e.g. 'p. 5' or 'pp. 5-7')."""
        if not pages:
            return "Page N/A"

        pages_sorted = sorted(list(set(pages)))
        if len(pages_sorted) == 1:
            return f"p. {pages_sorted[0]}"
        elif len(pages_sorted) == 2 and pages_sorted[1] == pages_sorted[0] + 1:
            return f"pp. {pages_sorted[0]}-{pages_sorted[1]}"
        elif pages_sorted[-1] - pages_sorted[0] == len(pages_sorted) - 1:
            return f"pp. {pages_sorted[0]}-{pages_sorted[-1]}"
        else:
            return "pp. " + ", ".join(str(p) for p in pages_sorted)

    @classmethod
    def build_citation(
        cls,
        candidate_data: Dict[str, Any],
        citation_index: int = 1
    ) -> CitationReference:
        """Creates a structured, non-fabricated CitationReference from chunk/candidate metadata.
        
        Args:
            candidate_data: Dictionary containing candidate chunk metadata.
            citation_index: 1-indexed citation position in retrieval response.
            
        Returns:
            CitationReference object.
        """
        is_number = candidate_data.get("is_number", "IS")
        title = candidate_data.get("title")
        section = candidate_data.get("section")
        section_title = candidate_data.get("section_title")
        clause = candidate_data.get("clause")
        clause_title = candidate_data.get("clause_title")
        annex_id = candidate_data.get("annex_id")
        table_id = candidate_data.get("table_id")
        source_pages = candidate_data.get("source_pages", [])
        chunk_id = candidate_data.get("chunk_id", f"chunk_{citation_index}")
        source_chunk_path = candidate_data.get("source_chunk_path")
        sha256 = candidate_data.get("source_pdf_sha256")

        # Build location descriptor
        loc_parts: List[str] = []
        if annex_id:
            loc_parts.append(annex_id)
        if table_id:
            loc_parts.append(table_id)
        if clause:
            c_desc = f"Clause {clause}"
            if clause_title:
                c_desc += f" ({clause_title})"
            loc_parts.append(c_desc)
        elif section:
            s_desc = f"Section {section}"
            if section_title:
                s_desc += f" ({section_title})"
            loc_parts.append(s_desc)

        location_str = ", ".join(loc_parts) if loc_parts else "General Requirements"
        page_str = cls.format_page_range(source_pages)

        title_str = f" — {title}" if title else ""
        formatted = f"[{citation_index}] {is_number}{title_str}, {location_str}, {page_str}"

        return CitationReference(
            citation_id=f"cite_{citation_index:03d}",
            is_number=is_number,
            title=title,
            section=section,
            clause=clause,
            source_pages=source_pages,
            chunk_id=chunk_id,
            source_chunk_path=source_chunk_path,
            source_pdf_sha256=sha256,
            formatted_citation=formatted,
        )
