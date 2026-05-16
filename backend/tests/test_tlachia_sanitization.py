from datetime import datetime, timezone

from app.services.tlachia.sanitization import SanitizationService
from app.services.tlachia.synthetic_adapters import SyntheticPlatformMention


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
    h1 = svc._hash_author("demo-user")
    h2 = svc._hash_author("demo-user")
    h3 = svc._hash_author("different")
    assert h1 == h2
    assert h1 != h3
    assert "demo-user" not in h1


def test_deduplication_by_fingerprint() -> None:
    svc = SanitizationService()
    fp = svc._content_fingerprint("hello world")
    assert svc.is_duplicate(fp, "hello world")
    assert not svc.is_duplicate(fp, "different text")


def test_sanitize_platform_mention_structure() -> None:
    svc = SanitizationService()
    item = SyntheticPlatformMention(
        synthetic_id="x_demo",
        platform="x",
        source_kind="post",
        source_url="https://example.invalid/x/1",
        author_label="Cuenta demo",
        author_synthetic_id="acct_demo",
        occurred_at=datetime.now(timezone.utc),
        text="Candidata demo quedate en casa",
        language="es",
        engagement={"likes": 1},
        metadata={"score": 10},
    )
    result = svc.sanitize_platform_mention(item)
    assert result["synthetic_id"] == "x_demo"
    assert result["platform"] == "x"
    assert result["author_hash"] != "acct_demo"
    assert "sanitized_excerpt" in result
    assert result["metadata"]["content_fingerprint"] is not None
