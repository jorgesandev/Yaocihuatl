# Módulos, Interacción de Interfaces y Flujo de Datos (Yaocíhuatl)

Este documento define la arquitectura de interacción, las fronteras de responsabilidad de software, el modelo de segregación de aplicaciones por rol y los flujos de datos síncronos/asíncronos del ecosistema Yaocíhuatl. Su objetivo es servir como la especificación técnica y de producto definitiva para el despliegue institucional.

---

## 1. Arquitectura de Despliegue y Segregación de Aplicaciones

Yaocíhuatl no opera como una aplicación monolítica ni como un servicio comercial de descarga abierta. Es una plataforma cívica institucional bajo un paradigma B2G (Business to Government), desplegada en la infraestructura privada u on-premise de un Organismo Público Local Electoral (OPLE).

El sistema utiliza un único backend centralizado (FastAPI + PostgreSQL + pgvector) que expone una API protegida bajo `/api/v1`. Sin embargo, la interacción se divide en **tres interfaces de usuario independientes** con flujos de autenticación y privilegios estrictamente segregados mediante Control de Acceso Basado en Roles (RBAC):

```text
                     +------------------------------+
                     |    Landing Page Principal    |
                     |       (yaocihuatl.com)       |
                     +--------------+---------------+
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
         v                          v                          v
+-----------------+       +-------------------+       +--------------------+
|  Dashboard UTCE │       │ PWA de la Víctima │       │   Portal Público   │
│    (Tlachia)    │       │(Machiyotl+Chimalli│       │   (Observatorio)   │
+-----------------+       +-------------------+       +--------------------+
   Autenticación:            Autenticación:              Acceso Abierto /
  OIDC Institucional         Padrón OPLE + JWT          Endpoint de Hashes
```

### A. Dashboard de Operación para OPLEs (Módulo Tlachia)

* **Naturaleza:** Aplicación Web de acceso restringido (Next.js).
* **Usuarios:** Analistas de la Unidad Técnica de lo Contencioso Electoral (UTCE).
* **Autenticación:** Base institucional mínima con roles reales y sesiones JWT. Soporte OIDC y Firma Electrónica Avanzada están en objetivo futuro (fase 2), no en el MVP.
* **Acceso a datos:** Lectura del flujo global de menciones ingeridas, escritura en la tabla de alertas centralizadas y gestión de bitácoras de auditoría.

### B. Aplicación para Mujeres Protegidas (Módulos Machiyotl + Cese Inmediato + Chimalli)

* **Naturaleza:** Aplicación Web Progresiva (PWA) única e integrada (Next.js + Workbox).
* **Usuarios:** Candidatas, funcionarias y mujeres políticas incorporadas formalmente al programa.
* **Autenticación:** Validación cruzada contra el padrón institucional del OPLE mediante tokens JWT de sesión corta.
* **Estrategia de Interfaz:** Aloja de forma secuencial el sellado de evidencia, la mitigación del daño y el asistente conversacional. **No se divide en múltiples aplicaciones** para evitar la fricción UX en momentos de crisis. Puede ejecutarse en cualquier navegador web moderno o instalarse en la pantalla de inicio del dispositivo móvil/escritorio para habilitar capacidades offline-first.

### C. Portal Público de Verificación y Observatorio

* **Naturaleza:** Sitio web estático de acceso libre con componentes interactivos.
* **Usuarios:** Sociedad civil, academia, prensa y la magistratura revisora.
* **Autenticación:** Ninguna (Público). Las métricas están anonimizadas mediante k-anonimato y supresión de identificadores. Aloja el endpoint criptográfico de verificación.

---

## 2. Alcance, Responsabilidades y Límites de los Módulos

### Tlachia (Motor de Monitoreo y Dashboard OPLE)

* **Lo que SÍ hace:**
  * En el MVP ingiere menciones sinteticas desde fixtures que emulan respuestas API de Facebook, Instagram, X, TikTok y Reddit. No usa API keys reales ni llamadas externas.
  * Mantiene una interfaz de adaptadores intercambiables para que, en una fase futura y con aprobacion institucional, puedan conectarse APIs reales sin reescribir el flujo de alertas.
  * Aplica un modelo NLP supervisado (BETO/DeepSeek) para clasificar texto bajo las 19 conductas del Art. 20 Ter de la LGAMVLV. **Objetivo futuro; el MVP usa reglas explicables iniciales sin clasificación legal definitiva.**
  * Ejecuta algoritmos de clustering temporal y semántico (DBSCAN + NetworkX) para detectar ráfagas de acoso o campañas coordinadas (*astroturfing*). **Objetivo futuro; fuera del MVP actual.**
  * Presenta un panel con semáforos de riesgo explicables para la analista humana.

