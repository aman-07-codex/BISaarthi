"""Pydantic schemas for Conversation and Message persistence."""

import datetime
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class MessageSchema(BaseModel):
    """Schema for a single conversation message."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str = Field(description="'user' or 'assistant'")
    content: str
    source_refs: List[Dict[str, Any]] = Field(default_factory=list)
    verification_status: Optional[str] = None
    created_at: datetime.datetime


class AddMessageRequest(BaseModel):
    """Payload to append a message to a conversation."""

    role: str = Field(description="'user' or 'assistant'")
    content: str = Field(min_length=1)
    source_refs: Optional[List[Dict[str, Any]]] = None
    verification_status: Optional[str] = None


class CreateConversationRequest(BaseModel):
    """Payload to initiate a new conversation."""

    title: Optional[str] = Field(default="New Conversation", max_length=255)
    initial_message: Optional[str] = None


class ConversationSummaryResponse(BaseModel):
    """Summary item in a list of user conversations."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    preview: Optional[str] = None
    message_count: int = 0
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ConversationDetailResponse(BaseModel):
    """Detailed conversation object including its message history."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    messages: List[MessageSchema] = Field(default_factory=list)
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ConversationListResponse(BaseModel):
    """Paginated list of conversations."""

    items: List[ConversationSummaryResponse]
    total: int
    page: int
    page_size: int
