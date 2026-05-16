

**HACKATHÓN DE CIBERDEMOCRACIA 2026**

*Eje Temático 10 — Violencia política contra las mujeres en entornos digitales*

**YAOCÍHUATL**

*«Mujer guerrera» — Náhuatl*

Plataforma institucional de detección, certificación forense

y canalización ante violencia política digital de género

**Tlachia** observa  ·  **Machiyotl** sella  ·  **Chimalli** protege

**Equipo LexHackers**

Jorge Alejandro Sandoval Romo  ·  José Gilberto Tellez Montoya  ·  Rafael Ibarra Beltrán

*Mentor: Dr. Manuel Castañón Puga*

**Universidad Autónoma de Baja California**

Mayo de 2026  ·  Versión 3.0

# **Índice de contenidos**

# **1\. Resumen ejecutivo**

Yaocíhuatl —«mujer guerrera» en náhuatl— es una plataforma institucional diseñada para que las autoridades electorales mexicanas detecten, documenten y canalicen casos de violencia política contra las mujeres en razón de género (VPMRG) que ocurren en entornos digitales y mediáticos. Está concebida específicamente para ser desplegada, operada y gobernada por organismos públicos locales electorales (OPLE), bajo su infraestructura, su marco legal y su responsabilidad institucional, no como un servicio comercial dirigido al público general.

La propuesta surge ante un diagnóstico documentado por las propias autoridades electorales: en Baja California, la Unidad Técnica de lo Contencioso Electoral del IEEBC ha tramitado 84 denuncias por VPMRG desde 2019, asumiendo competencia en 52 y dictando 29 medidas cautelares procedentes. A nivel nacional, de las 484 sanciones inscritas en el Registro Nacional de Personas Sancionadas en Materia de VPMRG, 169 —el 35 por ciento— están vinculadas directamente al uso de medios digitales y redes sociales. El monitoreo institucional actual de estos casos se realiza, en gran medida, de forma manual, sobre catálogos limitados de medios tradicionales, sin herramientas de inteligencia artificial, sin integridad criptográfica de evidencia y sin orientación automatizada a la víctima.

Yaocíhuatl ataca este vacío con tres módulos integrados que cubren el ciclo completo de atención institucional, cada uno con un nombre en náhuatl que refleja su función:

| Tlachia — «observar, mirar» Motor institucional de monitoreo y detección. Analiza menciones públicas en plataformas con API oficial (Reddit y YouTube en operación real; X y Facebook mediante adaptadores institucionales en producción) y aplica modelos de procesamiento de lenguaje natural especializados para identificar patrones de acoso coordinado, lenguaje con sesgo de género y ataques sincronizados. Operado por la analista electoral mediante dashboard con explicabilidad completa. |
| :---- |

| Machiyotl — «sello, marca» Aplicación web progresiva (PWA) de certificación forense, instalable y con funcionamiento offline-first. Permite a la víctima capturar evidencia digital y generar un hash SHA-256 directamente en su dispositivo mediante Web Crypto API, sin que el contenido salga del navegador hasta que ella decida enviarlo. Convierte capturas de pantalla volátiles en pruebas técnicas con cadena de custodia verificable. |
| :---- |

| Chimalli — «escudo» Asistente conversacional con inteligencia artificial, soportado por un sistema de recuperación aumentada (RAG) sobre el corpus legal mexicano: LGAMVLV, LGIPE, LGSMIME, Ley Electoral de Baja California, protocolos del IEEBC y jurisprudencia del TEPJF. Aplica el test VPMRG de tres elementos, extrae entidades legales de la narrativa, identifica la autoridad competente según cargo y jurisdicción, y genera un expediente pre-formateado conforme a la LGSMIME. |
| :---- |

La plataforma incorpora una cuarta etapa entre la detección y la canalización: el cese inmediato en plataforma. Antes de armar el expediente legal, Yaocíhuatl guía a la víctima para reportar el contenido agresor en los formularios oficiales de cada red social, garantizando que la evidencia ya haya sido sellada criptográficamente antes de que la denuncia provoque su eliminación. Este orden —detectar, sellar, cesar, canalizar— es el resultado directo de la asesoría con la Consejera Electoral Vera Juárez Figueroa del IEEBC, quien señaló que en una campaña de noventa días una medida cautelar tardía no resuelve el daño político.

Yaocíhuatl está pensada para liberarse bajo licencia Apache 2.0 al cierre del Hackathón, con la Universidad Autónoma de Baja California como mantenedora académica. Este modelo permite que cualquier organismo electoral del país adopte la plataforma sin licitación intermedia, y que el equipo LexHackers ofrezca, mediante contratación institucional, servicios profesionales de implementación, capacitación y mantenimiento. La soberanía de datos queda garantizada al utilizar DeepSeek, modelo de pesos abiertos, susceptible de ser desplegado en la infraestructura propia del organismo contratante.

# **2\. Problema público**

La violencia política contra las mujeres en razón de género (VPMRG) que ocurre en entornos digitales es uno de los obstáculos más severos para la consolidación de la paridad democrática en México. La Ley General de Acceso de las Mujeres a una Vida Libre de Violencia (LGAMVLV) la tipifica en su artículo 20 Bis como toda acción u omisión basada en elementos de género que tenga por objeto o resultado limitar, anular o menoscabar el ejercicio efectivo de los derechos político-electorales de las mujeres. Su artículo 20 Ter enumera diecinueve conductas constitutivas, varias de las cuales se materializan hoy de forma masiva, anónima y coordinada en plataformas digitales.

Sin embargo, la velocidad, escala y opacidad de las plataformas superan la capacidad operativa de las autoridades electorales. El monitoreo institucional vigente se realiza de manera predominantemente manual, sobre catálogos limitados de medios tradicionales, con métodos diseñados para una era pre-digital. El resultado es que la mayor parte de la VPMRG digital queda invisible para las instituciones encargadas de prevenirla y sancionarla.

## **2.1. La magnitud del problema en cifras**

Los datos disponibles, proporcionados por el propio Instituto Estatal Electoral de Baja California, perfilan la dimensión del fenómeno en el plano local y nacional. Estas cifras no son estimaciones académicas: son registros oficiales de denuncias formalmente tramitadas. La cifra negra —casos que ocurren pero nunca llegan a denuncia— es, según ONU Mujeres y la OEA, varias veces superior.

| Indicador | Cifra | Fuente |
| ----- | :---: | ----- |
| Denuncias por VPMRG tramitadas en BC desde 2019 | **84** | UTCE-IEEBC, mayo 2026 |
| Casos en los que la UTCE asumió competencia | **52** | UTCE-IEEBC, mayo 2026 |
| Medidas cautelares procedentes en BC | **29** | UTCE-IEEBC, mayo 2026 |
| Sanciones inscritas en el Registro Nacional de VPMRG | **484** | INE — Voces Libres |
| **Sanciones vinculadas a medios digitales y redes sociales** | **169 (35%)** | INE — Voces Libres |

El dato más significativo es el del 35 por ciento. De cada tres sanciones por VPMRG dictadas en el país, una tiene su origen en el entorno digital. Sin embargo, ninguna de ellas se clasifica formalmente como «violencia digital» en el Registro Nacional, porque el legislador mexicano no ha tipificado esta modalidad con autonomía: las resoluciones existentes se catalogan como violencia simbólica, mediática o psicológica. Yaocíhuatl ayuda precisamente a visibilizar el componente digital específico que hoy queda subsumido en categorías generales, generando datos institucionales que pueden eventualmente sustentar una reforma legislativa.

## **2.2. Las tres fallas estructurales**

La revisión de los expedientes, la asesoría con la Consejera Vera Juárez Figueroa del IEEBC y los protocolos de la propia Unidad Técnica permiten identificar tres fallas estructurales que ninguna herramienta institucional resuelve hoy de forma integrada:

### **2.2.1. Detección tardía e inexistente**

Los ataques coordinados se disfrazan de opinión ciudadana orgánica. Decenas de cuentas recién creadas pueden atacar sincronizadamente a una candidata durante días sin que ella ni la autoridad electoral lo perciban hasta que el daño reputacional es irreversible. El monitoreo manual del IEEBC en el proceso electoral 23-24 cubrió un universo limitado de medios tradicionales y un esfuerzo humano de revisión sostenido, pero no detectó patrones de coordinación en redes sociales —que es donde más se concentra hoy la VPMRG. La asesoría con Vera Juárez fue explícita: «no teníamos una herramienta digital como la que ustedes están presentando, por lo tanto tuvimos que hacer un catálogo de medios… no podíamos abarcar el cien por ciento del universo».

### **2.2.2. Evidencia digital inadmisible**

Las capturas de pantalla simples carecen de integridad criptográfica y los tribunales electorales las consideran indicios leves. La evidencia digital es además profundamente volátil: tuits eliminados, cuentas suspendidas, publicaciones borradas por las propias plataformas tras el reporte de la víctima. Cuando la víctima intenta documentar, el contenido ya desapareció. El Tribunal Electoral del Poder Judicial de la Federación ha emitido criterios sobre admisibilidad de pruebas técnicas que exigen cadena de custodia verificable —exigencia que las capturas tradicionales no cumplen. El resultado práctico es que los procedimientos especiales sancionadores pueden caerse no por falta de violencia sino por insuficiencia probatoria.

### **2.2.3. Laberinto jurisdiccional**

Una funcionaria municipal, una candidata federal y una militante activa tienen rutas de denuncia distintas. Dependiendo del cargo, la etapa electoral y el tipo de conducta, la autoridad competente puede ser el OPLE local (mediante Procedimiento Especial Sancionador), el INE, el Tribunal de Justicia Electoral local, el TEPJF, la FEPADE o la fiscalía estatal. La confusión retrasa medidas cautelares, exige repetir testimonios ante diferentes ventanillas, revictimiza y conduce con frecuencia al abandono del procedimiento. La Consejera Vera lo sintetizó así: «las opciones que tienes son administrativa, electoral o penal; el chiste es que la víctima sepa qué le está pasando y a quién acudir antes de que el daño sea irreversible».

## **2.3. La brecha entre los tiempos del ataque y los tiempos de la justicia**

La asesoría con el IEEBC permitió identificar un cuarto problema, que es transversal a los tres anteriores y que constituye el argumento más sólido para una intervención tecnológica: la asimetría temporal entre el daño y la respuesta. Una campaña electoral dura entre noventa días (campaña) o aproximadamente treinta a sesenta días adicionales si se cuenta la precampaña. Una medida cautelar emitida por la autoridad electoral puede tardar entre semanas y meses, dependiendo de la carga de trabajo, la complejidad probatoria y los recursos. El resultado lógico es que, si la víctima se entera tarde del ataque, documenta mal la evidencia o se confunde de autoridad, la medida cautelar puede llegar después de la jornada electoral, cuando el daño político ya es irreversible.

| Argumento central Yaocíhuatl no sustituye a la autoridad electoral ni busca acelerar artificialmente sus procesos. Reduce el tiempo entre agresión, evidencia preservada y primera respuesta institucional. Ayuda a que la víctima entienda qué le está pasando, conserve pruebas útiles y conozca sus opciones legales antes de que el daño político sea irreversible. La decisión jurídica corresponde siempre a la persona analista y al órgano competente. |
| :---- |

