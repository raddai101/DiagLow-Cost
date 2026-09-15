from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.schemas import *
from app.auth.dependencies import CurrentDB, get_current_user, require_admin
from app.auth.security import create_access_token, hash_password, verify_password
from app.auth.acl import ensure_session_owner
from app.core.config import get_settings
from app.db.models import SessionModel, MessageModel, IndexMetadata, UserModel
from app.rag.service import get_retriever
from app.graph.workflow import graph

router = APIRouter(prefix="/api/v1")
settings = get_settings()

@router.get("/health", response_model=HealthResponse)
def health(db: CurrentDB):
    try:
        from sqlalchemy import select as sa_select
        db.execute(sa_select(1)); db_status = "ok"
    except Exception: db_status = "error"
    return HealthResponse(status="ok" if db_status == "ok" else "degraded", llm=settings.ollama_model, rag_ready=get_retriever().ready, database=db_status)

@router.post("/auth/register", response_model=TokenResponse, status_code=201)
def register(req: UserCreate, db: CurrentDB):
    email = req.email.lower().strip()
    if db.scalar(select(UserModel).where(UserModel.email == email)):
        raise HTTPException(409, "An account with this email already exists")
    user = UserModel(name=req.name.strip(), email=email, password_hash=hash_password(req.password), role="user")
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user=user)

@router.post("/auth/login", response_model=TokenResponse)
def login(req: UserLogin, db: CurrentDB):
    user = db.scalar(select(UserModel).where(UserModel.email == req.email.lower().strip()))
    if user is None or not verify_password(req.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account is inactive")
    user.last_login = datetime.now(timezone.utc); db.commit(); db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.id, user.role), user=user)

@router.get("/auth/me", response_model=UserResponse)
def me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.get("/sessions", response_model=list[SessionListResponse])
def list_sessions(db: CurrentDB, current_user: UserModel = Depends(get_current_user)):
    return list(db.scalars(select(SessionModel).where(SessionModel.user_id == current_user.id).order_by(SessionModel.updated_at.desc())))

@router.post("/sessions", response_model=SessionCreateResponse, status_code=201)
def create_session(db: CurrentDB, current_user: UserModel = Depends(get_current_user)):
    s = SessionModel(user_id=current_user.id, title="Nouvelle conversation")
    db.add(s); db.commit(); db.refresh(s); return s

@router.patch("/sessions/{session_id}", response_model=SessionCreateResponse)
def rename_session(session_id: str, req: SessionUpdateRequest, db: CurrentDB, current_user: UserModel = Depends(get_current_user)):
    session = ensure_session_owner(db.get(SessionModel, session_id), current_user)
    session.title = req.title.strip(); session.updated_at = datetime.now(timezone.utc)
    db.commit(); db.refresh(session); return session

@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(session_id: str, db: CurrentDB, current_user: UserModel = Depends(get_current_user)):
    session = ensure_session_owner(db.get(SessionModel, session_id), current_user)
    db.delete(session); db.commit()

@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
def messages(session_id: str, db: CurrentDB, current_user: UserModel = Depends(get_current_user)):
    ensure_session_owner(db.get(SessionModel, session_id), current_user)
    return list(db.scalars(select(MessageModel).where(MessageModel.session_id == session_id).order_by(MessageModel.created_at.asc())))

@router.post("/rag/search", response_model=SearchResponse)
def search(req: SearchRequest, current_user: UserModel = Depends(get_current_user)):
    try: rows = get_retriever().search(req.query, req.top_k)
    except RuntimeError as e: raise HTTPException(503, str(e))
    return {"query": req.query, "sources": [{k: x[k] for k in ["id","drug","condition","rating","score"]} for x in rows]}

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, db: CurrentDB, current_user: UserModel = Depends(get_current_user)):
    session = ensure_session_owner(db.get(SessionModel, req.session_id), current_user)
    history_rows = list(db.scalars(select(MessageModel).where(MessageModel.session_id == req.session_id).order_by(MessageModel.created_at.desc()).limit(8)))
    history_rows.reverse()
    history = [{"role": m.role, "content": m.content} for m in history_rows]
    try: result = await graph.ainvoke({"question": req.message, "history": history, "top_k": req.top_k})
    except Exception as e: raise HTTPException(503, f"Inference failed: {e}")
    db.add(MessageModel(session_id=session.id, role="user", content=req.message))
    db.add(MessageModel(session_id=session.id, role="assistant", content=result["answer"]))
    session.updated_at = datetime.now(timezone.utc)
    if session.title == "Nouvelle conversation": session.title = req.message[:60].strip() or session.title
    db.commit()
    return {"session_id": session.id, "answer": result["answer"], "sources": [{k: x[k] for k in ["id","drug","condition","rating","score"]} for x in result["sources"]]}

@router.get("/admin/users", response_model=list[UserResponse])
def admin_users(db: CurrentDB, current_user: UserModel = Depends(require_admin)):
    return list(db.scalars(select(UserModel).order_by(UserModel.created_at.desc())))
