import {
  Activity,
  BarChart3,
  Bell,
  BookOpenCheck,
  ClipboardCheck,
  FileCheck2,
  FileLock2,
  Fingerprint,
  Gauge,
  Home,
  Landmark,
  Lock,
  MessageSquareText,
  Scale,
  ShieldCheck,
  UsersRound
} from "lucide-react";

import type { DemoRole, EvidenceStatus, NavItem, PrivacyState, RiskLevel } from "@/lib/types";

export const demoRoles: Array<{
  id: DemoRole;
  label: string;
  title: string;
  description: string;
  href: string;
  icon: typeof ShieldCheck;
}> = [
  {
    id: "protected",
    label: "Mujer en la Vida Política",
    title: "Preservar evidencia y recibir orientación",
    description:
      "Captura evidencia forense digital, revisa el contenido sellado y recibe orientación procedimental con Chimalli.",
    href: "/onboarding",
    icon: ShieldCheck
  },
  {
    id: "analyst",
    label: "Mesa de Análisis (IEEBC)",
    title: "Monitoreo y revisión institucional",
    description:
      "Revisa alertas preventivas, detección de patrones coordinados y canalización de casos de VPMRG.",
    href: "/app/tlachia",
    icon: Landmark
  },
  {
    id: "reviewer",
    label: "Autoridad Resolutora",
    title: "Consulta verificable y bitácora",
    description:
      "Accede a expedientes en análisis, verificación de hashes, cadena de custodia y observaciones institucionales.",
    href: "/app/reviewer",
    icon: Scale
  },
  {
    id: "observer",
    label: "Observatorio Electoral",
    title: "Datos públicos agregados",
    description:
      "Explora métricas anonimizadas sobre violencia política y seguimiento institucional.",
    href: "/public",
    icon: UsersRound
  }
];

export const roleLabels: Record<DemoRole, string> = {
  protected: "Mujer en la Vida Política",
  analyst: "Mesa de Análisis (IEEBC)",
  reviewer: "Autoridad Resolutora",
  observer: "Observatorio Electoral"
};

export const navItemsByRole: Record<DemoRole, NavItem[]> = {
  protected: [
    { label: "Inicio", href: "/onboarding", icon: Home },
    { label: "Capturar evidencia", href: "/app/machiyotl", icon: FileLock2 },
    { label: "Alertas preventivas", href: "/app/machiyotl/alerts", icon: Bell },
    { label: "Mis evidencias", href: "/app/evidence", icon: FileCheck2 },
    { label: "Chat", href: "/app/chimalli", icon: MessageSquareText },
    { label: "Expediente digital", href: "/app/kit", icon: ClipboardCheck },
    { label: "Privacidad", href: "/app/privacy", icon: Lock }
  ],
  analyst: [
    { label: "Panel Tlachia", href: "/app/tlachia", icon: BarChart3 },
    { label: "Casos Canalizados", href: "/app/cases/VPMRG-2026-042", icon: ClipboardCheck },
    { label: "Métricas Institucionales", href: "/public", icon: Gauge },
    { label: "Auditoría de Acceso", href: "/app/privacy", icon: Lock }
  ],
  reviewer: [
    { label: "Expedientes asignados", href: "/app/reviewer", icon: Scale },
    { label: "Verificación de Evidencia", href: "/verify", icon: Fingerprint },
    { label: "Bitácora Judicial", href: "/app/cases/VPMRG-2026-042", icon: BookOpenCheck }
  ],
  observer: [
    { label: "Estadística Estatal", href: "/public", icon: BarChart3 },
    { label: "Criterios Jurisprudenciales", href: "/public#metodologia", icon: BookOpenCheck },
    { label: "Verificador SHA-256", href: "/verify", icon: Fingerprint }
  ]
};

export const platforms = [
  "X (Twitter)",
  "Facebook",
  "TikTok",
  "Instagram",
  "Reddit"
];

export const hashes = [
  "9f2a7c18c0a91be7f5b29a64541a6d8e7b31c42e99e12aa30ef45ac8d18b40",
  "7bb4c1f091a82e354d77ab21cc5307f4c32a8892d8fb0191a7514c0b829ea53d",
  "32a019d0d7333d9910ec2fb14b28f4aa429b03c8d7a650ef8812b936a8e4b021",
  "c04d86cf24fdb9e9105a4c80dc5e8fc9d0f04f99a83c730c6be55f142b79bd12"
];