# **3\. Universo protegido y delimitación jurídica**

Una de las observaciones más relevantes de la asesoría con la Consejera Vera Juárez Figueroa y la Lic. Melissa de la Unidad de Igualdad Sustantiva del IEEBC fue que la violencia política contra las mujeres en razón de género no es sinónimo de violencia digital general. Confundir ambas categorías es el error más frecuente entre soluciones tecnológicas bien intencionadas pero jurídicamente imprecisas. Yaocíhuatl está deliberadamente delimitada al ámbito político-electoral, y aplica un test riguroso para determinar si un caso de agresión digital reúne las condiciones para ser tratado como VPMRG.

## **3.1. El test VPMRG de tres elementos**

Para que una agresión digital sea constitutiva de VPMRG conforme al artículo 20 Bis de la LGAMVLV, debe cumplirse simultáneamente con tres condiciones. Yaocíhuatl integra este test como el corazón lógico de los módulos Tlachia (en la generación de alertas) y Chimalli (en la canalización legal):

| Elemento | Pregunta | Cómo lo evalúa Yaocíhuatl |
| :---: | ----- | ----- |
| **1Vínculo político-electoral** | ¿La víctima ejerce, aspira o ha ejercido un cargo público de elección popular o tiene atribución político-electoral? | Validación cruzada contra el padrón institucional del IEEBC: registro oficial de candidaturas, lista de funcionarias electas en cargo, consejeras electorales y magistradas en funciones, dirigencias partidistas activas. |
| **2Elemento de género** | ¿La agresión se basa en estereotipos de género, sexualiza, infantiliza, descalifica por la condición de mujer, o impondría una conducta diferenciada por género? | Clasificador NLP entrenado sobre corpus de sentencias TEPJF, glosario digital, casos UTCE BC. Mapea a una o más de las diecinueve conductas del Art. 20 Ter LGAMVLV. |
| **3Afectación a derechos político-electorales** | ¿La agresión tiene por objeto o resultado limitar, anular o menoscabar el ejercicio de los derechos político-electorales de la víctima? | Razonamiento estructurado con LLM sobre la narrativa del caso, recuperando jurisprudencia análoga mediante RAG legal. Genera justificación explicable. |

Cuando los tres elementos se confirman, Yaocíhuatl tipifica el caso como VPMRG y lo canaliza por la vía electoral. Cuando alguno falla, el sistema no descarta el caso: lo redirige hacia la vía correspondiente (Ley Olimpia para acoso digital general, código penal para amenazas, fiscalía estatal para delitos comunes), y deja constancia documental del análisis para evitar revictimización.

## **3.2. Sujetas protegidas**

El universo protegido se construye a partir del primer elemento del test. Yaocíhuatl monitorea, certifica evidencia y canaliza casos exclusivamente cuando la víctima pertenece a una de las siguientes categorías:

* **Candidatas y precandidatas** registradas ante el OPLE durante procesos electorales locales y federales, desde el registro oficial hasta el cierre de la jornada.

* **Mujeres electas** en el ejercicio de cargos de elección popular: diputadas, senadoras, regidoras, presidentas municipales, gobernadoras y, en su caso, juezas y magistradas electas mediante el reciente modelo de elección judicial.

* **Funcionarias públicas con atribuciones político-electorales:** consejeras electorales, magistradas, servidoras públicas en cargos de decisión institucional vinculados al proceso electoral.

* **Dirigencias partidistas activas** y militantes con incidencia documentada en procesos internos.

* **Periodistas y activistas** únicamente cuando su trabajo tenga incidencia político-electoral demostrable y la agresión cumpla los tres elementos del test.

## **3.3. Lo que Yaocíhuatl no es y no hace**

La delimitación negativa es tan importante como la afirmativa, especialmente ante el jurado institucional. Yaocíhuatl no aborda los siguientes escenarios, que pertenecen a otros marcos normativos y operativos:

* Acoso digital contra mujeres sin vínculo político-electoral (cubierto por la Ley Olimpia y los códigos penales locales).

* Delitos informáticos en general (hackeo, fraude electrónico, suplantación común, regulados por el Código Penal Federal y la legislación estatal).

* Moderación de contenido o eliminación directa de publicaciones (función exclusiva de las plataformas).

* Investigación penal (función exclusiva del Ministerio Público).

* Resolución jurisdiccional o emisión de sentencias (función exclusiva de los órganos jurisdiccionales).

* Monitoreo de violencia física, doméstica o no digital.

* Análisis de discurso político crítico que no cumpla los tres elementos del test VPMRG.

## **3.4. Modos de operación temporales**

Una segunda observación crítica de la asesoría con el IEEBC fue que la VPMRG opera bajo regímenes normativos y operativos distintos según la etapa electoral. Yaocíhuatl reconoce tres modos de operación, cada uno con su propia normativa aplicable, sujetos delimitados y métricas:

| Modo | Periodo | Universo | Estado en el MVP |
| :---: | ----- | ----- | :---: |
| **Precampaña** | Aprox. 30-60 días previos al registro de candidaturas | Precandidatas registradas ante los partidos políticos | **Incluido** |
| **Campaña** | Aprox. 90 días previos a la jornada electoral | Candidatas registradas ante el OPLE | **Incluido** |
| **Ejercicio del cargo** | Mientras dure el cargo (3-6 años según el puesto) | Mujeres electas, consejeras, magistradas, dirigencias | **Extensión fase 2** |

Para el alcance específico del Hackathón de Ciberdemocracia 2026 y del piloto institucional con el IEEBC, Yaocíhuatl se delimita al proceso electoral local de Baja California 2026-2027, cuyo arranque de precampañas está previsto para diciembre de 2026\. Esto permite que la primera prueba de campo de la plataforma cubra una elección concreta con normativa local conocida, universo cuantificable —aproximadamente quinientas candidaturas femeninas estimadas— y autoridades electorales identificadas. La extensión al modo de ejercicio del cargo y a otras entidades federativas se contempla como fase dos.

## **3.5. Plataformas monitoreadas y delimitación del universo digital**

La asesoría con el IEEBC fue enfática en un punto: ninguna plataforma puede prometer monitorear el cien por ciento del universo digital. Yaocíhuatl declara con transparencia cuál es su alcance técnico y cuáles son los límites operativos, con base en la disponibilidad de APIs oficiales, los contratos institucionales habituales del IEEBC y el modelo de adaptadores intercambiables que sustenta la arquitectura:

| Plataforma | Modo en el MVP del Hackathón | Modo en producción institucional |
| :---: | ----- | ----- |
| **Reddit** | API oficial real (PRAW), gratuita | API oficial con cuotas extendidas |
| **YouTube** | API oficial real (Data API v3), gratuita | API oficial con cuotas institucionales |
| **X (Twitter)** | Adaptador con dataset real anonimizado del IEEBC más menciones sintéticas | API X Enterprise mediante contrato institucional |
| **Facebook** | Adaptador con dataset real anonimizado del IEEBC más menciones sintéticas | Meta Graph API con verificación institucional |
| **Instagram / TikTok** | No incluido | Adaptadores fase 2 con API correspondiente |
| **WhatsApp / Telegram** | Fuera de alcance (cifrado E2E) | Fuera de alcance (cifrado E2E) |
| **Portales de noticias locales BC** | Búsqueda dirigida sobre catálogo curado | Búsqueda dirigida sobre catálogo curado del IEEBC |

El argumento institucional es claro: las APIs de X y de Meta requieren contratos institucionales que los OPLEs ya celebran de manera rutinaria —como lo hizo el propio IEEBC con prestadores de servicios de monitoreo de medios en el proceso 23-24, según relató la Consejera Vera. Yaocíhuatl no requiere que cada víctima individual pague licencias; la herramienta vive dentro del organismo electoral que ya gestiona contratos comparables. El modelo de adaptadores intercambiables garantiza que conectar X o Meta a Yaocíhuatl es una operación de configuración, no de reingeniería.

Para los casos que ocurran en plataformas fuera del alcance del monitoreo automatizado, Machiyotl ofrece a la víctima la posibilidad de cargar manualmente el contenido y obtener la misma certificación criptográfica. La cobertura nunca es absoluta, pero el catálogo de evidencia preservable sí lo es.

# **4\. Solución propuesta**

Yaocíhuatl es una plataforma institucional integrada por tres módulos especializados, un flujo de cuatro etapas y cuatro roles diferenciados con control de acceso basado en roles. La solución completa está pensada para vivir en la infraestructura del organismo electoral contratante, bajo su gobernanza, su marco legal y su personal operativo. Lo que sigue describe la arquitectura conceptual; el detalle técnico, los componentes específicos y el stack tecnológico se desarrollan en el capítulo cinco.

## **4.1. Paradigma institucional**

Una decisión de diseño fundamental, validada durante la asesoría con la Consejera Vera Juárez Figueroa, es que Yaocíhuatl no es una aplicación comercial dirigida al público general, sino una herramienta institucional operada por la autoridad electoral. Esta distinción no es de marketing: cambia por completo el modelo de autenticación, el flujo de consentimiento, la arquitectura de datos, el cumplimiento normativo y el régimen de responsabilidad.

En el modelo institucional, el IEEBC —o el OPLE u órgano contratante— responde por los datos personales conforme a la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO). Las víctimas no se inscriben mediante una aplicación pública con datos no verificados; se incorporan al programa mediante el padrón oficial de candidaturas, con identidad ya autenticada por el organismo. La herramienta tampoco depende de la voluntad individual de cada víctima para iniciar el monitoreo: el organismo, bajo su mandato legal, ofrece la protección a las sujetas inscritas con consentimiento expreso documentado. Esto resuelve simultáneamente los problemas de suplantación, validación de identidad, cobertura del universo y responsabilidad sobre los datos.

## **4.2. Los tres módulos**

### **Tlachia — Motor de observación**

Tlachia analiza menciones públicas dirigidas a las cuentas de las mujeres inscritas al programa, en las plataformas con cobertura técnica disponible. El procesamiento ocurre en tres capas:

* **Ingesta:** adaptadores intercambiables por plataforma (Reddit, YouTube, X, Facebook) que normalizan las menciones a un esquema común con autor, fecha, plataforma, antigüedad de la cuenta, número de seguidores y enlaces verificables.

* **Clasificación:** modelo de procesamiento de lenguaje natural especializado en español político mexicano, entrenado sobre el glosario digital del TEPJF, el catálogo de las diecinueve conductas del Art. 20 Ter LGAMVLV y el corpus de sentencias del propio Tribunal. Cada mención se etiqueta con tipo de conducta probable, severidad y nivel de confianza.

* **Detección de coordinación:** algoritmos de clustering temporal y semántico que identifican grupos de cuentas atacando sincronizadamente, cuentas recién creadas con poca actividad orgánica, ráfagas anómalas y reutilización de plantillas de mensaje. La salida es un semáforo de riesgo —verde, amarillo, naranja, rojo— con explicabilidad completa sobre los criterios que activaron cada alerta.

El dashboard de Tlachia es operado por la analista de la Unidad Técnica de lo Contencioso Electoral. Muestra alertas en tiempo real, permite revisar las menciones que componen cada alerta, valida los criterios del test VPMRG y deja constancia auditable de cada decisión.

### **Machiyotl — Kit de certificación forense**

