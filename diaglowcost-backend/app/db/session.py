from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings
from app.db.models import Base

settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def init_db():
    Base.metadata.create_all(bind=engine)
    # Backward-compatible upgrade for the existing chat_sessions table.
    # New installations are fully created by create_all; existing PostgreSQL DBs
    # receive the new columns without destroying conversations.
    inspector = inspect(engine)
    if "chat_sessions" in inspector.get_table_names():
        columns = {c["name"] for c in inspector.get_columns("chat_sessions")}
        with engine.begin() as conn:
            if "user_id" not in columns:
                conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN user_id INTEGER"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_chat_sessions_user_id ON chat_sessions (user_id)"))
            if "title" not in columns:
                conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN title VARCHAR(200) DEFAULT 'Nouvelle conversation'"))
                conn.execute(text("UPDATE chat_sessions SET title = 'Ancienne conversation' WHERE title IS NULL"))
            if "updated_at" not in columns:
                conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN updated_at TIMESTAMPTZ"))
                conn.execute(text("UPDATE chat_sessions SET updated_at = created_at WHERE updated_at IS NULL"))

def db_session():
    db = SessionLocal()
    try: yield db
    finally: db.close()