export const alertTrend = [
  { date: "Lun", alertas: 42, revision: 12 },
  { date: "Mar", alertas: 58, revision: 18 },
  { date: "Mie", alertas: 63, revision: 22 },
  { date: "Jue", alertas: 124, revision: 45 },
  { date: "Vie", alertas: 156, revision: 62 },
  { date: "Sab", alertas: 89, revision: 31 },
  { date: "Dom", alertas: 72, revision: 24 }
];

export const platformDistribution = [
  { platform: "X", alertas: 182 },
  { platform: "Facebook", alertas: 145 },
  { platform: "TikTok", alertas: 86 },
  { platform: "Instagram", alertas: 64 },
  { platform: "Reddit", alertas: 23 }
];

export const publicTrend = [
  { month: "Ene", alertas: 112, canalizadas: 28 },
  { month: "Feb", alertas: 145, canalizadas: 35 },
  { month: "Mar", alertas: 210, canalizadas: 52 },
  { month: "Abr", alertas: 384, canalizadas: 89 },
  { month: "May", alertas: 604, canalizadas: 142 }
];

export const conductDistribution = [
  { type: "Difamación c/estereotipos", value: 45 },
  { type: "Campañas coordinadas (Bots)", value: 32 },
  { type: "Violencia sexual digital", value: 15 },
  { type: "Amenazas y hostigamiento", value: 8 }
];

export const caseFunnel = [
  { stage: "Señales procesadas", count: 12450 },
  { stage: "Alertas preventivas", count: 604 },
  { stage: "Evidencias forenses", count: 312 },
  { stage: "Kits de denuncia", count: 186 },
  { stage: "Expedientes canalizados", count: 142 }
];

export const tlachiaAlerts: Array<{
  id: string;
  date: string;
  protectedPerson: string;
  platform: string;
  risk: RiskLevel;
  reason: string;
  status: string;
  action: string;
  cluster: string;
}> = [
  {
    id: "TLA-2026-007",
    date: "16 may 2026, 08:00",
    protectedPerson: "Concejala Municipal",
    platform: "X",
    risk: "high",
    reason: "Campaña coordinada de 56 cuentas durante sesión de cabildo.",
    status: "Pendiente de revisión humana",
    action: "Revisar",
    cluster: "Ataque en ráfaga coordinado"
  },
  {
    id: "TLA-2026-003",
    date: "15 may 2026, 18:30",
    protectedPerson: "Regidora Municipal",
    platform: "Facebook",
    risk: "high",
    reason: "Distribución de contenido denigrante en grupo cerrado (18 cuentas).",
    status: "En análisis",
    action: "Actualizar",
    cluster: "Difamación (Plantilla)"
  },
  {
    id: "TLA-2026-004",
    date: "14 may 2026, 16:45",
    protectedPerson: "Candidata a Presidencia Municipal",
    platform: "TikTok",
    risk: "medium",
    reason: "Lenguaje sexista en comentarios de video de campaña (Alto alcance).",
    status: "Observación preventiva",
    action: "Descartar/Escalar",
    cluster: "Hostigamiento viral"
  }
];

export const alertMentions = [
  {
    account: "@usuario_anon123",
    time: "08:12",
    content: "Mensaje difamatorio detectado con lenguaje de género protegido.",
    signal: "Similitud de plantilla"
  },
  {
    account: "@red_bot_bc_04",
    time: "08:15",
    content: "Ataque coordinado cuestionando la capacidad política por estereotipos.",
    signal: "Actividad en ráfaga"
  },
  {
    account: "Cuenta anónima (Facebook)",
    time: "18:35",
    content: "[Contenido sensible oculto: Infracción potencial Art. 20 Ter LGAMVLV]",
    signal: "Lenguaje de género"
  }
];

export const riskClusters = [
  {
    id: "Ataque en ráfaga coordinado",
    label: "Actividad sincronizada (Astroturfing)",
    accounts: 56,
    window: "20 min",
    status: "Requiere atención prioritaria"
  },
  {
    id: "Difamación (Plantilla)",
    label: "Mensajes con estructura idéntica",
    accounts: 18,
    window: "1 h 15 min",
    status: "En análisis institucional"
  },
  {
    id: "Hostigamiento viral",
    label: "Incremento atípico en comentarios",
    accounts: 12,
    window: "2 h",
    status: "Monitoreo preventivo"
  }
];

