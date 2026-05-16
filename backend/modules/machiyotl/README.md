# Machiyotl

**Sellado forense · hashes SHA-256 · preservación de evidencia · generación de PDFs · verificación pública**

_Machiyotl_ (nah. "sello / marca"): módulo de captura forense de evidencia digital con identidad criptográfica generada localmente, almacenamiento cifrado offline-first, cadena de custodia auditable y generación de reportes PDF verificables.

---

## Alcance y Pivote Arquitectónico

Machiyotl es una **aplicación web progresiva (PWA) instalable** con funcionamiento **offline-first** y arquitectura **Zero-Knowledge**: ningún contenido de evidencia toca el servidor antes de ser sellado localmente por la usuaria. No se guardan claves de cifrado en el servidor.

### Hard Constraints

1. **Zero-Knowledge**: El contenido de evidencia (imagen, archivo, captura) nunca sale del dispositivo antes del sellado local. El servidor solo recibe hashes para verificación.
2. **Offline-first**: La app debe funcionar completamente sin red para captura, sellado, almacenamiento y generación de PDF.
3. **Botón de pánico**: La redirección de emergencia debe responder en < 100ms.
4. **WCAG 2.2 AA**: Contraste 4.5:1texto, 3:1 elementos grandes, focus rings visibles, targets 44px.
5. **Sin datos reales en el repositorio**: Solo datos sintéticos y demo-seguros.
6. **Separación estricta de módulos**: Machiyotl no depende de Tlachia ni Chimalli en tiempo real. La única integración es el envío voluntario de evidencia sellada a Chimalli.
7. **IA asistiva, no decisoria**: Ningún componente de Machiyotl toma decisiones legales ni clasifica contenido sin supervisión humana.

### Arquitectura Zero-Knowledge (Fase 1)

```txt
Captura de archivo/URL
      │
      ▼
SHA-256 local (Web Crypto API) ──→ Hash ──→ Identidad criptográfica
      │                                           │
      ▼                                           ▼
AES-GCM local (PBKDF2 + session token)     Cadena de custodia local
      │                                           │
      ▼                                           ▼
IndexedDB cifrado (Dexie.js)              Estado: sellada-localmente
      │                                           │
      ▼                                           ▼
PDF forense local (jsPDF + QR)            ┌─ Guardar localmente
      │                                   └─ Enviar a Chimalli (voluntario)
      ▼
GET /verify/:hash  ◄── Único endpoint backend (solo lectura)
```

**Regla**: Nunca sale contenido sin cifrar del dispositivo. El servidor solo verifica existencia de hashes.

### Lo que Machiyotl SÍ hace

- Capturar evidencia digital (capturas de pantalla, imágenes, archivos, URLs) en el dispositivo.
- Generar identidad criptográfica (SHA-256) localmente sin red.
- Cifrar y almacenar evidencia en IndexedDB con AES-GCM.
- Mantener cadena de custodia local y auditable.
- Generar reportes PDF forenses con QR de verificación.
- Verificar públicamente si un hash fue sellado (endpoint de solo lectura).
- Proporcionar botón de pánico y salida segura.

### Lo que Machiyotl NO hace

- Monitoreo ni scraping de redes sociales (eso es Tlachia).
- Decidir validez legal de la evidencia (eso es Chimalli con revisión humana).
- Subir automáticamente evidencia a servidores.
- Tomar decisiones de clasificación jurídica.
- Almacenar claves de cifrado en el servidor.
- Reemplar la ratificación de autoridad competente.

---

## Marco Legal y Contexto Institucional

### Violencia Política contra las Mujeres en Razón de Género (VPMRG)

Machiyotl aborda la **VPMRG digital** definida en:

| Marco legal | Artículo | Contenido | Fuente en `legal-corpus/` |
|---|---|---|---|
| Ley Electoral BC | Art. 3, fracc. XVIII | Definición de VPMRG | `legal-corpus/baja-california/` |
| Ley de Acceso BC (Vida Libre de Violencia) | Art. 6, fracc. VII | Definición de **Violencia Digital** — exposición, distribución, difusión de contenido íntimo sin consentimiento mediante TIC | `legal-corpus/baja-california/` |
| Ley de Acceso BC | Art. 6, fracc. VII Bis | Incluye **IA generativa** como vector de violencia digital (reforma Mar 2026) | `legal-corpus/baja-california/` |
| Ley de Acceso BC | Art. 6, fracc. VIII | Violencia Mediática — discurso de odio sexista y discriminación vía medios | `legal-corpus/baja-california/` |
| LGAMVLV | Art. 20 Ter, conductas VIII-X | Distribución de propaganda denigrante, difamación con estereotipos de género, divulgación de información privada por cualquier medio físico o virtual | `legal-corpus/federal/` |
| Ley de Víctimas BC | Arts. 24, 105, 106, 109 | Datos de víctimas: **reservados y confidenciales**; obligación de confidencialidad para todos los actores del sistema | `legal-corpus/baja-california/` |
| Ley de Transparencia BC | Arts. 71, 99, 100 | Datos personales y datos sensibles: protección en acceso a información pública | `legal-corpus/baja-california/` |

### Brecha Legal Identificada

**Ninguno** de los marcos legales consultados contempla protocolo de cadena de custodia digital, hash criptográfico, sellado de evidencia electrónica, ni preservación offline para víctimas. Esto incluye:

