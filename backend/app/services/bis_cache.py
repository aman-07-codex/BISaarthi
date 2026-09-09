"""Lightweight local file-based cache for official BIS API responses.

Provides fast local caching of external BIS API responses to avoid hammering
the official BIS servers during validation runs, testing, and debugging.
The manifest remains the authoritative single source of truth.
"""

import hashlib
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

from app.core.logging import get_logger

logger = get_logger("bis_cache")


class BISCache:
    """File-based JSON cache for BIS API requests."""

    def __init__(self, cache_dir: Optional[Path] = None, enabled: bool = True):
        self.enabled = enabled
        if cache_dir is None:
            # Default to .bis_cache in backend root
            backend_root = Path(__file__).resolve().parent.parent.parent
            self.cache_dir = backend_root / ".bis_cache"
        else:
            self.cache_dir = Path(cache_dir)

        if self.enabled:
            self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _make_key(self, endpoint: str, payload: Optional[Dict[str, Any]] = None) -> str:
        """Create a deterministic hash key for an endpoint and payload."""
        normalized_payload = json.dumps(payload or {}, sort_keys=True)
        raw_key = f"{endpoint}::{normalized_payload}"
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    def _get_path(self, key: str) -> Path:
        return self.cache_dir / f"{key}.json"

    def get(self, endpoint: str, payload: Optional[Dict[str, Any]] = None) -> Optional[Any]:
        """Retrieve a cached response payload if available."""
        if not self.enabled:
            return None

        key = self._make_key(endpoint, payload)
        cache_file = self._get_path(key)

        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    logger.debug(f"Cache hit for {endpoint} (key: {key[:8]})")
                    return data
            except Exception as e:
                logger.warning(f"Failed to read cache file {cache_file}: {e}")
                return None
        return None

    def set(self, endpoint: str, payload: Optional[Dict[str, Any]], data: Any) -> None:
        """Save a response payload into the file cache."""
        if not self.enabled:
            return

        key = self._make_key(endpoint, payload)
        cache_file = self._get_path(key)

        try:
            temp_file = self.cache_dir / f"{key}.tmp"
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            os.replace(temp_file, cache_file)
            logger.debug(f"Cached response for {endpoint} (key: {key[:8]})")
        except Exception as e:
            logger.warning(f"Failed to write cache file {cache_file}: {e}")

    def has(self, endpoint: str, payload: Optional[Dict[str, Any]] = None) -> bool:
        """Check if an endpoint + payload combination is present in cache."""
        if not self.enabled:
            return False
        key = self._make_key(endpoint, payload)
        return self._get_path(key).exists()

    def clear(self) -> int:
        """Remove all cached files and return count removed."""
        if not self.cache_dir.exists():
            return 0
        count = 0
        for f in self.cache_dir.glob("*.json"):
            try:
                f.unlink()
                count += 1
            except Exception as e:
                logger.warning(f"Failed to delete {f}: {e}")
        return count
