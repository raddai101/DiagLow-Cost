from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict

class HealthResponse(BaseModel):
    status: str
    llm: str
    rag_ready: bool
    database: str

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    last_login: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SessionCreateResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

class SessionListResponse(SessionCreateResponse):
    pass

class SessionUpdateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)

class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=4000)
    top_k: int = Field(default=5, ge=1, le=20)

class Source(BaseModel):
    id: str
    drug: str
    condition: str
    rating: int
    score: float

class SearchResponse(BaseModel):
    query: str
    sources: list[Source]

class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(min_length=1, max_length=8000)
    top_k: int = Field(default=5, ge=1, le=20)

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: list[Source]

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
