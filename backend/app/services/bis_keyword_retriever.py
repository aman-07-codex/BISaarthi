"""BM25-style keyword retriever with conservative technical tokenization for Phase 5B."""

import math
import re
from typing import Any, Dict, List, Optional, Protocol, Set, runtime_checkable

from app.schemas.bis_retrieval import RetrievalCandidate, RetrievalMethod

# Regex for technical token extraction
IS_PATTERN = re.compile(r"\bIS\s*(\d+)(?:\s*\([^\)]+\))?(?::\d{4})?\b", re.IGNORECASE)
UNIT_PATTERN = re.compile(r"\b(\d+(?:\.\d+)?)\s*(V|kV|Hz|mm|cm|m|kg|g|%|°C|W|kW|A|mA)\b", re.IGNORECASE)
CLAUSE_PATTERN = re.compile(r"\b\d+(\.\d+)+\b")
WORD_PATTERN = re.compile(r"\b[a-zA-Z0-9_\-]{2,}\b")


def tokenize_technical_text(text: str) -> List[str]:
    """Tokenizes text while preserving technical identifiers, clause numbers, and units."""
    if not text:
        return []

    tokens: List[str] = []
    text_lower = text.lower()

    # 1. Extract and normalize IS numbers (e.g. 'is 2082:2018' -> 'is_2082', '2082')
    for match in IS_PATTERN.finditer(text):
        full_match = re.sub(r"[^\w]", "_", match.group(0).lower()).strip("_")
        base_num = match.group(1)
        tokens.append(full_match)
        tokens.append(f"is_{base_num}")
        tokens.append(base_num)

    # 2. Extract units (e.g. '230 V' -> '230v', '230', 'v')
    for match in UNIT_PATTERN.finditer(text):
        val = match.group(1)
        unit = match.group(2).lower()
        tokens.append(f"{val}{unit}")
        tokens.append(val)
        tokens.append(unit)

    # 3. Extract clause numbers (e.g. '6.1.1' -> '6.1.1', '6.1', '6')
    for match in CLAUSE_PATTERN.finditer(text):
        cl = match.group(0)
        tokens.append(cl)
        parts = cl.split(".")
        if len(parts) > 1:
            tokens.append(".".join(parts[:-1]))
        tokens.append(parts[0])

    # 4. Extract standard alphanumeric words
    for match in WORD_PATTERN.finditer(text_lower):
        token = match.group(0)
        tokens.append(token)

    return tokens


@runtime_checkable
class BaseKeywordRetriever(Protocol):
    """Protocol for lexical/keyword retrieval systems."""

    def index_chunks(self, chunks: List[Dict[str, Any]]) -> None:
        """Indexes a list of Phase 4C chunk dictionaries."""
        ...

    def remove_chunks(self, chunk_ids: List[str]) -> int:
        """Removes chunks from index by ID. Returns deleted count."""
        ...

    def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        score_threshold: Optional[float] = None
    ) -> List[RetrievalCandidate]:
        """Performs BM25 keyword search over indexed chunks."""
        ...

    def count(self) -> int:
        """Total chunks currently indexed."""
        ...

    def clear(self) -> None:
        """Clears all indexed chunks."""
        ...


