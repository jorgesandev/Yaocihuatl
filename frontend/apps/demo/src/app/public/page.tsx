import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { PublicMetricsDashboard } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function PublicDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="container-standard flex min-h-16 items-center justify-between">
          <Link className="flex items-center gap-3 font-bold" href="/">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-primary" />
            Yaocíhuatl
          </Link>
          <Badge variant="brand">Observatorio ciudadano</Badge>
        </div>
      </header>
      <section className="container-dashboard py-10">
        <div className="mb-8 max-w-3xl">
          <Badge variant="neutral">Datos agregados y anonimizados</Badge>
          <h1 className="mt-4 text-4xl font-bold text-foreground">
            Dashboard publico de observacion
          </h1>
          <p className="mt-3 text-lg leading-8 text-neutral-700">
            Metricas demo sin nombres, handles, screenshots, textos de publicaciones ni grupos
            pequenos identificables.
          </p>
        </div>

        <PublicMetricsDashboard />

        <div className="mt-6 grid gap-6 lg:grid-cols-3" id="metodologia">
          <Card>
            <CardHeader>
              <CardTitle>Metodologia</CardTitle>
              <CardDescription>
                Las categorias son sinteticas y sirven para explicar tendencias agregadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-neutral-700">
                El observatorio agrupa senales por periodo, plataforma demo y tipo de conducta. No
                expone publicaciones textuales ni personas identificables.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Privacidad y anonimización</CardTitle>
              <CardDescription>Los datos se publican solo cuando hay grupos suficientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-neutral-700">
                k-anonimato significa que una cifra solo se muestra si representa al menos un grupo
                minimo demo, para reducir riesgo de reidentificacion.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tiempos promedio de canalización</CardTitle>
              <CardDescription>Indicador simulado de proceso institucional.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">36 h</p>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                Promedio demo desde kit revisable hasta sugerencia de canalizacion.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
