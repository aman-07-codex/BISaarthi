"""LLM provider abstraction, Google Gemini integration, and offline deterministic mock for Phase 6A/8A RAG synthesis."""

import os
from typing import Any, List, Optional, Protocol, runtime_checkable

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.bis_rag import RAGContext, RAGLanguage

logger = get_logger("bisaarthi.llm")


@runtime_checkable
class BaseLLMProvider(Protocol):
    """Protocol for provider-agnostic Large Language Model completion engine."""

    @property
    def provider_name(self) -> str:
        """Name or identifier of the LLM provider."""
        ...

    def generate_answer(
        self,
        prompt: str,
        context: List[RAGContext],
        language: RAGLanguage = RAGLanguage.EN,
    ) -> str:
        """Generates a context-grounded response text based on prompt and retrieved context.
        
        Args:
            prompt: Structured prompt string containing system instructions, context, and query.
            context: List of retrieved RAGContext chunks.
            language: Requested language preference ('en' or 'hi').
            
        Returns:
            Generated text string.
        """
        ...


class MockLLMProvider:
    """Offline, deterministic mock LLM provider for tests and architectural validation.
    
    Operates strictly without network calls and produces reproducible synthetic output
    traceable to the provided RAGContext fixtures.
    """

    def __init__(self, provider_name: str = "mock-deterministic-llm") -> None:
        self._provider_name = provider_name

    @property
    def provider_name(self) -> str:
        return self._provider_name

    def generate_answer(
        self,
        prompt: str,
        context: List[RAGContext],
        language: RAGLanguage = RAGLanguage.EN,
    ) -> str:
        """Produces deterministic synthetic answer text strictly derived from provided context."""
        if not context:
            if language == RAGLanguage.HI:
                return "उपलब्ध बीआईएस संदर्भ सामग्री में इस प्रश्न का उत्तर देने के लिए पर्याप्त जानकारी नहीं है।"
            return "Based on the available BIS context, there is insufficient evidence to answer the question."

        lines: List[str] = []
        if language == RAGLanguage.HI:
            lines.append("बीआईएस संदर्भ के अनुसार:")
        else:
            lines.append("Based on the supplied Indian Standard context:")

        for item in context:
            ref_parts = [item.is_number]
            if item.clause:
                ref_parts.append(f"Clause {item.clause}")
            elif item.section:
                ref_parts.append(f"Section {item.section}")
            ref_label = " - ".join(ref_parts)

            # Extract a clean snippet from the chunk text
            snippet = item.text.strip().replace("\n", " ")
            if len(snippet) > 160:
                snippet = snippet[:157] + "..."

            lines.append(f"[{ref_label}]: {snippet}")

        if language == RAGLanguage.HI:
            lines.append("यह उत्तर प्रदान किए गए तकनीकी संदर्भ पर आधारित है।")
        else:
            lines.append("This technical response is strictly derived from the retrieved BIS requirements.")

        return "\n".join(lines)


class GeminiLLMProvider:
    """Production LLM provider using Google's official Gemini GenAI SDK.
    
    Acts as a language synthesis engine strictly grounded in supplied BIS evidence/metadata.
    Falls back gracefully to deterministic synthesis if API key is unconfigured or calls fail.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout: Optional[float] = None,
        max_output_tokens: Optional[int] = None,
        client: Optional[Any] = None,
    ) -> None:
        self.api_key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.model_name = model_name or settings.GEMINI_MODEL
        self.timeout = timeout if timeout is not None else settings.GEMINI_TIMEOUT
        self.max_output_tokens = max_output_tokens or settings.GEMINI_MAX_OUTPUT_TOKENS
        self._client = client
        self._fallback_provider = MockLLMProvider()

    @property
    def provider_name(self) -> str:
        return f"gemini:{self.model_name}"

    @property
    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def _get_client(self) -> Any:
        if self._client is not None:
            return self._client
        if not self.is_available:
            return None
        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
            return self._client
        except Exception as e:
            logger.warning("Failed to initialize Google GenAI Client: %s", str(e))
            return None

    def generate_answer(
        self,
        prompt: str,
        context: List[RAGContext],
        language: RAGLanguage = RAGLanguage.EN,
    ) -> str:
        """Generates grounded answer using Gemini API, with deterministic fallback on failure."""
        client = self._get_client()
        if client is None:
            logger.info("Gemini API key not configured or client unavailable. Using fallback synthesis.")
            return self._fallback_provider.generate_answer(prompt, context, language)

        try:
            config = None
            try:
                from google.genai import types
                config = types.GenerateContentConfig(
                    max_output_tokens=self.max_output_tokens,
                    temperature=0.2,
                )
            except Exception:
                pass

            kwargs = {
                "model": self.model_name,
                "contents": prompt,
            }
            if config is not None:
                kwargs["config"] = config

            response = client.models.generate_content(**kwargs)

            if response and response.text and response.text.strip():
                return response.text.strip()

            logger.warning("Gemini returned empty text response. Using fallback.")
            return self._fallback_provider.generate_answer(prompt, context, language)

        except Exception as err:
            logger.warning("Gemini API error during generation (%s). Using fallback synthesis.", str(err))
            return self._fallback_provider.generate_answer(prompt, context, language)

    def generate_metadata_synthesis(
        self,
        prompt: str,
        language: RAGLanguage = RAGLanguage.EN,
    ) -> Optional[str]:
        """Synthesizes natural, metadata-grounded response for product discovery fallback."""
        client = self._get_client()
        if client is None:
            return None

        try:
            config = None
            try:
                from google.genai import types
                config = types.GenerateContentConfig(
                    max_output_tokens=self.max_output_tokens,
                    temperature=0.2,
                )
            except Exception:
                pass

            kwargs = {
                "model": self.model_name,
                "contents": prompt,
            }
            if config is not None:
                kwargs["config"] = config

            response = client.models.generate_content(**kwargs)

            if response and response.text and response.text.strip():
                return response.text.strip()
            return None

        except Exception as err:
            logger.warning("Gemini API error during metadata synthesis (%s). Falling back.", str(err))
            return None


def get_llm_provider(provider_type: Optional[str] = None) -> BaseLLMProvider:
    """Factory for selecting the active LLM provider based on settings and environment."""
    selected = (provider_type or settings.LLM_PROVIDER).lower()
    if selected == "gemini":
        gemini_provider = GeminiLLMProvider()
        if gemini_provider.is_available:
            return gemini_provider
        return MockLLMProvider()
    return MockLLMProvider()

