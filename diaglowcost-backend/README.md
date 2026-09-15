# DiagLowCost Backend

Backend API de la plateforme **DiagLowCost**, destiné à fournir un service de questions-réponses intelligent basé sur **RAG (Retrieval-Augmented Generation)**, avec recherche sémantique, base documentaire, modèle LLM local et mémoire persistante des conversations.

Ce document est destiné en particulier aux **développeurs Front-End** qui doivent intégrer l’API dans une application Web ou mobile.

---

## 1. Présentation

DiagLowCost permet à un utilisateur de poser des questions à une intelligence artificielle.

Lorsqu'une question est envoyée :

```text
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
       Réponse IA
           │
           ▼
      PostgreSQL
   sauvegarde conversation
```

Le système conserve l'historique des conversations afin que l'utilisateur puisse poser des questions complémentaires sans devoir répéter tout le contexte.

---

# 2. Technologies utilisées

## Backend

| Technologie           | Utilisation                        |
| --------------------- | ---------------------------------- |
| Python                | Langage principal                  |
| FastAPI               | Framework API REST                 |
| Uvicorn               | Serveur ASGI                       |
| Pydantic              | Validation des données             |
| SQLAlchemy            | ORM / accès base de données        |
| PostgreSQL            | Base de données applicative        |
| ChromaDB              | Base vectorielle                   |
| Sentence Transformers | Génération des embeddings          |
| LangGraph             | Orchestration du workflow IA       |
| Ollama                | Exécution locale du LLM            |
| Qwen3 1.7B            | Modèle de génération               |
| BGE-M3                | Modèle d'embeddings prévu/supporté |
| Git                   | Gestion du code                    |

## Architecture IA

Le backend utilise principalement :

```text
Question utilisateur
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
             Réponse
```

---

# 3. Prérequis

Le backend nécessite :

* Python 3.x
* PostgreSQL
* Ollama
* Git

Le modèle actuellement utilisé est :

```text
qwen3:1.7b
```

Les embeddings utilisent :

```text
sentence-transformers/all-MiniLM-L6-v2
```

Le système peut également utiliser :

```text
bge-m3
```

selon la configuration.

---

# 4. Installation

## 4.1 Cloner le projet

```bash
git clone <repository-url>
cd diaglowcost-backend
```

---

## 4.2 Créer l'environnement virtuel

Windows :

```powershell
python -m venv .venv
```

Activation :

```powershell
.\.venv\Scripts\Activate.ps1
```

Linux/macOS :

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

# 5. Installation des dépendances

```bash
pip install -r requirements.txt
```

Les principales dépendances sont :

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

# 6. Configuration `.env`

Exemple de configuration :

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

# 7. Démarrer Ollama

Vérifier qu'Ollama fonctionne :

```bash
ollama list
```

Le modèle doit être disponible :

```text
qwen3:1.7b
```

Si nécessaire :

```bash
ollama pull qwen3:1.7b
```

Ollama fonctionne normalement sur :

```text
http://127.0.0.1:11434
```

---

# 8. Base de données PostgreSQL

La base utilisée par l'application est :

```text
diaglowcost
```

Exemple :

```text
Host: 127.0.0.1
Port: 5432
Database: diaglowcost
User: diaglowcost
```

La base contient notamment les données liées aux conversations :

```text
chat_sessions
chat_messages
```

---

# 9. Base vectorielle RAG

Le moteur RAG utilise **ChromaDB**.

La collection principale est :

```text
druglib
```

Répertoire :

```text
data/chroma
```

Le corpus d'entraînement contient actuellement environ :

```text
3107 documents
```

avec une dimension d'embedding de :

```text
384
```

---

# 10. Construire l'index RAG

Avant d'utiliser la recherche documentaire :

```powershell
$env:PYTHONPATH="."
python scripts/build_index.py
```

Le résultat attendu est similaire à :

```text
ChromaDB RAG index built from TRAIN only:
3107 documents
dimension=384
collection=druglib
path=data/chroma
```

---

# 11. Démarrer l'API

Depuis la racine du projet :

