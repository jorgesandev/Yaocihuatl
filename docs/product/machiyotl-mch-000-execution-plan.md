# MCH-000 — Execution Plan: Congelamiento de Backend Machiyotl

Documenta la decisión arquitectónica de congelar el desarrollo backend REST tradicional para Machiyotl y la transición al enfoque PWA/Zero-Knowledge.

---

## Contexto

Antes del pivote arquitectónico, el agente generó código backend relacional para Machiyotl en feature branches (`mch-101`, `mch-104`, `mch-105`):

| Feature Branch | Contenido | Estado |
|---|---|---|
| `mch-101-machiyotl-schemas` | Pydantic schemas, enums, state machine, validadores | No fusionada a `origin/develop` |
| `mch-104-machiyotl-schemas` | Audit service (6 métodos + sanitización) | No fusionada a `origin/develop` |
| `mch-105-machiyotl-repository` | Repository layer (6 queries + index migration) | No fusionada a `origin/develop` |

Este enfoque violaba el principio **Zero-Knowledge**: el backend estaba diseñado para recibir, sellar y gestionar evidencia en el servidor. La arquitectura correcta de Machiyotl es PWA con sellado local.

---

## Decisión

**Congelar el desarrollo backend REST tradicional para Machiyotl.**

- No se crearán endpoints POST/PUT/DELETE para Machiyotl.
- El único endpoint backend de Machiyotl es de solo lectura: `GET /verify/:hash`.
- Los schemas, audit service y repository serán re-implementados como parte de la Fase 2, cuando el backend necesite gestionar evidencia sellada que llegue voluntariamente desde la PWA.

---

## Qué se Preservó en `origin/develop`

| Componente | Ubicación | Razón |
|---|---|---|
| ORM models (4 clases) | `backend/app/db/models.py:245-303` | Necesarios para la tabla de evidencia y Chimalli |
| Migration base (`0001`) | `backend/migrations/versions/` | Crea schema `machiyotl` y 4 tablas |
| Seed data | `backend/app/seed/demo_data.py:260-300` | Referenciado por tests de auth y migrations |
| `machiyotl_evidence_hashes` | `backend/app/schemas/chimalli.py:29` | Chimalli necesita este campo en integration |
| Referencia en case_service | `backend/app/services/chimalli/case_service.py:91` | Itera sobre evidence hashes |

---

## Qué se Congeló

| Componente | Estado |
|---|---|
| API endpoints POST/PUT/DELETE para Machiyotl | No existen; no se crearán |
| Pydantic schemas completos (EvidenceItem, Note, CustodyEvent) | Feature branch no fusionada; pendiente re-implementación |
| Audit service | Feature branch no fusionada; pendiente re-implementación |
| Repository | Feature branch no fusionada; pendiente re-implementación |
| Integration tests (`test_machiyotl_integration.py`) | Feature branch no fusionada; pendiente re-implementación |
| Index migration (`20260515_0002`) | Feature branch no fusionada; el índice huérfano se eliminó de la DB |
| `test_auth_api.py` | Eliminado (dependía de ORM models en tests que no corresponden) |

---

## Qué se Construyó Nuevo

| Componente | Ubicación | Task |
|---|---|---|
| Schemas de verificación (HashVerifyRequest, HashVerifyResponse) | `backend/app/schemas/machiyotl.py` | MCH-005 |
| MachiyotlErrorResponse | `backend/app/schemas/machiyotl.py` | MCH-400 |
| Verify service | `backend/app/services/machiyotl/verify_service.py` | MCH-400 |
| API router (verify) | `backend/app/api/v1/machiyotl.py` | MCH-400 |
| Tests de verificación (6 casos) | `backend/tests/test_machiyotl_verify.py` | MCH-400 |
| Contrato API Machiyotl MVP | `docs/technical/api-contracts.md#machiyotl-mvp` | MCH-005 |
| README de módulo (reescritura completa) | `backend/modules/machiyotl/README.md` | MCH-000 |
| Charter de módulo | `docs/product/machiyotl-module-charter.md` | MCH-001 |

---

## Ruta Forward

### Bloque 1: Pivot & Governance (En Progreso)
- ✅ MCH-000: Congelamiento de backend
- ✅ MCH-005: Contrato API de verificación
- ✅ MCH-400: Endpoint de verificación
- ✅ MCH-001: Charter + README reescritos
- ⏳ MCH-002: Registro de riesgos
- ⏳ MCH-003: Máquina de estados PWA
- ⏳ MCH-004: Taxonomía de eventos de custodia

### Bloque 2: PWA Foundation (Pendiente)
- MCH-100: Service Worker + PWA Shell
- MCH-101: Dexie.js + AES-GCM local
- MCH-102: Máquina de estados cliente

### Bloque 3: Crypto Engine (Pendiente)
- MCH-200: Captura y hashing (Web Crypto API)
- MCH-201: Ensamblaje de PDF forense

### Bloque 4: Safe UI (Pendiente)
- MCH-300: Flujo de interfaz + botón de pánico
- MCH-301: Componentes de UI forense

### Bloque 5: Integration (Parcialmente completado)
- ✅ MCH-400: Endpoint de verificación
- ⏳ MCH-106: Backend test suite

### Fase 2: Backend Completo (Futuro)
- Re-implementar schemas Pydantic completos
- Re-implementar audit service con sanitización
- Re-implementar repository con queries indexadas
- Crear tests de integración completos
- Implementar `assert_machiyotl_only` guard
- Agregar índice `ix_machiyotl_evidence_owner_status`

---

## Resultado de la Transición

- Backend corre sin rutas POST para Machiyotl. ✅
- Suite de pruebas (22/22) pasa sin dependencias huérfanas de Machiyotl. ✅
- Chimalli importa `machiyotl_evidence_hashes` sin error. ✅
- DB limpia: `alembic_version` en `20260515_0001`; índice huérfano eliminado. ✅
- Código de feature branches documentado como referencia de diseño. ✅

---

**Fecha:** 2026-05-15
**Autor:** Tech Lead
**Versión:** 1.0
