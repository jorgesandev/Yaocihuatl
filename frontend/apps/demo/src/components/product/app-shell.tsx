"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock,
  Copy,
  EyeOff,
  FileLock2,
  Lock,
  MoreHorizontal,
  Route,
  Shield,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  alertTrend,
  authoritySuggestion,
  conductDistribution,
  custodyEvents,
  evidences,
  extractedInfo,
  navItemsByRole,
  platformDistribution,
  publicMetrics,
  publicTrend,
  roleLabels,
  vpmrgTest
} from "@/lib/mock-data";
import type { DemoRole, EvidenceStatus, PrivacyState, RiskLevel } from "@/lib/types";
import { cn, shortHash } from "@/lib/utils";

interface PanicExitButtonProps {
  className?: string;
}

export function PanicExitButton({ className }: PanicExitButtonProps) {
  function handleExit() {
    window.sessionStorage.clear();
    window.localStorage.removeItem("yaocihuatl-demo-role");
    window.location.assign("/safe-exit");
  }

  return (
    <Button
      aria-label="Salida rápida de la pantalla actual"
      className={className}
      onClick={handleExit}
      size="sm"
      type="button"
      variant="outline"
    >
      <EyeOff aria-hidden="true" className="h-4 w-4" />
      Salida rápida
    </Button>
  );
}

interface TopBarProps {
  role: DemoRole;
}

export function TopBar({ role }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-bold leading-tight">Yaocíhuatl</span>
            <span className="hidden text-xs text-neutral-600 sm:block">
              Tlachia observa · Machiyotl sella · Chimalli protege
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="brand">Demo</Badge>
          <Badge className="hidden sm:inline-flex" variant="neutral">
            {roleLabels[role]}
          </Badge>
          <PanicExitButton className="hidden sm:inline-flex" />
        </div>
      </div>
    </header>
  );
}

interface SidebarNavProps {
  role: DemoRole;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const items = navItemsByRole[role];

  return (
    <aside className="hidden border-r border-border bg-surface-card lg:block">
      <nav aria-label="Navegacion principal" className="sticky top-16 space-y-2 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100",
                isActive && "bg-secondary text-secondary-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

interface BottomNavProps {
  role: DemoRole;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = navItemsByRole[role].slice(0, 4);

  return (
    <nav
      aria-label="Navegacion inferior"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-card px-2 py-2 lg:hidden"
    >
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-sm px-1 text-center text-xs font-semibold text-neutral-600",
                isActive && "bg-secondary text-secondary-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span className="line-clamp-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

interface AppShellProps {
  role: DemoRole;
  children: ReactNode;
}

export function AppShell({ role, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar role={role} />
      <div className="grid lg:grid-cols-[280px_1fr]">
        <SidebarNav role={role} />
        <main className="min-w-0 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </main>
      </div>
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        <PanicExitButton />
      </div>
      <BottomNav role={role} />
    </div>
  );
}

interface RoleGateProps {
  role: DemoRole;
  children: ReactNode;
}

export function RoleGate({ role, children }: RoleGateProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-card px-4 py-3 text-sm text-neutral-700">
        <Shield aria-hidden="true" className="h-4 w-4 text-primary" />
        Vista demo para: <strong className="text-foreground">{roleLabels[role]}</strong>
        <span className="text-neutral-500">Sin autenticacion real ni permisos definitivos.</span>
      </div>
      {children}
    </div>
  );
}

const riskMap: Record<
  RiskLevel,
  {
    variant: "success" | "warning" | "danger" | "neutral";
    icon: typeof ShieldCheck;
    defaultLabel: string;
  }
> = {
  low: { variant: "success", icon: ShieldCheck, defaultLabel: "Riesgo bajo sugerido" },
  medium: { variant: "warning", icon: AlertCircle, defaultLabel: "Riesgo medio sugerido" },
  high: { variant: "danger", icon: AlertTriangle, defaultLabel: "Riesgo alto sugerido" },
  unknown: { variant: "neutral", icon: CircleHelp, defaultLabel: "Sin clasificar" }
};

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const config = riskMap[level];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label ?? config.defaultLabel}
    </Badge>
  );
}

interface AIAssistBadgeProps {
  label?: string;
}