```powershell
$env:PYTHONPATH="."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

L'API est alors disponible sur :

```text
http://127.0.0.1:8000
```

Documentation Swagger :

```text
http://127.0.0.1:8000/docs
```

Documentation OpenAPI :

```text
http://127.0.0.1:8000/openapi.json
```

---

# 12. URL de base pour le Front-End

En développement local :

```text
http://127.0.0.1:8000
```

La plupart des endpoints commencent par :

```text
/api/v1
```

Donc :

```text
http://127.0.0.1:8000/api/v1
```

---

# 13. CORS

Le backend autorise le Front-End configuré dans :

```env
CORS_ORIGINS=http://localhost:3000
```

Si le Front-End React/Next.js/Vue fonctionne sur un autre port, modifier cette variable.

Exemple :

```env
CORS_ORIGINS=http://localhost:5173
```

Pour un Front-End React avec Vite :

```text
http://localhost:5173
```

Pour un Front-End Next.js :

```text
http://localhost:3000
```

---

# 14. Liste des endpoints

## Health Check

```http
GET /api/v1/health
```

Permet au Front-End de vérifier que le backend fonctionne.

### Réponse

```json
{
  "status": "ok",
  "llm": "qwen3:1.7b",
  "rag_ready": true,
  "database": "ok"
}
```

### Exemple JavaScript

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/api/v1/health"
);

const data = await response.json();

console.log(data);
```

---

# 15. Statistiques RAG

```http
GET /api/v1/rag/stats
```

Retourne l'état du moteur de recherche documentaire.

### Réponse

```json
{
  "ready": true,
  "documents": 3107,
  "dimension": 384,
  "vector_store": "chroma",
  "collection": "druglib"
}
```

### Utilisation Front-End

Cet endpoint peut être utilisé dans une page :

```text
Administration
     │
     ├── RAG: Ready
     ├── Documents: 3107
     ├── Vector store: Chroma
     └── Dimension: 384
```

---

# 16. Créer une session de conversation

```http
POST /api/v1/sessions
```

Une session représente une conversation entre un utilisateur et l'IA.

### Exemple

```http
POST http://127.0.0.1:8000/api/v1/sessions
Content-Type: application/json
```

### Body

Si l'API ne nécessite pas de paramètres supplémentaires :

```json
{}
```

### Réponse

Le backend retourne un identifiant de session.

Exemple conceptuel :

```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

Le Front-End doit conserver cet identifiant.

Par exemple :

```javascript
localStorage.setItem("session_id", data.id);
```

---

# 17. Récupérer les messages d'une session

```http
GET /api/v1/sessions/{session_id}/messages
```

Exemple :

```http
GET /api/v1/sessions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/messages
```

Cet endpoint permet de reconstruire l'interface de chat.

### Utilisation

Lorsque l'utilisateur ouvre une conversation :

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
Historique
   │
   ▼
Frontend
```

Le Front-End peut ensuite afficher :

```text
Utilisateur:
Bonjour...

Assistant:
Bonjour, comment puis-je vous aider ?

Utilisateur:
Peux-tu préciser ?

Assistant:
...
```

---

# 18. Recherche RAG

```http
POST /api/v1/rag/search
```

Cet endpoint permet au Front-End ou à un outil d'administration de tester directement la recherche documentaire sans demander une génération complète à l'IA.

### Body

Exemple :

```json
{
  "query": "What is the treatment for depression?",
  "top_k": 5
}
```

### Réponse

Le backend retourne les documents les plus proches de la question.

Exemple conceptuel :

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

Le format exact des métadonnées dépend du corpus.

---

# 19. Chat IA

## Endpoint principal

```http
POST /api/v1/chat
```

C'est **l'endpoint principal que le Front-End doit utiliser pour le chatbot**.

Le Front-End envoie une question au backend.

Le backend :

1. récupère la session ;
2. récupère l'historique ;
3. effectue la recherche RAG ;
4. exécute le workflow LangGraph ;
5. envoie le contexte au modèle Qwen3 ;
6. génère la réponse ;
7. sauvegarde la question ;
8. sauvegarde la réponse ;
9. retourne la réponse au Front-End.

---

# 20. Exemple de requête Chat

```http
POST /api/v1/chat
Content-Type: application/json
```

Body :

```json
{
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "message": "What is the treatment for depression?",
  "top_k": 5
}
```

---

# 21. Exemple JavaScript

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

# 22. Réponse du Chat

La réponse contient la réponse générée ainsi que les informations liées aux sources utilisées.

Exemple conceptuel :

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

Le Front-End doit principalement afficher :

```text
answer
```

et peut éventuellement afficher les :

```text
sources
```

dans une section :

```text
Sources utilisées
-----------------
[2202]
[1845]
[927]
```

---

# 23. Gestion de la mémoire conversationnelle

La mémoire est persistante.

Elle est stockée dans PostgreSQL.

Structure simplifiée :

```text
chat_sessions
       │
       │ 1
       │
       │ N
       ▼
chat_messages
```

Une session peut donc contenir plusieurs messages.

Exemple :

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

# 24. Exemple de conversation avec mémoire

### Première question

