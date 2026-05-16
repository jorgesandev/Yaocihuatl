import { BrandLogo } from "@/components/product/brand-logo";
import { PublicMetricsDashboard } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Link from "next/link";

export default function PublicDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="container-standard flex min-h-16 items-center justify-between gap-4">
          <BrandLogo compact />
          <div className="flex items-center gap-3">
            <Badge variant="neutral">Observatorio ciudadano</Badge>
            <Link
              className="text-sm font-semibold text-neutral-600 hover:text-foreground transition-colors"
              href="/verify"
            >
              Verificador SHA-256
            </Link>
          </div>
        </div>
      </header>
      <section className="container-dashboard py-10">
        <div className="mb-8 max-w-3xl">
          <Badge variant="neutral">Datos agregados y anonimizados</Badge>
          <h1 className="mt-4 text-4xl font-bold text-foreground">
            Observatorio de violencia política digital
          </h1>
          <p className="mt-3 text-base leading-7 text-neutral-700">
            Métricas institucionales agregadas. No se exponen nombres, handles, capturas de pantalla
            ni textos de publicaciones originales.
          </p>
        </div>

        <PublicMetricsDashboard />

        <div className="mt-6 grid gap-6 lg:grid-cols-3" id="metodologia">
          <Card>
            <CardHeader>
              <CardTitle>Metodología</CardTitle>
              <CardDescription>
                Las categorías son agregadas para explicar tendencias institucionales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-neutral-700">
                El observatorio agrupa señales por periodo, plataforma y tipo de conducta. No
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
                k-anonimato: una cifra se muestra solo si representa al menos un grupo mínimo
                establecido institucionalmente, reduciendo el riesgo de reidentificación.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tiempos de canalización</CardTitle>
              <CardDescription>Indicador institucional de proceso.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">36 h</p>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                Promedio desde kit revisable hasta sugerencia de canalización institucional.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
