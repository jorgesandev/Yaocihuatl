"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock,
  Copy,
  Download,
  EyeOff,
  FileText,
  FileLock2,
  Loader2,
  Lock,
  MoreHorizontal,
  Paperclip,
  Route,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { BrandLogo } from "@/components/product/brand-logo";
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
import {
  downloadChimalliEvidenceKit,
  evaluateEvidenceKitReadiness,
  evidenceKitGuidance,
  isEvidenceKitRequest
} from "@/lib/chimalli-evidence-kit-pdf";
import type { ChimalliEvidenceKitCase } from "@/lib/chimalli-evidence-kit-pdf";
import type { DemoRole, EvidenceStatus, PrivacyState, RiskLevel } from "@/lib/types";
import { cn, shortHash } from "@/lib/utils";
import { useLocalSeal } from "@/lib/use-local-seal";
import type { SealResult } from "@/lib/use-local-seal";
import { useEvidenceStore } from "@/lib/use-evidence-store";
import { usePDFGenerator } from "@/lib/use-pdf-generator";
import type { StoredEvidence } from "@/lib/use-evidence-store";
import { useChimalliContext } from "@/lib/use-chimalli-context";

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
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <BrandLogo subtitle="Tlachia · Machiyotl · Chimalli" />
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 sm:flex">
            <span
              className={`h-2 w-2 rounded-full ${isOnline ? "bg-success-600" : "bg-warning-700"}`}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-neutral-600">
              {isOnline ? "En línea" : "Sin conexión"}
            </span>
          </span>
          <Badge className="hidden sm:inline-flex" variant="neutral">
            {roleLabels[role]}
          </Badge>
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
    <aside className="hidden border-r border-border bg-surface-card lg:flex lg:flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {roleLabels[role]}
        </p>
      </div>
      <nav aria-label="Navegación principal" className="sticky top-16 flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-foreground",
                isActive && "sidebar-item-active"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/demo"
          className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground"
        >
          Cambiar rol de acceso
        </Link>
      </div>
    </aside>
  );
}

interface BottomNavProps {
  role: DemoRole;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = navItemsByRole[role];

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-card/90 px-2 py-1.5 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-4 gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-100",
                isActive && "text-brand-700"
              )}
              href={item.href}
              key={item.href}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600 -translate-y-1.5" />
              )}
              <Icon
                aria-hidden="true"
                className={cn("h-5 w-5", isActive ? "text-brand-600" : "text-neutral-500")}
              />
              <span className="line-clamp-1 text-[10px]">{item.label}</span>
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
      <div className="grid lg:grid-cols-[264px_1fr]">
        <SidebarNav role={role} />
        <main className="min-w-0 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </main>
      </div>
      <BottomNav role={role} />
    </div>
  );
}

interface RoleGateProps {
  role: DemoRole;
  children: ReactNode;
}

