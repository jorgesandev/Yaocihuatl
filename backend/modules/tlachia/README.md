# Tlachia

Tlachia es el modulo de observacion y alertas. Su responsabilidad es identificar senales publicas o autorizadas que puedan requerir revision institucional por posible VPMRG digital.

## Estado Actual

- Pantallas demo en `frontend/apps/demo/src/app/app/tlachia`.
- Tablas creadas en PostgreSQL bajo el esquema `tlachia`.
- Seed sintetico con alerta, senales, mencion sanitizada y cluster.
- Sin ingesta real ni clasificadores conectados todavia.

## Responsabilidad Tecnica

- Normalizar menciones publicas/autorizadas a un esquema comun.
- Generar alertas con `risk_level` asistivo: `low`, `medium`, `high`, `unclassified`.
- Guardar senales explicables para revision humana.
- Guardar solo fragmentos sanitizados o autorizados.
- Vincular alertas revisadas con `core.cases` cuando corresponda.

## Limites

- No scraping invasivo.
- No vigilancia masiva.
- No comunicaciones privadas.
- No confirmacion automatica de VPMRG.
- No identificacion de agresores por inferencia.
- No almacenar datos reales sin documentar fuente, autorizacion, minimizacion, retencion y controles de acceso.

## Siguiente Implementacion

Antes de escribir logica real se debe documentar:

- fuentes permitidas;
- contratos de adaptadores;
- campos de entrada/salida;
- riesgos de sesgo;
- sanitizacion;
- auditoria;
- revision humana;
- pruebas con datos sinteticos/anonimizados.
