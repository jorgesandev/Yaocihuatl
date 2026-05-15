import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  AppShell,
  AuditLogTable,
  AuthorityRoutingCard,
  CustodyTimeline,
  EvidenceCard,
  HumanReviewPanel,
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
import { auditLogs, cases, evidences, extractedInfo } from "@/lib/mock-data";

interface CaseReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseReviewPage({ params }: CaseReviewPageProps) {
  const { id } = await params;
  const currentCase = cases.find((item) => item.id === id) ?? cases[0];

  return (
    <AppShell role="analyst">
      <RoleGate role="analyst">
        <div className="space-y-6">
          <Button asChild variant="ghost">
            <Link href="/app/tlachia">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Volver
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Badge variant="brand">Authority Case Review</Badge>
                  <CardTitle className="mt-3 text-3xl">{currentCase.title}</CardTitle>
                  <CardDescription>
                    {currentCase.person} · recibido {currentCase.receivedAt}
                  </CardDescription>
                </div>
                <Badge variant="warning">{currentCase.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md border border-border bg-neutral-50 p-4">
                  <p className="text-xs font-semibold text-neutral-600">Estado actual</p>
                  <p className="mt-2 font-bold text-foreground">{currentCase.status}</p>
                </div>
                <div className="rounded-md border border-border bg-neutral-50 p-4">
                  <p className="text-xs font-semibold text-neutral-600">Evidencias enviadas</p>
                  <p className="mt-2 font-bold text-foreground">
                    {currentCase.evidenceCount} elementos demo
                  </p>
                </div>
                <div className="rounded-md border border-border bg-neutral-50 p-4">
                  <p className="text-xs font-semibold text-neutral-600">Mesa revisora</p>
                  <p className="mt-2 font-bold text-foreground">{currentCase.reviewer}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tabla de evidencias</CardTitle>
                  <CardDescription>
                    Contenido sensible protegido; hashes visibles para verificacion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evidences.slice(0, 2).map((evidence) => (
                    <EvidenceCard compact evidence={evidence} key={evidence.id} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline de cadena de custodia</CardTitle>
                  <CardDescription>Secuencia demo auditable.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustodyTimeline />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comentarios internos</CardTitle>
                  <CardDescription>Campo mock para notas de revision.</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="min-h-32 w-full rounded-md border border-border-strong bg-surface-card p-3 text-sm leading-6"
                    defaultValue="Registrar observaciones sin sustituir motivacion formal."
                  />
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Panel de extraccion IA</CardTitle>
                  <CardDescription>Sugerencia generada por IA, editable y revisable.</CardDescription>
                </CardHeader>
                <CardContent>
                  {extractedInfo.map((item) => (
                    <div className="border-b border-border py-3 last:border-0" key={item.label}>
                      <p className="text-xs font-semibold text-neutral-600">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <AuthorityRoutingCard />
              <HumanReviewPanel />
            </aside>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audit log</CardTitle>
              <CardDescription>Bitacora auditable de acciones demo.</CardDescription>
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