class BM25KeywordRetriever:
    """Deterministic in-memory BM25 keyword retriever for technical standard chunks."""

    def __init__(self, k1: float = 1.5, b: float = 0.75) -> None:
        self.k1 = k1
        self.b = b
        self._chunks: Dict[str, Dict[str, Any]] = {}
        self._doc_tokens: Dict[str, List[str]] = {}
        self._doc_token_counts: Dict[str, Dict[str, int]] = {}
        self._doc_freqs: Dict[str, int] = {}
        self._doc_lengths: Dict[str, int] = {}
        self._avgdl: float = 0.0

    def index_chunks(self, chunks: List[Dict[str, Any]]) -> None:
        """Indexes chunks, extracting technical tokens and updating BM25 corpus frequencies."""
        for c in chunks:
            c_id = c["chunk_id"]
            text = c.get("text", "")
            tokens = tokenize_technical_text(text)

            # If chunk already indexed, decrement old counts
            if c_id in self._chunks:
                self._decrement_doc_freqs(c_id)

            self._chunks[c_id] = c
            self._doc_tokens[c_id] = tokens
            self._doc_lengths[c_id] = len(tokens)

            # Count token frequencies in document
            counts: Dict[str, int] = {}
            for t in tokens:
                counts[t] = counts.get(t, 0) + 1
            self._doc_token_counts[c_id] = counts

            # Increment corpus doc freqs
            for t in counts.keys():
                self._doc_freqs[t] = self._doc_freqs.get(t, 0) + 1

        self._recompute_avgdl()

    def remove_chunks(self, chunk_ids: List[str]) -> int:
        """Removes specified chunk IDs from index."""
        deleted = 0
        for cid in chunk_ids:
            if cid in self._chunks:
                self._decrement_doc_freqs(cid)
                del self._chunks[cid]
                del self._doc_tokens[cid]
                del self._doc_token_counts[cid]
                del self._doc_lengths[cid]
                deleted += 1
        self._recompute_avgdl()
        return deleted

    def _decrement_doc_freqs(self, chunk_id: str) -> None:
        """Decrements doc frequencies for a chunk being removed or re-indexed."""
        counts = self._doc_token_counts.get(chunk_id, {})
        for t in counts.keys():
            if t in self._doc_freqs:
                self._doc_freqs[t] -= 1
                if self._doc_freqs[t] <= 0:
                    del self._doc_freqs[t]

    def _recompute_avgdl(self) -> None:
        """Recalculates average document token length."""
        total_docs = len(self._doc_lengths)
        if total_docs == 0:
            self._avgdl = 0.0
        else:
            self._avgdl = sum(self._doc_lengths.values()) / total_docs

    def count(self) -> int:
        return len(self._chunks)

    def clear(self) -> None:
        self._chunks.clear()
        self._doc_tokens.clear()
        self._doc_token_counts.clear()
        self._doc_freqs.clear()
        self._doc_lengths.clear()
        self._avgdl = 0.0

    def _matches_filters(self, chunk: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        """Evaluates whether a chunk satisfies metadata filter constraints."""
        for k, v in filters.items():
            if v is not None and chunk.get(k) != v:
                return False
        return True

    def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        score_threshold: Optional[float] = None
    ) -> List[RetrievalCandidate]:
        """Scores all matching chunks using BM25 and returns ranked RetrievalCandidate objects."""
        if not query or not query.strip() or not self._chunks:
            return []

        query_tokens = tokenize_technical_text(query)
        if not query_tokens:
            return []

        n_docs = len(self._chunks)
        candidates: List[RetrievalCandidate] = []

        for c_id, chunk_data in self._chunks.items():
            if filters and not self._matches_filters(chunk_data, filters):
                continue

            doc_len = self._doc_lengths.get(c_id, 0)
            doc_counts = self._doc_token_counts.get(c_id, {})
            score = 0.0

            for q_tok in set(query_tokens):
                if q_tok in doc_counts:
                    tf = doc_counts[q_tok]
                    df = self._doc_freqs.get(q_tok, 0)

                    # Standard Lucene/BM25 IDF formula
                    idf = math.log(1.0 + (n_docs - df + 0.5) / (df + 0.5))

                    # BM25 term frequency saturation
                    denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self._avgdl if self._avgdl > 0 else 1.0))
                    score += idf * ((tf * (self.k1 + 1.0)) / denom)

            if score > 0.0 and (score_threshold is None or score >= score_threshold):
                cand = RetrievalCandidate(
                    chunk_id=c_id,
                    standard_id=chunk_data.get("standard_id"),
                    standard_enc_id=chunk_data.get("standard_enc_id"),
                    is_number=chunk_data.get("is_number", "IS"),
                    title=chunk_data.get("title"),
                    category=chunk_data.get("category", "General"),
                    chunk_type=chunk_data.get("chunk_type", "content"),
                    section=chunk_data.get("section"),
                    section_title=chunk_data.get("section_title"),
                    clause=chunk_data.get("clause"),
                    clause_title=chunk_data.get("clause_title"),
                    parent_clause=chunk_data.get("parent_clause"),
                    annex_id=chunk_data.get("annex_id"),
                    table_id=chunk_data.get("table_id"),
                    source_pages=chunk_data.get("source_pages", []),
                    source_pdf=chunk_data.get("source_pdf", ""),
                    source_pdf_sha256=chunk_data.get("source_pdf_sha256", ""),
                    source_chunk_path=chunk_data.get("source_chunk_path", ""),
                    text=chunk_data.get("text", ""),
                    score=round(score, 4),
                    keyword_score=round(score, 4),
                    retrieval_methods=[RetrievalMethod.KEYWORD],
                )
                candidates.append(cand)

        # Sort descending by BM25 score
        candidates.sort(key=lambda x: (x.score, x.chunk_id), reverse=True)

        for rank, c in enumerate(candidates[:top_k], start=1):
            c.keyword_rank = rank

        return candidates[:top_k]