Machiyotl resuelve el problema de la inadmisibilidad probatoria mediante un kit de captura y sellado criptográfico ejecutado íntegramente en el dispositivo de la víctima. Está implementado como una aplicación web progresiva (PWA) instalable en cualquier navegador moderno, con funcionamiento offline-first:

* **Captura:** la víctima captura el contenido agresor (captura de pantalla, archivo, enlace) desde su celular o computadora. La aplicación está diseñada para que el flujo completo se realice en menos de un minuto.

* **Sellado criptográfico:** mediante la Web Crypto API nativa del navegador, Machiyotl genera el hash SHA-256 del contenido directamente en el dispositivo. El servidor no ve el contenido hasta que la víctima decide enviarlo. Esto es zero-knowledge en el sentido estricto: el sello existe antes que la transmisión.

* **Almacenamiento local cifrado:** el contenido y los metadatos se guardan en IndexedDB cifrado con AES-GCM. La víctima puede acumular evidencia durante horas o días sin internet; cuando lo decida, sincroniza con el servidor institucional.

* **Generación de reporte forense:** PDF con la evidencia, los hashes verificables, código QR para verificación externa, metadatos técnicos (URL, fecha de captura, plataforma, datos de la cuenta) y constancia del flujo seguido. Este PDF es el insumo que ingresa al expediente legal generado por Chimalli.

* **Botón de pánico:** redirige la pestaña a una página neutral y limpia el caché si la víctima está siendo observada físicamente. Diseño con perspectiva de género que reconoce que la violencia política digital muchas veces convive con violencia física en el entorno cercano.

### **Chimalli — Asistente de canalización**

Chimalli traduce la narrativa de la víctima en un expediente legal pre-formateado, identificando la autoridad competente y sugiriendo las medidas cautelares aplicables. Funciona como un asistente conversacional con tres componentes de fondo:

* **Modelo de lenguaje:** DeepSeek-V3, modelo de pesos abiertos con desempeño comparable a GPT-4 en tareas de razonamiento jurídico estructurado en español. El uso de un modelo abierto permite que, en producción institucional, el organismo electoral despliegue el modelo en su propia infraestructura sin enviar datos personales a proveedores extranjeros.

* **Sistema de recuperación aumentada (RAG):** base vectorial con el corpus legal completo del dominio: LGAMVLV, LGIPE, LGSMIME, Ley Electoral de Baja California, Ley de Acceso de las Mujeres a una Vida Libre de Violencia de BC, protocolos del IEEBC, reglamento de quejas y denuncias, jurisprudencia del TEPJF, libro digital del Tribunal sobre Violencia Digital en Razón de Género, Convención de Belém do Pará, CEDAW, recomendaciones de ONU Mujeres y OEA. Cada respuesta del asistente cita los artículos y precedentes aplicables al caso concreto.

* **Extracción estructurada de entidades:** el asistente identifica en la narrativa libre los elementos relevantes —víctima, cargo, plataforma, agresores conocidos o anónimos, fechas, tipo de conducta— y los normaliza para incluirlos en el expediente. La víctima no necesita conocer terminología jurídica; el asistente la traduce.

La salida de Chimalli es un kit de evidencia compuesto por un PDF con el expediente conforme a la LGSMIME, un JSON estructurado para interoperabilidad con los sistemas internos del IEEBC, los anexos forenses generados por Machiyotl y la identificación clara de la autoridad competente con su domicilio y vía de presentación. El asistente también ofrece el plan de seguridad personal previsto en el Protocolo de Primer Contacto, sugiere las medidas cautelares solicitables y explica las opciones de presentación administrativa, electoral y penal de manera no excluyente.

## **4.3. El flujo de cuatro etapas**

Una contribución directa de la asesoría con el IEEBC al diseño de Yaocíhuatl fue identificar que el flujo correcto no es de tres etapas —detectar, sellar, canalizar— sino de cuatro, con una etapa intermedia crítica: el cese inmediato en plataforma. El orden es deliberado: el sello forense debe ocurrir antes del reporte a la plataforma, porque reportar puede provocar la eliminación del contenido, y se necesita preservar la prueba antes de que desaparezca.

| Etapa | Acción | Operador | Resultado |
| :---: | ----- | :---: | ----- |
| **1Detección** | Tlachia identifica patrón anómalo y emite alerta | Analista UTCE(humano valida) | Alerta con semáforo de riesgo, explicabilidad y notificación a la víctima |
| **2Sello forense** | Machiyotl sella criptográficamente el contenido público observable | Automatizado(orquestado por la analista) | Evidencia con hash SHA-256 antes de que pueda desaparecer |
| **3Cese inmediato** | Guía de reporte en plataforma con URLs y texto pre-llenado | Víctima(asistida por la analista) | Detención del daño activo antes de la respuesta jurisdiccional |
| **4Canalización** | Chimalli arma expediente y lo dirige a la autoridad competente | Víctima(asistida por IA) | Procedimiento Especial Sancionador iniciado con expediente sólido |

Las cuatro etapas se ejecutan secuencialmente para un caso individual, pero pueden ocurrir simultáneamente para diferentes casos dentro del organismo. El flujo está diseñado para que el tiempo total entre detección y expediente listo para presentación sea de minutos a horas, no de semanas. Esto es decisivo cuando se considera que una campaña electoral dura noventa días.

## **4.4. Los cuatro roles de usuario**

Yaocíhuatl implementa control de acceso basado en roles (RBAC) con cuatro perfiles diferenciados, cada uno con interfaz, permisos y datos visibles distintos:

### **Rol 1: Mujer protegida**

* Se incorpora al programa a través del padrón institucional del IEEBC al registrar candidatura, o por invitación directa del organismo si ya ejerce cargo. Identidad verificada por la propia autoridad electoral.

* Firma consentimiento expreso documentado, con texto aprobado por la Unidad de Igualdad Sustantiva, especificando qué cuentas se monitorean, qué datos se recolectan, quién accede, cuánto se conservan y cómo solicitar baja.

* Recibe notificaciones push y por correo institucional cuando Tlachia detecta actividad anómala contra sus cuentas registradas.

* Usa Machiyotl como PWA en su celular o computadora para capturar evidencia. La aplicación funciona offline; la evidencia se queda en su dispositivo hasta que decide enviarla.

* Conversa con Chimalli para narrar lo sucedido y obtener el kit de evidencia listo para presentar ante la autoridad competente.

* Tiene acceso al botón de pánico en todo momento.

### **Rol 2: Autoridad electoral**

* Analista de la Unidad Técnica de lo Contencioso Electoral del IEEBC o del organismo contratante. Se autentica con credenciales institucionales y, en producción, con firma electrónica avanzada SAT.

* Administra el dashboard Tlachia. Visualiza alertas, revisa menciones individuales, valida el test VPMRG y decide si confirma, descarta o escala cada caso.

* Recibe expedientes pre-formateados generados por Chimalli con la evidencia certificada por Machiyotl. Evalúa si procede dictar medidas cautelares conforme al reglamento interno y al protocolo de primer contacto.

* Todas sus acciones quedan registradas en bitácora auditable.

### **Rol 3: Persona juzgadora**

* Magistrada o magistrado del Tribunal de Justicia Electoral de Baja California, del TEPJF o de la sala correspondiente. Acceso de sólo lectura a los expedientes que le sean asignados.

* Puede verificar la integridad de cada evidencia comparando hashes; el sistema ofrece un endpoint público de verificación.

* Visualiza la cronología completa del caso, los criterios que activaron las alertas, los pasos seguidos por la víctima y la justificación jurídica generada por Chimalli con citación a precedentes.

### **Rol 4: Observación ciudadana**

* Tableros públicos con datos agregados y anonimizados mediante k-anonimato y supresión de identificadores. Permite a la sociedad civil, la academia y los medios de comunicación analizar tendencias.

* Sin acceso a nombres de víctimas, cuentas específicas, contenido de denuncias ni identificadores de agresores.

* Métricas disponibles: número de cuentas monitoreadas, alertas generadas, casos canalizados, distribución por tipo de conducta, plataformas con mayor incidencia, tiempos promedio de detección a canalización, distribución geográfica por municipio.

# **5\. Arquitectura técnica y stack tecnológico**

La arquitectura de Yaocíhuatl se construye sobre tres principios rectores: separación estricta de responsabilidades entre módulos para permitir despliegue y mantenimiento independientes; intercambiabilidad de componentes externos (plataformas de redes sociales, modelos de lenguaje, proveedores de nube) mediante adaptadores con contratos definidos; y portabilidad institucional, de modo que el organismo electoral pueda desplegar la plataforma en infraestructura propia (on-premise) o en nube privada según su política de soberanía de datos.

## **5.1. Visión general de la arquitectura**

Yaocíhuatl está organizada en cinco capas: presentación, aplicación, dominio, datos e integraciones externas. Cada módulo (Tlachia, Machiyotl, Chimalli) cuenta con sus componentes propios en las capas superiores, pero comparte el modelo de datos, los servicios transversales y la infraestructura.

| Capa | Componentes |
| :---: | ----- |
| **Presentación** | Dashboard Tlachia (Next.js en Vercel) · PWA Machiyotl (Next.js \+ Workbox) · Interfaz conversacional Chimalli (Vercel AI SDK) · Tableros públicos del observatorio |
| **Aplicación** | API REST unificada (FastAPI en Railway) · Servidor de notificaciones WebSocket · Pipeline de ingesta y clasificación (workers Celery \+ Redis) · Orquestador de RAG legal (LangChain) |
| **Dominio** | Motor de clustering temporal-semántico · Clasificador NLP especializado · Test VPMRG de tres elementos · Motor de reglas de competencia jurisdiccional · Generador de expedientes LGSMIME |
| **Datos** | PostgreSQL 16 con extensión pgvector (datos estructurados \+ embeddings) · Almacenamiento de evidencias en volúmenes cifrados de Railway · IndexedDB cifrado en cliente (Machiyotl) |
| **Integraciones** | Adaptadores intercambiables por plataforma (Reddit, YouTube, X, Facebook) · LLM DeepSeek-V3 vía OpenRouter con Claude Sonnet como fallback · Endpoint público de verificación de hashes |

## **5.2. Stack tecnológico unificado**

El stack se selecciona con criterios estrictos: tecnologías de código abierto siempre que sea posible, comunidades activas con documentación robusta, compatibilidad con despliegue institucional on-premise y curva de aprendizaje compatible con el plazo de 48 horas del Hackathón. Las versiones indicadas son las usadas en el MVP del Hackathón y representan el estado del arte estable a mayo de 2026\.

