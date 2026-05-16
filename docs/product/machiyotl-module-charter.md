# Machiyotl — Module Charter

Charter de gobernanza del módulo Machiyotl. Define propósito, alcance, límites, datos manejados, ciclo de vida de evidencia, restricciones legales y límites de integración. Sirve para responder "¿este comportamiento vive en Machiyotl?" sin ambigüedad.

---

## Propósito

Machiyotl es el módulo de **sellado forense de evidencia digital** de Yaocíhuatl. Captura evidencia, genera identidad criptográfica (SHA-256), mantiene cadena de custodia local y produce reportes PDF verificables. Funciona como **PWA offline-first** con arquitectura **Zero-Knowledge**: ningún contenido de evidencia toca el servidor antes del sellado local.

---

## Alcance (In-Scope)

- Captura de evidencia digital en el dispositivo (capturas de pantalla, imágenes, archivos, URLs).
- Generación de identidad criptográfica (SHA-256) mediante Web Crypto API. Local, sin red.
- Cifrado y almacenamiento local de evidencia (IndexedDB + AES-GCM via Dexie.js).
- Cadena de custodia local y auditable con eventos ordenados cronológicamente.
- Generación de reportes PDF forenses con QR de verificación pública.
- Verificación pública de existencia de hashes sellados (endpoint backend de solo lectura: `GET /verify/:hash`).
- Botón de pánico (< 100ms) y salida segura de la aplicación.
- Distinción explícita entre estados locales (solo dispositivo) y estados de servidor.

## Fuera de Alcance (Out-of-Scope)

- Monitoreo o scraping de redes sociales y plataformas digitales (responsabilidad de Tlachia).
- Decisión de validez legal de la evidencia (responsabilidad de Chimalli con revisión humana).
- Upload automático o silencioso de evidencia a servidores.
- Clasificación jurídica del contenido de evidencia.
- Almacenamiento de claves de cifrado en el servidor.
- Sustitución de la ratificación de autoridad competente.
- Presentación automática de denuncias.

---

## Datos Manejados

| Clase de dato | Ejemplo | Sensibilidad | ¿Dónde se almacena? | Retención |
|---|---|---|---|---|
| Evidencia digital (contenido) | Captura de pantalla, imagen, archivo | Alta — contenido potencialmente íntimo o sensible | Solo dispositivo (IndexedDB cifrado) | Control de la usuaria |
| Hash SHA-256 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | Baja — no revela contenido, solo identidad criptográfica | Dispositivo + servidor (para verificación) | Indefinida (demo) / Configurable (prod) |
| Short hash (prefijo 12 chars) | `e3b0c44298fc` | Baja — derivado del hash | Servidor (consulta) | Indefinida (demo) / Configurable (prod) |
| Metadatos de custodia | Timestamp, tipo de evento, actor, hash asociado | Media — puede revelar patrones de uso | Dispositivo + servidor (audit trail) | Configurable |
| Datos personales de la usuaria | Nombre, contacto, identificadores | Alta — protegidos por Ley de Víctimas BC Arts. 24, 105, 106, 109 | **NUNCA** en el servidor vía Machiyotl | La usuaria decide |
| Datos de identificación del agresor | Nombre, cuenta, handle | Alta — requiere base legal para procesamiento | **NUNCA** en Machiyotl (solo Chimalli si aplica) | N/A en este módulo |

---

## Ciclo de Vida de Evidencia

### Estados Backend (Fase 2)

Definidos en el diseño de schemas del feature branch no fusionado. Mapean a las tablas `machiyotl.evidence_items`.

```
draft        → [sealed-local, ready, error]
sealed-local → [ready, error]
ready        → [submitted, error]
submitted    → []  (estado terminal)
error        → [draft, sealed-local]  (recuperación)
```

**Reglas:**
- `draft` no puede saltar directamente a `submitted`. Debe pasar por `sealed-local` o `ready`.
- `submitted` es terminal: no tiene transiciones de salida.
- `error` permite recuperación a `draft` o `sealed-local`.
- No hay transición de `sealed-local` de regreso a `draft` (el sellado no se deshace).

### Estados PWA (Fase 1 — Cliente)

```
capturando           → sellada-localmente
sellada-localmente   → lista-para-revision, error
lista-para-revision  → enviada-a-chimalli, error
enviada-a-chimalli   → []  (estado terminal en cliente)
error                → capturando, sellada-localmente  (recuperación)
```

**Mapeo Backend ↔ PWA:**

| Estado PWA | Estado Backend | ¿Requiere red? |
|---|---|---|
| `capturando` | `draft` | No |
| `sellada-localmente` | `sealed-local` | No |
| `lista-para-revision` | `ready` | No |
| `enviada-a-chimalli` | `submitted` | Sí |
| `error` | `error` | No |

---

## Eventos de Cadena de Custodia (Diseño de Referencia)

Tipos definidos para trazabilidad de cada acción sobre la evidencia:

