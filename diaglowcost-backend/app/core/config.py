from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "diaglowcost-backend"
    environment: str = "production"
    host: str = "0.0.0.0"
    port: int = 8000
    database_url: str
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "qwen3:1.7b"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    top_k: int = 5
    max_context_chars: int = 12000
    cors_origins: str = "http://localhost:3000"
    index_dir: str = "data/index"
    chroma_dir: str = "data/chroma"
    chroma_collection: str = "druglib"
    train_data: str = "data/raw/drugLibTrain_raw.tsv"
    test_data: str = "data/raw/drugLibTest_raw.tsv"
    jwt_secret_key: str = "CHANGE-ME-IN-PRODUCTION"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    @property
    def cors_list(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()