- El Reglamento de Quejas y Denuncias del IEEBC sí menciona "ligas electrónicas" y "pruebas técnicas", pero sin especificar integridad criptográfica.
- El Protocolo de Atención de Primer Contacto recomienda "tomar captura de las publicaciones y registrar las URL" como evidencia, sin mecanismo de preservación verificable.
- No existe requisito ni guía para que la víctima pueda sellar localmente una captura antes de que el agresor la elimine.

**Machiyotl llena este vacío técnico**: proporciona un mecanismo de preservación con integridad criptográfica verificable que no existe en el marco legal actual, mientras cumple con las obligaciones de privacidad y confidencialidad de la Ley de Víctimas y la Ley de Transparencia.

### Actores Institucionales Relevantes

| Actor | Rol en el flujo Machiyotl |
|---|---|
| IEEBC (Instituto Estatal Electoral de Baja California) | Autoridad electoral que recibe denuncias VPMRG vía PES |
| UTCE (Unidad Técnica de lo Contencioso Electoral) | Investiga y sustancia denuncias VPMRG |
| Comisión de Quejas y Denuncias del IEEBC | Emite medidas cautelares y de protección |
| TJEBC (Tribunal de Justicia Electoral de BC) | Resuelve procedimientos sancionadores |
| Fiscalía Especializada en Delitos Electorales | Perseguir delitos electorales derivados |
| Centros de Justicia para las Mujeres | Atención integral a víctimas |
| Oficina de PVPMRG del IEEBC | Primer contacto y evaluación de riesgo |

### Estadísticas Clave

- **484 sanciones** registradas nacionalmente por VPMRG (Registro Nacional, INE).
- **169 (35%)** de esas sanciones están vinculadas a **medios digitales y redes sociales**.
- **84 denuncias** de VPMRG en Baja California (2019–2026), con picos en 2021 (26) y 2024 (18).
- La violencia digital es el vector de más rápido crecimiento en VPMRG.

---

## Estado Actual del Módulo

### Backend — En Standby (Fase 2)

El backend relacional fue parcialmente generado por el agente antes del pivote arquitectónico. Los ORM models, migraciones y seed data están en `origin/develop`. Los schemas Pydantic, audit service, repository e integration tests estaban en feature branches (`mch-101`, `mch-104`, `mch-105`) que **no se fusionaron** a `origin/develop` — están pendientes de re-implementación como parte del nuevo task board.

**Regla MCH-000**: No se desarrollan endpoints POST/PUT/DELETE para Machiyotl. El único endpoint backend será de solo lectura (`GET /verify/:hash`, MCH-400).

| Componente | Ubicación | Estado |
|---|---|---|
| ORM models | `backend/app/db/models.py` (clase `Machiyotl*`) | ✅ En `origin/develop` |
| Migrations | `backend/migrations/versions/20260515_0001` | ✅ En `origin/develop` (1 sola migración) |
| Seed data | `backend/app/seed/demo_data.py` | ✅ En `origin/develop` |
| Pydantic schemas (verify) | `backend/app/schemas/machiyotl.py` | ✅ Implementado (MCH-005) |
| Verify service | `backend/app/services/machiyotl/verify_service.py` | ✅ Implementado (MCH-400) |
| API router (verify) | `backend/app/api/v1/machiyotl.py` | ✅ Implementado (MCH-400) |
| Verify tests | `backend/tests/test_machiyotl_verify.py` | ✅ Implementado (MCH-400) |
| Audit service | `backend/app/services/machiyotl/audit_service.py` | ⏳ Pendiente (feature branch no fusionada) |
| Repository | `backend/app/services/machiyotl/repository.py` | ⏳ Pendiente (feature branch no fusionada) |
| Full evidence schemas | `backend/app/schemas/machiyotl.py` (EvidenceItem, Note, etc.) | ⏳ Pendiente (feature branch no fusionada) |
| Integration tests | `backend/tests/test_machiyotl_integration.py` | ⏳ Pendiente (feature branch no fusionada) |
| API endpoints POST/PUT/DELETE | `backend/app/api/v1/` | ❌ No existen; bloqueados por MCH-000 |
| Service layer CRUD | `backend/app/services/machiyotl/` | ❌ No existe en esta rama |

### Frontend — En Diseño (Fase 1)

| Componente | Ubicación | Estado |
|---|---|---|
| PWA app | `frontend/apps/pwa-machiyotl/` | ❌ Placeholder (solo README) |
| Demo page | `frontend/apps/demo/src/app/app/machiyotl/` | ⚠️ Demo estática con stepper |
| Service Worker | — | ❌ No existe |
| IndexedDB/Dexie adapter | — | ❌ No existe |
| Web Crypto / hashing | — | ❌ No existe |
| PDF generation | — | ❌ No existe |
| Panic button | — | ❌ No existe |
| Evidence state machine (client) | — | ❌ No existe |

### Cross-Module Integration

- **Chimalli** importa `machiyotl_evidence_hashes` de los schemas de Machiyotl (referencia: `backend/app/schemas/chimalli.py`).
- El envío de evidencia a Chimalli es voluntario y ocurre solo después del sellado local.
- No hay dependencia de Tlachia en tiempo real.

---

## Servicios Backend — Diseño de Referencia

> **Nota**: Los servicios listados abajo fueron diseñados en feature branches (`mch-101`, `mch-104`, `mch-105`) que no se fusionaron a `origin/develop`. Se documentan aquí como referencia de diseño para su re-implementación futura. Los ORM models y migraciones que los soportan SÍ existen en `origin/develop`.

