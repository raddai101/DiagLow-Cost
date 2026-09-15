# DiagLow-Cost

**Outil d'aide au diagnostic conçu pour la pratique clinique de terrain.**

DiagLow-Cost est une application web d'assistance clinique basée sur l'intelligence artificielle, conçue pour fonctionner avec des ressources informatiques limitées et notamment sur un **Raspberry Pi 5**.

L'application combine une interface web moderne, une API FastAPI, un moteur **RAG (Retrieval-Augmented Generation)**, une base de données PostgreSQL et un modèle de langage exécuté localement avec **Ollama**.

> **Important :** DiagLow-Cost est un outil d'aide à l'exploration documentaire et à l'analyse clinique. Il ne constitue pas un dispositif médical autonome et ne doit pas être utilisé comme système de prescription ou comme substitut au jugement d'un professionnel de santé.

---

## Sommaire

* [Présentation](#présentation)
* [Objectifs](#objectifs)
* [Architecture](#architecture)
* [Fonctionnalités](#fonctionnalités)
* [Technologies](#technologies)
* [Structure du projet](#structure-du-projet)
* [Prérequis](#prérequis)
* [Installation du backend](#installation-du-backend)
* [Configuration PostgreSQL](#configuration-postgresql)
* [Configuration Ollama](#configuration-ollama)
* [Installation et indexation du RAG](#installation-et-indexation-du-rag)
* [Installation du frontend](#installation-du-frontend)
* [Lancement de l'application](#lancement-de-lapplication)
* [API](#api)
* [Authentification](#authentification)
* [Déploiement sur Raspberry Pi 5](#déploiement-sur-raspberry-pi-5)
* [Service systemd](#service-systemd)
* [Accès depuis un téléphone ou un ordinateur](#accès-depuis-un-téléphone-ou-un-ordinateur)
* [Développement](#développement)
* [Tests](#tests)
* [Sécurité](#sécurité)
* [Limites](#limites)
* [Licence](#licence)

---

# Présentation

DiagLow-Cost est une plateforme d'assistance clinique permettant à un utilisateur authentifié de dialoguer avec un assistant IA et d'interroger un corpus documentaire médical.

L'application est conçue autour de trois composants principaux :

```text
┌───────────────────────────────┐
│       Frontend Next.js        │
│                               │
│  Interface web mobile-first   │
└───────────────┬───────────────┘
                │ HTTP / REST
                ▼
┌───────────────────────────────┐
│        Backend FastAPI        │
│                               │
│ Authentification              │
│ Sessions / historique         │
│ API Chat                      │
│ API RAG                       │
└───────┬───────────┬───────────┘
        │           │
        │           │
        ▼           ▼
┌─────────────┐  ┌────────────────┐
│ PostgreSQL  │  │    LangGraph   │
│             │  │                │
│ Utilisateurs│  │ Workflow IA    │
│ Sessions    │  └───────┬────────┘
│ Messages    │          │
└─────────────┘          ▼
                  ┌───────────────┐
                  │     RAG       │
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

L'ensemble peut fonctionner **localement**, sans dépendre d'une API LLM cloud pour la génération des réponses.

---

# Objectifs

Le projet vise notamment à :

* fournir un assistant IA utilisable dans un environnement clinique ;
* permettre une utilisation avec des ressources matérielles limitées ;
* exploiter un corpus documentaire médical local ;
* utiliser un système RAG afin de contextualiser les réponses ;
* conserver l'historique des conversations ;
* permettre plusieurs utilisateurs avec authentification ;
* fonctionner sur un réseau local ;
* être déployable sur un Raspberry Pi 5 ;
* permettre l'accès depuis un ordinateur, une tablette ou un smartphone.

---

# Fonctionnalités

## Assistant conversationnel

L'utilisateur peut poser des questions à l'assistant IA.

Le système prend en compte :

* la question courante ;
* les derniers messages de la conversation ;
* les documents retrouvés par le moteur RAG.

Le workflow est orchestré avec LangGraph.

---

## Recherche documentaire RAG

Le moteur RAG utilise :

* **Sentence Transformers** pour générer les embeddings ;
* **ChromaDB** pour le stockage vectoriel ;
* une recherche par similarité cosinus ;
* le corpus documentaire local.

Le système recherche les documents les plus pertinents avant de générer la réponse.

```text
Question
   │
   ▼
Embedding
   │
   ▼
Recherche ChromaDB
   │
   ▼
Documents pertinents
   │
   ▼
Contexte RAG
   │
   ▼
Qwen3
   │
   ▼
Réponse
```

---

## Historique des conversations

Les conversations sont stockées dans PostgreSQL.

L'utilisateur peut :

* créer une nouvelle conversation ;
* consulter ses conversations ;
* consulter les messages ;
* renommer une conversation ;
* supprimer une conversation ;
* continuer une conversation existante.

---

## Authentification

Le backend possède un système d'authentification basé sur :

* email ;
* mot de passe ;
* hash Argon2 ;
* JWT ;
* contrôle d'accès par rôle.

Deux niveaux principaux sont prévus :

```text
user
admin
```

Les utilisateurs ne peuvent accéder qu'à leurs propres conversations.

---

## Interface web

Le frontend est construit avec Next.js et conçu selon une approche **mobile-first**.

L'interface est adaptée à une utilisation :

* sur smartphone ;
* sur tablette ;
* sur ordinateur.

Elle possède notamment :

* interface de connexion ;
* espace conversationnel ;
* historique ;
* recherche RAG ;
* indicateur d'état du système ;
* thème clair/sombre ;
* formatage des réponses ;
* interface responsive.

---

# Architecture

Le projet est organisé en deux applications principales :

```text
DiagLow-Cost/
│
├── diaglowcost-backend/
│
└── diaglowcost-frontend/
```

## Backend

Le backend est responsable de :

```text
Frontend
   │
   ▼
FastAPI
   │
   ├── Authentication
   │
   ├── PostgreSQL
   │
   ├── Session management
   │
   ├── RAG
   │
   └── LangGraph
          │
          ├── Retrieval
          │
          └── Generation
                  │
                  ▼
                Ollama
                  │
                  ▼
                Qwen3
```

## Frontend

Le frontend communique avec le backend via HTTP REST.

```text
Next.js
   │
   ├── Authentication
   ├── Sessions
   ├── Chat
   ├── History
   └── RAG Search
          │
          ▼
       FastAPI
```

---

# Technologies

## Backend

| Technologie           | Rôle                         |
| --------------------- | ---------------------------- |
| Python                | Langage principal            |
| FastAPI               | API REST                     |
| Uvicorn               | Serveur ASGI                 |
| Pydantic              | Validation des données       |
| SQLAlchemy            | ORM                          |
| PostgreSQL            | Base de données              |
| psycopg               | Driver PostgreSQL            |
| PyJWT                 | Authentification JWT         |
| pwdlib / Argon2       | Hashage des mots de passe    |
| LangGraph             | Orchestration du workflow IA |
| ChromaDB              | Base vectorielle             |
| Sentence Transformers | Embeddings                   |
| HTTPX                 | Communication avec Ollama    |
| Ollama                | Exécution locale du LLM      |
| Qwen3                 | Modèle de génération         |

## Frontend

| Technologie  | Rôle                  |
| ------------ | --------------------- |
| Next.js 15   | Framework frontend    |
| React 19     | Interface utilisateur |
| TypeScript   | Typage                |
| Tailwind CSS | Styling               |
| Lucide React | Icônes                |

---

# Structure du projet

```text
DiagLow-Cost/
│
├── diaglowcost-backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── auth/
│   │   │   ├── acl.py
│   │   │   ├── dependencies.py
│   │   │   └── security.py
│   │   │
│   │   ├── core/
│   │   │   └── config.py
│   │   │
│   │   ├── db/
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   │
│   │   ├── graph/
│   │   │   └── workflow.py
│   │   │
│   │   ├── llm/
│   │   │   └── ollama.py
│   │   │
│   │   ├── rag/
│   │   │   ├── corpus.py
│   │   │   ├── retriever.py
│   │   │   └── service.py
│   │   │
│   │   └── main.py
│   │
│   ├── data/
│   │   └── raw/
│   │
│   ├── scripts/
│   │   ├── build_index.py
│   │   ├── evaluate.py
│   │   ├── init_db.py
│   │   └── install_pi.sh
│   │
│   ├── systemd/
│   │   └── diaglowcost-backend.service
│   │
│   ├── tests/
│   │   └── test_contract.py
│   │
│   ├── .env.example
│   ├── requirements.txt
│   └── Makefile
│
└── diaglowcost-frontend/
    │
    ├── app/
    │   ├── ui/
    │   │   ├── Auth.tsx
    │   │   └── Dashboard.tsx
    │   │
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    │
    ├── public/
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.mjs
    └── tsconfig.json
```

---

# Prérequis

Pour une installation locale :

* Python 3.x ;
* Node.js 20+ ;
* PostgreSQL ;
* Ollama ;
* Git.

Pour le déploiement cible :

* Raspberry Pi 5 ;
* Raspberry Pi OS ou Ubuntu compatible ;
* au moins 4 Go de RAM recommandé ;
* stockage SSD recommandé pour de meilleures performances ;
* connexion réseau locale.

---

# Installation du backend

Cloner le projet :

```bash
git clone https://github.com/raddai101/DiagLow-Cost.git
cd DiagLow-Cost/diaglowcost-backend
```

Créer un environnement virtuel.

### Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Installer les dépendances :

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

# Configuration du backend

Créer le fichier `.env` à partir du modèle :

```bash
cp .env.example .env
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env
```

Configuration de base :

```env
APP_NAME=diaglowcost-backend
ENVIRONMENT=production

HOST=0.0.0.0
PORT=8000

DATABASE_URL=postgresql+psycopg://diaglowcost:CHANGE_ME@127.0.0.1:5432/diaglowcost

OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:1.7b

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

CORS_ORIGINS=http://localhost:3000

JWT_SECRET_KEY=GENERATE_A_LONG_RANDOM_SECRET_HERE
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

En production, **ne jamais utiliser la valeur d'exemple pour `JWT_SECRET_KEY`**.

---

# Configuration PostgreSQL

Créer la base de données :

```text
diaglowcost
```

Exemple :

```text
Database : diaglowcost
User     : diaglowcost
Host     : 127.0.0.1
Port     : 5432
```

La chaîne de connexion est ensuite configurée dans `.env` :

```env
DATABASE_URL=postgresql+psycopg://diaglowcost:YOUR_PASSWORD@127.0.0.1:5432/diaglowcost
```

Initialiser le schéma :

```bash
python scripts/init_db.py
```

Résultat attendu :

```text
PostgreSQL schema initialized.
```

---

# Configuration Ollama

DiagLow-Cost utilise Ollama pour exécuter localement le modèle de langage.

Vérifier Ollama :

```bash
ollama list
```

Installer le modèle utilisé par le projet :

```bash
ollama pull qwen3:1.7b
```

Vérifier :

```bash
ollama list
```

Le serveur Ollama doit être disponible sur :

```text
http://127.0.0.1:11434
```

---

# Installation et indexation du RAG

Le projet utilise ChromaDB comme base vectorielle.

Le modèle d'embeddings configuré par défaut est :

```text
sentence-transformers/all-MiniLM-L6-v2
```

La dimension obtenue est de **384**.

Le corpus utilisé par le projet est placé dans :

```text
diaglowcost-backend/data/raw/
```

Après avoir placé les données nécessaires dans ce répertoire, construire l'index :

```bash
python scripts/build_index.py
```

Le script :

1. initialise PostgreSQL ;
2. lit le corpus ;
3. transforme les données en documents ;
4. génère les embeddings ;
5. crée la collection ChromaDB ;
6. insère les documents ;
7. enregistre les métadonnées de l'index.

La collection utilisée est :

```text
druglib
```

---

# Installation du frontend

Se rendre dans le frontend :

```bash
cd ../diaglowcost-frontend
```

Installer les dépendances :

```bash
npm install
```

Créer la configuration locale :

```bash
Copy-Item .env.local.example .env.local
```

Sous Linux :

```bash
cp .env.local.example .env.local
```

Configuration locale :

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Pour un backend situé sur un Raspberry Pi :

```env
NEXT_PUBLIC_API_URL=http://192.168.1.50:8000
```

Remplacer `192.168.1.50` par l'adresse IP réelle du Raspberry Pi.

---

# Lancement de l'application

## Backend

Depuis `diaglowcost-backend` :

```bash
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Sous Windows :

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API :

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

## Frontend

Dans `diaglowcost-frontend` :

```bash
npm run dev
```

L'interface est accessible à :

```text
http://localhost:3000
```

---

# API

Toutes les routes applicatives sont préfixées par :

```text
/api/v1
```

## Health check

```http
GET /api/v1/health
```

Permet de vérifier :

* l'état de l'API ;
* la connexion PostgreSQL ;
* l'état du RAG ;
* le modèle Ollama configuré.

---

## Authentification

### Inscription

```http
POST /api/v1/auth/register
```

### Connexion

```http
POST /api/v1/auth/login
```

Retourne un token JWT.

### Utilisateur connecté

```http
GET /api/v1/auth/me
```

Nécessite :

```text
Authorization: Bearer <JWT>
```

---

## Sessions

### Lister les conversations

```http
GET /api/v1/sessions
```

### Créer une conversation

```http
POST /api/v1/sessions
```

### Renommer une conversation

```http
PATCH /api/v1/sessions/{session_id}
```

### Supprimer une conversation

```http
DELETE /api/v1/sessions/{session_id}
```

### Récupérer les messages

```http
GET /api/v1/sessions/{session_id}/messages
```

---

## Recherche RAG

```http
POST /api/v1/rag/search
```

Exemple :

```json
{
  "query": "treatment for depression",
  "top_k": 5
}
```

Le moteur recherche les documents les plus similaires dans ChromaDB.

---

## Chat IA

```http
POST /api/v1/chat
```

Exemple :

```json
{
  "session_id": "SESSION_ID",
  "message": "What are the treatment options for depression?",
  "top_k": 5
}
```

Le workflow est :

```text
POST /chat
     │
     ▼
Validation JWT
     │
     ▼
Vérification session
     │
     ▼
Récupération historique
     │
     ▼
LangGraph
     │
     ▼
Recherche RAG
     │
     ▼
Contexte documentaire
     │
     ▼
Ollama / Qwen3
     │
     ▼
Réponse
     │
     ├── sauvegarde question
     ├── sauvegarde réponse
     └── mise à jour session
```

---

## Administration

Les utilisateurs disposant du rôle `admin` peuvent accéder à :

```http
GET /api/v1/admin/users
```

Cette route permet de consulter les utilisateurs enregistrés.

---

# Authentification

L'API utilise des tokens **JWT**.

Après connexion :

```text
POST /auth/login
       │
       ▼
      JWT
       │
       ▼
Frontend
       │
       ▼
Authorization: Bearer <token>
```

Les endpoints protégés nécessitent le token.

Exemple :

```http
Authorization: Bearer eyJ...
```

Le système vérifie également que l'utilisateur possède la session qu'il tente de consulter ou modifier.

Cela empêche un utilisateur d'accéder directement aux conversations d'un autre utilisateur.

---

# Déploiement sur Raspberry Pi 5

Le projet est conçu pour pouvoir être exécuté sur un Raspberry Pi 5.

Architecture cible :

```text
                    Réseau local
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Smartphone      Laptop         Tablet
          │              │              │
          └──────────────┼──────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Raspberry Pi 5 │
                │                 │
                │  Next.js        │
                │  FastAPI        │
                │  PostgreSQL     │
                │  ChromaDB       │
                │  Ollama         │
                │  Qwen3          │
                └─────────────────┘
```

Le Raspberry Pi devient ainsi le serveur local de l'application.

---

# Installation Raspberry Pi

Le backend contient un script prévu pour faciliter l'installation :

```bash
cd diaglowcost-backend
chmod +x scripts/install_pi.sh
./scripts/install_pi.sh
```

Le script installe notamment :

```text
Python
Python venv
pip
PostgreSQL
PostgreSQL contrib
```

Puis :

1. copie l'application ;
2. crée l'environnement virtuel ;
3. installe les dépendances Python ;
4. initialise PostgreSQL ;
5. construit l'index RAG.

Le backend est installé par défaut dans :

```text
/opt/diaglowcost-backend
```

---

# Service systemd

Le projet contient :

```text
systemd/diaglowcost-backend.service
```

Ce service permet au backend de démarrer automatiquement avec le Raspberry Pi.

Le service utilise :

```text
User=pi
WorkingDirectory=/opt/diaglowcost-backend
```

et lance :

```text
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Installation :

```bash
sudo cp systemd/diaglowcost-backend.service \
    /etc/systemd/system/diaglowcost-backend.service
```

Recharger systemd :

```bash
sudo systemctl daemon-reload
```

Activer le démarrage automatique :

```bash
sudo systemctl enable diaglowcost-backend
```

Démarrer :

```bash
sudo systemctl start diaglowcost-backend
```

Vérifier :

```bash
sudo systemctl status diaglowcost-backend
```

Voir les logs :

```bash
sudo journalctl -u diaglowcost-backend -f
```

---

# Accès depuis un téléphone ou un ordinateur

Une fois le backend installé sur le Raspberry Pi, récupérer son adresse IP :

```bash
hostname -I
```

Exemple :

```text
192.168.1.50
```

Le backend devient alors accessible sur :

```text
http://192.168.1.50:8000
```

Le frontend doit être configuré avec :

```env
NEXT_PUBLIC_API_URL=http://192.168.1.50:8000
```

Et le backend doit autoriser l'origine du frontend dans :

```env
CORS_ORIGINS=http://localhost:3000,http://192.168.1.50:3000
```

Ainsi, un smartphone connecté au même réseau Wi-Fi pourra accéder à l'application.

---

# Exemple d'utilisation sur le réseau local

```text
Raspberry Pi
IP : 192.168.1.50

Backend
http://192.168.1.50:8000

Frontend
http://192.168.1.50:3000
```

Depuis un smartphone connecté au même Wi-Fi :

```text
http://192.168.1.50:3000
```

Depuis un ordinateur :

```text
http://192.168.1.50:3000
```

---

# Développement

## Backend

Activer l'environnement :

```bash
source .venv/bin/activate
```

Lancer FastAPI avec rechargement automatique :

```bash
uvicorn app.main:app --reload
```

---

## Frontend

```bash
npm run dev
```

Build de production :

```bash
npm run build
```

Lancer la version de production :

```bash
npm run start
```

---

# Tests

Les tests backend se trouvent dans :

```text
diaglowcost-backend/tests/
```

Lancer les tests avec :

```bash
pytest
```

Le fichier :

```text
tests/test_contract.py
```

permet notamment de vérifier le contrat de l'API.

---

# Gestion du corpus

Le corpus brut est stocké dans :

```text
diaglowcost-backend/data/raw/
```

Le fichier :

```text
data/raw/README.txt
```

contient les indications relatives aux données attendues.

Lorsqu'un nouveau corpus est utilisé, l'index ChromaDB doit être reconstruit :

```bash
python scripts/build_index.py
```

La reconstruction remplace proprement la collection existante.

---

# Sécurité

Plusieurs mécanismes de sécurité sont intégrés au backend :

### Mots de passe

Les mots de passe ne sont pas stockés en clair.

Ils sont hashés avant stockage.

### JWT

Les routes protégées nécessitent un token JWT valide.

### Contrôle d'accès

Un utilisateur ne peut accéder qu'à ses propres sessions.

### Rôle administrateur

Certaines fonctionnalités sont réservées aux administrateurs.

### CORS

Les origines autorisées sont configurées via :

```env
CORS_ORIGINS=
```

### Variables sensibles

Les secrets ne doivent jamais être commités dans Git.

Le fichier :

```text
.env
```

doit rester privé.

---

# Bonnes pratiques de production

Avant de déployer l'application sur un réseau réel :

* générer une clé JWT aléatoire forte ;
* utiliser un mot de passe PostgreSQL robuste ;
* ne pas exposer PostgreSQL directement sur Internet ;
* limiter les origines CORS ;
* protéger le réseau local ;
* sauvegarder régulièrement PostgreSQL ;
* sauvegarder le répertoire ChromaDB ;
* surveiller les logs systemd ;
* maintenir les dépendances à jour ;
* utiliser HTTPS si l'application est exposée hors du réseau local.

---

# Limites

DiagLow-Cost dépend notamment :

* des performances du Raspberry Pi ;
* de la quantité de RAM disponible ;
* des performances du stockage ;
* du modèle LLM utilisé ;
* de la qualité du corpus documentaire ;
* de la qualité des embeddings ;
* de la pertinence des documents récupérés.

Le modèle `qwen3:1.7b` est volontairement léger afin de permettre une exécution locale avec des ressources limitées. Un modèle plus important peut améliorer certaines réponses mais nécessitera davantage de ressources matérielles.

---

# Considérations médicales

DiagLow-Cost doit être considéré comme un **outil d'assistance documentaire et conversationnelle**.

Les réponses générées par l'IA peuvent contenir :

* des erreurs ;
* des omissions ;
* des informations incomplètes ;
* des interprétations incorrectes.

Une réponse générée ne doit donc pas être considérée comme une décision médicale définitive.

Le professionnel de santé reste responsable de l'interprétation clinique et de toute décision prise à partir des informations fournies par l'application.

---

# Flux complet de fonctionnement

```text
                 UTILISATEUR
                     │
                     ▼
              Interface Next.js
                     │
                     ▼
              Authentification
                     │
                     ▼
                 JWT valide
                     │
                     ▼
              API FastAPI
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
      PostgreSQL             LangGraph
          │                     │
          │                ┌────┴────┐
          │                │         │
          │                ▼         ▼
          │              RAG      History
          │                │         │
          │                ▼         │
          │             ChromaDB     │
          │                │         │
          │                └────┬────┘
          │                     ▼
          │                   Qwen3
          │                     │
          │                  Ollama
          │                     │
          └──────────────┬──────┘
                         ▼
                    Réponse IA
                         │
                         ▼
                    PostgreSQL
                         │
                         ▼
                  Interface utilisateur
```

---

# État du projet

DiagLow-Cost constitue une base fonctionnelle pour un assistant clinique local combinant :

* interface web ;
* authentification ;
* gestion des utilisateurs ;
* gestion des conversations ;
* historique ;
* RAG ;
* recherche vectorielle ;
* génération locale ;
* PostgreSQL ;
* ChromaDB ;
* LangGraph ;
* Ollama ;
* déploiement Raspberry Pi.

Le projet est particulièrement adapté à un **environnement local à faible coût**, où les données et l'inférence peuvent rester sur l'infrastructure locale.

---

# Licence

À définir selon les conditions de distribution du projet.

---

## Auteur / Projet

**DiagLow-Cost**

Projet orienté vers le développement d'un outil d'assistance au diagnostic et à l'exploration documentaire médicale fonctionnant avec une infrastructure informatique à faible coût.