| Capa | Tecnología | Justificación |
| ----- | ----- | ----- |
| **Frontend** | Next.js 14 (App Router) \+ React 18 \+ TypeScript | Estándar de industria, server components reducen latencia, ecosistema maduro |
| **Estilos y UI** | Tailwind CSS 3.4 \+ shadcn/ui \+ Radix Primitives | Componentes accesibles WCAG AA, sin lock-in de design system propietario |
| **Visualización** | Recharts \+ D3.js \+ Lucide Icons | Recharts para gráficas estándar; D3 para visualización de grafos de coordinación |
| **PWA** | next-pwa \+ Workbox 7 \+ Web Crypto API \+ Dexie.js (IndexedDB) | PWA instalable, service worker robusto, criptografía nativa del navegador |
| **Backend** | Python 3.12 \+ FastAPI 0.111 \+ Pydantic v2 | Asíncrono nativo, OpenAPI automático, validación estricta, performance comparable a Node |
| **Base de datos** | PostgreSQL 16 \+ pgvector \+ SQLAlchemy 2.0 \+ Alembic | Datos estructurados y embeddings vectoriales en un solo motor; migraciones versionadas |
| **Colas y caché** | Celery 5 \+ Redis 7 | Workers asíncronos para ingesta NLP, notificaciones WebSocket, programación periódica |
| **NLP y ML** | Transformers (HuggingFace) \+ sentence-transformers \+ spaCy \+ scikit-learn \+ NetworkX | Clasificación, embeddings multilingües, NER, clustering DBSCAN, análisis de grafos |
| **LLM** | DeepSeek-V3 vía OpenRouter (demo) · Claude Sonnet 4 fallback · DeepSeek on-premise (producción) | Pesos abiertos, soberanía de datos institucional, latencia controlada |
| **Orquestación LLM** | LangChain \+ LangGraph | Cadena de razonamiento estructurada, RAG, herramientas, manejo de fallback |
| **Autenticación** | NextAuth.js \+ JWT \+ OAuth 2.0 \+ soporte OIDC institucional | Integrable con directorio institucional, sesiones cortas, tokens revocables |
| **PDF** | WeasyPrint (servidor) \+ jsPDF (cliente) \+ Jinja2 templates | PDFs con tipografía profesional, QR codes embebidos, conformidad LGSMIME |
| **Contenerización** | Docker \+ Docker Compose | Despliegue idéntico en dev, demo y producción institucional |
| **Hosting** | Vercel (frontend) \+ Railway (backend, BD, Redis) — HackathónOn-premise institucional — Producción | Despliegue rápido para demo; portable a infraestructura del IEEBC |
| **Observabilidad** | Sentry \+ structlog \+ OpenTelemetry | Trazas distribuidas, errores con contexto, logs estructurados |
| **CI/CD** | GitHub Actions \+ pruebas con pytest y Vitest | Despliegue continuo con validación automática antes de cada release |

## **5.3. Stack específico por módulo**

### **5.3.1. Tlachia (Jorge Sandoval)**

Tlachia procesa volúmenes potencialmente altos de menciones públicas y debe ofrecer resultados con latencia baja para el dashboard de la analista. Su pipeline interno funciona en cuatro etapas:

* **Ingesta:** PRAW (Python Reddit API Wrapper) para Reddit; google-api-python-client para YouTube Data API v3; adaptadores mock para X y Facebook que reproducen estructuralmente las APIs oficiales. Cada adaptador implementa la interfaz PlatformAdapter con el método fetch\_mentions(target, since), garantizando que sustituir un adaptador mock por uno real es una operación de configuración.

* **Preprocesamiento:** spaCy con modelo es\_core\_news\_lg para tokenización, lematización y reconocimiento de entidades nombradas. Limpieza de hashtags, menciones, URLs, normalización Unicode.

* **Clasificación:** modelo BETO (dccuchile/bert-base-spanish-wwm-cased) afinado sobre dataset construido a partir del glosario digital del TEPJF, las diecinueve conductas del Art. 20 Ter LGAMVLV, sentencias del propio Tribunal y los casos reales anonimizados proporcionados por la UTCE del IEEBC. Como respaldo y para el MVP del Hackathón, se utiliza un esquema de clasificación zero-shot con DeepSeek mediante prompt estructurado, lo que permite operar antes de tener el dataset completo de fine-tuning.

* **Detección de coordinación:** sentence-transformers (modelo multilingual-e5-large) para embeddings semánticos; scikit-learn DBSCAN para clustering temporal-semántico; NetworkX para análisis de grafos de coordinación (cuentas que se interactúan entre sí). Heurísticas adicionales detectan cuentas creadas recientemente, ráfagas anómalas y reutilización de plantillas.

El dashboard de Tlachia se construye con React, Tailwind y shadcn/ui. Las visualizaciones combinan Recharts para gráficas temporales y semáforos de riesgo, y D3.js para el grafo de coordinación entre cuentas atacantes. La explicabilidad de cada alerta se presenta como una ficha con criterios numéricos, ejemplos textuales de menciones clasificadas y el listado de cuentas en el cluster.

### **5.3.2. Machiyotl (José Gilberto Tellez)**

Machiyotl es la pieza más sensible en términos de garantías criptográficas, porque la confianza de la víctima depende de que el contenido nunca abandone su dispositivo sin su autorización expresa. Está implementada como PWA offline-first con los siguientes componentes:

* **Service Worker:** Workbox 7 sobre Next.js mediante next-pwa. La aplicación se instala en el dispositivo, opera sin conexión y mantiene una cola de sincronización para los envíos diferidos al servidor.

* **Captura:** HTML5 File API para uploads (imágenes, PDFs, archivos arbitrarios); URL Preview API o scraping ligero del lado cliente para metadatos de enlaces; integración con la API navigator.share del navegador para recibir contenido desde otras aplicaciones del celular.

* **Criptografía:** Web Crypto API (SubtleCrypto.digest con algoritmo SHA-256) para hashing en cliente. Cifrado simétrico AES-GCM para el contenido almacenado localmente, con clave derivada por PBKDF2 a partir de una contraseña o token. La clave nunca se transmite al servidor.

* **Almacenamiento local:** Dexie.js como wrapper de IndexedDB. Cada evidencia se guarda como registro con hash, metadatos, contenido cifrado, timestamp local y estado (capturada, sellada, sincronizada).

* **Generación de PDF forense:** jsPDF con jspdf-autotable para layout; qrcode-generator para el código QR de verificación; pdfkit en servidor para casos que requieran firmas avanzadas. El PDF incluye los hashes, los metadatos técnicos de cada evidencia, una declaración de cadena de custodia y el QR que apunta al endpoint público de verificación.

* **Verificación externa:** endpoint público /verify/:hash que devuelve el estado de cada evidencia (existente, fecha de sellado, expediente al que pertenece) sin revelar el contenido. Cualquier persona —incluida la magistratura— puede comprobar la integridad de una evidencia escaneando el QR del PDF.

* **Botón de pánico:** oculta inmediatamente la interfaz redirigiendo a una página de aspecto neutral (búsqueda web genérica) y limpia los caches de la pestaña actual. La PWA permanece instalada pero no muestra evidencia de su uso.

### **5.3.3. Chimalli (Rafael Ibarra)**

Chimalli combina inteligencia artificial generativa con recuperación legal precisa para producir expedientes admisibles. La arquitectura interna sigue el patrón de agente con herramientas y RAG:

* **Interfaz conversacional:** Vercel AI SDK con streaming de tokens, componentes shadcn/ui para el chat, gestión de estado con Zustand. Permite voz, texto e imagen como entradas, esta última útil para que la víctima suba directamente capturas que Chimalli interpreta multimodalmente.

* **Modelo de lenguaje:** DeepSeek-V3 (versión liberada en pesos abiertos por DeepSeek AI). Acceso vía OpenRouter durante el demo para garantizar latencia baja; despliegue on-premise en producción institucional mediante vLLM o Text Generation Inference. Como respaldo se configura Claude Sonnet 4 a través de Anthropic API, activable por variable de entorno sin tocar el código.

* **RAG legal:** LangChain como framework, pgvector como almacén vectorial, modelo de embeddings multilingual-e5-large. El corpus incluye Constitución Política de los Estados Unidos Mexicanos, LGAMVLV (especialmente Arts. 20 Bis y 20 Ter), LGIPE, LGSMIME, LGPDPPSO, Ley Electoral de Baja California, Ley de Acceso de las Mujeres a una Vida Libre de Violencia de BC, Reglamento de Quejas y Denuncias del IEEBC, Lineamientos Procesales y Catálogo de Infracciones, Protocolo de Atención de Primer Contacto, Guía VPRG24, glosario electoral digital del TEPJF, sentencias relevantes del propio Tribunal, libro digital sobre Violencia Digital en Razón de Género, Convención de Belém do Pará, CEDAW y recomendaciones de organismos internacionales.

* **Extracción estructurada:** prompts versionados que aplican un esquema de salida JSON estricto. Se extraen: identidad de la víctima, cargo o aspiración política, etapa electoral, plataforma de la agresión, agresores identificados, fechas, narrativa, evidencia disponible, tipo probable de conducta según Art. 20 Ter, daño percibido.

* **Test VPMRG:** cadena de razonamiento explícita en tres pasos que evalúa los tres elementos del test sobre la información extraída, recupera precedentes análogos del corpus mediante RAG y emite un veredicto de tipificación con grado de confianza y justificación citable.

* **Matriz jurisdiccional:** motor de reglas que combina cargo, etapa electoral, ámbito (federal/local) y tipo de conducta para identificar la autoridad competente, con datos de contacto, dirección de presentación y plazos aplicables.

* **Generación de expediente:** plantillas Jinja2 con el formato del Procedimiento Especial Sancionador conforme a la LGSMIME. WeasyPrint genera el PDF final, que incluye los anexos forenses de Machiyotl, las citas exactas a artículos y sentencias, el plan de seguridad personal y un JSON estructurado paralelo para interoperabilidad.

# **6\. Metodología de inteligencia artificial**

La inteligencia artificial es el componente que permite que Yaocíhuatl escale más allá de las capacidades del monitoreo manual, pero también es el componente que más cuidado exige desde la perspectiva ética, jurídica y democrática. Una IA mal calibrada puede confundir crítica política legítima con VPMRG, generar falsos positivos que silencien debate público, o falsos negativos que dejen pasar agresiones reales. La metodología que sigue está diseñada para que el sistema asista —y nunca sustituya— el juicio jurídico de la persona analista.

## **6.1. Tres capas de IA con responsabilidades separadas**

Yaocíhuatl no descansa en un único modelo monolítico. Las decisiones de IA se reparten en tres capas, cada una con una técnica y un propósito distintos, lo que permite calibrar, auditar y reemplazar cada una de manera independiente:

### **Capa 1: Clasificador especializado supervisado**

Para la clasificación inicial de cada mención individual, Yaocíhuatl emplea un modelo BETO (BERT en español) afinado mediante aprendizaje supervisado sobre un dataset construido específicamente para el dominio. El dataset combina tres fuentes:

* Sentencias del TEPJF sobre VPMRG digital, etiquetadas por tipo de conducta del Art. 20 Ter LGAMVLV.

* Casos reales anonimizados proporcionados por la UTCE del IEEBC del proceso electoral 23-24, con etiquetas validadas por personal jurídico.

* Ejemplos sintéticos generados con DeepSeek y validados por revisión humana, para cubrir las conductas con baja frecuencia en los datasets reales.

El clasificador devuelve, para cada mención, una distribución de probabilidad sobre las diecinueve conductas del Art. 20 Ter más una clase «no constitutiva». Permite operar con umbrales calibrables: la analista decide en qué nivel de confianza desea ver alertas. La salida del clasificador nunca es la decisión final; es un insumo para la capa 3\.

### **Capa 2: Recuperación aumentada (RAG) para razonamiento legal**

