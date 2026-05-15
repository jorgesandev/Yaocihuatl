from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings


settings = get_settings()
frontend_origins = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
}
if settings.frontend_url:
    frontend_origins.add(settings.frontend_url.strip())
if settings.frontend_urls:
    frontend_origins.update(
        origin.strip() for origin in settings.frontend_urls.split(",") if origin.strip()
    )

app = FastAPI(
    title="Yaocihuatl API",
    version="0.1.0",
    description="API MVP modular para Yaocihuatl. Chimalli opera como asistencia preliminar con revision humana.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(frontend_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "yaocihuatl-backend"}
