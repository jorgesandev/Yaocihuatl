from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db.models import MachiyotlEvidenceItem, MachiyotlHashVerification
from app.schemas.machiyotl import HashVerifyResponse


DISCLAIMER = (
    "Verificación criptográfica de datos sintéticos. "
    "No constituye validez legal ni reemplaza la ratificación "
    "de autoridad competente."
)


def _normalize_hash(raw: str) -> str:
    return raw.removeprefix("sha256:").strip()


def verify_hash(db: Session, submitted_hash: str) -> HashVerifyResponse:
    normalized = _normalize_hash(submitted_hash)

    item = db.scalar(
        select(MachiyotlEvidenceItem).where(
            or_(
                MachiyotlEvidenceItem.sha256_hash == normalized,
                MachiyotlEvidenceItem.short_hash == normalized,
            )
        )
    )

    if item:
        verification = MachiyotlHashVerification(
            evidence_id=item.id,
            submitted_hash=submitted_hash,
            result="match",
        )
        db.add(verification)
        db.commit()
        return HashVerifyResponse(
            result="match",
            evidence_id=item.id,
            sealed_at=item.sealed_at,
            short_hash=item.short_hash,
            warning=DISCLAIMER,
        )

    verification = MachiyotlHashVerification(
        submitted_hash=submitted_hash,
        result="evidence_not_found",
    )
    db.add(verification)
    db.commit()
    return HashVerifyResponse(result="evidence_not_found", warning=DISCLAIMER)
