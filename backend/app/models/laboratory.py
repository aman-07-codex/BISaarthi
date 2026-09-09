import uuid
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from sqlalchemy import DateTime, ForeignKey, String, Table, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.source import Source
    from app.models.standard import Standard


class StandardLaboratory(Base):
    """Many-to-many link between standards and recognized laboratories."""

    __tablename__ = "standard_laboratories"

    standard_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        primary_key=True,
    )
    laboratory_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("laboratories.id", ondelete="CASCADE"),
        primary_key=True,
    )


class Laboratory(Base):
    """BIS recognized testing laboratory."""

    __tablename__ = "laboratories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sources.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    source: Mapped[Optional["Source"]] = relationship("Source")
    standards: Mapped[List["Standard"]] = relationship(
        "Standard",
        secondary="standard_laboratories",
        back_populates="laboratories",
        passive_deletes=True,
    )
