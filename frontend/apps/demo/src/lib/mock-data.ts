import {
  Activity,
  BarChart3,
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
    label: "Mujer protegida",
    title: "Preservar evidencia y recibir orientación",
    description:
      "Captura evidencia demo, revisa qué se enviaría y recibe guía procedimental con Chimalli.",
    href: "/onboarding",
    icon: ShieldCheck
  },
  {
    id: "analyst",
    label: "Autoridad electoral / Analista",
    title: "Monitoreo y revisión institucional",
    description:
      "Revisa alertas sugeridas, patrones detectados, explicabilidad y expedientes recibidos.",
    href: "/app/tlachia",
    icon: Landmark
  },
  {
    id: "reviewer",
    label: "Persona juzgadora / Revisor",
    title: "Consulta verificable y bitácora",
    description:
      "Accede a expedientes asignados en modo lectura, hashes, timeline y comentarios mock.",
    href: "/app/reviewer",
    icon: Scale
  },
  {
    id: "observer",
    label: "Observación ciudadana",
    title: "Datos públicos agregados",
    description:
      "Explora métricas anonimizadas, metodología y privacidad sin información sensible.",
    href: "/public",
    icon: UsersRound
  }
];

export const roleLabels: Record<DemoRole, string> = {
  protected: "Mujer protegida",
  analyst: "Autoridad electoral / Analista",
  reviewer: "Persona juzgadora / Revisor",
  observer: "Observación ciudadana"
};

export const navItemsByRole: Record<DemoRole, NavItem[]> = {
  protected: [
    { label: "Inicio", href: "/onboarding", icon: Home },
    { label: "Capturar evidencia", href: "/app/machiyotl", icon: FileLock2 },
    { label: "Mis evidencias", href: "/app/evidence", icon: FileCheck2 },
    { label: "Chimalli", href: "/app/chimalli", icon: MessageSquareText },
    { label: "Kit de evidencia", href: "/app/kit", icon: ClipboardCheck },
    { label: "Privacidad", href: "/app/privacy", icon: Lock }
  ],
  analyst: [
    { label: "Panel Tlachia", href: "/app/tlachia", icon: BarChart3 },
    { label: "Alertas", href: "/app/tlachia/alerts/tla-1024", icon: Activity },
    { label: "Casos recibidos", href: "/app/cases/case-018", icon: ClipboardCheck },
    { label: "Reportes agregados", href: "/public", icon: Gauge },
    { label: "Privacidad", href: "/app/privacy", icon: Lock }
  ],
  reviewer: [
    { label: "Expedientes asignados", href: "/app/reviewer", icon: Scale },
    { label: "Evidencia verificable", href: "/verify", icon: Fingerprint },
    { label: "Bitácora", href: "/app/cases/case-018", icon: BookOpenCheck }
  ],
  observer: [
    { label: "Datos agregados", href: "/public", icon: BarChart3 },
    { label: "Metodología", href: "/public#metodologia", icon: BookOpenCheck },
    { label: "Verificador", href: "/verify", icon: Fingerprint }
  ]
};

export const platforms = [
  "Plataforma demo A",
  "Plataforma demo B",
  "Plataforma demo C",
  "Mensajería pública demo"
];

export const hashes = [
  "9f2a7c18c0a91be7f5b29a64541a6d8e7b31c42e99e12aa30ef45ac8d18b40",
  "7bb4c1f091a82e354d77ab21cc5307f4c32a8892d8fb0191a7514c0b829ea53d",
  "32a019d0d7333d9910ec2fb14b28f4aa429b03c8d7a650ef8812b936a8e4b021",
  "c04d86cf24fdb9e9105a4c80dc5e8fc9d0f04f99a83c730c6be55f142b79bd12"
];

export const alertTrend = [
  { date: "Lun", alertas: 18, revision: 8 },
  { date: "Mar", alertas: 26, revision: 10 },
  { date: "Mie", alertas: 21, revision: 9 },
  { date: "Jue", alertas: 34, revision: 13 },
  { date: "Vie", alertas: 39, revision: 16 },
  { date: "Sab", alertas: 24, revision: 11 },
  { date: "Dom", alertas: 17, revision: 7 }
];

export const platformDistribution = [
  { platform: "Demo A", alertas: 42 },
  { platform: "Demo B", alertas: 31 },
  { platform: "Demo C", alertas: 22 },
  { platform: "Mensajeria", alertas: 13 }
];

export const publicTrend = [
  { month: "Ene", alertas: 42, canalizadas: 18 },
  { month: "Feb", alertas: 48, canalizadas: 21 },
  { month: "Mar", alertas: 61, canalizadas: 29 },
  { month: "Abr", alertas: 55, canalizadas: 27 },
  { month: "May", alertas: 69, canalizadas: 34 }
];