Para que las respuestas y los expedientes generados por Chimalli sean jurídicamente sólidos, Yaocíhuatl implementa un sistema RAG sobre el corpus legal completo del dominio. El proceso es:

* Embeddings con sentence-transformers multilingual-e5-large; chunking semántico que respeta los párrafos y artículos de la fuente.

* Almacenamiento en pgvector con metadata enriquecida (norma, artículo, jerarquía, fecha, ámbito territorial).

* Recuperación híbrida: similitud vectorial más filtros estructurales (por ejemplo, recuperar sólo sentencias TEPJF cuando se está armando un expediente para apelación).

* Re-ranking con cross-encoder para precisión en los top-k resultados.

El corpus se actualiza periódicamente: las nuevas sentencias del TEPJF, los criterios jurisdiccionales recientes y las reformas legales se ingieren mediante un pipeline programado. En producción institucional, la actualización del corpus es responsabilidad del organismo electoral con apoyo del equipo de soporte de LexHackers.

### **Capa 3: Razonamiento estructurado con LLM y human-in-the-loop**

La aplicación del test VPMRG, la generación del expediente y la identificación de la autoridad competente se realizan mediante un agente que combina DeepSeek-V3, el RAG legal de la capa 2 y un conjunto de herramientas. El agente sigue una cadena de razonamiento explícita:

1. Extracción estructurada de entidades de la narrativa libre de la víctima.

2. Verificación del elemento 1 del test (vínculo político-electoral) consultando el padrón institucional.

3. Verificación del elemento 2 (elemento de género) usando el clasificador de la capa 1 sobre el contenido de la agresión.

4. Verificación del elemento 3 (afectación a derechos político-electorales) mediante razonamiento sobre la narrativa y RAG sobre precedentes análogos.

5. Emisión de veredicto con grado de confianza y justificación citable.

6. Identificación de autoridad competente mediante motor de reglas.

7. Generación del expediente con citas a artículos y sentencias.

En cada paso, el sistema emite trazas visibles para la analista y para la auditoría. El expediente final siempre es revisado por la persona analista antes de ser entregado a la víctima o ingresado al sistema institucional. La IA nunca decide sola; siempre propone, la persona valida.

## **6.2. Mapeo del glosario digital al artículo 20 Ter LGAMVLV**

Una contribución metodológica clave de Yaocíhuatl es la construcción de una tabla de mapeo entre la terminología internacional contemporánea de violencia digital —contenida en el glosario electoral digital del TEPJF y en literatura especializada— y las diecinueve conductas tipificadas en el Art. 20 Ter de la LGAMVLV. Este mapeo es el puente entre lo que ocurre en redes y lo que la ley reconoce, y permite que el clasificador NLP entregue resultados directamente accionables jurídicamente.

| Conducta digital contemporánea | Mapeo al Art. 20 Ter LGAMVLV | Categoría jurídica aplicable |
| ----- | ----- | ----- |
| **Astroturfing electoral** | Fracc. II, III, X (calumnia, desprestigio) | Violencia simbólica / mediática |
| **Body shaming / fat shaming** | Fracc. II, IX (desprestigio, estereotipos) | Violencia psicológica / mediática |
| **Deepfake (audio/video manipulado)** | Fracc. III, X (difamación, daño a la imagen) | Violencia mediática / digital |
| **Doxxing (revelación de datos personales)** | Fracc. V, XI (amenaza, hostigamiento) | Violencia psicológica / posible delito penal |
| **Gaslighting digital** | Fracc. II, IX (desprestigio sistemático) | Violencia psicológica |
| **Cosificación visual electoral** | Fracc. IX, XVI (estereotipos, uso de imagen) | Violencia simbólica / mediática |
| **Catfishing / suplantación** | Fracc. III, XV (difamación, fraude electoral) | Violencia digital / posible delito penal |
| **Ataques coordinados (raid)** | Fracc. V, XI (intimidación, hostigamiento) | Violencia psicológica / digital |
| **Sextorsión política** | Fracc. V, XII (amenazas, chantaje) | Violencia sexual / delito penal |
| **Discurso de odio con sesgo de género** | Fracc. II, IX, X (calumnia, estereotipos) | Violencia simbólica / mediática |

Esta tabla es una versión resumida. El mapeo completo cubre las diecinueve conductas del Art. 20 Ter y las cruza con más de treinta categorías digitales del glosario y de literatura especializada. La tabla completa vive en la base de datos del sistema y se actualiza conforme la jurisprudencia del TEPJF avanza en la interpretación de cada conducta. Esta es la razón por la que Yaocíhuatl puede convertir una agresión digital en una tipificación jurídica precisa, sin pasar por una intermediación humana que tarde semanas.

## **6.3. Soberanía de datos: por qué un modelo de pesos abiertos**

La elección de DeepSeek como modelo de lenguaje principal no es una preferencia técnica sino una decisión arquitectónica con implicaciones legales y democráticas. Los organismos electorales mexicanos son sujetos obligados conforme a la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO). Mandar datos personales sensibles —narrativas de víctimas, evidencias forenses, expedientes en construcción— a un endpoint operado por una empresa extranjera implica una transferencia internacional de datos personales que requiere salvaguardas específicas, contratos de protección y, en ciertos casos, autorización adicional.

DeepSeek es un modelo de pesos abiertos. Esto significa que el organismo electoral puede descargar el modelo, desplegarlo en su propia infraestructura mediante vLLM o servidores de inferencia comparables, y procesar todas las consultas sin que ningún dato salga del perímetro institucional. La soberanía de datos queda garantizada por diseño, no por contrato.

| Soberanía operativa y geopolítica Yaocíhuatl no manda datos personales sensibles ni evidencia forense a OpenAI ni a Google. Usa DeepSeek-V3, modelo de pesos abiertos, que el organismo electoral despliega en su propia infraestructura junto con el resto del sistema. Esto cumple la LGPDPPSO sin excepciones, elimina dependencia geopolítica de proveedores extranjeros y garantiza que la operación es completamente auditable por la autoridad mexicana. |
| :---- |

Durante el demo del Hackathón, por razones de tiempo y simplicidad, DeepSeek se consume a través de OpenRouter (proxy comercial con baja latencia). En el pitch se explica con claridad esta distinción: el demo usa un proxy comercial; la producción institucional opera on-premise. Como respaldo de continuidad, el sistema permite cambiar el proveedor del LLM mediante una variable de entorno, sin tocar el código.

# **7\. Marco legal y anclaje normativo**

Yaocíhuatl se construye sobre un andamiaje normativo multinivel que combina derecho internacional vinculante, legislación federal mexicana, legislación local de Baja California, jurisprudencia del Tribunal Electoral del Poder Judicial de la Federación y soft law internacional especializado. La precisión jurídica es una característica diferenciadora de la propuesta: cada decisión que toma el sistema —desde clasificar una mención hasta sugerir una autoridad competente— se ancla en una norma o precedente identificable, y los expedientes generados citan los preceptos exactos aplicables al caso concreto.

## **7.1. Capa internacional vinculante**

México es parte de instrumentos internacionales que obligan al Estado a prevenir, investigar, sancionar y reparar la violencia política contra las mujeres. Estos tratados forman el piso interpretativo de toda la actuación institucional.

* **Convención Interamericana para Prevenir, Sancionar y Erradicar la Violencia contra la Mujer (Belém do Pará):** Arts. 4, 5 y 7\. Obliga al Estado mexicano a actuar con la debida diligencia frente a la violencia contra las mujeres en cualquier ámbito, incluido el político.

* **Convención sobre la Eliminación de Todas las Formas de Discriminación contra la Mujer (CEDAW):** Art. 7 sobre vida política y pública. Recomendación General 35 del Comité CEDAW sobre violencia por razones de género.

* **Pacto Internacional de Derechos Civiles y Políticos:** Art. 25 sobre derechos políticos.

* **Convención Americana sobre Derechos Humanos:** Art. 23 sobre derechos políticos.

## **7.2. Capa federal mexicana**

La legislación federal define la VPMRG como categoría jurídica, sus diecinueve conductas constitutivas, los procedimientos de denuncia, la integración del Registro Nacional de Personas Sancionadas y las competencias del Instituto Nacional Electoral y de los tribunales electorales.

* **Constitución Política de los Estados Unidos Mexicanos:** Arts. 1 (igualdad y no discriminación), 4 (igualdad entre mujeres y hombres), 6 (libertad de expresión y sus límites), 35 (derechos político-electorales) y 41 (sistema electoral federal).

* **Ley General de Acceso de las Mujeres a una Vida Libre de Violencia (LGAMVLV):** Art. 20 Bis (definición de VPMRG), Art. 20 Ter (diecinueve conductas constitutivas, núcleo de la taxonomía NLP de Yaocíhuatl), Arts. 48-49 sobre el Registro Nacional.

* **Ley General de Instituciones y Procedimientos Electorales (LGIPE):** tramitación de quejas por VPMRG mediante Procedimiento Especial Sancionador.

* **Ley General del Sistema de Medios de Impugnación en Materia Electoral (LGSMIME):** formato y requisitos del expediente que Yaocíhuatl genera mediante Chimalli.

* **Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO):** aplicable porque el operador es el organismo electoral, sujeto obligado. Determina el régimen de consentimiento, retención, supresión y transferencia internacional de datos —razón fundamental para optar por un modelo de lenguaje de pesos abiertos desplegado on-premise.

* **Ley Olimpia (reformas al Código Penal Federal y leyes generales en materia de violencia digital):** marco penal complementario para casos que excedan la materia electoral.

## **7.3. Capa local de Baja California**

Para el piloto institucional con el IEEBC, Yaocíhuatl integra el marco normativo estatal específico de Baja California, conforme a los documentos proporcionados por la Unidad de Igualdad Sustantiva del organismo:

* **Ley Electoral del Estado de Baja California:** regula instituciones y procedimientos locales; facultades del Tribunal de Justicia Electoral y tramitación de Procedimientos Especiales Sancionadores por violencia política de género en el ámbito estatal.

* **Ley de Acceso de las Mujeres a una Vida Libre de Violencia para el Estado de Baja California:** incluye explícitamente la violencia digital y mediática entre las modalidades reconocidas; prevé el Registro Público de Agresores y el Programa Estatal.

* **Ley de Transparencia y Acceso a la Información Pública para el Estado de Baja California:** régimen de datos personales y obligaciones de los sujetos obligados.

* **Ley de Víctimas para el Estado de Baja California:** atención, protección y reparación integral del daño.

* **Reglamento de Quejas y Denuncias del IEEBC:** norma los procedimientos sancionadores, la integración de expedientes, la valoración de pruebas técnicas.

* **Protocolo de Atención de Primer Contacto del IEEBC:** lineamientos para que la Unidad Técnica actúe con debida diligencia; integra el plan de seguridad personal que Chimalli ofrece a la víctima.

* **Lineamientos Procesales y Catálogo de Infracciones del IEEBC:** tipificación local de actos prohibidos y responsabilidades de ciudadanía, partidos y medios.

* **Guía VPRG24:** instrumento operativo para denunciar VPMRG en la vía electoral local.

## **7.4. Jurisprudencia y criterios del TEPJF**

