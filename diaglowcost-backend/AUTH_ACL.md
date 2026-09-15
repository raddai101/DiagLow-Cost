# Auth + ACL v1

Implemented: users, password hashing (Argon2), JWT bearer auth, per-user sessions, protected messages/chat/RAG, session rename/delete, admin user listing.

## First setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`.
3. Set a long random `JWT_SECRET_KEY`.
4. Install requirements: `python -m pip install -r requirements.txt`.
5. Start: `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`.

Existing sessions created before ACL have no owner and are intentionally inaccessible until explicitly migrated/assigned. Do not make `user_id` NOT NULL until those legacy sessions are handled.
