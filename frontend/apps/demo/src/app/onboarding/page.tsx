import { AppShell, ConsentStepper, PrivacyNoticeCard, RoleGate } from "@/components/product/app-shell";

export default function OnboardingPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-foreground">Onboarding y consentimiento</h1>
            <p className="mt-2 leading-7 text-neutral-700">
              Antes de capturar o preparar evidencia, revisa como funciona esta demo y que limites
              tiene.
            </p>
          </div>
          <PrivacyNoticeCard />
          <ConsentStepper />
        </div>
      </RoleGate>
    </AppShell>
  );
}
