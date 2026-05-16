"use client";

import { ChangeEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
import {
  AttachmentReference,
  ChimalliCase,
  ExpedienteResponse,
  generateExpediente,
  sendChimalliMessage,
  uploadChimalliAttachment,
} from "../lib/api";

type Message = {
  role: "assistant" | "user";
  text: string;
};

export default function ChimalliPage() {
  const [narrative, setNarrative] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Soy Chimalli. Puedo ayudarte a ordenar tu narrativa, identificar elementos preliminares y preparar un resumen para revisión humana. No sustituyo a una autoridad ni presento denuncias automáticamente.",
    },
  ]);
  const [caseData, setCaseData] = useState<ChimalliCase | null>(null);
  const [expediente, setExpediente] = useState<ExpedienteResponse | null>(null);
  const [attachments, setAttachments] = useState<AttachmentReference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSend = !isPending && (narrative.trim().length > 0 || attachments.length > 0);

  function requestGuidance() {
    if (!canSend) return;
    const messageText = narrative.trim() || "Revisa la evidencia adjunta y extrae informacion relevante para orientacion.";
    const sentAttachments = attachments;
    setError(null);
    setExpediente(null);
    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: sentAttachments.length
          ? `${messageText}\n\nAdjuntos: ${sentAttachments.map((attachment) => attachment.file_name).join(", ")}`
          : messageText,
      },
    ]);
    setNarrative("");
    setAttachments([]);
    startTransition(async () => {
      try {
        const response = await sendChimalliMessage(
          messageText,
          sentAttachments.map((attachment) => attachment.attachment_id),
        );
        setCaseData(response.case);
        setMessages((current) => [...current, { role: "assistant", text: response.reply }]);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "No se pudo completar la orientación.");
      }
    });
  }

  function requestExpediente() {
    if (!caseData) return;
    setError(null);
    startTransition(async () => {
      try {
        setExpediente(await generateExpediente(caseData.case_id));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "No se pudo generar el resumen.");
      }
    });
  }

  function quickExit() {
    setNarrative("");
    setAttachments([]);
    setCaseData(null);
    setExpediente(null);
    setMessages([{ role: "assistant", text: "Pantalla neutral. Puedes cerrar esta ventana o volver cuando te sientas lista." }]);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    requestGuidance();
  }

  async function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setError(null);
    setUploadMessage("Subiendo evidencia adjunta...");
    try {
      const uploaded = await Promise.all(files.map((file) => uploadChimalliAttachment(file)));
      setAttachments((current) => [...current, ...uploaded]);
      setUploadMessage(null);
    } catch (caught) {
      setUploadMessage(null);
      setError(caught instanceof Error ? caught.message : "No se pudo adjuntar el archivo.");
    }
  }

  function removeAttachment(attachmentId: string) {
    setAttachments((current) => current.filter((attachment) => attachment.attachment_id !== attachmentId));
  }

  return (
    <main className="page">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="mark" aria-hidden="true">Ch</div>
            <div>
              <div className="eyebrow">Yaocíhuatl · Chimalli</div>
              <h1 className="title">Orientación estructurada y segura</h1>
            </div>
          </div>
          <button className="quick-exit" type="button" onClick={quickExit} aria-label="Salida rápida de la pantalla actual">
            Salida rápida
          </button>
        </header>

        <section className="grid" aria-label="Flujo Chimalli">
          <article className="card chat-card" aria-labelledby="chat-title">
            <div className="chat-header">
              <span className="badge">Sugerencia IA · Pendiente de revisión humana</span>
              <h2 id="chat-title">Chat Chimalli</h2>
              <p>Describe lo ocurrido o adjunta evidencia. Chimalli organiza la información para revisión humana.</p>
              <div className="notice">No sustituye asesoría legal. No declara culpabilidad. No envía información a una autoridad automáticamente.</div>
            </div>

            <div className="messages" aria-live="polite">
              {messages.map((message, index) => (
                <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                  {message.text}
                </div>
              ))}
            </div>

            <div className="composer" aria-label="Redactar mensaje">
              {attachments.length ? (
                <div className="attachment-strip" aria-label="Evidencia adjunta">
                  {attachments.map((attachment) => (
                    <div className="attachment-pill" key={attachment.attachment_id}>
                      <span>{attachment.file_name}</span>
                      <small>{statusLabel(attachment.status)}</small>
                      <button type="button" onClick={() => removeAttachment(attachment.attachment_id)} aria-label={`Quitar ${attachment.file_name}`}>
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="composer-row">
                <input
                  ref={fileInputRef}
                  className="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/png,image/jpeg,image/webp,text/plain"
                  onChange={handleAttachmentChange}
                />
                <button className="icon-button" type="button" onClick={() => fileInputRef.current?.click()} aria-label="Agregar evidencia">
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M20 12.4 12.7 19.7a6 6 0 0 1-8.5-8.5l8.1-8.1a4.1 4.1 0 0 1 5.8 5.8l-8.2 8.2a2.2 2.2 0 0 1-3.1-3.1l7.5-7.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
                <label className="sr-only" htmlFor="narrative">Mensaje para Chimalli</label>
                <textarea
                  id="narrative"
                  value={narrative}
                  onChange={(event) => setNarrative(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Escribe tu mensaje. Enter envia, Shift + Enter agrega una linea."
                  aria-describedby="narrative-help"
                />
                <button className="send-button" type="button" onClick={requestGuidance} disabled={!canSend} aria-label="Enviar mensaje">
                  Enviar
                </button>
              </div>
              <small id="narrative-help">Usa datos sintéticos o anonimizados. La evidencia adjunta no se considera sellada por Machiyotl.</small>
              {uploadMessage ? <p className="muted">{uploadMessage}</p> : null}
              {error ? <p className="error">{error}</p> : null}
            </div>
          </article>

          <aside className="side-panel" aria-label="Resumen del caso">
            <CasePanel caseData={caseData} onGenerate={requestExpediente} isPending={isPending} />
            <SourcesPanel caseData={caseData} />
            <ExpedientePanel expediente={expediente} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function CasePanel({ caseData, onGenerate, isPending }: { caseData: ChimalliCase | null; onGenerate: () => void; isPending: boolean }) {
  return (
    <section className="card" aria-labelledby="case-title">
      <div className="panel-header">
        <span className="badge">Solo borrador</span>
        <h2 id="case-title">Información extraída</h2>
        <p>{caseData ? <span className="mono">{caseData.case_id}</span> : "Aún no hay caso generado."}</p>
      </div>
      {caseData ? (
        <>
          <div className="section">
            <h3>Datos principales</h3>
            <ul className="result-list">
              <li className="result-item"><strong>Rol</strong>{caseData.victim.role ?? "Sin dato"}</li>
              <li className="result-item"><strong>Cargo</strong>{caseData.victim.position ?? "Sin dato"}</li>
              <li className="result-item"><strong>Ubicación</strong>{[caseData.victim.municipality, caseData.victim.state].filter(Boolean).join(", ") || "Sin dato"}</li>
              <li className="result-item"><strong>Plataforma</strong>{caseData.facts.platform ?? "Sin dato"}</li>
            </ul>
          </div>
          {caseData.facts.attachments.length ? (
            <div className="section">
              <h3>Evidencia adjunta</h3>
              <ul className="result-list">
                {caseData.facts.attachments.map((attachment) => (
                  <li className="result-item" key={attachment.attachment_id}>
                    <strong>{attachment.file_name}</strong>
                    {statusLabel(attachment.status)}<br />
                    {attachment.visual_summary || attachment.extracted_text?.slice(0, 180) || attachment.warning}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="section">
            <h3>Evaluación asistiva</h3>
            <ul className="result-list">
              <li className="result-item"><strong>Vínculo político-electoral</strong><span className="status-true">Cumple</span><br />{caseData.vpmrg_test.political_electoral_link.reason}</li>
              <li className="result-item"><strong>Elemento de género</strong><span className="status-true">Cumple</span><br />{caseData.vpmrg_test.gender_element.reason}</li>
              <li className="result-item"><strong>Afectación a derechos</strong><span className="status-true">Probablemente cumple</span><br />{caseData.vpmrg_test.political_rights_impact.reason}</li>
              <li className="result-item"><strong>Resultado</strong><span className="status-draft">{caseData.vpmrg_test.overall_result}</span></li>
            </ul>
          </div>
          <div className="section">
            <h3>Ruta sugerida</h3>
            <p><strong>{caseData.jurisdiction.suggested_authority}</strong></p>
            <p>{caseData.jurisdiction.procedure}</p>
            <p>{caseData.jurisdiction.reason}</p>
            <button className="primary-button" type="button" onClick={onGenerate} disabled={isPending}>Generar resumen para revisión</button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function SourcesPanel({ caseData }: { caseData: ChimalliCase | null }) {
  return (
    <section className="card section" aria-labelledby="sources-title">
      <h2 id="sources-title">Fuentes consultadas</h2>
      {caseData?.rag_sources.length ? (
        <ul className="result-list">
          {caseData.rag_sources.map((source, index) => (
            <li className="source" key={`${source.collection}-${source.source_file}-${source.page}-${index}`}>
              <strong>{source.source_file}</strong>
              <span className="mono">{source.collection} · pág. {source.page} · score {source.score}</span>
              <p>{source.excerpt}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay fuentes recuperadas todavía. Ejecuta la indexación RAG o agrega documentos demo.</p>
      )}
    </section>
  );
}

function ExpedientePanel({ expediente }: { expediente: ExpedienteResponse | null }) {
  return (
    <section className="card section" aria-labelledby="expediente-title">
      <h2 id="expediente-title">Expediente/resumen</h2>
      {expediente ? (
        <>
          <p className="notice">Borrador imprimible. Requiere revisión humana antes de cualquier uso institucional.</p>
          <div className="expediente-preview">{expediente.html.replace(/<[^>]+>/g, " ")}</div>
        </>
      ) : (
        <p>El resumen aparecerá después de generar un caso.</p>
      )}
    </section>
  );
}

function statusLabel(status: AttachmentReference["status"]) {
  const labels: Record<AttachmentReference["status"], string> = {
    uploaded_unverified: "Adjunto no verificado",
    text_extracted: "Texto extraído",
    image_analyzed: "Imagen analizada",
    metadata_only: "Solo metadatos",
    rejected: "Rechazado",
  };
  return labels[status];
}
