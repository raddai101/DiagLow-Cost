# DiagLow-Cost

**A Diagnostic Support Tool Designed for Frontline Clinical Practice**

DiagLow-Cost is an AI-powered clinical assistance platform designed to operate efficiently on low-cost hardware, including the **Raspberry Pi 5**.

The platform combines a modern web interface, a FastAPI backend, a **Retrieval-Augmented Generation (RAG)** engine, a PostgreSQL database, and a locally hosted large language model running through **Ollama**.

> **Important:** DiagLow-Cost is intended as a clinical information retrieval and decision-support tool. It is not a medical device and must not be used as a substitute for professional medical judgment, diagnosis, or prescription.

---

## Table of Contents

* Overview
* Objectives
* Features
* Architecture
* Technologies
* Project Structure
* Prerequisites
* Installation
* Configuration
* API
* Deployment on Raspberry Pi 5
* Security
* Testing
* Limitations
* Medical Disclaimer
* License

---

# Overview

DiagLow-Cost is a clinical AI assistant platform that enables authenticated users to interact with an AI model and query a local medical knowledge base.

The system is composed of:

* A **Next.js frontend**
* A **FastAPI backend**
* A **PostgreSQL database**
* A **LangGraph orchestration workflow**
* A **ChromaDB vector database**
* Local **Ollama** inference using **Qwen3**
* A **RAG pipeline** for document retrieval and contextualized responses

The entire platform can run locally without relying on external cloud-based LLM APIs.

---

# Objectives

The project aims to:

* Provide an AI assistant suitable for clinical environments.
* Operate on low-cost hardware.
* Leverage local medical documentation.
* Use Retrieval-Augmented Generation (RAG) to improve answer quality.
* Preserve conversation history.
* Support multiple authenticated users.
* Operate entirely on a local network.
* Run on a Raspberry Pi 5.
* Be accessible from desktops, tablets, and smartphones.

---

# Features

## Conversational AI Assistant

Users can ask medical and clinical questions through a chat interface.

Responses are generated using:

* The current user query.
* Conversation history.
* Relevant documents retrieved by the RAG engine.

The workflow is orchestrated through LangGraph.

### Retrieval Pipeline

```text
Question
   │
   ▼
Embedding
   │
   ▼
ChromaDB Search
   │
   ▼
Relevant Documents
   │
   ▼
RAG Context
   │
   ▼
Qwen3
   │
   ▼
Response
```

---

## RAG-Based Document Search

The retrieval system uses:

* Sentence Transformers embeddings
* ChromaDB vector storage
* Cosine similarity search
* Local medical corpora

Relevant documents are retrieved before response generation.

---

## Conversation History

Conversations are stored in PostgreSQL.

Users can:

* Create conversations
* View previous conversations
* Retrieve messages
* Rename conversations
* Delete conversations
* Continue existing sessions

---

## Authentication & Access Control

Authentication is based on:

* Email and password
* Argon2 password hashing
* JWT tokens
* Role-based access control

Supported roles:

```text
user
admin
```

Users can access only their own conversations.

---

## Responsive Web Interface

The frontend is built with Next.js and follows a mobile-first approach.

Supported devices:

* Smartphones
* Tablets
* Desktop computers

Features include:

* Authentication screens
* AI chat interface
* Conversation history
* RAG search
* System health indicators
* Dark/light mode
* Responsive layout
* Markdown response formatting

---

# Architecture

```text
┌───────────────────────────────┐
│       Next.js Frontend        │
│                               │
│  Mobile-first Web Interface   │
└───────────────┬───────────────┘
                │ HTTP / REST
                ▼
┌───────────────────────────────┐
│        FastAPI Backend        │
│                               │
│ Authentication                │
│ Sessions / History            │
│ Chat API                      │
│ RAG API                       │
└───────┬───────────┬───────────┘
        │           │
        ▼           ▼
┌─────────────┐  ┌────────────────┐
│ PostgreSQL  │  │    LangGraph   │
│ Users       │  │ AI Workflow    │
│ Sessions    │  └───────┬────────┘
│ Messages    │          │
└─────────────┘          ▼
                  ┌───────────────┐
                  │      RAG      │
                  │   ChromaDB    │
                  │ Embeddings    │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    Ollama     │
                  │    Qwen3      │
                  └───────────────┘
```