### Audit Service (`backend/app/services/machiyotl/audit_service.py`)

Escribe filas de `AuditLog` para acciones del ciclo de vida de evidencia.

| Método | Acción | Tabla |
|---|---|---|
| `audit_evidence_create` | `machiyotl.evidence.create` | `evidence_items` |
| `audit_evidence_update` | `machiyotl.evidence.update` | `evidence_items` |
| `audit_evidence_seal` | `machiyotl.evidence.seal` | `evidence_items` |
| `audit_note_create` | `machiyotl.note.create` | `evidence_notes` |
| `audit_custody_create` | `machiyotl.custody.create` | `custody_events` |
| `audit_hash_verify` | `machiyotl.hash.verify` | `hash_verifications` |

**Sanitización de metadata**: Los campos `note`, `source_url`, `local_file_path`, `original_filename` y los hashes completos (`sha256_hash`, `submitted_hash`, `event_hash`) NUNCA se almacenan en audit. Solo se guarda el prefijo de 12 caracteres del primer hash encontrado.

### Repository (`backend/app/services/machiyotl/repository.py`)

Consultas centralizadas de solo lectura sobre tablas en schema `machiyotl`.

| Método | Tabla | Índice | Orden | Notas |
|---|---|---|---|---|
| `get_evidence_by_id` | `evidence_items` | PK (`id`) | — | Búsqueda por UUID |
| `get_evidence_by_code` | `evidence_items` | Unique (`evidence_code`) | — | Búsqueda legible |
| `list_evidence` | `evidence_items` | `ix_machiyotl_evidence_owner_status` | `captured_at DESC` | Filtros dinámicos, paginación (max 200) |
| `get_evidence_notes` | `evidence_notes` | FK (`evidence_id`) | `created_at DESC` | Paginado |
| `get_custody_timeline` | `custody_events` | `ix_machiyotl_custody_evidence_time` | `occurred_at ASC` | Timeline completo |
| `list_hash_verifications` | `hash_verifications` | — | `verified_at DESC` | Paginado |

**Regla**: Todas las consultas están restringidas al schema `machiyotl`. No hay joins cross-module.

### Schemas — Diseño de Referencia (feature branch no fusionada)

| Enum/Constante | Valores |
|---|---|
| `EvidenceStatus` | `draft`, `sealed-local`, `ready`, `submitted`, `error` |
| `PrivacyState` | `local-only`, `not-submitted`, `ready-for-review`, `submitted-to-authority` |
| `CustodyEventType` | `capture_started`, `sealed_local`, `metadata_reviewed`, `ready_for_review`, `submitted_to_review`, `received_by_authority` |
| `HashVerificationResult` | `match`, `mismatch`, `evidence_not_found` |
| `EvidenceType` | `screenshot_placeholder`, `link_placeholder`, `text_placeholder`, `file_placeholder`, `other` |

**Máquina de estados (transiciones permitidas)**:

```txt
draft        → [sealed-local, ready, error]
sealed-local → [ready, error]
ready        → [submitted, error]
submitted    → []  (estado terminal)
error        → [draft, sealed-local]  (recuperación)
```

**Regla**: `draft` no puede saltar a `submitted`. `submitted` es terminal. `error` permite recuperación a `draft` o `sealed-local`.

---

## Índices de Base de Datos

| Índice | Tabla | Columnas | Propósito | Estado |
|---|---|---|---|---|
| `ix_machiyotl_evidence_case_status` | `evidence_items` | `(case_id, status)` | Consulta por caso | ✅ En migración base |
| `ix_machiyotl_custody_evidence_time` | `custody_events` | `(evidence_id, occurred_at)` | Timeline de custodia | ✅ En migración base |
| `ix_machiyotl_evidence_owner_status` | `evidence_items` | `(owner_user_id, status)` | Dashboard por propietaria | ⏳ Pendiente (migración `0002` no fusionada) |
| PK + Unique | `evidence_items` | `(id)`, `(evidence_code)`, `(sha256_hash)` | Integridad y búsqueda | ✅ En migración base |

**Nota**: Faltan índices explícitos para `evidence_notes(evidence_id)` y `hash_verifications(evidence_id)`. Se debían crear en una migración futura.

---

## Task Board

### Definition of Ready (aplica a todas las tasks)

- La task tiene objective, in-scope/out-of-scope, dependencies, acceptance criteria y método de validación.
- Comportamientos sensibles tienen consideraciones explícitas de privacidad y auditoría.
- Tasks de UI referencian la/sección/es relevante/s de DESIGN.md.

### Definition of Done (aplica a todas las tasks)

- Código y docs actualizados juntos.
- Comportamiento demo-seguro y sintético forzado.
- Tests agregados donde existe lógica real.
- Riesgos y supuestos documentados para cualquier tema no resuelto.

### EPIC A — Re-alineación Arquitectónica

#### MCH-000 | Congelamiento de Backend Machiyotl Innecesario

- **Objective:** Detener desarrollo backend REST tradicional para Machiyotl y aislar código generado para evitar interferencias con Chimalli y Tlachia.
- **Implementation details:**
  - Marcar `backend/app/services/machiyotl/` como `[STANDBY — FASE 2]` en comentarios y README.
  - Verificar que no existen rutas POST/PUT/DELETE de Machiyotl en `backend/app/api/v1/router.py`; si existen, comentarlas con referencia a MCH-000.
  - Confirmar que las pruebas de integración existentes pasan sin rutas API activas.
  - Preservar schemas de DB que le sirven a Chimalli (`machiyotl_evidence_hashes`), aislar lógica de "sellado en servidor".
