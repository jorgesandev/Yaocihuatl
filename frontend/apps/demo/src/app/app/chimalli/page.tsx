import { AppShell, ChimalliChat, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

export default function ChimalliPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-5 animate-fade-in-up">
          <div>
            <Badge variant="brand">Chimalli</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Orientación procedimental</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Guía conversacional con asistencia de IA. Pregunta una cosa a la vez y permite revisar
              cada sugerencia antes de continuar.
            </p>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Lo que escribes aquí permanece en esta sesión. Nada se envía sin tu decisión expresa.
              Chimalli organiza y sugiere — la validación final la hace una persona autorizada.
            </span>
          </div>
          <ChimalliChat />
        </div>
      </RoleGate>
    </AppShell>
  );
}
