from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

SHA256_HEX_LENGTH = 64
SHA256_MAX_LENGTH = 128
SHORT_HASH_MAX_LENGTH = 24


def _hash_format_valid(value: str) -> bool:
    cleaned = value.removeprefix("sha256:")
    try:
        int(cleaned, 16)
    except (ValueError, TypeError):
        return False
    return True


class HashVerifyRequest(BaseModel):
    submitted_hash: str = Field(
        ..., max_length=SHA256_MAX_LENGTH, description="SHA-256 hash en hexadecimal"
    )
    evidence_id: Optional[UUID] = Field(
        None, description="ID de evidencia (opcional, para trazabilidad)"
    )

    @field_validator("submitted_hash")
    @classmethod
    def hash_must_be_hex(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("submitted_hash no puede estar vacío")
        if not _hash_format_valid(value):
            raise ValueError(
                "submitted_hash debe ser una cadena hexadecimal válida (opcionalmente con prefijo 'sha256:')"
            )
        return value.strip()


class HashVerifyResponse(BaseModel):
    result: Literal["match", "mismatch", "evidence_not_found"] = Field(
        ..., description="Resultado de la verificación criptográfica"
    )
    evidence_id: Optional[UUID] = Field(None, description="ID de evidencia asociada")
    sealed_at: Optional[datetime] = Field(
        None, description="Timestamp UTC del sellado local"
    )
    short_hash: Optional[str] = Field(
        None,
        max_length=SHORT_HASH_MAX_LENGTH,
        description="Prefijo corto del hash verificado",
    )
    warning: str = Field(
        default=(
            "Verificación criptográfica de datos sintéticos. "
            "No constituye validez legal ni reemplaza la ratificación "
            "de autoridad competente."
        ),
        description="Disclaimer legal obligatorio",
    )


class MachiyotlErrorResponse(BaseModel):
    code: str = Field(..., description="Código de error")
    message: str = Field(..., description="Mensaje descriptivo del error")
