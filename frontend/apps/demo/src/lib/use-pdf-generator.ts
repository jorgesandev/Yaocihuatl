"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import qr from "qrcode-generator";
import { useCallback, useState } from "react";

import type { StoredEvidence } from "./use-evidence-store";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function formatFormalDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day} de ${month} de ${year}, ${hours}:${minutes}`;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function generateQRDataURL(text: string): string {
  const qrCode = qr(0, "M");
  qrCode.addData(text);
  qrCode.make();
  return qrCode.createDataURL(4, 0);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function usePDFGenerator() {
  const [generating, setGenerating] = useState(false);

  const generatePDF = useCallback(async (evidence: StoredEvidence): Promise<void> => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ─── Colors ───
      const black = "#000000";
      const muted = "#525252";

      // ─── HEADER (every page) ───
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(black);
      doc.text("YAOCÍHUATL", margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(muted);
      doc.text("Sistema de Preservación de Evidencia Digital", margin, y + 4);
      doc.line(margin, y + 6, pageW - margin, y + 6);
      y += 14;

      // ─── TITLE ───
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(black);
      doc.text("REPORTE FORENSE DIGITAL", pageW / 2, y, { align: "center" });
      y += 8;
      doc.setFontSize(11);
      doc.text("Documento de Cadena de Custodia Local", pageW / 2, y, { align: "center" });
      y += 12;

      // ─── Expediente & Fecha ───
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(black);
      doc.text("Expediente:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(`MACHIYOTL/SHA256/${evidence.shortHash}/${new Date(evidence.createdAt).getFullYear()}`, margin + 30, y);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Fecha de emisión:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(formatFormalDate(evidence.createdAt), margin + 35, y);
      y += 10;

      // ─── 1. METADATOS DE LA EVIDENCIA ───
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("1. METADATOS DE LA EVIDENCIA", margin, y);
      y += 8;
      doc.setFontSize(10);

      const metaRows = [
        ["Archivo original:", evidence.originalFilename],
        ["Plataforma de origen:", evidence.platform],
        ["Tipo MIME:", evidence.mimeType],
        ["Tamaño:", formatBytes(evidence.sizeBytes)],
        ["Fecha de captura:", formatFormalDate(evidence.capturedAt)],
        [
          "Modo de captura:",
          evidence.mode === "alert"
            ? "Pre-llenado institucional (Tlachia → Machiyotl)"
            : "Manual",
        ],
      ];

      autoTable(doc, {
        startY: y,
        body: metaRows,
        theme: "plain",
        styles: { font: "helvetica", fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 45, fontStyle: "bold" },
          1: { cellWidth: contentW - 45 },
        },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      // ─── 2. IDENTIDAD CRIPTOGRÁFICA ───
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("2. IDENTIDAD CRIPTOGRÁFICA", margin, y);
      y += 8;

      const cryptoRows = [
        ["Algoritmo:", "SHA-256"],
        ["Hash corto:", evidence.shortHash],
      ];

      autoTable(doc, {
        startY: y,
        body: cryptoRows,
        theme: "plain",
        styles: { font: "helvetica", fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 45, fontStyle: "bold" },
          1: { cellWidth: contentW - 45 },
        },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 4;

      // Hash completo (monospace block)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Hash SHA-256 completo:", margin, y);
      y += 5;

      const hashBlockX = margin;
      const hashBlockW = contentW;
      const hashBlockH = 14;
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 245, 245);
      doc.rect(hashBlockX, y, hashBlockW, hashBlockH, "FD");

      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.setTextColor(black);
      const hashLines = evidence.hash.match(/.{1,64}/g) || [evidence.hash];
      let hy = y + 5;
      for (const line of hashLines) {
        doc.text(line, hashBlockX + 4, hy);
        hy += 4.5;
      }
      y += hashBlockH + 8;

      // Estado labels
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Estado de sellado:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text("SELLADO LOCALMENTE", margin + 38, y);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Estado de envío:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text("NO ENVIADO", margin + 35, y);
      y += 10;

      // ─── 3. ORIGEN DE ALERTA (conditional) ───
      if (evidence.mode === "alert" && evidence.alertId) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("3. ORIGEN DE ALERTA INSTITUCIONAL", margin, y);
        y += 8;
        doc.setFontSize(10);

        const alertRows = [
          ["ID de alerta:", evidence.alertId],
          ["Detectada por:", "Tlachia (módulo de monitoreo)"],
          ["Validada por:", "Analista institucional"],
          ["Plataforma monitoreada:", evidence.platform],
        ];

        autoTable(doc, {
          startY: y,
          body: alertRows,
          theme: "plain",
          styles: { font: "helvetica", fontSize: 10, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 45, fontStyle: "bold" },
            1: { cellWidth: contentW - 45 },
          },
          margin: { left: margin, right: margin },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // ─── 4. CADENA DE CUSTODIA LOCAL ───
      const custodyLabel = evidence.mode === "alert" ? "4" : "3";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${custodyLabel}. CADENA DE CUSTODIA LOCAL`, margin, y);
      y += 8;

      const custodyRows = [
        ["1", "Captura iniciada", formatShortDate(evidence.capturedAt), "Mujer protegida"],
        [
          "2",
          "Sellado local",
          formatShortDate(evidence.createdAt),
          "Machiyotl (Web Crypto API)",
        ],
        [
          "3",
          "Metadatos revisados",
          formatShortDate(evidence.createdAt),
          "Mujer protegida",
        ],
      ];

      autoTable(doc, {
        startY: y,
        head: [["No.", "Evento", "Fecha y hora", "Actor"]],
        body: custodyRows,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 3,
          valign: "middle",
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      // ─── QR CODE ───
      const qrUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${evidence.shortHash}`;
      const qrDataUrl = generateQRDataURL(qrUrl);
      const qrSize = 30;
      const qrX = pageW - margin - qrSize;
      doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(muted);
      doc.text("Escanea para verificar", qrX, y + qrSize + 4, { align: "center", maxWidth: qrSize });
      y += qrSize + 14;

      // ─── DEFINICIONES TÉCNICAS ───
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(black);
      doc.text("DEFINICIONES TÉCNICAS", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const defText =
        "SHA-256: Algoritmo de hash criptográfico que genera una huella digital de 256 bits (64 caracteres hexadecimales) a partir de un archivo. El mismo archivo siempre produce el mismo hash.\n\n" +
        "Sellado local: Proceso mediante el cual el hash SHA-256 se genera exclusivamente en el dispositivo de la usuaria, sin que el archivo original salga del mismo.";
      const defLines = doc.splitTextToSize(defText, contentW);
      doc.text(defLines, margin, y);
      y += defLines.length * 4 + 4;

      // ─── AVISO LEGAL ───
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(black);
      doc.text("AVISO LEGAL", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const legalText =
        "El presente documento fue generado localmente en el dispositivo de la mujer protegida mediante la herramienta Yaocíhuatl. El hash criptográfico SHA-256 aquí registrado verifica la integridad del archivo sellado, pero no constituye prueba per se sin ratificación de autoridad competente.\n\n" +
        "De conformidad con la Ley de Víctimas para el Estado de Baja California (Arts. 24, 105, 106, 109), los datos personales contenidos en este documento son reservados y confidenciales. Su uso indebido podrá dar lugar a las responsabilidades establecidas en las leyes aplicables.\n\n" +
        "Este documento no sustituye la ratificación ante autoridad competente (IEEBC, UTCE, CQyD, TJEBC, Fiscalía Especializada en Delitos Electorales).";
      const legalLines = doc.splitTextToSize(legalText, contentW);
      doc.text(legalLines, margin, y);
      y += legalLines.length * 4 + 6;

      // ─── FOOTER ───
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(muted);
      doc.line(margin, pageH - 18, pageW - margin, pageH - 18);
      doc.text(
        `Generado por Yaocíhuatl · ${formatFormalDate(new Date().toISOString())} · Página 1 de 1`,
        pageW / 2,
        pageH - 12,
        { align: "center" }
      );

      // Save
      const filename = `machiyotl-reporte-${evidence.shortHash}.pdf`;
      doc.save(filename);
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generatePDF, generating };
}
