# DiagLowCost Backend

Backend API for the **DiagLowCost** platform, designed to provide an intelligent question-and-answer service based on **RAG (Retrieval-Augmented Generation)**, with semantic search, a document database, a local LLM, and persistent conversation memory.

This document is primarily intended for **Front-End developers** who need to integrate the API into a Web or mobile application.

---

## 1. Overview

DiagLowCost allows users to ask questions to an artificial intelligence system.

When a question is submitted:

```text
Frontend
   │
   │ POST /api/v1/chat
   ▼
FastAPI
   │
   ├── Session management
   │
   ├── History loading
   │
   ├── RAG / document retrieval
   │
   ├── LangGraph
   │
   └── Ollama / Qwen3
           │
           ▼
        AI response
           │
           ▼
       PostgreSQL
   conversation storage
```

The system keeps conversation history so that users can ask follow-up questions without having to repeat the entire context.

---

# 2. Technologies Used

## Backend

| Technology            | Usage                             |
| --------------------- | --------------------------------- |
| Python                | Main programming language         |
| FastAPI               | REST API framework                |
| Uvicorn               | ASGI server                       |
| Pydantic              | Data validation                   |
| SQLAlchemy            | ORM / database access             |
| PostgreSQL            | Application database              |
| ChromaDB              | Vector database                   |
| Sentence Transformers | Embedding generation              |
| LangGraph             | AI workflow orchestration         |
| Ollama                | Local LLM execution               |
| Qwen3 1.7B            | Generation model                  |
| BGE-M3                | Supported/planned embedding model |
| Git                   | Source code management            |

## AI Architecture

The backend mainly uses:

```text
User Question
        │
        ▼
   FastAPI API
        │
        ▼
 Conversation Memory
        │
        ▼
     LangGraph
        │
        ├───────────────┐
        ▼               ▼
      RAG             History
        │               │
        ▼               │
    ChromaDB            │
        │               │
        └───────┬───────┘
                ▼
             Qwen3
           via Ollama
                │
                ▼
             Response
```

---

# 3. Prerequisites

The backend requires:

* Python 3.x
* PostgreSQL
* Ollama
* Git

The currently used model is:

```text
qwen3:1.7b
```

Embeddings use:

```text
sentence-transformers/all-MiniLM-L6-v2
```

The system can also use:

```text
bge-m3
```

depending on the configuration.

---

# 4. Installation

## 4.1 Clone the project

```bash
git clone <repository-url>
cd diaglowcost-backend
```

---

## 4.2 Create the virtual environment

Windows:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

# 5. Install Dependencies

```bash
pip install -r requirements.txt
```

The main dependencies include:

```text
fastapi
uvicorn
sqlalchemy
psycopg
chromadb
sentence-transformers
langgraph
requests
pydantic
python-dotenv
```

---

# 6. `.env` Configuration

Example configuration:

```env
APP_NAME=diaglowcost-backend
ENVIRONMENT=production

HOST=0.0.0.0
PORT=8000

DATABASE_URL=postgresql+psycopg://diaglowcost:change-me@127.0.0.1:5432/diaglowcost

OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_LLM_MODEL=qwen3:1.7b
OLLAMA_EMBEDDING_MODEL=bge-m3

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

TOP_K=5
MAX_CONTEXT_CHARS=12000

CORS_ORIGINS=http://localhost:3000

INDEX_DIR=data/index
TRAIN_DATA=data/raw/drugLibTrain_raw.tsv
TEST_DATA=data/raw/drugLibTest_raw.tsv

CHROMA_DIR=data/chroma
CHROMA_COLLECTION=druglib
```

---

# 7. Start Ollama

Check that Ollama is running:

```bash
ollama list
```

The model should be available:

```text
qwen3:1.7b
```

If necessary:

```bash
ollama pull qwen3:1.7b
```

Ollama normally runs on:

```text
http://127.0.0.1:11434
```

---

# 8. PostgreSQL Database

The database used by the application is:

```text
diaglowcost
```

Example:

```text
Host: 127.0.0.1
Port: 5432
Database: diaglowcost
User: diaglowcost
```

The database contains, among other things, conversation-related data:

```text
chat_sessions
chat_messages
```

---

# 9. RAG Vector Database

The RAG engine uses **ChromaDB**.

The main collection is:

```text
druglib
```

Directory:

```text
data/chroma
```