---

# Technologies

## Backend

| Technology            | Purpose                   |
| --------------------- | ------------------------- |
| Python                | Main programming language |
| FastAPI               | REST API                  |
| Uvicorn               | ASGI server               |
| Pydantic              | Data validation           |
| SQLAlchemy            | ORM                       |
| PostgreSQL            | Relational database       |
| psycopg               | PostgreSQL driver         |
| PyJWT                 | JWT authentication        |
| Argon2                | Password hashing          |
| LangGraph             | AI workflow orchestration |
| ChromaDB              | Vector database           |
| Sentence Transformers | Embeddings                |
| HTTPX                 | Ollama communication      |
| Ollama                | Local LLM runtime         |
| Qwen3                 | Language model            |

## Frontend

| Technology   | Purpose            |
| ------------ | ------------------ |
| Next.js 15   | Frontend framework |
| React 19     | User interface     |
| TypeScript   | Type safety        |
| Tailwind CSS | Styling            |
| Lucide React | Icons              |

---

# Raspberry Pi 5 Deployment

DiagLow-Cost is designed to run on a Raspberry Pi 5.

Typical deployment architecture:

```text
                    Local Network
                         │
         ┌───────────────┼───────────────┐
         │               │               │
     Smartphone       Laptop         Tablet
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Raspberry Pi 5  │
                │                 │
                │ Next.js         │
                │ FastAPI         │
                │ PostgreSQL      │
                │ ChromaDB        │
                │ Ollama          │
                │ Qwen3           │
                └─────────────────┘
```

The Raspberry Pi becomes the local application server accessible from any device connected to the same network.

---

# Security

The backend includes several security mechanisms:

### Password Protection

Passwords are never stored in plaintext.

Passwords are hashed using Argon2 before storage.

### JWT Authentication

Protected routes require a valid JWT token.

### Access Control

Users can access only their own sessions and conversations.

### Administrative Roles

Certain endpoints are reserved for administrators.

### CORS Configuration

Allowed origins are configured through environment variables.

### Secrets Management

Sensitive values must never be committed to Git.

The `.env` file should remain private.

---

# Testing

Backend tests are located in:

```text
diaglowcost-backend/tests/
```

Run tests using:

```bash
pytest
```

The API contract can be validated through:

```text
tests/test_contract.py
```

---

# Limitations

DiagLow-Cost performance depends on:

* Raspberry Pi hardware capabilities
* Available RAM
* Storage performance
* Selected LLM model
* Quality of the document corpus
* Embedding quality
* Relevance of retrieved documents

The default `qwen3:1.7b` model is intentionally lightweight to enable local inference on constrained hardware.

Larger models may improve answer quality but require significantly more computational resources.

---

# Medical Disclaimer

DiagLow-Cost should be considered a **clinical information retrieval and conversational assistance tool**.

AI-generated responses may contain:

* Errors
* Omissions
* Incomplete information
* Incorrect interpretations

Therefore, generated responses must never be considered definitive medical decisions.

Healthcare professionals remain fully responsible for clinical interpretation and decision-making.

---

# Project Status

DiagLow-Cost provides a functional foundation for a local clinical assistant combining:

* Web interface
* Authentication
* User management
* Conversation management
* Conversation history
* RAG retrieval
* Vector search
* Local inference
* PostgreSQL
* ChromaDB
* LangGraph
* Ollama
* Raspberry Pi deployment

The project is particularly well suited to **low-cost local infrastructures**, where both data and AI inference can remain entirely on-premises.

---

# License

To be defined according to the project's distribution model.

---

## Author / Project

**DiagLow-Cost**

A project focused on developing a low-cost clinical diagnostic support and medical document exploration platform capable of operating on resource-constrained infrastructure.
