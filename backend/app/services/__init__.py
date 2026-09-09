"""Business logic and service layer for BISaarthi."""

from app.services.bis_cache import BISCache
from app.services.bis_client import BISAPIError, BISClient
from app.services.bis_parser import (
    parse_departments_response,
    parse_groups_response,
    parse_laboratories_response,
    parse_licenses_response,
    parse_standards_list_response,
    parse_subgroups_response,
)
from app.services.bis_resolver import (
    clean_text,
    evaluate_manifest_standard,
    is_obsolete_or_withdrawn,
    match_standard_identities,
    parse_is_number,
)
from app.services.bis_validator import APPROVED_CATEGORIES, BISManifestValidator

from app.services.bis_document_normalizer import (
    cleanup_hyphenation,
    cleanup_soft_linebreaks,
    detect_headings_in_text,
    normalize_extracted_document,
    normalize_unicode_and_whitespace,
    run_normalization_manifest_and_save,
)
from app.services.bis_normalization_validator import (
    detect_repeated_headers_footers,
    validate_extraction_input,
    validate_normalization_conservation,
)

from app.services.bis_chunk_validator import (
    validate_chunk_conservation_and_integrity,
    validate_normalization_input,
)
from app.services.bis_document_chunker import (
    chunk_normalized_document,
    parse_document_hierarchy,
    partition_into_chunks,
    run_chunking_manifest_and_save,
)

from app.services.bis_embedding import (
    EmbeddingService,
    run_embedding_manifest_and_save,
)
from app.services.bis_embedding_provider import (
    BaseEmbeddingProvider,
    MockEmbeddingProvider,
)
from app.services.bis_embedding_validator import (
    generate_deterministic_vector_id,
    validate_chunk_input_for_embedding,
    validate_vector_record,
)
from app.services.bis_vector_store import (
    BaseVectorStore,
    InMemoryVectorStore,
    cosine_similarity,
)

from app.services.bis_citation_builder import CitationBuilder
from app.services.bis_dense_retriever import (
    BaseDenseRetriever,
    VectorStoreDenseRetriever,
)
from app.services.bis_hybrid_retriever import HybridRetriever
from app.services.bis_keyword_retriever import (
    BM25KeywordRetriever,
    BaseKeywordRetriever,
    tokenize_technical_text,
)
from app.services.bis_retrieval import BISRetrievalService

from app.services.bis_llm_provider import (
    BaseLLMProvider,
    MockLLMProvider,
)
from app.services.bis_rag_prompt import GroundedPromptBuilder
from app.services.bis_rag_context import RAGContextBuilder
from app.services.bis_grounding_validator import GroundingValidator
from app.services.bis_rag import BISRAGService
from app.services.bis_corpus_service import BISCorpusService

from app.services.bis_standard_detail_service import BISStandardDetailService

__all__ = [
    "BISCache",
    "BISAPIError",
    "BISClient",
    "parse_groups_response",
    "parse_subgroups_response",
    "parse_departments_response",
    "parse_standards_list_response",
    "parse_laboratories_response",
    "parse_licenses_response",
    "clean_text",
    "parse_is_number",
    "match_standard_identities",
    "is_obsolete_or_withdrawn",
    "evaluate_manifest_standard",
    "APPROVED_CATEGORIES",
    "BISManifestValidator",
    "normalize_unicode_and_whitespace",
    "cleanup_hyphenation",
    "cleanup_soft_linebreaks",
    "detect_headings_in_text",
    "normalize_extracted_document",
    "run_normalization_manifest_and_save",
    "validate_extraction_input",
    "detect_repeated_headers_footers",
    "validate_normalization_conservation",
    "validate_normalization_input",
    "validate_chunk_conservation_and_integrity",
    "parse_document_hierarchy",
    "partition_into_chunks",
    "chunk_normalized_document",
    "run_chunking_manifest_and_save",
    "BaseEmbeddingProvider",
    "MockEmbeddingProvider",
    "BaseVectorStore",
    "InMemoryVectorStore",
    "cosine_similarity",
    "generate_deterministic_vector_id",
    "validate_chunk_input_for_embedding",
    "validate_vector_record",
    "EmbeddingService",
    "run_embedding_manifest_and_save",
    "CitationBuilder",
    "tokenize_technical_text",
    "BaseKeywordRetriever",
    "BM25KeywordRetriever",
    "BaseDenseRetriever",
    "VectorStoreDenseRetriever",
    "HybridRetriever",
    "BISRetrievalService",
    "BaseLLMProvider",
    "MockLLMProvider",
    "GroundedPromptBuilder",
    "RAGContextBuilder",
    "GroundingValidator",
    "BISRAGService",
    "BISCorpusService",
    "BISStandardDetailService",
]






