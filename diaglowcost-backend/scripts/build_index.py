from app.core.config import get_settings
from app.db.session import init_db, SessionLocal
from app.db.models import IndexMetadata
from app.rag.retriever import Retriever


settings = get_settings()
init_db()
r = Retriever()
count, dim = r.build()

with SessionLocal() as db:
    meta = db.get(IndexMetadata, 1) or IndexMetadata(id=1)
    meta.corpus_name = settings.train_data
    meta.document_count = count
    meta.embedding_model = settings.embedding_model
    meta.dimension = dim
    db.add(meta)
    db.commit()

print(
    f"ChromaDB RAG index built from TRAIN only: {count} documents, "
    f"dimension={dim}, collection={settings.chroma_collection}, "
    f"path={settings.chroma_dir}"
)
