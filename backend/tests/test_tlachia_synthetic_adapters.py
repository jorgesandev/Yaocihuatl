from pathlib import Path

from app.services.tlachia.synthetic_adapters import ADAPTERS


def test_synthetic_adapters_load_all_fixture_files() -> None:
    fixtures = Path(__file__).resolve().parents[2] / "datasets/synthetic/tlachia"
    for platform, adapter in ADAPTERS.items():
        mentions = adapter.fetch_mentions(fixtures / adapter.default_fixture)
        assert mentions
        assert all(mention.platform == platform for mention in mentions)
        assert all(mention.metadata["synthetic"] is True for mention in mentions)
