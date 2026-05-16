# Machiyotl — Registro de Riesgos y Supuestos

Documento vivo de gobernanza técnica. Hace explícitos los riesgos y supuestos del enfoque PWA/Zero-Knowledge de Machiyotl. Debe revisarse antes de cada expansión de lógica funcional y ante cambios en el marco legal aplicable.

---

## Propósito

- Identificar y documentar los riesgos técnicos, legales, operacionales y de seguridad del módulo Machiyotl.
- Asignar dueño a cada riesgo de alto impacto con acción de mitigación definida.
- Establecer cadencia de revisión para mantener el registro actualizado.
- Servir como referencia para auditorías de seguridad y privacidad.

## Cadencia de Revisión

| Evento | Acción |
|---|---|
| Inicio de cada bloque del task board | Revisión completa del registro |
| Cambio en el marco legal aplicable | Revisión de riesgos legales (R-007, R-012) |
| Incidente de seguridad o privacidad | Revisión inmediata del riesgo relacionado + nuevo riesgo si aplica |
| Discovery de nueva técnica de ataque o vulnerabilidad | Evaluación de impacto en riesgos existentes |
| Cada 3 meses | Revisión programada de todo el registro |

---

## Supuestos Clave

Estos supuestos sustentan la arquitectura Zero-Knowledge de Machiyotl. Si alguno cambia, los riesgos asociados deben re-evaluarse.

### Supuestos Técnicos

| ID | Supuesto | Impacto si es falso |
|---|---|---|
| S-001 | La usuaria tiene acceso a un navegador moderno con soporte para Web Crypto API (`window.crypto.subtle`) | Alto — no se puede generar SHA-256 ni AES-GCM. Requiere fallback o polyfill. |
| S-002 | La usuaria puede guardar y leer archivos localmente en el dispositivo (File API, IndexedDB) | Medio — la PWA no puede almacenar evidencia. Degradación a flujo alternativo. |
| S-003 | La usuaria tiene suficiente espacio de almacenamiento local para evidencia (capturas, PDFs) | Medio — evidencia grande puede fallar. UX debe advertir antes de saturar. |
| S-004 | El dispositivo mantiene la hora local razonablemente precisa (±1 minuto) | Bajo — timestamps pueden ser inexactos pero el hash sigue siendo válido. |
| S-005 | La red (cuando disponible) es lo suficientemente confiable para verificar un hash por HTTP GET | Bajo — la verificación es asíncrona y no crítica para el flujo de sellado. |

### Supuestos Criptográficos

| ID | Supuesto | Impacto si es falso |
|---|---|---|
| S-006 | SHA-256 es resistente a colisiones y adecuado para identidad criptográfica de evidencia digital | Alto — requeriría migrar a otro algoritmo de hash. |
| S-007 | AES-GCM con clave derivada de PBKDF2 proporciona cifrado suficiente para datos en reposo local | Alto — requeriría cambiar el esquema de cifrado. |
| S-008 | El token de sesión temporal usado para derivación de clave no es accesible para terceros en el dispositivo | Alto — un atacante con acceso al dispositivo podría descifrar evidencia. |

### Supuestos Legales e Institucionales

| ID | Supuesto | Impacto si es falso |
|---|---|---|
| S-009 | El sellado criptográfico local (SHA-256) es aceptable como paso previo a la ratificación de autoridad competente | Alto — la evidencia podría ser rechazada en procedimiento formal. |
| S-010 | La cadena de custodia local documentada es suficiente para iniciar un proceso de revisión institucional | Alto — podría requerirse protocolo adicional. |
| S-011 | La PWA no será clasificada como herramienta de vigilancia o censura por autoridades | Alto — riesgo reputacional y legal para el proyecto. |
| S-012 | El endpoint de verificación pública no será usado maliciosamente para correlacionar hashes con víctimas | Medio — requeriría rate limiting y diseño cuidadoso. |

### Supuestos Operacionales

| ID | Supuesto | Impacto si es falso |
|---|---|---|
| S-013 | La PWA puede instalarse y funcionar en modo offline sin requerir conexión inicial más allá de la primera carga | Medio — si el Service Worker no cachea correctamente, la app no carga offline. |
| S-014 | Los datos en IndexedDB persisten entre sesiones y recargas de página | Alto — si el navegador borra IndexedDB, la evidencia se pierde. |
| S-015 | La usuaria entiende la diferencia entre almacenamiento local (dispositivo) y envío al servidor | Alto — podría enviar evidencia sin consentimiento informado. |

