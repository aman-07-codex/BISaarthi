import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import CheckConstraint, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.conversation import Conversation
    from app.models.saved_standard import SavedStandard
    from app.models.comparison import Comparison
    from app.models.uploaded_document import UploadedDocument


class User(Base):
    """User account entity supporting email/password and Google OAuth."""

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("auth_provider IN ('email', 'google')", name="chk_user_auth_provider"),
        CheckConstraint("preferred_language IN ('en', 'hi')", name="chk_user_preferred_language"),
        CheckConstraint("theme IN ('light', 'dark')", name="chk_user_theme"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    auth_provider: Mapped[str] = mapped_column(String(20), nullable=False, default="email")
    password_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    google_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    preferred_language: Mapped[str] = mapped_column(String(5), nullable=False, default="en")
    theme: Mapped[str] = mapped_column(String(10), nullable=False, default="light")
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    conversations: Mapped[List["Conversation"]] = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    saved_standards: Mapped[List["SavedStandard"]] = relationship(
        "SavedStandard",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    comparisons: Mapped[List["Comparison"]] = relationship(
        "Comparison",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    uploaded_documents: Mapped[List["UploadedDocument"]] = relationship(
        "UploadedDocument",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
