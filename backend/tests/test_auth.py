import datetime
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.user import User


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient, test_db_session: AsyncSession):
    """Test successful user registration."""
    payload = {
        "email": "testuser@example.com",
        "password": "SecurePassword123!",
        "name": "Test User",
    }
    response = await async_client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0
    assert "user" in data

    user_data = data["user"]
    assert user_data["email"] == "testuser@example.com"
    assert user_data["name"] == "Test User"
    assert user_data["auth_provider"] == "email"
    assert user_data["preferred_language"] == "en"
    assert user_data["theme"] == "light"
    assert "password_hash" not in user_data


@pytest.mark.asyncio
async def test_password_stored_as_argon2_hash(async_client: AsyncClient, test_db_session: AsyncSession):
    """Verify password is saved as Argon2 hash and not plaintext in database."""
    payload = {
        "email": "argon2user@example.com",
        "password": "MySecretPassword99",
    }
    response = await async_client.post("/api/auth/register", json=payload)
    assert response.status_code == 201

    stmt = select(User).where(User.email == "argon2user@example.com")
    result = await test_db_session.execute(stmt)
    user = result.scalar_one()

    assert user.password_hash is not None
    assert user.password_hash != "MySecretPassword99"
    assert user.password_hash.startswith("$argon2")
    assert verify_password("MySecretPassword99", user.password_hash)


@pytest.mark.asyncio
async def test_register_duplicate_email_conflict(async_client: AsyncClient):
    """Verify duplicate email registration returns 409 Conflict."""
    payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
    }
    # First registration
    res1 = await async_client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    # Second registration with same email
    res2 = await async_client.post("/api/auth/register", json=payload)
    assert res2.status_code == 409
    
    data = res2.json()
    assert "error" in data
    assert data["error"]["code"] == "CONFLICT"


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient):
    """Verify login succeeds with correct credentials."""
    # Register first
    reg_payload = {
        "email": "loginuser@example.com",
        "password": "CorrectPassword123",
        "name": "Login User",
    }
    await async_client.post("/api/auth/register", json=reg_payload)

    # Login
    login_payload = {
        "email": "loginuser@example.com",
        "password": "CorrectPassword123",
    }
    res = await async_client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "loginuser@example.com"
    assert "password_hash" not in data["user"]


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient):
    """Verify login fails with incorrect password."""
    reg_payload = {
        "email": "wrongpw@example.com",
        "password": "OriginalPassword123",
    }
    await async_client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "wrongpw@example.com",
        "password": "WrongPassword123",
    }
    res = await async_client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 401
    
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_login_nonexistent_user(async_client: AsyncClient):
    """Verify login fails for nonexistent user."""
    login_payload = {
        "email": "ghost@example.com",
        "password": "SomePassword123",
    }
    res = await async_client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


def test_jwt_token_generation_and_decode():
    """Verify JWT access token encoding and decoding."""
    test_uid = uuid.uuid4()
    token = create_access_token(
        subject=test_uid,
        expires_delta=datetime.timedelta(minutes=15),
    )
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload["sub"] == str(test_uid)
    assert payload["type"] == "access"
    assert "exp" in payload
    assert "iat" in payload


@pytest.mark.asyncio
async def test_get_me_with_valid_token(async_client: AsyncClient):
    """Verify /api/auth/me returns current user with valid Bearer token."""
    reg_payload = {
        "email": "me@example.com",
        "password": "Password123!",
        "name": "Me User",
    }
    reg_res = await async_client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    res = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    user_data = res.json()
    assert user_data["email"] == "me@example.com"
    assert user_data["name"] == "Me User"
    assert "password_hash" not in user_data


@pytest.mark.asyncio
async def test_get_me_missing_token(async_client: AsyncClient):
    """Verify /api/auth/me returns 401 without Authorization header."""
    res = await async_client.get("/api/auth/me")
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_me_invalid_token(async_client: AsyncClient):
    """Verify /api/auth/me returns 401 with malformed token."""
    res = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.fake.token"},
    )
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_me_expired_token(async_client: AsyncClient):
    """Verify /api/auth/me returns 401 with expired token."""
    test_uid = uuid.uuid4()
    expired_token = create_access_token(
        subject=test_uid,
        expires_delta=datetime.timedelta(seconds=-10),
    )

    res = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_me_token_for_nonexistent_user(async_client: AsyncClient):
    """Verify /api/auth/me returns 401 when token subject does not exist in DB."""
    nonexistent_uid = uuid.uuid4()
    token = create_access_token(subject=nonexistent_uid)

    res = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_update_preferences_success(async_client: AsyncClient):
    """Verify updating preferred_language and theme preferences."""
    reg_payload = {
        "email": "pref@example.com",
        "password": "Password123!",
    }
    reg_res = await async_client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    patch_payload = {
        "preferred_language": "hi",
        "theme": "dark",
    }
    res = await async_client.patch(
        "/api/auth/me/preferences",
        json=patch_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["preferred_language"] == "hi"
    assert data["theme"] == "dark"


@pytest.mark.asyncio
async def test_update_preferences_invalid_language(async_client: AsyncClient):
    """Verify invalid language choice is rejected with validation error."""
    reg_payload = {
        "email": "preflang@example.com",
        "password": "Password123!",
    }
    reg_res = await async_client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    patch_payload = {
        "preferred_language": "fr",  # Only 'en' and 'hi' allowed
    }
    res = await async_client.patch(
        "/api/auth/me/preferences",
        json=patch_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_update_preferences_invalid_theme(async_client: AsyncClient):
    """Verify invalid theme choice is rejected with validation error."""
    reg_payload = {
        "email": "preftheme@example.com",
        "password": "Password123!",
    }
    reg_res = await async_client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    patch_payload = {
        "theme": "cyberpunk",  # Only 'light' and 'dark' allowed
    }
    res = await async_client.patch(
        "/api/auth/me/preferences",
        json=patch_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_update_preferences_unauthenticated(async_client: AsyncClient):
    """Verify unauthenticated preference update is rejected."""
    res = await async_client.patch(
        "/api/auth/me/preferences",
        json={"theme": "dark"},
    )
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"