export function AIAssistBadge({ label = "Sugerencia generada por IA" }: AIAssistBadgeProps) {
  return (
    <Badge variant="brand">
      <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}

interface RiskScoreCardProps {
  title: string;
  value: string;
  trend: string;
  context: string;
  level?: RiskLevel;
}

export function RiskScoreCard({
  title,
  value,
  trend,
  context,
  level = "unknown"
}: RiskScoreCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-600">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-foreground">{value}</p>
        </div>
        <RiskBadge level={level} />
      </div>
      <p className="mt-3 text-sm font-semibold text-primary">{trend}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-600">{context}</p>
    </Card>
  );
}

interface AlertExplainabilityPanelProps {
  signals: string[];
}

export function AlertExplainabilityPanel({ signals }: AlertExplainabilityPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Por qué se generó esta alerta</CardTitle>
          <AIAssistBadge />
        </div>
        <CardDescription>
          Senales tecnicas y contextuales detectadas en datos demo. Requiere validacion humana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {signals.map((signal) => (
            <li className="flex gap-3 text-sm leading-6 text-neutral-700" key={signal}>
              <CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface HashBlockProps {
  algorithm: string;
  hash: string;
}

export function HashBlock({ algorithm, hash }: HashBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-md border border-border bg-neutral-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-neutral-600">{algorithm}</p>
          <p className="mt-1 font-mono text-sm text-foreground">{shortHash(hash)}</p>
        </div>
        <Button
          aria-label="Copiar hash SHA-256 de la evidencia"
          onClick={handleCopy}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Copy aria-hidden="true" className="h-4 w-4" />
          {copied ? "Hash copiado" : "Copiar hash"}
        </Button>
      </div>
    </div>
  );
}

interface CustodyTimelineProps {
  events?: typeof custodyEvents;
}

export function CustodyTimeline({ events = custodyEvents }: CustodyTimelineProps) {
  return (
    <ol className="space-y-4">
      {events.map((event, index) => (
        <li className="grid grid-cols-[32px_1fr] gap-3" key={`${event.title}-${event.timestamp}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-card">
            {index < events.length - 1 ? (
              <Check aria-hidden="true" className="h-4 w-4 text-success-700" />
            ) : (
              <Clock aria-hidden="true" className="h-4 w-4 text-warning-700" />
            )}
          </span>
          <span className="min-w-0 border-b border-border pb-4">
            <span className="block text-sm font-bold text-foreground">{event.title}</span>
            <span className="mt-1 block text-xs font-semibold text-neutral-600">
              {event.timestamp} · {event.actor}
            </span>
            <span className="mt-1 block text-sm leading-6 text-neutral-700">
              {event.description}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PrivacyNoticeCard() {
  return (
    <Card className="border-brand-200 bg-brand-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock aria-hidden="true" className="h-5 w-5 text-primary" />
          Privacidad y consentimiento
        </CardTitle>
        <CardDescription>
          Esta demo no sube evidencia automaticamente. Puedes revisar, guardar y continuar despues.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 text-sm leading-6 text-neutral-700 sm:grid-cols-2">
          <p>La informacion sensible permanece local hasta una accion expresa.</p>
          <p>La IA organiza y sugiere; una autoridad humana debe revisar.</p>
          <p>Los datos demo son ficticios, anonimizados y no corresponden a casos reales.</p>
          <p>La salida rapida redirige a una pagina neutral sin confirmacion.</p>
        </div>
      </CardContent>
    </Card>
  );
}

const evidenceStatusMap: Record<
  EvidenceStatus,
  { label: string; variant: "neutral" | "success" | "info" | "warning" | "danger" }
> = {
  draft: { label: "Sin sellar", variant: "neutral" },
  "sealed-local": { label: "Sellado local", variant: "success" },
  ready: { label: "Listo para revision", variant: "info" },
  submitted: { label: "Enviado a revision", variant: "success" },
  error: { label: "Requiere atencion", variant: "warning" }
};

const privacyMap: Record<PrivacyState, string> = {
  "local-only": "Solo en este dispositivo",
  "not-uploaded": "No enviado",
  encrypted: "Cifrado",
  "ready-to-send": "Listo para revision",
  submitted: "Enviado a autoridad"
};

interface EvidenceCardProps {
  evidence: (typeof evidences)[number];
  compact?: boolean;
}

export function EvidenceCard({ evidence, compact = false }: EvidenceCardProps) {
  const status = evidenceStatusMap[evidence.status];

  return (
    <Card className={cn("p-4", compact && "shadow-none")}>
      <div className="grid gap-4 sm:grid-cols-[96px_1fr]">
        <div className="flex h-24 items-center justify-center rounded-md border border-border bg-neutral-100">
          <FileLock2 aria-hidden="true" className="h-8 w-8 text-neutral-500" />
          <span className="sr-only">Vista previa difuminada por privacidad</span>
        </div>
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-foreground">{evidence.title}</h3>
              <p className="text-sm leading-6 text-neutral-600">
                {evidence.type} · {evidence.platform} · {evidence.date}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              <Badge variant="neutral">{privacyMap[evidence.privacy]}</Badge>
            </div>
          </div>
          <HashBlock algorithm="SHA-256" hash={evidence.hash} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-700">
            <span>Estado de envio: {evidence.uploadStatus}</span>
            <span>Cadena de custodia: {evidence.custody}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" type="button" variant="secondary">
              Ver
            </Button>
            <Button size="sm" type="button" variant="outline">
              Agregar nota
            </Button>
            <Button size="sm" type="button" variant="destructive">
              Quitar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function EvidenceTray() {
  return (
    <Card className="p-4">
      <CardHeader className="mb-3">
        <CardTitle className="text-base">Evidencia adjunta</CardTitle>
        <CardDescription>Solo elementos demo. Nada se envia automaticamente.</CardDescription>
      </CardHeader>
      <div className="space-y-3">
        {evidences.slice(0, 2).map((evidence) => (
          <div
            className="rounded-md border border-border bg-neutral-50 p-3"
            key={evidence.id}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{evidence.title}</p>
                <p className="text-xs text-neutral-600">{shortHash(evidence.hash)}</p>
              </div>
              <Badge variant="success">Sellado local</Badge>
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-4 w-full" type="button" variant="secondary">
        Agregar evidencia
      </Button>
    </Card>
  );
}

export function ConsentStepper() {
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState([false, false, false]);
  const steps = [
    "Contexto y rol",
    "Privacidad y uso de datos",
    "Consentimiento",
    "Opciones de seguridad",
    "Comenzar"
  ];
  const ready = checks.every(Boolean);

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <Badge variant="brand">Onboarding demo</Badge>
        <CardTitle>Antes de comenzar</CardTitle>
        <CardDescription>
          Este flujo explica limites, privacidad y revision humana antes de cualquier envio demo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-2 sm:grid-cols-5">
          {steps.map((item, index) => (
            <button
              className={cn(
                "min-h-11 rounded-md border border-border px-3 text-left text-xs font-semibold text-neutral-600",
                index === step && "border-primary bg-secondary text-secondary-foreground"
              )}
              key={item}
              onClick={() => setStep(index)}
              type="button"
            >
              {index + 1}. {item}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-neutral-50 p-4">
          <h2 className="text-xl font-bold text-foreground">{steps[step]}</h2>
          {step === 0 ? (
            <p className="mt-3 leading-7 text-neutral-700">
              Estás en una experiencia demo para mujer protegida. Puedes capturar evidencia,
              guardarla localmente y preparar una revision antes de enviarla.
            </p>
          ) : null}
          {step === 1 ? (
            <div className="mt-3 grid gap-3 text-sm leading-6 text-neutral-700 sm:grid-cols-2">
              <p>No se sube evidencia automaticamente.</p>
              <p>Todo hash, PDF y envio es simulado.</p>
              <p>La IA no decide ni confirma hechos.</p>
              <p>La autoridad humana revisa cualquier expediente.</p>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="mt-4 space-y-4">
              {[
                "Entiendo que informacion sera utilizada.",
                "Entiendo que puedo revisar antes de enviar.",
                "Autorizo el tratamiento de mis datos para este flujo demo."
              ].map((label, index) => (
                <label className="flex items-start gap-3 text-sm leading-6" key={label}>
                  <Checkbox
                    checked={checks[index]}
                    onCheckedChange={(checked) => {
                      const next = [...checks];
                      next[index] = checked === true;
                      setChecks(next);
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          ) : null}
          {step === 3 ? (
            <div className="mt-3 grid gap-3 text-sm leading-6 text-neutral-700 sm:grid-cols-2">
              <p>Salida rápida visible durante flujos sensibles.</p>
              <p>Guardar y continuar despues disponible en captura.</p>
              <p>Miniaturas sensibles ocultas por defecto.</p>
              <p>Preferencias de notificacion solo mock.</p>
            </div>
          ) : null}
          {step === 4 ? (
            <p className="mt-3 leading-7 text-neutral-700">
              Puedes iniciar Machiyotl para sellar evidencia demo o Chimalli para recibir
              orientacion procedimental. Todo permanece revisable.
            </p>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          type="button"
          variant="outline"
        >
          Volver
        </Button>
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
            type="button"
          >
            Continuar
          </Button>
        ) : !ready ? (
          <Button disabled type="button">
            Comenzar
          </Button>
        ) : (
          <Button asChild>
            <Link href="/app/machiyotl">Comenzar</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function EvidenceCaptureStepper() {
  const [step, setStep] = useState(0);
  const steps = [
    "Inicio",
    "Fuente",
    "Archivo/enlace",
    "Contexto opcional",
    "Sello local",
    "Revision",
    "Guardar o continuar"
  ];
  const activeEvidence = evidences[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge variant="success">Solo en este dispositivo</Badge>
              <CardTitle className="mt-3">Captura Machiyotl</CardTitle>
            </div>
            <Badge variant="neutral">
              Paso {step + 1} de {steps.length}
            </Badge>
          </div>
          <CardDescription>
            Flujo mobile-first para preparar evidencia demo sin subir contenido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-2 sm:grid-cols-7">
            {steps.map((item, index) => (
              <button
                aria-label={`Ir al paso ${index + 1}: ${item}`}
                className={cn(
                  "min-h-10 rounded-sm border border-border px-2 text-xs font-semibold text-neutral-600",
                  index === step && "border-primary bg-secondary text-secondary-foreground"
                )}
                key={item}
                onClick={() => setStep(index)}
                type="button"
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-neutral-50 p-4">
            <h2 className="text-xl font-bold text-foreground">{steps[step]}</h2>
            {step === 0 ? (
              <div className="mt-4 space-y-4">
                <PrivacyNoticeCard />
                <p className="text-sm leading-6 text-neutral-700">
                  Inicia una captura demo. Puedes guardar localmente o continuar a Chimalli.
                </p>
              </div>
            ) : null}
            {step === 1 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Publicacion publica", "Imagen local", "URL", "Nota contextual"].map((item) => (
                  <button
                    className="min-h-20 rounded-md border border-border bg-surface-card p-4 text-left font-semibold hover:bg-secondary"
                    key={item}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
            {step === 2 ? (
              <div className="mt-4 space-y-4">
                <Field
                  helper="No se realizara carga real. Este campo simula una URL publica."
                  id="evidence-url"
                  label="URL o referencia"
                >
                  <Input
                    aria-describedby="evidence-url-helper"
                    id="evidence-url"
                    placeholder="https://plataforma-demo.example/publicacion"
                  />
                </Field>
                <div className="flex min-h-36 flex-col items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-card p-6 text-center">
                  <FileLock2 aria-hidden="true" className="h-8 w-8 text-neutral-500" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Screenshot mock seleccionado
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Vista previa difuminada por privacidad.
                  </p>
                </div>
              </div>
            ) : null}
            {step === 3 ? (
              <Field
                helper="Este contexto se puede editar antes de enviar."
                id="evidence-context"
                label="Contexto opcional"
              >
                <Textarea
                  aria-describedby="evidence-context-helper"
                  id="evidence-context"
                  placeholder="Describe brevemente por que esta evidencia es relevante."
                />
              </Field>
            ) : null}
            {step === 4 ? (
              <div className="mt-4 space-y-4">
                <HashBlock algorithm="SHA-256" hash={activeEvidence.hash} />
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <Badge variant="success">Sellado local</Badge>
                  <Badge variant="neutral">No enviado</Badge>
                  <Badge variant="success">Cifrado</Badge>
                  <Badge variant="info">PDF forense demo preparado</Badge>
                </div>
                <div className="flex h-28 w-28 items-center justify-center rounded-md border border-border bg-surface-card font-mono text-xs">
                  QR demo
                </div>
              </div>
            ) : null}
            {step === 5 ? (
              <div className="mt-4 space-y-4">
                <EvidenceCard compact evidence={activeEvidence} />
                <CustodyTimeline />
              </div>
            ) : null}
            {step === 6 ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-md border border-success-100 bg-success-100 p-4 text-sm leading-6 text-success-700">
                  Evidencia guardada localmente en modo demo. Puedes continuar a Chimalli o revisar
                  antes de enviar.
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/app/chimalli">Continuar a Chimalli</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/app/evidence">Guardar localmente</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            type="button"
            variant="outline"
          >
            Volver
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary">
              Guardar y continuar despues
            </Button>
            <Button
              onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
              type="button"
            >
              {step < 4 ? "Continuar" : step === 4 ? "Revisar antes de enviar" : "Sellar evidencia"}
            </Button>
          </div>
        </CardFooter>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Metadatos demo</CardTitle>
            <CardDescription>Informacion tecnica visible antes de cualquier envio.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {[
                ["Fecha de captura", activeEvidence.date],
                ["Plataforma", activeEvidence.platform],
                ["Archivo", "screenshot-demo.png"],
                ["Estado local", "Sellado local"],
                ["Upload status", "No enviado"]
              ].map(([label, value]) => (
                <div className="flex justify-between gap-3 border-b border-border pb-2" key={label}>
                  <dt className="font-semibold text-neutral-600">{label}</dt>
                  <dd className="text-right text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <PrivacyNoticeCard />
      </div>
    </div>
  );
}

interface ChatMessageProps {
  author: "assistant" | "user";
  content: string;
}

export function ChatMessage({ author, content }: ChatMessageProps) {
  const isAssistant = author === "assistant";

  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[72ch] rounded-lg border px-4 py-3 text-sm leading-6",
          isAssistant
            ? "border-border bg-surface-card text-foreground"
            : "border-brand-200 bg-secondary text-secondary-foreground"
        )}
      >
        {isAssistant ? (
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-600">
            <Bot aria-hidden="true" className="h-4 w-4" />
            Chimalli
          </div>
        ) : null}
        {content}
      </div>
    </div>
  );
}

interface QuickReplyChipsProps {
  replies?: string[];
  onPick?: (reply: string) => void;
}

export function QuickReplyChips({
  replies = [
    "Agregar evidencia",
    "No se que autoridad corresponde",
    "Necesito guardar y continuar despues",
    "Quiero revisar antes de enviar",
    "Explicalo en palabras simples"
  ],
  onPick
}: QuickReplyChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {replies.map((reply) => (
        <Button
          key={reply}
          onClick={() => onPick?.(reply)}
          size="sm"
          type="button"
          variant="secondary"
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}

export function ChimalliChat() {
  const [messages, setMessages] = useState<
    Array<{ author: "assistant" | "user"; content: string }>
  >([
    {
      author: "assistant" as const,
      content:
        "Hola. Soy Chimalli. Puedo ayudarte a ordenar una narrativa, identificar elementos preliminares y preparar informacion para revision humana. No sustituyo asesoria legal ni decido si existe una infraccion."
    },
    {
      author: "assistant" as const,
      content:
        "Si quieres empezar, cuentame que ocurrio, en que plataforma paso y si esta relacionado con un cargo, candidatura o actividad politica."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamicExtractedInfo, setDynamicExtractedInfo] = useState(extractedInfo);
  const [dynamicVpmrgTest, setDynamicVpmrgTest] = useState(vpmrgTest);
  const [hasCaseContext, setHasCaseContext] = useState(false);

  function answerLocally(message: string): string | null {
    const normalized = message
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const compact = normalized.replace(/[¿?¡!.,;:]/g, "").trim();

    if (["hola", "hola?", "buenos dias", "buenas tardes", "buenas noches"].includes(compact)) {
      return "Hola. Estoy contigo. Puedo ayudarte a ordenar lo ocurrido paso a paso; si aun no quieres contar detalles, tambien puedes decirme que necesitas entender primero.";
    }

    if (
      compact.includes("quien eres") ||
      compact.includes("que eres") ||
      compact.includes("como funcionas")
    ) {
      return "Soy Chimalli, un asistente de orientacion dentro de Yaocihuatl. Ayudo a estructurar informacion, revisar evidencia adjunta y preparar un borrador para revision humana. No soy autoridad, no presento denuncias automaticamente y no determino culpabilidad.";
    }

    if (compact === "agregar evidencia") {
      return "Puedes agregar evidencia desde Machiyotl o desde la bandeja lateral. La evidencia debe permanecer revisable: primero se sella localmente, luego decides si se incluye en el kit.";
    }

    if (compact === "no se que autoridad corresponde") {
      return "No pasa nada si no sabes que autoridad corresponde. Chimalli puede sugerir una ruta preliminar cuando compartas contexto suficiente, y esa sugerencia debe validarla una persona autorizada.";
    }

    if (compact === "necesito guardar y continuar despues") {
      return "Puedes guardar y continuar despues. La idea es que no tengas que completar todo en una sola sesion ni enviar informacion sin revisarla.";
    }

    if (compact === "quiero revisar antes de enviar") {
      return "Ese es el paso correcto. Antes de enviar, revisa narrativa, evidencia incluida, metadatos, autoridad sugerida y que informacion se mantiene local.";
    }

    if (compact === "explicalo en palabras simples" && !hasCaseContext) {
      return "En simple: tu cuentas que paso, Machiyotl ayuda a preservar evidencia, y Chimalli organiza la informacion para que una autoridad humana pueda revisarla. Nada se decide automaticamente.";
    }

    return null;
  }

  async function sendMessage(message: string) {
    if (!message.trim() || isLoading) {
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const outgoing = message.trim();
    setError(null);
    setInput("");
    setMessages((current) => [...current, { author: "user", content: outgoing }]);

    const localReply = answerLocally(outgoing);
    if (localReply) {
      setMessages((current) => [...current, { author: "assistant", content: localReply }]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/v1/chimalli/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: outgoing,
          integration: {
            tlachia_alert_id: "demo-alert-001",
            source_platform: "Plataforma demo A",
            risk_level: "high",
            machiyotl_evidence_hashes: [evidences[0]?.hash ?? "sha256:demo"],
            evidence_status: "sealed_local"
          }
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo solicitar orientacion. Tu informacion sigue en esta pantalla.");
      }

      const payload = (await response.json()) as {
        reply: string;
        case: {
          victim: {
            role: string | null;
            position: string | null;
            state: string | null;
            municipality: string | null;
          };
          facts: { platform: string | null };
          vpmrg_test: {
            political_electoral_link: { reason: string };
            gender_element: { reason: string };
            political_rights_impact: { reason: string };
            overall_result: string;
          };
        };
      };

      setMessages((current) => [
        ...current,
        {
          author: "assistant",
          content:
            payload.reply ||
            "Chimalli devolvio una respuesta sin contenido. Requiere revision humana."
        }
      ]);
      setHasCaseContext(true);

      setDynamicExtractedInfo([
        {
          label: "Contexto politico",
          value: payload.case.victim.role ?? "Sin dato",
          state: "Sugerido"
        },
        {
          label: "Cargo o posicion",
          value: payload.case.victim.position ?? "Sin dato",
          state: "Editable"
        },
        {
          label: "Plataforma",
          value: payload.case.facts.platform ?? "Sin dato",
          state: "Sugerido"
        },
        {
          label: "Municipio",
          value:
            payload.case.victim.municipality ??
            payload.case.victim.state ??
            "Sin dato",
          state: "Pendiente"
        }
      ]);

      setDynamicVpmrgTest([
        {
          element: "Contexto politico-electoral",
          result: "Podria corresponder",
          note: payload.case.vpmrg_test.political_electoral_link.reason
        },
        {
          element: "Conducta basada en genero",
          result: "Sugerencia IA",
          note: payload.case.vpmrg_test.gender_element.reason
        },
        {
          element: "Impacto en derechos politicos",
          result: payload.case.vpmrg_test.overall_result,
          note: payload.case.vpmrg_test.political_rights_impact.reason
        }
      ]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo conectar con Chimalli en este momento."
      );
      setMessages((current) => [
        ...current,
        {
          author: "assistant",
          content:
            "No fue posible conectar con el backend de Chimalli. Tu informacion sigue en esta pantalla; puedes guardar y reintentar antes de enviar cualquier cosa."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="min-h-[680px]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Chimalli</CardTitle>
              <CardDescription>
                Orientacion procedimental con asistencia de IA y revision humana antes de enviar.
              </CardDescription>
            </div>
            <AIAssistBadge />
          </div>
        </CardHeader>
        <CardContent className="flex min-h-[520px] flex-col justify-between">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                author={message.author}
                content={message.content}
                key={`${message.author}-${index}`}
              />
            ))}
          </div>
          <div className="mt-6 space-y-4 border-t border-border pt-4">
            <QuickReplyChips
              onPick={(reply) => {
                void sendMessage(reply);
              }}
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field
                helper="No incluyas datos sensibles innecesarios en esta demo."
                id="chat-composer"
                label="Respuesta"
              >
                <Input
                  aria-describedby="chat-composer-helper"
                  id="chat-composer"
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Escribe una respuesta o usa una opcion rapida"
                  value={input}
                />
              </Field>
              <Button
                className="self-end"
                disabled={isLoading || input.trim().length === 0}
                onClick={() => {
                  void sendMessage(input);
                }}
                type="button"
              >
                {isLoading ? "Enviando..." : "Enviar respuesta"}
              </Button>
            </div>
            {error ? (
              <p className="rounded-md border border-warning-100 bg-warning-100 p-3 text-sm text-warning-700">
                {error}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informacion extraida</CardTitle>
            <CardDescription>Editable antes de cualquier envio.</CardDescription>
          </CardHeader>
          <CardContent>
            {dynamicExtractedInfo.map((item) => (
              <div className="border-b border-border py-3 last:border-0" key={item.label}>
                <p className="text-xs font-semibold text-neutral-600">{item.label}</p>
                <p className="mt-1 text-sm font-bold text-foreground">{item.value}</p>
                <Badge className="mt-2" variant="brand">
                  {item.state}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <EvidenceTray />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test VPMRG simulado</CardTitle>
            <CardDescription>No confirma hechos ni sustituye revision legal.</CardDescription>
          </CardHeader>
          <CardContent>
            {dynamicVpmrgTest.map((item) => (
              <div className="border-b border-border py-3 last:border-0" key={item.element}>
                <p className="text-sm font-bold text-foreground">{item.element}</p>
                <p className="mt-1 text-sm text-neutral-700">{item.note}</p>
                <Badge className="mt-2" variant="warning">
                  {item.result}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <AuthorityRoutingCard />
      </aside>
    </div>
  );
}

export function EvidenceKitSummary() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Kit de evidencia demo</CardTitle>
            <CardDescription>
              Revision formal antes de exportar o enviar a revision humana.
            </CardDescription>
          </div>
          <Badge variant="warning">Pendiente de revision humana</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-border bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-600">Que sera enviado</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Resumen, evidencias seleccionadas, metadatos y narrativa revisada.
            </p>
          </div>
          <div className="rounded-md border border-border bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-600">A quien se enviaria</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Autoridad electoral competente demo, pendiente de validacion.
            </p>
          </div>
          <div className="rounded-md border border-border bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-600">Que permanece local</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Archivos originales y notas privadas hasta aprobacion expresa.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AuthorityRoutingCard() {
  return (
    <Card className="border-brand-200 bg-brand-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Route aria-hidden="true" className="h-5 w-5 text-primary" />
          {authoritySuggestion.title}
        </CardTitle>
        <CardDescription>{authoritySuggestion.status}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-bold text-foreground">{authoritySuggestion.authority}</p>
        <p className="mt-2 text-sm leading-6 text-neutral-700">{authoritySuggestion.basis}</p>
      </CardContent>
    </Card>
  );
}

export function HumanReviewPanel() {
  return (
    <Card className="border-warning-100 bg-warning-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="h-5 w-5 text-warning-700" />
          Decision humana requerida
        </CardTitle>
        <CardDescription className="text-warning-700">
          La IA solo organiza informacion y sugiere rutas. Una persona autorizada debe motivar
          cualquier accion.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button">Aceptar para revision</Button>
          <Button type="button" variant="secondary">
            Solicitar mas informacion
          </Button>
          <Button type="button" variant="outline">
            Canalizar a autoridad competente
          </Button>
          <Button type="button" variant="destructive">
            Cerrar con motivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AuditLogTableProps {
  logs: Array<{ time: string; actor: string; action: string; detail: string }>;
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-card">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-neutral-100 text-xs font-semibold text-neutral-700">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Accion</th>
            <th className="px-4 py-3">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr className="border-t border-border" key={`${log.time}-${log.action}`}>
              <td className="px-4 py-3 font-mono text-xs text-neutral-700">{log.time}</td>
              <td className="px-4 py-3 text-neutral-700">{log.actor}</td>
              <td className="px-4 py-3 font-semibold text-foreground">{log.action}</td>
              <td className="px-4 py-3 text-neutral-700">{log.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AlertsLineChart() {
  return (
    <ChartCard title="Alertas en el tiempo" subtitle="Periodo demo: ultimos 7 dias · Fuente mock">
      <ResponsiveContainer height={280} width="100%">
        <LineChart data={alertTrend} margin={{ left: 0, right: 12, top: 12 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" stroke="var(--neutral-600)" />
          <YAxis stroke="var(--neutral-600)" />
          <Tooltip />
          <Line
            dataKey="alertas"
            name="Alertas sugeridas"
            stroke="var(--primary)"
            strokeWidth={3}
            type="monotone"
          />
          <Line
            dataKey="revision"
            name="En revision humana"
            stroke="var(--warning-700)"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PlatformBarChart() {
  return (
    <ChartCard title="Distribucion por plataforma" subtitle="Datos anonimizados demo">
      <ResponsiveContainer height={280} width="100%">
        <BarChart data={platformDistribution} margin={{ left: 0, right: 12, top: 12 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="platform" stroke="var(--neutral-600)" />
          <YAxis stroke="var(--neutral-600)" />
          <Tooltip />
          <Bar dataKey="alertas" fill="var(--primary)" name="Alertas" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ClusterNetworkMock() {
  const nodes = [
    "Cuenta 04",
    "Cuenta 12",
    "Cuenta 19",
    "Cuenta 22",
    "Cuenta 31",
    "Cuenta 35"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coordinacion aparente</CardTitle>
        <CardDescription>Representacion visual simple. No identifica personas reales.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-72 rounded-lg border border-border bg-neutral-50 p-4">
          <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-brand-200 bg-brand-100 text-center text-xs font-bold text-brand-800">
            Cluster demo
          </div>
          {nodes.map((node, index) => {
            const positions = [
              "left-8 top-8",
              "right-8 top-10",
              "left-14 bottom-10",
              "right-16 bottom-8",
              "left-1/2 top-4 -translate-x-1/2",
              "left-1/2 bottom-4 -translate-x-1/2"
            ];

            return (
              <div
                className={cn(
                  "absolute rounded-full border border-border bg-surface-card px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm",
                  positions[index]
                )}
                key={node}
              >
                {node}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicMetricsDashboard() {
  const pieColors = [
    "var(--primary)",
    "var(--success-700)",
    "var(--warning-700)",
    "var(--info-700)"
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {publicMetrics.map((metric) => (
          <Card className="p-4" key={metric.label}>
            <p className="text-sm font-semibold text-neutral-600">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{metric.value}</p>
            <p className="mt-1 text-xs leading-5 text-neutral-600">{metric.context}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Alertas por periodo"
          subtitle="Datos publicos agregados · Fuente mock"
        >
          <ResponsiveContainer height={300} width="100%">
            <LineChart data={publicTrend} margin={{ left: 0, right: 12, top: 12 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--neutral-600)" />
              <YAxis stroke="var(--neutral-600)" />
              <Tooltip />
              <Line
                dataKey="alertas"
                name="Alertas agregadas"
                stroke="var(--primary)"
                strokeWidth={3}
              />
              <Line
                dataKey="canalizadas"
                name="Canalizacion sugerida"
                stroke="var(--success-700)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Tipos de conducta detectada"
          subtitle="Categorias sinteticas sin publicaciones textuales"
        >
          <ResponsiveContainer height={300} width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={conductDistribution}
                dataKey="value"
                label={({ type }) => type}
                nameKey="type"
                outerRadius={96}
              >
                {conductDistribution.map((entry, index) => (
                  <Cell fill={pieColors[index % pieColors.length]} key={entry.type} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export function StateGallery() {
  const states = [
    ["Loading", "Preparando vista demo"],
    ["Empty state", "Aun no hay evidencia guardada"],
    ["Error state", "No se pudo completar la accion. Tu informacion sigue segura."],
    ["Success toast", "Guardado localmente"],
    ["Warning alert", "Pendiente de revision humana"]
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estados visuales mock</CardTitle>
        <CardDescription>Patrones de carga, vacio, error, exito y advertencia.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {states.map(([label, description], index) => (
            <div className="rounded-md border border-border bg-neutral-50 p-3" key={label}>
              <p className="text-sm font-bold text-foreground">{label}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-600">{description}</p>
              {index === 0 ? (
                <MoreHorizontal aria-hidden="true" className="mt-3 h-5 w-5 text-primary" />
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
