from __future__ import annotations

import base64
import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from app.core.config import get_settings


@dataclass
class RedditItem:
    reddit_fullname: str
    item_type: str
    subreddit: str
    permalink: str
    author_name: str | None
    title: str | None
    body: str | None
    score: int | None
    comment_count: int | None
    occurred_at: datetime
    metadata: dict[str, Any]


class RedditClientError(Exception):
    pass


class RedditRateLimitError(RedditClientError):
    pass


class RedditClient:
    OAUTH_URL = "https://www.reddit.com/api/v1/access_token"
    API_BASE = "https://oauth.reddit.com"

    def __init__(
        self,
        client_id: str | None = None,
        client_secret: str | None = None,
        username: str | None = None,
        password: str | None = None,
        user_agent: str | None = None,
        timeout_seconds: int | None = None,
    ) -> None:
        settings = get_settings()
        self.client_id = client_id or settings.reddit_client_id
        self.client_secret = client_secret or settings.reddit_client_secret
        self.username = username or settings.reddit_username
        self.password = password or settings.reddit_password
        self.user_agent = user_agent or settings.reddit_user_agent
        self.timeout_seconds = timeout_seconds or settings.reddit_request_timeout_seconds
        self._access_token: str | None = None

    def _basic_auth(self) -> str:
        if not self.client_id or not self.client_secret:
            raise RedditClientError("Credenciales de Reddit no configuradas.")
        creds = f"{self.client_id}:{self.client_secret}"
        return base64.b64encode(creds.encode("utf-8")).decode("utf-8")

    def _request(
        self,
        url: str,
        method: str = "GET",
        headers: dict[str, str] | None = None,
        data: bytes | None = None,
    ) -> tuple[dict[str, Any], dict[str, str]]:
        req_headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
        }
        if headers:
            req_headers.update(headers)

        request = urllib.request.Request(url, method=method, headers=req_headers, data=data)
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                response_headers = dict(response.headers)
                body = json.loads(response.read().decode("utf-8"))
                return body, response_headers
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                raise RedditRateLimitError("Rate limit excedido.") from exc
            raise RedditClientError(f"Error HTTP {exc.code}: {exc.reason}") from exc
        except urllib.error.URLError as exc:
            raise RedditClientError(f"Error de conexion: {exc.reason}") from exc

    def authenticate(self) -> None:
        if not self.username or not self.password:
            raise RedditClientError("Usuario o contrasena de Reddit no configurados.")
        data = urllib.parse.urlencode({
            "grant_type": "password",
            "username": self.username,
            "password": self.password,
        }).encode("utf-8")
        headers = {
            "Authorization": f"Basic {self._basic_auth()}",
        }
        body, _ = self._request(self.OAUTH_URL, method="POST", headers=headers, data=data)
        token = body.get("access_token")
        if not token:
            raise RedditClientError("No se recibio token de acceso.")
        self._access_token = token

    def _api_headers(self) -> dict[str, str]:
        if not self._access_token:
            self.authenticate()
        return {"Authorization": f"Bearer {self._access_token}"}

    def search_subreddit(
        self,
        subreddit: str,
        query: str,
        sort: str = "new",
        time: str = "day",
        limit: int = 25,
    ) -> tuple[list[RedditItem], dict[str, str]]:
        params = urllib.parse.urlencode({
            "q": query,
            "sort": sort,
            "t": time,
            "limit": limit,
            "restrict_sr": "1",
        })
        url = f"{self.API_BASE}/r/{subreddit}/search?{params}"
        body, headers = self._request(url, headers=self._api_headers())
        items = []
        for child in body.get("data", {}).get("children", []):
            data = child.get("data", {})
            items.append(self._parse_item(data, "submission"))
        return items, headers

    def _parse_item(self, data: dict[str, Any], item_type: str) -> RedditItem:
        permalink = data.get("permalink", "")
        if permalink and not permalink.startswith("http"):
            permalink = f"https://www.reddit.com{permalink}"
        return RedditItem(
            reddit_fullname=data.get("name", ""),
            item_type=item_type,
            subreddit=data.get("subreddit", ""),
            permalink=permalink,
            author_name=data.get("author"),
            title=data.get("title"),
            body=data.get("selftext") or data.get("body"),
            score=data.get("score"),
            comment_count=data.get("num_comments"),
            occurred_at=datetime.fromtimestamp(data.get("created_utc", 0), tz=timezone.utc),
            metadata={
                "score": data.get("score"),
                "num_comments": data.get("num_comments"),
                "over_18": data.get("over_18"),
                "link_flair_text": data.get("link_flair_text"),
            },
        )

    @staticmethod
    def parse_rate_limit_headers(headers: dict[str, str]) -> dict[str, Any]:
        return {
            "used": headers.get("x-ratelimit-used"),
            "remaining": headers.get("x-ratelimit-remaining"),
            "reset": headers.get("x-ratelimit-reset"),
        }
