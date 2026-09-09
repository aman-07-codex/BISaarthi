"""Anti-hallucination and grounding verification service for Phase 6A RAG."""

import re
from typing import List, Set

from app.schemas.bis_rag import GroundingStatus, GroundingValidationResult, RAGContext
from app.schemas.bis_retrieval import CitationReference


class GroundingValidator:
    """Validates synthesized answers against supplied context to detect hallucinations and citation errors."""

    # Regex patterns for detecting technical identifiers in generated answers
    IS_NUMBER_PATTERN = re.compile(r"\bIS\s*[:\-]?\s*(\d{2,6}(?:\s*\(Part\s*\d+\))?)", re.IGNORECASE)
    CLAUSE_PATTERN = re.compile(r"\b(?:Clause|Cl\.)\s*(\d+(?:\.\d+)*)\b", re.IGNORECASE)

    def validate(
        self,
        answer_text: str,
        context: List[RAGContext],
        citations: List[CitationReference],
    ) -> GroundingValidationResult:
        """Performs multi-layer deterministic grounding validation on the generated answer.
        
        Args:
            answer_text: The synthesized response string.
            context: The retrieved context chunks supplied to the LLM.
            citations: The list of citation references claimed by the response.
            
        Returns:
            GroundingValidationResult with status, supported claims, errors, and warnings.
        """
        supported_claims: List[str] = []
        unsupported_claims: List[str] = []
        citation_errors: List[str] = []
        warnings: List[str] = []

        # 1. Check for empty context
        if not context:
            if "insufficient" in answer_text.lower() or "अपर्याप्त" in answer_text:
                return GroundingValidationResult(
                    status=GroundingStatus.INSUFFICIENT_CONTEXT,
                    grounded=False,
                    supported_claims=["Acknowledged insufficient context correctly."],
                    unsupported_claims=[],
                    citation_errors=[],
                    warnings=["No retrieval context available."],
                )
            else:
                return GroundingValidationResult(
                    status=GroundingStatus.UNSUPPORTED,
                    grounded=False,
                    supported_claims=[],
                    unsupported_claims=["Generated factual response without any retrieved context."],
                    citation_errors=[],
                    warnings=["Generated answer produced without source evidence."],
                )

        # 2. Build index of known identifiers in retrieved context
        context_chunk_ids: Set[str] = {c.chunk_id for c in context}
        context_is_numbers: Set[str] = {
            re.sub(r"\s+", "", c.is_number.upper().replace("IS", "").replace("-", "").replace(":", ""))
            for c in context
        }
        context_clauses: Set[str] = {c.clause.strip() for c in context if c.clause}
        
        # Combine all context text for lexical grounding checks
        combined_context_text = " ".join(c.text for c in context).lower()

        # 3. Citation integrity validation
        for cit in citations:
            if cit.chunk_id not in context_chunk_ids:
                citation_errors.append(
                    f"Citation chunk_id '{cit.chunk_id}' was not present in the retrieved context."
                )
            else:
                # Find matching context item and verify metadata match
                matched_ctx = next((c for c in context if c.chunk_id == cit.chunk_id), None)
                if matched_ctx:
                    if cit.is_number.strip().upper() != matched_ctx.is_number.strip().upper():
                        citation_errors.append(
                            f"Citation IS number mismatch for chunk '{cit.chunk_id}': '{cit.is_number}' vs context '{matched_ctx.is_number}'."
                        )
                    if matched_ctx.clause and cit.clause and cit.clause.strip() != matched_ctx.clause.strip():
                        citation_errors.append(
                            f"Citation clause mismatch for chunk '{cit.chunk_id}': '{cit.clause}' vs context '{matched_ctx.clause}'."
                        )

        # 4. Check for hallucinated IS numbers in answer text
        detected_is_matches = self.IS_NUMBER_PATTERN.findall(answer_text)
        for match in detected_is_matches:
            normalized_match = re.sub(r"\s+", "", match.upper().replace("IS", "").replace("-", "").replace(":", ""))
            # Allow synthetic prefixes in test fixtures like SYN-001 or standard numbers
            if normalized_match and normalized_match not in context_is_numbers:
                # Check if raw match appears in any context is_number
                found_in_raw = any(match.lower() in c.is_number.lower() for c in context)
                if not found_in_raw:
                    unsupported_claims.append(
                        f"Answer references standard 'IS {match}' which is not present in retrieved context."
                    )

        # 5. Check for hallucinated clauses in answer text
        detected_clauses = self.CLAUSE_PATTERN.findall(answer_text)
        for clause_match in detected_clauses:
            clause_str = clause_match.strip()
            # If not in metadata clauses, check if the clause appears in chunk text
            if clause_str not in context_clauses and f"clause {clause_str.lower()}" not in combined_context_text and f" {clause_str} " not in combined_context_text:
                warnings.append(
                    f"Answer references 'Clause {clause_str}' which is not in metadata or chunk text."
                )

        # 6. Assess evidence support
        if not unsupported_claims and not citation_errors:
            supported_claims.append("All cited standard identifiers and clauses verified against context.")

        # 7. Determine grounding status
        if citation_errors or len(unsupported_claims) >= 2:
            status = GroundingStatus.UNSUPPORTED
            grounded = False
        elif unsupported_claims or len(warnings) >= 2:
            status = GroundingStatus.PARTIALLY_GROUNDED
            grounded = False
        else:
            status = GroundingStatus.GROUNDED
            grounded = True

        return GroundingValidationResult(
            status=status,
            grounded=grounded,
            supported_claims=supported_claims,
            unsupported_claims=unsupported_claims,
            citation_errors=citation_errors,
            warnings=warnings,
        )
