from datetime import datetime
from pydantic import BaseModel, EmailStr
from sqlmodel import SQLModel, Field
from typing import Optional


# User model for database - matches Better Auth schema with added password_hash
class User(SQLModel, table=True):
    __tablename__ = "user"
    
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    password_hash: Optional[str] = None  # Added for JWT auth
    # Better Auth uses camelCase columns
    email_verified: Optional[bool] = Field(default=False)
    image: Optional[str] = None
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)


# Pydantic models for API
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: UserResponse
    message: str