* **Lo que NO hace:**
  * No confirma de manera autónoma si un caso constituye Violencia Política contra las Mujeres en Razón de Género (VPMRG); la tipificación final requiere obligatoriamente validación humana.
  * No realiza scraping invasivo sobre cuentas privadas ni accede a comunicaciones cifradas (WhatsApp/Telegram fuera de alcance por cifrado E2E).
  * No usa credenciales reales de plataformas en el MVP.

### Machiyotl (Kit de Certificación Forense en PWA)

* **Lo que SÍ hace:**
  * Permite la carga manual de capturas de pantalla, enlaces o archivos directamente desde el dispositivo de la víctima.
  * Genera de forma local e inmediata el hash SHA-256 del contenido multimedia mediante la Web Crypto API nativa del navegador antes de transmitir cualquier bit al servidor (*zero-knowledge*).
  * Almacena temporalmente la evidencia local en una base de datos IndexedDB cifrada con AES-GCM.
  * Genera un reporte forense en PDF con los hashes, metadatos de la captura (timestamp, URL) y un código QR de verificación externa.

* **Lo que NO hace:**
  * No analiza la veracidad del contenido ni detecta manipulaciones digitales (Photoshop/Deepfakes); su única función es certificar la inalterabilidad del archivo digital desde el segundo exacto de su captura para garantizar la cadena de custodia ante tribunales.

### Cese Inmediato en Plataforma (Módulo de Mitigación en PWA)

* **Lo que SÍ hace:**
  * Actúa como un flujo intermedio guiado dentro de la PWA.
  * Proporciona a la usuaria hipervínculos profundos (*deep links*) directos a los formularios de denuncia técnica de cada red social, copiando automáticamente al portapapeles el texto pre-llenado de la agresión y las URLs afectadas.

* **Lo que NO hace:**
  * No automatiza el desmontaje (*takedown*) de publicaciones ni interactúa programáticamente con los sistemas de moderación interna de Meta, X o Google; la acción final de remover el contenido recae estrictamente en la red social o en una orden cautelar posterior de la autoridad.

### Chimalli (Asistente de Canalización en PWA)

* **Lo que SÍ hace:**
  * Procesa la narrativa libre de la víctima (voz, texto o imágenes multimodales) mediante el LLM de pesos abiertos DeepSeek-V3.
  * Ejecuta una arquitectura RAG legal integrada sobre la base vectorial de pgvector que abarca el corpus normativo mexicano (LGAMVLV, LGIPE, LGSMIME, Ley Electoral de BC y criterios del TEPJF).
  * Aplica el test de VPMRG de tres elementos y cruza la matriz de competencia jurisdiccional según el cargo de la víctima y el ámbito territorial.
  * Construye un expediente estructurado pre-formateado en PDF bajo el esquema del Procedimiento Especial Sancionador (PES) y un JSON de interoperabilidad.

* **Lo que NO hace:**
  * No actúa como un asesor jurídico general para delitos del fuero común no vinculados a los derechos político-electorales.
  * No presenta la denuncia ante la Oficialía de Partes de forma autónoma; genera el kit listo para que la usuaria o su representante lo ratifiquen e ingresen con firma humana.

---

## 3. Mitigación de Casos Atípicos (Edge Cases)