```json
{
  "session_id": "abc123",
  "message": "What is depression?"
}
```

L'IA répond.

Ensuite le Front-End envoie :

```json
{
  "session_id": "abc123",
  "message": "What are its symptoms?"
}
```

Le backend récupère l'historique.

L'IA comprend que :

```text
"its"
```

fait référence au sujet précédent :

```text
depression
```

Il n'est donc pas nécessaire de renvoyer toute la conversation depuis le Front-End.

Le `session_id` suffit pour permettre au backend de retrouver la mémoire.

---

# 25. Rôle de LangGraph

LangGraph orchestre le processus de génération.

Conceptuellement :

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

Le Front-End n'a pas besoin de connaître les détails internes de LangGraph.

Il communique uniquement avec :

```http
POST /api/v1/chat
```

---

# 26. Rôle de ChromaDB

ChromaDB est utilisé comme **vector database**.

Lors de la recherche :

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

Par exemple :

```json
{
  "query": "treatment for depression",
  "top_k": 5
}
```

Le backend récupère les 5 documents les plus proches sémantiquement.

---

# 27. Rôle de Sentence Transformers

Le modèle d'embedding transforme une phrase en vecteur.

Exemple :

```text
"What is depression?"
```

devient approximativement :

```text
[0.021, -0.183, 0.074, ...]
```

Ces vecteurs sont stockés dans ChromaDB.

Cela permet de rechercher des documents selon leur **sens**, et pas seulement selon les mots exacts.

---

# 28. Rôle d'Ollama

Ollama permet d'exécuter le modèle localement.

Configuration :

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_LLM_MODEL=qwen3:1.7b
```

Le Front-End ne communique normalement **pas directement avec Ollama**.

Architecture recommandée :

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

Le Front-End doit donc appeler FastAPI.

---

# 29. Technologies Front-End compatibles

L'API REST peut être utilisée avec :

* React
* Next.js
* Vue.js
* Angular
* Svelte
* Flutter
* React Native
* application JavaScript classique

Aucune bibliothèque Front-End particulière n'est imposée.

---

# 30. Exemple d'architecture React

Une architecture possible :

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

# 31. Exemple de client API

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

# 32. Exemple de service Chat

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

# 33. Exemple de service Session

```javascript
import { apiFetch } from "./client";

export async function createSession() {
  return apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify({})
  });
}
```

Récupération de l'historique :

```javascript
export async function getMessages(sessionId) {
  return apiFetch(
    `/sessions/${sessionId}/messages`
  );
}
```

---

# 34. Flux recommandé côté Front-End

## Première ouverture

```text
1. Frontend démarre
        │
        ▼
2. Vérifier session_id
        │
        ├── Existe → charger messages
        │
        └── N'existe pas
                  │
                  ▼
            POST /sessions
                  │
                  ▼
             sauvegarder ID
```

---

## Envoi d'un message

```text
Utilisateur écrit :
"Explain depression"

          │
          ▼

POST /chat

          │
          ▼

Afficher "Assistant écrit..."

          │
          ▼

Réponse API

          │
          ▼

Ajouter message à l'interface
```

---

# 35. Exemple complet de flux

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

# 36. Gestion des erreurs

Le Front-End doit gérer au minimum :

### Backend indisponible

```text
Failed to fetch
```

Afficher :

```text
Impossible de contacter le serveur.
Vérifiez que le backend est démarré.
```

### Erreur HTTP

```text
400
```

Afficher :

```text
Requête invalide.
```

### Erreur serveur

```text
500
```

Afficher :

```text
Une erreur interne est survenue.
```

### Ollama indisponible

Si le backend ne peut pas contacter Ollama :

```text
Le service IA est temporairement indisponible.
```

---

# 37. Tester l'API avec Swagger

Une fois le backend lancé :

```text
http://127.0.0.1:8000/docs
```

Swagger permet de tester directement :

```text
GET  /api/v1/health
GET  /api/v1/rag/stats

POST /api/v1/sessions
GET  /api/v1/sessions/{session_id}/messages

POST /api/v1/rag/search
POST /api/v1/chat
```

C'est particulièrement utile pour le développeur Front-End avant de commencer l'intégration.

---

# 38. Tester avec PowerShell

Health :

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://127.0.0.1:8000/api/v1/health"
```

RAG :

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://127.0.0.1:8000/api/v1/rag/stats"
```

---

# 39. Tester le Chat

Exemple :

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

Remplacer :

```text
SESSION_ID
```

par l'identifiant réel de la session.

---

# 40. Variables importantes pour le Front-End

Le développeur Front-End doit principalement connaître :

```env
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

En développement :

