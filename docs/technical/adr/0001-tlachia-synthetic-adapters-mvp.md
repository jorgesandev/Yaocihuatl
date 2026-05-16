# ADR 0001: Tlachia Synthetic Platform Adapters MVP

## Estado

Aceptado (MVP)

## Contexto

Tlachia necesita demostrar ingesta, normalizacion, senales explicables, alertas y revision humana en el hackathon. Las API keys reales de plataformas como Reddit, Meta, X, TikTok o YouTube pueden tardar semanas, exigir revision adicional o introducir dependencia externa durante la demo.

## Decision

El MVP de Tlachia usara adaptadores sinteticos que leen fixtures JSON locales y emulan respuestas API de:

- Facebook;
- Instagram;
- X;
- TikTok;
- Reddit.

No se solicitaran ni usaran API keys reales. No habra OAuth, scraping ni llamadas de red a plataformas externas.

## Consecuencias

- Demo reproducible sin internet ni aprobaciones externas.
- Menor riesgo de privacidad.
- Pruebas deterministas.
- Posibilidad de cubrir escenarios de coordinacion, falsos positivos y ambiguedad con datos controlados.
- El sistema sigue validando arquitectura, RBAC, auditoria, normalizacion, reglas explicables y revision humana.

## Limites Explicitos

- No monitoreo real de plataformas.
- No datos reales, anonimizados ni de personas identificables.
- No perfiles completos.
- No scraping.
- No confirmacion automatica de VPMRG.
- Clasificador NLP para las 19 conductas queda fuera del MVP.
- Cualquier adaptador real futuro requiere ADR nuevo, revision de terminos, base legal, minimizacion, retencion y aprobacion institucional.
