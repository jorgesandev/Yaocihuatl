export type ChimalliCase = {
  case_id: string;
  victim: {
    name: string | null;
    role: string | null;
    position: string | null;
    jurisdiction: string | null;
    state: string | null;
    municipality: string | null;
  };
  facts: {
    platform: string | null;
    dates: string[];
    aggressors: string[];
    narrative: string;
    evidence: Array<{ evidence_hash: string | null; status: string }>;
  };
  vpmrg_test: {
    political_electoral_link: { meets: boolean; reason: string };
    gender_element: { meets: boolean; reason: string };
    political_rights_impact: { meets: boolean; reason: string };
    overall_result: string;
    confidence: string;
  };
  jurisdiction: {
    suggested_authority: string;
    procedure: string;
    alternative_routes: string[];
    reason: string;
  };
  rag_sources: Array<{
    source_file: string;
    collection: string;
    document_type: string;
    jurisdiction: string;
    institution: string;
    page: number;
    excerpt: string;
    score: number;
  }>;
  status: string;
  human_review_notice: string;
};

export type ChatResponse = {
  case: ChimalliCase;
  reply: string;
  quick_replies: string[];
};

export type ExpedienteResponse = {
  case_id: string;
  html: string;
  warnings: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function sendChimalliMessage(message: string): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/api/v1/chimalli/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      integration: {
        tlachia_alert_id: "mock-alert-001",
        source_platform: "X",
        risk_level: "high",
        machiyotl_evidence_hashes: ["sha256:mocked-evidence-hash"],
        evidence_status: "sealed_mock",
      },
    }),
  });
  if (!response.ok) {
    throw new Error("No se pudo solicitar orientación. Tu información sigue en esta pantalla.");
  }
  return response.json() as Promise<ChatResponse>;
}

export async function generateExpediente(caseId: string): Promise<ExpedienteResponse> {
  const response = await fetch(`${API_URL}/api/v1/chimalli/expediente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ case_id: caseId }),
  });
  if (!response.ok) {
    throw new Error("No se pudo generar el resumen. Puedes intentar de nuevo.");
  }
  return response.json() as Promise<ExpedienteResponse>;
}