export const conductDistribution = [
  { type: "Lenguaje basado en genero", value: 38 },
  { type: "Coordinacion aparente", value: 24 },
  { type: "Desinformacion personal", value: 20 },
  { type: "Hostigamiento repetido", value: 18 }
];

export const caseFunnel = [
  { stage: "Senales detectadas", count: 128 },
  { stage: "Alertas revisadas", count: 72 },
  { stage: "Evidencias selladas", count: 46 },
  { stage: "Kits preparados", count: 28 },
  { stage: "Canalizacion sugerida", count: 19 }
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
    id: "tla-1024",
    date: "15 may 2026, 09:40",
    protectedPerson: "Persona protegida 01",
    platform: "Plataforma demo A",
    risk: "high",
    reason: "Actividad concentrada y mensajes similares",
    status: "Pendiente de revision humana",
    action: "Abrir alerta",
    cluster: "Cluster demo 07"
  },
  {
    id: "tla-1018",
    date: "15 may 2026, 08:25",
    protectedPerson: "Candidata A",
    platform: "Plataforma demo B",
    risk: "medium",
    reason: "Lenguaje potencialmente basado en genero",
    status: "En revision",
    action: "Marcar para revision",
    cluster: "Cluster demo 03"
  },
  {
    id: "tla-1009",
    date: "14 may 2026, 18:10",
    protectedPerson: "Persona protegida 02",
    platform: "Plataforma demo C",
    risk: "low",
    reason: "Incremento atipico de menciones publicas",
    status: "Observacion",
    action: "Descartar con motivo",
    cluster: "Cluster demo 01"
  }
];

export const alertMentions = [
  {
    account: "Cuenta senalada 04",
    time: "09:18",
    content: "Mensaje demo anonimizado con fragmentos no textuales.",
    signal: "Similaridad de estructura"
  },
  {
    account: "Cuenta senalada 12",
    time: "09:21",
    content: "Referencia sintetica a cargo publico sin contenido real.",
    signal: "Publicacion en ventana corta"
  },
  {
    account: "Cuenta senalada 19",
    time: "09:27",
    content: "Mencion demo omitida para no replicar expresiones daninas.",
    signal: "Lenguaje potencialmente basado en genero"
  }
];

export const riskClusters = [
  {
    id: "Cluster demo 07",
    label: "Actividad concentrada",
    accounts: 18,
    window: "42 min",
    status: "Requiere revision"
  },
  {
    id: "Cluster demo 03",
    label: "Mensajes con estructura similar",
    accounts: 11,
    window: "1 h 15 min",
    status: "En analisis"
  },
  {
    id: "Cluster demo 01",
    label: "Menciones atipicas",
    accounts: 7,
    window: "3 h",
    status: "Observacion"
  }
];

export const explainabilitySignals = [
  "Cuentas recientes con actividad publica sincronizada",
  "Mensajes similares en estructura y horario",
  "Actividad concentrada en poco tiempo",
  "Lenguaje potencialmente basado en genero",
  "La sugerencia requiere validacion humana"
];

