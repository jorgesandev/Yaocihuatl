import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileLock2,
  Github,
  Lock,
  Route,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const modules = [
  {
    title: "Tlachia observa",
    description:
      "Monitoreo institucional de alertas, patrones sugeridos, explicabilidad y auditoria.",
    icon: Eye
  },
  {
    title: "Machiyotl sella",
    description:
      "Captura evidencia demo, preserva metadatos y muestra un hash SHA-256 simulado.",
    icon: FileLock2
  },
  {
    title: "Chimalli protege",
    description:
      "Guia conversacional asistiva para organizar informacion y preparar un kit revisable.",
    icon: ShieldCheck
  }
];

const flow = [
  "Deteccion",
  "Sello forense",
  "Cese inmediato en plataforma",
  "Canalizacion"
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="container-standard flex min-h-16 items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="font-bold">Yaocíhuatl</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="brand">Demo</Badge>
            <Button asChild size="sm" variant="outline">
              <Link href="/safe-exit">Salida rápida</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-surface-soft">
        <div className="container-standard grid min-h-[calc(100vh-4rem)] content-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-2xl">
            <Badge variant="brand">Plataforma de protección digital</Badge>
            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-normal text-foreground">
              Yaocíhuatl
            </h1>
            <p className="mt-4 text-xl leading-8 text-neutral-700">
              Detecta, sella y canaliza evidencia de violencia política digital de género.
            </p>
            <p className="mt-3 text-base font-semibold text-primary">
              Tlachia observa · Machiyotl sella · Chimalli protege
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/demo">
                  Iniciar demo
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="#funciona">Ver cómo funciona</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href="https://github.com/LexHackersClub/Yaocihuatl"
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub
                  <Github aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="surface-card p-4 md:p-5" aria-label="Vista previa mock de la app">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-sm font-bold text-foreground">Panel institucional</p>
                <p className="text-xs text-neutral-600">Datos demo · sin casos reales</p>
              </div>
              <Badge variant="warning">Revision humana</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Alertas nuevas", "Sellos locales", "Kits revisables"].map((label, index) => (
                <div className="rounded-md border border-border bg-neutral-50 p-3" key={label}>
                  <p className="text-xs font-semibold text-neutral-600">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {["24", "18", "7"][index]}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 min-h-52 rounded-lg border border-border bg-background p-4">
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="grid gap-3">
                  {["Riesgo sugerido", "Evidencia sellada localmente", "Ruta por validar"].map(
                    (item, index) => (
                      <div
                        className="flex items-center justify-between rounded-md border border-border bg-surface-card p-3"
                        key={item}
                      >
                        <span className="text-sm font-semibold text-neutral-700">{item}</span>
                        <Badge variant={index === 1 ? "success" : "brand"}>Demo</Badge>
                      </div>
                    )
                  )}
                </div>
                <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm leading-6 text-neutral-700">
                  La IA asiste. La autoridad competente valida. La persona protegida revisa antes
                  de enviar.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-standard py-16" id="funciona">
        <div className="max-w-3xl">
          <Badge variant="neutral">Tres modulos</Badge>
          <h2 className="mt-4 text-3xl font-bold text-foreground">
            Una plataforma civica, legal y tecnica
          </h2>
          <p className="mt-3 leading-7 text-neutral-700">
            Yaocíhuatl separa observación institucional, sello forense y orientación asistida para
            evitar decisiones automatizadas y preservar la trazabilidad.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Card key={module.title}>
                <CardHeader>
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface-card py-16">
        <div className="container-standard">
          <h2 className="text-3xl font-bold text-foreground">Flujo institucional</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {flow.map((step, index) => (
              <div className="rounded-lg border border-border bg-background p-5" key={step}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-bold text-foreground">{step}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  Paso simulado con revision, consentimiento y bitacora auditable.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-standard grid gap-6 py-16 lg:grid-cols-3">
        {[
          {
            title: "Privacidad y consentimiento",
            text: "Nada se sube automaticamente. La persona protegida revisa antes de enviar y puede guardar localmente.",
            icon: Lock
          },
          {
            title: "Uso institucional",
            text: "Las autoridades ven alertas sugeridas, trazabilidad y paneles de decision humana.",
            icon: Route
          },
          {
            title: "Accesibilidad y seguridad",
            text: "Contraste AA, foco visible, salida rapida, lenguaje claro y estados que no dependen solo del color.",
            icon: CheckCircle2
          }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardHeader>
                <Icon aria-hidden="true" className="h-6 w-6 text-primary" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.text}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <section className="border-t border-border bg-surface-soft py-12">
        <div className="container-standard flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="brand">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Hackathón
            </Badge>
            <h2 className="mt-4 text-2xl font-bold text-foreground">Lista para demo segura</h2>
          </div>
          <Button asChild>
            <Link href="/demo">Elegir rol demo</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-surface-card">
        <div className="container-standard flex flex-col gap-2 py-8 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
          <span>Apache 2.0 previsto</span>
          <span>Hackathón de Ciberdemocracia 2026</span>
          <span>Equipo LexHackers</span>
        </div>
      </footer>
    </main>
  );
}
