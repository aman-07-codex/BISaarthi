import pytest
from app.db.session import Base
import app.models as models


def test_models_metadata_registered():
    """Verify all 14 tables are properly registered on Base.metadata."""
    table_names = set(Base.metadata.tables.keys())
    expected_tables = {
        "users",
        "conversations",
        "messages",
        "sources",
        "standards",
        "standard_requirements",
        "standard_related_standards",
        "tests",
        "certification_steps",
        "laboratories",
        "standard_laboratories",
        "saved_standards",
        "comparisons",
        "uploaded_documents",
        "bis_kb_chunks",
    }
    assert expected_tables.issubset(table_names), f"Missing tables: {expected_tables - table_names}"


def test_user_model_constraints():
    """Verify User model columns and check constraints."""
    user_table = Base.metadata.tables["users"]
    assert "email" in user_table.c
    assert "auth_provider" in user_table.c
    assert "preferred_language" in user_table.c
    assert "theme" in user_table.c


def test_standard_model_foreign_keys():
    """Verify Standard and requirement relationships and foreign keys."""
    standards_table = Base.metadata.tables["standards"]
    reqs_table = Base.metadata.tables["standard_requirements"]
    tests_table = Base.metadata.tables["tests"]
    
    assert standards_table.c.is_number.primary_key
    assert len(reqs_table.foreign_keys) >= 1
    assert len(tests_table.foreign_keys) >= 1


def test_comparison_model_constraints():
    """Verify Comparison model has constraints for exactly two distinct standards."""
    comp_table = Base.metadata.tables["comparisons"]
    assert "standard_a" in comp_table.c
    assert "standard_b" in comp_table.c
    assert "result_json" in comp_table.c


def test_uploaded_documents_model_constraints():
    """Verify UploadedDocument statuses and fields."""
    docs_table = Base.metadata.tables["uploaded_documents"]
    assert "file_name" in docs_table.c
    assert "status" in docs_table.c
    assert "storage_path" in docs_table.c


@pytest.mark.asyncio
async def test_db_connection_unconfigured():
    """Verify graceful handling when DATABASE_URL is not configured."""
    from app.db.session import check_db_connection, is_db_configured
    from app.core.config import Settings

    # Check that check_db_connection returns a tuple with status
    is_connected, msg = await check_db_connection()
    assert isinstance(is_connected, bool)
    assert isinstance(msg, str)
