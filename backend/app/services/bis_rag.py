"""RAG Orchestration Service for Phase 6A: Context-Grounded Answering Engine."""

from datetime import datetime, timezone
import time
from typing import Any, Dict, List, Optional, Union

from app.schemas.bis_rag import (
    GroundingStatus,
    GroundingValidationResult,
    RAGAnswer,
    RAGContext,
    RAGLanguage,
    RAGQuery,
)
from app.schemas.bis_retrieval import CitationReference, RetrievalQuery
from app.services.bis_corpus_service import BISCorpusService
from app.services.bis_grounding_validator import GroundingValidator
from app.services.bis_llm_provider import BaseLLMProvider, GeminiLLMProvider, MockLLMProvider, get_llm_provider
from app.services.bis_rag_context import RAGContextBuilder
from app.services.bis_rag_prompt import GroundedPromptBuilder
from app.services.bis_retrieval import BISRetrievalService


class BISRAGService:
    """Orchestrates query validation, hybrid retrieval, context assembly, prompt construction,
    LLM completion, and deterministic grounding validation.
    """

    def __init__(
        self,
        retrieval_service: Optional[BISRetrievalService] = None,
        context_builder: Optional[RAGContextBuilder] = None,
        prompt_builder: Optional[GroundedPromptBuilder] = None,
        llm_provider: Optional[BaseLLMProvider] = None,
        grounding_validator: Optional[GroundingValidator] = None,
        corpus_service: Optional[BISCorpusService] = None,
    ) -> None:
        self.retrieval_service = retrieval_service or BISRetrievalService()
        self.context_builder = context_builder or RAGContextBuilder()
        self.prompt_builder = prompt_builder or GroundedPromptBuilder()
        self.llm_provider = llm_provider or get_llm_provider()
        self.grounding_validator = grounding_validator or GroundingValidator()
        self.corpus_service = corpus_service or BISCorpusService.get_instance()

    def index_standard_details_document(self, doc: Any) -> int:
        """Indexes normalized OfficialStandardDetailDocument chunks into hybrid retrieval stores.
        
        Args:
            doc: OfficialStandardDetailDocument instance.
            
        Returns:
            Number of indexed chunks.
        """
        if hasattr(doc, "to_rag_chunks"):
            chunks = doc.to_rag_chunks()
            if chunks:
                self.retrieval_service.index_chunks(chunks)
                return len(chunks)
        return 0

    def answer_query(self, query: Union[RAGQuery, Dict[str, Any], str]) -> RAGAnswer:
        """Executes full context-grounded RAG answering pipeline.
        
        Args:
            query: RAGQuery object, query dictionary, or query string.
            
        Returns:
            Validated RAGAnswer object.
        """
        start_time = time.perf_counter()

        # 1. Parse and validate RAGQuery
        if isinstance(query, str):
            query_obj = RAGQuery(query_text=query)
        elif isinstance(query, dict):
            query_obj = RAGQuery(**query)
        else:
            query_obj = query

        # Auto-index enriched official details for any explicit standard mentioned in query
        detected_is_nums: List[str] = []
        if query_obj.is_number:
            detected_is_nums.append(query_obj.is_number)

        import re
        is_matches = re.findall(r"\b(?:IS|is)\s*(\d+(?::\d+)?)\b", query_obj.query_text)
        for m in is_matches:
            detected_is_nums.append(f"IS {m}")

        indexed_set = set()
        for is_ref in detected_is_nums:
            raw_std = self.corpus_service.get_raw_standard(is_ref)
            if raw_std:
                std_is_num = raw_std.get("is_number")
                if std_is_num and std_is_num not in indexed_set:
                    indexed_set.add(std_is_num)
                    try:
                        enriched_doc = self.corpus_service.get_enriched_standard_detail(std_is_num)
                        if enriched_doc:
                            self.index_standard_details_document(enriched_doc)
                    except Exception:
                        pass

        # 2. Build retrieval query and execute retrieval
        retrieval_query = RetrievalQuery(
            query_text=query_obj.query_text,
            top_k=query_obj.top_k,
            category=query_obj.category,
            is_number=query_obj.is_number,
            clause=query_obj.clause,
            chunk_type=query_obj.chunk_type,
            score_threshold=query_obj.score_threshold,
            retrieval_method=query_obj.retrieval_method,
        )

        retrieval_response = self.retrieval_service.retrieve(retrieval_query)
        retrieval_elapsed_ms = retrieval_response.execution_metadata.get("elapsed_ms", 0.0)

        # 3. Empty retrieval: Check conversational product -> standard discovery fallback
        if not retrieval_response.results or retrieval_response.total_candidates == 0:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

            # Attempt deterministic discovery over authoritative 100-standard corpus
            discovered = self.corpus_service.discover_standards_for_query(
                query_text=query_obj.query_text,
                top_k=query_obj.top_k,
            )

            if discovered:
                top_std = discovered[0][0]
                other_stds = [s[0] for s in discovered[1:]]

                if query_obj.language == RAGLanguage.HI:
                    # Hindi structured template
                    sec_rec = f"### सिफारिश (अनुशंसा)\nआपके उत्पाद विवरण के आधार पर, बीआईएस सारथी के क्यूरेटेड कॉर्पस में **{top_std.is_number}** ({top_std.title}) सबसे प्रासंगिक मानक है।"

                    why_parts = []
                    if top_std.reason_selected:
                        why_parts.append(f"• **कॉर्पस संदर्भ:** {top_std.reason_selected}")
                    if top_std.primary_use_case:
                        why_parts.append(f"• **मुख्य अनुप्रयोग:** {top_std.primary_use_case}")
                    if not why_parts:
                        why_parts.append(f"• **वर्गीकरण:** {top_std.category or 'सामान्य'} के अंतर्गत {top_std.title}।")
                    sec_why = f"### यह क्यों प्रासंगिक है\n" + "\n".join(why_parts)

                    sec_others = ""
                    if other_stds:
                        other_lines = []
                        for o_std in other_stds:
                            rel_desc = o_std.reason_selected or o_std.primary_use_case or o_std.title
                            other_lines.append(f"• **{o_std.is_number}** ({o_std.title}): {rel_desc}")
                        sec_others = f"### समीक्षा हेतु अन्य संबंधित मानक\n" + "\n".join(other_lines)

                    sec_lim = (
                        "### संदर्भ एवं साक्ष्य सीमा\n"
                        "यह अनुशंसा बीआईएस सारथी के 100-मानक क्यूरेटेड कॉर्पस मेटाडेटा पर आधारित है। "
                        "सटीक तकनीकी विनिर्देशों, परीक्षण प्रक्रियाओं, प्रमाणन शर्तों और वैधानिक कानूनी प्रयोज्यता के लिए आधिकारिक बीआईएस दस्तावेजों का सत्यापन आवश्यक है।"
                    )
                else:
                    # English structured template
                    sec_rec = f"### Recommendation\nBased on your product description, **{top_std.is_number}** ({top_std.title}) is the most relevant standard identified in the BISaarthi curated corpus."

                    why_parts = []
                    if top_std.reason_selected:
                        why_parts.append(f"• **Corpus Scope:** {top_std.reason_selected}")
                    if top_std.primary_use_case:
                        why_parts.append(f"• **Primary Application:** {top_std.primary_use_case}")
                    if not why_parts:
                        why_parts.append(f"• **Classification:** {top_std.title} under {top_std.category or 'General'}.")
                    sec_why = f"### Why it is relevant\n" + "\n".join(why_parts)

                    sec_others = ""
                    if other_stds:
                        other_lines = []
                        for o_std in other_stds:
                            rel_desc = o_std.reason_selected or o_std.primary_use_case or o_std.title
                            other_lines.append(f"• **{o_std.is_number}** ({o_std.title}): {rel_desc}")
                        sec_others = f"### Other standards to review\n" + "\n".join(other_lines)

                    sec_lim = (
                        "### Evidence limitation\n"
                        "This recommendation is derived deterministically from BISaarthi's curated 100-standard corpus metadata. "
                        "Exact technical parameters, testing procedures, certification conditions, and statutory legal applicability require verified official BIS documentation."
                    )

                sections = [sec_rec, sec_why]
                if sec_others:
                    sections.append(sec_others)
                sections.append(sec_lim)
                fallback_template_text = "\n\n".join(sections)

                # Attempt Gemini LLM synthesis if available
                synthesized_text: Optional[str] = None
                gen_elapsed_ms = 0.0
                active_provider_name = getattr(self.llm_provider, "provider_name", "CorpusMetadataDiscovery")

                if hasattr(self.llm_provider, "generate_metadata_synthesis"):
                    meta_prompt = self.prompt_builder.build_metadata_fallback_prompt(query_obj, discovered)
                    gen_start = time.perf_counter()
                    synthesized_text = self.llm_provider.generate_metadata_synthesis(meta_prompt, language=query_obj.language)
                    gen_elapsed_ms = round((time.perf_counter() - gen_start) * 1000, 2)

                if synthesized_text and synthesized_text.strip():
                    answer_text = synthesized_text.strip()
                else:
                    answer_text = fallback_template_text
                    active_provider_name = "CorpusMetadataDiscovery"

                citations = [
                    CitationReference(
                        citation_id=f"cit-meta-{s.is_number.replace(' ', '-').replace(':', '-')}",
                        is_number=s.is_number,
                        title=s.title,
                        section="Corpus Metadata",
                        clause="Allowlist Manifest",
                        source_pages=[],
                        chunk_id=f"meta-{s.is_number.replace(' ', '-').replace(':', '-')}",
                        formatted_citation=f"{s.is_number} ({s.title})",
                    )
                    for s, _ in discovered
                ]

                val_result = GroundingValidationResult(
                    status=GroundingStatus.PARTIALLY_GROUNDED,
                    grounded=True,
                    supported_claims=[f"Matched standard {s.is_number} based on manifest metadata" for s, _ in discovered],
                    unsupported_claims=[],
                    citation_errors=[],
                    warnings=["Metadata-backed discovery from authoritative 100-standard corpus."],
                )

                return RAGAnswer(
                    query=query_obj,
                    answer_text=answer_text,
                    citations=citations,
                    grounding_status=GroundingStatus.PARTIALLY_GROUNDED,
                    grounded=True,
                    retrieved_chunk_ids=[],
                    validation=val_result,
                    warnings=[],
                    execution_metadata={
                        "total_elapsed_ms": elapsed_ms,
                        "retrieval_elapsed_ms": retrieval_elapsed_ms,
                        "generation_elapsed_ms": gen_elapsed_ms,
                        "llm_provider": active_provider_name,
                        "response_mode": "metadata_fallback",
                        "matched_standards_count": len(discovered),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                )

            # If discovery found no candidates meeting confidence threshold, return honest insufficient context
            if query_obj.language == RAGLanguage.HI:
                msg = "उपलब्ध बीआईएस संदर्भ सामग्री में इस प्रश्न का उत्तर देने के लिए पर्याप्त जानकारी नहीं है।"
            else:
                msg = "The provided Indian Standards context does not contain sufficient information to answer this question."

            val_result = GroundingValidationResult(
                status=GroundingStatus.INSUFFICIENT_CONTEXT,
                grounded=False,
                supported_claims=[],
                unsupported_claims=[],
                citation_errors=[],
                warnings=["Retrieval returned 0 candidates matching query criteria."],
            )

            return RAGAnswer(
                query=query_obj,
                answer_text=msg,
                citations=[],
                grounding_status=GroundingStatus.INSUFFICIENT_CONTEXT,
                grounded=False,
                retrieved_chunk_ids=[],
                validation=val_result,
                warnings=["Insufficient context available in corpus."],
                execution_metadata={
                    "total_elapsed_ms": elapsed_ms,
                    "retrieval_elapsed_ms": retrieval_elapsed_ms,
                    "generation_elapsed_ms": 0.0,
                    "llm_provider": self.llm_provider.provider_name,
                    "response_mode": "insufficient_context",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

        # 4. Assemble context with provenance and budget constraints
        context: List[RAGContext] = self.context_builder.build_context(
            retrieval_response.results,
            max_chars=query_obj.max_context_chars,
        )

        if not context:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            val_result = GroundingValidationResult(
                status=GroundingStatus.INSUFFICIENT_CONTEXT,
                grounded=False,
                supported_claims=[],
                unsupported_claims=[],
                citation_errors=[],
                warnings=["Assembled context budget was empty."],
            )
            return RAGAnswer(
                query=query_obj,
                answer_text="Context could not be assembled within size limits.",
                citations=[],
                grounding_status=GroundingStatus.INSUFFICIENT_CONTEXT,
                grounded=False,
                retrieved_chunk_ids=[],
                validation=val_result,
                warnings=["Context budget exhaustion."],
                execution_metadata={
                    "total_elapsed_ms": elapsed_ms,
                    "retrieval_elapsed_ms": retrieval_elapsed_ms,
                    "generation_elapsed_ms": 0.0,
                    "llm_provider": self.llm_provider.provider_name,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

        # 5. Build prompt
        prompt = self.prompt_builder.build_prompt(query_obj, context)

        # 6. Generate answer using LLM provider
        gen_start = time.perf_counter()
        answer_text = self.llm_provider.generate_answer(
            prompt=prompt,
            context=context,
            language=query_obj.language,
        )
        gen_elapsed_ms = round((time.perf_counter() - gen_start) * 1000, 2)

        # 7. Collect unique citations from context
        citations: List[CitationReference] = []
        for ctx in context:
            if ctx.citation and ctx.citation not in citations:
                citations.append(ctx.citation)

        # 8. Grounding & anti-hallucination validation
        validation_result = self.grounding_validator.validate(
            answer_text=answer_text,
            context=context,
            citations=citations,
        )

        total_elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        retrieved_chunk_ids = [c.chunk_id for c in context]

        return RAGAnswer(
            query=query_obj,
            answer_text=answer_text,
            citations=citations,
            grounding_status=validation_result.status,
            grounded=validation_result.grounded,
            retrieved_chunk_ids=retrieved_chunk_ids,
            validation=validation_result,
            warnings=validation_result.warnings,
            execution_metadata={
                "total_elapsed_ms": total_elapsed_ms,
                "retrieval_elapsed_ms": retrieval_elapsed_ms,
                "generation_elapsed_ms": gen_elapsed_ms,
                "llm_provider": self.llm_provider.provider_name,
                "candidates_retrieved": len(retrieval_response.results),
                "chunks_in_context": len(context),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
