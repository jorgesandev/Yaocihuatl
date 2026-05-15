from fastapi import APIRouter, HTTPException, status

from app.schemas.chimalli import (
    ChatRequest,
    ChatResponse,
    ChimalliCase,
    ChimalliCaseInput,
    ExpedienteHtml,
    ExpedienteRequest,
    ExtractRequest,
    ExtractResponse,
    JurisdictionRequest,
    JurisdictionSuggestion,
    LlmMessage,
    RagIndexRequest,
    RagIndexResponse,
    RagSearchRequest,
    RagSearchResponse,
    VpmrgTestRequest,
    VpmrgTestResult,
)
from app.services.chimalli.case_service import CaseNotFoundError, ChimalliCaseService, HUMAN_REVIEW_NOTICE
from app.services.chimalli.llm_service import LlmService
from app.services.chimalli.prompts import CHIMALLI_SYSTEM_PROMPT
from app.services.chimalli.rag_service import RagService


router = APIRouter(prefix="/chimalli", tags=["chimalli"])
rag_service = RagService()
case_service = ChimalliCaseService(rag_service=rag_service)
llm_service = LlmService()
NON_AUTOMATED_NOTICE = "Chimalli no presenta denuncias automáticamente."


def _append_required_notices(content: str) -> str:
    reply = content.strip()
    reply_lower = reply.lower()
    notices = [reply]
    if (
        "denuncias automáticamente" not in reply_lower
        and "denuncias automaticamente" not in reply_lower
    ):
        notices.append(NON_AUTOMATED_NOTICE)
    if HUMAN_REVIEW_NOTICE not in reply:
        notices.append(HUMAN_REVIEW_NOTICE)
    return "\n\n".join(notice for notice in notices if notice)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    case = case_service.create_case(ChimalliCaseInput(narrative=request.message, integration=request.integration))
    source_context = "\n".join(
        f"- {source.source_file}, pagina {source.page}: {source.excerpt[:700]}"
        for source in case.rag_sources[:3]
    ) or "No se recuperaron fuentes RAG. No inventes citas."
    llm_result = llm_service.complete(
        messages=[
            LlmMessage(role="system", content=CHIMALLI_SYSTEM_PROMPT),
            LlmMessage(
                role="user",
                content=(
                    "Redacta una respuesta breve, concreta y en español para la persona usuaria. "
                    "No uses placeholders, corchetes ni frases como 'describe brevemente'. "
                    "No digas que presentarás una denuncia. No declares culpabilidad. "
                    "Incluye: resultado preliminar, tres elementos del test, autoridad sugerida, fuentes consultadas y revisión humana.\n\n"
                    f"Resultado preliminar: {case.vpmrg_test.overall_result}.\n"
                    f"Autoridad sugerida: {case.jurisdiction.suggested_authority}.\n"
                    f"Via sugerida: {case.jurisdiction.procedure}.\n"
                    f"Elemento 1: {case.vpmrg_test.political_electoral_link.reason}\n"
                    f"Elemento 2: {case.vpmrg_test.gender_element.reason}\n"
                    f"Elemento 3: {case.vpmrg_test.political_rights_impact.reason}\n"
                    f"Fuentes recuperadas:\n{source_context}"
                ),
            ),
        ]
    )
    reply = (
        "He organizado tu narrativa en un borrador preliminar. "
        "El test asistivo identifica posible VPMRG y sugiere revisar la ruta IEEBC / UTCE. "
        f"{NON_AUTOMATED_NOTICE} "
        f"{HUMAN_REVIEW_NOTICE}"
    )
    if not llm_result.demo_mode and llm_result.content and "[" not in llm_result.content:
        reply = _append_required_notices(llm_result.content)
    return ChatResponse(
        case=case,
        reply=reply,
        quick_replies=[
            "Agregar evidencia",
            "No se que autoridad corresponde",
            "Quiero revisar antes de enviar",
            "Generar resumen para revision",
        ],
    )


@router.post("/extract", response_model=ExtractResponse)
def extract(request: ExtractRequest) -> ExtractResponse:
    return case_service.extract(request.narrative)


@router.post("/vpmrg-test", response_model=VpmrgTestResult)
def vpmrg_test(request: VpmrgTestRequest) -> VpmrgTestResult:
    return case_service.evaluate_vpmrg(request.narrative, request.victim)


@router.post("/jurisdiction", response_model=JurisdictionSuggestion)
def jurisdiction(request: JurisdictionRequest) -> JurisdictionSuggestion:
    return case_service.suggest_jurisdiction(request.narrative, request.victim)


@router.post("/expediente", response_model=ExpedienteHtml)
def expediente(request: ExpedienteRequest) -> ExpedienteHtml:
    try:
        return case_service.generate_expediente_html(request.case_id)
    except CaseNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/cases/{case_id}", response_model=ChimalliCase)
def get_case(case_id: str) -> ChimalliCase:
    try:
        return case_service.get_case(case_id)
    except CaseNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/rag/index", response_model=RagIndexResponse)
def index_rag(request: RagIndexRequest) -> RagIndexResponse:
    return rag_service.index_documents(request.documents_path)


@router.post("/rag/search", response_model=RagSearchResponse)
def search_rag(request: RagSearchRequest) -> RagSearchResponse:
    return rag_service.search(
        query=request.query,
        intent=request.intent,
        collections=request.collections,
        limit=request.limit,
    )
