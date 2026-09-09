import pytest
import httpx
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {
            "status": "ok",
            "service": "BISaarthi API",
        }


@pytest.mark.asyncio
async def test_openapi_docs():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        docs_res = await client.get("/docs")
        assert docs_res.status_code == 200

        openapi_res = await client.get("/openapi.json")
        assert openapi_res.status_code == 200
        schema = openapi_res.json()
        assert schema["info"]["title"] == "BISaarthi"
        paths = schema["paths"]
        assert "/api/health" in paths
        assert "/api/auth/register" in paths
        assert "/api/auth/login" in paths
        assert "/api/auth/me" in paths
        assert "/api/auth/me/preferences" in paths
        assert "/api/standards" in paths
        assert "/api/standards/{is_number}" in paths
        assert "/api/standards/{is_number}/requirements" in paths
        assert "/api/standards/{is_number}/tests" in paths
        assert "/api/standards/{is_number}/related" in paths
        assert "/api/standards/{is_number}/certification" in paths
        assert "/api/standards/{is_number}/laboratories" in paths
        assert "/api/standards/saved" in paths
        assert "/api/standards/{is_number}/save" in paths




@pytest.mark.asyncio
async def test_standard_error_envelope():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/non-existent-route")
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "NOT_FOUND"
