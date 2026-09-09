import datetime
import uuid
from typing import TYPE_CHECKING, Optional
from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.source import Source
    from app.models.standard import Standard


class BisKbChunk(Base):
    """Authoritative chunk representation for BIS knowledge base indexing and RAG."""

    __tablename__ = "bis_kb_chunks"
    __table_args__ = (
        CheckConstraint(
            "section_type IN ('scope', 'requirement', 'test', 'scheme_procedure', 'lab_registry', 'general')",
            name="chk_kb_chunk_section_type",
        ),
        Index("idx_bis_kb_is_number", "is_number"),
        Index("idx_bis_kb_section_type", "section_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="SET NULL"),
        nullable=True,
    )
    section_type: Mapped[str] = mapped_column(String(30), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    publication_date: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sources.id", ondelete="SET NULL"),
        nullable=True,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    standard: Mapped[Optional["Standard"]] = relationship("Standard")
    source: Mapped[Optional["Source"]] = relationship("Source")
