import uuid
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """Payload for user registration / signup."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, max_length=128, description="User password (min 6 chars)")
    name: Optional[str] = Field(default=None, max_length=255, description="Full name of user")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginRequest(BaseModel):
    """Payload for user login."""
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="User password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    """Safe public user representation."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Unique user UUID")
    name: str = Field(..., description="User name")
    email: str = Field(..., description="User email")
    auth_provider: str = Field(default="email", description="Authentication provider (email or google)")
    preferred_language: str = Field(default="en", description="Preferred language (en or hi)")
    theme: str = Field(default="light", description="Preferred UI theme (light or dark)")
    created_at: Optional[datetime] = Field(default=None, description="Account creation timestamp")


class TokenResponse(BaseModel):
    """JWT Token response payload."""
    access_token: str = Field(..., description="JWT Bearer access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(default=3600, description="Token validity duration in seconds")
    user: UserResponse = Field(..., description="Authenticated user profile")


class UpdatePreferencesRequest(BaseModel):
    """Payload for updating user interface preferences."""
    preferred_language: Optional[Literal["en", "hi"]] = Field(
        default=None,
        description="User language preference ('en' or 'hi')",
    )
    theme: Optional[Literal["light", "dark"]] = Field(
        default=None,
        description="User UI theme preference ('light' or 'dark')",
    )