- **Must include:** Etiquetado claro de Standby; sin breaking changes para Chimalli/Tlachia.
- **Deliverables:** Código etiquetado; README actualizado.
- **Dependencies:** Ninguna.
- **Acceptance criteria:** Backend corre sin rutas POST de Machiyotl; suite de pruebas no falla por dependencias huérfanas; Chimalli importa `machiyotl_evidence_hashes` sin error.
- **Validation:** `pytest` pasa; `grep -r "machiyotl" backend/app/api/` no muestra rutas de escritura activas.
- **Estimate:** 1 hora.
- **Owner role:** Tech Lead.
- **Status:** ✅ Completado (2026-05-15) — Sin rutas API de Machiyotl; 8/8 tests pasan; README actualizado con estado real; Chimalli intacto.

#### MCH-001 | Re-escritura del Charter y README de Machiyotl

- **Objective:** Actualizar documentación de gobernanza del módulo para reflejar el pivote PWA/Zero-Knowledge, marco legal aplicable y hard constraints.
- **Implementation details:**
  - Reescribir `backend/modules/machiyotl/README.md` con: alcance PWA, hard constraints, arquitectura Zero-Knowledge, estado actual, task board, referencias legales.
  - Crear/actualizar `docs/product/machiyotl-module-charter.md` definiendo in-scope, out-of-scope, límites legales y brecha identificada.
  - Crear `docs/product/machiyotl-mch-000-execution-plan.md` documentando la transición del backend standby al enfoque PWA.
- **Must include:** Referencias legales versionadas; hard constraints explícitas; mapeo de lo existente vs lo que se construye.
- **Deliverables:** README.md reescrito; charter actualizado; execution plan.
- **Dependencies:** MCH-000.
- **Acceptance criteria:** Cualquier miembro puede responder "¿este comportamiento vive en Machiyotl?" sin ambigüedad; sin contradicciones con ARCHITECTURE.md, SECURITY.md, DESIGN.md.
- **Validation:** Revisión PM + Tech Lead con sign-off.
- **Estimate:** 1 día.
- **Owner role:** PM + Tech Lead.
- **Status:** ✅ Completado (2026-05-15) — `docs/product/machiyotl-module-charter.md` creado con propósito, alcance, datos, estados, restricciones legales y límites de integración; `docs/product/machiyotl-mch-000-execution-plan.md` creado documentando la transición; README reescrito desde MCH-000.

#### MCH-002 | Registro de Riesgos y Supuestos Actualizado

- **Objective:** Hacer explícitos todos los supuestos sensibles del enfoque Zero-Knowledge antes de expandir lógica funcional.
- **Implementation details:**
  - Crear `docs/product/machiyotl-risks.md` con formato: supuesto, impacto, probabilidad, mitigación, responsable, fecha de revisión.
  - Incluir riesgos: (a) fuga de privacidad por almacenamiento local (IndexedDB accesible desde DevTools), (b) mal uso para vigilancia/censura, (c) sobre-afirmación legal del sellado (hash no es prueba per se sin ratificación), (d) pérdida de datos offline sin sincronización, (e) diferencias de comportamiento entre navegadores en Web Crypto API.
  - Diferenciar riesgos de Fase 1 (PWA standalone) vs Fase 2 (integración backend).
- **Must include:** Cada riesgo de alto impacto tiene dueño y mitigación; cadencia de revisión definida.
- **Deliverables:** Documento de riesgos versionado.
- **Dependencies:** MCH-001.
- **Acceptance criteria:** Todos los riesgos de alto impacto con mitigación; revisión de seguridad/privacidad completada.
- **Validation:** Minuta de revisión de riesgos.
- **Estimate:** 1 día.
- **Owner role:** PM + revisor de seguridad/privacidad.

#### MCH-003 | Redefinición de la Máquina de Estados de Evidencia (PWA)

- **Objective:** Actualizar la especificación de estados y transiciones para reflejar el contexto PWA/Zero-Knowledge.
- **Implementation details:**
  - Definir estados PWA-first: `capturando`, `sellada-localmente`, `lista-para-revision`, `enviada-a-chimalli`, `error`. Mapear a estados backend existentes (`draft`, `sealed-local`, `ready`, `submitted`, `error`).
  - Documentar qué transiciones ocurren solo en cliente vs cuáles requieren red.
  - Definir comportamiento de cada transición: triggers, precondiciones, postcondiciones, rechazos, estados terminales, recuperación.
  - Actualizar `backend/app/schemas/machiyotl.py` si la correspondencia requiere ajustes.
- **Must include:** Tabla de transiciones con origen, destino, trigger, pre/postcondiciones; mapeo backend ↔ PWA; comportamiento offline.
- **Deliverables:** Especificación de máquina de estados; schemas actualizados si aplica.
- **Dependencies:** MCH-001.
- **Acceptance criteria:** Sin ambigüedad en estados; frontend y backend validan contra el mismo mapeo; estados PWA funcionan sin red.
- **Validation:** Revisión entre pares + matriz de casos de prueba.
- **Estimate:** 1 día.
- **Owner role:** Backend lead + Frontend lead.

#### MCH-004 | Taxonomía de Eventos de Cadena de Custodia (PWA)

