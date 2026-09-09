import json
from app.services.bis_rag import BISRAGService
from app.services.bis_corpus_service import BISCorpusService
from app.services.bis_llm_provider import MockLLMProvider
from app.schemas.bis_rag import RAGQuery

corpus_svc = BISCorpusService.get_instance()
rag_svc = BISRAGService(corpus_service=corpus_svc, llm_provider=MockLLMProvider())

queries = [
    "What standards are relevant for manufacturing reinforced concrete structures?",
    "Tell me about IS 456:2000.",
    "What amendments are associated with IS 456:2000?",
    "What testing laboratories are available for IS 10500:2012?",
    "What information is available for IS 2082:2018 regarding laboratories and licenses?",
]

for idx, q in enumerate(queries, 1):
    print(f"\n=======================================================")
    print(f"QUERY {idx}: {q}")
    print(f"=======================================================")
    rag_query = RAGQuery(query_text=q)
    ans = rag_svc.answer_query(rag_query)

    print("Grounding Status:", ans.grounding_status)
    print("Grounded:", ans.grounded)
    print("Response Mode:", ans.execution_metadata.get("response_mode"))
    print("Citations Count:", len(ans.citations))
    if ans.citations:
        for c in ans.citations[:3]:
            print(f"  Citation: {c.is_number} | Section: {c.section} | Clause: {c.clause}")
    print("\n--- Answer Text (first 400 chars) ---")
    print(ans.answer_text[:400])
