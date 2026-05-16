import Link from "next/link";
import { Fingerprint } from "lucide-react";

import {
  AppShell,
  AuditLogTable,
  CustodyTimeline,
  HashBlock,
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
import { auditLogs, cases, evidences } from "@/lib/mock-data";

export default function ReviewerPage() {
  return (
    <AppShell role="reviewer">
      <RoleGate role="reviewer">
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <Badge variant="brand">Autoridad Resolutora</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Expedientes asignados</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Panel institucional de solo lectura. Acceso a expedientes, certificación criptográfica,
              cadena de custodia y observaciones institucionales.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map((item) => (
              <Card className="card-hover" key={item.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>
                        {item.person} · Recibido {item.receivedAt}
                      </CardDescription>
                    </div>
                    <Badge variant="warning">{item.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-neutral-700">
                    {item.evidenceCount} constancias forenses certificadas. Acceso de solo lectura.
                  </p>
                  <Button asChild className="mt-4" variant="secondary">
                    <Link href={`/app/cases/${item.id}`}>Abrir expediente</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <Card>
              <CardHeader>
                <CardTitle>Evidencias verificables</CardTitle>
                <CardDescription>
                  Firmas criptográficas visibles respetando la privacidad del expediente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {evidences.slice(0, 2).map((evidence) => (
                  <div className="rounded-lg border border-border bg-neutral-50 p-4" key={evidence.id}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="font-bold text-foreground">{evidence.title}</p>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/verify">
                          <Fingerprint aria-hidden="true" className="h-4 w-4" />
                          Verificar hash
                        </Link>
                      </Button>
                    </div>
                    <HashBlock algorithm="SHA-256" hash={evidence.hash} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cadena de custodia</CardTitle>
                <CardDescription>
                  Registro inalterable de la cadena de custodia electrónica.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustodyTimeline />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bitácora de revisión</CardTitle>
              <CardDescription>
                Observaciones institucionales y trazabilidad de eventos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogTable logs={auditLogs} />
            </CardContent>
          </Card>
        </div>
      </RoleGate>
    </AppShell>
  );
}
