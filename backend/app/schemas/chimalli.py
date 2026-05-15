from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


Confidence = Literal["low", "medium", "high"]
OverallResult = Literal["possible_vpmrg", "insufficient_information", "not_indicated"]
DocumentType = Literal[
    "ley",
    "reglamento",
    "guia",
    "protocolo",
    "criterio",
    "glosario",
    "estadistica",
    "demo",
]
Priority = Literal["high", "medium", "low"]
CaseStatus = Literal["draft", "in_review", "closed"]


class MockIntegrationInput(BaseModel):
    tlachia_alert_id: str = "mock-alert-001"
    source_platform: str = "X"
    risk_level: str = "high"
    machiyotl_evidence_hashes: List[str] = Field(default_factory=lambda: ["sha256:mocked-evidence-hash"])
    evidence_status: str = "sealed_mock"


class EvidenceReference(BaseModel):
    evidence_id: Optional[str] = None
    source_platform: Optional[str] = None
    evidence_hash: Optional[str] = None
    status: str = "unverified_reference"


class VictimProfile(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    position: Optional[str] = None
    jurisdiction: Optional[str] = None
    state: Optional[str] = None
    municipality: Optional[str] = None


class CaseFacts(BaseModel):
    platform: Optional[str] = None
    dates: List[str] = Field(default_factory=list)
    aggressors: List[str] = Field(default_factory=list)
    narrative: str = ""
    evidence: List[EvidenceReference] = Field(default_factory=list)


class TestElementResult(BaseModel):
    meets: bool
    reason: str


class VpmrgTestResult(BaseModel):
    political_electoral_link: TestElementResult
    gender_element: TestElementResult
    political_rights_impact: TestElementResult
    overall_result: OverallResult
    confidence: Confidence


class JurisdictionSuggestion(BaseModel):
    suggested_authority: str
    procedure: str
    alternative_routes: List[str] = Field(default_factory=list)
    reason: str = "Sugerencia preliminar para validación de autoridad competente."


class RagSource(BaseModel):
    source_file: str
    collection: str
    document_type: DocumentType = "demo"
    jurisdiction: str = "Mexico"
    institution: str = "No validado"
    priority: Priority = "low"
    page: int = 1
    use_for: List[str] = Field(default_factory=list)
    excerpt: str = ""
    score: float = 0.0


class ChimalliCaseInput(BaseModel):
    narrative: str = Field(..., min_length=1, max_length=12000)
    victim: Optional[VictimProfile] = None
    integration: Optional[MockIntegrationInput] = None


class ChimalliCase(BaseModel):
    case_id: str
    victim: VictimProfile
    facts: CaseFacts
    vpmrg_test: VpmrgTestResult
    jurisdiction: JurisdictionSuggestion
    rag_sources: List[RagSource] = Field(default_factory=list)
    integration: Optional[MockIntegrationInput] = None
    status: CaseStatus = "draft"
    created_at: datetime
    human_review_notice: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=12000)
    case_id: Optional[str] = None
    integration: Optional[MockIntegrationInput] = None


class ChatResponse(BaseModel):
    case: ChimalliCase
    reply: str
    quick_replies: List[str]


class ExtractRequest(BaseModel):
    narrative: str = Field(..., min_length=1, max_length=12000)


class ExtractResponse(BaseModel):
    victim: VictimProfile
    facts: CaseFacts
    warning: str


class VpmrgTestRequest(BaseModel):
    narrative: str = Field(..., min_length=1, max_length=12000)
    victim: Optional[VictimProfile] = None


class JurisdictionRequest(BaseModel):
    narrative: str = Field(..., min_length=1, max_length=12000)
    victim: Optional[VictimProfile] = None


class RagIndexRequest(BaseModel):
    documents_path: Optional[str] = None


class RagIndexResponse(BaseModel):
    indexed_chunks: int
    skipped_files: List[str]
    index_path: str
    warning: str


class RagSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000)
    intent: str = "tipificacion"
    collections: Optional[List[str]] = None
    limit: int = Field(default=5, ge=1, le=20)


class RagSearchResponse(BaseModel):
    sources: List[RagSource]
    warning: str


class ExpedienteRequest(BaseModel):
    case_id: str


class ExpedienteHtml(BaseModel):
    case_id: str
    html: str
    warnings: List[str]


class LlmMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class LlmResult(BaseModel):
    content: str
    provider: str
    model: str
    demo_mode: bool
    raw_metadata: Dict[str, Any] = Field(default_factory=dict)