The training corpus currently contains approximately:

```text
3107 documents
```

with an embedding dimension of:

```text
384
```

---

# 10. Build the RAG Index

Before using document retrieval:

```powershell
$env:PYTHONPATH="."
python scripts/build_index.py
```

Expected output is similar to:

```text
ChromaDB RAG index built from TRAIN only:
3107 documents
dimension=384
collection=druglib
path=data/chroma
```

---

# 11. Start the API

From the project root:

```powershell
$env:PYTHONPATH="."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API is then available at:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

OpenAPI documentation:

```text
http://127.0.0.1:8000/openapi.json
```

---

# 12. Base URL for the Front-End

For local development:

```text
http://127.0.0.1:8000
```

Most endpoints start with:

```text
/api/v1
```

Therefore:

```text
http://127.0.0.1:8000/api/v1
```

---

# 13. CORS

The backend authorizes the Front-End configured in:

```env
CORS_ORIGINS=http://localhost:3000
```

If the React/Next.js/Vue Front-End runs on another port, modify this variable.

Example:

```env
CORS_ORIGINS=http://localhost:5173
```

For a React application using Vite:

```text
http://localhost:5173
```

For a Next.js application:

```text
http://localhost:3000
```

---

# 14. Endpoint List

## Health Check

```http
GET /api/v1/health
```

Allows the Front-End to verify that the backend is running.

### Response

```json
{
  "status": "ok",
  "llm": "qwen3:1.7b",
  "rag_ready": true,
  "database": "ok"
}
```

### JavaScript Example

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/api/v1/health"
);

const data = await response.json();

console.log(data);
```

---

# 15. RAG Statistics

```http
GET /api/v1/rag/stats
```

Returns the status of the document retrieval engine.

### Response

```json
{
  "ready": true,
  "documents": 3107,
  "dimension": 384,
  "vector_store": "chroma",
  "collection": "druglib"
}
```

### Front-End Usage

This endpoint can be used on a page such as:

```text
Administration
     │
     ├── RAG: Ready
     ├── Documents: 3107
     ├── Vector store: Chroma
     └── Dimension: 384
```

---

# 16. Create a Conversation Session

```http
POST /api/v1/sessions
```

A session represents a conversation between a user and the AI.

### Example

```http
POST http://127.0.0.1:8000/api/v1/sessions
Content-Type: application/json
```

### Body

If the API does not require additional parameters:

```json
{}
```

### Response

The backend returns a session identifier.

Conceptual example:

```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

The Front-End should store this identifier.

For example:

```javascript
localStorage.setItem("session_id", data.id);
```

---

# 17. Retrieve Session Messages

```http
GET /api/v1/sessions/{session_id}/messages
```

Example:

```http
GET /api/v1/sessions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/messages
```

This endpoint allows the Front-End to reconstruct the chat interface.

### Usage

When the user opens a conversation:

```text
Frontend
   │
   │ GET /sessions/{id}/messages
   ▼
Backend
   │
   ▼
PostgreSQL
   │
   ▼
History
   │
   ▼
Frontend
```

The Front-End can then display:

```text
User:
Hello...

Assistant:
Hello, how can I help you?

User:
Can you provide more details?

Assistant:
...
```

---

# 18. RAG Search

```http
POST /api/v1/rag/search
```

This endpoint allows the Front-End or an administration tool to directly test document retrieval without requesting a complete AI-generated response.

### Body

Example:

```json
{
  "query": "What is the treatment for depression?",
  "top_k": 5
}
```

### Response

The backend returns the documents that are most relevant to the query.

Conceptual example:

```json
{
  "results": [
    {
      "score": 0.527,
      "document": "...",
      "drugName": "wellbutrin"
    },
    {
      "score": 0.527,
      "document": "...",
      "drugName": "vyvanse"
    }
  ]
}
```

The exact metadata format depends on the corpus.

---

# 19. AI Chat

## Main Endpoint

```http
POST /api/v1/chat
```

This is **the main endpoint that the Front-End should use for the chatbot**.

The Front-End sends a question to the backend.

The backend:

1. retrieves the session;
2. retrieves the conversation history;
3. performs RAG document retrieval;
4. executes the LangGraph workflow;
5. sends the context to the Qwen3 model;
6. generates the response;
7. saves the user question;
8. saves the AI response;
9. returns the response to the Front-End.

---

# 20. Chat Request Example

```http
POST /api/v1/chat
Content-Type: application/json
```

Body:

```json
{
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "message": "What is the treatment for depression?",
  "top_k": 5
}
```

---

# 21. JavaScript Example

```javascript
const sessionId = localStorage.getItem("session_id");

