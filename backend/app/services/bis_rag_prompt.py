from typing import Any, List, Tuple

from app.schemas.bis_api import StandardDetailsResponse
from app.schemas.bis_rag import RAGContext, RAGLanguage, RAGQuery


class GroundedPromptBuilder:
    """Builds strictly bounded, deterministic prompts for context-grounded BIS answering."""

    SYSTEM_INSTRUCTIONS_EN = (
        "You are BISaarthi, an AI assistant for Indian Standards published by the Bureau of Indian Standards (BIS).\n"
        "Your role is to provide accurate, factual, and strictly context-grounded technical answers based on the supplied Indian Standards context (including official BIS structured records, basic details, laboratories, licenses, amendments, Gazette orders, and product manuals).\n\n"
        "STRICT GROUNDING RULES:\n"
        "1. Answer using the facts and structured records explicitly provided in the RETRIEVED CONTEXT below.\n"
        "2. When the user asks about standard applicability or manufacturing a product, identify the relevant Indian Standard(s) from the context, state their official title/category/department, and summarize available official records (such as laboratories, licenses, amendments, or product manuals).\n"
        "3. DO NOT invent fake technical specifications, clause numbers, numerical tolerance limits, or mandatory legal claims not present in the context.\n"
        "4. If clause-level technical specifications are requested but only structured metadata/records are available in the context, clearly explain: 'Structured official BIS information is available, but full clause-level technical standard text is not currently included in the verified BISaarthi corpus.'\n"
        "5. ONLY state 'The provided Indian Standards context does not contain sufficient information to answer this question.' if the retrieved context contains genuinely no relevant standards or information for the user's inquiry.\n"
        "6. Cite the relevant Indian Standard number and source for every factual statement."
    )

    SYSTEM_INSTRUCTIONS_HI = (
        "आप BISaarthi हैं, भारतीय मानक ब्यूरो (BIS) द्वारा प्रकाशित भारतीय मानकों के लिए एक AI सहायक।\n"
        "आपकी भूमिका नीचे दिए गए संदर्भ (आधिकारिक बीआईएस रिकॉर्ड, विवरण, प्रयोगशालाएं, लाइसेंस, संशोधन एवं राजपत्र) के आधार पर सटीक और प्रामाणिक उत्तर देना है।\n\n"
        "सख्त नियम:\n"
        "1. संदर्भ (CONTEXT) में दिए गए तथ्यों और आधिकारिक रिकॉर्ड के आधार पर उत्तर दें।\n"
        "2. निर्माण या लागू मानकों के प्रश्नों पर, संदर्भ से प्रासंगिक मानकों, उनके विभाग/समिति और उपलब्ध आधिकारिक रिकॉर्ड की जानकारी दें।\n"
        "3. अपनी ओर से कोई काल्पनिक विनिर्देश, खंड या कानूनी दावे न जोड़ें।\n"
        "4. यदि पूर्ण तकनीकी पाठ उपलब्ध नहीं है तो स्पष्ट करें कि संरचित आधिकारिक बीआईएस जानकारी उपलब्ध है लेकिन पूर्ण खंड-स्तरीय तकनीकी पाठ वर्तमान कॉर्पस में शामिल नहीं है।\n"
        "5. मानक संख्या और स्रोत का स्पष्ट उल्लेख करें।"
    )

    METADATA_FALLBACK_INSTRUCTIONS_EN = (
        "You are BISaarthi, an assistant for Indian Standards.\n\n"
        "Use ONLY the BISaarthi evidence supplied below.\n"
        "The evidence is curated BIS corpus metadata, not full technical standard documents.\n\n"
        "STRICT EVIDENCE RULES:\n"
        "1. Do not invent technical requirements, clauses, test values, certification conditions, legal requirements, QCO applicability, or other BIS facts.\n"
        "2. If the evidence does not support a statement, do not make that statement.\n"
        "3. Explain which standards appear relevant and why, based only on the supplied metadata.\n"
        "4. Structure your response with clear, clean markdown headings:\n"
        "   ### Recommendation\n"
        "   ### Why it is relevant\n"
        "   ### Other standards to review (if additional standards exist in evidence)"
    )

    METADATA_FALLBACK_INSTRUCTIONS_HI = (
        "आप BISaarthi हैं, भारतीय मानकों के लिए एक AI सहायक।\n\n"
        "केवल नीचे दिए गए बीआईएस सारथी संदर्भ साक्ष्य का उपयोग करें।\n"
        "यह साक्ष्य क्यूरेटेड बीआईएस कॉर्पस मेटाडेटा है, पूर्ण तकनीकी मानक दस्तावेज नहीं।\n\n"
        "सख्त नियम:\n"
        "1. अपनी ओर से कोई तकनीकी आवश्यकताएं, खंड, परीक्षण मान, प्रमाणन शर्तें या कानूनी प्रयोज्यता न जोड़ें।\n"
        "2. केवल दिए गए मेटाडेटा के आधार पर बताएं कि कौन से मानक प्रासंगिक हैं और क्यों।\n"
        "3. IS मानक संख्याओं को बिना अनुवाद किए सटीक रूप में रखें।\n"
        "4. निम्नलिखित शीर्षकों का उपयोग करें:\n"
        "   ### सिफारिश (अनुशंसा)\n"
        "   ### यह क्यों प्रासंगिक है\n"
        "   ### समीक्षा हेतु अन्य संबंधित मानक (यदि उपलब्ध हों)"
    )

    def build_prompt(self, query: RAGQuery, context: List[RAGContext]) -> str:
        """Constructs a deterministic, boundary-enforced prompt string.
        
        Args:
            query: The validated RAG query object.
            context: List of retrieved RAGContext chunks.
            
        Returns:
            Complete prompt string with system rules, formatted context, and query.
        """
        is_hindi = query.language == RAGLanguage.HI
        system_rules = self.SYSTEM_INSTRUCTIONS_HI if is_hindi else self.SYSTEM_INSTRUCTIONS_EN

        parts: List[str] = [
            "=== SYSTEM INSTRUCTIONS ===",
            system_rules,
            "",
            "=== RETRIEVED INDIAN STANDARDS CONTEXT ===",
        ]

        if not context:
            parts.append("[NO CONTEXT AVAILABLE - RETRIEVAL RETURNED ZERO CHUNKS]")
        else:
            for idx, item in enumerate(context, start=1):
                header_items = [f"Source #{idx}", f"Chunk ID: {item.chunk_id}", f"IS: {item.is_number}"]
                if item.title:
                    header_items.append(f"Title: {item.title}")
                if item.clause:
                    header_items.append(f"Clause: {item.clause}")
                elif item.section:
                    header_items.append(f"Section: {item.section}")
                if item.source_pages:
                    header_items.append(f"Pages: {', '.join(str(p) for p in item.source_pages)}")

                parts.append(f"--- START SOURCE ({' | '.join(header_items)}) ---")
                parts.append(item.text.strip())
                parts.append(f"--- END SOURCE [Chunk ID: {item.chunk_id}] ---")
                parts.append("")

        parts.append("=== USER QUESTION ===")
        parts.append(f"Question: {query.query_text.strip()}")
        parts.append(f"Requested Language: {query.language.value.upper()}")
        parts.append("")
        parts.append("=== GROUNDED TECHNICAL RESPONSE ===")

        return "\n".join(parts)

    def build_metadata_fallback_prompt(
        self,
        query: RAGQuery,
        discovered_standards: List[Tuple[StandardDetailsResponse, float]],
    ) -> str:
        """Constructs a prompt for synthesizing conversational responses from discovered corpus metadata.
        
        Args:
            query: The user's original query.
            discovered_standards: List of (StandardDetailsResponse, score) tuples.
            
        Returns:
            Complete prompt string strictly bounded by manifest metadata.
        """
        is_hindi = query.language == RAGLanguage.HI
        instructions = self.METADATA_FALLBACK_INSTRUCTIONS_HI if is_hindi else self.METADATA_FALLBACK_INSTRUCTIONS_EN

        parts: List[str] = [
            "=== SYSTEM INSTRUCTIONS ===",
            instructions,
            "",
            "=== AUTHORITATIVE BISAARTHI CORPUS METADATA EVIDENCE ===",
        ]

        for idx, (std, score) in enumerate(discovered_standards, start=1):
            parts.append(f"--- STANDARD #{idx} (Relevance Score: {score}) ---")
            parts.append(f"IS Number: {std.is_number}")
            parts.append(f"Title: {std.title}")
            parts.append(f"Category: {std.category or 'General'}")
            if std.department:
                parts.append(f"Department: {std.department}")
            if std.committee:
                parts.append(f"Committee: {std.committee}")
            if std.reason_selected:
                parts.append(f"Corpus Reason Selected: {std.reason_selected}")
            if std.primary_use_case:
                parts.append(f"Primary Use Case: {std.primary_use_case}")
            if std.related_selected_standards:
                parts.append(f"Related Standards in Corpus: {', '.join(std.related_selected_standards)}")
            parts.append(f"--- END STANDARD #{idx} ---")
            parts.append("")

        parts.append("=== USER INQUIRY ===")
        parts.append(f"Inquiry: {query.query_text.strip()}")
        parts.append(f"Language: {'Hindi' if is_hindi else 'English'}")
        parts.append("")
        parts.append("=== SYNTHESIZED RESPONSE ===")

        return "\n".join(parts)

