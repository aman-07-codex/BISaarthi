"""Comprehensive test suite for Phase 6A: RAG Synthesis & Context-Grounded Answering Engine."""

import pytest
from pydantic import ValidationError

from app.schemas.bis_rag import (
    GroundingStatus,
    GroundingValidationResult,
    RAGAnswer,
    RAGContext,
    RAGLanguage,
    RAGQuery,
)
from app.schemas.bis_retrieval import (
    CitationReference,
    RetrievalCandidate,
    RetrievalMethod,
    RetrievalQuery,
)
from app.services.bis_citation_builder import CitationBuilder
from app.services.bis_grounding_validator import GroundingValidator
from app.services.bis_llm_provider import MockLLMProvider
from app.services.bis_rag import BISRAGService
from app.services.bis_rag_context import RAGContextBuilder
from app.services.bis_rag_prompt import GroundedPromptBuilder
from app.services.bis_retrieval import BISRetrievalService


# =====================================================================
# Synthetic Fixtures for Offline Testing
# =====================================================================

@pytest.fixture
def synthetic_chunks():
    """Synthetic standard chunks for testing context and retrieval."""
    return [
        {
            "chunk_id": "SYN-CHUNK-001",
            "standard_id": 1,
            "is_number": "IS 2082:2018",
            "title": "Stationary Storage Type Electric Water Heaters",
            "category": "ELECTRICAL",
            "chunk_type": "clause",
            "section": "6",
            "clause": "6.1",
            "parent_clause": "6",
            "source_pages": [12],
            "source_pdf": "IS.2082.2018.pdf",
            "source_pdf_sha256": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "source_chunk_path": "data/bis_chunks/IS_2082_2018/chunk_001.json",
            "text": "The water heater shall incorporate a thermal cut-out with non-self-resetting mechanism to prevent overheating.",
        },
        {
            "chunk_id": "SYN-CHUNK-002",
            "standard_id": 1,
            "is_number": "IS 2082:2018",
            "title": "Stationary Storage Type Electric Water Heaters",
            "category": "ELECTRICAL",
            "chunk_type": "clause",
            "section": "7",
            "clause": "7.2",
            "parent_clause": "7",
            "source_pages": [15, 16],
            "source_pdf": "IS.2082.2018.pdf",
            "source_pdf_sha256": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "source_chunk_path": "data/bis_chunks/IS_2082_2018/chunk_002.json",
            "text": "The standing loss per 24 hours shall not exceed the limit specified in Table 1 for rated storage capacities.",
        },
        {
            "chunk_id": "SYN-CHUNK-003",
            "standard_id": 2,
            "is_number": "IS 10601:1983",
            "title": "Safety Requirements for Domestic Pressure Cookers",
            "category": "MECHANICAL",
            "chunk_type": "clause",
            "section": "4",
            "clause": "4.3",
            "parent_clause": "4",
            "source_pages": [5],
            "source_pdf": "IS.10601.1983.pdf",
            "source_pdf_sha256": "123456abcdef123456abcdef123456abcdef123456abcdef123456abcdef1234",
            "source_chunk_path": "data/bis_chunks/IS_10601_1983/chunk_003.json",
            "text": "The metallic body of the pressure cooker shall withstand an internal hydrostatic pressure of 200 kPa without permanent distortion.",
        },
    ]


@pytest.fixture
def synthetic_retrieval_candidates(synthetic_chunks):
    """Converts synthetic chunks into RetrievalCandidate list."""
    builder = CitationBuilder()
    candidates = []
    for idx, c in enumerate(synthetic_chunks, start=1):
        cit = builder.build_citation(c, citation_index=idx)
        cand = RetrievalCandidate(
            chunk_id=c["chunk_id"],
            standard_id=c["standard_id"],
            is_number=c["is_number"],
            title=c["title"],
            category=c["category"],
            chunk_type=c["chunk_type"],
            section=c.get("section"),
            clause=c.get("clause"),
            parent_clause=c.get("parent_clause"),
            source_pages=c.get("source_pages", []),
            source_pdf=c["source_pdf"],
            source_pdf_sha256=c["source_pdf_sha256"],
            source_chunk_path=c["source_chunk_path"],
            text=c["text"],
            score=0.95 - (idx * 0.05),
            citation=cit,
        )
        candidates.append(cand)
    return candidates


# =====================================================================
# 1. RAG Schemas Validation Tests
# =====================================================================

def test_rag_query_valid():
    query = RAGQuery(query_text="What are thermal cutout requirements in IS 2082?", top_k=3, language=RAGLanguage.EN)
    assert query.query_text == "What are thermal cutout requirements in IS 2082?"
    assert query.top_k == 3
    assert query.language == RAGLanguage.EN


def test_rag_query_empty_text_fails():
    with pytest.raises(ValidationError):
        RAGQuery(query_text="")


def test_rag_query_invalid_language():
    with pytest.raises(ValidationError):
        RAGQuery(query_text="Valid query", language="fr")  # type: ignore


