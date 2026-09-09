"""Initial BISaarthi PostgreSQL schema.

Revision ID: 20260908_0001
Revises: 
Create Date: 2026-09-08 14:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260908_0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. PostgreSQL Extensions
    # Note: On Supabase or managed Postgres, extensions are safe with IF NOT EXISTS
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pg_trgm";')
    try:
        op.execute('CREATE EXTENSION IF NOT EXISTS "vector";')
    except Exception:
        # If pgvector is not installed on the system or permission is restricted, continue gracefully
        pass

    # 2. Users Table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('auth_provider', sa.String(20), nullable=False, server_default='email'),
        sa.Column('password_hash', sa.Text(), nullable=True),
        sa.Column('google_id', sa.String(255), nullable=True, unique=True),
        sa.Column('preferred_language', sa.String(5), nullable=False, server_default='en'),
        sa.Column('theme', sa.String(10), nullable=False, server_default='light'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("auth_provider IN ('email', 'google')", name='chk_user_auth_provider'),
        sa.CheckConstraint("preferred_language IN ('en', 'hi')", name='chk_user_preferred_language'),
        sa.CheckConstraint("theme IN ('light', 'dark')", name='chk_user_theme'),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # 3. Sources Table
    op.create_table(
        'sources',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('reference_url', sa.Text(), nullable=False, unique=True),
        sa.Column('source_type', sa.String(20), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('reliability_tier', sa.String(10), nullable=False),
        sa.Column('retrieved_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("source_type IN ('bis_standard', 'bis_scheme', 'gov_portal', 'other')", name='chk_source_type'),
        sa.CheckConstraint("reliability_tier IN ('primary', 'secondary')", name='chk_source_reliability_tier'),
    )

    # 4. Standards Table
    op.create_table(
        'standards',
        sa.Column('is_number', sa.String(50), primary_key=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='unknown'),
        sa.Column('scope', sa.Text(), nullable=True),
        sa.Column('publication_date', sa.Date(), nullable=True),
        sa.Column('revision_info', sa.Text(), nullable=True),
        sa.Column('categories', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('primary_source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sources.id', ondelete='SET NULL'), nullable=True),
        sa.Column('last_synced_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("status IN ('active', 'superseded', 'withdrawn', 'under_revision', 'unknown')", name='chk_standard_status'),
    )
    op.create_index('idx_standards_primary_source', 'standards', ['primary_source_id'])

    # 5. Standard Requirements
    op.create_table(
        'standard_requirements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('standard_is_number', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('requirement_text', sa.Text(), nullable=False),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sources.id', ondelete='SET NULL'), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
    )
    op.create_index('idx_requirements_standard', 'standard_requirements', ['standard_is_number', 'display_order'])

    # 6. Standard Related Standards (Self-referencing M:N)
    op.create_table(
        'standard_related_standards',
        sa.Column('standard_is_number', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), primary_key=True),
        sa.Column('related_is_number', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), primary_key=True),
        sa.Column('relation_note', sa.String(255), nullable=True),
        sa.CheckConstraint("standard_is_number <> related_is_number", name='chk_distinct_related_standards'),
    )

    # 7. Tests
    op.create_table(
        'tests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('standard_is_number', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), nullable=False),
        sa.Column('test_name', sa.String(255), nullable=False),
        sa.Column('applicability', sa.String(20), nullable=False, server_default='unknown'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sources.id', ondelete='SET NULL'), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.CheckConstraint("applicability IN ('mandatory', 'voluntary', 'unknown')", name='chk_test_applicability'),
    )
    op.create_index('idx_tests_standard', 'tests', ['standard_is_number', 'display_order'])

    # 8. Certification Steps
    op.create_table(
        'certification_steps',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('standard_is_number', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), nullable=False),
        sa.Column('step_number', sa.Integer(), nullable=False),
        sa.Column('step_description', sa.Text(), nullable=False),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sources.id', ondelete='SET NULL'), nullable=True),
        sa.UniqueConstraint('standard_is_number', 'step_number', name='uq_standard_step_number'),
    )

    # 9. Laboratories
    op.create_table(
        'laboratories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('contact_info', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sources.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 10. Standard Laboratories (M:N)
    op.create_table(
        'standard_laboratories',
        sa.Column('standard_is_number', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), primary_key=True),
        sa.Column('laboratory_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('laboratories.id', ondelete='CASCADE'), primary_key=True),
    )

    # 11. Conversations
    op.create_table(
        'conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False, server_default='New Chat'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('idx_conversations_user_recent', 'conversations', ['user_id', 'updated_at'])

    # 12. Messages
    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(10), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('source_refs', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('verification_status', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("role IN ('user', 'assistant')", name='chk_message_role'),
        sa.CheckConstraint("verification_status IS NULL OR verification_status IN ('grounded', 'partially_verified', 'unverifiable')", name='chk_message_verification_status'),
    )
    op.create_index('idx_messages_conversation', 'messages', ['conversation_id', 'created_at'])

    # 13. Saved Standards
    op.create_table(
        'saved_standards',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('standard_is_number', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), nullable=False),
        sa.Column('saved_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'standard_is_number', name='uq_user_saved_standard'),
    )
    op.create_index('idx_saved_standards_user', 'saved_standards', ['user_id', 'saved_at'])

    # 14. Comparisons (Exactly two standards)
    op.create_table(
        'comparisons',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('standard_a', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), nullable=False),
        sa.Column('standard_b', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='CASCADE'), nullable=False),
        sa.Column('result_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint('standard_a <> standard_b', name='chk_distinct_standards_comparison'),
    )
    op.create_index('idx_comparisons_user', 'comparisons', ['user_id', 'created_at'])

    # 15. Uploaded Documents
    op.create_table(
        'uploaded_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('file_type', sa.String(50), nullable=False),
        sa.Column('file_size_bytes', sa.BigInteger(), nullable=False),
        sa.Column('storage_path', sa.Text(), nullable=False),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='uploaded'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('purge_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("status IN ('uploaded', 'processing', 'processed', 'failed')", name='chk_uploaded_document_status'),
    )
    op.create_index('idx_uploaded_documents_user', 'uploaded_documents', ['user_id', 'created_at'])
    op.create_index('idx_uploaded_documents_purge', 'uploaded_documents', ['purge_at'])

    # 16. BIS Knowledge Base Chunks
    op.create_table(
        'bis_kb_chunks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('chunk_text', sa.Text(), nullable=False),
        sa.Column('is_number', sa.String(50), sa.ForeignKey('standards.is_number', ondelete='SET NULL'), nullable=True),
        sa.Column('section_type', sa.String(30), nullable=False),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('status', sa.String(20), nullable=True),
        sa.Column('publication_date', sa.Date(), nullable=True),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sources.id', ondelete='SET NULL'), nullable=True),
        sa.Column('chunk_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("section_type IN ('scope', 'requirement', 'test', 'scheme_procedure', 'lab_registry', 'general')", name='chk_kb_chunk_section_type'),
    )
    op.create_index('idx_bis_kb_is_number', 'bis_kb_chunks', ['is_number'])
    op.create_index('idx_bis_kb_section_type', 'bis_kb_chunks', ['section_type'])


def downgrade() -> None:
    op.drop_table('bis_kb_chunks')
    op.drop_table('uploaded_documents')
    op.drop_table('comparisons')
    op.drop_table('saved_standards')
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('standard_laboratories')
    op.drop_table('laboratories')
    op.drop_table('certification_steps')
    op.drop_table('tests')
    op.drop_table('standard_related_standards')
    op.drop_table('standard_requirements')
    op.drop_table('standards')
    op.drop_table('sources')
    op.drop_table('users')
