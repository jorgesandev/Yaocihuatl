"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileLock2, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertExplainabilityPanel,
  AppShell,
  ClusterNetworkMock,
  RiskBadge,
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
  fetchAlert,
  reviewAlert,
  type TlachiaAlert
} from "@/lib/tlachia-api";
import type { RiskLevel } from "@/lib/types";

function toRiskLevel(level: string): RiskLevel {
  if (level === "unclassified") return "unknown";
  if (level === "low" || level === "medium" || level === "high") return level;
  return "unknown";
}

function formatDate(iso: string) {
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
}

export default function AlertDetailPage() {
  const params = useParams<{ id: string }>();
  const [alert, setAlert] = useState<TlachiaAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    ensureDemoAnalystSession()
      .then(() => fetchAlert(params.id))
      .then((data) => {
        setAlert(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        setLoading(false);
      });
  }, [params.id]);

  const updateStatus = async (
    action: "review" | "dismiss" | "escalate",
    operation: () => Promise<{ message: string }>
  ) => {
    if (!alert) return;
    setActionLoading(action);
    setError(null);
    try {
      await operation();
      const reviewStatus =
        action === "dismiss" ? "dismissed" : action === "escalate" ? "escalated" : "reviewed";
      setAlert({ ...alert, review_status: reviewStatus });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const signals = alert?.signals?.map((signal) => `${signal.label}: ${signal.explanation}`) ?? [];
  const mentions = alert?.mentions ?? [];

  return (
    <AppShell role="analyst">
      <RoleGate role="analyst">
        <div className="space-y-6">
          <Button asChild variant="ghost">
            <Link href="/app/tlachia">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Volver al panel
            </Link>
          </Button>

          {error ? (
            <div className="rounded-md border border-danger-200 bg-danger-50 p-4 text-sm font-medium text-danger-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <Card>
              <CardContent className="flex min-h-[240px] items-center justify-center gap-3 text-neutral-700">
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
                Cargando alerta
              </CardContent>
            </Card>
          ) : null}

          {!loading && !alert ? (
            <Card>
              <CardContent className="p-6 text-sm text-neutral-700">
                No se encontro la alerta solicitada.
              </CardContent>
            </Card>
          ) : null}

          {alert ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <Badge variant="brand">Detalle de alerta</Badge>
                      <CardTitle className="mt-3 text-3xl">{alert.alert_code}</CardTitle>
                      <CardDescription>
                        {alert.protected_person_label} · {alert.platform} ·{" "}
                        {formatDate(alert.detected_at)}
                      </CardDescription>
                    </div>
                    <RiskBadge level={toRiskLevel(alert.risk_level)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-warning-100 bg-warning-100 p-4 text-sm leading-6 text-warning-700">
                    Sugerencia generada por IA. Requiere validacion humana antes de cualquier
                    decision institucional.
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline de deteccion</CardTitle>
                    <CardDescription>
                      Eventos de la corrida sintetica con trazabilidad institucional.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {[
                        [formatDate(alert.created_at), "Alerta creada en Tlachia"],
                        [formatDate(alert.detected_at), "Patron sugerido para revision humana"],
                        [alert.review_status, "Estado actual de revision humana"],
                      ].map(([time, description]) => (
                        <li className="flex gap-3" key={time}>
                          <span className="font-mono text-xs font-bold text-primary">{time}</span>
                          <span className="text-sm leading-6 text-neutral-700">{description}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <AlertExplainabilityPanel signals={signals} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                <Card>
                  <CardHeader>
                    <CardTitle>Menciones sanitizadas</CardTitle>
                    <CardDescription>
                      Fragmentos anonimizados. No se replican publicaciones textuales sensibles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mentions.map((mention) => (
                        <div
                          className="rounded-md border border-border bg-neutral-50 p-4"
                          key={mention.id}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-bold text-foreground">{mention.mention_code}</p>
                            <Badge variant="neutral">{formatDate(mention.occurred_at)}</Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">
                            {mention.sanitized_excerpt}
                          </p>
                          <Badge className="mt-3" variant="brand">
                            {mention.platform}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Senales</CardTitle>
                    <CardDescription>Indicadores usados para priorizar revision.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm leading-6 text-neutral-700">
                      {(alert.signals ?? []).map((signal) => (
                        <li
                          className="rounded-md border border-border bg-neutral-50 p-3"
                          key={signal.id}
                        >
                          <span className="font-semibold text-foreground">{signal.label}</span>
                          <span className="mt-1 block">{signal.explanation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <ClusterNetworkMock />

              <Card>
                <CardHeader>
                  <CardTitle>Acciones de analista</CardTitle>
                  <CardDescription>
                    Toda accion queda registrada en bitacora auditable. La clasificacion es
                    asistiva.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    disabled={actionLoading !== null}
                    type="button"
                    onClick={() =>
                      updateStatus("review", () => reviewAlert(alert.id, "Revisada desde Tlachia"))
                    }
                  >
                    {actionLoading === "review" ? (
                      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send aria-hidden="true" className="h-4 w-4" />
                    )}
                    Enviar a revision
                  </Button>
                  <Button
                    disabled={actionLoading !== null}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      updateStatus("dismiss", () =>
                        dismissAlert(alert.id, "Descartada desde Tlachia")
                      )
                    }
                  >
                    Descartar con motivo
                  </Button>
                  <Button
                    disabled={actionLoading !== null}
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      updateStatus("escalate", () =>
                        escalateAlert(alert.id, "Escalada desde Tlachia")
                      )
                    }
                  >
                    <FileLock2 aria-hidden="true" className="h-4 w-4" />
                    Solicitar sello forense
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </RoleGate>
    </AppShell>
  );
}
