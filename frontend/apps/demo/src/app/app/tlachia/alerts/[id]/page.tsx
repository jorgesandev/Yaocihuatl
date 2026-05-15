import Link from "next/link";
import { ArrowLeft, FileLock2, Send } from "lucide-react";

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
import { alertMentions, explainabilitySignals, tlachiaAlerts } from "@/lib/mock-data";

interface AlertDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlertDetailPage({ params }: AlertDetailPageProps) {
  const { id } = await params;
  const alert = tlachiaAlerts.find((item) => item.id === id) ?? tlachiaAlerts[0];

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

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Badge variant="brand">Detalle de alerta</Badge>
                  <CardTitle className="mt-3 text-3xl">{alert.id}</CardTitle>
                  <CardDescription>
                    {alert.protectedPerson} · {alert.platform} · {alert.date}
                  </CardDescription>
                </div>
                <RiskBadge level={alert.risk} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-warning-100 bg-warning-100 p-4 text-sm leading-6 text-warning-700">
                Sugerencia generada por IA. Requiere validacion humana antes de cualquier decision
                institucional.
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Timeline de deteccion</CardTitle>
                <CardDescription>Eventos mock con trazabilidad institucional.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {[
                    ["09:18", "Primera mencion publica demo detectada"],
                    ["09:27", "Actividad concentrada supera umbral mock"],
                    ["09:36", "Patron sugerido para revision humana"],
                    ["09:40", "Alerta creada en Tlachia"]
                  ].map(([time, description]) => (
                    <li className="flex gap-3" key={time}>
                      <span className="font-mono text-xs font-bold text-primary">{time}</span>
                      <span className="text-sm leading-6 text-neutral-700">{description}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <AlertExplainabilityPanel signals={explainabilitySignals} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <Card>
              <CardHeader>
                <CardTitle>Menciones mock</CardTitle>
                <CardDescription>
                  Fragmentos anonimizados. No se replican publicaciones textuales sensibles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertMentions.map((mention) => (
                    <div
                      className="rounded-md border border-border bg-neutral-50 p-4"
                      key={`${mention.account}-${mention.time}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-bold text-foreground">{mention.account}</p>
                        <Badge variant="neutral">{mention.time}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">{mention.content}</p>
                      <Badge className="mt-3" variant="brand">
                        {mention.signal}
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
                  {[
                    "Cuentas recientes",
                    "Mensajes similares",
                    "Actividad concentrada en poco tiempo",
                    "Lenguaje potencialmente basado en genero"
                  ].map((signal) => (
                    <li className="rounded-md border border-border bg-neutral-50 p-3" key={signal}>
                      {signal}
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
                Toda accion requiere motivo y queda pensada para bitacora auditable en una fase
                posterior.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button type="button">
                <Send aria-hidden="true" className="h-4 w-4" />
                Enviar a revision
              </Button>
              <Button type="button" variant="outline">
                Descartar con motivo
              </Button>
              <Button type="button" variant="secondary">
                <FileLock2 aria-hidden="true" className="h-4 w-4" />
                Solicitar sello forense
              </Button>
            </CardContent>
          </Card>
        </div>
      </RoleGate>
    </AppShell>
  );
}
