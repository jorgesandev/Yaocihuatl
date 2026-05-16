# Tlachia

Tlachia es el modulo de observacion y alertas. Su responsabilidad es identificar senales que puedan requerir revision institucional por posible VPMRG digital, siempre como asistencia y nunca como decision automatica.

## Estado Actual

- Pantallas demo en `frontend/apps/demo/src/app/app/tlachia`.
- Tablas creadas en PostgreSQL bajo el esquema `tlachia`.
- Seed sintetico con alerta, senales, mencion sanitizada y cluster.
- El MVP usara fixtures sinteticos que emulan respuestas API de Facebook, Instagram, X, TikTok y Reddit.
- No se usaran API keys reales ni llamadas externas a plataformas.

## Responsabilidad Tecnica

- Leer fixtures sinteticos multiplataforma.
- Normalizar menciones sinteticas a un esquema comun.
- Generar alertas con `risk_level` asistivo: `low`, `medium`, `high`, `unclassified`.
- Guardar senales explicables para revision humana.
- Guardar solo fragmentos sanitizados y metadatos minimos.
- Vincular alertas revisadas con `core.cases` cuando corresponda.
- Nunca emitir `confirmed` como resultado de regla o modelo automatico.

## Limites

- No API keys reales en el MVP.
- No scraping invasivo.
- No vigilancia masiva.
- No comunicaciones privadas.
- No confirmacion automatica de VPMRG.
- No identificacion de agresores por inferencia.
- No almacenar datos reales sin documentar fuente, autorizacion, minimizacion, retencion y controles de acceso.

## Estado Implementado / MVP Objetivo

- Login institucional base con roles reales.
- Sesiones, logout y auditoria.
- Proteccion de endpoints por rol.
- CRUD administrativo minimo de usuarios.
- Configuracion de fuentes sinteticas por plataforma y escenario.
- Ingesta manual/controlada desde fixtures sinteticos.
- Normalizacion de menciones sinteticas.
- Reglas explicables de riesgo iniciales, sin clasificacion legal definitiva.
- Alertas Tlachia con revision humana.
- Dashboard conectado a endpoints reales del backend.

## Objetivo Futuro (Fase 2)

- OIDC institucional real.
- Firma electronica avanzada.
- MFA.
- Adaptadores reales solo si existe aprobacion institucional y terminos documentados.
- Clasificador NLP BETO/DeepSeek para las 19 conductas del Art. 20 Ter, con corpus validado.
- Clustering DBSCAN/NetworkX para deteccion de campanas coordinadas.
- Notificacion push real a victimas.
- Apertura automatica de expediente legal solo como flujo revisable, nunca decision automatica.

## Referencias

- `docs/technical/tlachia-synthetic-api-path.md` — ruta tecnica sintetica sin API keys.
- `docs/technical/api-contracts.md` — contratos de endpoints.
- `docs/technical/data-model.md` — modelo de datos.
- `docs/technical/deployment.md` — variables y operacion.
- `docs/technical/adr/0001-tlachia-synthetic-adapters-mvp.md` — decision de arquitectura.

## Notas Operativas

- `TLACHIA_SYNTHETIC_MODE=true` por defecto.
- `TLACHIA_INGESTION_ENABLED=false` por defecto; habilitar solo para ingesta controlada de fixtures.
- `TLACHIA_STORE_RAW_PLATFORM_CONTENT=false` por defecto.
- `TLACHIA_SYNTHETIC_FIXTURES_PATH=datasets/synthetic/tlachia`.
- No usar `confirmed` para resultados automaticos.
