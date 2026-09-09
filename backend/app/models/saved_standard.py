import uuid
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.standard import Standard
    from app.models.user import User


class SavedStandard(Base):
    """User bookmarked Indian Standard."""

    __tablename__ = "saved_standards"
    __table_args__ = (
        UniqueConstraint("user_id", "standard_is_number", name="uq_user_saved_standard"),
        Index("idx_saved_standards_user", "user_id", "saved_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    standard_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    saved_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="saved_standards")
    standard: Mapped["Standard"] = relationship("Standard")
