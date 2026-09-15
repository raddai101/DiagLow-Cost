# DiagLow-Cost Frontend

Frontend Next.js + Tailwind CSS, mobile-first, connecté au backend FastAPI fourni dans `diaglowcost-backend.zip`.

## Ce qui est connecté

Le frontend utilise directement :

- `GET /api/v1/health`
- `GET /api/v1/rag/stats`
- `POST /api/v1/sessions`
- `GET /api/v1/sessions/{session_id}/messages`
- `POST /api/v1/chat`
- `POST /api/v1/rag/search`

Les réponses du chat affichent les références RAG renvoyées par le backend sous la forme `[id]`.

## Design

- Mobile-first et responsive.
- Palette clinique sobre : blanc, graphite, vert pétrole.
- Aucun sticker, emoji décoratif ou composant "mock".
- Icônes SVG inline, sans dépendance iconographique.
- Interface pensée pour un usage médecin : densité maîtrisée, sources visibles, état du système et avertissement de sécurité.
- Le bouton de recherche ouvre une recherche directe dans le corpus ChromaDB.
- Le bouton "Nouvelle analyse" recrée une session PostgreSQL via l'API.

## Pré-requis

- Node.js 20+ recommandé.
- Backend FastAPI démarré sur le Raspberry Pi ou en local.
- CORS du backend autorisant l'origine du frontend.

## Installation PowerShell

```powershell
cd diaglowcost-frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Connexion au Raspberry Pi

Modifier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://192.168.1.50:8000/api/v1
```

Remplacer `192.168.1.50` par l'adresse IP du Raspberry Pi.

Important : l'URL est utilisée par le navigateur. Le Raspberry Pi doit donc être accessible depuis le téléphone/PC qui ouvre Next.js.

## Build de production

```powershell
npm run build
npm run start
```

## CORS backend

Dans le `.env` du backend, ajouter l'origine réelle du frontend, par exemple :

```env
CORS_ORIGINS=http://localhost:3000,http://192.168.1.50:3000
```

Puis redémarrer FastAPI.

## Architecture

```text
diaglowcost-frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatComposer.tsx
│   ├── ChatMessage.tsx
│   ├── Sidebar.tsx
│   ├── SourceCard.tsx
│   └── icons.tsx
├── lib/
│   └── api.ts
├── .env.example
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

## Note produit

Le backend indique explicitement que le système est un prototype d'exploration documentaire et non un système de prescription autonome. Le frontend reprend cette contrainte dans l'interface et ne transforme pas les résultats RAG en prescription.

### Présentation des réponses
Les références internes du RAG (`[1]`, `[2]`, etc.) et les métadonnées de récupération ne sont pas affichées dans les réponses du chat. L'interface reformate le texte en paragraphes, titres, listes et éléments mis en évidence pour une lecture clinique plus claire. La recherche RAG directe reste disponible dans le panneau « Recherche RAG ».