const response = await fetch(
  "http://127.0.0.1:8000/api/v1/chat",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session_id: sessionId,
      message: "What is the treatment for depression?",
      top_k: 5
    })
  }
);

const data = await response.json();

console.log(data);
```

---

# 22. Chat Response

The response contains the generated answer as well as information about the sources used.

Conceptual example:

```json
{
  "answer": "Based on the available documents...",
  "sources": [
    {
      "source": "2202",
      "score": 0.527
    }
  ]
}
```

The Front-End should mainly display:

```text
answer
```

and can optionally display:

```text
sources
```

in a section such as:

```text
Sources Used
------------
[2202]
[1845]
[927]
```

---

# 23. Conversation Memory Management

Memory is persistent.

It is stored in PostgreSQL.

Simplified structure:

```text
chat_sessions
       │
       │ 1
       │
       │ N
       ▼
chat_messages
```

A session can therefore contain multiple messages.

Example:

```text
Session A
│
├── User: What is depression?
├── AI: ...
├── User: What are its symptoms?
├── AI: ...
├── User: And what about the treatment?
└── AI: ...
```

---

# 24. Example of a Conversation with Memory

### First question

```json
{
  "session_id": "abc123",
  "message": "What is depression?"
}
```

The AI responds.

The Front-End can then send:

```json
{
  "session_id": "abc123",
  "message": "What are its symptoms?"
}
```

The backend retrieves the conversation history.

The AI understands that:

```text
"its"
```

refers to the previous topic:

```text
depression
```

The Front-End therefore does not need to send the entire conversation again.

The `session_id` is sufficient for the backend to retrieve the conversation memory.

---

# 25. Role of LangGraph

LangGraph orchestrates the generation process.

Conceptually:

```text
START
  │
  ▼
Question
  │
  ▼
Retrieval
  │
  ▼
Context + History
  │
  ▼
LLM
  │
  ▼
Answer
  │
  ▼
END
```

The Front-End does not need to know the internal details of LangGraph.

It only communicates with:

```http
POST /api/v1/chat
```

---

# 26. Role of ChromaDB

ChromaDB is used as the **vector database**.

During retrieval:

```text
Question
   │
   ▼
Embedding
   │
   ▼
ChromaDB
   │
   ▼
Top K documents
```

For example:

```json
{
  "query": "treatment for depression",
  "top_k": 5
}
```

The backend retrieves the five documents that are semantically closest to the question.

---

# 27. Role of Sentence Transformers

The embedding model transforms a sentence into a vector.

Example:

```text
"What is depression?"
```

becomes approximately:

```text
[0.021, -0.183, 0.074, ...]
```

These vectors are stored in ChromaDB.

This allows documents to be searched according to their **meaning**, rather than only matching exact words.

---

# 28. Role of Ollama

Ollama allows the model to run locally.

Configuration:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_LLM_MODEL=qwen3:1.7b
```

The Front-End normally does **not** communicate directly with Ollama.

Recommended architecture:

```text
Frontend
   │
   ▼
FastAPI
   │
   ▼
LangGraph
   │
   ▼
Ollama
   │
   ▼
Qwen3
```

The Front-End should therefore call FastAPI.

---

# 29. Compatible Front-End Technologies

The REST API can be used with:

* React
* Next.js
* Vue.js
* Angular
* Svelte
* Flutter
* React Native
* Plain JavaScript applications

No specific Front-End library is required.

---

# 30. Example React Architecture

A possible architecture:

```text
src/
│
├── api/
│   ├── client.js
│   ├── chat.js
│   ├── sessions.js
│   └── rag.js
│
├── components/
│   ├── ChatWindow.jsx
│   ├── Message.jsx
│   ├── MessageInput.jsx
│   ├── SourceList.jsx
│   └── SessionList.jsx
│
├── pages/
│   ├── Chat.jsx
│   └── Admin.jsx
│
└── App.jsx
```

---

# 31. API Client Example

