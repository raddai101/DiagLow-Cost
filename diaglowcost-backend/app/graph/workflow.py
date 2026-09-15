from typing import TypedDict, Any
from langgraph.graph import StateGraph, END
from app.core.config import get_settings
from app.rag.service import get_retriever
from app.llm.ollama import OllamaClient

class State(TypedDict, total=False):
    question: str
    history: list[dict]
    top_k: int
    sources: list[dict]
    answer: str

retriever = get_retriever()
llm = OllamaClient()
settings = get_settings()

def retrieve(state: State) -> dict[str, Any]:
    sources = retriever.search(state["question"], state.get("top_k", settings.top_k))
    return {"sources": sources}

async def generate(state: State) -> dict[str, Any]:
    context_parts = []
    total = 0
    for s in state["sources"]:
        block = f"[{s['id']}] {s['document']}"
        if total + len(block) > settings.max_context_chars:
            break
        context_parts.append(block)
        total += len(block)
    answer = await llm.generate(state["question"], "\n\n".join(context_parts), state.get("history", []))
    return {"answer": answer}

graph_builder = StateGraph(State)
graph_builder.add_node("retrieve", retrieve)
graph_builder.add_node("generate", generate)
graph_builder.set_entry_point("retrieve")
graph_builder.add_edge("retrieve", "generate")
graph_builder.add_edge("generate", END)
graph = graph_builder.compile()
