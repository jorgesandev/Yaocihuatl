from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.chimalli import router as chimalli_router
from app.api.v1.machiyotl import router as machiyotl_router
from app.api.v1.tlachia import router as tlachia_router
from app.api.v1.users import router as users_router


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(tlachia_router)
api_router.include_router(chimalli_router)
api_router.include_router(machiyotl_router)
