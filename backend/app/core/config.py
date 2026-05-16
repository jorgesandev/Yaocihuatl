from functools import lru_cache
import os
from pathlib import Path

from pydantic import BaseModel
from dotenv import load_dotenv


def _load_env_file() -> None:
    candidates = [
        Path.cwd() / ".env",
        Path.cwd().parent / ".env",
        Path(__file__).resolve().parents[2] / ".env",
        Path(__file__).resolve().parents[3] / ".env",
    ]
    for candidate in candidates:
        if candidate.exists():
            load_dotenv(candidate, override=False)
            return


_load_env_file()


class Settings(BaseModel):
    app_env: str = "development"
    frontend_url: str = "http://localhost:3000"
    frontend_urls: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    database_url: str = ""
    redis_url: str = ""
    jwt_secret: str = ""
    access_token_expire_minutes: int = 480
    run_migrations_on_start: bool = True
    seed_demo_data: bool = True
    demo_seed_version: str = "2026-05-initial"
    local_evidence_storage_path: str = "/app/storage/evidence"
    llm_provider: str = "deepseek"
    llm_model: str = "deepseek-chat"
    llm_base_url: str = "https://api.deepseek.com"
    deepseek_api_key: str = ""
    openrouter_api_key: str = ""
    openrouter_http_referer: str = "http://localhost:3000"
    openrouter_app_title: str = "Yaocihuatl Chimalli"
    chimalli_demo_mode: bool = True
    chimalli_rag_documents_path: str = "../rag_documents"
    chimalli_rag_index_path: str = ".local/chimalli_rag_index.jsonl"
    chimalli_attachment_storage_path: str = ".local/chimalli_attachments"
    chimalli_max_attachment_bytes: int = 10 * 1024 * 1024
    chimalli_max_attachments_per_chat: int = 5
    chimalli_max_extracted_text_chars: int = 8000
    extraction_llm_provider: str = "openrouter"
    extraction_llm_model: str = "qwen/qwen3-235b-a22b:free"
    vision_llm_enabled: bool = True
    vision_llm_provider: str = "openrouter"
    vision_llm_model: str = "nvidia/nemotron-nano-12b-v2-vl:free"

    tlachia_ingestion_enabled: bool = False
    tlachia_demo_mode: bool = True
    tlachia_synthetic_mode: bool = True
    tlachia_synthetic_fixtures_path: str = "datasets/synthetic/tlachia"
    tlachia_synthetic_platforms: str = "facebook,instagram,x,tiktok,reddit"
    tlachia_store_raw_platform_content: bool = False
    tlachia_retention_hours: int = 48
    tlachia_min_alert_score: int = 50


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_str(name: str, default: str) -> str:
    value = os.getenv(name)
    if value is None or not value.strip():
        return default
    return value.strip()


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None or not value.strip():
        return default
    return int(value.strip())


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        app_env=_env_str("APP_ENV", "development"),
        frontend_url=_env_str("FRONTEND_URL", "http://localhost:3000"),
        frontend_urls=_env_str("FRONTEND_URLS", "http://localhost:3000"),
        backend_url=_env_str("BACKEND_URL", "http://localhost:8000"),
        database_url=_env_str("DATABASE_URL", ""),
        redis_url=_env_str("REDIS_URL", ""),
        jwt_secret=_env_str("JWT_SECRET", ""),
        access_token_expire_minutes=_env_int("ACCESS_TOKEN_EXPIRE_MINUTES", 480),
        run_migrations_on_start=_env_bool("RUN_MIGRATIONS_ON_START", True),
        seed_demo_data=_env_bool("SEED_DEMO_DATA", True),
        demo_seed_version=_env_str("DEMO_SEED_VERSION", "2026-05-initial"),
        local_evidence_storage_path=_env_str("LOCAL_EVIDENCE_STORAGE_PATH", "/app/storage/evidence"),
        llm_provider=_env_str("LLM_PROVIDER", "deepseek"),
        llm_model=_env_str("LLM_MODEL", "deepseek-chat"),
        llm_base_url=_env_str("LLM_BASE_URL", "https://api.deepseek.com"),
        deepseek_api_key=_env_str("DEEPSEEK_API_KEY", ""),
        openrouter_api_key=_env_str("OPENROUTER_API_KEY", ""),
        openrouter_http_referer=_env_str("OPENROUTER_HTTP_REFERER", "http://localhost:3000"),
        openrouter_app_title=_env_str("OPENROUTER_APP_TITLE", "Yaocihuatl Chimalli"),
        chimalli_demo_mode=_env_bool("CHIMALLI_DEMO_MODE", True),
        chimalli_rag_documents_path=_env_str("CHIMALLI_RAG_DOCUMENTS_PATH", "../rag_documents"),
        chimalli_rag_index_path=_env_str("CHIMALLI_RAG_INDEX_PATH", ".local/chimalli_rag_index.jsonl"),
        chimalli_attachment_storage_path=_env_str("CHIMALLI_ATTACHMENT_STORAGE_PATH", ".local/chimalli_attachments"),
        chimalli_max_attachment_bytes=_env_int("CHIMALLI_MAX_ATTACHMENT_BYTES", 10 * 1024 * 1024),
        chimalli_max_attachments_per_chat=_env_int("CHIMALLI_MAX_ATTACHMENTS_PER_CHAT", 5),
        chimalli_max_extracted_text_chars=_env_int("CHIMALLI_MAX_EXTRACTED_TEXT_CHARS", 8000),
        extraction_llm_provider=_env_str("EXTRACTION_LLM_PROVIDER", "openrouter"),
        extraction_llm_model=_env_str("EXTRACTION_LLM_MODEL", "qwen/qwen3-235b-a22b:free"),
        vision_llm_enabled=_env_bool("VISION_LLM_ENABLED", True),
        vision_llm_provider=_env_str("VISION_LLM_PROVIDER", "openrouter"),
        vision_llm_model=_env_str("VISION_LLM_MODEL", "nvidia/nemotron-nano-12b-v2-vl:free"),
        tlachia_ingestion_enabled=_env_bool("TLACHIA_INGESTION_ENABLED", False),
        tlachia_demo_mode=_env_bool("TLACHIA_DEMO_MODE", True),
        tlachia_synthetic_mode=_env_bool("TLACHIA_SYNTHETIC_MODE", True),
        tlachia_synthetic_fixtures_path=_env_str("TLACHIA_SYNTHETIC_FIXTURES_PATH", "datasets/synthetic/tlachia"),
        tlachia_synthetic_platforms=_env_str("TLACHIA_SYNTHETIC_PLATFORMS", "facebook,instagram,x,tiktok,reddit"),
        tlachia_store_raw_platform_content=_env_bool("TLACHIA_STORE_RAW_PLATFORM_CONTENT", False),
        tlachia_retention_hours=_env_int("TLACHIA_RETENTION_HOURS", 48),
        tlachia_min_alert_score=_env_int("TLACHIA_MIN_ALERT_SCORE", 50),
    )
