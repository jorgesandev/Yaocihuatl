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
import { useCallback, useEffect, useRef, useState } from "react";
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
import type { DemoRole, EvidenceStatus, PrivacyState, RiskLevel } from "@/lib/types";
import { cn, shortHash } from "@/lib/utils";
import { useLocalSeal } from "@/lib/use-local-seal";
import type { SealResult } from "@/lib/use-local-seal";
import { useEvidenceStore } from "@/lib/use-evidence-store";

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
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <BrandLogo subtitle="Tlachia observa · Machiyotl sella · Chimalli protege" />
        <div className="flex items-center gap-2">
          <Badge variant="brand">Demo</Badge>
          {isOnline ? (
            <Badge className="hidden sm:inline-flex" variant="success">En línea</Badge>
          ) : (
            <Badge className="hidden sm:inline-flex" variant="warning">Sin conexión</Badge>
          )}
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
  const authCopy =
    role === "analyst"
      ? "Sesión demo institucional con datos sintéticos."
      : "Experiencia demo sin datos reales.";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-card px-4 py-3 text-sm text-neutral-700">
        <Shield aria-hidden="true" className="h-4 w-4 text-primary" />
        Vista demo para: <strong className="text-foreground">{roleLabels[role]}</strong>
        <span className="text-neutral-500">{authCopy}</span>
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

interface EvidenceCaptureStepperProps {
  initialData?: {
    sourceUrl?: string;
    platform?: string;
    alertId?: string;
    mode?: "manual" | "alert";
  };
}

