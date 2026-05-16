import { AppShell, PrivacyNoticeCard, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function PrivacySettingsPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <Badge variant="brand">Privacidad</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Configuración de privacidad</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Control completo sobre tu consentimiento, uso de datos y retención de información en el sistema.
            </p>
          </div>

          <PrivacyNoticeCard />

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estado de consentimiento</CardTitle>
                <CardDescription>Consentimiento activo y revocable en cualquier momento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Entiendo que mi información será utilizada para preparar el expediente.",
                  "Entiendo que puedo revisar antes de enviar cualquier información.",
                  "Autorizo el tratamiento de mis datos para este flujo institucional."
                ].map((label) => (
                  <label className="flex items-start gap-3 text-sm leading-6" key={label}>
                    <Checkbox defaultChecked />
                    <span>{label}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plataformas registradas</CardTitle>
                <CardDescription>Registros de fuentes de evidencia vinculadas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Capturas locales", status: "Solo en este dispositivo" },
                  { name: "Adjuntos de Chimalli", status: "Sesión actual" },
                  { name: "Alertas de Tlachia", status: "Referencia institucional" }
                ].map((item) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-border bg-neutral-50 p-3"
                    key={item.name}
                  >
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <Badge variant="neutral">{item.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Qué puede hacer Yaocíhuatl</CardTitle>
                <CardDescription>Capacidades del sistema en este flujo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-neutral-700">
                <p>Organizar evidencia y mostrar estados de privacidad.</p>
                <p>Mostrar sugerencias asistivas con revisión humana.</p>
                <p>Preparar un kit revisable antes de enviar.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qué no puede hacer Yaocíhuatl</CardTitle>
                <CardDescription>Restricciones explícitas del sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-neutral-700">
                <p>No decide culpabilidad ni confirma VPMRG.</p>
                <p>No denuncia automáticamente.</p>
                <p>No accede a comunicaciones privadas ni realiza vigilancia masiva.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de notificaciones</CardTitle>
                <CardDescription>Avisos del sistema. Sin envío real hasta que autorices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Recordar guardar localmente antes de cerrar",
                  "Avisar si falta revisión antes de enviar",
                  "Resumen semanal de evidencias guardadas"
                ].map((label) => (
                  <label className="flex items-start gap-3 text-sm leading-6" key={label}>
                    <Checkbox />
                    <span>{label}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retención de datos</CardTitle>
                <CardDescription>Alcance y duración del almacenamiento en el sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-neutral-700">
                <p>Guardado local: disponible mientras dure la sesión activa.</p>
                <p>Envíos: solo con tu confirmación explícita, reversibles antes de procesarse.</p>
                <p>Bitácora: registro auditable de acciones institucionales.</p>
                <Button className="mt-2" variant="destructive">Solicitar baja del programa</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleGate>
    </AppShell>
  );
}