- **Objective:** Redefinir tipos de eventos de custodia para el contexto PWA y su correspondencia con el backend.
- **Implementation details:**
  - Especificar eventos locales (`capture_started`, `sealed_local`, `metadata_reviewed`, `ready_for_review`, `sent_to_chimalli`) y su correspondencia con `CustodyEventType` existente.
  - Definir metadatos mínimos obligatorios por tipo de evento (timestamp local, hash si aplica, estado del dispositivo, tipo de fuente).
  - Definir estrategia de idempotencia: evento duplicado no crea registro adicional.
  - Definir estándar de zona horaria (UTC en todo el sistema, mostrar hora local en UI).
- **Must include:** Catálogo de eventos con campos obligatorios; mapeo PWA ↔ backend; regla de idempotencia.
- **Deliverables:** Catálogo de eventos y guía de schema.
- **Dependencies:** MCH-003.
- **Acceptance criteria:** Cada tipo de evento mapea a una acción de usuario o sistema; campos obligatorios definidos; idempotencia especificada.
- **Validation:** Sample payloads revisados y aprobados.
- **Estimate:** 1 día.
- **Owner role:** Backend lead.

#### MCH-005 | Contrato API Machiyotl v1 (Solo Verificación Pública)

- **Objective:** Publicar el contrato versionado del único endpoint backend de Machiyotl: verificación pública de hash.
- **Implementation details:**
  - Definir `GET /api/v1/machiyotl/verify/:hash` con request/response schemas, códigos de error (200 match, 404 no encontrado, 400 hash inválido), y disclaimer legal en la respuesta.
  - Documentar explícitamente los no-objetivos: no hay upload, no hay CRUD de evidencia, no hay autenticación para verificación.
  - Alinear `HashVerifyRequest`/`HashVerifyResponse` existentes con el nuevo contrato.
  - Actualizar `docs/technical/api-contracts.md` con sección Machiyotl MVP.
- **Must include:** Contrato en `api-contracts.md`; schemas alineados; disclaimer legal en español.
- **Deliverables:** Contrato API documentado; schemas backend alineados.
- **Dependencies:** MCH-000.
- **Acceptance criteria:** Frontend puede construir cliente de verificación contra el contrato sin ambigüedad.
- **Validation:** Validación de schemas Pydantic con hashes válidos e inválidos; revisión del contrato en `api-contracts.md`.
- **Estimate:** 1 día.
- **Owner role:** Backend lead + API owner.
- **Status:** ✅ Completado (2026-05-15) — Schemas `HashVerifyRequest`/`HashVerifyResponse` creados en `backend/app/schemas/machiyotl.py`; contrato documentado en `docs/technical/api-contracts.md#machiyotl-mvp`.
- **Validation:** Walkthrough del contrato con backend y frontend.
- **Estimate:** 1 día.
- **Owner role:** Backend lead + API owner.

### EPIC B — Core PWA y Almacenamiento Offline

#### MCH-100 | Service Worker y PWA Shell Foundation

- **Objective:** Garantizar que la aplicación cargue y funcione sin conexión a internet mediante caché de recursos.
- **Implementation details:**
  - Inicializar `frontend/apps/pwa-machiyotl` con Next.js, TypeScript, Tailwind CSS, y configuración del monorepo.
  - Instalar y configurar `next-pwa` con Workbox 7 para cachear assets estáticos (JS, CSS, fuentes, imágenes).
  - Generar `manifest.json` con íconos institucionales, nombre corto "Machiyotl", `start_url`, `display: standalone`, `<meta name="theme-color">` según DESIGN.md.
  - Crear App Shell con indicador visual de estado de red (online/offline), navegación mínima y entrada al botón de pánico (DESIGN.md §16.5).
  - `<Head>` con título neutral (sin "violencia" ni "denuncia" en pestañas/móvil) per DESIGN.md §2.6.
- **Must include:** Interfaz que indique online/offline; app instalable; título neutral en pestaña.
- **Deliverables:** App PWA instalable; Service Worker funcional.
- **Dependencies:** MCH-000.
- **Acceptance criteria:** App abre, navega y renderiza en modo avión; Lighthouse PWA score ≥ 80.
- **Validation:** Test E2E con simulación de red desconectada; Lighthouse audit.
- **Estimate:** 2 días.
- **Owner role:** Frontend Engineer.

#### MCH-101 | Adaptador Dexie.js y Cifrado AES-GCM Local

- **Objective:** Almacenamiento persistente y cifrado en el navegador para que la evidencia sobreviva a recargas sin tocar la nube.
- **Implementation details:**
  - Inicializar DB local con `Dexie.js` (wrapper de IndexedDB): tablas `evidences` (id, hash, shortHash, contentType, capturedAt, sealedAt, state, encryptedData, metadata), `custodyEvents` (id, evidenceId, eventType, eventLabel, occurredAt, metadata), `notes` (id, evidenceId, note, createdAt).
  - Derivación de claves con PBKDF2 a partir de token de sesión temporal (`window.crypto.subtle.deriveKey`), con salt almacenado localmente.
  - Funciones CRUD locales con cifrado AES-GCM antes de escribir en IndexedDB y descifrado al leer (`window.crypto.subtle.encrypt/decrypt`).
  - Exportar como hook `useEvidenceStorage` con métodos: `saveEvidence`, `getEvidence`, `listEvidences`, `addCustodyEvent`, `addNote`, `updateState`, `deleteEvidence`.
