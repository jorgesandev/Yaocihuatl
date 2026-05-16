import { AppShell, ConsentStepper, PrivacyNoticeCard, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6 animate-fade-in-up">
          <div className="max-w-3xl">
            <Badge variant="brand">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              Inicio seguro
            </Badge>
            <h1 className="mt-4 text-3xl font-bold text-foreground">
              Bienvenida a Yaocíhuatl
            </h1>
            <p className="mt-2 leading-7 text-neutral-700">
              Antes de capturar o preparar evidencia, revisa cómo funciona la plataforma y qué
              información se usa en cada paso. Tu consentimiento es obligatorio y revocable.
            </p>
          </div>
          <PrivacyNoticeCard />
          <ConsentStepper />
        </div>
      </RoleGate>
    </AppShell>
  );
}