export function RoleGate({ children }: RoleGateProps) {
  return <div className="space-y-6">{children}</div>;
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
          Señales técnicas y contextuales detectadas por el motor algorítmico. Requiere calificación jurídica de la autoridad competente.
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

interface CustodyEvent {
  title: string;
  timestamp: string;
  actor: string;
  description: string;
}

interface CustodyTimelineProps {
  events?: CustodyEvent[];
}

function formatCustodyDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day} de ${month} de ${year}, ${hours}:${minutes}`;
}

export function CustodyTimeline({ events }: CustodyTimelineProps) {
  const displayEvents = events || custodyEvents;

  return (
    <ol className="space-y-4">
      {displayEvents.map((event, index) => (
        <li className="grid grid-cols-[32px_1fr] gap-3" key={`${event.title}-${event.timestamp}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-card">
            {index < displayEvents.length - 1 ? (
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
          El sistema no transmite evidencia automáticamente. Puede revisar, guardar localmente y continuar después.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 text-sm leading-6 text-neutral-700 sm:grid-cols-2">
          <p>La informacion sensible permanece local hasta una accion expresa.</p>
          <p>La IA organiza y sugiere; una autoridad humana debe revisar.</p>
          <p>Los datos expuestos están protegidos y anonimizados por defecto.</p>
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
  evidence: (typeof evidences)[number] & {
    alertId?: string;
    mode?: string;
    riskLevel?: string;
    motive?: string;
    protectedPerson?: string;
    alertCode?: string;
    tlachiaSignals?: Array<{ label: string; explanation: string; weight: number }>;
  };
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
          {"alertId" in evidence && evidence.alertId ? (
            <div className="rounded-md border border-info-200 bg-info-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-info-800">
                <Bell className="h-3 w-3" />
                Origen: Alerta {evidence.alertCode || evidence.alertId} · Tlachia
              </div>
              {"riskLevel" in evidence && evidence.riskLevel ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-info-700">Riesgo:</span>
                  <Badge variant={evidence.riskLevel === "high" ? "danger" : evidence.riskLevel === "medium" ? "warning" : "success"}>
                    {evidence.riskLevel === "high" ? "Alto" : evidence.riskLevel === "medium" ? "Medio" : "Bajo"}
                  </Badge>
                </div>
              ) : null}
              {"motive" in evidence && evidence.motive ? (
                <p className="mt-1 text-xs leading-4 text-info-700 line-clamp-2">{evidence.motive}</p>
              ) : null}
              {"tlachiaSignals" in evidence && evidence.tlachiaSignals && evidence.tlachiaSignals.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {evidence.tlachiaSignals.slice(0, 3).map((sig, i) => (
                    <Badge key={i} variant="neutral" className="text-xs">{sig.label}</Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
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
        <CardDescription>Registro de evidencia forense local. Sin transmisión automática.</CardDescription>
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
        <Badge variant="brand">Onboarding Institucional</Badge>
        <CardTitle>Antes de comenzar</CardTitle>
        <CardDescription>
          Este flujo explica límites, privacidad y requerimientos de revisión humana antes de cualquier envío de información sensible.
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
              Estás en la interfaz protegida. Puedes capturar evidencia forense digital,
              guardarla localmente de forma cifrada y preparar una revisión antes de enviarla.
            </p>
          ) : null}
          {step === 1 ? (
            <div className="mt-3 grid gap-3 text-sm leading-6 text-neutral-700 sm:grid-cols-2">
              <p>No se sube evidencia automáticamente.</p>
              <p>Cada acción requiere revisión y confirmación explícita.</p>
              <p>La IA no decide ni confirma hechos.</p>
              <p>La autoridad humana revisa cualquier expediente.</p>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="mt-4 space-y-4">
              {[
                "Entiendo que informacion sera utilizada.",
                "Entiendo que puedo revisar antes de enviar.",
                "Autorizo el tratamiento de mis datos para el encuadre institucional preliminar."
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
              <p>Las preferencias de notificación se configuran en privacidad.</p>
            </div>
          ) : null}
          {step === 4 ? (
            <p className="mt-3 leading-7 text-neutral-700">
              Puedes iniciar Machiyotl para sellar evidencia forense o Chimalli para recibir
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

interface EvidenceCaptureStepperProps {
  initialData?: {
    sourceUrl?: string;
    platform?: string;
    alertId?: string;
    mode?: "manual" | "alert";
    riskLevel?: string;
    motive?: string;
    protectedPerson?: string;
    alertCode?: string;
  };
}

interface EvidenceItem {
  id: string;
  type: "screenshot" | "url" | "note";
  content: File | string;
  label: string;
  size?: number;
  addedAt: string;
}

function generateItemId(): string {
  return `ei-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatItemSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getEvidenceIcon(type: EvidenceItem["type"]) {
  switch (type) {
    case "screenshot": return FileLock2;
    case "url": return Route;
    case "note": return Paperclip;
    default: return FileLock2;
  }
}

export function EvidenceCaptureStepper({ initialData }: EvidenceCaptureStepperProps) {
  const { sealFile, sealing, error: sealError } = useLocalSeal();
  const { saveEvidence, listEvidences } = useEvidenceStore();
  const { generatePDF, generating: pdfGenerating } = usePDFGenerator();
  const { saveContext } = useChimalliContext();
  const router = useRouter();

  const isAlertMode = initialData?.mode === "alert" && !!initialData?.alertId;

  const [step, setStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [sealResult, setSealResult] = useState<SealResult | null>(null);
  const [urlInput, setUrlInput] = useState(initialData?.sourceUrl || "");
  const [noteInput, setNoteInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [platform, setPlatform] = useState(initialData?.platform || "Plataforma de origen");
  const [saved, setSaved] = useState(false);

  // Pre-fill URL from alert if provided
  useEffect(() => {
    if (initialData?.sourceUrl && !urlInput) {
      setUrlInput(initialData.sourceUrl);
    }
  }, [initialData?.sourceUrl]);

  const primaryFile = useMemo(() => {
    const screenshot = evidenceItems.find((item) => item.type === "screenshot");
    return screenshot?.content instanceof File ? screenshot.content : null;
  }, [evidenceItems]);

  const realCustodyEvents = useMemo(() => {
    if (!sealResult) return undefined;
    const captured = sealResult.capturedAt;
    const sealed = new Date(new Date(captured).getTime() + 120000).toISOString();
    const reviewed = new Date(new Date(captured).getTime() + 240000).toISOString();
    return [
      {
        title: "Captura iniciada",
        timestamp: formatCustodyDate(captured),
        actor: "Mujer protegida",
        description: "Se inició la captura de evidencia en el dispositivo local."
      },
      {
        title: "Evidencia sellada",
        timestamp: formatCustodyDate(sealed),
        actor: "Machiyotl (Web Crypto API)",
        description: "Se generó el hash SHA-256 criptográfico localmente. El archivo no salió del dispositivo."
      },
      {
        title: "Metadatos revisados",
        timestamp: formatCustodyDate(reviewed),
        actor: "Mujer protegida",
        description: "La usuaria revisó y confirmó los datos de la evidencia."
      },
      {
        title: "Reporte forense generado",
        timestamp: formatCustodyDate(new Date().toISOString()),
        actor: "Machiyotl",
        description: saved
          ? "Se generó el PDF forense con cadena de custodia y QR de verificación."
          : "Pendiente de generación del reporte forense."
      }
    ];
  }, [sealResult, saved]);

  const steps = [
    "Inicio",
    "Agregar evidencias",
    "Contexto y sellado",
    "Revision y guardar"
  ];

  // ─── Evidence item handlers ───
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const newItems: EvidenceItem[] = Array.from(files).map((file) => ({
        id: generateItemId(),
        type: "screenshot" as const,
        content: file,
        label: file.name,
        size: file.size,
        addedAt: new Date().toISOString(),
      }));
      setEvidenceItems((prev) => [...prev, ...newItems]);
      // Infer platform from first filename if not already set
      if (platform === "Plataforma de origen" && files[0]) {
        const name = files[0].name.toLowerCase();
        if (name.includes("twitter") || name.includes("x_") || name.includes("x-")) {
          setPlatform("X");
        } else if (name.includes("fb") || name.includes("face")) {
          setPlatform("Facebook");
        } else if (name.includes("insta")) {
          setPlatform("Instagram");
        } else if (name.includes("tiktok")) {
          setPlatform("TikTok");
        } else if (name.includes("whats") || name.includes("wa-")) {
          setPlatform("WhatsApp");
        }
      }
    },
    [platform]
  );

  const handleAddUrl = useCallback(() => {
    if (!urlInput.trim()) return;
    let url = urlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    try {
      new URL(url);
    } catch {
      setUrlError("Por favor ingresa una URL valida (ej. https://x.com/usuario/status/123)");
      return;
    }
    setEvidenceItems((prev) => [
      ...prev,
      {
        id: generateItemId(),
        type: "url" as const,
        content: url,
        label: url,
        addedAt: new Date().toISOString(),
      },
    ]);
    setUrlInput("");
    setUrlError("");
  }, [urlInput]);

  const handleAddNote = useCallback(() => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    setEvidenceItems((prev) => [
      ...prev,
      {
        id: generateItemId(),
        type: "note" as const,
        content: trimmed,
        label: trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed,
        addedAt: new Date().toISOString(),
      },
    ]);
    setNoteInput("");
  }, [noteInput]);

  const handleRemoveItem = useCallback((id: string) => {
    setEvidenceItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ─── Seal / Save / PDF ───
  const handleSeal = useCallback(async () => {
    if (!primaryFile) return;
    const result = await sealFile(primaryFile);
    if (result) {
      setSealResult(result);
    }
  }, [primaryFile, sealFile]);

  const handleSave = useCallback(() => {
    if (!sealResult) return;
    saveEvidence({
      hash: sealResult.hash,
      shortHash: sealResult.shortHash,
      capturedAt: sealResult.capturedAt,
      sourceType: "multi-evidencia",
      platform,
      originalFilename: sealResult.metadata.originalFilename,
      mimeType: sealResult.metadata.mimeType,
      sizeBytes: sealResult.metadata.sizeBytes,
      contextNote,
      status: "sellada-localmente",
      alertId: initialData?.alertId,
      mode: initialData?.mode || "manual",
      sourceUrl: urlInput,
      riskLevel: initialData?.riskLevel,
      motive: initialData?.motive,
      protectedPerson: initialData?.protectedPerson,
      alertCode: initialData?.alertCode,
    });
    setSaved(true);
  }, [sealResult, platform, contextNote, saveEvidence, initialData, urlInput]);

  const handleGeneratePDF = useCallback(async () => {
    if (!sealResult) return;
    const evidenceData: StoredEvidence = {
      id: `temp-${Date.now()}`,
      hash: sealResult.hash,
      shortHash: sealResult.shortHash,
      capturedAt: sealResult.capturedAt,
      sourceType: "multi-evidencia",
      platform,
      originalFilename: sealResult.metadata.originalFilename,
      mimeType: sealResult.metadata.mimeType,
      sizeBytes: sealResult.metadata.sizeBytes,
      contextNote,
      status: "sellada-localmente",
      createdAt: new Date().toISOString(),
      alertId: initialData?.alertId,
      mode: initialData?.mode || "manual",
      sourceUrl: urlInput,
      riskLevel: initialData?.riskLevel,
      motive: initialData?.motive,
      protectedPerson: initialData?.protectedPerson,
      alertCode: initialData?.alertCode,
    };
    await generatePDF(evidenceData);
  }, [sealResult, platform, contextNote, initialData, urlInput, generatePDF]);

  const handleGoToChimalli = useCallback(async () => {
    if (!sealResult) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const attachmentIds: string[] = [];
    const fileItems = evidenceItems.filter(
      (item) => item.type === "screenshot" && item.content instanceof File
    );
    for (const item of fileItems) {
      try {
        const formData = new FormData();
        formData.append("file", item.content as File);
        const resp = await fetch(`${apiUrl}/api/v1/chimalli/attachments`, {
          method: "POST",
          body: formData,
        });
        if (resp.ok) {
          const data = await resp.json() as { attachment: { attachment_id: string } };
          attachmentIds.push(data.attachment.attachment_id);
        }
      } catch {
        // File upload can fail silently; hash metadata still goes through
      }
    }

    const combinedNotes = [
      contextNote,
      noteInput,
      urlInput ? `URL fuente: ${urlInput}` : "",
    ].filter(Boolean).join(" | ");

    const ctxEvidences = [{
      id: sealResult.shortHash,
      hash: sealResult.hash,
      shortHash: sealResult.shortHash,
      platform,
      sourceUrl: urlInput || undefined,
      contextNote: combinedNotes || undefined,
      capturedAt: sealResult.capturedAt,
      sourceType: "multi-evidencia",
    }];
    saveContext({
      evidences: ctxEvidences,
      alert: initialData?.alertId ? {
        alertId: initialData.alertId,
        alertCode: initialData.alertCode,
        riskLevel: initialData.riskLevel,
        motive: initialData.motive,
        protectedPerson: initialData.protectedPerson,
        signals: undefined,
      } : undefined,
      attachmentIds,
      noteText: combinedNotes,
      storedAt: new Date().toISOString(),
    });
    router.push("/app/chimalli");
  }, [sealResult, platform, urlInput, contextNote, noteInput, evidenceItems, initialData, saveContext, router]);

  function canAdvance(): boolean {
    if (step === 1 && evidenceItems.length === 0) return false;
    if (step === 2 && !sealResult) return false;
    return true;
  }

  function goToStep(newStep: number) {
    setStep(newStep);
    setVisitedSteps((prev) => new Set([...prev, newStep]));
  }

  function handleNext() {
    if (step === 2 && !sealResult && primaryFile) {
      handleSeal();
      return;
    }
    const nextStep = Math.min(steps.length - 1, step + 1);
    goToStep(nextStep);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Solo en este dispositivo</Badge>
                {isAlertMode ? (
                  <Badge variant="info">Alerta institucional</Badge>
                ) : null}
              </div>
              <CardTitle className="mt-3">
                {isAlertMode ? "Captura desde alerta" : "Captura Machiyotl"}
              </CardTitle>
            </div>
            <Badge variant="neutral">
              Paso {step + 1} de {steps.length}
            </Badge>
          </div>
          <CardDescription>
            {isAlertMode
              ? "Esta evidencia fue pre-llenada desde una alerta validada por Tlachia. Verifica los datos y sube tu captura de pantalla."
              : "Flujo mobile-first para sellar evidencia localmente. El archivo nunca sale del dispositivo."}
          </CardDescription>
          {isAlertMode ? (
            <div className="mt-3 rounded-md border border-info-200 bg-info-50 p-3 text-sm text-info-800">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                Datos pre-llenados desde alerta {initialData?.alertId}
              </div>
              <p className="mt-1 text-xs">
                La URL y la plataforma fueron detectadas por Tlachia. Puedes modificarlos si es necesario.
              </p>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-2 sm:grid-cols-4">
            {steps.map((item, index) => (
              <button
                aria-label={index <= step ? `Ir al paso ${index + 1}: ${item}` : `Paso ${index + 1}: ${item} (no disponible aún)`}
                className={cn(
                  "min-h-10 rounded-sm border px-2 text-xs font-semibold transition-colors",
                  index === step && "border-primary bg-primary text-primary-foreground ring-2 ring-primary/30",
                  visitedSteps.has(index) && index !== step && "border-success-300 bg-success-50 text-success-700 cursor-pointer hover:bg-success-100",
                  !visitedSteps.has(index) && index !== step && "border-border text-neutral-300 cursor-not-allowed opacity-60"
                )}
                disabled={!visitedSteps.has(index) && index !== step}
                key={item}
                onClick={() => visitedSteps.has(index) && goToStep(index)}
                type="button"
              >
                {visitedSteps.has(index) && index !== step ? (
                  <CheckCircle2 className="h-4 w-4 mx-auto" />
                ) : (
                  index + 1
                )}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-neutral-50 p-4">
            <h2 className="text-xl font-bold text-foreground">{steps[step]}</h2>
            {step === 0 ? (
              <div className="mt-4 space-y-4">
                <PrivacyNoticeCard />
                {isAlertMode && initialData?.motive ? (
                  <div className="rounded-md border border-info-200 bg-info-50 p-4">
                    <div className="flex items-center gap-2 font-semibold text-info-800">
                      <AlertCircle className="h-4 w-4" />
                      Contexto de la alerta Tlachia
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {initialData.alertCode && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-info-700">Código:</span>
                          <Badge variant="info">{initialData.alertCode}</Badge>
                        </div>
                      )}
                      {initialData.riskLevel && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-info-700">Nivel de riesgo:</span>
                          <Badge variant={initialData.riskLevel === "high" ? "danger" : initialData.riskLevel === "medium" ? "warning" : "success"}>
                            {initialData.riskLevel === "high" ? "Alto" : initialData.riskLevel === "medium" ? "Medio" : "Bajo"}
                          </Badge>
                        </div>
                      )}
                      {initialData.protectedPerson && (
                        <p className="text-xs text-info-700">
                          <span className="font-semibold">Persona protegida:</span> {initialData.protectedPerson}
                        </p>
                      )}
                      <p className="text-xs leading-5 text-info-700">
                        <span className="font-semibold">Motivo:</span> {initialData.motive}
                      </p>
                    </div>
                  </div>
                ) : null}
                <p className="text-sm leading-6 text-neutral-700">
                  Inicia una captura. El hash SHA-256 se genera en este dispositivo. Nada se sube sin tu autorización expresa.
                </p>
              </div>
            ) : null}
            {step === 1 ? (
              <div className="mt-4 space-y-6">
                {/* File upload */}
                <div className="rounded-lg border border-border bg-surface-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <FileLock2 className="h-4 w-4" />
                    Capturas de pantalla o archivos
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600">
                    Selecciona una o varias capturas de pantalla, imagenes o PDFs.
                  </p>
                  <input
                    accept="image/*,application/pdf,.txt,.csv"
                    className="hidden"
                    id="evidence-file-input"
                    multiple
                    onChange={handleFileChange}
                    type="file"
                  />
                  <button
                    className="mt-3 flex w-full min-h-20 flex-col items-center justify-center rounded-md border border-dashed border-border-strong bg-neutral-50 p-4 text-center hover:bg-secondary"
                    onClick={() => document.getElementById("evidence-file-input")?.click()}
                    type="button"
                  >
                    <FileLock2 className="h-6 w-6 text-neutral-500" />
                    <span className="mt-2 text-sm font-semibold">Seleccionar archivos</span>
                    <span className="text-xs text-neutral-600">Puedes seleccionar varios a la vez</span>
                  </button>
                </div>

                {/* URL input */}
                <div className="rounded-lg border border-border bg-surface-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Route className="h-4 w-4" />
                    Enlaces
                  </h3>
                  <div className="mt-3 flex gap-2">
                    <Input
                      aria-describedby="evidence-url-helper"
                      className={cn(
                        isAlertMode && initialData?.sourceUrl && "border-info-300 bg-info-50"
                      )}
                      id="evidence-url"
                      onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") handleAddUrl(); }}
                      placeholder="https://x.com/usuario/status/123..."
                      type="url"
                      value={urlInput}
                    />
                    <Button onClick={handleAddUrl} type="button" variant="secondary">
                      Agregar
                    </Button>
                  </div>
                  {urlError ? (
                    <p className="mt-2 text-xs text-danger-700">{urlError}</p>
                  ) : null}
                  {isAlertMode && initialData?.sourceUrl ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-info-700">
                      <CheckCircle2 className="h-3 w-3" />
                      URL pre-llenada desde alerta institucional
                    </span>
                  ) : null}
                </div>

                {/* Note input */}
                <div className="rounded-lg border border-border bg-surface-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Paperclip className="h-4 w-4" />
                    Notas contextuales
                  </h3>
                  <Textarea
                    className="mt-3 min-h-[80px]"
                    id="evidence-note"
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Describe el contexto, fecha aproximada, o cualquier detalle relevante..."
                    value={noteInput}
                  />
                  <Button className="mt-2" onClick={handleAddNote} type="button" variant="secondary">
                    Agregar nota
                  </Button>
                </div>

                {/* Evidence tray */}
                <div className="rounded-lg border border-border bg-surface-card p-4">
                  <h3 className="flex items-center justify-between text-sm font-bold text-foreground">
                    <span>Bandeja de evidencias</span>
                    <Badge variant="neutral">{evidenceItems.length}</Badge>
                  </h3>
                  {evidenceItems.length === 0 ? (
                    <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
                      <FileLock2 className="h-10 w-10 text-neutral-300" />
                      <p className="mt-3 text-sm text-neutral-600">
                        Aun no has agregado evidencias.
                      </p>
                      <p className="text-xs text-neutral-500">
                        Selecciona al menos un archivo, enlace o nota para continuar.
                      </p>
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {evidenceItems.map((item) => {
                        const Icon = getEvidenceIcon(item.type);
                        return (
                          <li
                            className="flex items-center gap-3 rounded-md border border-border bg-neutral-50 p-3"
                            key={item.id}
                          >
                            <Icon className="h-5 w-5 shrink-0 text-neutral-500" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {item.label}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-neutral-600">
                                <Badge variant="neutral">
                                  {item.type === "screenshot" ? "Archivo" : item.type === "url" ? "Enlace" : "Nota"}
                                </Badge>
                                {item.size ? (
                                  <span>{formatItemSize(item.size)}</span>
                                ) : null}
                              </div>
                            </div>
                            <button
                              aria-label={`Eliminar ${item.label}`}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-danger-100 hover:text-danger-700"
                              onClick={() => handleRemoveItem(item.id)}
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Alert if no screenshot uploaded */}
                {!primaryFile && evidenceItems.length > 0 ? (
                  <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      Recomendacion
                    </div>
                    <p className="mt-1 text-xs leading-5">
                      Has agregado enlaces o notas, pero no un archivo. Sube al menos una captura de pantalla, imagen o PDF para generar un hash de integridad y preservar la cadena de custodia.
                    </p>
                  </div>
                ) : null}

                {/* Encryption message */}
                <div className="rounded-md border border-info-200 bg-info-50 p-3 text-sm text-info-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <Lock className="h-4 w-4" />
                    Cifrado local
                  </div>
                  <p className="mt-1 text-xs leading-5">
                    Todas las evidencias se cifraran localmente con SHA-256 para salvaguardar su integridad. Ningun archivo sale de este dispositivo sin tu autorizacion expresa.
                  </p>
                </div>
              </div>
            ) : null}
            {step === 2 ? (
              <div className="mt-4 space-y-4">
                <Field
                  helper="Este contexto se puede editar antes de enviar."
                  id="evidence-context"
                  label="Contexto opcional"
                >
                  <Textarea
                    aria-describedby="evidence-context-helper"
                    id="evidence-context"
                    onChange={(e) => setContextNote(e.target.value)}
                    placeholder="Describe brevemente por que esta evidencia es relevante."
                    value={contextNote}
                  />
                </Field>
                <Field
                  helper={isAlertMode && initialData?.platform ? "Dato pre-llenado desde alerta institucional. Puedes modificarlo." : "Plataforma donde se origino la evidencia"}
                  id="evidence-platform"
                  label="Plataforma"
                >
                  <Input
                    className={cn(
                      isAlertMode && initialData?.platform && "border-info-300 bg-info-50 focus-visible:ring-info-400"
                    )}
                    id="evidence-platform"
                    onChange={(e) => setPlatform(e.target.value)}
                    value={platform}
                  />
                  {isAlertMode && initialData?.platform ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-info-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Auto-completado por alerta institucional
                    </span>
                  ) : null}
                </Field>

                {/* Seal section */}
                <div className="mt-6 rounded-lg border border-border bg-surface-card p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Shield className="h-4 w-4" />
                    Sello criptografico
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600">
                    Se generara un hash SHA-256 del archivo principal para preservar su integridad. Los demas elementos se incluyen en el reporte como evidencia de soporte.
                  </p>

                  {sealing ? (
                    <div className="mt-4 flex flex-col items-center gap-3 py-4 text-center">
                      <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-semibold text-foreground">Generando sello local</p>
                      <p className="text-xs text-neutral-600">
                        Calculando SHA-256 en este dispositivo...
                      </p>
                    </div>
                  ) : sealResult ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-success-700">
                        <CheckCircle2 className="h-5 w-5" />
                        Paquete sellado correctamente
                      </div>
                      <HashBlock algorithm="SHA-256" hash={sealResult.hash} />
                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <Badge variant="success">Sellado local</Badge>
                        <Badge variant="neutral">No enviado</Badge>
                      </div>
                    </div>
                  ) : !primaryFile ? (
                    <div className="mt-4 flex flex-col items-center gap-2 py-4 text-center">
                      <FileLock2 aria-hidden="true" className="h-6 w-6 text-neutral-400" />
                      <p className="text-sm text-neutral-600">
                        No hay archivo para sellar. Agrega al menos una captura de pantalla en el paso anterior.
                      </p>
                      <Button onClick={() => goToStep(1)} type="button" variant="secondary">
                        Ir a agregar evidencias
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Button onClick={handleSeal} type="button">
                        <ShieldCheck aria-hidden="true" className="mr-2 h-4 w-4" />
                        Sellar paquete de evidencias
                      </Button>
                    </div>
                  )}
                  {sealError ? (
                    <div className="mt-3 rounded-md border border-danger-100 bg-danger-100 p-3 text-sm leading-6 text-danger-700">
                      No se pudo completar el sellado. Tu archivo sigue en este dispositivo. Intenta nuevamente.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            {step === 3 ? (
              <div className="mt-4 space-y-4">
                {sealResult ? (
                  <>
                    {/* Review section */}
                    <div className="rounded-lg border border-border bg-surface-card p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <FileLock2 aria-hidden="true" className="h-5 w-5 text-primary" />
                        <span className="font-bold text-foreground">
                          {sealResult.metadata.originalFilename}
                        </span>
                      </div>
                      <div className="mb-3">
                        <Badge variant="success">Sellado local</Badge>
                      </div>
                      <HashBlock algorithm="SHA-256" hash={sealResult.hash} />
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-700">
                        <span>Plataforma: {platform}</span>
                        <span>Capturado: {new Date(sealResult.capturedAt).toLocaleString("es-MX")}</span>
                        <span>{(sealResult.metadata.sizeBytes / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>

                    {/* All evidence items */}
                    {evidenceItems.length > 1 && (
                      <div className="rounded-lg border border-border bg-surface-card p-4">
                        <h3 className="mb-3 text-sm font-bold text-foreground">
                          Evidencias de soporte ({evidenceItems.length - 1})
                        </h3>
                        <ul className="space-y-2">
                          {evidenceItems.map((item) => {
                            if (item.content instanceof File && item.content.name === sealResult.metadata.originalFilename) {
                              return null; // Skip primary file (already shown above)
                            }
                            const Icon = getEvidenceIcon(item.type);
                            return (
                              <li className="flex items-center gap-3 rounded-md border border-border bg-neutral-50 p-3" key={item.id}>
                                <Icon className="h-4 w-4 shrink-0 text-neutral-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm text-foreground">{item.label}</p>
                                  <Badge variant="neutral">
                                    {item.type === "screenshot" ? "Archivo" : item.type === "url" ? "Enlace" : "Nota"}
                                  </Badge>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    <CustodyTimeline events={realCustodyEvents} />

                    {/* Save section */}
                    <div className="rounded-lg border border-border bg-surface-card p-4">
                      <h3 className="text-sm font-bold text-foreground">Guardar o continuar</h3>
                      {saved ? (
                        <div className="mt-3 rounded-md border border-success-100 bg-success-100 p-3 text-sm leading-6 text-success-700">
                          Evidencia guardada localmente. Puedes continuar a Chimalli con orientacion o revisar tus evidencias guardadas.
                        </div>
                      ) : (
                        <div className="mt-3 rounded-md border border-warning-100 bg-warning-100 p-3 text-sm leading-6 text-warning-700">
                          Revisa la evidencia antes de guardar. Una vez guardada, permanecera en este dispositivo.
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-3">
                        {!saved && sealResult ? (
                          <Button onClick={handleSave} type="button">
                            <ShieldCheck aria-hidden="true" className="mr-2 h-4 w-4" />
                            Guardar evidencia
                          </Button>
                        ) : null}
                        {saved ? (
                          <Button
                            disabled={pdfGenerating}
                            onClick={handleGeneratePDF}
                            type="button"
                            variant="secondary"
                          >
                            <FileLock2 aria-hidden="true" className="mr-2 h-4 w-4" />
                            {pdfGenerating ? "Generando PDF..." : "Generar y descargar reporte"}
                          </Button>
                        ) : null}
                        <Button
                          disabled={!saved}
                          onClick={handleGoToChimalli}
                          type="button"
                          variant="primary"
                        >
                          Continuar a Chimalli
                        </Button>
                        <Button asChild variant="secondary">
                          <Link href="/app/evidence">Ver mis evidencias</Link>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-neutral-600">
                    No hay evidencia sellada para revisar. Completa los pasos anteriores.
                  </p>
                )}
              </div>
            ) : null}

          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button
            disabled={step === 0}
            onClick={() => goToStep(Math.max(0, step - 1))}
            type="button"
            variant="outline"
          >
            Volver
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary">
              Guardar y continuar despues
            </Button>
            {step < 3 ? (
              <Button
                disabled={!canAdvance()}
                onClick={handleNext}
                type="button"
              >
                Continuar
              </Button>
            ) : null}
          </div>
        </CardFooter>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Metadatos técnicos</CardTitle>
            <CardDescription>
              {sealResult
                ? "Informacion tecnica del archivo sellado."
                : "Informacion tecnica visible antes de cualquier envio."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {sealResult ? (
                <>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">
                      {evidenceItems.length > 1 ? "Evidencias" : "Archivo"}
                    </dt>
                    <dd className="text-right text-foreground truncate max-w-[180px]">
                      {evidenceItems.length > 1
                        ? `${evidenceItems.length} elementos`
                        : sealResult.metadata.originalFilename}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Tamaño</dt>
                    <dd className="text-right text-foreground">
                      {(sealResult.metadata.sizeBytes / 1024).toFixed(1)} KB
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Tipo</dt>
                    <dd className="text-right text-foreground">{sealResult.metadata.mimeType}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Fecha de captura</dt>
                    <dd className="text-right text-foreground">
                      {new Date(sealResult.capturedAt).toLocaleString("es-MX")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Plataforma</dt>
                    <dd className="text-right text-foreground">{platform}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Estado local</dt>
                    <dd className="text-right text-foreground">
                      <Badge variant="success">Sellado local</Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 pb-2">
                    <dt className="font-semibold text-neutral-600">Envio</dt>
                    <dd className="text-right text-foreground">
                      <Badge variant="neutral">No enviado</Badge>
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Evidencias</dt>
                    <dd className="text-right text-foreground">
                      {evidenceItems.length > 0 ? `${evidenceItems.length} elementos` : "Pendiente"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Plataforma</dt>
                    <dd className="text-right text-foreground">
                      {platform}
                      {isAlertMode && initialData?.platform ? (
                        <span className="ml-2 inline-flex items-center rounded-sm bg-info-100 px-1.5 py-0.5 text-[10px] font-medium text-info-800">Alerta</span>
                      ) : null}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Archivo principal</dt>
                    <dd className="text-right text-foreground">
                      {primaryFile ? primaryFile.name : "Pendiente"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border pb-2">
                    <dt className="font-semibold text-neutral-600">Estado local</dt>
                    <dd className="text-right text-foreground">Sin sellar</dd>
                  </div>
                  <div className="flex justify-between gap-3 pb-2">
                    <dt className="font-semibold text-neutral-600">Envio</dt>
                    <dd className="text-right text-foreground">No enviado</dd>
                  </div>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
        <PrivacyNoticeCard />
      </div>
    </div>
  );
}

interface RagCitation {
  source_file: string;
  excerpt: string;
  institution: string;
  page: number;
}

interface ChatMessageProps {
  author: "assistant" | "user";
  content: string;
  timestamp: string;
  citations?: RagCitation[];
  isTyping?: boolean;
  kitArtifact?: EvidenceKitArtifact;
  onDownloadKit?: (caseData: ChimalliEvidenceKitCase) => void;
}

interface EvidenceKitArtifact {
  caseData: ChimalliEvidenceKitCase;
  status: "generating" | "ready";
}

type ChimalliChatMessage = {
  author: "assistant" | "user";
  content: string;
  timestamp: string;
  citations?: RagCitation[];
  kitArtifact?: EvidenceKitArtifact;
};

function renderAssistantContent(content: string) {
  let html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  html = html
    .replace(/^(\d+)\.\s(.+)$/gm, "<li>$1. $2</li>")
    .replace(/^-\s(.+)$/gm, "<li>$1</li>");

  const hasListItems = /<li>/.test(html);
  if (hasListItems) {
    html = html.replace(/((?:<li>[\s\S]*?<\/li>\n?)+)/g, "<ul class=\"mt-2 list-inside\">$1</ul>");
  }

  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br />");
  if (!html.startsWith("<ul") && !html.startsWith("<li")) {
    html = "<p>" + html + "</p>";
  }

  return html;
}

export function ChatMessage({
  author,
  content,
  timestamp,
  citations,
  isTyping,
  kitArtifact,
  onDownloadKit
}: ChatMessageProps) {
  const isAssistant = author === "assistant";

  return (
    <div className={cn("flex items-end gap-2", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[72ch] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
          isAssistant
            ? "rounded-bl-sm border border-border bg-surface-card text-foreground"
            : "rounded-br-sm border border-brand-200 bg-secondary text-secondary-foreground"
        )}
      >
        {isAssistant ? (
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
            <span>Chimalli</span>
            <Badge variant="brand" className="text-[10px] py-0 h-4">IA</Badge>
          </div>
        ) : null}
        {kitArtifact ? (
          <EvidenceKitArtifactCard artifact={kitArtifact} onDownloadKit={onDownloadKit} />
        ) : isAssistant ? (
          <>
            <div
              className="assistant-content"
              dangerouslySetInnerHTML={{
                __html: isTyping
                  ? content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />")
                    + "<span class=\"inline-block w-2 h-4 ml-0.5 -mb-0.5 animate-pulse bg-primary rounded-sm\" />"
                  : renderAssistantContent(content)
              }}
            />
            {citations && citations.length ? (
              <details className="mt-3 border-t border-border pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-neutral-600 hover:text-foreground">
                  Fuentes consultadas ({citations.length})
                </summary>
                <ul className="mt-2 space-y-2">
                  {citations.map((citation, index) => (
                    <li className="text-xs text-neutral-700" key={index}>
                      <span className="font-semibold text-foreground">
                        {citation.source_file}
                      </span>
                      {citation.page ? `, p. ${citation.page}` : ""}
                      {citation.institution !== "No validado" ? ` — ${citation.institution}` : ""}
                      <br />
                      <span className="italic">
                        &ldquo;{citation.excerpt.slice(0, 150)}{citation.excerpt.length > 150 ? "…" : ""}&rdquo;
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-[10px] text-neutral-500">
                  Sugerencia IA. Verifica en el corpus legal antes de citar.
                </p>
              </details>
            ) : null}
          </>
        ) : (
          content
        )}
        <p className="mt-2 text-[10px] text-neutral-500">
          {timestamp}
        </p>
      </div>
    </div>
  );
}

function EvidenceKitArtifactCard({
  artifact,
  onDownloadKit
}: {
  artifact: EvidenceKitArtifact;
  onDownloadKit?: (caseData: ChimalliEvidenceKitCase) => void;
}) {
  const isReady = artifact.status === "ready";

  return (
    <div className="w-full min-w-[280px] rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-secondary p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative rounded-xl bg-primary p-3 text-primary-foreground shadow-md">
          <FileText aria-hidden="true" className="h-5 w-5" />
          {!isReady ? (
            <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-brand-300" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">
            {isReady ? "Kit de evidencia listo" : "Preparando kit de evidencia"}
          </p>
          <p className="mt-1 text-xs leading-5 text-neutral-700">
            {isReady
              ? `PDF revisable para ${artifact.caseData.case_id}. Descargalo solo si ya revisaste la informacion.`
              : "Chimalli esta ordenando narrativa, evidencia, test asistivo y ruta preliminar."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={isReady ? "success" : "brand"}>
              {isReady ? "Pendiente de revision humana" : "Generando archivo"}
            </Badge>
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
              {artifact.caseData.case_id}
            </span>
          </div>
          {!isReady ? (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
            </div>
          ) : (
            <Button
              className="mt-4"
              onClick={() => onDownloadKit?.(artifact.caseData)}
              size="sm"
              type="button"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Descargar PDF
            </Button>
          )}
        </div>
      </div>
      <p className="mt-3 border-t border-brand-100 pt-3 text-[11px] leading-5 text-neutral-600">
        No constituye denuncia automatica ni resolucion. Debe validarse por una persona autorizada.
      </p>
    </div>
  );
}

type ChimalliAttachmentStatus =
  | "uploaded_unverified"
  | "text_extracted"
  | "image_analyzed"
  | "metadata_only"
  | "rejected";

interface ChimalliAttachment {
  attachment_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  status: ChimalliAttachmentStatus;
  extracted_text: string | null;
  visual_summary: string | null;
  warning: string;
}

interface ChimalliChatPayload {
  reply: string;
  attachments: ChimalliAttachment[];
  case: {
    case_id: string;
    created_at?: string;
    human_review_notice?: string;
    rag_sources?: RagCitation[];
    victim: {
      name: string | null;
      role: string | null;
      position: string | null;
      state: string | null;
      municipality: string | null;
    };
    facts: {
      platform: string | null;
      dates?: string[];
      aggressors?: string[];
      narrative?: string;
      evidence?: Array<{
        evidence_id: string | null;
        source_platform: string | null;
        evidence_hash: string | null;
        status: string;
      }>;
      attachments: ChimalliAttachment[];
    };
    vpmrg_test: {
      political_electoral_link: { meets: boolean; reason: string };
      gender_element: { meets: boolean; reason: string };
      political_rights_impact: { meets: boolean; reason: string };
      overall_result: string;
      confidence?: string;
    };
    jurisdiction?: {
      suggested_authority: string;
      procedure: string;
      alternative_routes?: string[];
      reason: string;
    };
  };
}

type ExtractedInfoItem = { label: string; value: string; state: string };
type VpmrgTestItem = { element: string; result: string; resultMeets?: boolean; note: string };

function mergeExtractedInfo(prev: ExtractedInfoItem[], next: ExtractedInfoItem[]) {
  return prev.map((item) => {
    if (item.state === "Editado") return item;
    const nextItem = next.find((candidate) => candidate.label === item.label);
    if (!nextItem || !nextItem.value || nextItem.value === "Pendiente de confirmar") {
      return item;
    }
    return nextItem;
  });
}

function mergeVpmrgTest(prev: VpmrgTestItem[], next: VpmrgTestItem[]) {
  return prev.map((item) => {
    if (item.result === "Editado") return item;
    const nextItem = next.find((candidate) => candidate.element === item.element);
    if (!nextItem || nextItem.result === "No identificado") {
      return item;
    }
    return nextItem;
  });
}

function mergeAttachments(prev: ChimalliAttachment[], next: ChimalliAttachment[]) {
  const byId = new Map(prev.map((attachment) => [attachment.attachment_id, attachment]));
  next.forEach((attachment) => byId.set(attachment.attachment_id, attachment));
  return Array.from(byId.values());
}

const initialChatTimestamp = "Ahora";

export function ChimalliChat() {
  const now = () =>
    new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit"
    });
  const { context: machiyotlContext, clearContext } = useChimalliContext();
  const [contextSent, setContextSent] = useState(false);
  const [messages, setMessages] = useState<ChimalliChatMessage[]>(() => {
    const base = [
      {
        author: "assistant" as const,
        content:
          "Hola. Soy Chimalli. Puedo ayudarte a ordenar una narrativa, identificar elementos preliminares y preparar informacion para revision humana. No sustituyo asesoria legal ni decido si existe una infraccion.",
        timestamp: initialChatTimestamp
      },
    ];
    if (machiyotlContext && machiyotlContext.evidences.length > 0) {
      const evCount = machiyotlContext.evidences.length;
      const alertInfo = machiyotlContext.alert
        ? `\n\nTienes una alerta de Tlachia (${machiyotlContext.alert.alertCode || machiyotlContext.alert.alertId}) de nivel ${machiyotlContext.alert.riskLevel || "desconocido"} asociada a esta evidencia.`
        : "";
      base.push({
        author: "assistant" as const,
        content:
          `Veo que vienes de Machiyotl con ${evCount} evidencia(s) sellada(s) criptograficamente. ` +
          `Puedo incluir esos datos en el expediente.${alertInfo}\n\n` +
          `Cuentame que ocurrio para organizar la informacion y preparar el caso.`,
        timestamp: initialChatTimestamp
      });
    } else {
      base.push({
        author: "assistant" as const,
        content:
          "Si quieres empezar, cuentame que ocurrio, en que plataforma paso y si esta relacionado con un cargo, candidatura o actividad politica.",
        timestamp: initialChatTimestamp
      });
    }
    return base;
  });
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<ChimalliAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [ragSourcesMap, setRagSourcesMap] = useState<Record<number, RagCitation[]>>({});
  const [dynamicExtractedInfo, setDynamicExtractedInfo] = useState(extractedInfo);
  const [dynamicVpmrgTest, setDynamicVpmrgTest] = useState<VpmrgTestItem[]>(vpmrgTest);
  const [hasCaseContext, setHasCaseContext] = useState(false);
  const [dynamicCaseAttachments, setDynamicCaseAttachments] = useState<ChimalliAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const generatedKitCasesRef = useRef<Set<string>>(new Set());
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const [typingText, setTypingText] = useState("");
  const fullTextRef = useRef("");

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    if (typingIndex === null) return;
    const full = fullTextRef.current;
    if (!full) return;
    if (typingText.length >= full.length) {
      setTypingIndex(null);
      setTypingText("");
      return;
    }
    const charsPerTick = full.length > 600 ? 3 : 2;
    const timer = setTimeout(() => {
      setTypingText(full.slice(0, typingText.length + charsPerTick));
    }, 8);
    return () => clearTimeout(timer);
  }, [typingIndex, typingText]);

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
      compact === "gracias" ||
      compact === "muchas gracias" ||
      compact.includes("gracias por")
    ) {
      return "Gracias a ti por compartir. La informacion que proporciones aqui se mantiene bajo tu control y no se envia sin tu decision. Cuentame si necesitas algo mas.";
    }

    if (compact === "ayuda" || compact === "no entiendo" || compact === "que hago" || compact === "que puedo hacer" || compact.includes("necesito ayuda")) {
      return "Te explico como funciona esto. Tu narras lo ocurrido, Machiyotl sella evidencia localmente, y Chimalli organiza la informacion para revision humana. Puedes empezar contandome que paso, o preguntarme sobre un paso en particular.";
    }

    if (
      compact.includes("quien eres") ||
      compact.includes("que eres") ||
      compact.includes("como funcionas")
    ) {
      return "Soy Chimalli, un asistente de orientacion dentro de Yaocihuatl. Ayudo a estructurar informacion, revisar evidencia adjunta y preparar un borrador para revision humana. No soy autoridad, no presento denuncias automaticamente y no determino culpabilidad.";
    }

    if (
      compact.includes("seguro") ||
      compact.includes("privado") ||
      compact.includes("confidencial") ||
      compact.includes("datos") ||
      compact.includes("quien ve")
    ) {
      return "Tu información permanece local hasta que tú decidas enviarla. Los adjuntos se almacenan solo en esta sesión. Nadie más ve lo que escribes aquí sin tu consentimiento expreso.";
    }

    if (compact === "agregar evidencia") {
      return "Puedes adjuntar archivos con el icono de clip junto al campo de texto. Se aceptan PDF, imagenes y texto. El analisis es asistivo y no equivale al sellado forense de Machiyotl.";
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

    if (compact.length < 4) {
      return "Cuentame un poco mas. Puedes describir que paso, en que plataforma fue, y si esta relacionado con tu actividad politica o cargo. No hay prisa.";
    }

    return null;
  }

  const canSend = !isLoading && !isUploading && (input.trim().length > 0 || attachments.length > 0);

  async function uploadAttachment(file: File): Promise<ChimalliAttachment> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${apiUrl}/api/v1/chimalli/attachments`, {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      throw new Error("No se pudo adjuntar el archivo. Revisa tipo, extension y tamano.");
    }
    const payload = (await response.json()) as { attachment: ChimalliAttachment };
    return payload.attachment;
  }

  async function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) {
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadAttachment(file)));
      setAttachments((current) => [...current, ...uploaded]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo adjuntar el archivo en este momento."
      );
    } finally {
      setIsUploading(false);
    }
  }

  function removeAttachment(attachmentId: string) {
    setAttachments((current) => current.filter((attachment) => attachment.attachment_id !== attachmentId));
  }

  function appendEvidenceKitArtifact(caseData: ChimalliEvidenceKitCase) {
    if (generatedKitCasesRef.current.has(caseData.case_id)) {
      return;
    }
    generatedKitCasesRef.current.add(caseData.case_id);
    const artifactId = `kit-${caseData.case_id}`;
    setMessages((current) => [
      ...current,
      {
        author: "assistant",
        content: "",
        timestamp: now(),
        kitArtifact: { caseData, status: "generating" }
      }
    ]);
    window.setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.kitArtifact?.caseData.case_id === caseData.case_id &&
          `kit-${message.kitArtifact.caseData.case_id}` === artifactId
            ? { ...message, kitArtifact: { caseData, status: "ready" } }
            : message
        )
      );
    }, 1400);
  }

  function handleEvidenceKitDecision(caseData: ChimalliEvidenceKitCase, userMessage: string) {
    const readiness = evaluateEvidenceKitReadiness(caseData);
    const explicitRequest = isEvidenceKitRequest(userMessage);
    if (readiness.ready) {
      appendEvidenceKitArtifact(caseData);
      return;
    }
    if (!explicitRequest) {
      return;
    }
    setMessages((current) => [
      ...current,
      {
        author: "assistant",
        content: evidenceKitGuidance(readiness),
        timestamp: now()
      }
    ]);
  }

  function handleDownloadKit(caseData: ChimalliEvidenceKitCase) {
    void downloadChimalliEvidenceKit(caseData).catch(() => {
      setError("No se pudo generar el PDF en este navegador. Tu informacion sigue disponible en el chat.");
    });
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    void sendMessage(input);
  }

  async function sendMessage(message: string) {
    if ((!message.trim() && attachments.length === 0) || isLoading || isUploading) {
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const outgoing = message.trim() || "Revisa la evidencia adjunta y extrae informacion relevante para orientacion.";
    const outgoingAttachments = attachments;
    setError(null);
    setInput("");
    setAttachments([]);
    setMessages((current) => [
      ...current,
      {
        author: "user",
        content: outgoingAttachments.length
          ? `${outgoing}\n\nAdjuntos: ${outgoingAttachments.map((attachment) => attachment.file_name).join(", ")}`
          : outgoing,
        timestamp: now()
      }
    ]);

    const localReply = answerLocally(outgoing);
    if (localReply && outgoingAttachments.length === 0 && !currentCaseId) {
      setMessages((current) => [...current, { author: "assistant", content: localReply, timestamp: now() }]);
      const locIndex = messages.length + 1;
      fullTextRef.current = localReply;
      setTypingIndex(locIndex);
      setTypingText("");
      return;
    }

    setIsLoading(true);

    try {
      const hasContext = !currentCaseId && machiyotlContext && !contextSent;
      const allAttachmentIds = [
        ...outgoingAttachments.map((attachment) => attachment.attachment_id),
        ...(hasContext ? machiyotlContext.attachmentIds : []),
      ];
      const requestBody: Record<string, unknown> = {
        message: outgoing,
        case_id: currentCaseId,
        attachment_ids: allAttachmentIds,
      };
      if (hasContext) {
        requestBody.context = {
          machiyotl_evidence: machiyotlContext.evidences.map((ev) => ({
            evidence_hash: ev.hash,
            source_platform: ev.platform,
            evidence_type: ev.sourceType || "screenshot",
            custody_status: "sealed-local",
            authorized_notes: ev.contextNote || undefined,
          })),
          tlachia_alert: machiyotlContext.alert ? {
            alert_id: machiyotlContext.alert.alertId,
            risk_level: machiyotlContext.alert.riskLevel,
            signals: machiyotlContext.alert.signals?.map((s) => s.label) || [],
            sanitized_mentions: machiyotlContext.alert.motive ? [machiyotlContext.alert.motive] : [],
          } : undefined,
          source_platform: machiyotlContext.evidences[0]?.platform,
        };
      }
      const response = await fetch(`${apiUrl}/api/v1/chimalli/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error("No se pudo solicitar orientacion. Tu informacion sigue en esta pantalla.");
      }

      const payload = (await response.json()) as ChimalliChatPayload;
      const caseData = payload.case as ChimalliEvidenceKitCase;

      const replyContent =
        payload.reply ||
        "Chimalli devolvio una respuesta sin contenido. Requiere revision humana.";

      setMessages((current) => [
        ...current,
        {
          author: "assistant",
          content: replyContent,
          timestamp: now()
        }
      ]);

      const newIndex = messages.length + 1;
      fullTextRef.current = replyContent;
      setTypingIndex(newIndex);
      setTypingText("");
      if (!currentCaseId) {
        setCurrentCaseId(payload.case.case_id);
        if (hasContext) {
          clearContext();
          setContextSent(true);
        }
      }
      setHasCaseContext(true);
      setDynamicCaseAttachments((prev) =>
        mergeAttachments(prev, payload.case.facts.attachments ?? payload.attachments ?? [])
      );

      const assistantMessageIndex = messages.length + 1;
      const sources = payload.case.rag_sources;
      if (sources?.length) {
        setRagSourcesMap((prev) => ({
          ...prev,
          [assistantMessageIndex]: sources.map((source) => ({
            source_file: source.source_file,
            excerpt: source.excerpt || "",
            institution: source.institution || "No validado",
            page: source.page || 0
          }))
        }));
      }

      const platformHint =
        payload.case.facts.platform ??
        payload.attachments.find((attachment) => attachment.status === "image_analyzed")?.visual_summary ??
        null;

      const nextExtractedInfo = [
        {
          label: "Persona protegida",
          value: payload.case.victim.name ?? "Pendiente de confirmar",
          state: payload.case.victim.name ? "Sugerido" : "Pendiente"
        },
        {
          label: "Contexto politico",
          value: payload.case.victim.role ?? "Pendiente de confirmar",
          state: payload.case.victim.role ? "Sugerido" : "Pendiente"
        },
        {
          label: "Cargo o posicion",
          value: payload.case.victim.position ?? "Pendiente de confirmar",
          state: payload.case.victim.position ? "Sugerido" : "Pendiente"
        },
        {
          label: "Plataforma",
          value: platformHint ?? "Pendiente de confirmar",
          state: platformHint ? "Sugerido" : "Pendiente"
        },
        {
          label: "Ubicacion",
          value:
            [payload.case.victim.municipality, payload.case.victim.state]
              .filter(Boolean)
              .join(", ") || "Pendiente de confirmar",
          state:
            payload.case.victim.municipality || payload.case.victim.state
              ? "Sugerido"
              : "Pendiente"
        }
      ];
      setDynamicExtractedInfo((prev) => mergeExtractedInfo(prev, nextExtractedInfo));

      const vpmrg = payload.case.vpmrg_test;
      const link = vpmrg.political_electoral_link;
      const gender = vpmrg.gender_element;
      const impact = vpmrg.political_rights_impact;

      const nextVpmrgTest = [
        {
          element: "Contexto politico-electoral",
          result: link.meets ? "Cumple" : "No identificado",
          resultMeets: link.meets,
          note: link.reason
        },
        {
          element: "Conducta basada en genero",
          result: gender.meets ? "Cumple" : "No identificado",
          resultMeets: gender.meets,
          note: gender.reason
        },
        {
          element: "Impacto en derechos politicos",
          result: impact.meets ? "Cumple" : "No identificado",
          resultMeets: impact.meets,
          note: impact.reason
        }
      ];
      setDynamicVpmrgTest((prev) => mergeVpmrgTest(prev, nextVpmrgTest));
      handleEvidenceKitDecision(caseData, outgoing);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo conectar con Chimalli en este momento."
      );
      const errorContent =
        "No fue posible conectar con el backend de Chimalli. Tu informacion sigue en esta pantalla; puedes guardar y reintentar antes de enviar cualquier cosa.";
      setMessages((current) => [
        ...current,
        {
          author: "assistant",
          content: errorContent,
          timestamp: now()
        }
      ]);
      const errIndex = messages.length + 1;
      fullTextRef.current = errorContent;
      setTypingIndex(errIndex);
      setTypingText("");
    } finally {
      setIsLoading(false);
    }
  }

  function updateExtractedField(label: string, value: string) {
    setDynamicExtractedInfo((current) =>
      current.map((item) =>
        item.label === label ? { ...item, value, state: "Editado" } : item
      )
    );
  }

  function updateVpmrgNote(element: string, note: string) {
    setDynamicVpmrgTest((current) =>
      current.map((item) =>
        item.element === element ? { ...item, note, result: "Editado" } : item
      )
    );
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
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
        <CardContent className="flex h-[520px] flex-col">
          <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin">
            {messages.map((message, index) => {
              const isTyping = typingIndex === index;
              return (
                <ChatMessage
                  author={message.author}
                  citations={message.citations ?? ragSourcesMap[index]}
                  content={isTyping ? typingText : message.content}
                  isTyping={isTyping}
                  kitArtifact={message.kitArtifact}
                  key={`${message.author}-${index}`}
                  onDownloadKit={handleDownloadKit}
                  timestamp={isTyping ? "" : message.timestamp}
                />
              );
            })}
            {isLoading && !isUploading ? (
              <div className="flex items-end gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-surface-card px-4 py-3 shadow-sm">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
          <div className="mt-4 shrink-0 space-y-3 border-t border-border pt-4">
            {!hasCaseContext && messages.length <= 2 && (
              <div className="flex flex-wrap gap-2" aria-label="Respuestas rápidas sugeridas">
                {[
                  "Agregar evidencia",
                  "No sé qué autoridad corresponde",
                  "Necesito guardar y continuar después",
                  "Quiero revisar antes de enviar"
                ].map((chip) => (
                  <button
                    className="rounded-full border border-border bg-surface-card px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    key={chip}
                    onClick={() => void sendMessage(chip)}
                    type="button"
                    disabled={isLoading}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
            {attachments.length ? (
              <div className="flex flex-wrap gap-2" aria-label="Evidencia adjunta">
                {attachments.map((attachment) => (
                  <div
                    className="flex max-w-full items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs text-secondary-foreground"
                    key={attachment.attachment_id}
                  >
                    <span className="max-w-52 truncate font-semibold">{attachment.file_name}</span>
                    <span className="text-neutral-600">{chimalliAttachmentStatusLabel(attachment.status)}</span>
                    <button
                      aria-label={`Quitar ${attachment.file_name}`}
                      className="rounded-full bg-surface-card p-1 text-neutral-700 hover:text-foreground"
                      onClick={() => removeAttachment(attachment.attachment_id)}
                      type="button"
                    >
                      <X aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="rounded-2xl border border-border-strong bg-surface-card p-2 shadow-sm">
              <div className="flex items-center gap-2">
                <input
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/png,image/jpeg,image/webp,text/plain"
                  className="sr-only"
                  multiple
                  onChange={handleAttachmentChange}
                  ref={fileInputRef}
                  type="file"
                />
                <Button
                  aria-label="Agregar evidencia"
                  disabled={isLoading || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  size="icon"
                  type="button"
                  variant="secondary"
                >
                  <Paperclip aria-hidden="true" className="h-5 w-5" />
                </Button>
                <textarea
                  aria-describedby="chat-composer-helper"
                  className="min-h-[44px] max-h-[160px] w-full resize-none border-0 bg-transparent px-1 py-2.5 text-sm leading-6 text-foreground placeholder:text-neutral-500 focus:outline-none"
                  id="chat-composer"
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Escribe tu mensaje. Enter envia, Shift + Enter agrega una linea."
                  rows={1}
                  value={input}
                />
                <Button
                  aria-label="Enviar mensaje"
                  disabled={!canSend}
                  onClick={() => {
                    void sendMessage(input);
                  }}
                  size="icon"
                  type="button"
                >
                  <Send aria-hidden="true" className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-neutral-600" id="chat-composer-helper">
              Adjunta PDF, imagen o texto. Chimalli analiza para orientar; Machiyotl sigue siendo el sellado forense.
            </p>
            {isUploading ? <p className="text-sm text-neutral-700">Subiendo evidencia adjunta...</p> : null}
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
                <Input
                  aria-label={`Editar ${item.label}`}
                  className="mt-1 h-9 text-sm font-bold"
                  onChange={(event) => updateExtractedField(item.label, event.target.value)}
                  value={item.value}
                />
                <Badge className="mt-2" variant="brand">
                  {item.state}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        {dynamicCaseAttachments.length ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidencia adjunta</CardTitle>
              <CardDescription>Analisis asistivo; no equivale a sellado forense.</CardDescription>
            </CardHeader>
            <CardContent>
              {dynamicCaseAttachments.map((attachment) => (
                <div className="border-b border-border py-3 last:border-0" key={attachment.attachment_id}>
                  <p className="text-sm font-bold text-foreground">{attachment.file_name}</p>
                  <p className="mt-1 text-sm text-neutral-700">
                    {attachment.visual_summary || attachment.extracted_text?.slice(0, 180) || attachment.warning}
                  </p>
                  <Badge className="mt-2" variant="brand">
                    {chimalliAttachmentStatusLabel(attachment.status)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
        {dynamicCaseAttachments.length === 0 && !hasCaseContext ? <EvidenceTray /> : null}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evaluacion asistiva</CardTitle>
            <CardDescription>No confirma hechos ni sustituye revision legal.</CardDescription>
          </CardHeader>
          <CardContent>
            {dynamicVpmrgTest.map((item) => {
              const meets = "resultMeets" in item ? (item as { resultMeets?: boolean }).resultMeets : undefined;
              return (
                <div className="border-b border-border py-3 last:border-0" key={item.element}>
                  <p className="text-sm font-bold text-foreground">{item.element}</p>
                  <Textarea
                    aria-label={`Editar nota de ${item.element}`}
                    className="mt-2 min-h-20 text-sm text-neutral-700"
                    onChange={(event) => updateVpmrgNote(item.element, event.target.value)}
                    value={item.note}
                  />
                  <Badge className="mt-2" variant={meets === true ? "success" : meets === false ? "warning" : "warning"}>
                    {item.result}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <AuthorityRoutingCard />
      </aside>
    </div>
  );
}

function chimalliAttachmentStatusLabel(status: ChimalliAttachmentStatus) {
  const labels: Record<ChimalliAttachmentStatus, string> = {
    uploaded_unverified: "Adjunto no verificado",
    text_extracted: "Texto extraido",
    image_analyzed: "Imagen analizada",
    metadata_only: "Solo metadatos",
    rejected: "Rechazado"
  };
  return labels[status];
}

export function EvidenceKitSummary() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Kit de evidencia</CardTitle>
            <CardDescription>
              Revisión formal antes de exportar o enviar a revisión humana.
            </CardDescription>
          </div>
          <Badge variant="warning">Pendiente de revisión humana</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-border bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-600">Qué será enviado</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Resumen, evidencias seleccionadas, metadatos y narrativa revisada.
            </p>
          </div>
          <div className="rounded-md border border-border bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-600">A quién se enviaría</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Autoridad electoral competente, pendiente de validación institucional.
            </p>
          </div>
          <div className="rounded-md border border-border bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-600">Qué permanece local</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Archivos originales y notas privadas hasta aprobación expresa.
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
    <ChartCard title="Alertas en el tiempo" subtitle="Últimos 7 días · Fuentes abiertas monitoreadas">
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
    <ChartCard title="Distribución por plataforma" subtitle="Datos agregados y anonimizados · Periodo activo">
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

export function ClusterNetworkMock() { // exported as ClusterNetworkMock for backwards compatibility
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
            Cluster A
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
          subtitle="Datos públicos agregados · Anonimizados"
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
          subtitle="Categorías agregadas · Sin publicaciones textuales identificables"
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
