import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileLock2,
  Github,
  Linkedin,
  Lock,
  Route,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";

import { BrandLogo } from "@/components/product/brand-logo";
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
    nahuatl: "Tlachia",
    meaning: "Observar",
    description:
      "Monitoreo institucional de alertas, patrones de coordinación, explicabilidad algorítmica y bitácora auditable.",
    icon: Eye,
    accentClass: "bg-info-100 text-info-700",
    features: ["Panel de riesgo con niveles asistivos", "Explicabilidad por señal detectada", "Exportación de reportes institucionales"]
  },
  {
    title: "Machiyotl sella",
    nahuatl: "Machiyotl",
    meaning: "Sellar / Marcar",
    description:
      "Captura forense con hash SHA-256 local, preservación de metadatos y cadena de custodia auditaable.",
    icon: FileLock2,
    accentClass: "bg-success-100 text-success-700",
    features: ["Sello SHA-256 sin subir el archivo", "Cadena de custodia electrónica", "Captura offline-first (PWA)"]
  },
  {
    title: "Chimalli protege",
    nahuatl: "Chimalli",
    meaning: "Escudo",
    description:
      "Guía conversacional asistida por IA para organizar narrativa, clasificar contexto y preparar un kit revisable.",
    icon: ShieldCheck,
    accentClass: "bg-brand-100 text-brand-700",
    features: ["Orientación procedimental paso a paso", "Extracción contextual con revisión humana", "Generación de kit forense en PDF"]
  }
];

const flowSteps = [
  { number: "01", title: "Detección", description: "Tlachia identifica patrones de riesgo en fuentes abiertas con análisis asistivo y explicabilidad." },
  { number: "02", title: "Sello forense", description: "Machiyotl captura evidencia y genera un hash SHA-256 local sin subir archivos sensibles." },
  { number: "03", title: "Orientación legal", description: "Chimalli organiza la narrativa, clasifica el contexto VPMRG y sugiere rutas de canalización." },
  { number: "04", title: "Canalización", description: "El kit revisable se envía a la autoridad competente con la decisión explícita de la persona protegida." },
  { number: "05", title: "Seguimiento", description: "La bitácora auditable registra cada acción institucional con trazabilidad completa." }
];

const trustItems = [
  { label: "5 plataformas", sublabel: "monitoreadas" },
  { label: "SHA-256", sublabel: "por cada evidencia" },
  { label: "0 envíos", sublabel: "sin consentimiento" },
  { label: "WCAG 2.2 AA", sublabel: "accesibilidad" }
];

