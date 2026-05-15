import Link from "next/link";
import { Download, Eye, Search } from "lucide-react";

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
import { explainabilitySignals, riskClusters, tlachiaAlerts } from "@/lib/mock-data";

export default function TlachiaPage() {
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
              value="24"
            />
            <RiskScoreCard
              context="Riesgo sugerido, no confirmado"
              level="high"
              title="Riesgo alto"
              trend="5 requieren lectura prioritaria"
              value="8"
            />
            <RiskScoreCard
              context="Mesa institucional demo"
              level="unknown"
              title="Casos en revision"
              trend="Pendientes de decision humana"
              value="13"
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
                    Tabla mock con acciones institucionales y estados auditables.
                  </CardDescription>
                </div>
                <Button type="button" variant="outline">
                  <Search aria-hidden="true" className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                    {tlachiaAlerts.map((alert) => (
                      <tr className="border-t border-border" key={alert.id}>
                        <td className="px-4 py-3 text-neutral-700">{alert.date}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {alert.protectedPerson}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">{alert.platform}</td>
                        <td className="px-4 py-3">
                          <RiskBadge level={alert.risk} />
                        </td>
                        <td className="px-4 py-3 text-neutral-700">{alert.reason}</td>
                        <td className="px-4 py-3">
                          <Badge variant="warning">{alert.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/app/tlachia/alerts/${alert.id}`}>
                              <Eye aria-hidden="true" className="h-4 w-4" />
                              {alert.action}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <StateGallery />
        </div>
      </RoleGate>
    </AppShell>
  );
}
