**# DiagLowCost Backend**

Backend API de la plateforme **\*\*DiagLowCost\*\***, destiné à fournir un service de questions-réponses intelligent basé sur **\*\*RAG (Retrieval-Augmented Generation)\*\***, avec recherche sémantique, base documentaire, modèle LLM local et mémoire persistante des conversations.

Ce document est destiné en particulier aux **\*\*développeurs Front-End\*\*** qui doivent intégrer l’API dans une application Web ou mobile.

\---

**## 1. Overview**

DiagLowCost allows a user to ask questions to an artificial intelligence system.

When a question is sent:

\`\`\`text

Frontend

   │

   │ POST /api/v1/chat

   ▼

FastAPI

   │

   ├── Gestion de la session

   │

   ├── Chargement de l'historique

   │

   ├── RAG / recherche documentaire

   │

   ├── LangGraph

   │

   └── Ollama / Qwen3

           │

           ▼

       AI Response

           │

           ▼

      PostgreSQL

   conversation storage

\`\`\`

The system keeps conversation history so that the user can ask follow-up questions without having to repeat the entire context.

\---

**# 2. Technologies Used**

**## Backend**

\| Technologie           | Usage                        |

\| --------------------- | ---------------------------------- |

\| Python                | Main language                  |

\| FastAPI               | REST API framework                 |

\| Uvicorn               | ASGI server                       |

\| Pydantic              | Data validation             |

\| SQLAlchemy            | ORM / database access        |

\| PostgreSQL            | Application database        |

\| ChromaDB              | Vector database                   |

\| Sentence Transformers | Embedding generation          |

\| LangGraph             | AI workflow orchestration       |

\| Ollama                | Local LLM execution            |

\| Qwen3 1.7B            | Generation model               |

\| BGE-M3                | Planned/supported embedding model |

\| Git                   | Code management                    |

**## AI Architecture**

The backend mainly uses:

\`\`\`text

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

        ▼               ▼

      RAG             History

        │               │

        ▼               │

    ChromaDB            │

        │               │

        └───────┬───────┘

                ▼

             Qwen3

           via Ollama

                │

                ▼

             Response

\`\`\`

\---

**# 3. Prerequisites**

The backend requires:

\* Python 3.x

\* PostgreSQL

\* Ollama

\* Git

The model currently used is:

\`\`\`text

qwen3:1.7b

\`\`\`

Embeddings use:

\`\`\`text

sentence-transformers/all-MiniLM-L6-v2

\`\`\`

The system can also use:

\`\`\`text

bge-m3

\`\`\`

depending on the configuration.

\---

**# 4. Installation**

**## 4.1 Clone the Project**

\`\`\`bash

git clone \<repository-url>

cd diaglowcost-backend

\`\`\`

\---

**## 4.2 Create the Virtual Environment**

Windows:

\`\`\`powershell

python -m venv .venv

\`\`\`

Activation:

\`\`\`powershell

.\\.venv\Scripts\Activate.ps1

\`\`\`

Linux/macOS:

\`\`\`bash

python3 -m venv .venv

source .venv/bin/activate

\`\`\`

\---

**# 5. Install Dependencies**

\`\`\`bash

pip install -r requirements.txt

\`\`\`

The main dependencies are:

\`\`\`text

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

\`\`\`

\---

**# 6. Configuration \`.env\`**

Example configuration:

\`\`\`env

APP\_NAME=diaglowcost-backend

ENVIRONMENT=production

HOST=0.0.0.0

PORT=8000

DATABASE\_URL=postgresql+psycopg://diaglowcost\:change-me\@127.0.0.1:5432/diaglowcost

OLLAMA\_BASE\_URL=http\://127.0.0.1:11434

OLLAMA\_LLM\_MODEL=qwen3:1.7b

OLLAMA\_EMBEDDING\_MODEL=bge-m3

EMBEDDING\_MODEL=sentence-transformers/all-MiniLM-L6-v2

TOP\_K=5

MAX\_CONTEXT\_CHARS=12000

CORS\_ORIGINS=http\://localhost:3000

INDEX\_DIR=data/index

TRAIN\_DATA=data/raw/drugLibTrain\_raw\.tsv

TEST\_DATA=data/raw/drugLibTest\_raw\.tsv

CHROMA\_DIR=data/chroma

CHROMA\_COLLECTION=druglib

\`\`\`

\---

**# 7. Start Ollama**

Check that Ollama is working:

\`\`\`bash

ollama list

\`\`\`

The model must be available:

\`\`\`text

qwen3:1.7b

\`\`\`

If necessary:

\`\`\`bash

ollama pull qwen3:1.7b

\`\`\`

Ollama normally runs at:

\`\`\`text

http\://127.0.0.1:11434

\`\`\`

\---

**# 8. PostgreSQL Database**

The database used by the application is:

\`\`\`text

diaglowcost

\`\`\`

Example:

\`\`\`text

Host: 127.0.0.1

Port: 5432

Database: diaglowcost

User: diaglowcost

\`\`\`

The database contains, among other things, conversation-related data:

\`\`\`text

chat\_sessions

chat\_messages

\`\`\`

\---

**# 9. Vector database RAG**

Le moteur RAG utilise **\*\*ChromaDB\*\***.

The main collection is:

\`\`\`text

druglib

\`\`\`

Directory:

\`\`\`text

data/chroma

\`\`\`

The training corpus currently contains approximately:

\`\`\`text

3107 documents

\`\`\`

with an embedding dimension of:

\`\`\`text

384

\`\`\`

\---

**# 10. Build the RAG Index**

Before using document search:

\`\`\`powershell

$env\:PYTHONPATH="."

python scripts/build\_index.py

\`\`\`

The expected result is similar to:

\`\`\`text

ChromaDB RAG index built from TRAIN only:

3107 documents

dimension=384

collection=druglib

path=data/chroma

\`\`\`

\---

**# 11. Start the API**

From the project root:

\`\`\`powershell

$env\:PYTHONPATH="."

python -m uvicorn app.main\:app --host 127.0.0.1 --port 8000 --reload

\`\`\`

The API is then available at:

\`\`\`text

http\://127.0.0.1:8000

\`\`\`

Documentation Swagger :

\`\`\`text

http\://127.0.0.1:8000/docs

\`\`\`

Documentation OpenAPI :

\`\`\`text

http\://127.0.0.1:8000/openapi.json

\`\`\`

\---

**# 12. Base URL for the Front-End**

In local development:

\`\`\`text

http\://127.0.0.1:8000

\`\`\`

Most endpoints start with:

\`\`\`text

/api/v1

\`\`\`

Therefore:

\`\`\`text

http\://127.0.0.1:8000/api/v1

\`\`\`

\---

**# 13. CORS**

The backend authorizes the Front-End configured in:

\`\`\`env

CORS\_ORIGINS=http\://localhost:3000

\`\`\`

If the React/Next.js/Vue Front-End runs on another port, modify this variable.

Example:

\`\`\`env

CORS\_ORIGINS=http\://localhost:5173

\`\`\`

For a React Front-End with Vite:

\`\`\`text

http\://localhost:5173

\`\`\`

For a Next.js Front-End:

\`\`\`text

http\://localhost:3000

\`\`\`

\---

**# 14. Endpoint List**

**## Health Check**

\`\`\`http

GET /api/v1/health

\`\`\`

Allows the Front-End to verify that the backend is working.

**### Response**

\`\`\`json

{

  "status": "ok",

  "llm": "qwen3:1.7b",

  "rag\_ready": true,

  "database": "ok"

}

\`\`\`

**### JavaScript Example**

\`\`\`javascript

const response = await fetch(

  "http\://127.0.0.1:8000/api/v1/health"

);

const data = await response.json();

console.log(data);

\`\`\`

\---

**# 15. RAG Statistics**

\`\`\`http

GET /api/v1/rag/stats

\`\`\`

Returns the status of the document search engine.

**### Response**

\`\`\`json

{

  "ready": true,

  "documents": 3107,

  "dimension": 384,

  "vector\_store": "chroma",

  "collection": "druglib"

}

\`\`\`

**### Usage Front-End**

This endpoint can be used on a page:

\`\`\`text

Administration

     │

     ├── RAG: Ready

     ├── Documents: 3107

     ├── Vector store: Chroma

     └── Dimension: 384

\`\`\`

\---

**# 16. Create a Conversation Session**

\`\`\`http

POST /api/v1/sessions

\`\`\`

A session represents a conversation between a user and the AI.

**### Exemple**

\`\`\`http

POST http\://127.0.0.1:8000/api/v1/sessions

Content-Type: application/json

\`\`\`

**### Body**

If the API does not require additional parameters:

\`\`\`json

{}

\`\`\`

**### Response**

The backend returns a session identifier.

Conceptual example:

\`\`\`json

{

  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

}

\`\`\`

The Front-End must store this identifier.

For example:

\`\`\`javascript

localStorage.setItem("session\_id", data.id);

\`\`\`

\---

**# 17. Retrieve Messages from a Session**

\`\`\`http

GET /api/v1/sessions/{session\_id}/messages

\`\`\`

Example:

\`\`\`http

GET /api/v1/sessions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/messages

\`\`\`

This endpoint allows the chat interface to be reconstructed.

**### Usage**

When the user opens a conversation:

\`\`\`text

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

\`\`\`

The Front-End can then display:

\`\`\`text

User:

Bonjour...

Assistant:

Bonjour, comment puis-je vous aider ?

User:

Peux-tu préciser ?

Assistant:

...

\`\`\`

\---

**# 18. RAG Search**

\`\`\`http

POST /api/v1/rag/search

\`\`\`

This endpoint allows the Front-End or an administration tool to directly test document search without requesting a complete AI generation.

**### Body**

Example:

\`\`\`json

{

  "query": "What is the treatment for depression?",

  "top\_k": 5

}

\`\`\`

**### Response**

The backend returns the documents closest to the question.

Conceptual example:

\`\`\`json

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

\`\`\`

The exact metadata format depends on the corpus.

\---

**# 19. AI Chat**

**## Main Endpoint**

\`\`\`http

POST /api/v1/chat

\`\`\`

C'est **\*\*l'endpoint principal que le Front-End doit utiliser pour le chatbot\*\***.

The Front-End sends a question to the backend.

The backend:

1\. retrieves the session;

2\. retrieves the history;

3\. performs the RAG search;

4\. executes the LangGraph workflow;

5\. sends the context to the Qwen3 model;

6\. generates the response;

7\. saves the question;

8\. saves the response;

9\. returns the response to the Front-End.

\---

**# 20. Chat Request Example**

\`\`\`http

POST /api/v1/chat

Content-Type: application/json

\`\`\`

Body :

\`\`\`json

{

  "session\_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",

  "message": "What is the treatment for depression?",

  "top\_k": 5

}

\`\`\`

\---

**# 21. JavaScript Example**

\`\`\`javascript

const sessionId = localStorage.getItem("session\_id");

const response = await fetch(

  "http\://127.0.0.1:8000/api/v1/chat",

  {

    method: "POST",

    headers: {

      "Content-Type": "application/json"

    },

    body: JSON.stringify({

      session\_id: sessionId,

      message: "What is the treatment for depression?",

      top\_k: 5

    })

  }

);

const data = await response.json();

console.log(data);

\`\`\`

\---

**# 22. Response du Chat**

The response contains the generated answer as well as information about the sources used.

Conceptual example:

\`\`\`json

{

  "answer": "Based on the available documents...",

  "sources": [

    {

      "source": "2202",

      "score": 0.527

    }

  ]

}

\`\`\`

The Front-End should primarily display:

\`\`\`text

answer

\`\`\`

and may optionally display the:

\`\`\`text

sources

\`\`\`

in a section:

\`\`\`text

Sources Used

\-----------------

[2202]

[1845]

[927]

\`\`\`

\---

**# 23. Conversation Memory Management**

Memory is persistent.

It is stored in PostgreSQL.

Simplified structure:

\`\`\`text

chat\_sessions

       │

       │ 1

       │

       │ N

       ▼

chat\_messages

\`\`\`

A session can therefore contain multiple messages.

Example:

\`\`\`text

Session A

│

├── User: What is depression?

├── AI: ...

├── User: What are its symptoms?

├── AI: ...

├── User: And what about the treatment?

└── AI: ...

\`\`\`

\---

**# 24. Example Conversation with Memory**

**### First Question**

\`\`\`json

{

  "session\_id": "abc123",

  "message": "What is depression?"

}

\`\`\`

The AI responds.

Then the Front-End sends:

\`\`\`json

{

  "session\_id": "abc123",

  "message": "What are its symptoms?"

}

\`\`\`

The backend retrieves the history.

The AI understands that:

\`\`\`text

"its"

\`\`\`

refers to the previous topic:

\`\`\`text

depression

\`\`\`

There is therefore no need to resend the entire conversation from the Front-End.

Le \`session\_id\` suffit pour permettre au backend de retrouver la mémoire.

\---

**# 25. Role of LangGraph**

LangGraph orchestrates the generation process.

Conceptually:

\`\`\`text

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

\`\`\`

The Front-End does not need to know the internal details of LangGraph.

It communicates only with:

\`\`\`http

POST /api/v1/chat

\`\`\`

\---

**# 26. Role of ChromaDB**

ChromaDB est utilisé comme **\*\*vector database\*\***.

During the search:

\`\`\`text

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

\`\`\`

For example:

\`\`\`json

{

  "query": "treatment for depression",

  "top\_k": 5

}

\`\`\`

The backend retrieves the 5 documents that are semantically closest.

\---

**# 27. Role of Sentence Transformers**

The embedding model transforms a sentence into a vector.

Example:

\`\`\`text

"What is depression?"

\`\`\`

becomes approximately:

\`\`\`text

[0.021, -0.183, 0.074, ...]

\`\`\`

These vectors are stored in ChromaDB.

Cela permet de rechercher des documents selon leur **\*\*sens\*\***, et pas seulement selon les mots exacts.

\---

**# 28. Role of Ollama**

Ollama allows the model to run locally.

Configuration :

\`\`\`env

OLLAMA\_BASE\_URL=http\://127.0.0.1:11434

OLLAMA\_LLM\_MODEL=qwen3:1.7b

\`\`\`

Le Front-End ne communique normalement **\*\*pas directement avec Ollama\*\***.

Recommended architecture:

\`\`\`text

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

\`\`\`

The Front-End should therefore call FastAPI.

\---

**# 29. Compatible Front-End Technologies**

The REST API can be used with:

\* React

\* Next.js

\* Vue.js

\* Angular

\* Svelte

\* Flutter

\* React Native

\* application JavaScript classique

No specific Front-End library is required.

\---

**# 30. Example React Architecture**

One possible architecture:

\`\`\`text

src/

│

├── api/

│   ├── client.js

│   ├── chat.js

│   ├── sessions.js

│   └── rag.js

│

├── components/

│   ├── ChatWindow\.jsx

│   ├── Message.jsx

│   ├── MessageInput.jsx

│   ├── SourceList.jsx

│   └── SessionList.jsx

│

├── pages/

│   ├── Chat.jsx

│   └── Admin.jsx

│

└── App.jsx

\`\`\`

\---

**# 31. API Client Example**

\`\`\`javascript

const API\_URL = "http\://127.0.0.1:8000/api/v1";

export async function apiFetch(endpoint, options = {}) {

  const response = await fetch(

    \`${API\_URL}${endpoint}\`,

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

      \`API error: ${response.status}\`

    );

  }

  return response.json();

}

\`\`\`

\---

**# 32. Chat Service Example**

\`\`\`javascript

import { apiFetch } from "./client";

export async function sendMessage(

  sessionId,

  message

) {

  return apiFetch("/chat", {

    method: "POST",

    body: JSON.stringify({

      session\_id: sessionId,

      message: message,

      top\_k: 5

    })

  });

}

\`\`\`

\---

**# 33. Session Service Example**

\`\`\`javascript

import { apiFetch } from "./client";

export async function createSession() {

  return apiFetch("/sessions", {

    method: "POST",

    body: JSON.stringify({})

  });

}

\`\`\`

Retrieving the history:

\`\`\`javascript

export async function getMessages(sessionId) {

  return apiFetch(

    \`/sessions/${sessionId}/messages\`

  );

}

\`\`\`

\---

**# 34. Recommended Front-End Flow**

**## First Opening**

\`\`\`text

1\. Front-End starts

        │

        ▼

2\. Vérifier session\_id

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

\`\`\`

\---

**## Sending a Message**

\`\`\`text

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

Response API

          │

          ▼

Add message to the interface

\`\`\`

\---

**# 35. Complete Flow Example**

\`\`\`javascript

async function sendChatMessage(message) {

  let sessionId =

    localStorage.getItem("session\_id");

  if (!sessionId) {

    const session = await createSession();

    sessionId = session.id;

    localStorage.setItem(

      "session\_id",

      sessionId

    );

  }

  const response = await sendMessage(

    sessionId,

    message

  );

  return response;

}

\`\`\`

\---

**# 36. Error Handling**

The Front-End must handle at least:

**### Backend Unavailable**

\`\`\`text

Failed to fetch

\`\`\`

Display:

\`\`\`text

Unable to contact the server.

Check that the backend is running.

\`\`\`

**### HTTP Error**

\`\`\`text

400

\`\`\`

Display:

\`\`\`text

Invalid request.

\`\`\`

**### Server Error**

\`\`\`text

500

\`\`\`

Display:

\`\`\`text

An internal error occurred.

\`\`\`

**### Ollama Unavailable**

If the backend cannot contact Ollama:

\`\`\`text

The AI service is temporarily unavailable.

\`\`\`

\---

**# 37. Test the API with Swagger**

Once the backend is running:

\`\`\`text

http\://127.0.0.1:8000/docs

\`\`\`

Swagger allows you to directly test:

\`\`\`text

GET  /api/v1/health

GET  /api/v1/rag/stats

POST /api/v1/sessions

GET  /api/v1/sessions/{session\_id}/messages

POST /api/v1/rag/search

POST /api/v1/chat

\`\`\`

This is particularly useful for the Front-End developer before starting the integration.

\---

**# 38. Test with PowerShell**

Health:

\`\`\`powershell

Invoke-RestMethod \`

  -Method Get \`

  -Uri "http\://127.0.0.1:8000/api/v1/health"

\`\`\`

RAG:

\`\`\`powershell

Invoke-RestMethod \`

  -Method Get \`

  -Uri "http\://127.0.0.1:8000/api/v1/rag/stats"

\`\`\`

\---

**# 39. Test the Chat**

Example:

\`\`\`powershell

$body = @{

    session\_id = "SESSION\_ID"

    message = "What is depression?"

    top\_k = 5

} | ConvertTo-Json

Invoke-RestMethod \`

  -Method Post \`

  -Uri "http\://127.0.0.1:8000/api/v1/chat" \`

  -ContentType "application/json" \`

  -Body $body

\`\`\`

Replace:

\`\`\`text

SESSION\_ID

\`\`\`

with the actual session identifier.

\---

**# 40. Important Variables for the Front-End**

The Front-End developer mainly needs to know:

\`\`\`env

HOST=0.0.0.0

PORT=8000

CORS\_ORIGINS=http\://localhost:3000

\`\`\`

In development:

\`\`\`text

API:

http\://127.0.0.1:8000

Swagger:

http\://127.0.0.1:8000/docs

\`\`\`

\---

**# 41. What the Front-End Does Not Need to Manage**

The Front-End must not directly manage:

\* ChromaDB

\* PostgreSQL

\* Sentence Transformers

\* LangGraph

\* Ollama

\* Qwen3

\* génération des embeddings

\* recherche vectorielle

These components are internal to the backend.

The Front-End primarily communicates with the REST API.

\---

**# 42. Overall Architecture**

\`\`\`text

                         FRONT-END

                  React / Next.js / Vue

                            │

                            │ HTTP/JSON

                            ▼

                    ┌───────────────┐

                    │    FastAPI    │

                    │   REST API    │

                    └───────┬───────┘

                            │

                 ┌──────────┴──────────┐

                 │                     │

                 ▼                     ▼

          PostgreSQL               LangGraph

       Conversation Memory             │

                 │                     │

                 │              ┌──────┴──────┐

                 │              │             │

                 │              ▼             ▼

                 │           ChromaDB      Ollama

                 │              │             │

                 │              ▼             ▼

                 │           RAG          Qwen3 1.7B

                 │

                 └──────────────┬──────────────┘

                                │

                                ▼

                         Response au Front-End

\`\`\`

\---

**# 43. Endpoint Summary**

\| Méthode | Endpoint                                 | Function                    |

\| ------- | ---------------------------------------- | --------------------------- |

\| GET     | \`/api/v1/health\`                         | Check backend status  |

\| GET     | \`/api/v1/rag/stats\`                      | RAG engine statistics  |

\| POST    | \`/api/v1/sessions\`                       | Create a conversation      |

\| GET     | \`/api/v1/sessions/{session\_id}/messages\` | Retrieve history      |

\| POST    | \`/api/v1/rag/search\`                     | Perform a RAG search |

\| POST    | \`/api/v1/chat\`                           | Send a question to the AI |

\---

**# 44. Main Endpoint pour le développeur Front-End**

In most cases, the Front-End will primarily use:

\`\`\`text

POST /api/v1/sessions

\`\`\`

then:

\`\`\`text

GET /api/v1/sessions/{session\_id}/messages

\`\`\`

and:

\`\`\`text

POST /api/v1/chat

\`\`\`

The main workflow is therefore:

\`\`\`text

Create session

     │

     ▼

Obtenir session\_id

     │

     ▼

Stocker session\_id

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

Continue the conversation

\`\`\`

\---

**# 45. Important : session\_id**

Le \`session\_id\` est essentiel pour la mémoire.

The Front-End must store the conversation identifier.

Example:

\`\`\`javascript

localStorage.setItem(

  "session\_id",

  sessionId

);

\`\`\`

Lors des prochains messages :

\`\`\`javascript

const sessionId =

  localStorage.getItem("session\_id");

\`\`\`

Puis :

\`\`\`javascript

{

  "session\_id": sessionId,

  "message": "My next question"

}

\`\`\`

This allows the backend to retrieve the corresponding history.

\---

**# 46. Front-End / Backend Separation**

The recommended principle is:

\`\`\`text

Frontend

    ↓

API REST

    ↓

Backend

    ↓

AI / Database / RAG

\`\`\`

The Front-End must not have direct access to internal services.

For example, avoid:

\`\`\`text

Frontend → PostgreSQL

Frontend → ChromaDB

Frontend → Ollama

\`\`\`

Prefer:

\`\`\`text

Frontend → FastAPI → services internes

\`\`\`

\---

**# 47. Local Development**

To work with the Front-End:

**### Terminal 1 — Ollama**

\`\`\`bash

ollama serve

\`\`\`

**### Terminal 2 — Backend**

\`\`\`powershell

cd "C:\Users\Academy\Documents\Raddaï Nkashama\diaglowcost-backend"

.\\.venv\Scripts\Activate.ps1

$env\:PYTHONPATH="."

python -m uvicorn app.main\:app \`

  --host 127.0.0.1 \`

  --port 8000 \`

  --reload

\`\`\`

**### Terminal 3 — Front-End**

Example:

\`\`\`bash

npm run dev

\`\`\`

Architecture :

\`\`\`text

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

\`\`\`

\---

**# 48. Checklist for the Front-End Developer**

Before integration:

\* [ ] Backend started

\* [ ] Ollama started

\* [ ] \`qwen3:1.7b\` available

\* [ ] PostgreSQL started

\* [ ] RAG indexed

\* [ ] \`/api/v1/health\` returns \`ok\`

\* [ ] \`/api/v1/rag/stats\` returns \`ready: true\`

\* [ ] CORS configured for the Front-End domain

\* [ ] Session creation tested

\* [ ] History tested

\* [ ] \`/api/v1/chat\` tested

\* [ ] Error Handling implémentée

\* [ ] \`session\_id\` stored on the Front-End

\---

**# 49. Technical Summary**

**\*\*Backend\*\***

\`\`\`text

Python

FastAPI

Uvicorn

SQLAlchemy

PostgreSQL

\`\`\`

**\*\*IA\*\***

\`\`\`text

LangGraph

Ollama

Qwen3 1.7B

\`\`\`

**\*\*RAG\*\***

\`\`\`text

Sentence Transformers

ChromaDB

Vector Search

\`\`\`

**\*\*Communication\*\***

\`\`\`text

REST API

HTTP

JSON

CORS

\`\`\`

**\*\*Memory\*\***

\`\`\`text

PostgreSQL

chat\_sessions

chat\_messages

LangGraph

\`\`\`

\---

**# 50. Conclusion**

DiagLowCost exposes a REST API that allows a Front-End to build a complete chatbot interface without having to directly manage the AI components.

The Front-End developer mainly needs to integrate:

\`\`\`text

POST /api/v1/sessions

GET  /api/v1/sessions/{session\_id}/messages

POST /api/v1/chat

\`\`\`

The other endpoints are mainly useful for:

\`\`\`text

Health

RAG monitoring

Document search

Administration / diagnostics

\`\`\`

The architecture therefore makes it possible to maintain a clear separation between:

\`\`\`text

User interface

        ↓

API

        ↓

Business logic

        ↓

RAG + LangGraph + LLM

        ↓

Databases

\`\`\`

Le système est conçu pour permettre des conversations persistantes, une recherche documentaire sémantique et une génération de réponses avec **\*\*Qwen3 exécuté localement via Ollama\*\***.