- **Must include:** Schema Dexie con campos para hash, metadata, contenido cifrado, timestamp local, estado; distinción clara entre registros locales y servidor-backed.
- **Deliverables:** Módulo TypeScript exportable (`useEvidenceStorage`).
- **Dependencies:** MCH-100.
- **Acceptance criteria:** Evidencias se guardan, sobreviven a F5, y datos crudos en DevTools Application se ven ilegibles (cifrados); solo legibles dentro de la app.
- **Validation:** Inspección manual de IndexedDB en DevTools; test unitario de round-trip encrypt/decrypt.
- **Estimate:** 3 días.
- **Owner role:** Frontend Engineer.

#### MCH-102 | Adaptador de Estados PWA y Máquina de Transiciones

- **Objective:** Implementar la máquina de estados de evidencia del lado del cliente, sincronizada con MCH-003.
- **Implementation details:**
  - Módulo TypeScript con constantes de estado: `capturando`, `sellada-localmente`, `lista-para-revision`, `enviada-a-chimalli`, `error` y mapa de transiciones permitidas.
  - Hook `useEvidenceStateMachine` que expone `currentState`, `transitionTo(newState)`, `canTransitionTo(newState)` y lanza errores en transiciones prohibidas.
  - Registrar cada transición como evento de custodia automáticamente (integración con MCH-101).
  - Sincronizar mapeo PWA ↔ backend states para integración futura.
- **Must include:** Transiciones prohibidas lanzan error explícito; cada transición genera evento de custodia; estados solo accesibles por funciones dedicadas.
- **Deliverables:** Módulo de máquina de estados + hook.
- **Dependencies:** MCH-003, MCH-101.
- **Acceptance criteria:** Transición prohibida lanza error determinista; secuencia `capturando → sellada-localmente → lista-para-revision → enviada-a-chimalli` funciona sin red; evento de custodia registrado en cada paso.
- **Validation:** Unit tests para cada transición permitida y prohibida; integración con `useEvidenceStorage`.
- **Estimate:** 1.5 días.
- **Owner role:** Frontend Engineer.

### EPIC C — Motor Criptográfico y Generación Forense

#### MCH-200 | Captura de Evidencia y Hashing (Web Crypto API)

- **Objective:** Congelar la prueba digital capturando el archivo y generando su identidad criptográfica en el dispositivo, sin que el archivo viaje por la red.
- **Implementation details:**
  - Input HTML5 File API para recibir capturas de pantalla, imágenes compartidas o URLs (source types del schema `EvidenceType`).
  - Leer archivo como `ArrayBuffer` con `FileReader` o `file.arrayBuffer()`.
  - Pasar buffer por `window.crypto.subtle.digest('SHA-256', buffer)`, convertir resultado a cadena hexadecimal.
  - Generar `shortHash` (primeros 12 caracteres, per `SHORT_HASH_MAX_LENGTH` del schema existente).
  - Capturar metadatos: `capturedAt` (timestamp local), `evidenceType`, `platform` (inferido o seleccionado), `originalFilename`, `mimeType`, `sizeBytes`.
  - Exportar hook `useLocalSeal` que reciba `File` y retorne `{ hash, shortHash, capturedAt, metadata }`.
- **Must include:** Archivo nunca viaja en petición HTTP; mismo archivo siempre produce mismo hash.
- **Deliverables:** Hook `useLocalSeal` documentado y con tests.
- **Dependencies:** MCH-101.
- **Acceptance criteria:** Archivo produce siempre el mismo hash SHA-256; hash coincide con `sha256sum` en terminal; no hay tráfico de red durante el sellado.
- **Validation:** Comparación hash en cliente vs `sha256sum` del mismo archivo; verificación en Network tab.
- **Estimate:** 2.5 días.
- **Owner role:** Frontend Engineer.

#### MCH-201 | Ensamblaje de PDF Forense

- **Objective:** Generar el entregable tangible que la mujer protegida presentará a Chimalli y eventualmente a la autoridad.
- **Implementation details:**
  - Integrar `jsPDF` y `jspdf-autotable` para layout institucional con tipografía y paleta de DESIGN.md.
  - Integrar `qrcode-generator` para estampar URL de verificación pública (`/verify/:shortHash`) en el PDF.
  - Maquetar PDF: imagen capturada (si aplica), hash hexadecimal visible (truncado con opción de copia), fecha/hora UTC, cadena de custodia local, disclaimer legal ("Documento generado localmente. No constituye prueba per se sin ratificación de autoridad competente.").
  - Botón en UI "Generar y Descargar Reporte" que detone renderizado local.
- **Must include:** Tipografía legible, QR funcional, disclaimer legal, peso razonable (< 5 MB).
- **Deliverables:** Módulo generador de PDF; botón en UI.
- **Dependencies:** MCH-200, MCH-004.
- **Acceptance criteria:** PDF con tipografía legible, QR escaneable, disclaimer legal, peso < 5 MB para capturas.
- **Validation:** Escanear QR con teléfono real; verificar disclaimer; verificar peso.
- **Estimate:** 3 días.
- **Owner role:** Frontend Engineer.

### EPIC D — Interfaz Segura y Perspectiva de Género

#### MCH-300 | Flujo de Interfaz y Botón de Pánico

- **Objective:** Interfaz de muy baja fricción considerando la posible vulnerabilidad física de la usuaria.
- **Implementation details:**
  - Stepper de captura de evidencia: seleccionar fuente → agregar archivo → contexto opcional → sellar → revisar → guardar o enviar (DESIGN.md §16.5).
  - Botón de pánico persistente (FAB rojo/naranja per DESIGN.md §2.6): `window.location.replace('https://google.com')`, limpiar `sessionStorage`, oferta de limpieza selectiva de IndexedDB.
  - Etiquetas neutrales en pestañas y encabezados (sin "violencia" ni "denuncia", DESIGN.md §2.6).
  - Indicador de estado de red visible en App Shell.
  - Accesibilidad WCAG 2.2 AA: contraste 4.5:1, targets 44px, focus rings.