Las decisiones del Tribunal Electoral del Poder Judicial de la Federación —tanto la Sala Superior como las salas regionales, incluida la Sala Regional Guadalajara que coorganiza este Hackathón— han ido construyendo el contenido sustantivo de la VPMRG digital, con criterios sobre admisibilidad de pruebas técnicas, cadena de custodia, ponderación entre libertad de expresión y derechos de las víctimas, reparación integral y medidas cautelares. El corpus jurisprudencial alimenta el RAG legal de Chimalli y permite que los expedientes generados citen precedentes análogos.

* Sentencias sobre VPMRG en redes sociales y medios digitales.

* Criterios sobre admisibilidad de pruebas técnicas y cadena de custodia digital.

* Reparación integral: eliminación de publicaciones, disculpas públicas, cursos de sensibilización, inscripción en el Registro Nacional.

* Análisis pionero del propio TEPJF sobre uso de IA y machine learning para estudio de grandes volúmenes de sentencias, antecedente institucional clave para la propuesta tecnológica de Yaocíhuatl.

## **7.5. Derecho comparado y soft law internacional**

Frente al hecho de que la legislación mexicana aún no tipifica la violencia digital con autonomía, el derecho comparado y los instrumentos internacionales especializados aportan referencias útiles que Yaocíhuatl incorpora a su taxonomía y a sus razonamientos:

* Unión Europea — Reglamento de Servicios Digitales (DSA): obligaciones de plataformas frente a violencia de género en línea.

* Reino Unido — Online Safety Act 2023: marco regulatorio sobre contenido perjudicial.

* Argentina — Ley Olimpia original: tipificación penal de violencia digital de género.

* Brasil — Lei Carolina Dieckmann: delitos informáticos.

* Consejo de Europa — Recomendación CM/Rec(2019)1 sobre prevención y combate al sexismo, incluyendo violencia digital.

* ONU Mujeres — Informe sobre violencia política contra mujeres en línea (2023).

* OEA/MESECVI — Recomendaciones sobre violencia política de género.

* UNESCO — Marcos sobre violencia en línea contra periodistas y mujeres en política.

# **8\. Consideraciones éticas, privacidad e inclusión**

Una herramienta que opera con datos personales sensibles, modelos de inteligencia artificial y la confianza de mujeres víctimas de violencia tiene obligaciones éticas que van más allá del cumplimiento normativo. Yaocíhuatl se compromete explícitamente con un conjunto de principios que están reflejados en sus decisiones de diseño, su modelo de gobernanza y la forma en que se comunica con sus usuarias.

## **8.1. Principios éticos rectores**

* **No censura.** Yaocíhuatl detecta y documenta. Nunca modera, oculta ni elimina contenido. La eliminación de publicaciones, si procede, se realiza por la propia plataforma social tras el reporte de la víctima o por orden de la autoridad competente. El sistema preserva la evidencia, no la suprime.

* **No decide culpabilidades.** Las alertas generadas por Tlachia son insumos para la analista humana, no sentencias. El veredicto sobre si una conducta constituye VPMRG y si procede sanción corresponde exclusivamente a la autoridad electoral y, en último término, al órgano jurisdiccional.

* **No sustituye a la autoridad.** La IA propone clasificaciones, identifica patrones, organiza información y sugiere rutas. La decisión jurídica siempre es humana y siempre es institucional.

* **Explicabilidad.** Cada alerta, cada clasificación, cada sugerencia de Chimalli incluye los criterios y datos que la generaron. No hay cajas negras. La analista puede inspeccionar el razonamiento del sistema y, si discrepa, anularlo.

* **Respeto a la libertad de expresión.** Yaocíhuatl no detecta crítica política como violencia. El test VPMRG de tres elementos es deliberadamente estricto para distinguir agresión por razón de género de oposición política legítima.

* **Auditabilidad.** El código fuente se libera bajo licencia Apache 2.0. Los modelos utilizados están documentados, sus datos de entrenamiento son transparentes, los procedimientos son trazables. Cualquier persona —dentro o fuera del organismo electoral— puede auditar el funcionamiento del sistema.

## **8.2. Privacidad por diseño**

Yaocíhuatl implementa el principio de privacidad por diseño en cinco dimensiones concretas:

* **Minimización:** sólo se recolectan los datos estrictamente necesarios para el monitoreo, la certificación y la canalización. No se almacenan datos biométricos, de localización en tiempo real ni información sobre la vida privada no relacionada con el caso.

* **Cifrado:** la evidencia se almacena cifrada con AES-GCM tanto en el dispositivo de la víctima (IndexedDB) como en el servidor institucional. Las comunicaciones cliente-servidor usan TLS 1.3 obligatorio.

* **Zero-knowledge en captura:** el hash forense se genera en el dispositivo antes de cualquier transmisión. El servidor no ve el contenido hasta que la víctima decide enviarlo.

* **Retención limitada:** durante el proceso electoral, retención completa cifrada. Treinta días después de la jornada, anonimización de datos no incluidos en expedientes formalmente abiertos. Los expedientes vigentes se conservan conforme a los plazos de la LGSMIME.

* **Anonimización para el observatorio:** los tableros públicos aplican k-anonimato con k ≥ 5 y supresión de identificadores. Es matemáticamente imposible re-identificar víctimas individuales a partir de los datos públicos.

## **8.3. Inclusión y accesibilidad**

La plataforma se construye sobre estándares de accesibilidad WCAG 2.1 nivel AA: contraste de color suficiente, navegación por teclado completa, soporte para lectores de pantalla, etiquetas semánticas, foco visible. El componente shadcn/ui sobre Radix Primitives ofrece esto por defecto, pero el equipo realiza pruebas específicas con NVDA y VoiceOver.

La interfaz de Chimalli está diseñada para que la víctima no necesite conocer terminología jurídica. La narrativa se solicita en lenguaje natural; la traducción a vocabulario legal es responsabilidad del sistema. Los textos de explicación, consentimiento y resultados utilizan lenguaje claro conforme a las recomendaciones de la Ley de Transparencia.

El diseño visual evita estereotipos de género (no se utiliza rosa pastel ni iconografía infantilizadora) y comunica seriedad institucional con calidez. El nombre y la nomenclatura en náhuatl son una elección deliberada de reivindicación cultural, no decorativa: las mujeres indígenas mexicanas enfrentan obstáculos adicionales en su participación política, y la plataforma reconoce simbólicamente su lugar en la lucha por la igualdad sustantiva.

## **8.4. Lo que Yaocíhuatl no hace (por diseño)**

La explicitación de los límites es una garantía ética y operativa. Yaocíhuatl no se construye con la siguiente lista de funcionalidades, incluso si fueran técnicamente posibles:

* No realiza reconocimiento facial sobre las víctimas, los agresores ni terceros.

* No accede a comunicaciones privadas (mensajes directos, chats cifrados, correos electrónicos personales).

* No realiza scoring de credibilidad sobre las víctimas ni sobre las narrativas.

* No automatiza la presentación de denuncias sin revisión humana previa.

* No dispara medidas cautelares de manera autónoma.

* No comparte datos personales con plataformas privadas, anunciantes, terceros o gobiernos extranjeros.

* No mantiene base de datos de agresores fuera del Registro Nacional oficial.

* No comercializa datos agregados ni desagregados, en ningún formato.

# **9\. Plan de ejecución y prototipo funcional**

Yaocíhuatl se construirá durante las 48 horas del Hackathón de Ciberdemocracia con división del trabajo en paralelo, integración continua y un plan de demo cronometrado y ensayado. La decisión arquitectónica de separar los tres módulos en microservicios independientes con contratos de interfaz claros permite que cada integrante construya su componente en paralelo y que la integración final ocurra al unirlos mediante la API REST unificada.

## **9.1. División del trabajo**

| Integrante | Módulo asignado | Responsabilidades principales |
| ----- | ----- | ----- |
| **Jorge Sandoval** | Tlachia \+ Coordinación | Adaptadores Reddit/YouTube reales, mocks X/Facebook con dataset IEEBC, clasificador NLP, dashboard, semáforo de riesgo, coordinación general y comunicación con mentor |
| **José Gilberto Tellez** | Machiyotl \+ Frontend | PWA offline-first, Web Crypto API para SHA-256, IndexedDB cifrado, generación de PDF forense con QR, botón de pánico, frontend del dashboard |
| **Rafael Ibarra** | Chimalli \+ Backend | Backend FastAPI, pipeline RAG legal con ingesta de sentencias y leyes, prompts del test VPMRG, matriz jurisdiccional, generación del expediente LGSMIME |
| **Dr. Castañón Puga** | Mentoría transversal | Validación arquitectónica, revisión de IA explicable, conexión con literatura académica relevante |

## **9.2. Cronograma de 48 horas**

### **Jueves previo (preparación)**

* 17:00 — 20:30: Setup de repositorios Git, contenedores Docker, despliegues iniciales en Vercel y Railway, claves de APIs.

* 20:30 — 22:00: Especificaciones operativas por módulo (una página cada uno) con contratos de API explícitos.

* 22:00 — 23:00: Ingesta inicial del corpus legal al RAG, preparación de datasets demo, anonimización de casos del IEEBC.

### **Viernes — Día 1 del Hackathón**

* 09:00 — 10:00: Ceremonia inaugural en el IEE Chihuahua.

* 10:00 — 14:00: Construcción paralela por módulo (cuatro horas de trabajo intensivo en silos).

* 14:00 — 15:00: Comida y checkpoint de integración: cada integrante demuestra el avance, se identifican bloqueos.

* 15:00 — 19:00: Segunda iteración. Tlachia conecta dashboard a la API; Machiyotl publica primer PDF forense; Chimalli responde con RAG funcional.

* 19:00 — 22:00: Integración end-to-end. Flujo completo de cuatro etapas funcionando. Grabación de video respaldo del demo.

* 23:00: Descanso programado.

### **Sábado — Día 2 del Hackathón**

* 07:00 — 09:00: Bug fixing, pulido visual, llenado del dataset demo con casos representativos.

* 09:00 — 11:00: Construcción de las slides del pitch (12 láminas máximo) \+ primer ensayo cronometrado.

* 11:00 — 12:00: Segundo ensayo del pitch ajustado a 3 minutos 40 segundos. Calibración de Q\&A.

* 12:00 — 12:30: Entrega formal: URL del prototipo, arquitectura PDF, anclaje normativo PDF, slides PDF, video respaldo del demo.

* 12:30 — 13:00: Pausa estratégica antes del pitch.

* 13:00: Pitch ante el jurado. Jorge abre y cierra; Gilberto demuestra en vivo.

## **9.3. Plan de demo en vivo (3:40 a 3:50)**

El demo en vivo dentro del pitch sigue una secuencia diseñada para mostrar el flujo de cuatro etapas con un caso realista basado en los expedientes anonimizados del IEEBC. La secuencia está cronometrada para caber dentro del tiempo asignado y tiene un video respaldo grabado por si falla la conectividad durante el evento.

* **Escenario base (30 s):** candidata ficticia a regiduría municipal en Mexicali. Tlachia muestra alerta en pantalla con cluster de cuentas creadas en los últimos 14 días atacando coordinadamente.

* **Etapa 1 — Detección (40 s):** la analista hace clic en la alerta, ve el grafo de coordinación, lee la justificación explicable, confirma el test VPMRG.

