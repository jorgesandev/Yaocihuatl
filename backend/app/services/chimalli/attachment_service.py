from __future__ import annotations

from hashlib import sha256
from pathlib import Path
import re
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import Settings, get_settings
from app.schemas.chimalli import AttachmentReference
from app.services.chimalli.chunking import normalize_text
from app.services.chimalli.vision_service import VisionService


ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "text/plain": ".txt",
    "text/markdown": ".md",
}
ALLOWED_EXTENSIONS = {
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".webp": "image/webp",
}


class AttachmentValidationError(ValueError):
    pass


class AttachmentNotFoundError(ValueError):
    pass


class AttachmentService:
    def __init__(self, settings: Settings | None = None, vision_service: VisionService | None = None) -> None:
        self.settings = settings or get_settings()
        self.vision_service = vision_service or VisionService(self.settings)
        self._attachments: dict[str, AttachmentReference] = {}
        self._paths: dict[str, Path] = {}

    async def upload(self, upload_file: UploadFile) -> AttachmentReference:
        mime_type = upload_file.content_type or "application/octet-stream"
        safe_name = self._safe_file_name(upload_file.filename or "attachment")
        suffix = Path(safe_name).suffix.lower()
        self._validate_type(mime_type, suffix)

        content = await upload_file.read()
        if not content:
            raise AttachmentValidationError("El archivo esta vacio.")
        if len(content) > self.settings.chimalli_max_attachment_bytes:
            raise AttachmentValidationError("El archivo excede el tamano maximo permitido.")

        attachment_id = "att_" + uuid4().hex[:16]
        directory = Path(self.settings.chimalli_attachment_storage_path).resolve() / attachment_id
        directory.mkdir(parents=True, exist_ok=True)
        file_path = directory / safe_name
        file_path.write_bytes(content)

        digest = "sha256:" + sha256(content).hexdigest()
        attachment = AttachmentReference(
            attachment_id=attachment_id,
            file_name=safe_name,
            mime_type=mime_type,
            size_bytes=len(content),
            sha256=digest,
            status="uploaded_unverified",
        )
        attachment = self._enrich_attachment(attachment, file_path)
        self._attachments[attachment_id] = attachment
        self._paths[attachment_id] = file_path
        return attachment

    def get_many(self, attachment_ids: list[str]) -> list[AttachmentReference]:
        if len(attachment_ids) > self.settings.chimalli_max_attachments_per_chat:
            raise AttachmentValidationError("Se excedio el numero maximo de adjuntos por mensaje.")
        attachments: list[AttachmentReference] = []
        for attachment_id in attachment_ids:
            attachment = self._attachments.get(attachment_id)
            if attachment is None:
                raise AttachmentNotFoundError("No existe uno de los adjuntos solicitados.")
            attachments.append(attachment)
        return attachments

    def _validate_type(self, mime_type: str, suffix: str) -> None:
        if mime_type not in ALLOWED_MIME_TYPES:
            raise AttachmentValidationError("Tipo de archivo no permitido.")
        expected_mime = ALLOWED_EXTENSIONS.get(suffix)
        if expected_mime != mime_type:
            raise AttachmentValidationError("La extension del archivo no coincide con su tipo.")

    def _safe_file_name(self, file_name: str) -> str:
        base_name = Path(file_name).name.strip() or "attachment"
        safe = re.sub(r"[^A-Za-z0-9._-]", "-", base_name)
        return safe[:120] or "attachment"

    def _enrich_attachment(self, attachment: AttachmentReference, file_path: Path) -> AttachmentReference:
        if attachment.mime_type == "text/plain":
            text = normalize_text(file_path.read_text(encoding="utf-8", errors="ignore"))
            attachment.extracted_text = text[: self.settings.chimalli_max_extracted_text_chars]
            attachment.status = "text_extracted" if attachment.extracted_text else "metadata_only"
            return attachment
        if attachment.mime_type == "text/markdown":
            text = normalize_text(file_path.read_text(encoding="utf-8", errors="ignore"))
            attachment.extracted_text = text[: self.settings.chimalli_max_extracted_text_chars]
            attachment.status = "text_extracted" if attachment.extracted_text else "metadata_only"
            return attachment
        if attachment.mime_type == "application/pdf":
            attachment.extracted_text = self._extract_pdf_text(file_path)
            attachment.status = "text_extracted" if attachment.extracted_text else "metadata_only"
            if not attachment.extracted_text:
                attachment.warning = (
                    "No se pudo extraer texto del PDF; posible documento escaneado o imagen dentro del PDF. "
                    "Se conservan metadatos y hash. Requiere revision humana u OCR futuro."
                )
            return attachment
        if attachment.mime_type.startswith("image/"):
            visual_analysis = self.vision_service.analyze_image(file_path, attachment.mime_type)
            if visual_analysis:
                attachment.visual_analysis = visual_analysis
                attachment.visual_summary = visual_analysis.summary_for_case
                attachment.status = "image_analyzed"
            else:
                attachment.status = "metadata_only"
                reason = self.vision_service.last_error or "El proveedor de vision no devolvio analisis util."
                attachment.warning = (
                    "Imagen adjunta sin analisis visual disponible; requiere revision humana. "
                    f"Detalle tecnico: {reason}"
                )
            return attachment
        return attachment

    def _extract_pdf_text(self, file_path: Path) -> str | None:
        try:
            from pypdf import PdfReader

            reader = PdfReader(str(file_path))
            pages = [normalize_text(page.extract_text() or "") for page in reader.pages]
            text = "\n".join(page for page in pages if page).strip()
            return text[: self.settings.chimalli_max_extracted_text_chars] or None
        except Exception:
            return None
