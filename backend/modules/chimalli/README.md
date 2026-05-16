# Chimalli

Módulo MVP de RAG jurídico asistivo, extracción de entidades, test VPMRG preliminar, canalización y generación de expediente/resumen.

Toda salida legal debe citar corpus versionado y mantenerse como asistencia para revisión humana, no como decisión automatizada.

## Alcance MVP

- Conversación estructurada mediante `/api/v1/chimalli/chat`.
- Extracción de entidades explícitas desde narrativa autorizada.
- Test VPMRG asistivo de tres elementos.
- Sugerencia preliminar de autoridad y vía para revisión humana.
- RAG local con índice JSONL filtrado por colección/intención.
- Expediente HTML imprimible como borrador.
- Mocks explícitos para Tlachia y Machiyotl.

## Límites

- No declara culpabilidad.
- No emite resolución.
- No presenta denuncias automáticamente.
- No hace scoring de credibilidad.
- No sustituye asesoría legal ni revisión de autoridad.
- No debe usarse con datos reales sin controles de autenticación, auditoría, cifrado y retención.

## Variables

```env
LLM_PROVIDER=deepseek
LLM_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=
CHIMALLI_DEMO_MODE=true
CHIMALLI_RAG_DOCUMENTS_PATH=../rag_documents
CHIMALLI_RAG_INDEX_PATH=.local/chimalli_rag_index.jsonl
CHIMALLI_ATTACHMENT_STORAGE_PATH=.local/chimalli_attachments
CHIMALLI_MAX_ATTACHMENT_BYTES=10485760
CHIMALLI_MAX_ATTACHMENTS_PER_CHAT=5
CHIMALLI_MAX_EXTRACTED_TEXT_CHARS=8000
VISION_LLM_ENABLED=true
VISION_LLM_PROVIDER=openrouter
VISION_LLM_MODEL=qwen/qwen2.5-vl-72b-instruct:free
```

Si no hay una llave configurada para el proveedor seleccionado, Chimalli usa modo demo controlado.

### Usar DeepSeek mediante OpenRouter

No guardes la llave en el repositorio. Configúrala solo en tu entorno local:

```env
LLM_PROVIDER=openrouter
LLM_MODEL=deepseek/deepseek-chat
LLM_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_HTTP_REFERER=http://localhost:3000
OPENROUTER_APP_TITLE=Yaocihuatl Chimalli
```

En OpenRouter normalmente basta con tener crédito o acceso habilitado para el modelo y usar una API key válida. `HTTP-Referer` y `X-Title` son metadatos recomendados por OpenRouter para identificar la aplicación.

### Analisis visual de imagenes

Chimalli puede recibir imagenes como adjuntos directos y analizarlas con un modelo de vision configurado en OpenRouter:

```env
VISION_LLM_ENABLED=true
VISION_LLM_PROVIDER=openrouter
VISION_LLM_MODEL=qwen/qwen2.5-vl-72b-instruct:free
```

El resultado visual es asistivo y no verificado. No reemplaza sellado, hash forense ni cadena de custodia de Machiyotl. Si no hay modelo de vision o falla el proveedor, Chimalli conserva metadatos y advierte que no hubo analisis visual.

## Ejecutar backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -e ".[test]"
.venv/bin/uvicorn app.main:app --reload
```

## Indexar documentos RAG

```bash
curl -X POST http://localhost:8000/api/v1/chimalli/rag/index \
  -H 'Content-Type: application/json' \
  -d '{}'
```

La carpeta `rag_documents/` contiene archivos demo no normativos. Para producción deben reemplazarse por corpus legal validado, versionado y con permisos de uso.

## Probar narrativa demo

Usar `POST /api/v1/chimalli/chat` con una narrativa sintética. El resultado esperado es `possible_vpmrg`, autoridad sugerida `IEEBC / UTCE`, vía `Procedimiento Especial Sancionador` y aviso de revisión humana.