---

## Riesgos — Fase 1 (PWA Standalone)

Riesgos específicos de la fase en que Machiyotl opera exclusivamente como PWA en el dispositivo, sin integración backend (excepto el endpoint de verificación).

### R-001: Fuga de privacidad por almacenamiento local accesible

| Campo | Valor |
|---|---|
| **Descripción** | IndexedDB es accesible desde DevTools del navegador. Si un tercero obtiene acceso físico al dispositivo desbloqueado, podría inspeccionar la base de datos local. |
| **Fase** | 1 (PWA Standalone) |
| **Impacto** | **Alto** — exposición de evidencia sensible, posible identificación de la víctima, violación de confidencialidad (Ley de Víctimas BC Arts. 24, 105, 106, 109). |
| **Probabilidad** | **Media** — requiere acceso físico al dispositivo desbloqueado + conocimiento técnico para abrir DevTools y navegar IndexedDB. Escenario plausible en contextos de violencia doméstica o coacción. |
| **Mitigación** | Cifrado AES-GCM de todos los datos antes de escribirlos en IndexedDB. Clave derivada de token de sesión temporal vía PBKDF2. Datos crudos en DevTools aparecen como blobs ilegibles. Documentar que el cifrado no protege contra acceso con la app abierta y autenticada. |
| **Dueño** | Frontend Engineer |
| **Fecha de revisión** | 2026-08-15 |

### R-002: Pérdida de datos offline sin sincronización

| Campo | Valor |
|---|---|
| **Descripción** | La evidencia sellada localmente existe solo en el dispositivo. Si el navegador borra IndexedDB (storage pressure, limpieza manual, error del sistema), la evidencia se pierde sin posibilidad de recuperación. |
| **Fase** | 1 (PWA Standalone) |
| **Impacto** | **Alto** — pérdida irreversible de evidencia forense ya sellada. La víctima tendría que re-capturar (si el contenido original sigue disponible, lo cual no es garantía en contextos de violencia digital donde el agresor puede eliminar el contenido). |
| **Probabilidad** | **Alta** — Chrome y Safari pueden liberar espacio de IndexedDB bajo storage pressure. Usuarias pueden limpiar datos de navegación sin entender que borran evidencia. |
| **Mitigación** | UX explícita: "Tu evidencia está guardada solo en este dispositivo." Alerta antes de cerrar/recargar si hay evidencia no respaldada. Opción de exportar PDF localmente como respaldo. Instrucciones claras sobre cómo preservar IndexedDB. Considerar Web Locks API para prevenir cierre accidental durante captura. |
| **Dueño** | Frontend Engineer + UX |
| **Fecha de revisión** | 2026-08-15 |

### R-003: Diferencias de comportamiento entre navegadores en Web Crypto API

| Campo | Valor |
|---|---|
| **Descripción** | `window.crypto.subtle` tiene soporte amplio pero diferencias sutiles entre navegadores (Chrome, Firefox, Safari, Edge) en manejo de `ArrayBuffer`, `digest()`, `encrypt()/decrypt()` con AES-GCM, y `deriveKey()` con PBKDF2. Un hash generado en un navegador debe ser idéntico al generado en otro. |
| **Fase** | 1 (PWA Standalone) |
| **Impacto** | **Medio** — si el hash difiere entre navegadores, la verificación pública (que se hace contra el hash del servidor) fallaría, minando la confianza en el sistema. No afecta la seguridad del contenido (que sigue cifrado localmente). |
| **Probabilidad** | **Media** — Web Crypto API está estandarizado (W3C), pero implementaciones pueden tener edge cases con ciertos tipos de archivo o tamaños de buffer. |
| **Mitigación** | Tests cross-browser (Chrome, Firefox, Safari, Edge) con archivos de prueba de distintos tipos y tamaños. Documentar navegadores soportados explícitamente. Implementar polyfill o fallback para navegadores sin soporte. Comparar hashes generados contra `sha256sum` de terminal como referencia. |
| **Dueño** | Frontend Engineer |
| **Fecha de revisión** | 2026-08-15 |

### R-004: Botón de pánico no responde dentro del límite de 100ms

