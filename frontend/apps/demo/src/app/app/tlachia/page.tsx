"use client";

import Link from "next/link";
import { Download, Eye, Loader2, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertExplainabilityPanel,
  AlertsLineChart,
  AppShell,
  PlatformBarChart,
  RiskBadge,
  RiskScoreCard,
  RoleGate
} from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  dismissAlert,
  ensureDemoAnalystSession,
  escalateAlert,
  fetchAlerts,
  reviewAlert,
  runSyntheticIngestion,
  type TlachiaAlert
} from "@/lib/tlachia-api";
import { explainabilitySignals, riskClusters } from "@/lib/mock-data";
import type { RiskLevel } from "@/lib/types";

function toRiskLevel(level: string): RiskLevel {
  if (level === "unclassified") return "unknown";
  if (level === "low" || level === "medium" || level === "high") return level;
  return "unknown";
}

const statusFilters = [
  { value: "all", label: "Todas" },
  { value: "pending_human_review", label: "Pendientes" },
  { value: "high", label: "Alto riesgo" },
  { value: "reviewed", label: "Revisadas" },
  { value: "dismissed", label: "Descartadas" }
];

function reviewStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending_human_review: "Pendiente de revisión",
    reviewed: "Revisada",
    dismissed: "Descartada",
    escalated: "Escalada"
  };
  return map[status] ?? status;
}

