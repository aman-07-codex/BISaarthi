import datetime
import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.laboratory import Laboratory
    from app.models.source import Source


class Standard(Base):
    """Core Indian Standard entity (e.g. IS 302 (Part 1))."""

    __tablename__ = "standards"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'superseded', 'withdrawn', 'under_revision', 'unknown')",
            name="chk_standard_status",
        ),
    )

    is_number: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown")
    scope: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    publication_date: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    revision_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    categories: Mapped[List[str]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=False,
        default=list,
    )
    primary_source_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sources.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    last_synced_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    primary_source: Mapped[Optional["Source"]] = relationship("Source")
    requirements: Mapped[List["StandardRequirement"]] = relationship(
        "StandardRequirement",
        back_populates="standard",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="StandardRequirement.display_order",
    )
    tests: Mapped[List["Test"]] = relationship(
        "Test",
        back_populates="standard",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Test.display_order",
    )
    certification_steps: Mapped[List["CertificationStep"]] = relationship(
        "CertificationStep",
        back_populates="standard",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="CertificationStep.step_number",
    )
    laboratories: Mapped[List["Laboratory"]] = relationship(
        "Laboratory",
        secondary="standard_laboratories",
        back_populates="standards",
        passive_deletes=True,
    )
    related_standards: Mapped[List["StandardRelated"]] = relationship(
        "StandardRelated",
        foreign_keys="StandardRelated.standard_is_number",
        back_populates="standard",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class StandardRequirement(Base):
    """Categorized key requirements for an Indian Standard."""

    __tablename__ = "standard_requirements"
    __table_args__ = (
        Index("idx_requirements_standard", "standard_is_number", "display_order"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    standard_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    requirement_text: Mapped[str] = mapped_column(Text, nullable=False)
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sources.id", ondelete="SET NULL"),
        nullable=True,
    )
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    standard: Mapped["Standard"] = relationship("Standard", back_populates="requirements")
    source: Mapped[Optional["Source"]] = relationship("Source")


class StandardRelated(Base):
    """Self-referencing relationship mapping between related Indian Standards."""

    __tablename__ = "standard_related_standards"
    __table_args__ = (
        CheckConstraint("standard_is_number <> related_is_number", name="chk_distinct_related_standards"),
    )

    standard_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        primary_key=True,
    )
    related_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        primary_key=True,
    )
    relation_note: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    standard: Mapped["Standard"] = relationship(
        "Standard",
        foreign_keys=[standard_is_number],
        back_populates="related_standards",
    )
    related_standard: Mapped["Standard"] = relationship(
        "Standard",
        foreign_keys=[related_is_number],
    )


class Test(Base):
    """Mandatory or voluntary compliance test associated with a standard."""

    __test__ = False
    __tablename__ = "tests"
    __table_args__ = (

        CheckConstraint(
            "applicability IN ('mandatory', 'voluntary', 'unknown')",
            name="chk_test_applicability",
        ),
        Index("idx_tests_standard", "standard_is_number", "display_order"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    standard_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    applicability: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sources.id", ondelete="SET NULL"),
        nullable=True,
    )
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    standard: Mapped["Standard"] = relationship("Standard", back_populates="tests")
    source: Mapped[Optional["Source"]] = relationship("Source")


class CertificationStep(Base):
    """Sequential certification process step for acquiring conformity or license."""

    __tablename__ = "certification_steps"
    __table_args__ = (
        UniqueConstraint("standard_is_number", "step_number", name="uq_standard_step_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    standard_is_number: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("standards.is_number", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    step_description: Mapped[str] = mapped_column(Text, nullable=False)
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sources.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    standard: Mapped["Standard"] = relationship("Standard", back_populates="certification_steps")
    source: Mapped[Optional["Source"]] = relationship("Source")
