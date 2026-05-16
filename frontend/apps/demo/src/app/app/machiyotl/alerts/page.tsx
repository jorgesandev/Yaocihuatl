"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, ExternalLink, Loader2 } from "lucide-react";

import { AppShell, RiskBadge, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ensureDemoAnalystSession,
  fetchAlerts,
  type TlachiaAlert,
} from "@/lib/tlachia-api";

function getRealisticUrl(alert: TlachiaAlert): string {
  const platform = alert.platform.toLowerCase();
  if (platform.includes("x") || platform.includes("twitter")) {
    return `https://x.com/candidata_demo/status/${alert.id.replace(/-/g, "").slice(0, 12)}`;
  }
  if (platform.includes("facebook") || platform.includes("fb")) {
    return `https://facebook.com/groups/demo-bc/posts/${alert.id.replace(/-/g, "").slice(0, 12)}`;
  }
  if (platform.includes("instagram") || platform.includes("ig")) {
    return `https://instagram.com/p/${alert.id.replace(/-/g, "").slice(0, 12)}`;
  }
  if (platform.includes("tiktok")) {
    return `https://tiktok.com/@candidata_demo/video/${alert.id.replace(/-/g, "").slice(0, 12)}`;
  }
  if (platform.includes("whatsapp") || platform.includes("wa")) {
    return `https://wa.me/message/${alert.id.replace(/-/g, "").slice(0, 12)}`;
  }
  return `https://${platform.replace(/\s+/g, "").toLowerCase()}.com/post/${alert.id.replace(/-/g, "").slice(0, 12)}`;
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

function toRiskLevel(level: string): "low" | "medium" | "high" | "unknown" {
  if (level === "high") return "high";
  if (level === "medium") return "medium";
  if (level === "low") return "low";
  return "unknown";
}

export default function MachiyotlAlertsPage() {
  const [alerts, setAlerts] = useState<TlachiaAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureDemoAnalystSession()
      .then(fetchAlerts)
      .then((data) => {
        setAlerts(data.filter((a) => a.review_status === "pending_human_review"));
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div>
            <Badge variant="brand">Tlachia</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">
              Alertas pendientes
            </h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Estas alertas fueron detectadas y clasificadas por Tlachia.
              Selecciona una para pre-llenar los datos de evidencia y sellarla localmente con Machiyotl.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">Error al cargar alertas</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Cargando alertas de Tlachia...
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && alerts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-10 w-10 text-neutral-400" />
                <p className="mt-4 text-sm font-semibold text-foreground">
                  No hay alertas pendientes
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  Cuando Tlachia detecte una agresión y una analista la valide, aparecerá aquí.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && alerts.length > 0 && (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <RiskBadge level={toRiskLevel(alert.risk_level)} />
                          <span className="text-xs text-neutral-600">{alert.alert_code}</span>
                        </div>
                        <CardTitle className="mt-2 text-base">
                          {alert.motive}
                        </CardTitle>
                      </div>
                      <span className="text-xs text-neutral-600">
                        {formatDate(alert.detected_at)}
                      </span>
                    </div>
                    <CardDescription>
                      Plataforma: {alert.platform} · Persona protegida: {alert.protected_person_label}
                    </CardDescription>
                    {alert.signals && alert.signals.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {alert.signals.slice(0, 3).map((signal) => (
                          <Badge key={signal.id} variant="neutral" className="text-xs">
                            {signal.label}
                          </Badge>
                        ))}
                        {alert.signals.length > 3 && (
                          <Badge variant="neutral" className="text-xs">
                            +{alert.signals.length - 3} más
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <AlertTriangle className="h-4 w-4" />
                        Estado: {alert.review_status === "pending_human_review" ? "Pendiente de revisión" : alert.review_status}
                      </div>
                      <Button asChild size="sm">
                        <Link
                          href={`/app/machiyotl/capture?sourceUrl=${encodeURIComponent(getRealisticUrl(alert))}&platform=${encodeURIComponent(alert.platform)}&alertId=${alert.id}&riskLevel=${encodeURIComponent(alert.risk_level)}&motive=${encodeURIComponent(alert.motive)}&protectedPerson=${encodeURIComponent(alert.protected_person_label)}&alertCode=${encodeURIComponent(alert.alert_code)}`}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Pre-llenar evidencia
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </RoleGate>
    </AppShell>
  );
}
