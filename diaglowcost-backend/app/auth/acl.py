from fastapi import HTTPException
from app.db.models import SessionModel, UserModel

def ensure_session_owner(session: SessionModel | None, user: UserModel) -> SessionModel:
    # 404 avoids revealing whether another user's session exists.
    if session is None or session.user_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
