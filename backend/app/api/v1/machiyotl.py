from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.machiyotl import (
    HashVerifyResponse,
    MachiyotlErrorResponse,
    SHA256_MAX_LENGTH,
    _hash_format_valid,
)
from app.services.machiyotl.verify_service import verify_hash


router = APIRouter(prefix="/machiyotl", tags=["machiyotl"])


@router.get(
    "/verify/{hash}",
    response_model=HashVerifyResponse,
    status_code=status.HTTP_200_OK,
    responses={400: {"model": MachiyotlErrorResponse}},
    summary="Verificar hash de evidencia",
    description="Verifica públicamente si un hash SHA-256 de evidencia existe en el sistema. No requiere autenticación.",
)
def verify_evidence_hash(
    hash: str,
    db: Session = Depends(get_db),
) -> HashVerifyResponse:
    if len(hash) > SHA256_MAX_LENGTH or not _hash_format_valid(hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "invalid_hash",
                "message": "El hash proporcionado no tiene un formato hexadecimal válido.",
            },
        )
    return verify_hash(db, hash)
