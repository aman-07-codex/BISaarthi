from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

logger = get_logger("bisaarthi.errors")


class AppException(Exception):
    """Base application exception mapped to the standard error envelope."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Any] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class ValidationError(AppException):
    def __init__(self, message: str = "Invalid request payload or parameters.", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Missing, invalid, or expired authentication token."):
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class NotFoundError(AppException):
    def __init__(self, message: str = "Requested resource was not found."):
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ConflictError(AppException):
    def __init__(self, message: str = "Resource conflict occurred."):
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
        )


class DocumentNotReadyError(AppException):
    def __init__(self, message: str = "Document extraction is still in progress or not ready."):
        super().__init__(
            message=message,
            code="DOCUMENT_NOT_READY",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


class RateLimitedError(AppException):
    def __init__(self, message: str = "Rate limit exceeded. Please retry later."):
        super().__init__(
            message=message,
            code="RATE_LIMITED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        )


class RetrievalUnavailableError(AppException):
    def __init__(self, message: str = "Knowledge base retrieval is temporarily unavailable."):
        super().__init__(
            message=message,
            code="RETRIEVAL_UNAVAILABLE",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class InternalError(AppException):
    def __init__(self, message: str = "An unexpected internal server error occurred."):
        super().__init__(
            message=message,
            code="INTERNAL_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


def format_error_response(code: str, message: str) -> Dict[str, Any]:
    """Format payload to match the standard API error envelope."""
    return {
        "error": {
            "code": code,
            "message": message,
        }
    }


def register_exception_handlers(app: FastAPI) -> None:
    """Register all centralized exception handlers to the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.warning(
            "Application error on %s %s: [%s] %s",
            request.method,
            request.url.path,
            exc.code,
            exc.message,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=format_error_response(exc.code, exc.message),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        # Extract first human-readable validation error
        errors = exc.errors()
        if errors:
            first_err = errors[0]
            loc = " -> ".join(str(l) for l in first_err.get("loc", []))
            msg = f"{loc}: {first_err.get('msg', 'Validation failed')}"
        else:
            msg = "Validation failed for request payload."

        logger.info(
            "Validation error on %s %s: %s",
            request.method,
            request.url.path,
            msg,
        )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=format_error_response("VALIDATION_ERROR", msg),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code_map = {
            400: "VALIDATION_ERROR",
            401: "UNAUTHORIZED",
            403: "UNAUTHORIZED",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "VALIDATION_ERROR",
            429: "RATE_LIMITED",
            503: "RETRIEVAL_UNAVAILABLE",
        }
        code = code_map.get(exc.status_code, "INTERNAL_ERROR")
        message = str(exc.detail) if exc.detail else "An HTTP error occurred."
        return JSONResponse(
            status_code=exc.status_code,
            content=format_error_response(code, message),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(
            "Unhandled server exception on %s %s: %s",
            request.method,
            request.url.path,
            str(exc),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=format_error_response(
                "INTERNAL_ERROR",
                "An unexpected internal server error occurred. Please try again later.",
            ),
        )
