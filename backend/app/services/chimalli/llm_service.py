from __future__ import annotations

import json
from typing import List
from urllib import error, request

from app.core.config import Settings, get_settings
from app.schemas.chimalli import LlmMessage, LlmResult


class LlmService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def complete(
        self,
        messages: List[LlmMessage],
        max_tokens: int = 700,
        *,
        provider: str | None = None,
        model: str | None = None,
    ) -> LlmResult:
        provider = (provider or self.settings.llm_provider).lower().strip()
        if provider not in {"deepseek", "openrouter"}:
            return self._demo_result("Proveedor LLM no configurado para este MVP.")

        api_key = self._api_key_for(provider)
        if not api_key:
            missing_key = "OPENROUTER_API_KEY" if provider == "openrouter" else "DEEPSEEK_API_KEY"
            return self._demo_result(f"Modo demo activo: falta {missing_key}.")

        model = model or self._model_for(provider)
        base_url = self._base_url_for(provider)

        payload = {
            "model": model,
            "messages": [message.model_dump() for message in messages],
            "max_tokens": max_tokens,
            "temperature": 0.2,
        }
        body = json.dumps(payload).encode("utf-8")
        headers = {
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json",
        }
        if provider == "openrouter":
            headers["HTTP-Referer"] = self.settings.openrouter_http_referer
            headers["X-Title"] = self.settings.openrouter_app_title

        api_request = request.Request(
            url=base_url.rstrip("/") + "/chat/completions",
            data=body,
            headers=headers,
            method="POST",
        )

        try:
            with request.urlopen(api_request, timeout=20) as response:
                data = json.loads(response.read().decode("utf-8"))
        except (error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            return self._demo_result("No se pudo consultar el proveedor LLM; se uso respuesta demo controlada.", str(exc))

        choices = data.get("choices", [])
        content = ""
        if choices:
            content = choices[0].get("message", {}).get("content", "")
        return LlmResult(
            content=content or "No se recibio contenido del proveedor LLM.",
            provider=provider,
            model=model,
            demo_mode=False,
            raw_metadata={"finish_reason": choices[0].get("finish_reason") if choices else None},
        )

    def _api_key_for(self, provider: str) -> str:
        if provider == "openrouter":
            return self.settings.openrouter_api_key
        return self.settings.deepseek_api_key

    def _base_url_for(self, provider: str) -> str:
        if provider == "openrouter" and self.settings.llm_base_url == "https://api.deepseek.com":
            return "https://openrouter.ai/api/v1"
        return self.settings.llm_base_url

    def _model_for(self, provider: str) -> str:
        if provider == "openrouter" and "/" not in self.settings.llm_model:
            return "deepseek/deepseek-chat"
        return self.settings.llm_model

    def _demo_result(self, content: str, error_detail: str | None = None) -> LlmResult:
        metadata = {"mode": "demo"}
        if error_detail:
            metadata["error"] = error_detail[:240]
        return LlmResult(
            content=content,
            provider=self.settings.llm_provider,
            model=self._model_for(self.settings.llm_provider.lower().strip()),
            demo_mode=True,
            raw_metadata=metadata,
        )
