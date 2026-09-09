import uuid
from typing import TYPE_CHECKING, Any, Dict
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.standard import Standard
    from app.models.user import User


class Comparison(Base):
    """Pairwise Indian Standard comparison generated for a user."""

    __tablename__ = "comparisons"
    __table_args__ = (
        CheckConstraint("standard_a <> standard_b", name="chk_distinct_standards_comparison"),
        Index("idx_comparisons_user", "user_id", "created_at"),
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
    standard_a: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    standard_b: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    result_json: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="comparisons")
    standard_a_ref: Mapped["Standard"] = relationship("Standard", foreign_keys=[standard_a])
    standard_b_ref: Mapped["Standard"] = relationship("Standard", foreign_keys=[standard_b])
