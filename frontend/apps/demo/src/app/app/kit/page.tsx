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
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <Badge variant="brand">Expediente digital</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Kit de evidencia</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Revisa todo lo que se incluiría en el expediente antes de enviarlo a revisión. Nada
              se envía sin tu confirmación explícita.
            </p>
          </div>

          <EvidenceKitSummary />

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">1</span>
                    <div>
                      <CardTitle>Resumen del caso</CardTitle>
                      <CardDescription>{evidenceKit.id}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-neutral-700">{evidenceKit.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">2</span>
                    <div>
                      <CardTitle>Lista de evidencias</CardTitle>
                      <CardDescription>Evidencias seleccionadas para revisión.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evidences.slice(0, 2).map((evidence) => (
                    <EvidenceCard compact evidence={evidence} key={evidence.id} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">3</span>
                    <div>
                      <CardTitle>Cadena de custodia</CardTitle>
                      <CardDescription>Bitácora técnica auditable e inalterable.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CustodyTimeline />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">4</span>
                    <div>
                      <CardTitle>Narrativa de la persona protegida</CardTitle>
                      <CardDescription>Texto editable antes de enviar.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-neutral-700">{evidenceKit.narrative}</p>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">5</span>
                    <div>
                      <CardTitle>Información extraída por Chimalli</CardTitle>
                      <CardDescription>Sugerencias editables. Revisión humana requerida.</CardDescription>
                    </div>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">6</span>
                    <div>
                      <CardTitle>Test VPMRG</CardTitle>
                      <CardDescription>No confirma hechos ni validez legal. Solo asistivo.</CardDescription>
                    </div>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">8</span>
                    <div>
                      <CardTitle>Metadatos técnicos</CardTitle>
                      <CardDescription>{authoritySuggestion.status}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-neutral-700">
                  <p>Formato: PDF revisable</p>
                  <p>Hash: incluido como identificador técnico</p>
                  <p>Estado: no enviado · solo en este dispositivo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">9</span>
                    <div>
                      <CardTitle>Confirmación antes de enviar</CardTitle>
                      <CardDescription>Todas las casillas son obligatorias.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "He revisado la evidencia incluida.",
                    "Entiendo qué información será enviada.",
                    "Entiendo que será revisado por una autoridad humana."
                  ].map((label) => (
                    <label className="flex items-start gap-3 text-sm leading-6" key={label}>
                      <Checkbox />
                      <span>{label}</span>
                    </label>
                  ))}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="outline">Editar información</Button>
                  <Button variant="secondary">Exportar PDF</Button>
                  <Button>Enviar a revisión</Button>
                </CardFooter>
              </Card>
            </aside>
          </div>
        </div>
      </RoleGate>
    </AppShell>
  );
}
