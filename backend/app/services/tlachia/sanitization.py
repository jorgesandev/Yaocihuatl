from __future__ import annotations

import hashlib
import hmac
import re
from datetime import datetime, timedelta, timezone
from typing import Any

from app.core.config import get_settings
from app.services.tlachia.reddit_client import RedditItem

# Salt interno para author_hash. En produccion debe rotarse y no versionarse.
_AUTHOR_HASH_SALT = b"yaocihuatl-tlachia-salt-v1"

_MAX_EXCERPT_LENGTH = 800


class SanitizationService:
    def sanitize_reddit_item(self, item: RedditItem) -> dict[str, Any]:
        title = self._clip(item.title or "", _MAX_EXCERPT_LENGTH)
        body = self._clip(item.body or "", _MAX_EXCERPT_LENGTH)
        excerpt = self._normalize_whitespace(f"{title} {body}".strip())
        excerpt = self._remove_handles(excerpt)
        author_hash = self._hash_author(item.author_name or "")
        content_fingerprint = self._content_fingerprint(excerpt)
        return {
            "reddit_fullname": item.reddit_fullname,
            "subreddit": item.subreddit,
            "permalink": item.permalink,
            "item_type": item.item_type,
            "author_hash": author_hash,
            "sanitized_excerpt": excerpt,
            "occurred_at": item.occurred_at,
            "metadata": {
                "score": item.metadata.get("score"),
                "num_comments": item.metadata.get("num_comments"),
                "over_18": item.metadata.get("over_18"),
                "link_flair_text": item.metadata.get("link_flair_text"),
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
        return re.sub(r"\b/?u/\w+", "[USUARIO]", text)

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
