import { AppShell, ChimalliChat, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";

export default function ChimalliPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div>
            <Badge variant="brand">Chimalli</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Chat de orientacion</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Guia procedimental con asistencia de IA. Pregunta una cosa a la vez y permite revisar
              antes de enviar.
            </p>
          </div>
          <ChimalliChat />
        </div>
      </RoleGate>
    </AppShell>
  );
}
