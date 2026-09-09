import datetime
from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import ConflictError, UnauthorizedError, ValidationError
from app.core.logging import get_logger
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdatePreferencesRequest,
    UserResponse,
)

logger = get_logger("bisaarthi.auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account with email and password, returning JWT access token.",
)
@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def register(
    payload: RegisterRequest,
    db: Optional[AsyncSession] = Depends(get_db),
) -> TokenResponse:
    """Register a new user account with email and password."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    # Check for existing email
    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user is not None:
        logger.warning("Registration attempted for already registered email: %s", payload.email)
        raise ConflictError("An account with this email address already exists.")

    # Assign default name from email prefix if omitted
    name = payload.name.strip() if payload.name and payload.name.strip() else payload.email.split("@")[0]

    # Create user with Argon2 hash
    new_user = User(
        name=name,
        email=payload.email,
        auth_provider="email",
        password_hash=hash_password(payload.password),
        preferred_language="en",
        theme="light",
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    logger.info("User registered successfully with ID: %s", str(new_user.id))

    # Issue JWT token
    token_expire_seconds = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    token = create_access_token(
        subject=new_user.id,
        expires_delta=datetime.timedelta(seconds=token_expire_seconds),
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=token_expire_seconds,
        user=UserResponse.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticate user with email and password to receive a JWT access token.",
)
async def login(
    payload: LoginRequest,
    db: Optional[AsyncSession] = Depends(get_db),
) -> TokenResponse:
    """Authenticate existing user credentials."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None or not user.password_hash or not verify_password(payload.password, user.password_hash):
        logger.info("Failed login attempt for email: %s", payload.email)
        raise UnauthorizedError("Invalid email or password.")

    logger.info("User %s logged in successfully.", str(user.id))

    token_expire_seconds = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    token = create_access_token(
        subject=user.id,
        expires_delta=datetime.timedelta(seconds=token_expire_seconds),
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=token_expire_seconds,
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Retrieve profile details for the currently authenticated user.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the authenticated user profile."""
    return UserResponse.model_validate(current_user)


@router.patch(
    "/me/preferences",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user preferences",
    description="Update interface preferences (language, theme) for the current user.",
)
@router.put(
    "/me/preferences",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
async def update_preferences(
    payload: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> UserResponse:
    """Update language or theme preferences for the authenticated user."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    if payload.preferred_language is not None:
        current_user.preferred_language = payload.preferred_language
    if payload.theme is not None:
        current_user.theme = payload.theme

    await db.commit()
    await db.refresh(current_user)

    logger.info("User %s updated preferences.", str(current_user.id))
    return UserResponse.model_validate(current_user)
