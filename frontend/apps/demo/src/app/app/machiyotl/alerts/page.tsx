import { AppShell, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { tlachiaAlerts } from "@/lib/mock-data";
import { AlertTriangle, Bell, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function MachiyotlAlertsPage() {
  const pendingAlerts = tlachiaAlerts.filter(
    (a) => a.status === "Pendiente de revision humana" || a.status === "En revision"
  );

  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div>
            <Badge variant="brand">Machiyotl</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">
              Alertas pendientes
            </h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Estas alertas fueron detectadas por Tlachia y validadas por una analista.
              Selecciona una para pre-llenar los datos de evidencia y sellarla localmente.
            </p>
          </div>

          {pendingAlerts.length === 0 ? (
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
          ) : (
            <div className="grid gap-4">
              {pendingAlerts.map((alert) => (
                <Card key={alert.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={alert.risk === "high" ? "danger" : "warning"}
                          >
                            {alert.risk === "high" ? "Alto riesgo" : "Riesgo medio"}
                          </Badge>
                          <span className="text-xs text-neutral-600">{alert.id}</span>
                        </div>
                        <CardTitle className="mt-2 text-base">
                          {alert.reason}
                        </CardTitle>
                      </div>
                      <span className="text-xs text-neutral-600">{alert.date}</span>
                    </div>
                    <CardDescription>
                      Plataforma: {alert.platform} · Persona protegida: {alert.protectedPerson}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <AlertTriangle className="h-4 w-4" />
                        Estado: {alert.status}
                      </div>
                      <Button asChild size="sm">
                        <Link
                          href={`/app/machiyotl/capture?sourceUrl=https://demo.example/${alert.id}&platform=${encodeURIComponent(alert.platform)}&alertId=${alert.id}`}
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
