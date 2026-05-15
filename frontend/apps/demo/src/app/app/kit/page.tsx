import {
  AppShell,
  AuthorityRoutingCard,
  CustodyTimeline,
  EvidenceCard,
  EvidenceKitSummary,
  RoleGate
} from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { authoritySuggestion, evidenceKit, evidences, extractedInfo, vpmrgTest } from "@/lib/mock-data";

export default function EvidenceKitPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div>
            <Badge variant="brand">Revision final</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Kit de evidencia</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Pantalla formal para revisar que se enviaria, que queda local y que requiere
              validacion humana.
            </p>
          </div>

          <EvidenceKitSummary />

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Resumen del caso</CardTitle>
                  <CardDescription>{evidenceKit.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-neutral-700">{evidenceKit.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Lista de evidencias</CardTitle>
                  <CardDescription>Evidencias seleccionadas para revision demo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evidences.slice(0, 2).map((evidence) => (
                    <EvidenceCard compact evidence={evidence} key={evidence.id} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Timeline / cadena de custodia</CardTitle>
                  <CardDescription>Bitacora tecnica simulada y auditable.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustodyTimeline />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Narrativa de la persona protegida</CardTitle>
                  <CardDescription>Texto editable antes de enviar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-neutral-700">{evidenceKit.narrative}</p>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>5. Informacion extraida por Chimalli</CardTitle>
                  <CardDescription>Sugerencias editables.</CardDescription>
                </CardHeader>
                <CardContent>
                  {extractedInfo.map((item) => (
                    <div className="border-b border-border py-3 last:border-0" key={item.label}>
                      <p className="text-xs font-semibold text-neutral-600">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-foreground">{item.value}</p>
                      <Badge className="mt-2" variant="brand">
                        {item.state}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Test VPMRG simulado</CardTitle>
                  <CardDescription>No confirma hechos ni validez legal.</CardDescription>
                </CardHeader>
                <CardContent>
                  {vpmrgTest.map((item) => (
                    <div className="border-b border-border py-3 last:border-0" key={item.element}>
                      <p className="text-sm font-bold text-foreground">{item.element}</p>
                      <p className="text-sm text-neutral-700">{item.note}</p>
                      <Badge className="mt-2" variant="warning">
                        {item.result}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <AuthorityRoutingCard />

              <Card>
                <CardHeader>
                  <CardTitle>8. Metadatos tecnicos</CardTitle>
                  <CardDescription>{authoritySuggestion.status}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Formato: PDF demo revisable</p>
                  <p>Hash: incluido como identificador tecnico</p>
                  <p>Estado: no enviado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>9. Checklist de revision</CardTitle>
                  <CardDescription>Confirmaciones necesarias antes de enviar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Revise la evidencia incluida.",
                    "Entiendo que informacion se enviara.",
                    "Entiendo que sera revisado por una autoridad humana."
                  ].map((label) => (
                    <label className="flex items-start gap-3 text-sm leading-6" key={label}>
                      <Checkbox />
                      <span>{label}</span>
                    </label>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Editar informacion</Button>
                  <Button variant="secondary">Exportar PDF demo</Button>
                  <Button>Enviar a revision</Button>
                </CardFooter>
              </Card>
            </aside>
          </div>
        </div>
      </RoleGate>
    </AppShell>
  );
}