export default function TlachiaPage() {
  const [alerts, setAlerts] = useState<TlachiaAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    ensureDemoAnalystSession()
      .then(fetchAlerts)
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        setLoading(false);
      });
  }, []);

  const handleReview = async (alertId: string) => {
    try {
      await reviewAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, review_status: "reviewed" } : a))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, review_status: "dismissed" } : a))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    }
  };

  const handleEscalate = async (alertId: string) => {
    try {
      await escalateAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, review_status: "escalated" } : a))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    }
  };

  const reloadAlerts = async () => {
    await ensureDemoAnalystSession();
    const data = await fetchAlerts();
    setAlerts(data);
  };

  const handleSyntheticIngestion = async () => {
    setIngesting(true);
    setError(null);
    try {
      await runSyntheticIngestion(["facebook", "instagram", "x", "tiktok", "reddit"]);
      await reloadAlerts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    } finally {
      setIngesting(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return iso;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "high" ? alert.risk_level === "high" : alert.review_status === activeFilter);
    const matchesSearch =
      !searchQuery ||
      alert.protected_person_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.motive.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell role="analyst">
      <RoleGate role="analyst">
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="brand">Tlachia</Badge>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Panel de monitoreo</h1>
              <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
                Monitoreo institucional y detección de patrones de riesgo. Las alertas son
                preventivas y requieren validación humana.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline">
                Últimos 7 días
              </Button>
              <Button
                disabled={ingesting}
                type="button"
                variant="outline"
                onClick={handleSyntheticIngestion}
              >
                {ingesting ? (
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                )}
                Sincronizar fuentes
              </Button>
              <Button type="button" variant="secondary">
                <Download aria-hidden="true" className="h-4 w-4" />
                Exportar reporte
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RiskScoreCard
              context="Histórico 7 días"
              level="medium"
              title="Alertas nuevas"
              trend="+12% frente a periodo anterior"
              value={String(alerts.length)}
            />
            <RiskScoreCard
              context="Prioridad de atención"
              level="high"
              title="Riesgo alto"
              trend="5 requieren lectura prioritaria"
              value={String(alerts.filter((a) => a.risk_level === "high").length)}
            />
            <RiskScoreCard
              context="Mesa de Análisis (IEEBC)"
              level="unknown"
              title="En revisión"
              trend="Pendientes de validación técnica"
              value={String(alerts.filter((a) => a.review_status === "pending_human_review").length)}
            />
            <RiskScoreCard
              context="Análisis de grafos de similitud"
              level="medium"
              title="Patrones coordinados"
              trend="3 activos en observación"
              value="6"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AlertsLineChart />
            <PlatformBarChart />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Patrones de riesgo detectados</CardTitle>
                <CardDescription>
                  Agrupaciones algorítmicas. La calificación jurídica corresponde a la autoridad.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskClusters.map((cluster) => (
                    <div
                      className="rounded-lg border border-border bg-neutral-50 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
                      key={cluster.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-foreground">{cluster.id}</p>
                          <p className="text-sm text-neutral-600">{cluster.label}</p>
                        </div>
                        <Badge variant="warning">{cluster.status}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                        <span>Nodos activos: <strong>{cluster.accounts}</strong></span>
                        <span>Ventana temporal: <strong>{cluster.window}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <AlertExplainabilityPanel signals={explainabilitySignals} />
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Alertas recientes</CardTitle>
                  <CardDescription>
                    Patrones extraídos de fuentes abiertas. Sujetas a validación humana.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros + búsqueda */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {statusFilters.map((filter) => (
                    <button
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        activeFilter === filter.value
                          ? "border-brand-300 bg-brand-100 text-brand-700"
                          : "border-border bg-surface-card text-neutral-600 hover:border-brand-200 hover:bg-brand-50"
                      }`}
                      key={filter.value}
                      onClick={() => setActiveFilter(filter.value)}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3 py-2">
                  <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-500" />
                  <input
                    aria-label="Buscar alertas"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-neutral-500 focus:outline-none"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por persona, plataforma, motivo..."
                    type="search"
                    value={searchQuery}
                  />
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-12 text-neutral-600">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cargando alertas...
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-danger-100 bg-danger-100 p-4 text-danger-700">
                  <p className="font-semibold">No se pudieron cargar las alertas</p>
                  <p className="mt-1 text-sm">{error}</p>
                  <p className="mt-2 text-sm">
                    Verifica la conexión con el nodo central de procesamiento institucional.
                  </p>
                </div>
              )}

              {!loading && !error && filteredAlerts.length === 0 && (
                <div className="py-12 text-center text-neutral-600">
                  <p className="font-semibold">Sin alertas</p>
                  <p className="mt-1 text-sm">No hay alertas que coincidan con los filtros aplicados.</p>
                </div>
              )}

              {!loading && !error && filteredAlerts.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Persona protegida</th>
                        <th className="px-4 py-3">Plataforma</th>
                        <th className="px-4 py-3">Riesgo sugerido</th>
                        <th className="px-4 py-3 max-w-[240px]">Motivo</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAlerts.map((alert, idx) => (
                        <tr
                          className={`border-t border-border transition-colors hover:bg-neutral-50 ${idx % 2 === 0 ? "" : "bg-neutral-50/40"}`}
                          key={alert.id}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-700">
                            {formatDate(alert.detected_at)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {alert.protected_person_label}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">{alert.platform}</td>
                          <td className="px-4 py-3">
                            <RiskBadge level={toRiskLevel(alert.risk_level)} />
                          </td>
                          <td className="max-w-[240px] px-4 py-3 text-neutral-700">
                            <span className="line-clamp-2">{alert.motive}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={
                              alert.review_status === "reviewed" ? "success"
                              : alert.review_status === "dismissed" ? "neutral"
                              : alert.review_status === "escalated" ? "brand"
                              : "warning"
                            }>
                              {reviewStatusLabel(alert.review_status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              <Button asChild size="sm" variant="secondary">
                                <Link href={`/app/tlachia/alerts/${alert.id}`}>
                                  <Eye aria-hidden="true" className="h-4 w-4" />
                                  Ver
                                </Link>
                              </Button>
                              {alert.review_status === "pending_human_review" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReview(alert.id)}
                                  >
                                    Revisar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDismiss(alert.id)}
                                  >
                                    Descartar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEscalate(alert.id)}
                                  >
                                    Escalar
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </RoleGate>
    </AppShell>
  );
}
