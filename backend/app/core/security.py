import datetime
from datetime import timezone
import uuid
from typing import Any, Dict, Optional, Union

import jwt
from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import UnauthorizedError
from app.core.logging import get_logger
from app.db.session import get_db
from app.models.user import User

logger = get_logger("bisaarthi.security")

# Modern Argon2 password hasher
_password_hash = PasswordHash.recommended()

# Bearer token extractor (auto_error=False to allow custom standard error envelope)
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash plaintext password using Argon2id."""
    return _password_hash.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against Argon2 hash."""
    if not password or not password_hash:
        return False
    try:
        return _password_hash.verify(password, password_hash)
    except Exception as e:
        logger.warning("Password verification failed with error: %s", str(e))
        return False


def create_access_token(
    subject: Union[str, uuid.UUID],
    expires_delta: Optional[datetime.timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Generate a signed JWT access token."""
    now = datetime.datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)

    encoded_jwt = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT access token.
    
    Raises:
        UnauthorizedError: If token is expired, has invalid signature, or invalid structure.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        sub = payload.get("sub")
        if not sub:
            raise UnauthorizedError("Token payload is missing subject (sub).")
        return payload
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Authentication token has expired.")
    except jwt.InvalidTokenError as e:
        raise UnauthorizedError(f"Invalid authentication token: {str(e)}")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Optional[AsyncSession] = Depends(get_db),
) -> User:
    """FastAPI dependency to retrieve the authenticated user from the Bearer token."""
    if not credentials or not credentials.credentials:
        raise UnauthorizedError("Missing authentication token.")

    token = credentials.credentials
    payload = decode_access_token(token)
    user_id_str = payload.get("sub")

    try:
        user_uuid = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise UnauthorizedError("Invalid user ID in token.")

    if db is None:
        # If database session is not active/configured
        raise UnauthorizedError("Database service is currently unavailable.")

    stmt = select(User).where(User.id == user_uuid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise UnauthorizedError("User associated with this token does not exist.")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """FastAPI dependency to ensure the user is active."""
    return current_user
