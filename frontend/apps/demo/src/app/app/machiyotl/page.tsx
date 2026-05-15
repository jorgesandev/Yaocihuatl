import { AppShell, EvidenceCaptureStepper, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";

export default function MachiyotlPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div>
            <Badge variant="brand">Machiyotl</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Sello forense demo</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Captura, sella localmente y revisa evidencia sin enviar archivos reales ni exponer
              miniaturas sensibles.
            </p>
          </div>
          <EvidenceCaptureStepper />
        </div>
      </RoleGate>
    </AppShell>
  );
}
