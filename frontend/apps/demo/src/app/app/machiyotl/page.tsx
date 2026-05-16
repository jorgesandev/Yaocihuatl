import { AppShell, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, FileLock2, Info, Lock } from "lucide-react";
import Link from "next/link";

export default function MachiyotlPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <Badge variant="brand">Machiyotl</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Sello forense</h1>
            <p className="mt-2 max-w-2xl leading-7 text-neutral-700">
              Captura y sella evidencia localmente con hash SHA-256. Nada se envía hasta que tú
              decidas explícitamente compartirlo.
            </p>
          </div>

          <div className="rounded-lg border border-info-100 bg-info-100 px-4 py-3">
            <div className="flex items-start gap-3">
              <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-info-700" />
              <div className="text-sm text-info-700">
                <strong>Solo en este dispositivo</strong> — El sellado ocurre localmente. Tu evidencia
                no se transmite a ningún servidor hasta que autorices el envío a revisión.
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card className="border-brand-200 transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <FileLock2 className="h-6 w-6" />
                  </span>
                  <div>
                    <CardTitle className="text-base">Captura manual</CardTitle>
                    <CardDescription>
                      Para publicaciones en cualquier plataforma que hayas documentado.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5">
                  {[
                    "Sube una captura de pantalla o archivo",
                    "El hash SHA-256 se calcula localmente",
                    "Los metadatos se preservan en cadena de custodia"
                  ].map((item) => (
                    <li className="flex items-center gap-2 text-xs text-neutral-600" key={item}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-2 w-full">
                  <Link href="/app/machiyotl/capture">
                    Iniciar captura
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-info-100 text-info-700">
                    <Bell className="h-6 w-6" />
                  </span>
                  <div>
                    <CardTitle className="text-base">Desde alerta validada</CardTitle>
                    <CardDescription>
                      Pre-llena los datos desde una alerta ya revisada por analistas institucionales.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5">
                  {[
                    "Los datos de la alerta se pre-cargan automáticamente",
                    "Tú verificas y ajustas antes de sellar",
                    "El contexto institucional queda registrado"
                  ].map((item) => (
                    <li className="flex items-center gap-2 text-xs text-neutral-600" key={item}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-info-700" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-2 w-full" variant="secondary">
                  <Link href="/app/machiyotl/alerts">
                    <AlertTriangle className="h-4 w-4" />
                    Ver alertas pendientes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-surface-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock aria-hidden="true" className="h-5 w-5 text-primary" />
                ¿Qué significa &quot;sellado local&quot;?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm leading-6 text-neutral-700 sm:grid-cols-2">
                <p>
                  Un <strong>hash SHA-256</strong> es una huella digital criptográfica única que
                  identifica el archivo sin revelar su contenido.
                </p>
                <p>
                  El sello se genera en tu dispositivo. Nadie puede alterar la evidencia sin que
                  el hash cambie, lo que garantiza su <strong>integridad</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGate>
    </AppShell>
  );
}
