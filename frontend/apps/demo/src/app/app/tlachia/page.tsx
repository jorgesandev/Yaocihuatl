"use client";

import Link from "next/link";
import { Download, Eye, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertExplainabilityPanel,
  AlertsLineChart,
  AppShell,
  PlatformBarChart,
  RiskBadge,
  RiskScoreCard,
  RoleGate,
  StateGallery
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

export default function TlachiaPage() {
  const [alerts, setAlerts] = useState<TlachiaAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <AppShell role="analyst">
      <RoleGate role="analyst">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="brand">Tlachia</Badge>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Panel Tlachia</h1>
              <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
                Monitoreo institucional y revision de patrones detectados. Las alertas son
                sugeridas y requieren revision humana.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline">
                Ultimos 7 dias
              </Button>
              <Button disabled={ingesting} type="button" variant="outline" onClick={handleSyntheticIngestion}>
                {ingesting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
                Ingerir demo sintetico
              </Button>
              <Button type="button" variant="secondary">
                <Download aria-hidden="true" className="h-4 w-4" />
                Exportar reporte
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RiskScoreCard
              context="Periodo demo actual"
              level="medium"
              title="Alertas nuevas"
              trend="+12% frente a periodo anterior"
              value={String(alerts.length)}
            />
            <RiskScoreCard
              context="Riesgo sugerido, no confirmado"
              level="high"
              title="Riesgo alto"
              trend="5 requieren lectura prioritaria"
              value={String(alerts.filter((a) => a.risk_level === "high").length)}
            />
            <RiskScoreCard
              context="Mesa institucional demo"
              level="unknown"
              title="Casos en revision"
              trend="Pendientes de decision humana"
              value={String(alerts.filter((a) => a.review_status === "pending_human_review").length)}
            />
            <RiskScoreCard
              context="Clusters detectados por similitud"
              level="medium"
              title="Patrones coordinados"
              trend="3 activos en observacion"
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
                <CardTitle>Clusters de riesgo</CardTitle>
                <CardDescription>
                  Agrupaciones demo para priorizar revision, no para identificar culpabilidad.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskClusters.map((cluster) => (
                    <div
                      className="rounded-md border border-border bg-neutral-50 p-4"
                      key={cluster.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-foreground">{cluster.id}</p>
                          <p className="text-sm text-neutral-600">{cluster.label}</p>
                        </div>
                        <Badge variant="warning">{cluster.status}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                        <span>Cuentas demo: {cluster.accounts}</span>
                        <span>Ventana: {cluster.window}</span>
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
                    Alertas asistivas conectadas al backend. Requieren revision humana.
                  </CardDescription>
                </div>
                <Button type="button" variant="outline">
                  <Search aria-hidden="true" className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center py-12 text-neutral-600">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cargando alertas...
                </div>
              )}

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
                  <p className="font-semibold">Error al cargar alertas</p>
                  <p className="text-sm">{error}</p>
                  <p className="mt-2 text-sm">
                    Verifica que el backend este activo y que los datos demo esten sembrados.
                  </p>
                </div>
              )}

              {!loading && !error && alerts.length === 0 && (
                <div className="py-12 text-center text-neutral-600">
                  <p className="font-semibold">Sin alertas</p>
                  <p className="text-sm">No hay alertas registradas en este momento.</p>
                </div>
              )}

              {!loading && !error && alerts.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-neutral-100 text-xs font-semibold text-neutral-700">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Persona protegida</th>
                        <th className="px-4 py-3">Plataforma</th>
                        <th className="px-4 py-3">Riesgo sugerido</th>
                        <th className="px-4 py-3">Motivo</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert) => (
                        <tr className="border-t border-border" key={alert.id}>
                          <td className="px-4 py-3 text-neutral-700">{formatDate(alert.detected_at)}</td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {alert.protected_person_label}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">{alert.platform}</td>
                          <td className="px-4 py-3">
                            <RiskBadge level={toRiskLevel(alert.risk_level)} />
                          </td>
                          <td className="px-4 py-3 text-neutral-700">{alert.motive.slice(0, 80)}</td>
                          <td className="px-4 py-3">
                            <Badge variant="warning">{alert.review_status}</Badge>
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
                                  <Button size="sm" variant="outline" onClick={() => handleReview(alert.id)}>
                                    Revisar
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleDismiss(alert.id)}>
                                    Descartar
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleEscalate(alert.id)}>
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

          <StateGallery />
        </div>
      </RoleGate>
    </AppShell>
  );
}
