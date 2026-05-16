import json
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from app.services.tlachia.reddit_client import (
    RedditClient,
    RedditClientError,
    RedditItem,
    RedditRateLimitError,
)


def test_client_builds_user_agent() -> None:
    client = RedditClient(user_agent="test-agent")
    assert client.user_agent == "test-agent"


def test_client_without_credentials_raises_clear_error() -> None:
    client = RedditClient(
        client_id="",
        client_secret="",
        username="",
        password="",
    )
    try:
        client.authenticate()
    except RedditClientError as exc:
        assert "Credenciales" in str(exc) or "Usuario" in str(exc)


@patch("app.services.tlachia.reddit_client.urllib.request.urlopen")
def test_client_handles_429_rate_limit(mock_urlopen) -> None:
    mock_response = MagicMock()
    mock_response.getcode.return_value = 429
    mock_urlopen.side_effect = Exception("HTTP Error 429")
    client = RedditClient(
        client_id="id",
        client_secret="secret",
        username="user",
        password="pass",
        user_agent="test",
    )


def test_client_converts_reddit_response_to_reddit_item() -> None:
    data = {
        "name": "t3_abc123",
        "subreddit": "test",
        "permalink": "/r/test/comments/abc123/title/",
        "author": "someuser",
        "title": "Test title",
        "selftext": "Test body",
        "score": 42,
        "num_comments": 10,
        "created_utc": 1715769600.0,
        "over_18": False,
        "link_flair_text": None,
    }
    client = RedditClient()
    item = client._parse_item(data, "submission")
    assert isinstance(item, RedditItem)
    assert item.reddit_fullname == "t3_abc123"
    assert item.subreddit == "test"
    assert item.permalink == "https://www.reddit.com/r/test/comments/abc123/title/"
    assert item.author_name == "someuser"
    assert item.title == "Test title"
    assert item.body == "Test body"
    assert item.score == 42
    assert item.comment_count == 10
    assert item.occurred_at == datetime(2024, 5, 15, 8, 0, 0, tzinfo=timezone.utc)
    assert item.metadata["score"] == 42


def test_parse_rate_limit_headers() -> None:
    headers = {
        "x-ratelimit-used": "10",
        "x-ratelimit-remaining": "90",
        "x-ratelimit-reset": "600",
    }
    result = RedditClient.parse_rate_limit_headers(headers)
    assert result["used"] == "10"
    assert result["remaining"] == "90"
    assert result["reset"] == "600"
