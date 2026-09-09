import logging
import re
import sys
from typing import Any

# Patterns to mask sensitive data if inadvertently passed to logger
SENSITIVE_PATTERNS = [
    (re.compile(r'(password[\s\'"=:]+)([^\s\'",;&]+)', re.IGNORECASE), r'\1***MASKED***'),
    (re.compile(r'(secret[\s\'"=:]+)([^\s\'",;&]+)', re.IGNORECASE), r'\1***MASKED***'),
    (re.compile(r'(api_key[\s\'"=:]+)([^\s\'",;&]+)', re.IGNORECASE), r'\1***MASKED***'),
    (re.compile(r'(authorization[\s\'"=:]+Bearer\s+)([^\s\'",;&]+)', re.IGNORECASE), r'\1***MASKED***'),
    (re.compile(r'(token[\s\'"=:]+)([^\s\'",;&]+)', re.IGNORECASE), r'\1***MASKED***'),
    (re.compile(r'(postgresql(?:\+\w+)?:\/\/[^:]+:)([^@]+)(@)', re.IGNORECASE), r'\1***MASKED***\3'),
]


class SensitiveDataFilter(logging.Filter):
    """Filter to sanitize sensitive keywords from log messages."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            msg = record.msg
            for pattern, repl in SENSITIVE_PATTERNS:
                msg = pattern.sub(repl, msg)
            record.msg = msg
        return True


def setup_logging(level: int = logging.INFO) -> None:
    """Initialize consistent backend logging format."""
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(log_format, datefmt=date_format))
    handler.addFilter(SensitiveDataFilter())

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Avoid duplicate handlers if setup is called multiple times
    if not root_logger.handlers:
        root_logger.addHandler(handler)
    else:
        root_logger.handlers = [handler]

    # Silence overly verbose external loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str = "bisaarthi") -> logging.Logger:
    """Get a named logger with the project configuration."""
    return logging.getLogger(name)