```javascript
const API_URL = "http://127.0.0.1:8000/api/v1";

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    }
  );

  if (!response.ok) {
    throw new Error(
      `API error: ${response.status}`
    );
  }

  return response.json();
}
```

---

# 32. Chat Service Example

```javascript
import { apiFetch } from "./client";

export async function sendMessage(
  sessionId,
  message
) {
  return apiFetch("/chat", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      message: message,
      top_k: 5
    })
  });
}
```

---

# 33. Session Service Example

```javascript
import { apiFetch } from "./client";

export async function createSession() {
  return apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify({})
  });
}
```

Retrieve conversation history:

```javascript
export async function getMessages(sessionId) {
  return apiFetch(
    `/sessions/${sessionId}/messages`
  );
}
```

---

# 34. Recommended Front-End Flow

## First Application Launch

```text
1. Frontend starts
        │
        ▼
2. Check session_id
        │
        ├── Exists → load messages
        │
        └── Does not exist
                  │
                  ▼
            POST /sessions
                  │
                  ▼
             save ID
```

---

## Sending a Message

```text
User types:
"Explain depression"

          │
          ▼

POST /chat

          │
          ▼

Display "Assistant is typing..."

          │
          ▼

API response

          │
          ▼

Add message to the interface
```

---

# 35. Complete Flow Example

```javascript
async function sendChatMessage(message) {
  let sessionId =
    localStorage.getItem("session_id");

  if (!sessionId) {
    const session = await createSession();

    sessionId = session.id;

    localStorage.setItem(
      "session_id",
      sessionId
    );
  }

  const response = await sendMessage(
    sessionId,
    message
  );

  return response;
}
```

---

# 36. Error Handling

The Front-End should handle at least the following cases.

### Backend unavailable

```text
Failed to fetch
```

Display:

```text
Unable to contact the server.
Please make sure the backend is running.
```

### HTTP error

```text
400
```

Display:

```text
Invalid request.
```

### Server error

```text
500
```

Display:

```text
An internal server error occurred.
```

### Ollama unavailable

If the backend cannot contact Ollama:

```text
The AI service is temporarily unavailable.
```

---

# 37. Test the API with Swagger

Once the backend is running:

```text
http://127.0.0.1:8000/docs
```

Swagger allows you to directly test:

```text
GET  /api/v1/health
GET  /api/v1/rag/stats

POST /api/v1/sessions
GET  /api/v1/sessions/{session_id}/messages

POST /api/v1/rag/search
POST /api/v1/chat
```

This is particularly useful for Front-End developers before starting the integration.

---

# 38. Test with PowerShell

Health check:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://127.0.0.1:8000/api/v1/health"
```

RAG:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://127.0.0.1:8000/api/v1/rag/stats"
```

---

# 39. Test the Chat

Example:

```powershell
$body = @{
    session_id = "SESSION_ID"
    message = "What is depression?"
    top_k = 5
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8000/api/v1/chat" `
  -ContentType "application/json" `
  -Body $body
```

Replace:

```text
SESSION_ID
```

with the actual session identifier.

---

# 40. Important Variables for the Front-End

The Front-End developer mainly needs to know:

```env
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

For development:

```text
API:
http://127.0.0.1:8000

Swagger:
http://127.0.0.1:8000/docs
```

---

# 41. What the Front-End Does Not Need to Manage

The Front-End does not need to directly manage:

* ChromaDB
* PostgreSQL
* Sentence Transformers
* LangGraph
* Ollama
* Qwen3
* embedding generation
* vector search

These components are internal to the backend.

The Front-End mainly communicates with the REST API.

---

# 42. Global Architecture

```text
                         FRONT-END
                  React / Next.js / Vue
                            │
                            │ HTTP/JSON
                            ▼
                    ┌───────────────┐
                    │    FastAPI    │
                    │   REST API    │
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
          PostgreSQL               LangGraph
       Conversation Memory             │
                 │                     │
                 │              ┌──────┴──────┐
                 │              │             │
                 │              ▼             ▼
                 │           ChromaDB      Ollama
                 │              │             │
                 │              ▼             ▼
                 │           RAG          Qwen3 1.7B
                 │
                 └──────────────┬──────────────┘
                                │
                                ▼
                         Response to Front-End
