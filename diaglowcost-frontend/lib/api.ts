export type Health = {
  status: string;
  llm: string;
  rag_ready: boolean;
  database: string;
};

export type RagStats = {
  ready: boolean;
  documents: number;
  embedding_model: string;
  dimension: number | null;
  metadata: string | null;
  vector_store: string;
  collection: string;
};

export type Source = {
  id: string;
  drug: string;
  condition: string;
  rating: number;
  score: number;
};

export type ChatResponse = {
  session_id: string;
  answer: string;
  sources: Source[];
};

export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = `Erreur API (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {}
    throw new Error(detail);
  }
  return response.json();
}

export const api = {
  health: () => request<Health>("/health"),
  ragStats: () => request<RagStats>("/rag/stats"),
  createSession: () => request<{ id: string; created_at: string }>("/sessions", { method: "POST", body: "{}" }),
  messages: (sessionId: string) => request<Message[]>(`/sessions/${sessionId}/messages`),
  chat: (sessionId: string, message: string, topK = 5) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, message, top_k: topK }),
    }),
  search: (query: string, topK = 5) =>
    request<{ query: string; sources: Source[] }>("/rag/search", {
      method: "POST",
      body: JSON.stringify({ query, top_k: topK }),
    }),
};