| Campo | Valor |
|---|---|
| **Descripción** | La hard constraint requiere que el botón de pánico ejecute redirección en < 100ms. Si la redirección (`window.location.replace`) se retrasa por operaciones síncronas (limpieza de IndexedDB, borrado de sessionStorage) ejecutadas antes de la redirección, la usuaria en situación de peligro queda expuesta. |
| **Fase** | 1 (PWA Standalone) |
| **Impacto** | **Alto** — en una situación de violencia física inminente, cada milisegundo cuenta. Un retraso podría exponer a la usuaria a daño físico. |
| **Probabilidad** | **Baja** — la redirección misma es rápida (< 10ms). El riesgo está en operaciones previas costosas. |
| **Mitigación** | Orden de operaciones: 1) `window.location.replace()` inmediatamente, 2) limpieza asíncrona después (el navegador ya redirigió). Medición automatizada con `performance.now()`. Timeout de seguridad: si la redirección no ocurre en 50ms, forzar `window.location = 'about:blank'`. No realizar operaciones síncronas de limpieza antes de redirigir. |
| **Dueño** | Frontend Engineer |
| **Fecha de revisión** | 2026-08-15 |

### R-005: Contenido sensible visible en caché del navegador después de navegación

| Campo | Valor |
|---|---|
| **Descripción** | Después de usar Machiyotl, el navegador puede retener en caché (HTTP cache, Service Worker cache, memory cache) fragmentos de la aplicación que revelen que la usuaria estuvo en una app de evidencia forense. Un tercero con acceso al dispositivo podría ver el historial o inspeccionar la caché. |
| **Fase** | 1 (PWA Standalone) |
| **Impacto** | **Medio** — no expone el contenido de la evidencia (que está cifrado), pero revela el uso de la aplicación, lo cual en contextos de violencia doméstica podría desencadenar represalias. |
| **Probabilidad** | **Media** — navegadores modernos cachean agresivamente para rendimiento. El Service Worker puede mitigar esto con estrategias de caché adecuadas. |
| **Mitigación** | Service Worker con estrategia `NetworkFirst` o `NetworkOnly` para páginas sensibles. Headers HTTP con `Cache-Control: no-store` en la PWA. Limpieza de caché del Service Worker en el flujo de salida segura. Título neutral de la app (sin "violencia" ni "denuncia" visible en pestañas). Usar `registerProtocolHandler` con precaución para no exponer rutas. |
| **Dueño** | Frontend Engineer |
| **Fecha de revisión** | 2026-08-15 |

### R-014: Usuaria en situación de vulnerabilidad no puede interactuar con la UI

| Campo | Valor |
|---|---|
| **Descripción** | La interfaz de captura de evidencia (stepper, formularios, selección de archivos) puede ser demasiado compleja o requerir demasiados pasos para una usuaria en situación de estrés agudo, prisa, o con conocimientos técnicos limitados. |
| **Fase** | 1 (PWA Standalone) |
| **Impacto** | **Alto** — la usuaria abandona el flujo sin completar el sellado. La evidencia no se preserva. |
| **Probabilidad** | **Media** — la fricción cognitiva en situaciones de estrés es un fenómeno documentado. Interfaces que requieren múltiples decisiones o pasos pueden ser abrumadoras. |
| **Mitigación** | Diseño de muy baja fricción: un solo botón para capturar + sellar. Valores por defecto inteligentes (tipo de evidencia inferido, timestamp automático). Progreso visible en pasos cortos. Lenguaje claro y no técnico. Test con usuarias reales y feedback de organizaciones de apoyo a víctimas. Cumplir WCAG 2.2 AA para accesibilidad cognitiva. |
| **Dueño** | Frontend Engineer + UX |
| **Fecha de revisión** | 2026-08-15 |

---

## Riesgos — Fase 2 (Integración Backend)

Riesgos que se materializan cuando Machiyotl integra backend para recibir evidencia sellada y gestionar verificaciones.

### R-006: Mal uso del endpoint de verificación para vigilancia o censura

| Campo | Valor |
|---|---|
| **Descripción** | El endpoint `GET /verify/:hash` es público y sin autenticación. Un actor malicioso podría usarlo para: (a) verificar si una víctima específica ha sellado evidencia (si conoce el hash), (b) realizar scraping masivo de hashes para construir una base de datos de evidencia sellada, (c) usar el endpoint como parte de una campaña de censura para identificar y eliminar contenido. |
| **Fase** | 2 (Integración Backend) |
| **Impacto** | **Alto** — violación de privacidad de víctimas, posible inhibición del uso del sistema por miedo a exposición. |
| **Probabilidad** | **Baja** — requiere conocer hashes específicos o realizar scraping a escala. El endpoint solo confirma existencia, no revela contenido. |
| **Mitigación** | Rate limiting estricto (10 req/min por IP). No retornar `evidence_id` por defecto. No exponer metadatos adicionales que permitan correlacionar. Monitoreo de patrones de uso anómalos. Disclaimer legal visible en toda respuesta. Considerar autenticación opcional para verificaciones institucionales con más información. |
| **Dueño** | Backend Engineer |
| **Fecha de revisión** | 2026-11-15 |