def test_rag_context_validation(synthetic_retrieval_candidates):
    builder = RAGContextBuilder()
    ctx = builder.candidate_to_context(synthetic_retrieval_candidates[0])
    assert ctx.chunk_id == "SYN-CHUNK-001"
    assert ctx.is_number == "IS 2082:2018"
    assert ctx.clause == "6.1"
    assert ctx.source_pdf_sha256.startswith("abcdef")
    assert ctx.citation is not None


# =====================================================================
# 2. Prompt Builder Tests
# =====================================================================

def test_grounded_prompt_builder_en(synthetic_retrieval_candidates):
    builder = GroundedPromptBuilder()
    ctx_builder = RAGContextBuilder()
    contexts = [ctx_builder.candidate_to_context(c) for c in synthetic_retrieval_candidates[:2]]
    query = RAGQuery(query_text="Explain thermal cut-out specs", language=RAGLanguage.EN)

    prompt = builder.build_prompt(query, contexts)

    assert "=== SYSTEM INSTRUCTIONS ===" in prompt
    assert "STRICT GROUNDING RULES" in prompt
    assert "=== RETRIEVED INDIAN STANDARDS CONTEXT ===" in prompt
    assert "--- START SOURCE" in prompt
    assert "Chunk ID: SYN-CHUNK-001" in prompt
    assert "thermal cut-out with non-self-resetting mechanism" in prompt
    assert "=== USER QUESTION ===" in prompt
    assert "Explain thermal cut-out specs" in prompt


def test_grounded_prompt_builder_hindi(synthetic_retrieval_candidates):
    builder = GroundedPromptBuilder()
    ctx_builder = RAGContextBuilder()
    contexts = [ctx_builder.candidate_to_context(synthetic_retrieval_candidates[0])]
    query = RAGQuery(query_text="थर्मल कट-आउट आवश्यकताएं क्या हैं?", language=RAGLanguage.HI)

    prompt = builder.build_prompt(query, contexts)

    assert "भारतीय मानक ब्यूरो (BIS)" in prompt
    assert "सख्त नियम" in prompt
    assert "Requested Language: HI" in prompt


def test_grounded_prompt_builder_empty_context():
    builder = GroundedPromptBuilder()
    query = RAGQuery(query_text="No context question")
    prompt = builder.build_prompt(query, [])
    assert "[NO CONTEXT AVAILABLE - RETRIEVAL RETURNED ZERO CHUNKS]" in prompt


# =====================================================================
# 3. Context Builder Tests
# =====================================================================

def test_rag_context_builder_budget_enforcement(synthetic_retrieval_candidates):
    builder = RAGContextBuilder(max_context_chars=180)
    contexts = builder.build_context(synthetic_retrieval_candidates)

    # First chunk is ~110 chars, second chunk is ~108 chars -> total exceeds 180 chars, so only 1 chunk fits
    assert len(contexts) == 1
    assert contexts[0].chunk_id == "SYN-CHUNK-001"


def test_rag_context_builder_truncation_on_first_oversized_chunk(synthetic_retrieval_candidates):
    builder = RAGContextBuilder(max_context_chars=50)
    contexts = builder.build_context(synthetic_retrieval_candidates)

    assert len(contexts) == 1
    assert len(contexts[0].text) <= 55
    assert contexts[0].text.endswith("...")


# =====================================================================
# 4. Mock LLM Provider Tests
# =====================================================================

def test_mock_llm_deterministic_output(synthetic_retrieval_candidates):
    provider = MockLLMProvider()
    ctx_builder = RAGContextBuilder()
    contexts = [ctx_builder.candidate_to_context(synthetic_retrieval_candidates[0])]
    query = RAGQuery(query_text="What does clause 6.1 say?")
    prompt_builder = GroundedPromptBuilder()
    prompt = prompt_builder.build_prompt(query, contexts)

    ans1 = provider.generate_answer(prompt, contexts, language=RAGLanguage.EN)
    ans2 = provider.generate_answer(prompt, contexts, language=RAGLanguage.EN)

    assert ans1 == ans2
    assert "IS 2082:2018 - Clause 6.1" in ans1
    assert "thermal cut-out" in ans1


def test_mock_llm_insufficient_context():
    provider = MockLLMProvider()
    ans_en = provider.generate_answer("prompt", [], language=RAGLanguage.EN)
    assert "insufficient evidence" in ans_en.lower()

    ans_hi = provider.generate_answer("prompt", [], language=RAGLanguage.HI)
    assert "पर्याप्त जानकारी नहीं है" in ans_hi


# =====================================================================
# 5. Grounding Validator Tests
# =====================================================================

def test_grounding_validator_grounded_answer(synthetic_retrieval_candidates):
    validator = GroundingValidator()
    ctx_builder = RAGContextBuilder()
    contexts = [ctx_builder.candidate_to_context(c) for c in synthetic_retrieval_candidates[:2]]
    citations = [c.citation for c in contexts if c.citation is not None]

    answer_text = (
        "According to IS 2082:2018 Clause 6.1, water heaters must have a thermal cut-out. "
        "Furthermore, Clause 7.2 states standing loss per 24 hours must meet limits."
    )

    result = validator.validate(answer_text, contexts, citations)
    assert result.status == GroundingStatus.GROUNDED
    assert result.grounded is True
    assert len(result.citation_errors) == 0
    assert len(result.unsupported_claims) == 0


