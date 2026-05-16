"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileLock2, MessageSquareText } from "lucide-react";

import { AppShell, EvidenceCard, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { evidences } from "@/lib/mock-data";
import { useChimalliContext, type ChimalliEvidenceContext } from "@/lib/use-chimalli-context";
import type { StoredEvidence } from "@/lib/use-evidence-store";

const filters = [
  { value: "all", label: "Todas" },
  { value: "sealed", label: "Selladas localmente" },
  { value: "ready", label: "Listas para revision" },
];

const STORAGE_KEY = "yaocihuatl-machiyotl-evidences";

function loadStoredEvidences(): StoredEvidence[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEvidence[]) : [];
  } catch {
    return [];
  }
}

export default function EvidencePage() {
  const { saveContext } = useChimalliContext();
  const router = useRouter();
  const [storedEvidences, setStoredEvidences] = useState<StoredEvidence[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStoredEvidences(loadStoredEvidences());
    setHydrated(true);
  }, []);

  const handleGoToChimalli = useCallback((ev: StoredEvidence) => {
    const ctx: ChimalliEvidenceContext = {
      evidences: [{
        id: ev.id,
        hash: ev.hash,
        shortHash: ev.shortHash,
        platform: ev.platform,
        sourceUrl: ev.sourceUrl,
        contextNote: ev.contextNote || undefined,
        capturedAt: ev.capturedAt,
        sourceType: ev.sourceType,
      }],
      alert: ev.alertId ? {
        alertId: ev.alertId,
        alertCode: ev.alertCode,
        riskLevel: ev.riskLevel,
        motive: ev.motive,
        protectedPerson: ev.protectedPerson,
        signals: ev.tlachiaSignals,
      } : undefined,
      attachmentIds: [],
      noteText: ev.contextNote || "",
      storedAt: new Date().toISOString(),
    };
    saveContext(ctx);
    router.push("/app/chimalli");
  }, [saveContext, router]);

  const storedEvidencesToShow = storedEvidences.filter(
    (ev) => ev.status === "sellada-localmente" || ev.status === "lista-para-revision"
  );

  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge variant="brand">Machiyotl</Badge>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Mis evidencias</h1>
              <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
                Evidencias locales selladas y listas para revision. Puedes enviar cada una a Chimalli para iniciar o continuar un caso.
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
                {!hydrated && (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12 text-neutral-600">
                      Cargando evidencias...
                    </CardContent>
                  </Card>
                )}

                {hydrated && storedEvidencesToShow.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <FileLock2 className="h-10 w-10 text-neutral-400" />
                      <p className="mt-4 text-sm font-semibold text-foreground">
                        No hay evidencias guardadas aun
                      </p>
                      <p className="mt-1 text-xs text-neutral-600">
                        Captura y sella evidencia desde Machiyotl para verla aqui.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {hydrated && storedEvidencesToShow
                  .filter((ev) => {
                    if (filter.value === "all") return true;
                    if (filter.value === "sealed") return ev.status === "sellada-localmente";
                    if (filter.value === "ready") return ev.status === "lista-para-revision";
                    return true;
                  })
                  .map((ev) => (
                    <Card className="p-4" key={ev.id}>
                      <div className="grid gap-4 sm:grid-cols-[96px_1fr]">
                        <div className="flex h-24 items-center justify-center rounded-md border border-border bg-neutral-100">
                          <FileLock2 aria-hidden="true" className="h-8 w-8 text-neutral-500" />
                          <span className="sr-only">Vista previa difuminada por privacidad</span>
                        </div>
                        <div className="min-w-0 space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-foreground">
                                {ev.contextNote ? ev.contextNote.slice(0, 80) : `Evidencia ${ev.shortHash}`}
                              </h3>
                              <p className="text-sm leading-6 text-neutral-600">
                                {ev.sourceType} · {ev.platform} · {new Date(ev.capturedAt).toLocaleDateString("es-MX")}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="success">Sellado local</Badge>
                              <Badge variant="neutral">SHA-256: {ev.shortHash}</Badge>
                            </div>
                          </div>
                          {ev.mode === "alert" && ev.alertId ? (
                            <div className="rounded-md border border-info-200 bg-info-50 p-2">
                              <p className="text-xs font-semibold text-info-800">
                                Origen: Alerta {ev.alertCode || ev.alertId} · Tlachia
                              </p>
                              {ev.riskLevel ? (
                                <p className="mt-1 text-xs text-info-700">
                                  Riesgo {ev.riskLevel} · {ev.motive?.slice(0, 100)}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              type="button"
                              variant="secondary"
                              onClick={() => handleGoToChimalli(ev)}
                            >
                              <MessageSquareText className="mr-2 h-4 w-4" />
                              Ir a Chimalli con esta evidencia
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                {/* Also show mock demo evidences for reference */}
                {hydrated && filter.value !== "sealed" && (
                  <>
                    <div className="pt-4">
                      <p className="text-xs font-semibold text-neutral-500 mb-3">Evidencias demo</p>
                    </div>
                    {evidences
                      .filter((evidence) => {
                        if (filter.value === "all") return true;
                        if (filter.value === "ready") return evidence.status === "ready";
                        return evidence.status === filter.value;
                      })
                      .map((evidence) => (
                        <EvidenceCard evidence={evidence} key={evidence.id} />
                      ))}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Estado de guardado local</CardTitle>
              <CardDescription>
                Indicadores para distinguir lo local de cualquier envio a revision.
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
