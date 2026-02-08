from pydantic import BaseModel
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


# SQLModel table for conversation threads
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: uuid.UUID = Field(default_factory=uuid.uuid4, unique=True, index=True)
    user_id: str = Field(index=True)  # Links to user.id
    title: str = "New Chat"  # Conversation title
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# Pydantic models for API
class ConversationCreate(BaseModel):
    title: str = "New Chat"


class ConversationRead(BaseModel):
    id: int
    session_id: uuid.UUID
    title: str
    created_at: str
    updated_at: str
