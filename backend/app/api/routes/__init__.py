"""API route endpoints registration."""

from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.standards import router as standards_router
from app.api.routes.chat import router as chat_router

api_router = APIRouter()

# Register core route modules
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(standards_router)
api_router.include_router(chat_router)