export const custodyEvents = [
  {
    title: "Captura iniciada",
    timestamp: "15 may 2026, 10:04",
    actor: "Mujer protegida",
    description: "Se inicio captura demo en dispositivo local."
  },
  {
    title: "Evidencia sellada",
    timestamp: "15 may 2026, 10:06",
    actor: "Machiyotl",
    description: "Se genero un hash SHA-256 simulado sin enviar contenido."
  },
  {
    title: "Metadatos revisados",
    timestamp: "15 may 2026, 10:08",
    actor: "Mujer protegida",
    description: "La informacion tecnica quedo lista para revision."
  },
  {
    title: "Expediente generado",
    timestamp: "15 may 2026, 10:18",
    actor: "Chimalli",
    description: "Se preparo un kit demo revisable."
  },
  {
    title: "Recibido por autoridad",
    timestamp: "Pendiente",
    actor: "Autoridad competente",
    description: "Este paso no ocurre en la demo hasta confirmar revision."
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
}> = [
  {
    id: "ev-001",
    title: "Captura demo de publicacion",
    type: "Screenshot",
    platform: "Plataforma demo A",
    date: "15 may 2026, 10:06",
    status: "sealed-local",
    privacy: "local-only",
    hash: hashes[0],
    uploadStatus: "No enviado",
    custody: "Evidencia sellada"
  },
  {
    id: "ev-002",
    title: "URL publica demo",
    type: "Enlace",
    platform: "Plataforma demo B",
    date: "15 may 2026, 10:11",
    status: "ready",
    privacy: "ready-to-send",
    hash: hashes[1],
    uploadStatus: "Listo para revision",
    custody: "Metadatos revisados"
  },
  {
    id: "ev-003",
    title: "Nota contextual",
    type: "Texto",
    platform: "Registro local",
    date: "14 may 2026, 19:32",
    status: "draft",
    privacy: "not-uploaded",
    hash: hashes[2],
    uploadStatus: "No enviado",
    custody: "Captura iniciada"
  }
];

export const chimalliMessages = [
  {
    id: "msg-1",
    author: "assistant" as const,
    content:
      "Hola. Soy Chimalli. Puedo ayudarte a organizar informacion y preparar un kit revisable; no sustituyo asesoria legal ni decido si existe una infraccion."
  },
  {
    id: "msg-2",
    author: "assistant" as const,
    content:
      "Primero, una pregunta: ¿la situacion esta relacionada con un cargo, aspiracion politica o actividad publica?"
  },
  {
    id: "msg-3",
    author: "user" as const,
    content: "Si, esta relacionada con una candidatura local en Municipio demo."
  },
  {
    id: "msg-4",
    author: "assistant" as const,
    content:
      "Gracias. Puedo guardar ese contexto como sugerencia editable. La autoridad competente debe validar cualquier ruta."
  }
];

export const extractedInfo = [
  { label: "Persona protegida", value: "Sin dato", state: "Editable" },
  { label: "Contexto politico", value: "Sin dato", state: "Pendiente" },
  { label: "Cargo o posicion", value: "Sin dato", state: "Pendiente" },
  { label: "Plataforma", value: "Sin dato", state: "Pendiente" },
  { label: "Ubicacion", value: "Sin dato", state: "Pendiente" }
];

export const vpmrgTest = [
  {
    element: "Contexto politico-electoral",
    result: "Pendiente",
    resultMeets: undefined,
    note: "Aun no hay narrativa suficiente para orientar este elemento."
  },
  {
    element: "Conducta basada en genero",
    result: "Pendiente",
    resultMeets: undefined,
    note: "Aun no se han descrito expresiones o conductas para revisar."
  },
  {
    element: "Impacto en derechos politicos",
    result: "Pendiente de revisar",
    resultMeets: undefined,
    note: "Falta documentar si existe posible afectacion a derechos politico-electorales."
  }
];

export const authoritySuggestion = {
  title: "Sugerencia de canalizacion",
  authority: "Autoridad electoral competente demo",
  basis:
    "Ruta simulada para revision humana. No constituye determinacion legal ni sustituye asesoria.",
  status: "Requiere validacion de autoridad"
};

export const evidenceKit = {
  id: "kit-2026-018",
  protectedPerson: "Persona protegida 01",
  summary:
    "Kit demo con evidencia sellada localmente, narrativa revisable y sugerencia de canalizacion pendiente de validacion humana.",
  narrative:
    "La persona protegida describe actividad publica coordinada y mensajes potencialmente basados en genero durante una etapa electoral demo.",
  destination: "Autoridad electoral competente demo",
  localOnly:
    "Archivos originales y notas privadas permanecen en este dispositivo hasta aprobacion expresa."
};

export const cases = [
  {
    id: "case-018",
    title: "Expediente demo 018",
    status: "Pendiente de decision humana",
    person: "Persona protegida 01",
    receivedAt: "15 may 2026, 11:20",
    evidenceCount: 2,
    reviewer: "Mesa de revision demo"
  },
  {
    id: "case-014",
    title: "Expediente demo 014",
    status: "Solicitud de informacion",
    person: "Persona protegida 03",
    receivedAt: "14 may 2026, 16:42",
    evidenceCount: 3,
    reviewer: "Mesa de revision demo"
  }
];

export const auditLogs = [
  {
    time: "15 may 2026, 11:20",
    actor: "Sistema demo",
    action: "Expediente recibido",
    detail: "Registro visible para auditoria."
  },
  {
    time: "15 may 2026, 11:22",
    actor: "Analista demo",
    action: "Hash revisado",
    detail: "No se abrio contenido sensible."
  },
  {
    time: "15 may 2026, 11:28",
    actor: "Chimalli",
    action: "Sugerencia generada por IA",
    detail: "Pendiente de validacion humana."
  }
];

export const publicMetrics = [
  { label: "Alertas agregadas", value: "128", context: "Periodo demo actual" },
  { label: "Kits preparados", value: "28", context: "Sin datos personales" },
  { label: "Tiempo promedio", value: "36 h", context: "Canalizacion simulada" },
  { label: "Grupos anonimizados", value: "k>=10", context: "Umbral minimo demo" }
];
