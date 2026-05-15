from fastapi import APIRouter

from app.api.v1.chimalli import router as chimalli_router


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(chimalli_router)