def test_grounding_validator_hallucinated_is_number(synthetic_retrieval_candidates):
    validator = GroundingValidator()
    ctx_builder = RAGContextBuilder()
    # Context only contains IS 2082
    contexts = [ctx_builder.candidate_to_context(synthetic_retrieval_candidates[0])]
    citations = [contexts[0].citation]

    # Answer hallucinates IS 456 (Concrete) and IS 302
    answer_text = (
        "According to IS 2082:2018 Clause 6.1, thermal cut-outs are required. "
        "Also, IS 456 and IS 302 mandate extra earthing conductors."
    )

    result = validator.validate(answer_text, contexts, citations)
    assert result.grounded is False
    assert result.status in (GroundingStatus.PARTIALLY_GROUNDED, GroundingStatus.UNSUPPORTED)
    assert any("IS 456" in claim or "456" in claim for claim in result.unsupported_claims)


def test_grounding_validator_invalid_citation(synthetic_retrieval_candidates):
    validator = GroundingValidator()
    ctx_builder = RAGContextBuilder()
    contexts = [ctx_builder.candidate_to_context(synthetic_retrieval_candidates[0])]

    # Fake citation referencing a chunk not in context
    fake_citation = CitationReference(
        citation_id="CIT-999",
        is_number="IS 9999:2020",
        chunk_id="NONEXISTENT-CHUNK-999",
        formatted_citation="IS 9999:2020 (Page 1)",
    )

    answer_text = "Based on IS 2082:2018 Clause 6.1, protection is mandatory."
    result = validator.validate(answer_text, contexts, [fake_citation])

    assert result.grounded is False
    assert result.status == GroundingStatus.UNSUPPORTED
    assert any("NONEXISTENT-CHUNK-999" in err for err in result.citation_errors)


def test_grounding_validator_empty_context():
    validator = GroundingValidator()
    result = validator.validate("There is insufficient context available.", [], [])
    assert result.status == GroundingStatus.INSUFFICIENT_CONTEXT
    assert result.grounded is False


# =====================================================================
# 6. BISRAGService Orchestration Tests
# =====================================================================

def test_rag_service_end_to_end_grounded(synthetic_chunks):
    # Setup retrieval service with indexed synthetic chunks
    retrieval_service = BISRetrievalService()
    retrieval_service.index_chunks(synthetic_chunks)

    rag_service = BISRAGService(retrieval_service=retrieval_service)

    query = RAGQuery(
        query_text="thermal cut-out non-self-resetting water heater",
        top_k=2,
        language=RAGLanguage.EN,
    )

    answer: RAGAnswer = rag_service.answer_query(query)

    assert answer.grounding_status == GroundingStatus.GROUNDED
    assert answer.grounded is True
    assert len(answer.citations) >= 1
    assert "IS 2082:2018" in answer.answer_text
    assert "SYN-CHUNK-001" in answer.retrieved_chunk_ids
    assert answer.execution_metadata["llm_provider"] == "mock-deterministic-llm"


def test_rag_service_empty_retrieval_insufficient_context():
    # Empty retrieval service
    empty_retrieval_service = BISRetrievalService()
    rag_service = BISRAGService(retrieval_service=empty_retrieval_service)

    query = RAGQuery(query_text="Non-existent solar photovoltaic standard requirement")
    answer = rag_service.answer_query(query)

    assert answer.grounding_status == GroundingStatus.INSUFFICIENT_CONTEXT
    assert answer.grounded is False
    assert len(answer.citations) == 0
    assert "not contain sufficient information" in answer.answer_text.lower()


def test_rag_service_hindi_language_state(synthetic_chunks):
    retrieval_service = BISRetrievalService()
    retrieval_service.index_chunks(synthetic_chunks)

    rag_service = BISRAGService(retrieval_service=retrieval_service)

    query = RAGQuery(
        query_text="thermal cut-out",
        language=RAGLanguage.HI,
    )

    answer = rag_service.answer_query(query)

    assert answer.query.language == RAGLanguage.HI
    assert "बीआईएस संदर्भ के अनुसार" in answer.answer_text
    assert answer.grounding_status == GroundingStatus.GROUNDED


def test_rag_service_metadata_filters(synthetic_chunks):
    retrieval_service = BISRetrievalService()
    retrieval_service.index_chunks(synthetic_chunks)

    rag_service = BISRAGService(retrieval_service=retrieval_service)

    # Filter strictly for MECHANICAL category (which is pressure cookers)
    query = RAGQuery(
        query_text="body pressure hydrostatic",
        category="MECHANICAL",
    )

    answer = rag_service.answer_query(query)
    assert answer.grounding_status == GroundingStatus.GROUNDED
    assert "IS 10601:1983" in answer.answer_text
    assert "SYN-CHUNK-003" in answer.retrieved_chunk_ids
