"use client";

import { useState, useTransition } from "react";
import { ChimalliCase, ExpedienteResponse, generateExpediente, sendChimalliMessage } from "../lib/api";

const DEMO_NARRATIVE =
  "Soy candidata a regidora en Mexicali, Baja California. Desde ayer varias cuentas en redes sociales comenzaron a publicar mensajes diciendo que no tengo capacidad para ocupar un cargo porque soy mujer, que debería quedarme en mi casa y que mi candidatura es una vergüenza. Algunas publicaciones incluyen imágenes editadas de mí y etiquetas relacionadas con mi campaña. Me preocupa que esto afecte mi participación en la elección y mi seguridad.";

type Message = {
  role: "assistant" | "user";
  text: string;
};

export default function ChimalliPage() {
  const [narrative, setNarrative] = useState(DEMO_NARRATIVE);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Soy Chimalli. Puedo ayudarte a ordenar tu narrativa, identificar elementos preliminares y preparar un resumen para revisión humana. No sustituyo a una autoridad ni presento denuncias automáticamente.",
    },
  ]);
  const [caseData, setCaseData] = useState<ChimalliCase | null>(null);
  const [expediente, setExpediente] = useState<ExpedienteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestGuidance() {
    setError(null);
    setExpediente(null);
    setMessages((current) => [...current, { role: "user", text: narrative }]);
    startTransition(async () => {
      try {
        const response = await sendChimalliMessage(narrative);
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
    setCaseData(null);
    setExpediente(null);
    setMessages([{ role: "assistant", text: "Pantalla neutral. Puedes cerrar esta ventana o volver cuando te sientas lista." }]);
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
              <h2 id="chat-title">Cuéntame qué ocurrió</h2>
              <p>Chimalli ordena información para que una persona autorizada pueda revisarla. Tú decides qué guardar y qué revisar.</p>
              <div className="notice">No sustituye asesoría legal. No declara culpabilidad. No envía información a una autoridad automáticamente.</div>
            </div>

            <div className="messages" aria-live="polite">
              {messages.map((message, index) => (
                <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                  {message.text}
                </div>
              ))}
            </div>

            <div className="chips" aria-label="Respuestas rápidas">
              {[
                "Agregar evidencia",
                "No sé qué autoridad corresponde",
                "Quiero revisar antes de enviar",
                "Explicarlo en palabras simples",
              ].map((chip) => (
                <button className="chip" key={chip} type="button" onClick={() => setNarrative((value) => `${value}\n${chip}`)}>
                  {chip}
                </button>
              ))}
            </div>

            <div className="composer">
              <label htmlFor="narrative">Narrativa autorizada para demo</label>
              <textarea
                id="narrative"
                value={narrative}
                onChange={(event) => setNarrative(event.target.value)}
                aria-describedby="narrative-help"
              />
              <small id="narrative-help">Usa datos sintéticos o anonimizados. No pegues evidencia real en esta demo.</small>
              <button className="primary-button" type="button" onClick={requestGuidance} disabled={isPending || narrative.trim().length === 0}>
                Solicitar orientación
              </button>
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
        <h2 id="case-title">Caso estructurado</h2>
        <p>{caseData ? <span className="mono">{caseData.case_id}</span> : "Aún no hay caso generado."}</p>
      </div>
      {caseData ? (
        <>
          <div className="section">
            <h3>Entidades extraídas</h3>
            <ul className="result-list">
              <li className="result-item"><strong>Rol</strong>{caseData.victim.role ?? "Sin dato"}</li>
              <li className="result-item"><strong>Cargo</strong>{caseData.victim.position ?? "Sin dato"}</li>
              <li className="result-item"><strong>Ubicación</strong>{[caseData.victim.municipality, caseData.victim.state].filter(Boolean).join(", ")}</li>
              <li className="result-item"><strong>Plataforma</strong>{caseData.facts.platform ?? "Sin dato"}</li>
            </ul>
          </div>
          <div className="section">
            <h3>Test VPMRG asistivo</h3>
            <ul className="result-list">
              <li className="result-item"><strong>Vínculo político-electoral</strong><span className="status-true">Cumple</span><br />{caseData.vpmrg_test.political_electoral_link.reason}</li>
              <li className="result-item"><strong>Elemento de género</strong><span className="status-true">Cumple</span><br />{caseData.vpmrg_test.gender_element.reason}</li>
              <li className="result-item"><strong>Afectación a derechos</strong><span className="status-true">Probablemente cumple</span><br />{caseData.vpmrg_test.political_rights_impact.reason}</li>
              <li className="result-item"><strong>Resultado</strong><span className="status-draft">{caseData.vpmrg_test.overall_result}</span></li>
            </ul>
          </div>
          <div className="section">
            <h3>Canalización sugerida</h3>
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
      <h2 id="sources-title">Fuentes RAG</h2>
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