* **Etapa 2 — Sello forense (30 s):** Machiyotl en celular real captura una de las publicaciones, genera el hash SHA-256 en pantalla, descarga el PDF con QR.

* **Etapa 3 — Cese inmediato (20 s):** la plataforma muestra los enlaces directos para reportar en cada red social, con texto pre-llenado.

* **Etapa 4 — Canalización (45 s):** la víctima conversa con Chimalli, narra los hechos; el asistente extrae entidades, aplica el test, identifica que la autoridad competente es el IEEBC, y genera el expediente LGSMIME con citas a artículos y precedentes.

* **Cierre (15 s):** pantalla del observatorio ciudadano con datos anonimizados agregados. Mensaje final sobre licencia Apache 2.0 y disponibilidad para piloto con el IEEBC.

| Plan de continuidad ante fallos durante el demo Variables de entorno para cambiar el LLM en 20 segundos (de DeepSeek/OpenRouter a Claude Sonnet 4 fallback). Video respaldo del demo completo, grabado el viernes en la noche, listo para reproducirse si la conectividad de la sede falla. Datos demo cacheados localmente para que ninguna etapa dependa de una API externa en tiempo real durante el pitch. |
| :---- |

## **9.4. Entregables al cierre del Hackathón**

Conforme a los requisitos del concurso, Yaocíhuatl entrega los siguientes productos:

* Prototipo funcional accesible en URL pública (frontend Vercel \+ backend Railway), demostrable en vivo.

* Documento de arquitectura (este documento, capítulos 5 y 6\) con diagramas, stack tecnológico y flujo de información entre actores.

* Documento de anclaje normativo y ético (este documento, capítulos 7 y 8\) con marco legal multinivel, principios y consideraciones de privacidad e inclusión.

* Pitch de 3 minutos 40 segundos con slides en PDF, video respaldo del demo y guion ensayado.

* Repositorio público en GitHub con código bajo licencia Apache 2.0, README de instalación, docker-compose listo para despliegue institucional.

# **10\. Impacto democrático**

La VPMRG digital no es solamente un problema de violencia individual: es una falla estructural del sistema democrático que produce desincentivos masivos para la participación política de las mujeres y, en consecuencia, distorsiona la representación. Yaocíhuatl está diseñada para incidir sobre seis dimensiones del impacto democrático, cada una con métricas observables que permitirán evaluar la eficacia del piloto en el proceso electoral de Baja California 2026-2027.

## **10.1. Igualdad sustantiva y paridad efectiva**

La Constitución mexicana consagra desde 2019 la paridad en todo: el principio de que mujeres y hombres deben ocupar la mitad de los cargos públicos. La paridad cuantitativa está consolidada normativamente, pero la paridad sustantiva —el ejercicio real e igualitario del cargo, sin obstáculos discriminatorios— sigue siendo asignatura pendiente. La VPMRG digital es uno de los obstáculos más eficaces para vaciar de contenido la paridad: las mujeres pueden ocupar cargos pero ser silenciadas, ridiculizadas o forzadas a auto-censurarse durante el ejercicio.

Yaocíhuatl proporciona, por primera vez, datos sistemáticos sobre la incidencia, modalidad y patrón de la VPMRG digital durante un proceso electoral local. Permite saber cuántas candidatas son atacadas, con qué frecuencia, mediante qué conductas, en qué plataformas y con qué nivel de coordinación. Esta información sustenta políticas públicas correctivas y, en su caso, reformas legislativas para tipificar autónomamente la violencia digital.

## **10.2. Integridad y limpieza del proceso electoral**

Los ataques coordinados contra candidatas no solamente lesionan a la víctima: distorsionan el debate público, contaminan la información que llega al electorado y, en última instancia, alteran condiciones de equidad de la contienda. La detección temprana de campañas de astroturfing, deepfakes y coordinación inauténtica protege la integridad del proceso electoral en su conjunto. Yaocíhuatl es, en esta dimensión, una herramienta de defensa de la democracia electoral, no solamente de protección individual.

## **10.3. Acceso a la justicia y reducción de la revictimización**

Hoy, una mujer víctima de VPMRG digital enfrenta un laberinto institucional. Tres ventanillas posibles, jurisdicciones cruzadas, exigencia de presentar pruebas técnicas que no sabe cómo preservar y plazos que vencen mientras intenta entender qué le está pasando. Chimalli identifica la autoridad competente en minutos, no en semanas. Machiyotl genera evidencia admisible inmediatamente. Tlachia detecta y notifica antes de que la víctima descubra el ataque manualmente. El tiempo entre agresión y primera respuesta institucional se reduce de semanas a horas.

## **10.4. Confianza institucional**

La asesoría con la Consejera Vera Juárez Figueroa reveló un fenómeno preocupante: muchas víctimas no denuncian porque desconfían del proceso, de la confidencialidad o de la utilidad de hacerlo. Una herramienta institucional que demuestre tiempos de respuesta cortos, evidencia técnicamente sólida y resoluciones efectivas reconstruye el contrato implícito entre las mujeres en política y las autoridades electorales. La confianza institucional es, en sí misma, un bien democrático.

## **10.5. Inclusión de grupos históricamente excluidos**

Las mujeres indígenas, afrodescendientes, jóvenes, de la comunidad LGBT+, con discapacidad o de comunidades rurales enfrentan obstáculos compuestos para la participación política. La interseccionalidad de la violencia política contra estas mujeres es especialmente severa. Yaocíhuatl está diseñada para que la herramienta sea accesible (WCAG AA), opere offline en zonas con conectividad limitada (PWA Machiyotl), use lenguaje natural en lugar de jerga jurídica (Chimalli) y permita que la institución documente la incidencia diferenciada sobre cada grupo, generando datos para política pública diferenciada.

## **10.6. Datos para política pública basada en evidencia**

Hoy, cuando una autoridad pretende diseñar política pública contra la VPMRG digital, opera sobre estimaciones y testimonios. El observatorio ciudadano de Yaocíhuatl, con datos anonimizados de un proceso electoral completo, permitirá por primera vez en México responder con precisión preguntas como: ¿qué conductas predominan? ¿qué plataformas concentran más ataques? ¿qué cargos están más expuestos? ¿qué porcentaje de las víctimas denuncia? ¿cuál es el tiempo promedio entre agresión y resolución? La política pública sin datos es deseo; con datos, se vuelve estrategia.

# **11\. Modelo de sostenibilidad y cotización**

La sostenibilidad de Yaocíhuatl combina un modelo de licenciamiento abierto que garantiza la apropiación institucional con un modelo de servicios profesionales que permite que el equipo LexHackers mantenga, evolucione y soporte la plataforma para los organismos que la adopten. La estructura es deliberadamente sencilla y predecible: licencia gratuita, contratación profesional para implementación y operación.

## **11.1. Modelo de licenciamiento**

Al cierre del Hackathón, el código fuente de Yaocíhuatl se libera bajo licencia Apache 2.0, con la Universidad Autónoma de Baja California como mantenedora académica y el equipo LexHackers como mantenedor técnico. Esto significa:

* Cualquier organismo electoral del país puede descargar, modificar y desplegar la plataforma sin pagar licencia, sin licitación intermedia, sin negociación contractual sobre el producto en sí.

* El código permanece auditable de manera permanente: cualquier persona —académica, periodista, sociedad civil, magistratura— puede revisar exactamente qué hace el sistema y cómo lo hace.

* Las modificaciones realizadas por terceros no quedan capturadas: la licencia Apache 2.0 no obliga a publicar derivados, pero permite redistribuirlos.

* El nombre Yaocíhuatl y la marca asociada se reservan a través de derechos de autor sobre identidad gráfica, sin que esto restrinja el uso técnico del código.

## **11.2. Cotización para piloto institucional con un OPLE**

La implementación profesional de Yaocíhuatl en un organismo electoral —incluyendo adaptación a sus procesos internos, integración con sus sistemas existentes, capacitación al personal y soporte durante un proceso electoral completo— se cotiza con la siguiente estructura indicativa. Las cifras son referenciales para un piloto en una entidad federativa con dimensiones comparables a Baja California.

### **Costo de implementación inicial (no recurrente)**

| Concepto | Estimación MXN |
| ----- | :---: |
| Desarrollo y adaptación institucional (3 ingenieros × 4 meses) | **$660,000** |
| Asesoría legal externa especializada en derecho electoral y datos personales | **$120,000** |
| Diseño UX/UI senior con perspectiva de género (2 meses parcial) | **$80,000** |
| Pruebas de penetración y auditoría de seguridad externa | **$80,000** |
| Capacitación al personal de la Unidad Técnica de lo Contencioso Electoral | **$50,000** |
| Configuración inicial de infraestructura on-premise y migración | **$30,000** |
| **Total implementación (no recurrente)** | **$1,020,000 MXN** |

### **Costo operativo anual**

| Concepto | Estimación MXN/año |
| ----- | :---: |
| Infraestructura institucional (servidor para LLM, base de datos, almacenamiento) | **$250,000** |
| APIs de monitoreo de redes sociales (X Enterprise tier institucional, Meta Graph) | **$200,000** |
| Mantenimiento, soporte y actualizaciones (developer part-time) | **$360,000** |
| Mesa de ayuda de primera línea durante proceso electoral | **$80,000** |
| Capacitación continua y actualización del corpus legal | **$40,000** |
| Auditoría anual de seguridad y compliance | **$60,000** |
| Reservas para contingencias e incidentes | **$110,000** |
| **Total operativo anual** | **$1,100,000 MXN** |

## **11.3. Costo per cápita y comparación de mercado**

Para una entidad federativa con aproximadamente 500 candidaturas femeninas registradas más 70 mujeres en cargos electos (estimación basada en el proceso electoral local de Baja California), el universo protegido es de aproximadamente 570 mujeres. El costo operativo anual representa $1,930 MXN por mujer protegida.

| Comparación de oferta | Costo aproximado | Alcance |
| ----- | :---: | ----- |
| Servicio de monitoreo de medios tradicional (proveedor comercial) | $1.5M-$2M MXN/año | Solo monitoreo, sin certificación ni canalización |
| Contrato del IEEBC en proceso 23-24 (con proveedor único) | $200,000 MXN | Monitoreo limitado a catálogo de medios tradicionales |
| **Yaocíhuatl — operación anual completa** | **$1.1M MXN/año** | Monitoreo \+ sello forense \+ canalización \+ observatorio |

La propuesta de valor económica de Yaocíhuatl es la siguiente: por un costo comparable o inferior al que el IEEBC ya gastó en monitoreo limitado en el proceso 23-24, la institución obtiene una plataforma integral que cubre las cuatro etapas del flujo, está hecha a medida del marco legal mexicano, garantiza soberanía de datos por diseño y deja al organismo dueño del código.

## **11.4. Plan de despliegue post-Hackathón**

* **Mes 1 (junio 2026):** reunión formal con el IEEBC para presentar resultados del Hackathón y suscribir convenio de colaboración con UABC para piloto institucional.

* **Meses 2-5 (julio-octubre 2026):** desarrollo profesional de la versión institucional con presupuesto del piloto, integración a sistemas del IEEBC, capacitación al personal de la UTCE, pruebas de aceptación.

* **Mes 6 (noviembre 2026):** simulacro de operación con casos sintéticos antes del arranque del proceso electoral local.

