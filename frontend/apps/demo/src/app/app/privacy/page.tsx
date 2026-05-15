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
        <div className="space-y-6">
          <div>
            <Badge variant="brand">Privacidad</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Configuracion de privacidad</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Controles mock para consentimiento, uso de datos, notificaciones y retencion demo.
            </p>
          </div>

          <PrivacyNoticeCard />

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estado de consentimiento</CardTitle>
                <CardDescription>Consentimiento demo activo y revocable.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Entiendo que informacion sera utilizada.",
                  "Entiendo que puedo revisar antes de enviar.",
                  "Autorizo el tratamiento de mis datos para este flujo demo."
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
                <CardTitle>Cuentas/plataformas registradas mock</CardTitle>
                <CardDescription>No hay conexiones reales a plataformas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Plataforma demo A", "Plataforma demo B", "Registro local"].map((item) => (
                  <div
                    className="flex items-center justify-between rounded-md border border-border bg-neutral-50 p-3"
                    key={item}
                  >
                    <span className="font-semibold text-foreground">{item}</span>
                    <Badge variant="neutral">Mock</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Datos que se usan</CardTitle>
                <CardDescription>Solo para explicar el flujo demo.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm leading-6 text-neutral-700">
                  <li>Metadatos sintéticos de evidencia.</li>
                  <li>Rol demo seleccionado.</li>
                  <li>Mensajes mock de orientación.</li>
                  <li>Estados visuales de guardado local.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datos que no se usan</CardTitle>
                <CardDescription>Restricciones explicitas del demo.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm leading-6 text-neutral-700">
                  <li>No se usan comunicaciones privadas.</li>
                  <li>No se conectan redes sociales reales.</li>
                  <li>No se suben archivos reales.</li>
                  <li>No se infiere identidad de personas señaladas.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de notificaciones mock</CardTitle>
                <CardDescription>Opciones visuales sin envio real.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["Recordar guardar localmente", "Avisar si falta revision", "Resumen semanal demo"].map(
                  (label) => (
                    <label className="flex items-start gap-3 text-sm leading-6" key={label}>
                      <Checkbox />
                      <span>{label}</span>
                    </label>
                  )
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retencion de datos demo</CardTitle>
                <CardDescription>Estados simulados, sin persistencia productiva.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-neutral-700">
                <p>Guardado local: disponible mientras dure la sesion demo.</p>
                <p>Envios: simulados y reversibles visualmente.</p>
                <p>Bitacora: mock para explicar auditabilidad.</p>
                <Button variant="destructive">Solicitar baja del programa</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Qué puede hacer Yaocíhuatl</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-neutral-700">
                <p>Organizar evidencia demo y mostrar estados de privacidad.</p>
                <p>Mostrar sugerencias asistivas con revision humana.</p>
                <p>Preparar un kit revisable antes de enviar.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Qué no puede hacer Yaocíhuatl</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-neutral-700">
                <p>No decide culpabilidad ni confirma VPMRG.</p>
                <p>No denuncia automaticamente.</p>
                <p>No accede a comunicaciones privadas ni realiza vigilancia masiva.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleGate>
    </AppShell>
  );
}
