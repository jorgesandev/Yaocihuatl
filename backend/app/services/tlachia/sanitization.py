from __future__ import annotations

import hashlib
import hmac
import re
from typing import Any

from app.services.tlachia.synthetic_adapters import SyntheticPlatformMention

# Salt interno para author_hash. En produccion debe rotarse y no versionarse.
_AUTHOR_HASH_SALT = b"yaocihuatl-tlachia-salt-v1"

_MAX_EXCERPT_LENGTH = 800


class SanitizationService:
    def sanitize_platform_mention(self, item: SyntheticPlatformMention) -> dict[str, Any]:
        excerpt = self._clip(item.text or "", _MAX_EXCERPT_LENGTH)
        excerpt = self._normalize_whitespace(excerpt)
        excerpt = self._remove_handles(excerpt)
        author_hash = self._hash_author(item.author_synthetic_id or item.author_label or "")
        content_fingerprint = self._content_fingerprint(excerpt)
        return {
            "synthetic_id": item.synthetic_id,
            "platform": item.platform,
            "source_kind": item.source_kind,
            "source_url": item.source_url,
            "author_hash": author_hash,
            "sanitized_excerpt": excerpt,
            "occurred_at": item.occurred_at,
            "metadata": {
                **item.metadata,
                "engagement": item.engagement,
                "language": item.language,
                "content_fingerprint": content_fingerprint,
            },
        }

    @staticmethod
    def _clip(text: str, max_length: int) -> str:
        if len(text) <= max_length:
            return text
        return text[:max_length] + "…"

    @staticmethod
    def _normalize_whitespace(text: str) -> str:
        return re.sub(r"\s+", " ", text).strip()

    @staticmethod
    def _remove_handles(text: str) -> str:
        # Remover u/username básico; no es perfecto pero es explicable y revisable.
        return re.sub(r"(?:\b|^)\/?u/\w+", "[USUARIO]", text)

    @staticmethod
    def _hash_author(author_name: str) -> str:
        digest = hmac.new(_AUTHOR_HASH_SALT, author_name.encode("utf-8"), hashlib.sha256).hexdigest()
        return digest

    @staticmethod
    def _content_fingerprint(text: str) -> str:
        normalized = re.sub(r"[^\w\s]", "", text.lower())
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    def is_duplicate(self, existing_fingerprint: str, new_text: str) -> bool:
        return existing_fingerprint == self._content_fingerprint(new_text)
