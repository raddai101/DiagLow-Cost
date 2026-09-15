import httpx
from app.core.config import get_settings

SYSTEM_PROMPT = """
    You are the DiagLowCost AI assistant.

    Your role is to answer the user's questions using:
    1. the context retrieved by the RAG system;
    2. the conversahat was previously discussed, use the
    previous context to naturally contintion history;
    3. the knowledge provided in the retrieved context.

    RULES:

    - Provide clear, accurate, and useful answers.
    - Prioritize the information provided by the RAG context.
    - Never invent information that is not present in the provided context when
    the question requires information from the document database.
    - If the available information is insufficient, clearly state that the
    available data is not sufficient to provide a certain answer.
    - Take the conversation history into account to understand questions that
    refer to previous exchanges.
    - When the user returns to a topic tue the conversation.
    - Do not unnecessarily repeat the entire conversation.
    - Respond in the same language used by the user, unless the user requests
    another language.
    - When RAG sources are provided, cite them using their source identifier
    in square brackets, for example [2202].
    - Never fabricate a source or source identifier.
"""

class OllamaClient:
    def __init__(self):
        s = get_settings()
        self.base = s.ollama_base_url.rstrip("/")
        self.model = s.ollama_model

    async def generate(self, question: str, context: str, history: list[dict] | None = None) -> str:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            messages.extend(history[-8:])
        messages.append({"role": "user", "content": f"Question:\n{question}\n\nRetrieved DrugLib context:\n{context}"})
        payload = {"model": self.model, "messages": messages, "stream": False, "options": {"temperature": 0}}
        async with httpx.AsyncClient(timeout=180) as client:
            r = await client.post(f"{self.base}/api/chat", json=payload)
            r.raise_for_status()
            return r.json()["message"]["content"].strip()
