from app.services.tlachia.reddit_client import RedditItem
from app.services.tlachia.sanitization import SanitizationService


def test_sanitization_clips_long_text() -> None:
    svc = SanitizationService()
    long_text = "a" * 1000
    result = svc._clip(long_text, 800)
    assert result.endswith("…")
    assert len(result) == 801


def test_sanitization_normalizes_whitespace() -> None:
    svc = SanitizationService()
    assert svc._normalize_whitespace("  hello   world  ") == "hello world"


def test_sanitization_removes_handles() -> None:
    svc = SanitizationService()
    assert svc._remove_handles("hola u/someuser") == "hola [USUARIO]"
    assert svc._remove_handles("/u/another123") == "[USUARIO]"


def test_author_hash_does_not_expose_username() -> None:
    svc = SanitizationService()
    h1 = svc._hash_author("realusername")
    h2 = svc._hash_author("realusername")
    h3 = svc._hash_author("different")
    assert h1 == h2
    assert h1 != h3
    assert "realusername" not in h1


def test_deduplication_by_fingerprint() -> None:
    svc = SanitizationService()
    fp = svc._content_fingerprint("hello world")
    assert svc.is_duplicate(fp, "hello world")
    assert not svc.is_duplicate(fp, "different text")


def test_sanitize_reddit_item_structure() -> None:
    svc = SanitizationService()
    item = RedditItem(
        reddit_fullname="t3_abc",
        item_type="submission",
        subreddit="test",
        permalink="/r/test/comments/abc",
        author_name="user123",
        title="Title",
        body="Body text",
        score=10,
        comment_count=2,
        occurred_at=None,  # type: ignore[arg-type]
        metadata={"score": 10, "num_comments": 2, "over_18": False, "link_flair_text": None},
    )
    result = svc.sanitize_reddit_item(item)
    assert result["reddit_fullname"] == "t3_abc"
    assert result["author_hash"] != "user123"
    assert "sanitized_excerpt" in result
    assert result["metadata"]["content_fingerprint"] is not None