export const explainabilitySignals = [
  "Actividad en ráfaga: Múltiples menciones en ventana de tiempo reducida",
  "Lenguaje de género: Uso de términos tipificados (Art. 20 Ter LGAMVLV)",
  "Similitud de plantilla: Estructura de texto idéntica o altamente similar",
  "Hilo de alto alcance: Score de engagement superior al umbral viral",
  "Contexto electoral: Coincidencia temporal con actos de campaña oficiales"
];

export const custodyEvents = [
  {
    title: "Extracción pericial iniciada",
    timestamp: "15 may 2026, 10:04",
    actor: "Entorno local (Usuario)",
    description: "Captura forense digital iniciada en dispositivo del usuario."
  },
  {
    title: "Sello digital criptográfico",
    timestamp: "15 may 2026, 10:06",
    actor: "Motor Machiyotl",
    description: "Generación de firma electrónica y hash SHA-256 completada."
  },
  {
    title: "Metadatos consolidados",
    timestamp: "15 may 2026, 10:08",
    actor: "Entorno local (Usuario)",
    description: "Revisión de parámetros técnicos, fecha y URL original concluida."
  },
  {
    title: "Expediente digital integrado",
    timestamp: "15 may 2026, 10:18",
    actor: "Módulo Chimalli",
    description: "Generación de constancia pericial en formato PDF (Estándar OEA)."
  },
  {
    title: "Recepción institucional",
    timestamp: "Pendiente",
    actor: "Oficialía Electoral",
    description: "Acuse de recibo físico o electrónico no emitido aún."
  }
];

export const evidences: Array<{
  id: string;
  title: string;
  type: string;
  platform: string;
  date: string;
  status: EvidenceStatus;
  privacy: PrivacyState;
  hash: string;
  uploadStatus: string;
  custody: string;
  alertId?: string;
  alertCode?: string;
  riskLevel?: string;
  motive?: string;
  protectedPerson?: string;
  tlachiaSignals?: Array<{ label: string; explanation: string; weight: number }>;
}> = [
  {
    id: "ev-001",
    title: "Registro Forense VPMRG (Hilo de X)",
    type: "Screenshot Forense",
    platform: "X",
    date: "15 may 2026, 10:06",
    status: "sealed-local",
    privacy: "local-only",
    hash: hashes[0],
    uploadStatus: "No canalizado",
    custody: "Sello criptográfico íntegro",
    alertId: "TLA-2026-002",
    alertCode: "TLA-2026-002",
    riskLevel: "high",
    motive: "Ráfaga coordinada de 42 cuentas con mensajes difamatorios basados en estereotipos de género.",
    protectedPerson: "Candidata a Diputación Local",
    tlachiaSignals: [
      { label: "Lenguaje de género", explanation: "Términos tipificados", weight: 25 },
      { label: "Similitud de plantilla", explanation: "Textos con estructura similar", weight: 20 },
    ],
  },
  {
    id: "ev-002",
    title: "Extracción URL (Facebook Groups)",
    type: "Copia Web (WARC)",
    platform: "Facebook",
    date: "15 may 2026, 10:11",
    status: "ready",
    privacy: "ready-to-send",
    hash: hashes[1],
    uploadStatus: "Integrado en expediente",
    custody: "Metadatos consolidados",
  },
  {
    id: "ev-003",
    title: "Acta Circunstanciada",
    type: "Documento Legal",
    platform: "Registro Oficial",
    date: "14 may 2026, 19:32",
    status: "draft",
    privacy: "not-uploaded",
    hash: hashes[2],
    uploadStatus: "En redacción",
    custody: "Firma electrónica pendiente",
  },
];

export const chimalliMessages = [
  {
    id: "msg-1",
    author: "assistant" as const,
    content:
      "Bienvenida. El módulo Chimalli le asiste en la integración de evidencia digital y fundamentación jurídica. Las sugerencias deben ser validadas por la autoridad electoral."
  },
  {
    id: "msg-2",
    author: "assistant" as const,
    content:
      "Para clasificar correctamente la constancia, confirme si los hechos documentados afectan directamente el ejercicio de un cargo público o candidatura."
  },
  {
    id: "msg-3",
    author: "user" as const,
    content: "Sí, afecta el desarrollo de una campaña municipal."
  },
  {
    id: "msg-4",
    author: "assistant" as const,
    content:
      "Registrado. Esta información permite encuadrar la evidencia bajo los criterios del TEPJF (Jurisprudencia 21/2018) sobre Violencia Política en Razón de Género."
  }
];

