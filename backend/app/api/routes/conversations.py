"""Conversation history and message persistence routes."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import NotFoundError, ValidationError
from app.core.logging import get_logger
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.conversation import Conversation, Message
from app.models.user import User
from app.schemas.conversation import (
    AddMessageRequest,
    ConversationDetailResponse,
    ConversationListResponse,
    ConversationSummaryResponse,
    CreateConversationRequest,
    MessageSchema,
)

logger = get_logger("bisaarthi.conversations")
router = APIRouter(prefix="/conversations", tags=["Conversations & History"])


@router.get(
    "",
    response_model=ConversationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List user conversations",
    description="Retrieve paginated list of chat conversation threads for the authenticated user.",
)
async def list_conversations(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> ConversationListResponse:
    """Retrieve chat conversation threads for the current authenticated user."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    count_stmt = (
        select(func.count())
        .select_from(Conversation)
        .where(Conversation.user_id == current_user.id)
    )
    total_res = await db.execute(count_stmt)
    total = total_res.scalar_one() or 0

    offset = (page - 1) * page_size
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .options(selectinload(Conversation.messages))
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    conversations = result.scalars().all()

    items = []
    for conv in conversations:
        preview_text = None
        if conv.messages:
            last_msg = conv.messages[-1]
            preview_text = last_msg.content[:100] + ("..." if len(last_msg.content) > 100 else "")

        items.append(
            ConversationSummaryResponse(
                id=conv.id,
                user_id=conv.user_id,
                title=conv.title,
                preview=preview_text,
                message_count=len(conv.messages),
                created_at=conv.created_at,
                updated_at=conv.updated_at,
            )
        )

    return ConversationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=ConversationDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new conversation thread",
    description="Initiate a new conversation thread with optional initial title and message.",
)
async def create_conversation(
    payload: CreateConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> ConversationDetailResponse:
    """Create a new conversation thread."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    title = payload.title.strip() if payload.title and payload.title.strip() else "New Conversation"

    new_conv = Conversation(
        user_id=current_user.id,
        title=title,
    )
    db.add(new_conv)
    await db.flush()

    if payload.initial_message and payload.initial_message.strip():
        msg = Message(
            conversation_id=new_conv.id,
            role="user",
            content=payload.initial_message.strip(),
            source_refs=[],
        )
        db.add(msg)

    await db.commit()
    await db.refresh(new_conv)

    # Re-fetch with messages
    stmt = (
        select(Conversation)
        .where(Conversation.id == new_conv.id)
        .options(selectinload(Conversation.messages))
    )
    res = await db.execute(stmt)
    conv_with_msgs = res.scalar_one()

    return ConversationDetailResponse(
        id=conv_with_msgs.id,
        user_id=conv_with_msgs.user_id,
        title=conv_with_msgs.title,
        messages=[MessageSchema.model_validate(m) for m in conv_with_msgs.messages],
        created_at=conv_with_msgs.created_at,
        updated_at=conv_with_msgs.updated_at,
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get conversation detail",
    description="Retrieve a specific conversation thread and all its turns.",
)
async def get_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> ConversationDetailResponse:
    """Get conversation and messages by conversation ID."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .options(selectinload(Conversation.messages))
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if conv is None:
        raise NotFoundError("Conversation not found or access denied.")

    return ConversationDetailResponse(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        messages=[MessageSchema.model_validate(m) for m in conv.messages],
        created_at=conv.created_at,
        updated_at=conv.updated_at,
    )


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete conversation",
    description="Permanently delete a conversation thread and its messages.",
)
async def delete_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> None:
    """Delete conversation by ID."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    stmt = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if conv is None:
        raise NotFoundError("Conversation not found or access denied.")

    await db.delete(conv)
    await db.commit()
    logger.info("Conversation %s deleted by user %s", str(conversation_id), str(current_user.id))


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Add message to conversation",
    description="Append a user or assistant message to an existing conversation thread.",
)
async def add_message_to_conversation(
    conversation_id: uuid.UUID,
    payload: AddMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> MessageSchema:
    """Append a message to a conversation thread."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    stmt = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if conv is None:
        raise NotFoundError("Conversation not found or access denied.")

    new_message = Message(
        conversation_id=conv.id,
        role=payload.role,
        content=payload.content,
        source_refs=payload.source_refs or [],
        verification_status=payload.verification_status,
    )
    db.add(new_message)

    # Update conversation updated_at and auto-generate title from first user query if default
    if conv.title == "New Conversation" and payload.role == "user":
        conv.title = payload.content[:60] + ("..." if len(payload.content) > 60 else "")

    await db.commit()
    await db.refresh(new_message)

    return MessageSchema.model_validate(new_message)