export function EvidenceCaptureStepper({ initialData }: EvidenceCaptureStepperProps) {
  const { sealFile, sealing, error: sealError } = useLocalSeal();
  const { saveEvidence, listEvidences } = useEvidenceStore();

  const isAlertMode = initialData?.mode === "alert" && !!initialData?.alertId;

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [sealResult, setSealResult] = useState<SealResult | null>(null);
  const [sourceType, setSourceType] = useState<string>("");
  const [url, setUrl] = useState(initialData?.sourceUrl || "");
  const [contextNote, setContextNote] = useState("");
  const [platform, setPlatform] = useState(initialData?.platform || "Plataforma de origen");
  const [saved, setSaved] = useState(false);

  const steps = [
    "Inicio",
    "Fuente",
    "Archivo/enlace",
    "Contexto opcional",
    "Sello local",
    "Revision",
    "Guardar o continuar"
  ];

  const sourceTypes = [
    { id: "publicacion", label: "Publicacion publica", icon: FileLock2 },
    { id: "imagen-local", label: "Imagen local", icon: FileLock2 },
    { id: "url", label: "URL", icon: FileLock2 },
    { id: "nota", label: "Nota contextual", icon: FileLock2 },
  ];

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) {
        setFile(selected);
        setSourceType("imagen-local");
        setPlatform(
          selected.name.includes("twitter") || selected.name.includes("x-")
            ? "X"
            : selected.name.includes("fb") || selected.name.includes("face")
              ? "Facebook"
              : "Plataforma de origen"
        );
      }
    },
    []
  );

  const handleSeal = useCallback(async () => {
    if (!file) return;
    const result = await sealFile(file);
    if (result) {
      setSealResult(result);
    }
  }, [file, sealFile]);

  const handleSave = useCallback(() => {
    if (!sealResult) return;
    saveEvidence({
      hash: sealResult.hash,
      shortHash: sealResult.shortHash,
      capturedAt: sealResult.capturedAt,
      sourceType: sourceType || "imagen-local",
      platform,
      originalFilename: sealResult.metadata.originalFilename,
      mimeType: sealResult.metadata.mimeType,
      sizeBytes: sealResult.metadata.sizeBytes,
      contextNote,
      status: "sellada-localmente",
      alertId: initialData?.alertId,
      mode: initialData?.mode || "manual",
      sourceUrl: url,
    });
    setSaved(true);
  }, [sealResult, sourceType, platform, contextNote, saveEvidence, initialData, url]);

  const handleSelectSource = useCallback((typeId: string) => {
    setSourceType(typeId);
    if (typeId === "imagen-local") {
      document.getElementById("evidence-file-input")?.click();
    } else {
      setStep((v) => Math.min(steps.length - 1, v + 1));
    }
  }, []);

  function canAdvance(): boolean {
    if (step === 1 && !sourceType) return false;
    if (step === 2 && sourceType === "imagen-local" && !file) return false;
    if (step === 4 && !sealResult) return false;
    return true;
  }

  function handleNext() {
    if (step === 3 && !sealResult && file) {
      handleSeal();
    }
    if (step === 3 && !sealResult && !file) {
      setStep((v) => Math.min(steps.length - 1, v + 1));
    }
    setStep((v) => Math.min(steps.length - 1, v + 1));
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
                  Inicia una captura. El hash SHA-256 se genera en este dispositivo. Nada se sube sin tu autorización expresa.
                </p>
              </div>
            ) : null}
            {step === 1 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {sourceTypes.map((item) => (
                  <button
                    className={cn(
                      "min-h-20 rounded-md border p-4 text-left font-semibold hover:bg-secondary",
                      sourceType === item.id
                        ? "border-primary bg-secondary text-secondary-foreground"
                        : "border-border bg-surface-card"
                    )}
                    key={item.id}
                    onClick={() => handleSelectSource(item.id)}
                    type="button"
                  >
                    <item.icon aria-hidden="true" className="mb-2 h-5 w-5 text-neutral-500" />
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
            {step === 2 ? (
              <div className="mt-4 space-y-4">
                {sourceType === "imagen-local" ? (
                  <div className="space-y-4">
                    <input
                      accept="image/*,application/pdf,.txt,.csv"
                      className="hidden"
                      id="evidence-file-input"
                      onChange={handleFileChange}
                      type="file"
                    />
                    {file ? (
                      <div className="flex min-h-36 flex-col items-center justify-center rounded-md border border-success-100 bg-success-100 p-6 text-center">
                        <Check className="h-8 w-8 text-success-700" />
                        <p className="mt-3 text-sm font-semibold text-foreground truncate max-w-full">
                          {file.name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-600">
                          {(file.size / 1024).toFixed(1)} KB · {file.type || "desconocido"}
                        </p>
                        <p className="mt-1 text-xs text-success-700">
                          Archivo listo. No ha salido de este dispositivo.
                        </p>
                      </div>
                    ) : (
                      <button
                        className="flex min-h-36 w-full flex-col items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-card p-6 text-center hover:bg-secondary"
                        onClick={() => document.getElementById("evidence-file-input")?.click()}
                        type="button"
                      >
                        <FileLock2 aria-hidden="true" className="h-8 w-8 text-neutral-500" />
                        <p className="mt-3 text-sm font-semibold text-foreground">
                          Selecciona un archivo
                        </p>
                        <p className="mt-1 text-xs text-neutral-600">
                          Imagen, captura de pantalla o PDF. Vista previa difuminada por privacidad.
                        </p>
                      </button>
                    )}
                  </div>
                ) : (
                  <Field
                    helper={isAlertMode && initialData?.sourceUrl ? "Dato pre-llenado desde alerta institucional. Puedes modificarlo." : "No se realiza carga real. Este campo es para referencia."}
                    id="evidence-url"
                    label="URL o referencia"
                  >
                    <Input
                      aria-describedby="evidence-url-helper"
                      className={cn(
                        isAlertMode && initialData?.sourceUrl && "border-info-300 bg-info-50 focus-visible:ring-info-400"
                      )}
                      id="evidence-url"
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://plataforma-demo.example/publicacion"
                      value={url}
                    />
                    {isAlertMode && initialData?.sourceUrl ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-info-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Auto-completado por alerta institucional
                      </span>
                    ) : null}
                  </Field>
                )}
              </div>
            ) : null}
            {step === 3 ? (
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
              </div>
            ) : null}
            {step === 4 ? (
              <div className="mt-4 space-y-4">
                {sealing ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-foreground">Generando sello local</p>
                    <p className="text-xs text-neutral-600">
                      Calculando SHA-256 en este dispositivo...
                    </p>
                  </div>
                ) : sealResult ? (
                  <>
                    <HashBlock algorithm="SHA-256" hash={sealResult.hash} />
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <Badge variant="success">Sellado local</Badge>
                      <Badge variant="neutral">No enviado</Badge>
                      <Badge variant="success">Cifrado</Badge>
                      <Badge variant="info">PDF forense demo preparado</Badge>
                    </div>
                    <div className="rounded-md border border-success-100 bg-success-100 p-3 text-xs font-mono text-neutral-700">
                      <p className="font-semibold">Metadatos del sellado:</p>
                      <p>Archivo: {sealResult.metadata.originalFilename}</p>
                      <p>Tipo: {sealResult.metadata.mimeType}</p>
                      <p>Tamaño: {(sealResult.metadata.sizeBytes / 1024).toFixed(1)} KB</p>
                      <p>Capturado: {new Date(sealResult.capturedAt).toLocaleString("es-MX")}</p>
                    </div>
                    <div className="flex h-28 w-28 items-center justify-center rounded-md border border-border bg-surface-card font-mono text-xs">
                      QR demo
                    </div>
                  </>
                ) : !file ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <FileLock2 aria-hidden="true" className="h-8 w-8 text-neutral-400" />
                    <p className="text-sm text-neutral-600">
                      No hay archivo seleccionado. Regresa al paso de Fuente para seleccionar uno.
                    </p>
                    <Button onClick={() => setStep(1)} type="button" variant="secondary">
                      Ir a seleccionar
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <Shield className="h-8 w-8 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Archivo listo para sellar
                    </p>
                    <p className="text-xs text-neutral-600">
                      Al sellar, se genera un hash SHA-256 unico para este archivo. El archivo no sale del dispositivo.
                    </p>
                    <Button onClick={handleSeal} type="button">
                      <ShieldCheck aria-hidden="true" className="mr-2 h-4 w-4" />
                      Sellar evidencia
                    </Button>
                  </div>
                )}
                {sealError ? (
                  <div className="mt-3 rounded-md border border-danger-100 bg-danger-100 p-3 text-sm leading-6 text-danger-700">
                    No se pudo completar el sellado. Tu archivo sigue en este dispositivo. Intenta nuevamente.
                  </div>
                ) : null}
              </div>
            ) : null}
            {step === 5 ? (
              <div className="mt-4 space-y-4">
                {sealResult ? (
                  <>
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
                    <CustodyTimeline />
                  </>
                ) : (
                  <p className="text-sm text-neutral-600">
                    No hay evidencia sellada para revisar. Completa los pasos anteriores.
                  </p>
                )}
              </div>
            ) : null}
            {step === 6 ? (
              <div className="mt-4 space-y-4">
                {saved ? (
                  <div className="rounded-md border border-success-100 bg-success-100 p-4 text-sm leading-6 text-success-700">
                    Evidencia guardada localmente. Puedes continuar a Chimalli con orientacion o revisar tus evidencias guardadas.
                  </div>
                ) : (
                  <div className="rounded-md border border-warning-100 bg-warning-100 p-4 text-sm leading-6 text-warning-700">
                    Revisa la evidencia antes de guardar. Una vez guardada, permanecera en este dispositivo.
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {!saved && sealResult ? (
                    <Button onClick={handleSave} type="button">
                      <ShieldCheck aria-hidden="true" className="mr-2 h-4 w-4" />
                      Guardar evidencia
                    </Button>
                  ) : null}
                  <Button asChild variant={saved ? "primary" : "secondary"}>
                    <Link href="/app/chimalli">Continuar a Chimalli</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/app/evidence">Ver mis evidencias</Link>
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
            {step < 4 ? (
              <Button
                disabled={!canAdvance()}
                onClick={handleNext}
                type="button"
              >
                Continuar
              </Button>
            ) : step === 4 ? (
              <Button
                disabled={!sealResult}
                onClick={handleNext}
                type="button"
              >
                Revisar antes de enviar
              </Button>
            ) : step < 6 ? (
              <Button onClick={handleNext} type="button">
                {step === 5 ? "Guardar o continuar" : "Continuar"}
              </Button>
            ) : null}
          </div>
        </CardFooter>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Metadatos {sealResult ? "reales" : "demo"}</CardTitle>
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
                    <dt className="font-semibold text-neutral-600">Archivo</dt>
                    <dd className="text-right text-foreground truncate max-w-[180px]">
                      {sealResult.metadata.originalFilename}
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
                    <dt className="font-semibold text-neutral-600">Fecha de captura</dt>
                    <dd className="text-right text-foreground">Pendiente</dd>
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
                    <dt className="font-semibold text-neutral-600">Archivo</dt>
                    <dd className="text-right text-foreground">Pendiente</dd>
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
}

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

export function ChatMessage({ author, content, timestamp, citations, isTyping }: ChatMessageProps) {
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
        {isAssistant ? (
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
      attachments: ChimalliAttachment[];
    };
    vpmrg_test: {
      political_electoral_link: { meets: boolean; reason: string };
      gender_element: { meets: boolean; reason: string };
      political_rights_impact: { meets: boolean; reason: string };
      overall_result: string;
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
  const [messages, setMessages] = useState<
    Array<{ author: "assistant" | "user"; content: string; timestamp: string; citations?: RagCitation[] }>
  >([
    {
      author: "assistant" as const,
      content:
        "Hola. Soy Chimalli. Puedo ayudarte a ordenar una narrativa, identificar elementos preliminares y preparar informacion para revision humana. No sustituyo asesoria legal ni decido si existe una infraccion.",
      timestamp: initialChatTimestamp
    },
    {
      author: "assistant" as const,
      content:
        "Si quieres empezar, cuentame que ocurrio, en que plataforma paso y si esta relacionado con un cargo, candidatura o actividad politica.",
      timestamp: initialChatTimestamp
    }
  ]);
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
      return "Tu informacion permanece local hasta que tu decidas enviarla. Los adjuntos se almacenan solo en esta sesion demo. Nadie mas ve lo que escribes aqui sin tu consentimiento expreso.";
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
      const response = await fetch(`${apiUrl}/api/v1/chimalli/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: outgoing,
          case_id: currentCaseId,
          attachment_ids: outgoingAttachments.map((attachment) => attachment.attachment_id)
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo solicitar orientacion. Tu informacion sigue en esta pantalla.");
      }

      const payload = (await response.json()) as ChimalliChatPayload;

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
        <CardContent className="flex h-[420px] flex-col">
          <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((message, index) => {
              const isTyping = typingIndex === index;
              return (
                <ChatMessage
                  author={message.author}
                  citations={message.citations ?? ragSourcesMap[index]}
                  content={isTyping ? typingText : message.content}
                  isTyping={isTyping}
                  key={`${message.author}-${index}`}
                  timestamp={isTyping ? "" : message.timestamp}
                />
              );
            })}
            {isLoading && !isUploading ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-card px-4 py-3">
                <Bot aria-hidden="true" className="h-4 w-4 animate-pulse text-primary" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-neutral-700">Analizando tu narrativa</span>
                  <span className="inline-flex gap-0.5 pb-0.5">
                    <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:0ms]" />
                    <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                    <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
          <div className="mt-4 shrink-0 space-y-3 border-t border-border pt-4">
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