| Evento | Descripción | Metadatos obligatorios |
|---|---|---|
| `capture_started` | Inicio de captura de evidencia | `source_type`, `timestamp_local` |
| `sealed_local` | Sellado criptográfico local completado | `sha256_hash`, `short_hash`, `timestamp_local` |
| `metadata_reviewed` | Revisión de metadatos por la usuaria | `fields_reviewed`, `timestamp_local` |
| `ready_for_review` | Evidencia lista para revisión final | `timestamp_local` |
| `submitted_to_review` | Envío a revisión (Chimalli) | `case_id` (si aplica), `timestamp` |
| `received_by_authority` | Recepción por autoridad competente | `authority_id`, `timestamp` |

**Reglas:**
- Cada evento tiene `occurred_at` en UTC.
- Eventos duplicados no generan registro adicional (idempotencia).
- Los eventos se ordenan cronológicamente por `occurred_at ASC`.

---

## Restricciones Legales y Éticas

1. **Zero-Knowledge**: El contenido de evidencia (imagen, archivo, captura) nunca sale del dispositivo antes del sellado local. El servidor solo recibe hashes para verificación.
2. **Confidencialidad de la víctima**: Los datos de la mujer protegida son reservados y confidenciales según la Ley de Víctimas de BC (Arts. 24, 105, 106, 109) y la Ley de Transparencia de BC (Arts. 71, 99, 100).
3. **No decisión automática**: Ningún componente de Machiyotl toma decisiones legales ni clasifica contenido sin supervisión humana. Toda salida es asistiva.
4. **Disclaimer legal obligatorio**: Toda respuesta de verificación incluye: "Verificación criptográfica de datos sintéticos. No constituye validez legal ni reemplaza la ratificación de autoridad competente."
5. **Brecha legal identificada**: Ningún marco legal consultado (Ley Electoral BC, Ley de Acceso BC, LGAMVLV, Reglamento IEEBC, Protocolo de Atención) contempla protocolo de cadena de custodia digital, hash criptográfico ni preservación offline. Machiyotl llena ese vacío técnico.
6. **Sin datos reales en repositorio**: Solo se versionan datos sintéticos y demo-seguros.
7. **Minimización de datos**: Solo se almacenan los metadatos mínimos necesarios para trazabilidad. El contenido solo existe en el dispositivo de la usuaria.

---

## Límites de Integración

| Módulo | Relación con Machiyotl | Datos compartidos |
|---|---|---|
| **Tlachia** | Sin dependencia en tiempo real | Ninguno directo |
| **Chimalli** | Envío voluntario de evidencia sellada por la usuaria | `machiyotl_evidence_hashes` (solo hashes, no contenido) |
| **Core** | Vinculación opcional de evidencia a casos | `case_id` en tabla `evidence_items` |
| **IAM/Audit** | Trazabilidad de acciones sensibles | `AuditLog` para acciones de evidencia y verificación |

**Regla:** Machiyotl no comparte contenido de evidencia con ningún módulo. Solo comparte hashes y metadatos de estado.

---

## Hard Constraints

1. **Zero-Knowledge**: Contenido nunca sale del dispositivo antes del sellado local.
2. **Offline-first**: Captura, sellado, almacenamiento y generación de PDF funcionan sin red.
3. **Botón de pánico**: Redirección de emergencia en < 100ms.
4. **WCAG 2.2 AA**: Contraste 4.5:1 (texto), 3:1 (elementos grandes), focus rings visibles, targets ≥ 44px.
5. **Sin datos reales en el repositorio**: Solo datos sintéticos y demo-seguros versionados.
6. **Separación estricta de módulos**: Sin dependencia de Tlachia o Chimalli en tiempo real.
7. **IA asistiva, no decisoria**: Toda salida automática requiere validación humana.

---

## Referencias

| Documento | Propósito |
|---|---|
| `ARCHITECTURE.md` | Arquitectura general del sistema y modelo de datos |
| `SECURITY.md` | Principios de seguridad y datos prohibidos |
| `DESIGN.md` §2.4, §2.6, §10, §16.5–§16.8 | Diseño visual y flujos de UI |
| `docs/technical/api-contracts.md#machiyotl-mvp` | Contrato del endpoint de verificación |
| `docs/product/machiyotl-mch-000-execution-plan.md` | Plan de transición del backend al enfoque PWA |
| `rag_documents/` | Corpus legal de referencia (6 directorios) |
| `legal-corpus/` | Corpus legal versionado (federal, baja-california, internacional) |

---

## Gobernanza

- Versión: 1.0 (2026-05-15)
- Owner: PM + Tech Lead
- Revisión: Cada cambio sustancial en el alcance o arquitectura del módulo debe actualizar este charter.
- Aprobación: Requiere sign-off de PM + Tech Lead sin contradicciones con `ARCHITECTURE.md`, `SECURITY.md`, ni `DESIGN.md`.