| Módulo | Escenario Atípico (Edge Case) | Comportamiento del Sistema y Mitigación Técnica |
| --- | --- | --- |
| **Tlachia** | Falso positivo masivo por debate orgánico virulento en redes sociales (sin sesgo de género). | El pipeline levanta la alerta por anomalía de volumen. El dashboard presenta los indicadores de confianza del modelo BERT y las trazas explícitas. La analista UTCE presiona "Descartar", lo que evita notificar a la candidata y registra el evento en la bitácora para refinar los umbrales del clasificador. |
| **Machiyotl** | Pérdida total de conectividad a Internet (3G/4G/Wi-Fi) durante un evento político o mitin en campo. | El Service Worker de la PWA intercepta la falla de red. Machiyotl ejecuta localmente el hashing SHA-256 a través del navegador, cifra el archivo multimedia con AES-GCM y lo almacena en IndexedDB. Encola una tarea asíncrona de sincronización en segundo plano (*Background Sync API*) para transmitir los metadatos al volver a tener señal. |
| **Machiyotl** | Riesgo de confrontación física o supervisión coercitiva del agresor sobre el dispositivo de la víctima. | La usuaria presiona el "Botón de Pánico" situado de forma persistente en la interfaz. La PWA realiza inmediatamente una redirección dura (`window.location.replace`) hacia un motor de búsqueda genérico, destruye el estado de sesión en memoria (`SessionStorage.clear()`) y oculta el árbol de componentes del UI de captura sin alterar las evidencias ya hasheadas e indexadas localmente. |
| **Chimalli** | La usuaria ingresa una narrativa o evidencia completamente ajena a la materia electoral (Ej. Robo común o extorsión inmobiliaria). | El módulo de extracción estructurada del LLM evalúa la intención del prompt. Al fallar el Elemento 1 del Test (Vínculo político-electoral), el RAG bloquea la generación del expediente del PES. El chat activa un flujo de *fallback* explícito, entregando las direcciones de las fiscalías estatales del fuero común y teléfonos de emergencia, dejando constancia para evitar la revictimización. |
| **Chimalli** | La usuaria sube capturas de pantalla de ataques directamente en el chat conversacional sin proporcionar texto descriptivo. | Chimalli activa sus capacidades de visión multimodal sobre el archivo cargado. Extrae el texto de la imagen mediante el modelo, detecta los patrones de agresión o sesgos de género e inicia proactivamente el interrogatorio guiado: *"Detecto texto con posibles descalificaciones en la captura de pantalla que subiste. Para armar tu expediente, ¿podrías confirmarme si esta cuenta ha coordinado ataques previos?"*. |

---

## 4. Flujo Detallado de Interfaces y Pantallas (UI/UX)

La interacción dentro del ecosistema se divide cronológicamente de acuerdo a si el caso es originado de forma automatizada por el OPLE o de forma manual por la mujer protegida.

### A. Flujo de Alertas Automatizadas (Origen: Tlachia)

1. **Dashboard UTCE - Bandeja de Alertas:** La analista del OPLE visualiza una alerta en rojo procedente del worker asíncrono de Celery. Al hacer clic, inspecciona el grafo de coordinación de cuentas diseñado en D3.js y la justificación del NLP.
2. **Dashboard UTCE - Validación:** La analista confirma el cumplimiento preliminar del test, marca la alerta como válida y presiona "Notificar a la Candidata". El backend despacha un webhook y una notificación push cifrada al dispositivo de la víctima.

### B. Flujo Interno de la Víctima (PWA Integrada - Casos Automatizados o Manuales)

#### Pantalla 1: Login y Autenticación

* Interfaz de inicio limpia que solicita credenciales biométricas o llave web vinculada al padrón del instituto electoral. Al ingresar, se accede al panel central de control protegido por JWT.

#### Pantalla 2: Panel de Control (Home de la PWA)

* **Sección Superior:** Muestra el "Buzón de Notificaciones de Riesgo". Si Tlachia envió un aviso, aparece la tarjeta interactiva: *"La UTCE ha detectado un posible ataque coordinado hacia tu cuenta de X. Toca aquí para asegurar la evidencia"*.
* **Sección Central:** Botón de acción flotante (FAB) de alta visibilidad: `[+ Registrar Nueva Evidencia Manual]`. Este botón permite iniciar un caso desde cero si Tlachia no pudo rastrearlo (ej. Chats de mensajería cerrada).
* **Sección Persistente:** En el encabezado o barra de navegación inferior se sitúa de forma fija el **Botón de Pánico** con forma de icono neutral (Ej. Engranaje de configuración o menú de ayuda general).

```text
+----------------───────────────────────────────+
| [⚙️] Yaocíhuatl                              | <-- Botón de Pánico Oculto
+----------------───────────────────────────────+
| 👋 ¡Hola, Candidata!                           |
|                                               |
|  ⚠️ ALERTA DE LA UTCE DETECTADA                |
|  Posible ataque coordinado en tu post de X.   |
|  [ Asegurar esta Evidencia ahora ]            | <-- Origen Automatizado
|                                               |
| ───────────────────────────────────────────── │
|                                               |
|  ¿Sufriste otra agresión digital?             |
|  [ 📂 Cargar Evidencia Manualmente ]          | <-- Origen Manual
+----------------───────────────────────────────+
```

#### Pantalla 3: Módulo Machiyotl - Captura y Sello Criptográfico