```

---

# 43. Endpoint Summary

| Method | Endpoint                                 | Purpose                       |
| ------ | ---------------------------------------- | ----------------------------- |
| GET    | `/api/v1/health`                         | Check backend status          |
| GET    | `/api/v1/rag/stats`                      | RAG engine statistics         |
| POST   | `/api/v1/sessions`                       | Create a conversation         |
| GET    | `/api/v1/sessions/{session_id}/messages` | Retrieve conversation history |
| POST   | `/api/v1/rag/search`                     | Perform a RAG search          |
| POST   | `/api/v1/chat`                           | Send a question to the AI     |

---

# 44. Main Endpoint for Front-End Developers

In most cases, the Front-End will mainly use:

```text
POST /api/v1/sessions
```

then:

```text
GET /api/v1/sessions/{session_id}/messages
```

and:

```text
POST /api/v1/chat
```

The main workflow is therefore:

```text
Create session
     │
     ▼
Get session_id
     │
     ▼
Store session_id
     │
     ▼
Send messages
     │
     ▼
POST /chat
     │
     ▼
Display answer
     │
     ▼
Continue conversation
```

---

# 45. Important: `session_id`

The `session_id` is essential for conversation memory.

The Front-End must keep the conversation identifier.

Example:

```javascript
localStorage.setItem(
  "session_id",
  sessionId
);
```

For subsequent messages:

```javascript
const sessionId =
  localStorage.getItem("session_id");
```

Then:

```javascript
{
  "session_id": sessionId,
  "message": "My next question"
}
```

This allows the backend to retrieve the history associated with the conversation.

---

# 46. Front-End / Backend Separation

The recommended principle is:

```text
Frontend
    ↓
REST API
    ↓
Backend
    ↓
AI / Database / RAG
```

The Front-End should not directly access internal services.

For example, avoid:

```text
Frontend → PostgreSQL
Frontend → ChromaDB
Frontend → Ollama
```

Prefer:

```text
Frontend → FastAPI → Internal services
```

---

# 47. Local Development

To work with the Front-End:

### Terminal 1 — Ollama

```bash
ollama serve
```

### Terminal 2 — Backend

```powershell
cd "C:\Users\Academy\Documents\Raddaï Nkashama\diaglowcost-backend"

.\.venv\Scripts\Activate.ps1

$env:PYTHONPATH="."

python -m uvicorn app.main:app `
  --host 127.0.0.1 `
  --port 8000 `
  --reload
```

### Terminal 3 — Front-End

Example:

```bash
npm run dev
```

Architecture:

```text
Frontend
localhost:3000
       │
       │ HTTP
       ▼
Backend
127.0.0.1:8000
       │
       ├── PostgreSQL
       ├── ChromaDB
       └── Ollama
```

---

# 48. Front-End Developer Checklist

Before integration:

* [ ] Backend started
* [ ] Ollama started
* [ ] `qwen3:1.7b` available
* [ ] PostgreSQL started
* [ ] RAG index built
* [ ] `/api/v1/health` returns `ok`
* [ ] `/api/v1/rag/stats` returns `ready: true`
* [ ] CORS configured for the Front-End domain
* [ ] Session creation tested
* [ ] Conversation history tested
* [ ] `/api/v1/chat` tested
* [ ] Error handling implemented
* [ ] `session_id` stored on the Front-End

---

# 49. Technical Summary

**Backend**

```text
Python
FastAPI
Uvicorn
SQLAlchemy
PostgreSQL
```

**AI**

```text
LangGraph
Ollama
Qwen3 1.7B
```

**RAG**

```text
Sentence Transformers
ChromaDB
Vector Search
```

**Communication**

```text
REST API
HTTP
JSON
CORS
```

**Memory**

```text
PostgreSQL
chat_sessions
chat_messages
LangGraph
```

---

# 50. Conclusion

DiagLowCost exposes a REST API that allows a Front-End to build a complete chatbot interface without having to directly manage the AI components.

The Front-End developer mainly needs to integrate:

```text
POST /api/v1/sessions
GET  /api/v1/sessions/{session_id}/messages
POST /api/v1/chat
```

The other endpoints are mainly useful for:

```text
Health
RAG monitoring
Document retrieval
Administration / diagnostics
```

The architecture provides a clear separation between:

```text
User Interface
        ↓
API
        ↓
Business Logic
        ↓
RAG + LangGraph + LLM
        ↓
Databases
```

The system is designed to support persistent conversations, semantic document retrieval, and response generation using **Qwen3 running locally through Ollama**.
