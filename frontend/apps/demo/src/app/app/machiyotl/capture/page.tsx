"use client";

import { Suspense } from "react";

import { AppShell, EvidenceCaptureStepper, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { useAlertParams } from "@/lib/use-alert-params";

function CaptureContent() {
  const initialData = useAlertParams();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="brand">Machiyotl</Badge>
        <h1 className="mt-3 text-3xl font-bold text-foreground">
          {initialData.mode === "alert" ? "Captura desde alerta" : "Sello forense demo"}
        </h1>
        <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
          {initialData.mode === "alert"
            ? "Esta evidencia fue pre-llenada desde una alerta validada por Tlachia. Verifica los datos, sube tu captura de pantalla y genera el hash SHA-256 localmente."
            : "Captura, sella localmente y revisa evidencia sin enviar archivos reales ni exponer miniaturas sensibles."}
        </p>
      </div>
      <EvidenceCaptureStepper
        initialData={{
          sourceUrl: initialData.sourceUrl,
          platform: initialData.platform,
          alertId: initialData.alertId,
          mode: initialData.mode,
        }}
      />
    </div>
  );
}

export default function MachiyotlCapturePage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
              <div className="h-96 animate-pulse rounded bg-neutral-200" />
            </div>
          }
        >
          <CaptureContent />
        </Suspense>
      </RoleGate>
    </AppShell>
  );
}
