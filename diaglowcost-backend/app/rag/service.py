from functools import lru_cache
from app.rag.retriever import Retriever

@lru_cache
def get_retriever():
    return Retriever()
