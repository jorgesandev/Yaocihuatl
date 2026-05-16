import { AppShell, RoleGate } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, FileLock2 } from "lucide-react";
import Link from "next/link";

export default function MachiyotlPage() {
  return (
    <AppShell role="protected">
      <RoleGate role="protected">
        <div className="space-y-6">
          <div>
            <Badge variant="brand">Machiyotl</Badge>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Sello forense</h1>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
              Elige como quieres iniciar la captura de evidencia. Puedes comenzar manualmente
              o desde una alerta validada por Tlachia.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <FileLock2 className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-base">Captura manual</CardTitle>
                    <CardDescription>
                      Para plataformas no monitoreadas o ataques no detectados aun.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/app/machiyotl/capture">
                    Iniciar captura manual
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-info-100 text-info-800">
                    <Bell className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-base">Desde alerta de Tlachia</CardTitle>
                    <CardDescription>
                      Pre-llena datos desde una alerta ya validada por analistas.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/app/machiyotl/alerts">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Ver alertas pendientes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleGate>
    </AppShell>
  );
}
