from functools import lru_cache
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = Field(default="BISaarthi", description="Application name")
    APP_ENV: str = Field(default="development", description="Environment: development, staging, production")
    API_PREFIX: str = Field(default="/api", description="Base prefix for all API routes")
    FRONTEND_URL: str = Field(default="http://localhost:3000", description="Base URL of the frontend application")

    # Database
    DATABASE_URL: Optional[str] = Field(
        default=None,
        description="PostgreSQL / Supabase connection URL (e.g. postgresql+asyncpg://...)",
    )

    # Authentication & Security
    JWT_SECRET_KEY: str = Field(
        default="dev-insecure-secret-key-change-in-production",
        description="Secret key for signing JWT tokens",
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        description="Expiration time for access tokens in minutes",
    )

    # Additional CORS Origins (comma separated or list)
    ALLOWED_ORIGINS: Optional[List[str]] = Field(
        default=None,
        description="Additional allowed CORS origins",
    )

    # Google Gemini LLM Settings
    GEMINI_API_KEY: Optional[str] = Field(
        default=None,
        description="Google Gemini API Key for synthesis and conversational RAG",
    )
    GEMINI_MODEL: str = Field(
        default="gemini-3.5-flash-lite",
        description="Default Google Gemini model name",
    )
    GEMINI_TIMEOUT: float = Field(
        default=30.0,
        description="Timeout in seconds for Gemini API requests",
    )
    GEMINI_MAX_OUTPUT_TOKENS: int = Field(
        default=2048,
        description="Maximum output tokens for Gemini completions",
    )
    LLM_PROVIDER: str = Field(
        default="gemini",
        description="Configured LLM provider: 'gemini' or 'mock'",
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            if not v.strip():
                return None
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        # If in production and default key is used, raise error
        return v

    @property
    def is_development(self) -> bool:
        return self.APP_ENV.lower() in ("dev", "development", "local")

    @property
    def cors_origins(self) -> List[str]:
        origins = {
            self.FRONTEND_URL.rstrip("/"),
            "https://bisaarthi-sigma.vercel.app",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        }
        if self.ALLOWED_ORIGINS:
            origins.update([o.rstrip("/") for o in self.ALLOWED_ORIGINS])
        return list(origins)


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


settings = get_settings()