- **Must include:** Botón de pánico < 100ms; navegación posterior no muestra info sensible; etiquetas neutrales.
- **Deliverables:** Pantallas Next.js conectadas a hooks de MCH-101, MCH-102, MCH-200.
- **Dependencies:** MCH-100, MCH-101, MCH-102, MCH-200.
- **Acceptance criteria:** Botón de pánico responde en < 100ms; atrás no muestra info sensible; AA contrast check pasa.
- **Validation:** Tests E2E de redirección; verificación de contraste con axe/WAVE; medición de tiempo de respuesta.
- **Estimate:** 2 días.
- **Owner role:** Frontend Engineer + UX.

#### MCH-301 | Componentes de UI Forense (HashBlock, EvidenceCard, CustodyTimeline)

- **Objective:** Primitivas de UI reutilizables alineadas a DESIGN.md §2.4, §10, §16.7.
- **Implementation details:**
  - `HashBlock`: algoritmo, hash truncado (6 + 6 caracteres), botón "Copiar hash" (DESIGN.md §2.4).
  - `EvidenceCard`: título de evidencia, fuente, hash preview, badge de estado, acciones (ver, copiar hash, agregar nota, eliminar local), miniatura borrosa por defecto (DESIGN.md §16.7).
  - `CustodyTimeline`: línea de tiempo vertical con eventos ordenados cronológicamente, iconos por tipo, timestamps legibles (DESIGN.md §10).
  - Props semánticos (`variant`, `size`, `state`), CSS variables de DESIGN.md, labels ARIA, keyboard navigation.
- **Must include:** Props semánticos según DESIGN.md; contrastes AA; labels ARIA; interacción por teclado.
- **Deliverables:** Componentes React + documentación de uso.
- **Dependencies:** MCH-100, MCH-003, MCH-004.
- **Acceptance criteria:** Componentes reutilizables en demo y PWA; defaults privacidad-seguros; pasan verificación de accesibilidad.
- **Validation:** a11y checks con axe; verificación visual en móvil y desktop.
- **Estimate:** 2.5 días.
- **Owner role:** Frontend Engineer.

### EPIC E — Endpoint Público (Única Conexión Backend Machiyotl)

#### MCH-400 | Endpoint de Verificación Pública

- **Objective:** Micro-servicio de solo lectura para auditoría pública de evidencias selladas.
- **Implementation details:**
  - Crear `backend/app/services/machiyotl/verify_service.py` con `verify_hash(db, hash) -> HashVerifyResponse`.
  - Crear `backend/app/api/v1/machiyotl.py` con router `GET /verify/{hash}` (FastAPI, sin auth).
  - Buscar hash en `machiyotl.evidence_items` por `sha256_hash` o `short_hash`.
  - Hash encontrado → 200 `{ result: "match", sealed_at, short_hash, warning }`.
  - Hash no encontrado → 200 `{ result: "evidence_not_found", warning }`.
  - Hash inválido (no hex, >128 chars) → 400 con `MachiyotlErrorResponse`.
  - Registrar cada verificación en `machiyotl.hash_verifications`.
- **Must include:** Endpoint NUNCA retorna contenido original; disclaimer legal obligatorio; sin autenticación.
- **Deliverables:** `verify_service.py`, `machiyotl.py` router, `test_machiyotl_verify.py` (6 tests).
- **Dependencies:** MCH-005, MCH-000.
- **Acceptance criteria:** Cualquier persona puede validar un hash sin descargar contenido; respuestas 200 (match o not_found), 400 (hash inválido); disclaimer siempre presente.
- **Validation:** Peticiones curl validando 200 match, 200 not_found, 400 invalid_hash; 6 tests pasan.
- **Estimate:** 1 hora.
- **Owner role:** Backend Engineer.
- **Status:** ✅ Completado (2026-05-15) — `verify_service.py` implementado; router registrado en `router.py`; 22/22 tests pasan; endpoint responde correctamente vía curl.

### EPIC F — Backend Test Suite (Standby Phase)

#### MCH-106 | Backend Test Suite para Código Preservado

- **Objective:** Puertas de confianza para el backend de Machiyotl en standby: schemas, Audit Service y Repository correctos y deterministas.
- **Implementation details:**
  - Tests de validación de schemas: hash inválido, transición prohibida, timestamp futuro, metadata oversized, enums fuera de dominio, strings fuera de límite.
  - Tests de máquina de estados: todas las transiciones permitidas y prohibidas, estados terminales, recuperación desde error.
  - Tests de Auditoría: cada acción genera fila con schema/tabla/acción correctos; sanitización de metadata (no filtra nota, source_url, local_file_path, original_filename, ni hashes completos).
  - Tests de Repository: paginación y límites, filtros combinados, custodia timeline ordenada cronológicamente, resultados vacíos.
  - Tests negativos: hashes no hex, transiciones prohibidas retornan False, metadata con campos prohibidos se limpia.
