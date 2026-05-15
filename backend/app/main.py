from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings


settings = get_settings()

app = FastAPI(
    title="Yaocihuatl API",
    version="0.1.0",
    description="API MVP modular para Yaocihuatl. Chimalli opera como asistencia preliminar con revision humana.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list({settings.frontend_url, "http://localhost:3001", "http://127.0.0.1:3001"}),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "yaocihuatl-backend"}
