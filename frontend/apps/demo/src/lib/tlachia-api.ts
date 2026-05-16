const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("yaocihuatl-token") : null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error desconocido" }));
    throw new Error(error.message || `Error HTTP ${response.status}`);
  }
  return response.json();
}

export interface TlachiaAlert {
  id: string;
  alert_code: string;
  protected_person_label: string;
  platform: string;
  risk_level: string;
  risk_score: number;
  suggested_status: string;
  motive: string;
  detected_at: string;
  review_status: string;
  created_at: string;
  signals?: TlachiaAlertSignal[];
  mentions?: TlachiaSanitizedMention[];
}

export interface TlachiaSource {
  id: string;
  name: string;
  platform: string | null;
  scenario: string | null;
  fixture_file: string | null;
  status: string;
  query_terms: string[];
  protected_labels: string[];
  last_ingested_at: string | null;
}

export interface TlachiaAlertSignal {
  id: string;
  signal_type: string;
  label: string;
  explanation: string;
  weight: number;
  created_at: string;
}

export interface TlachiaSanitizedMention {
  id: string;
  mention_code: string;
  platform: string;
  sanitized_excerpt: string;
  occurred_at: string;
  metadata: Record<string, unknown>;
}

export async function fetchAlerts(): Promise<TlachiaAlert[]> {
  return fetchJson<TlachiaAlert[]>("/api/v1/tlachia/alerts");
}

export async function fetchAlert(alertId: string): Promise<TlachiaAlert> {
  return fetchJson<TlachiaAlert>(`/api/v1/tlachia/alerts/${alertId}`);
}

export async function reviewAlert(alertId: string, notes?: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>(`/api/v1/tlachia/alerts/${alertId}/review`, {
    method: "POST",
    body: JSON.stringify({ review_notes: notes }),
  });
}

export async function dismissAlert(alertId: string, notes?: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>(`/api/v1/tlachia/alerts/${alertId}/dismiss`, {
    method: "POST",
    body: JSON.stringify({ review_notes: notes }),
  });
}

export async function escalateAlert(alertId: string, notes?: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>(`/api/v1/tlachia/alerts/${alertId}/escalate`, {
    method: "POST",
    body: JSON.stringify({ review_notes: notes }),
  });
}

export async function fetchSources(): Promise<TlachiaSource[]> {
  return fetchJson<TlachiaSource[]>("/api/v1/tlachia/sources");
}

export async function runSyntheticIngestion(platforms: string[] = []): Promise<Array<{ id: string; status: string }>> {
  return fetchJson<Array<{ id: string; status: string }>>("/api/v1/tlachia/ingest/synthetic", {
    method: "POST",
    body: JSON.stringify({ platforms, scenario: "campaign-burst-demo" }),
  });
}