* *Se activa inmediatamente al pulsar "Asegurar esta Evidencia" o "Cargar Evidencia Manualmente".*
* La interfaz solicita arrastrar archivos (imágenes, grabaciones de video, PDFs) o ingresar el enlace directo del ataque.
* Al subir el archivo, el UI bloquea momentáneamente la pantalla con un spinner estilizado y el mensaje: *"Generando sello digital de cadena de custodia local..."*. La Web Crypto API calcula el hash SHA-256 en background.
* La pantalla cambia a estado exitoso, mostrando el identificador hash completo (Ej. `SHA-256: 8f3c...9a2b`) y guardando los metadatos de forma cifrada en IndexedDB. Botón de confirmación: `[ Resguardar y Continuar ]`.

#### Pantalla 4: Módulo de Cese Inmediato - Mitigación Activa

* La pantalla adopta una estética informativa de asistencia rápida.
* Texto principal: "Tu evidencia ya está certificada criptográficamente y no podrá desaparecer. Antes de formular la queja legal, detengamos la propagación del daño.".
* Presenta una lista de tarjetas por plataforma de red social (Meta, X, TikTok, Instagram u otras rutas aplicables) con botones de redirección profunda (*deep links*). El sistema copia automáticamente al portapapeles de la usuaria el texto de denuncia estándar y los enlaces de los agresores metadateados en el paso previo.
* Botón inferior de salida: `[ Confirmar reportes y redactar expediente ]`.

#### Pantalla 5: Módulo Chimalli - Chat Conversacional de Inteligencia Artificial

* Se despliega una interfaz de chat fluido con streaming de tokens de baja latencia.
* **Mensaje Inicial Automatizado:**
  * *Si el caso vino de Tlachia:* "Hola. Veo que hemos sellado la evidencia criptográfica del ataque coordinado en X. Para fundamentar legalmente la queja ante el OPLE, por favor cuéntame en tus palabras: ¿este acoso ha afectado tu capacidad de realizar eventos públicos de campaña?".
  * *Si el caso es manual:* "Hola. He resguardado con éxito tu evidencia cargada de forma manual en Machiyotl. Cuéntame detalladamente qué sucedió, especificando si identificas a los autores o si consideras que usan tu información personal de forma indebida.".
* La usuaria chatea libremente por texto o dictado de voz. A medida que responde, el agente de Chimalli ejecuta de forma silenciosa llamadas al RAG legal. Si detecta que faltan variables obligatorias impuestas por la LGSMIME (como las fechas exactas o el cargo específico disputado), formula preguntas complementarias con lenguaje natural claro y accesible.

#### Pantalla 6: Revisión de Estructura Legal y Checkout

* Chimalli cierra la sesión de chat y transforma la conversación en un formulario estructurado de lectura limpia para validación de la usuaria.
* Muestra los campos extraídos automáticamente: Hechos relatados, Agresores identificados, Conductas identificadas del Catálogo del Art. 20 Ter y la Autoridad propuesta para recibir la denuncia (Ej. UTCE del Instituto Estatal Electoral de Baja California).
* Botón de ejecución final: `[ Generar y Firmar Expediente PES ]`.

#### Pantalla 7: Descarga y Cierre de Flujo

* La pantalla ofrece un visor integrado del documento final PDF formateado estrictamente bajo el estándar de la LGSMIME, incluyendo los anexos técnicos, hashes y códigos QR provistos por Machiyotl.
* Botón principal: `[ Enviar copia digital a Oficialía de Partes ]`. Al pulsarlo, el backend actualiza la base de datos `core.cases`, habilitando el acceso de sólo lectura para las magistraturas asignadas, completando el ciclo de atención institucional en minutos.

---

## 5. Contratos de Intercambio de Datos entre Módulos

Para mantener el desacoplamiento técnico absoluto mediante microservicios independientes, la comunicación entre las capas de software se rige por los siguientes esquemas JSON:

### A. Tlachia -> Core API (`POST /api/v1/core/alerts`)

Despachado de forma asíncrona por los workers de clasificación NLP tras la validación de la analista humana de la UTCE.

```json
{
  "alert_id": "7b2e91a0-4f81-4b11-bdc2-61a7b9264c11",
  "target_user_id": "usr_99210293",
  "assigned_ople_analyst": "analista_utce_04",
  "assistive_risk_level": "RED",
  "nlp_classification": {
    "primary_conduct_code": "FRACC_X",
    "description": "Calumnia y daño institucional a la imagen pública",
    "confidence_score": 0.942
  },
  "coordination_metrics": {
    "cluster_id": "clus_twitter_2026_991",
    "detected_accounts_count": 42,
    "burst_duration_seconds": 1800,
    "reused_templates_detected": true
  },
  "evidence_metadata_sanitized": [
    {
      "platform": "X",
      "source_url": "https://x.com/placeholder/status/123456",
      "post_timestamp": "2026-05-15T22:15:00Z"
    }
  ]
}
```

