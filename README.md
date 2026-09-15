# DiagLow-Cost

**A low-cost clinical decision support tool designed for field deployment (e.g., Raspberry Pi 5).**

DiagLow-Cost is a local AI web application combining a Next.js interface, FastAPI backend, PostgreSQL, ChromaDB RAG engine, and local LLM inference via Ollama (`qwen3:1.7b`).

> **Disclaimer:** DiagLow-Cost is a clinical assistance tool for document exploration and analysis. It is not a certified medical device or prescription system.

---

## Core Features

* **Local AI Assistant:** Orchestrated via **LangGraph** using `qwen3:1.7b` running locally on Ollama.
* **RAG Engine:** Uses **ChromaDB** and `sentence-transformers/all-MiniLM-L6-v2` (384d) for medical corpus vector search.
* **Session & History Management:** Conversations stored in **PostgreSQL**.
* **Authentication & ACL:** Secure user registration, Argon2 password hashing, JWT tokens, and role-based access (`user`/`admin`).
* **Mobile-First Interface:** Responsive Next.js 15 / React 19 frontend built with Tailwind CSS.
* **Edge Deployment:** Designed for local Wi-Fi offline operation on a **Raspberry Pi 5** (systemd service included).

---

## Architecture Overview

```text
┌───────────────────────┐
│ Next.js 15 Frontend   │ (Port 3000)
└───────────┬───────────┘
            │ REST / JWT
            ▼
┌───────────────────────┐
│   FastAPI Backend     │ (Port 8000)
└─────┬───────────┬─────┘
      │           │
      ▼           ▼
┌───────────┐ ┌──────────────┐
│PostgreSQL │ │  LangGraph   │
└───────────┘ └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │ RAG / Chroma │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │Ollama (Qwen3)│ (Port 11434)
              └──────────────┘
1. Backend Setup
git clone [https://github.com/raddai101/DiagLow-Cost.git](https://github.com/raddai101/DiagLow-Cost.git)
cd DiagLow-Cost/diaglowcost-backend

# Virtual Environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1

# Install Dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Environment Config
cp .env.example .env

Update .env with your PostgreSQL database URL, JWT secret, and Ollama endpoint.


2. Database & LLM Initialization

# Initialize PostgreSQL schema
python scripts/init_db.py

# Pull Ollama model
ollama pull qwen3:1.7b

# Build RAG Index (place raw documents in data/raw/)
python scripts/build_index.py


cd ../diaglowcost-frontend
npm install
cp .env.local.example .env.local  # Set NEXT_PUBLIC_API_URL

Running the Application

    Backend: uvicorn app.main:app --host 0.0.0.0 --port 8000

    Frontend: npm run dev (Access at http://localhost:3000)

    API Docs: http://localhost:8000/docs

Key API Endpoints (/api/v1)

    GET /health – System status check.

    POST /auth/register & POST /auth/login – Authentication.

    GET/POST /sessions – Session management.

    POST /rag/search – Direct vector retrieval.

    POST /chat – Main RAG-augmented LLM conversation route.

Deployment on Raspberry Pi 5

Automated setup and systemd service installation:

chmod +x scripts/install_pi.sh
./scripts/install_pi.sh

# Enable systemd service
sudo cp systemd/diaglowcost-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now diaglowcost-backend