```text
API:
http://127.0.0.1:8000

Swagger:
http://127.0.0.1:8000/docs
```

---

# 41. Ce que le Front-End n'a pas besoin de gérer

Le Front-End ne doit pas gérer directement :

* ChromaDB
* PostgreSQL
* Sentence Transformers
* LangGraph
* Ollama
* Qwen3
* génération des embeddings
* recherche vectorielle

Ces éléments sont internes au backend.

Le Front-End communique principalement avec l'API REST.

---

# 42. Architecture globale

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
                         Réponse au Front-End
```

---

# 43. Résumé des endpoints

| Méthode | Endpoint                                 | Fonction                    |
| ------- | ---------------------------------------- | --------------------------- |
| GET     | `/api/v1/health`                         | Vérifier l'état du backend  |
| GET     | `/api/v1/rag/stats`                      | Statistiques du moteur RAG  |
| POST    | `/api/v1/sessions`                       | Créer une conversation      |
| GET     | `/api/v1/sessions/{session_id}/messages` | Récupérer l'historique      |
| POST    | `/api/v1/rag/search`                     | Effectuer une recherche RAG |
| POST    | `/api/v1/chat`                           | Envoyer une question à l'IA |

---

# 44. Endpoint principal pour le développeur Front-End

Dans la majorité des cas, le Front-End utilisera principalement :

```text
POST /api/v1/sessions
```

puis :

```text
GET /api/v1/sessions/{session_id}/messages
```

et :

```text
POST /api/v1/chat
```

Le workflow principal est donc :

```text
Créer session
     │
     ▼
Obtenir session_id
     │
     ▼
Stocker session_id
     │
     ▼
Envoyer messages
     │
     ▼
POST /chat
     │
     ▼
Afficher answer
     │
     ▼
Continuer la conversation
```

---

# 45. Important : session_id

Le `session_id` est essentiel pour la mémoire.

Le Front-End doit conserver l'identifiant de la conversation.

Exemple :

```javascript
localStorage.setItem(
  "session_id",
  sessionId
);
```

Lors des prochains messages :

```javascript
const sessionId =
  localStorage.getItem("session_id");
```

Puis :

```javascript
{
  "session_id": sessionId,
  "message": "My next question"
}
```

Cela permet au backend de retrouver l'historique correspondant.

---

# 46. Séparation Front-End / Backend

Le principe recommandé est :

```text
Frontend
    ↓
API REST
    ↓
Backend
    ↓
AI / Database / RAG
```

Le Front-End ne doit pas avoir accès directement aux services internes.

Par exemple, éviter :

```text
Frontend → PostgreSQL
Frontend → ChromaDB
Frontend → Ollama
```

Préférer :

```text
Frontend → FastAPI → services internes
```

---

# 47. Développement local

Pour travailler avec le Front-End :

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

Exemple :

```bash
npm run dev
```

Architecture :

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

# 48. Checklist pour le développeur Front-End

Avant l'intégration :

* [ ] Backend démarré
* [ ] Ollama démarré
* [ ] `qwen3:1.7b` disponible
* [ ] PostgreSQL démarré
* [ ] RAG indexé
* [ ] `/api/v1/health` retourne `ok`
* [ ] `/api/v1/rag/stats` retourne `ready: true`
* [ ] CORS configuré pour le domaine Front-End
* [ ] Création d'une session testée
* [ ] Historique testé
* [ ] `/api/v1/chat` testé
* [ ] Gestion des erreurs implémentée
* [ ] `session_id` conservé côté Front-End

---

# 49. Résumé technique

**Backend**

```text
Python
FastAPI
Uvicorn
SQLAlchemy
PostgreSQL
```

**IA**

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

**Mémoire**

```text
PostgreSQL
chat_sessions
chat_messages
LangGraph
```

---

# 50. Conclusion

DiagLowCost expose une API REST permettant à un Front-End de construire une interface de chatbot complète sans avoir à gérer directement les composants IA.

Le développeur Front-End doit principalement intégrer :

```text
POST /api/v1/sessions
GET  /api/v1/sessions/{session_id}/messages
POST /api/v1/chat
```

Les autres endpoints sont principalement utiles pour :

```text
Health
RAG monitoring
Recherche documentaire
Administration / diagnostic
```

L'architecture permet ainsi de garder une séparation claire entre :

```text
Interface utilisateur
        ↓
API
        ↓
Logique métier
        ↓
RAG + LangGraph + LLM
        ↓
Bases de données
```

Le système est conçu pour permettre des conversations persistantes, une recherche documentaire sémantique et une génération de réponses avec **Qwen3 exécuté localement via Ollama**.