* **Diciembre 2026 — Junio 2027:** operación durante precampaña, campaña y jornada electoral de Baja California. Soporte de primera línea y monitoreo continuo del equipo.

* **Julio 2027:** evaluación de resultados, publicación de informe público con datos anonimizados, replicación a otros OPLEs interesados.

# **12\. Alineación con criterios de evaluación del Hackathón**

Esta sección mapea explícitamente cada criterio de evaluación del Hackathón de Ciberdemocracia 2026 con las secciones del presente documento, los entregables específicos y los argumentos sustantivos que respaldan la calificación. La matriz permite al jurado verificar de manera directa el cumplimiento de cada criterio.

| Criterio | Pts | Cómo lo cubre Yaocíhuatl |
| ----- | :---: | ----- |
| **Problema público** | **20** | Sección 2\. Cifras oficiales del IEEBC (84 denuncias, 52 asumidas, 29 medidas cautelares) y del Registro Nacional (484 sanciones, 35% digitales). Tres fallas estructurales documentadas: detección tardía, evidencia inadmisible, laberinto jurisdiccional. Brecha temporal entre 90 días de campaña y meses de resolución. |
| **Solución centrada en usuario** | **20** | Secciones 3-4. Test VPMRG de tres elementos delimita con precisión el universo protegido. Cuatro roles diferenciados con interfaces propias: víctima, autoridad, magistratura, observatorio ciudadano. Flujo de cuatro etapas diseñado con asesoría de la Consejera Vera Juárez Figueroa (IEEBC). PWA accesible WCAG AA, lenguaje natural, perspectiva de género en diseño visual e interaccional. |
| **Viabilidad técnica** | **20** | Secciones 5-6 y 9\. Stack tecnológico unificado con tecnologías open source maduras. Arquitectura en cinco capas con separación estricta de responsabilidades. Adaptadores intercambiables por plataforma. LLM de pesos abiertos (DeepSeek) compatible con despliegue on-premise. Docker para portabilidad institucional. Plan de ejecución de 48 horas con división de trabajo demostrable. |
| **Impacto democrático** | **20** | Sección 10\. Seis dimensiones de impacto: igualdad sustantiva, integridad electoral, acceso a la justicia, confianza institucional, inclusión de grupos históricamente excluidos, generación de datos para política pública basada en evidencia. Métricas observables para evaluación del piloto. |
| **Prototipo funcional** | **10** | Sección 9\. Prototipo desplegado en URL pública (Vercel \+ Railway), demo en vivo de 3:40 mostrando flujo completo de cuatro etapas con caso anonimizado del IEEBC. Video respaldo grabado. Reddit y YouTube con API real, X y Facebook con dataset institucional anonimizado. |
| **Presentación** | **10** | Pitch de 3:40 cronometrado y ensayado dos veces. Slides en PDF con narrativa clara: problema, solución, demo, impacto, viabilidad, propuesta de valor. Jorge Sandoval abre y cierra; José Gilberto Tellez demuestra. Lenguaje accesible para audiencia jurídica y tecnológica simultánea. |

## **12.1. Cobertura de los entregables requeridos**

| Entregable requerido | Ubicación en este documento |
| ----- | ----- |
| **Prototipo funcional** | Sección 9\. URL pública con demo accesible, video respaldo, repositorio GitHub Apache 2.0 |
| **Arquitectura de la solución** | Secciones 5 y 6\. Cinco capas, stack tecnológico unificado, stack por módulo, metodología de IA en tres capas con explicabilidad, mapeo glosario-Art.20Ter |
| **Anclaje normativo y ético** | Secciones 7 y 8\. Marco legal multinivel (internacional, federal, BC, jurisprudencia TEPJF, derecho comparado), seis principios éticos, privacidad por diseño, inclusión, lista negativa de funcionalidades excluidas |
| **Pitch (3-4 minutos)** | Sección 9.3. Guion cronometrado a 3:40, slides PDF separadas, plan de continuidad ante fallos |

# **13\. Equipo LexHackers**

LexHackers es un equipo multidisciplinar de estudiantes de Ingeniería en Software de la Universidad Autónoma de Baja California (UABC), Campus Tijuana. El nombre del equipo refleja deliberadamente la convergencia entre tecnología y derecho que la propuesta requiere: construir soluciones cívico-tecnológicas no es escribir código, es construir el puente entre lo que la ley exige y lo que la tecnología permite. La mentoría académica está a cargo del Dr. Manuel Castañón Puga, profesor-investigador con trayectoria en sistemas complejos, inteligencia artificial y modelado social.

## **13.1. Integrantes**

| Integrante | Rol en el proyecto | Responsabilidad en el pitch |
| ----- | ----- | ----- |
| **Jorge Alejandro Sandoval Romo** | Representante del equipo. Tlachia: motor de monitoreo, NLP, dashboard. Coordinación general. | Apertura y cierre del pitch. Presentación de problema, solución, impacto, propuesta de valor. |
| **José Gilberto Tellez Montoya** | Machiyotl: PWA forense, Web Crypto, IndexedDB, PDF con QR. Frontend del dashboard. | Demo en vivo del flujo de cuatro etapas. Demostración técnica del prototipo. |
| **Rafael Ibarra Beltrán** | Chimalli: backend FastAPI, RAG legal, agente con DeepSeek, generación de expedientes LGSMIME. | Soporte técnico durante el evento. No expone ante el jurado. |

## **13.2. Mentor académico**

Dr. Manuel Castañón Puga. Profesor-investigador en la Facultad de Ciencias Químicas e Ingeniería de la UABC. Líneas de investigación en sistemas complejos, inteligencia artificial, modelado de fenómenos sociales y educación en ciencia de la computación. Acompaña al equipo en decisiones arquitectónicas, validación de la metodología de IA y conexión con literatura académica relevante.

## **13.3. Asesorías recibidas durante el desarrollo de la propuesta**

* **Mtra. Vera Juárez Figueroa,** Consejera Electoral del IEEBC. Asesoría sustantiva sobre VPMRG, criterios institucionales, el laberinto jurisdiccional y la asimetría temporal entre ataque y respuesta. Su aportación fue determinante para la reformulación del flujo de cuatro etapas y el paradigma institucional de la plataforma.

* **Lic. Melissa Mendoza García,** Unidad de Igualdad Sustantiva del IEEBC. Proporcionó el corpus documental que alimenta el RAG legal de Chimalli: estadísticos UTCE, glosario, protocolos, leyes locales, informes de monitoreo, sentencias TEPJF y casos reales anonimizados.

* **Junta de mentoría académica del Hackathón.** Retroalimentación recibida durante las sesiones previas al evento, incorporada al diseño de la solución.

## **13.4. Universidad Autónoma de Baja California**

La UABC, con casi 70 años de historia, es la institución de educación superior pública más importante de Baja California. La Facultad de Ciencias Químicas e Ingeniería en el Campus Tijuana, donde se forma el equipo, mantiene programas robustos en ingeniería de software, ciencia de la computación y sistemas complejos. La participación del equipo en este Hackathón se enmarca en la vinculación entre la formación universitaria y los desafíos contemporáneos del Estado mexicano. La UABC se ofrece como mantenedora académica de la plataforma post-Hackathón, en el marco de su responsabilidad social universitaria.

# **14\. Referencias y bibliografía**

## **14.1. Legislación y normatividad**

* Constitución Política de los Estados Unidos Mexicanos. Última reforma 2024\.

* Ley General de Acceso de las Mujeres a una Vida Libre de Violencia (LGAMVLV). Última reforma 2023\.

* Ley General de Instituciones y Procedimientos Electorales (LGIPE).

* Ley General del Sistema de Medios de Impugnación en Materia Electoral (LGSMIME).

* Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO).

* Código Penal Federal y reformas conocidas como Ley Olimpia.

* Ley Electoral del Estado de Baja California.

* Ley de Acceso de las Mujeres a una Vida Libre de Violencia para el Estado de Baja California.

* Ley de Transparencia y Acceso a la Información Pública para el Estado de Baja California.

* Ley de Víctimas para el Estado de Baja California.

* Reglamento de Quejas y Denuncias del IEEBC.

* Lineamientos Procesales y Catálogo de Infracciones del IEEBC.

* Protocolo de Atención de Primer Contacto del IEEBC.

* Guía VPRG24 para denuncias de violencia política contra las mujeres en razón de género.

## **14.2. Instrumentos internacionales**

* Convención Interamericana para Prevenir, Sancionar y Erradicar la Violencia contra la Mujer (Belém do Pará), 1994\.

* Convención sobre la Eliminación de Todas las Formas de Discriminación contra la Mujer (CEDAW), 1979\. Recomendación General 35 (2017).

* Pacto Internacional de Derechos Civiles y Políticos, ONU.

* Convención Americana sobre Derechos Humanos (Pacto de San José).

* Reglamento de Servicios Digitales de la Unión Europea (DSA), 2022\.

* Online Safety Act del Reino Unido, 2023\.

* Consejo de Europa. Recomendación CM/Rec(2019)1 sobre prevención y combate al sexismo.

## **14.3. Jurisprudencia y documentos del TEPJF**

* Tribunal Electoral del Poder Judicial de la Federación. Glosario electoral digital sobre violencia política de género.

* TEPJF. Sentencias sobre violencia política contra las mujeres en razón de género en medios digitales (2020-2025).

* TEPJF. Documento sobre Violencia Digital en Razón de Género.

* TEPJF. Aplicaciones de inteligencia artificial y machine learning en el estudio de sentencias.

## **14.4. Documentos institucionales del IEEBC**

* Instituto Estatal Electoral de Baja California. Estadístico UTCE BC sobre denuncias de VPMRG (2019-2026).

* IEEBC. Estadístico Voces Libres sobre sanciones en el Registro Nacional VPMRG.

* IEEBC. Informes de monitoreo del proceso electoral local 2023-2024.

* IEEBC. Casos reales anonimizados de VPMRG digital del proceso 23-24.

* Informes comparados de monitoreo de VPMRG digital en Querétaro, Puebla, Nuevo León, Baja California Sur, Coahuila, Ciudad de México y Jalisco.

## **14.5. Documentos de organismos internacionales**

* ONU Mujeres. Informe sobre violencia política contra mujeres en línea, 2023\.

* OEA/MESECVI. Recomendaciones sobre violencia política de género.

* UNESCO. Marcos sobre violencia en línea contra periodistas y mujeres en política.

* CEPAL. Estudios sobre paridad y participación política de las mujeres en América Latina.

## **14.6. Documentación técnica de referencia**

* Vaswani et al. Attention Is All You Need. NeurIPS 2017\.

* Devlin et al. BERT: Pre-training of Deep Bidirectional Transformers. NAACL 2019\.

* Lewis et al. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS 2020\.

* DeepSeek-AI. DeepSeek-V3 Technical Report, 2025\.

* W3C. Web Cryptography API Recommendation.

* W3C. Web Content Accessibility Guidelines (WCAG) 2.1.

* OWASP. Application Security Verification Standard (ASVS).

*Documento elaborado por el Equipo LexHackers · Universidad Autónoma de Baja California · Mayo de 2026\.*

*Yaocíhuatl será liberado bajo licencia Apache 2.0 al cierre del Hackathón de Ciberdemocracia 2026\.*