### R-007: Sobre-afirmación legal del sellado criptográfico

| Campo | Valor |
|---|---|
| **Descripción** | La usuaria, una autoridad o un tercero podría interpretar que el hash SHA-256 generado por Machiyotl constituye prueba legal por sí mismo, sin requerir ratificación de autoridad competente. Esto es falso: el hash demuestra integridad criptográfica, no validez legal. |
| **Fase** | 2 (Integración Backend) |
| **Impacto** | **Alto** — si una autoridad acepta el hash como prueba sin ratificación, se crea un precedente peligroso. Si una autoridad rechaza el hash por no ser prueba suficiente, la víctima queda desprotegida. En ambos casos, hay riesgo legal para el proyecto. |
| **Probabilidad** | **Alta** — el sistema puede ser malinterpretado por usuarios no técnicos o por autoridades sin capacitación en evidencia digital. |
| **Mitigación** | Disclaimer legal obligatorio en toda respuesta del endpoint y en el PDF forense: "Verificación criptográfica de datos sintéticos. No constituye validez legal ni reemplaza la ratificación de autoridad competente." Documentación clara sobre qué ES y qué NO ES el hash. Educación en la UI: "Este hash confirma que la evidencia no ha sido modificada. No reemplaza la validación de una autoridad." No usar lenguaje que sugiera validez legal automática. |
| **Dueño** | PM + Tech Lead |
| **Fecha de revisión** | 2026-11-15 |

### R-008: Correlación de hashes para identificar víctimas

| Campo | Valor |
|---|---|
| **Descripción** | Si un actor tiene acceso a múltiples hashes (por ejemplo, desde diferentes fuentes o por scraping del endpoint), podría intentar correlacionar hashes para inferir patrones: qué víctimas han sellado evidencia, en qué momentos, desde qué rangos de IP. |
| **Fase** | 2 (Integración Backend) |
| **Impacto** | **Medio** — revela metadatos sobre el uso del sistema pero no el contenido de la evidencia. Podría usarse para perfilamiento indirecto de víctimas. |
| **Probabilidad** | **Baja** — requiere scraping sostenido del endpoint y fuentes externas de hashes. El endpoint no retorna metadatos identificables por diseño. |
| **Mitigación** | No retornar `evidence_id` (UUID) en respuestas públicas. Solo retornar `short_hash` (12 chars). Rate limiting por IP. No registrar IP en `hash_verifications` para verificaciones anónimas. Auditoría de patrones de consulta para detectar scraping. Endpoint no requiere autenticación — no se puede asociar verificación a usuario. |
| **Dueño** | Backend Engineer |
| **Fecha de revisión** | 2026-11-15 |

### R-009: Auditoría de verificaciones expone información sensible

| Campo | Valor |
|---|---|
| **Descripción** | Cada verificación de hash escribe un registro en `machiyotl.hash_verifications`. Si los metadatos de auditoría (IP, user agent, timestamp) se almacenan sin sanitización, podrían revelar patrones de uso que identifiquen indirectamente a víctimas (ej. "la víctima verificó su evidencia desde IP X a las 3am"). |
| **Fase** | 2 (Integración Backend) |
| **Impacto** | **Medio** — exposición de metadatos de uso, no de contenido. Potencialmente identificable si se combina con otras fuentes. |
| **Probabilidad** | **Baja** — requiere acceso a la tabla de auditoría (no pública) y capacidad de correlacionar. |
| **Mitigación** | Sanitización de metadata según diseño de referencia del Audit Service: no almacenar IP ni user agent para verificaciones públicas. Solo almacenar `submitted_hash` (prefijo 12 chars), `result`, y `verified_at`. El `evidence_id` solo se asocia si la verificación es de un hash que existe. No registrar `actor_user_id` para verificaciones anónimas (el endpoint no requiere auth). |
| **Dueño** | Backend Engineer + Security Reviewer |
| **Fecha de revisión** | 2026-11-15 |

---

