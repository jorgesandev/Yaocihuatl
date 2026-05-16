# Machiyotl

Machiyotl es el modulo de sellado forense y preservacion de evidencia. Su responsabilidad es producir registros verificables de integridad, custodia y estado de evidencia digital.

## Estado Actual

- Pantallas demo en `frontend/apps/demo/src/app/app/machiyotl` y `frontend/apps/demo/src/app/app/evidence`.
- Tablas creadas en PostgreSQL bajo el esquema `machiyotl`.
- Seed sintetico con archivo placeholder, SHA-256, nota y evento de custodia.
- Sin PWA forense real ni API de carga/verificacion conectada todavia.

## Responsabilidad Tecnica

- Registrar evidencia autorizada con metadatos minimos.
- Calcular o recibir hash SHA-256 preservando integridad.
- Registrar eventos de cadena de custodia.
- Verificar hashes sin exponer contenido sensible.
- Asociar evidencia con `core.cases`.
- Distinguir estado local/offline, servidor y expediente.

## Limites

- No usar evidencia real en modo demo.
- No almacenar archivos sensibles sin cifrado en reposo.
- No modificar evidencia despues del sellado.
- No clasificar juridicamente el contenido.
- No saltar consentimiento, retencion ni control de acceso.

## Siguiente Implementacion

Antes de escribir logica real se debe documentar:

- flujo PWA/offline;
- algoritmo de hash y formato de verificacion;
- almacenamiento aprobado;
- cifrado;
- eventos de custodia;
- politicas de retencion;
- permisos por rol;
- exportacion/reporte forense.