const developers = [
  {
    name: "Jorge Alejandro Sandoval Romo",
    image: "/jorge.jpeg",
    portfolio: "https://jorgesandoval.dev/",
    linkedin: "https://www.linkedin.com/in/jorgesandev/",
    github: "https://github.com/jorgesandev"
  },
  {
    name: "Jose Gilberto Tellez Montoya",
    image: "/jose.jpeg",
    portfolio: "https://josetellezz.netlify.app/",
    linkedin: "https://www.linkedin.com/in/jose-gilberto-tellez-montoya-785320284/",
    github: "https://github.com/GilbertoTM"
  },
  {
    name: "Rafael Ibarra Beltrán",
    image: "/rafael.jpeg",
    portfolio: "https://rafaelibarra.me/",
    linkedin: "https://www.linkedin.com/in/rafael-ibarra/",
    github: "https://github.com/Rafael-Ibarra-Beltran"
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-standard flex min-h-16 items-center justify-between gap-4">
          <BrandLogo compact />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
            <Link className="text-sm font-semibold text-neutral-600 transition-colors hover:text-foreground" href="#funciona">
              Cómo funciona
            </Link>
            <Link className="text-sm font-semibold text-neutral-600 transition-colors hover:text-foreground" href="#modulos">
              Módulos
            </Link>
            <Link className="text-sm font-semibold text-neutral-600 transition-colors hover:text-foreground" href="#privacidad">
              Privacidad
            </Link>
            <Link className="text-sm font-semibold text-neutral-600 transition-colors hover:text-foreground" href="#equipo">
              Equipo
            </Link>
          </nav>
          <Button asChild size="sm">
            <Link href="/demo">
              Acceder
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-brand-soft border-b border-border">
        <div className="container-standard grid min-h-[calc(100vh-4rem)] content-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-2xl animate-fade-in-up">
            <Badge variant="brand">
              <Shield aria-hidden="true" className="h-3.5 w-3.5" />
              Plataforma institucional de protección digital
            </Badge>
            <div className="mt-6 flex items-center gap-5">
              <Image
                alt="Logo de Yaocíhuatl"
                className="h-20 w-20 shrink-0 object-contain drop-shadow-md"
                height={80}
                src="/yaocihuatl-logo-nb.png"
                width={80}
              />
              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
                Yaocíhuatl
              </h1>
            </div>
            <p className="mt-5 text-xl leading-8 text-neutral-700">
              Detecta, sella y canaliza evidencia de violencia política digital de género con trazabilidad institucional y consentimiento explícito.
            </p>
            <p className="mt-3 text-base font-semibold text-primary">
              Tlachia observa · Machiyotl sella · Chimalli protege
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/demo">
                  Acceder al sistema
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="#funciona">Ver cómo funciona</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="https://github.com/LexHackersClub/Yaocihuatl" rel="noreferrer" target="_blank">
                  GitHub
                  <Github aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {trustItems.map((item) => (
                <div className="flex items-center gap-2" key={item.label}>
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-success-700" />
                  <span className="text-sm text-neutral-700">
                    <strong className="font-semibold text-foreground">{item.label}</strong>{" "}
                    {item.sublabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview */}
          <div
            className="glass-card animate-fade-in-up-delay-1 hidden rounded-xl p-5 shadow-lg lg:block"
            aria-label="Vista previa del panel institucional"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-bold text-foreground">Panel institucional · Tlachia</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-success-600" />
                  En línea · Periodo activo
                </p>
              </div>
              <Badge variant="warning">Revisión humana</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Alertas nuevas", value: "24", trend: "+12%" },
                { label: "Sellos locales", value: "18", trend: "Seguro" },
                { label: "Kits revisables", value: "7", trend: "Pendientes" }
              ].map((item) => (
                <div className="rounded-lg border border-border bg-background p-3" key={item.label}>
                  <p className="text-xs font-semibold text-neutral-600">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold text-primary">{item.trend}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {[
                { label: "Riesgo sugerido", variant: "warning", note: "Pendiente de revisión humana" },
                { label: "Evidencia sellada", variant: "success", note: "Solo en este dispositivo" },
                { label: "Ruta por validar", variant: "brand", note: "Sugerencia de canalización" }
              ].map((item) => (
                <div
                  className="flex items-center justify-between rounded-md border border-border bg-background p-3"
                  key={item.label}
                >
                  <div>
                    <span className="text-sm font-semibold text-neutral-700">{item.label}</span>
                    <p className="mt-0.5 text-xs text-neutral-500">{item.note}</p>
                  </div>
                  <Badge variant={item.variant as "warning" | "success" | "brand"}>
                    {item.variant === "success" ? "Sellado" : item.variant === "warning" ? "Medio" : "Asistivo"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm leading-6 text-neutral-700">
              <Sparkles aria-hidden="true" className="mb-1 h-4 w-4 text-primary" />
              La IA asiste y organiza. La autoridad competente valida. La persona protegida revisa antes de enviar.
            </div>
          </div>
        </div>
      </section>

      {/* Tres módulos */}
      <section className="section-padding border-b border-border" id="modulos">
        <div className="container-standard">
          <div className="max-w-3xl">
            <Badge variant="neutral">Tres módulos</Badge>
            <h2 className="mt-4 text-3xl font-bold text-foreground">
              Una plataforma cívica, legal y técnica
            </h2>
            <p className="mt-3 leading-7 text-neutral-700">
              Yaocíhuatl separa observación institucional, sello forense y orientación asistida para
              preservar la trazabilidad y garantizar el consentimiento en cada paso.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  className="card-hover group flex flex-col rounded-xl border border-border bg-surface-card p-6 shadow-sm transition-all duration-200 hover:border-brand-200"
                  key={module.title}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${module.accentClass}`}>
                    <Icon aria-hidden="true" className="h-7 w-7" />
                  </div>
                  <div className="mt-4">
                    <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
                      {module.nahuatl} · {module.meaning}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-foreground">{module.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-neutral-700">{module.description}</p>
                  <ul className="mt-5 space-y-2">
                    {module.features.map((feature) => (
                      <li className="flex items-start gap-2 text-sm text-neutral-700" key={feature}>
                        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="section-padding border-b border-border bg-surface-card" id="funciona">
        <div className="container-standard">
          <div className="max-w-3xl">
            <Badge variant="neutral">Flujo institucional</Badge>
            <h2 className="mt-4 text-3xl font-bold text-foreground">Cómo funciona</h2>
            <p className="mt-3 leading-7 text-neutral-700">
              Cada paso preserva el consentimiento, la trazabilidad y el control de la persona protegida.
            </p>
          </div>
          <div className="mt-10">
            {/* Timeline horizontal en desktop, vertical en mobile */}
            <div className="grid gap-6 md:grid-cols-5">
              {flowSteps.map((step, index) => (
                <div className="relative flex flex-col" key={step.number}>
                  {index < flowSteps.length - 1 && (
                    <div className="absolute right-0 top-5 hidden h-0.5 w-1/2 translate-x-full bg-brand-200 md:block" />
                  )}
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-sm font-bold text-brand-700">
                    {step.number}
                  </div>
                  <h3 className="mt-4 font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacidad y accesibilidad */}
      <section className="section-padding" id="privacidad">
        <div className="container-standard">
          <div className="max-w-3xl">
            <Badge variant="neutral">Principios</Badge>
            <h2 className="mt-4 text-3xl font-bold text-foreground">Privacidad, consentimiento y accesibilidad</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Privacidad y consentimiento",
                text: "Nada se sube automáticamente. La persona protegida revisa antes de enviar y puede guardar localmente sin compartir con nadie.",
                icon: Lock,
                bullets: ["Almacenamiento local por defecto", "Revisión explícita antes de enviar", "Revocación en cualquier momento"]
              },
              {
                title: "Uso institucional auditado",
                text: "Las autoridades acceden a alertas preventivas, trazabilidad de acciones y paneles de decisión humana con bitácora permanente.",
                icon: Route,
                bullets: ["Bitácora inmutable de acciones", "Distinción entre sugerido y confirmado", "Paneles de revisión humana obligatoria"]
              },
              {
                title: "Accesibilidad y seguridad",
                text: "Contraste WCAG 2.2 AA, foco visible, salida discreta, lenguaje claro y estados que no dependen únicamente del color.",
                icon: ShieldCheck,
                bullets: ["Contraste mínimo 4.5:1 en texto", "Navegación por teclado completa", "Soporte para movimiento reducido"]
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="flex flex-col rounded-xl border border-border bg-surface-card p-6 shadow-sm" key={item.title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-neutral-700">{item.text}</p>
                  <ul className="mt-4 space-y-1.5">
                    {item.bullets.map((bullet) => (
                      <li className="flex items-center gap-2 text-xs text-neutral-600" key={bullet}>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="section-padding border-t border-border bg-surface-soft" id="equipo">
        <div className="container-standard">
          <div className="max-w-3xl">
            <Badge variant="neutral">Equipo</Badge>
            <h2 className="mt-4 text-3xl font-bold text-foreground">
              Ingeniería de software desde la UABC
            </h2>
            <p className="mt-3 leading-7 text-neutral-700">
              Proyecto desarrollado por estudiantes de Ingeniería en Software de la Universidad
              Autónoma de Baja California para el Hackathón de Ciberdemocracia 2026.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {developers.map((developer) => (
              <article
                className="flex flex-col items-center rounded-xl border border-border bg-surface-card p-6 text-center shadow-sm"
                key={developer.name}
              >
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-brand-100 shadow-md">
                  <Image
                    alt={`Retrato de ${developer.name}`}
                    className="h-full w-full object-cover"
                    height={128}
                    src={developer.image}
                    width={128}
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-bold text-foreground">{developer.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-neutral-600">
                    Ing. en Software · Universidad Autónoma de Baja California
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Button
                    asChild
                    aria-label={`Abrir portafolio de ${developer.name}`}
                    size="icon"
                    variant="outline"
                  >
                    <a href={developer.portfolio} rel="noreferrer" target="_blank">
                      <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    aria-label={`Abrir LinkedIn de ${developer.name}`}
                    size="icon"
                    variant="outline"
                  >
                    <a href={developer.linkedin} rel="noreferrer" target="_blank">
                      <Linkedin aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    aria-label={`Abrir GitHub de ${developer.name}`}
                    size="icon"
                    variant="outline"
                  >
                    <a href={developer.github} rel="noreferrer" target="_blank">
                      <Github aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-gradient-to-br from-brand-800 to-brand-600 py-16">
        <div className="container-standard flex flex-col items-center gap-6 text-center">
          <Badge className="border-brand-400 bg-brand-700 text-brand-100">
            <Zap aria-hidden="true" className="h-3.5 w-3.5" />
            Disponible ahora
          </Badge>
          <h2 className="max-w-2xl text-3xl font-bold text-white">
            Comienza a proteger tu derecho a participar en política sin violencia
          </h2>
          <p className="max-w-xl text-base leading-7 text-brand-200">
            Plataforma institucional disponible para mujeres en la vida política, autoridades electorales y observadores ciudadanos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              className="bg-white text-brand-800 hover:bg-brand-50"
              size="lg"
            >
              <Link href="/demo">
                Acceder al sistema
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="border-brand-400 text-white hover:bg-brand-700"
              size="lg"
              variant="outline"
            >
              <a href="https://github.com/LexHackersClub/Yaocihuatl" rel="noreferrer" target="_blank">
                Ver en GitHub
                <Github aria-hidden="true" className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-card">
        <div className="container-standard py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <BrandLogo compact />
              <p className="mt-3 text-xs leading-6 text-neutral-600">
                Plataforma cívica para la detección, certificación forense y canalización legal de violencia política digital de género.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Módulos</p>
              <ul className="mt-3 space-y-2">
                {["Tlachia · Detección", "Machiyotl · Sellado forense", "Chimalli · Orientación"].map((item) => (
                  <li key={item}>
                    <Link className="text-xs text-neutral-600 transition-colors hover:text-foreground" href="/demo">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Institucional</p>
              <ul className="mt-3 space-y-2">
                {["Universidad Autónoma de Baja California", "Hackathón de Ciberdemocracia 2026", "Equipo LexHackers"].map((item) => (
                  <li key={item}>
                    <span className="text-xs text-neutral-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Legal</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link className="text-xs text-neutral-600 transition-colors hover:text-foreground" href="/public">
                    Datos agregados públicos
                  </Link>
                </li>
                <li>
                  <Link className="text-xs text-neutral-600 transition-colors hover:text-foreground" href="/verify">
                    Verificador SHA-256
                  </Link>
                </li>
                <li>
                  <span className="text-xs text-neutral-600">Licencia Apache 2.0</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
            <span>© 2026 Yaocíhuatl · LexHackers · UABC</span>
            <span>Hecho en Baja California, México</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