## Riesgos Transversales (Ambas Fases)

Riesgos que aplican independientemente de la fase del módulo.

### R-010: IA asistiva interpretada como decisoria por la usuaria

| Campo | Valor |
|---|---|
| **Descripción** | Aunque Machiyotl no clasifica contenido (eso es Chimalli), cualquier interacción con IA en el ecosistema Yaocihuatl (sugerencias, clasificaciones, orientación) podría ser interpretada por la usuaria como una decisión o validación automática. |
| **Fase** | Transversal |
| **Impacto** | **Alto** — la usuaria podría tomar decisiones basadas en sugerencias de IA creyendo que son determinaciones legales. |
| **Probabilidad** | **Media** — la familiaridad creciente con IA puede llevar a sobre-confiar en sistemas automatizados. |
| **Mitigación** | Labels obligatorios: "Sugerencia generada por IA", "Pendiente de revisión humana", "Requiere validación de autoridad", "No sustituye asesoría legal". Separación visual clara entre contenido generado por IA y contenido validado por humanos. Educación en onboarding. |
| **Dueño** | PM + Tech Lead |
| **Fecha de revisión** | 2026-08-15 |

### R-011: Evidencia demo confundida con evidencia real

| Campo | Valor |
|---|---|
| **Descripción** | El repositorio contiene seed data sintético (demo) que podría ser confundido con evidencia real por desarrolladores, testers o revisores. Esto viola la separación estricta entre datos demo y datos reales. |
| **Fase** | Transversal |
| **Impacto** | **Alto** — si datos demo se tratan como reales, se violan principios de privacidad. Si datos reales se mezclan con demo, se contamina el repositorio (prohibido por `SECURITY.md`). |
| **Probabilidad** | **Baja** — el seed data está explícitamente marcado como `synthetic_demo`, `is_demo=True`, y contiene placeholders obvios (`example.invalid`, `EVD-2026-DEMO-001`). |
| **Mitigación** | Separación estricta de datasets (demo, synthetic, anonymized, real). Marcado explícito en código y UI. Verificación de `APP_ENV` antes de cargar seed (no en producción). Tests separados para demo vs datos reales. `.env` con `SEED_DEMO_DATA=false` en producción. |
| **Dueño** | Tech Lead |
| **Fecha de revisión** | 2026-08-15 |

### R-012: Cambios en el marco legal que invalidan el enfoque técnico

| Campo | Valor |
|---|---|
| **Descripción** | Las leyes y protocolos que sustentan el diseño de Machiyotl (Ley Electoral BC, Ley de Acceso BC, LGAMVLV, Ley de Víctimas BC, Ley de Transparencia BC) pueden ser reformados. Un cambio podría: (a) exigir requisitos de cadena de custodia que el sistema no cumple, (b) prohibir el almacenamiento local de cierto tipo de evidencia, (c) requerir certificación formal del proceso de sellado. |
| **Fase** | Transversal |
| **Impacto** | **Medio** — podría requerir modificaciones significativas al diseño o incluso invalidar el enfoque Zero-Knowledge. |
| **Probabilidad** | **Baja** — las reformas legales son lentas y predecibles. La tendencia es hacia mayor protección digital, no menor. |
| **Mitigación** | Versionado del corpus legal de referencia en `legal-corpus/` con fechas de consulta. Revisión periódica (cada 3 meses) de cambios legislativos en BC y federales. Arquitectura modular que permite adaptar el flujo de sellado sin reescribir todo el módulo. Documentar explícitamente los artículos y fechas de las leyes en las que se basa el diseño. |
| **Dueño** | PM + Tech Lead |
| **Fecha de revisión** | 2026-08-15 |

### R-013: Violencia digital con componente de género no reconocida por el sistema

| Campo | Valor |
|---|---|
| **Descripción** | El marco legal de VPMRG está en evolución. La reforma de Marzo 2026 (Ley de Acceso BC Art. 6 VII Bis) agregó IA generativa como vector de violencia digital. Nuevos vectores pueden surgir (deepfakes mejorados, acoso coordinado en nuevas plataformas) que el sistema no contemple. Machiyotl captura evidencia digital pero no clasifica el tipo de violencia — ese es trabajo de Chimalli. El riesgo es que la evidencia capturada no sea reconocida como VPMRG por las autoridades. |
| **Fase** | Transversal |
| **Impacto** | **Medio** — la evidencia sellada sigue siendo válida técnicamente (hash), pero podría no ser aceptada en un procedimiento de VPMRG si la autoridad no reconoce el tipo de violencia. |
| **Probabilidad** | **Baja** — Machiyotl no clasifica; simplemente sella. La aceptación depende de la autoridad, no del sistema. |
| **Mitigación** | Mantener el corpus legal actualizado. Documentar la brecha legal identificada (no existe protocolo de cadena de custodia digital). Colaborar con IEEBC y UTCE para validación institucional del proceso de sellado. No afirmar que el sistema "detecta VPMRG" — solo que preserva evidencia digital. |
| **Dueño** | PM |
| **Fecha de revisión** | 2026-11-15 |

