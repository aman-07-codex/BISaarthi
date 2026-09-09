from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Health check response payload."""
    status: str = Field(default="ok", json_schema_extra={"example": "ok"})
    service: str = Field(default="BISaarthi API", json_schema_extra={"example": "BISaarthi API"})



@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns the operational status of the BISaarthi API service.",
)
async def health_check() -> HealthResponse:
    """Verify that the FastAPI service is running and responsive."""
    return HealthResponse(
        status="ok",
        service="BISaarthi API",
    )