- **Must include:** Tests negativos para transiciones prohibidas e hashes inválidos; determinismo en CI.
- **Deliverables:** Archivos de test y fixtures en `backend/tests/machiyotl/`.
- **Dependencies:** MCH-000.
- **Acceptance criteria:** Flujos críticos y fallos cubiertos; repetible en CI; tests existentes preservados o actualizados.
- **Validation:** CI pasa; `pytest` local determinista.
- **Estimate:** 2 días.
- **Owner role:** Backend Engineer + QA.

---

## Priorización Recomendada

| Bloque | Tasks | Propósito |
|---|---|---|
| Bloque 1 (Pivot & Governance) | MCH-000, MCH-001, MCH-002, MCH-003, MCH-004, MCH-005 | Estabilizar gobernanza y documentación antes de construir |
| Bloque 2 (PWA Foundation) | MCH-100, MCH-101, MCH-102 | App instalable + almacenamiento cifrado + máquina de estados |
| Bloque 3 (Crypto Engine) | MCH-200, MCH-201 | Hashing local + PDF forense |
| Bloque 4 (Safe UI) | MCH-300, MCH-301 | Interfaz con perspectiva de género + componentes forenses |
| Bloque 5 (Integration) | MCH-400, MCH-106 | Endpoint de verificación + test suite backend |

---

## Gobernanza y Referencias

| Documento | Ubicación |
|---|---|
| Module charter | `docs/product/machiyotl-module-charter.md` |
| Execution plan MCH-000 | `docs/product/machiyotl-mch-000-execution-plan.md` |
| API contract (v0 Chimalli) | `docs/technical/api-contracts.md` |
| Design system y UI | `DESIGN.md` (§2.4, §2.6, §10, §16.5–§16.8) |
| Architecture | `ARCHITECTURE.md` |
| Security principles | `SECURITY.md` |
| Legal corpus | `legal-corpus/` (federal, baja-california, international, jurisprudence, protocols) |
| RAG documents | `rag_documents/` (6 directorios con marco legal, procedimientos, estadísticas) |

### Referencias Legales Clave

| Referencia | Ubicación en `legal-corpus/` o `rag_documents/` |
|---|---|
| Ley Electoral del Estado de BC (Art. 3 XVIII, Arts. 337 BIS, 373 BIS, 377 BIS, 382 BIS, 363, 372, 354, 61 BIS) | `rag_documents/01_legal_core/` |
| Ley de Acceso de las Mujeres a una Vida Libre de Violencia para BC (Art. 6 VII, VII Bis, VIII, 11 Bis-TER) | `rag_documents/01_legal_core/` |
| LGAMVLV (Arts. 20 Bis, 20 Ter, 20 Quáter, 20 Quinquies) | `rag_documents/02_procedimiento_ieebc/` |
| Reglamento de Quejas y Denuncias del IEEBC (Arts. 57-61, 59 BIS, 59 TER, 60 BIS) | `rag_documents/02_procedimiento_ieebc/` |
| Protocolo de Atención de Primer Contacto VPMRG del IEEBC | `rag_documents/02_procedimiento_ieebc/` |
| Criterios TEPJF sobre Violencia Digital en Razón de Género | `rag_documents/03_violencia_digital_genero/` |
| Ley de Víctimas BC (Arts. 24, 105, 106, 109 — datos reservados/confidenciales) | `rag_documents/04_atencion_victimas/` |
| Ley de Transparencia BC (Arts. 71, 99, 100 — datos personales/sensibles) | `rag_documents/05_privacidad_datos/` |
| Estadísticas VPMRG (169/484 = 35% vinculadas a medios digitales) | `rag_documents/06_contexto_estadistico/` |

---

## Mapeo: Tasks Viejas → Nuevas

| Vieja | Estado en `origin/develop` | Nueva |
|---|---|---|
| MCH-001 Charter | ✅ Completado (MCH-001) | MCH-001 |
| MCH-002 Risk Register | ❌ No existe | MCH-002 |
| MCH-003 State Machine | ⏳ Definida en schemas (feature branch); spec PWA pendiente | MCH-003 |
| MCH-004 Custody Events | ⏳ Definida en schemas (feature branch); spec PWA pendiente | MCH-004 |
| MCH-005 API Contract | ❌ Solo Chimalli existe | MCH-005 |
| MCH-101 Schemas | ⏳ En feature branch `mch-101`; no fusionada | Pendiente re-implementación |
| MCH-102 Service Layer | ❌ No existe en esta rama | Congelado por MCH-000 |
| MCH-103 API Router | ❌ No existe; bloqueado por MCH-000 | MCH-000 lo congela |
| MCH-104 Audit Trail | ⏳ En feature branch `mch-104`; no fusionada | Pendiente re-implementación |
| MCH-105 Repository | ⏳ En feature branch `mch-105`; no fusionada | Pendiente re-implementación |
| MCH-106 Test Suite | ⏳ En feature branch; no fusionada | MCH-106 |
| MCH-201 PWA Foundation | ❌ Placeholder | MCH-100 |
| MCH-202 Capture Stepper | ❌ No existe | MCH-300 |
| MCH-203 Local Data Adapter | ❌ No existe | MCH-101 |
| MCH-204 UI Components | ❌ No existe | MCH-301 |
| MCH-205 Safety Guardrails | ❌ No existe | Incluido en MCH-300 |
| MCH-301 Integration | ❌ No existe | MCH-400 (reducido a verificación) |
| MCH-302 Seed Data | ✅ Existe; actualizar después | — |
| MCH-303 Runbook | ❌ Posponer | — |
| MCH-304 Release Gate | ❌ Posponer | — |
