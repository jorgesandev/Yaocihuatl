import { AppShell, EvidenceCard, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { evidences } from "@/lib/mock-data";

const filters = [
  { value: "all", label: "Todas" },
  { value: "draft", label: "Sin sellar" },
  { value: "sealed", label: "Selladas localmente" },
  { value: "ready", label: "Listas para revision" },
  { value: "submitted", label: "Enviadas" }
];

export default function EvidencePage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge variant="brand">Machiyotl</Badge>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Mis evidencias</h1>
              <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
                Lista demo de evidencias locales, selladas y listas para revision. No se muestra
                contenido sensible por defecto.
              </p>
            </div>
            <Button variant="secondary">Capturar nueva evidencia</Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="flex w-full flex-wrap justify-start">
              {filters.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {filters.map((filter) => (
              <TabsContent className="space-y-4" key={filter.value} value={filter.value}>
                {filter.value === "submitted" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Aun no hay evidencia enviada</CardTitle>
                      <CardDescription>
                        Cuando decidas enviar a revision, aparecera aqui con su bitacora.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  evidences
                    .filter((evidence) => {
                      if (filter.value === "all") {
                        return true;
                      }
                      if (filter.value === "sealed") {
                        return evidence.status === "sealed-local";
                      }
                      if (filter.value === "ready") {
                        return evidence.status === "ready";
                      }
                      return evidence.status === filter.value;
                    })
                    .map((evidence) => (
                      <EvidenceCard evidence={evidence} key={evidence.id} />
                    ))
                )}
              </TabsContent>
            ))}
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Estado de guardado local</CardTitle>
              <CardDescription>
                Indicadores demo para distinguir lo local de cualquier envio a revision.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4">
              <Badge variant="success">Guardado local</Badge>
              <Badge variant="neutral">No enviado</Badge>
              <Badge variant="success">Sellado local</Badge>
              <Badge variant="warning">Pendiente de revision humana</Badge>
            </CardContent>
          </Card>
        </div>
      </RoleGate>
    </AppShell>
  );
}
