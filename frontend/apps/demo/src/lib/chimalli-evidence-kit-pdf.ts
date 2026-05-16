export interface ChimalliEvidenceKitAttachment {
  attachment_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  status: string;
  extracted_text: string | null;
  visual_summary: string | null;
  warning: string;
}

export interface ChimalliEvidenceKitCase {
  case_id: string;
  created_at?: string;
  human_review_notice?: string;
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
    attachments: ChimalliEvidenceKitAttachment[];
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
  rag_sources?: Array<{
    source_file: string;
    collection?: string;
    institution?: string;
    page?: number;
    excerpt?: string;
  }>;
}

export interface EvidenceKitReadiness {
  ready: boolean;
  shouldNotGenerate: boolean;
  summary: string;
  missing: string[];
}

const EXPLICIT_KIT_PHRASES = [
  "genera el kit",
  "generar el kit",
  "prepara el kit",
  "preparar el kit",
  "prepara el expediente",
  "generar expediente",
  "genera el expediente",
  "eso es todo",
  "ya termine",
  "ya terminé",
  "quiero descargar el pdf",
  "descargar el pdf",
  "haz el pdf"
];

export function isEvidenceKitRequest(message: string) {
  const normalized = message.trim().toLowerCase();
  return EXPLICIT_KIT_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function evaluateEvidenceKitReadiness(caseData: ChimalliEvidenceKitCase): EvidenceKitReadiness {
  const missing: string[] = [];
  const narrative = caseData.facts.narrative?.trim() ?? "";
  const hasPoliticalLink = caseData.vpmrg_test.political_electoral_link.meets;
  const hasGenderElement = caseData.vpmrg_test.gender_element.meets;
  const hasRightsImpact = caseData.vpmrg_test.political_rights_impact.meets;
  const hasPlatform = Boolean(caseData.facts.platform || caseData.victim.state || caseData.victim.municipality);
  const hasEvidence = Boolean(
    caseData.facts.attachments.length ||
      caseData.facts.evidence?.some((evidence) => evidence.evidence_hash)
  );
  const hasRouting = Boolean(caseData.jurisdiction?.suggested_authority && caseData.jurisdiction.procedure);

  if (caseData.vpmrg_test.overall_result === "not_indicated") {
    return {
      ready: false,
      shouldNotGenerate: true,
      summary:
        "Con la informacion actual no se identifica un vinculo suficiente con materia politico-electoral. Chimalli no debe generar un expediente PES sin revision y contexto adicional.",
      missing: ["Confirmar si los hechos se relacionan con candidatura, cargo publico, actividad politica o participacion electoral."]
    };
  }

  if (narrative.length < 80) {
    missing.push("una narrativa mas completa de lo ocurrido");
  }
  if (!hasPoliticalLink) {
    missing.push("confirmar el vinculo politico-electoral");
  }
  if (!hasGenderElement) {
    missing.push("describir si hubo expresiones o efectos relacionados con genero");
  }
  if (!hasRightsImpact) {
    missing.push("explicar como afecto derechos, campana, cargo o participacion politica");
  }
  if (!hasPlatform) {
    missing.push("indicar plataforma, municipio, estado o contexto territorial");
  }
  if (!hasEvidence) {
    missing.push("adjuntar o referenciar evidencia preservada");
  }
  if (!hasRouting) {
    missing.push("validar una ruta preliminar de canalizacion");
  }

  return {
    ready: missing.length === 0,
    shouldNotGenerate: false,
    summary: missing.length
      ? `Todavia falta ${missing[0]} para preparar un kit util y revisable.`
      : "El caso cuenta con informacion minima para preparar un kit de evidencia revisable.",
    missing
  };
}

export function evidenceKitGuidance(readiness: EvidenceKitReadiness) {
  if (readiness.shouldNotGenerate) {
    return readiness.summary;
  }
  if (!readiness.missing.length) {
    return readiness.summary;
  }
  return `${readiness.summary} Para hacerlo bien, necesito confirmar: ${readiness.missing[0]}.`;
}

export async function downloadChimalliEvidenceKit(caseData: ChimalliEvidenceKitCase) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = 54;

  const colors = {
    brand: "#421557",
    brandLight: "#F7EAF8",
    plum: "#7A1E4D",
    text: "#1E1A23",
    muted: "#5F5468",
    border: "#C9C2CE"
  };

  function addFooter() {
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(colors.border);
      doc.line(margin, pageHeight - 44, pageWidth - margin, pageHeight - 44);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(colors.muted);
      doc.text("Chimalli · Kit de evidencia asistivo · No constituye denuncia automatica", margin, pageHeight - 28);
      doc.text(`Pagina ${page} de ${pages}`, pageWidth - margin - 52, pageHeight - 28);
    }
  }

  function ensureSpace(height: number) {
    if (y + height < pageHeight - 72) {
      return;
    }
    doc.addPage();
    y = 54;
  }

  function section(title: string) {
    ensureSpace(42);
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(colors.brand);
    doc.text(title, margin, y);
    y += 16;
    doc.setDrawColor(colors.border);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;
  }

  function paragraph(text: string, options: { fontSize?: number; color?: string; bold?: boolean } = {}) {
    const fontSize = options.fontSize ?? 10;
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(options.color ?? colors.text);
    const lines = doc.splitTextToSize(text || "Sin informacion registrada.", pageWidth - margin * 2);
    ensureSpace(lines.length * (fontSize + 4) + 8);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize + 4) + 8;
  }

  function keyValue(label: string, value: string | null | undefined) {
    ensureSpace(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(colors.muted);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    const lines = doc.splitTextToSize(value || "Pendiente de confirmar", pageWidth - margin * 2 - 150);
    doc.text(lines, margin + 150, y);
    y += Math.max(24, lines.length * 13 + 6);
  }

  doc.setFillColor(colors.brand);
  doc.rect(0, 0, pageWidth, 118, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Kit de evidencia Chimalli", margin, 58);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Borrador asistivo para revision humana y validacion institucional", margin, 82);
  doc.setFillColor(colors.brandLight);
  doc.roundedRect(margin, 144, pageWidth - margin * 2, 84, 12, 12, "F");
  y = 172;
  paragraph("Este documento organiza informacion proporcionada por la persona usuaria y evidencia referenciada. No confirma hechos, no acredita VPMRG por si mismo y no constituye denuncia automatica.", {
    color: colors.brand,
    bold: true
  });

  section("1. Identificacion del caso");
  keyValue("Caso Chimalli", caseData.case_id);
  keyValue("Fecha de generacion", new Date().toLocaleString("es-MX"));
  keyValue("Persona protegida", caseData.victim.name);
  keyValue("Cargo o actividad", caseData.victim.position ?? caseData.victim.role);
  keyValue("Ubicacion", [caseData.victim.municipality, caseData.victim.state].filter(Boolean).join(", "));

  section("2. Narrativa autorizada");
  paragraph(caseData.facts.narrative ?? "Sin narrativa registrada.");

  section("3. Evidencia y adjuntos referenciados");
  const evidence = caseData.facts.evidence ?? [];
  if (!evidence.length && !caseData.facts.attachments.length) {
    paragraph("No hay evidencia sellada o adjuntos asociados en este borrador.", { color: colors.muted });
  }
  evidence.forEach((item, index) => {
    paragraph(`Evidencia ${index + 1}: ${item.evidence_hash || "Referencia sin hash"} · Estado: ${item.status}`, { bold: true });
  });
  caseData.facts.attachments.forEach((item, index) => {
    paragraph(`Adjunto ${index + 1}: ${item.file_name} · ${item.mime_type} · ${item.sha256}`, { bold: true });
    paragraph(item.visual_summary || item.extracted_text?.slice(0, 700) || item.warning, { color: colors.muted });
  });

  section("4. Test VPMRG asistivo");
  keyValue("Resultado preliminar", caseData.vpmrg_test.overall_result);
  keyValue("Confianza", caseData.vpmrg_test.confidence);
  keyValue("Vinculo politico-electoral", caseData.vpmrg_test.political_electoral_link.reason);
  keyValue("Elemento de genero", caseData.vpmrg_test.gender_element.reason);
  keyValue("Impacto en derechos", caseData.vpmrg_test.political_rights_impact.reason);

  section("5. Ruta preliminar de canalizacion");
  keyValue("Autoridad sugerida", caseData.jurisdiction?.suggested_authority);
  keyValue("Via sugerida", caseData.jurisdiction?.procedure);
  paragraph(caseData.jurisdiction?.reason ?? "Ruta pendiente de validacion humana.", { color: colors.muted });

  section("6. Fuentes RAG y revision");
  if (caseData.rag_sources?.length) {
    caseData.rag_sources.slice(0, 6).forEach((source) => {
      paragraph(`${source.source_file}${source.page ? `, pagina ${source.page}` : ""}${source.institution ? ` · ${source.institution}` : ""}`, { bold: true });
      paragraph(source.excerpt?.slice(0, 500) || "Fuente recuperada sin extracto disponible.", { color: colors.muted });
    });
  } else {
    paragraph("No hay fuentes RAG recuperadas. No deben inventarse citas legales.", { color: colors.muted });
  }

  section("7. Checklist antes de presentar");
  paragraph("[ ] Revisar que la narrativa sea correcta y autorizada.");
  paragraph("[ ] Verificar que la evidencia sellada por Machiyotl corresponda al caso.");
  paragraph("[ ] Validar la autoridad competente y los fundamentos legales con una persona autorizada.");
  paragraph("[ ] Confirmar consentimiento antes de compartir este documento fuera de la plataforma.");

  addFooter();
  doc.save(`kit-evidencia-${caseData.case_id}.pdf`);
}