export const extractedInfo = [
  { label: "Titular de Derechos", value: "Pendiente de validación", state: "Requiere captura" },
  { label: "Dimensión Político-Electoral", value: "Campaña municipal", state: "Confirmado" },
  { label: "Cargo Público/Candidatura", value: "Presidencia Municipal", state: "En análisis" },
  { label: "Plataforma Tecnológica", value: "Múltiples (X, Facebook)", state: "Confirmado" },
  { label: "Jurisdicción Presunta", value: "Baja California", state: "Identificado" }
];

export const vpmrgTest = [
  {
    element: "Incidencia en Derechos Político-Electorales",
    result: "Positivo (Jurisprudencia 21/2018)",
    resultMeets: true,
    note: "Se documenta afectación a campaña activa."
  },
  {
    element: "Conducta basada en elementos de género",
    result: "En evaluación",
    resultMeets: undefined,
    note: "Se requiere revisión manual de expresiones denigrantes contenidas en evidencia."
  },
  {
    element: "Impacto desproporcionado / Estereotipos",
    result: "Pendiente de calificación jurídica",
    resultMeets: undefined,
    note: "La determinación final corresponde al tribunal competente."
  }
];

export const authoritySuggestion = {
  title: "Vía Institucional Sugerida",
  authority: "Instituto Estatal Electoral de Baja California (IEEBC)",
  basis:
    "Procedimiento Especial Sancionador (PES) conforme al artículo 373 de la Ley Electoral del Estado de BC.",
  status: "Requiere ratificación de titular"
};

export const evidenceKit = {
  id: "VPMRG-2026-042",
  protectedPerson: "Concejala Municipal",
  summary:
    "Expediente técnico con certificación criptográfica, extracción forense de 2 plataformas y encuadre preliminar de VPMRG.",
  narrative:
    "Registro de ataques coordinados documentados mediante motor Machiyotl el 15 y 16 de mayo de 2026.",
  destination: "Oficialía Electoral del IEEBC",
  localOnly:
    "Cadena de custodia íntegra preservada localmente. Los archivos no han sido transmitidos a la autoridad."
};

export const cases = [
  {
    id: "VPMRG-2026-042",
    title: "Expediente VPMRG-2026-042",
    status: "En análisis jurídico",
    person: "Concejala Municipal",
    receivedAt: "15 may 2026, 11:20",
    evidenceCount: 2,
    reviewer: "Mesa de Recepción IEEBC"
  },
  {
    id: "VPMRG-2026-038",
    title: "Expediente VPMRG-2026-038",
    status: "Prevención (Acuerdo)",
    person: "Candidata a Diputación",
    receivedAt: "14 may 2026, 16:42",
    evidenceCount: 3,
    reviewer: "Secretaría Ejecutiva IEEBC"
  }
];

export const auditLogs = [
  {
    time: "15 may 2026, 11:20",
    actor: "Sistema de Trazabilidad",
    action: "Recepción de Constancia",
    detail: "Registro de acuse criptográfico generado."
  },
  {
    time: "15 may 2026, 11:22",
    actor: "Secretaría Ejecutiva",
    action: "Validación SHA-256",
    detail: "Correspondencia forense confirmada positiva."
  },
  {
    time: "15 may 2026, 11:28",
    actor: "Unidad Técnica (Chimalli)",
    action: "Encuadre Legal Asistido",
    detail: "Mapeo a Jurisprudencia 21/2018 disponible para revisión."
  }
];

export const publicMetrics = [
  { label: "Alertas Preventivas", value: "604", context: "Periodo Electoral 2026" },
  { label: "Expedientes Criptográficos", value: "186", context: "Garantía de No Repudio" },
  { label: "Resolución Promedio", value: "36 h", context: "Trámite de PES" },
  { label: "Privacidad Garantizada", value: "100%", context: "Cifrado de Punto a Punto" }
];

