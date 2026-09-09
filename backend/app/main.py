import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.routes import api_router
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.db.session import close_db_engine, create_tables_if_needed, init_db_engine

# Initialize structured logging
setup_logging()
logger = get_logger("bisaarthi.main")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log basic request info and execution latency."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        
        # Process request
        response = await call_next(request)
        
        process_time_ms = (time.perf_counter() - start_time) * 1000.0
        
        # Log basic request metrics without sensitive payload data
        logger.info(
            "%s %s -> status=%d duration=%.2fms",
            request.method,
            request.url.path,
            response.status_code,
            process_time_ms,
        )
        return response


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context for startup and graceful shutdown."""
    logger.info("Starting %s in %s mode...", settings.APP_NAME, settings.APP_ENV)
    
    # Initialize database engine and ensure all tables exist
    engine = init_db_engine()
    if engine is not None:
        await create_tables_if_needed(engine)
    
    logger.info("Application ready. API prefix: %s", settings.API_PREFIX)
    yield
    
    # Shutdown sequence
    logger.info("Shutting down %s...", settings.APP_NAME)
    await close_db_engine()
    logger.info("Shutdown complete.")


def create_app() -> FastAPI:
    """Factory function to instantiate and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI Guide to Indian Standards & BIS Compliance API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request Logging Middleware
    app.add_middleware(RequestLoggingMiddleware)

    # Centralized Exception Handlers
    register_exception_handlers(app)

    # Register API Router
    app.include_router(api_router, prefix=settings.API_PREFIX)

    return app


app = create_app()