### B. Core API -> Machiyotl (`POST /api/v1/machiyotl/evidence/seal`)

Invocado internamente por el cliente PWA para registrar el hash generado localmente y formalizar la cadena de custodia probatoria en la base de datos central.

```json
{
  "case_id": "case_2026_0991_BC",
  "evidence_id": "ev_81729301",
  "sha256_hash": "4a8e3b2c1d9f8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a",
  "local_timestamp": "2026-05-15T22:18:12Z",
  "client_environment": {
    "browser": "Mozilla/5.0 (PWA; Android 14)",
    "crypto_provider": "WebCryptoAPI-SubtleCrypto"
  },
  "custody_events": [
    {
      "event_type": "LOCAL_HASH_GENERATED",
      "operator_role": "MUJER_PROTEGIDA",
      "status": "SUCCESS"
    }
  ]
}
```

### C. Machiyotl -> Chimalli (`Context Injection Payload`)

Payload cargado en el estado de Zustand dentro de la PWA de la víctima para que el asistente conversacional asocie los tokens legales a las pruebas técnicas selladas criptográficamente.

```json
{
  "associated_hashes": [
    "4a8e3b2c1d9f8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a"
  ],
  "declared_sources": {
    "platform": "TikTok",
    "evidence_type": "SCREENSHOT_AND_URL",
    "has_offline_records": false
  },
  "custody_status": "VERIFIED_ON_CLIENT"
}
```

### D. Chimalli -> Core API (`POST /api/v1/core/cases/draft-expedient`)

Payload final estructurado por el agente de DeepSeek-V3 tras completar la interacción conversacional de la víctima, usado para renderizar las plantillas de Jinja2 y WeasyPrint.

```json
{
  "session_id": "chm_session_9921",
  "extracted_entities": {
    "victim_full_name": "Jorge Alejandro Sandoval Romo",
    "political_position_aspirated": "Regiduría Municipal Mexicali",
    "electoral_stage": "CAMPAÑA",
    "identified_aggressor": "Anónimo / Red Coordinada Clus_991"
  },
  "test_vpmrg_reasoning": {
    "element_1_political_link": true,
    "element_2_gender_component": true,
    "element_3_rights_infringement": true,
    "final_verdict": "possible_vpmrg",
    "confidence_degree": "requires_human_review",
    "citation_precedents": [
      "Art. 20 Bis LGAMVLV",
      "Jurisprudencia TEPJF 21/2020-VPMRG"
    ]
  },
  "jurisdictional_routing": {
    "competent_authority": "Instituto Estatal Electoral de Baja California",
    "action_pathway": "PROCEDIMIENTO_ESPECIAL_SANCIONADOR",
    "delivery_address": "Av. Rómulo O'Farril #938, Mexicali, B.C."
  },
  "raw_structured_narrative": "El día 15 de mayo de 2026, se detectó una ráfaga automatizada de comentarios difamatorios basados en estereotipos de género que vulneran mi reputación pública e interfieren en la equidad de la contienda local."
}
```

---

## Conclusiones de Uso para el Repositorio

> **Nota sobre alcance MVP actual:** Los contratos JSON presentados en este documento representan la especificación objetivo a largo plazo del ecosistema. En el MVP actual se implementan solo las capacidades base: login institucional con roles reales, ingesta controlada desde fixtures sinteticos multiplataforma, alertas asistivas con reglas explicables (no clasificación legal definitiva), y revisión humana. No se usan API keys reales ni llamadas externas a plataformas. Capacidades señaladas como "objetivo futuro" (OIDC, Firma Electrónica, APIs reales de plataformas, BETO/DeepSeek clasificador definitivo, DBSCAN/NetworkX, envío a Oficialía de Partes) quedan fuera del MVP y deben documentarse como fase 2.
>
> **Vocabulario de riesgo:** El sistema usa exclusivamente `low`, `medium`, `high`, `unclassified` para niveles de riesgo asistivo. Nunca se emite `confirmed` como resultado de una regla o modelo automático.

Este archivo `module-interaction-flow.md` dota al proyecto de la rigurosidad corporativa y jurídica que se espera de una propuesta enfocada en la ciberdemocracia. Al leer este documento, los evaluadores técnicos y legales sabrán exactamente qué código está operando en el cliente de forma segura (*zero-knowledge*), qué lógica corre en la API distribuida y cómo se garantiza el principio crítico de *human-in-the-loop*.
