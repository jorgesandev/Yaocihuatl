# ADR 0001: Tlachia Reddit MVP

## Estado

Aceptado (MVP)

## Contexto

Tlachia necesita una primera fuente real de observacion asistiva. Reddit fue elegido por:

- API oficial documentada y estable.
- Contenido publico (no requiere acceso a comunicaciones privadas).
- Posibilidad de monitorear subreddits relevantes para la politica mexicana.
- Rate limits claros y gratuitos razonables (100 queries/minuto).

## Decision

Usar OAuth directo con `urllib` (stdlib) en lugar de PRAW para minimizar dependencias y mantener control total sobre headers de rate limit, timeouts y user agent.

## Consecuencias

- Menor dependencia externa.
- Mayor codigo propio para manejar errores HTTP.
- Rate limits gestionados manualmente.
- Retencion de contenido limitada a 48 horas por defecto.
- Solo extractos sanitizados y metadatos permitidos se almacenan.

## Limites Explicitos

- No scraping HTML.
- No perfiles completos de autor.
- No mensajes privados.
- No confirmacion automatica de VPMRG.
- Clasificador NLP para las 19 conductas queda fuera del MVP (fase 2).
