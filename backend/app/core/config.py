from functools import lru_cache
import os

from pydantic import BaseModel


class Settings(BaseModel):
    app_env: str = "development"
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    llm_provider: str = "deepseek"
    llm_model: str = "deepseek-chat"
    llm_base_url: str = "https://api.deepseek.com"
    deepseek_api_key: str = ""
    openrouter_api_key: str = ""
    openrouter_http_referer: str = "http://localhost:3001"
    openrouter_app_title: str = "Yaocihuatl Chimalli"
    chimalli_demo_mode: bool = True
    chimalli_rag_documents_path: str = "../rag_documents"
    chimalli_rag_index_path: str = ".local/chimalli_rag_index.jsonl"


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


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        app_env=_env_str("APP_ENV", "development"),
        frontend_url=_env_str("FRONTEND_URL", "http://localhost:3001"),
        backend_url=_env_str("BACKEND_URL", "http://localhost:8000"),
        llm_provider=_env_str("LLM_PROVIDER", "deepseek"),
        llm_model=_env_str("LLM_MODEL", "deepseek-chat"),
        llm_base_url=_env_str("LLM_BASE_URL", "https://api.deepseek.com"),
        deepseek_api_key=_env_str("DEEPSEEK_API_KEY", ""),
        openrouter_api_key=_env_str("OPENROUTER_API_KEY", ""),
        openrouter_http_referer=_env_str("OPENROUTER_HTTP_REFERER", "http://localhost:3001"),
        openrouter_app_title=_env_str("OPENROUTER_APP_TITLE", "Yaocihuatl Chimalli"),
        chimalli_demo_mode=_env_bool("CHIMALLI_DEMO_MODE", True),
        chimalli_rag_documents_path=_env_str("CHIMALLI_RAG_DOCUMENTS_PATH", "../rag_documents"),
        chimalli_rag_index_path=_env_str("CHIMALLI_RAG_INDEX_PATH", ".local/chimalli_rag_index.jsonl"),
    )