---

## Matriz de Riesgos — Resumen

| ID | Riesgo | Fase | Impacto | Probabilidad | Nivel | Dueño |
|---|---|---|---|---|---|---|
| R-001 | Fuga de privacidad por IndexedDB accesible | 1 | Alto | Media | **Crítico** | Frontend Engineer |
| R-002 | Pérdida de datos offline sin sincronización | 1 | Alto | Alta | **Crítico** | Frontend + UX |
| R-003 | Diferencias Web Crypto entre navegadores | 1 | Medio | Media | Alto | Frontend Engineer |
| R-004 | Botón de pánico > 100ms | 1 | Alto | Baja | Alto | Frontend Engineer |
| R-005 | Contenido sensible en caché del navegador | 1 | Medio | Media | Alto | Frontend Engineer |
| R-006 | Mal uso del endpoint para vigilancia | 2 | Alto | Baja | Alto | Backend Engineer |
| R-007 | Sobre-afirmación legal del hash | 2 | Alto | Alta | **Crítico** | PM + Tech Lead |
| R-008 | Correlación de hashes con víctimas | 2 | Medio | Baja | Medio | Backend Engineer |
| R-009 | Auditoría expone metadatos sensibles | 2 | Medio | Baja | Medio | Backend + Security |
| R-010 | IA interpretada como decisoria | Transversal | Alto | Media | **Crítico** | PM + Tech Lead |
| R-011 | Confusión datos demo vs reales | Transversal | Alto | Baja | Alto | Tech Lead |
| R-012 | Cambios legales invalidan enfoque | Transversal | Medio | Baja | Medio | PM + Tech Lead |
| R-013 | VPMRG no reconocida por autoridades | Transversal | Medio | Baja | Medio | PM |
| R-014 | Usuaria no puede interactuar con UI | 1 | Alto | Media | **Crítico** | Frontend + UX |

**Niveles de riesgo:**
- **Crítico** (Alto impacto + Alta/Media probabilidad): requiere mitigación antes del siguiente bloque del task board.
- **Alto** (Medio-Alto impacto + Baja/Media probabilidad): requiere plan de mitigación documentado.
- **Medio** (Medio impacto + Baja probabilidad): monitorear; mitigar en siguiente iteración.

---

## Próximas Revisiones

| Fecha programada | Tipo | Disparador |
|---|---|---|
| 2026-08-15 | Programada (3 meses) | Revisión de todos los riesgos Fase 1 y Transversales |
| 2026-11-15 | Programada (6 meses) | Revisión de riesgos Fase 2 antes de iniciar integración backend |
| Al iniciar MCH-100 (PWA) | Por evento | Revisión de riesgos Fase 1 antes de construir la PWA |
| Al iniciar MCH-200 (Web Crypto) | Por evento | Revisión de R-003 (compatibilidad navegadores) |
| Ante reforma legal en BC o federal | Por evento | Revisión de R-012 y R-013 |
| Ante incidente de seguridad | Por evento | Revisión inmediata + nuevo riesgo si aplica |

---

## Referencias

| Documento | Relación |
|---|---|
| `SECURITY.md` | Principios de seguridad y datos prohibidos |
| `docs/product/machiyotl-module-charter.md` | Alcance, hard constraints, límites de integración |
| `docs/technical/api-contracts.md#machiyotl-mvp` | Contrato del endpoint de verificación (R-006, R-008) |
| `backend/modules/machiyotl/README.md` | Task board y estado actual |
| `rag_documents/` | Marco legal de referencia para riesgos legales |
| `legal-corpus/` | Corpus versionado para R-012 |

---

**Versión:** 1.0  
**Fecha:** 2026-05-15  
**Autor:** PM + revisor de seguridad/privacidad  
**Próxima revisión:** 2026-08-15 (programada) o al iniciar MCH-100 (PWA)
