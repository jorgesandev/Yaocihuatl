from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any


class SyntheticAdapterError(ValueError):
    pass


@dataclass(frozen=True)
class SyntheticPlatformMention:
    synthetic_id: str
    platform: str
    source_kind: str
    source_url: str
    author_label: str | None
    author_synthetic_id: str | None
    occurred_at: datetime
    text: str
    language: str
    engagement: dict[str, int]
    metadata: dict[str, Any]


class SyntheticPlatformAdapter:
    platform: str = ""
    default_fixture: str = ""

    def fetch_mentions(self, fixture_path: Path) -> list[SyntheticPlatformMention]:
        payload = self._read_fixture(fixture_path)
        if payload.get("platform") != self.platform:
            raise SyntheticAdapterError(f"Fixture no corresponde a plataforma {self.platform}.")
        if payload.get("contains_real_personal_data") is not False:
            raise SyntheticAdapterError("Fixture debe declarar contains_real_personal_data=false.")
        if payload.get("synthetic") is not True:
            raise SyntheticAdapterError("Fixture debe declarar synthetic=true.")
        scenario = str(payload.get("scenario", "unknown"))
        mentions = []
        for item in payload.get("items", []):
            mentions.append(self._parse_item(item, fixture_path.name, scenario))
        return mentions

    @staticmethod
    def _read_fixture(fixture_path: Path) -> dict[str, Any]:
        if not fixture_path.exists():
            raise SyntheticAdapterError(f"Fixture no encontrado: {fixture_path}")
        return json.loads(fixture_path.read_text(encoding="utf-8"))

    def _parse_item(self, item: dict[str, Any], fixture_file: str, scenario: str) -> SyntheticPlatformMention:
        occurred_at_raw = item.get("occurred_at")
        if not occurred_at_raw:
            raise SyntheticAdapterError("Item sintetico sin occurred_at.")
        occurred_at = datetime.fromisoformat(str(occurred_at_raw).replace("Z", "+00:00"))
        if occurred_at.tzinfo is None:
            occurred_at = occurred_at.replace(tzinfo=timezone.utc)
        metadata = dict(item.get("metadata") or {})
        metadata.update(
            {
                "fixture_file": fixture_file,
                "scenario": scenario,
                "synthetic": True,
                "platform": self.platform,
            }
        )
        return SyntheticPlatformMention(
            synthetic_id=str(item["synthetic_id"]),
            platform=self.platform,
            source_kind=str(item.get("source_kind", "post")),
            source_url=str(item.get("source_url", "https://example.invalid")),
            author_label=item.get("author_label"),
            author_synthetic_id=item.get("author_synthetic_id"),
            occurred_at=occurred_at,
            text=str(item.get("text", "")),
            language=str(item.get("language", "es")),
            engagement=dict(item.get("engagement") or {}),
            metadata=metadata,
        )


class FacebookSyntheticAdapter(SyntheticPlatformAdapter):
    platform = "facebook"
    default_fixture = "facebook-feed.json"


class InstagramSyntheticAdapter(SyntheticPlatformAdapter):
    platform = "instagram"
    default_fixture = "instagram-comments.json"


class XSyntheticAdapter(SyntheticPlatformAdapter):
    platform = "x"
    default_fixture = "x-search.json"


class TikTokSyntheticAdapter(SyntheticPlatformAdapter):
    platform = "tiktok"
    default_fixture = "tiktok-comments.json"


class RedditSyntheticAdapter(SyntheticPlatformAdapter):
    platform = "reddit"
    default_fixture = "reddit-listing.json"


ADAPTERS: dict[str, SyntheticPlatformAdapter] = {
    "facebook": FacebookSyntheticAdapter(),
    "instagram": InstagramSyntheticAdapter(),
    "x": XSyntheticAdapter(),
    "tiktok": TikTokSyntheticAdapter(),
    "reddit": RedditSyntheticAdapter(),
}
