import os
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("bisaarthi.db")


class Base(DeclarativeBase):
    """SQLAlchemy Declarative Base for all data models."""
    pass


_async_engine: Optional[AsyncEngine] = None
_async_session_factory: Optional[async_sessionmaker[AsyncSession]] = None


import urllib.parse

def get_effective_database_url() -> str:
    """Determine effective database connection URL (PostgreSQL / Supabase or resilient local SQLite)."""
    if settings.DATABASE_URL and settings.DATABASE_URL.strip():
        url = settings.DATABASE_URL.strip()
        if url.startswith("postgresql://") or url.startswith("postgresql+asyncpg://"):
            prefix = "postgresql+asyncpg://"
            rest = url.split("://", 1)[1]
            if "@" in rest:
                creds, host_part = rest.rsplit("@", 1)
                if ":" in creds:
                    user, pwd = creds.split(":", 1)
                    safe_user = urllib.parse.quote_plus(urllib.parse.unquote_plus(user))
                    safe_pwd = urllib.parse.quote_plus(urllib.parse.unquote_plus(pwd))
                    return f"{prefix}{safe_user}:{safe_pwd}@{host_part}"
                return f"{prefix}{creds}@{host_part}"
            return f"{prefix}{rest}"
        return url

    # Default to resilient local async SQLite database
    os.makedirs("data", exist_ok=True)
    return "sqlite+aiosqlite:///./data/bisaarthi.db"


def is_db_configured() -> bool:
    """Check if database is configured or auto-resolved."""
    return True


def init_db_engine() -> Optional[AsyncEngine]:
    """Initialize the asynchronous database engine."""
    global _async_engine, _async_session_factory

    try:
        url = get_effective_database_url()
        is_sqlite = url.startswith("sqlite")

        engine_kwargs = {
            "echo": False,
            "future": True,
        }
        if not is_sqlite:
            engine_kwargs["pool_pre_ping"] = True
            engine_kwargs["connect_args"] = {
                "statement_cache_size": 0,
                "prepared_statement_cache_size": 0,
            }

        _async_engine = create_async_engine(url, **engine_kwargs)
        _async_session_factory = async_sessionmaker(
            bind=_async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        logger.info("Database engine initialized with URL dialect: %s", url.split("://")[0])
        return _async_engine
    except Exception as e:
        logger.warning("Could not initialize database engine: %s", str(e))
        _async_engine = None
        _async_session_factory = None
        return None


async def create_tables_if_needed(engine: Optional[AsyncEngine] = None) -> None:
    """Create all tables defined in models if they don't exist."""
    target_engine = engine or _async_engine or init_db_engine()
    if target_engine is None:
        return

    try:
        # Import models to ensure all table definitions are in Base.metadata
        import app.models  # noqa: F401
        async with target_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema verified and tables synchronized successfully.")
    except Exception as e:
        logger.warning("Auto-creation of database tables encountered a warning: %s", str(e))


async def close_db_engine() -> None:
    """Dispose of the database engine on application shutdown."""
    global _async_engine, _async_session_factory
    if _async_engine is not None:
        await _async_engine.dispose()
        _async_engine = None
        _async_session_factory = None
        logger.info("Database engine disposed.")


async def get_db() -> AsyncGenerator[Optional[AsyncSession], None]:
    """FastAPI dependency yielding an async database session."""
    global _async_session_factory
    if _async_session_factory is None:
        init_db_engine()

    if _async_session_factory is None:
        yield None
        return

    async with _async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_db_connection() -> tuple[bool, str]:
    """Asynchronously verify database connectivity.
    
    Returns:
        tuple[bool, str]: (is_connected, message)
    """
    engine = _async_engine or init_db_engine()
    if engine is None:
        return False, "Database engine could not be initialized."

    try:
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True, "Successfully connected to database."
    except Exception as e:
        logger.error("Database connection check failed: %s", str(e))
        return False, f"Connection failed: {str(e)}"
