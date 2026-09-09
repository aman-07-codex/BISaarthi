import asyncio
import pytest
import httpx
from app.main import app


@pytest.mark.asyncio
async def test_backend():

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/api/health")
        print(f"1. Health status: {res.status_code}, body: {res.json()}")
        assert res.status_code == 200
        assert res.json() == {"status": "ok", "service": "BISaarthi API"}

        # 2. OpenAPI schema
        res = await client.get("/openapi.json")
        info = res.json()["info"]
        print(f"2. OpenAPI status: {res.status_code}, title: {info['title']}, version: {info['version']}")
        assert res.status_code == 200
        assert info["title"] == "BISaarthi"

        # 3. Docs endpoint
        res = await client.get("/docs")
        print(f"3. Swagger docs status: {res.status_code}")
        assert res.status_code == 200

        # 4. Error envelope on 404
        res = await client.get("/api/unknown-route")
        print(f"4. 404 test status: {res.status_code}, body: {res.json()}")
        assert res.status_code == 404
        assert "error" in res.json()
        assert res.json()["error"]["code"] == "NOT_FOUND"

    print("\n>>> ALL BACKEND FOUNDATION TESTS PASSED SUCCESSFULLY! <<<")


if __name__ == "__main__":
    asyncio.run(test_backend())
