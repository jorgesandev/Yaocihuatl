# Tlachia Synthetic API Path

Este documento define la ruta tecnica para implementar Tlachia sin API keys reales ni llamadas a plataformas externas. El MVP usara respuestas sinteticas que emulan estructuras de Facebook, Instagram, X, TikTok y Reddit para demostrar ingesta, normalizacion, senales explicables, alertas y revision humana.

## Decision

Tlachia no usara APIs reales en el MVP. No se solicitaran, almacenaran ni desplegaran llaves de Reddit, YouTube, Meta, X, TikTok u otra plataforma.

Motivos:

- obtener llaves de plataformas puede tomar semanas;
- el hackathon necesita un flujo demostrable y reproducible;
- los datos sinteticos eliminan riesgo de exponer personas reales;
- las pruebas son deterministas;
- se mantiene el foco en arquitectura, explicabilidad, auditoria y human-in-the-loop.

## Alcance

Incluido:

- fixtures JSON sinteticos por plataforma;
- adaptadores que leen fixtures con forma similar a respuestas API;
- normalizacion a un contrato comun `SyntheticPlatformMention`;
- reglas explicables de riesgo;
- alertas Tlachia con revision humana;
- dashboard conectado a backend;
- auditoria de ingesta y revision.

Fuera de alcance:

- API keys reales;
- OAuth con plataformas;
- scraping;
- datasets reales anonimizados;
- perfiles reales de agresores;
- historiales de cuentas;
- clasificacion juridica definitiva;
- monitoreo continuo de internet.

## Plataformas Simuladas

| Plataforma | Fixture | Objetivo de demo |
|---|---|---|
| Facebook | `facebook-feed.json` | comentarios en publicaciones publicas simuladas. |
| Instagram | `instagram-comments.json` | comentarios y replies simulados. |
| X | `x-search.json` | publicaciones cortas, reposts y menciones simuladas. |
| TikTok | `tiktok-comments.json` | comentarios en video simulado. |
| Reddit | `reddit-listing.json` | submissions/comments simulados. |

Ruta recomendada:

```text
datasets/synthetic/tlachia/
  facebook-feed.json
  instagram-comments.json
  x-search.json
  tiktok-comments.json
  reddit-listing.json
  README.md
```

## Variables De Entorno

```env
TLACHIA_INGESTION_ENABLED=false
TLACHIA_DEMO_MODE=true
TLACHIA_SYNTHETIC_MODE=true
TLACHIA_SYNTHETIC_FIXTURES_PATH=datasets/synthetic/tlachia
TLACHIA_SYNTHETIC_PLATFORMS=facebook,instagram,x,tiktok,reddit
TLACHIA_STORE_RAW_PLATFORM_CONTENT=false
TLACHIA_RETENTION_HOURS=48
TLACHIA_MIN_ALERT_SCORE=50
```

Reglas:

- `TLACHIA_SYNTHETIC_MODE=true` es obligatorio para el MVP.
- `TLACHIA_STORE_RAW_PLATFORM_CONTENT=false` es el default.
- No agregar variables `*_API_KEY`, `*_CLIENT_SECRET` ni credenciales de plataformas para Tlachia.

## Contrato Comun Normalizado

Cada adaptador sintetico debe convertir su fixture a:

```json
{
  "synthetic_id": "x_demo_001",
  "platform": "x",
  "source_kind": "post",
  "source_url": "https://example.invalid/x/demo/status/001",
  "author_label": "Cuenta demo 001",
  "author_synthetic_id": "acct_demo_001",
  "occurred_at": "2026-05-15T22:15:00Z",
  "text": "Texto sintetico de mencion.",
  "language": "es",
  "engagement": {
    "likes": 12,
    "shares": 3,
    "comments": 4
  },
  "metadata": {
    "fixture_file": "x-search.json",
    "synthetic": true
  }
}
```

El backend puede guardar extractos sanitizados y metadatos minimos. El texto completo de fixtures puede vivir en `datasets/synthetic` porque no representa datos reales, pero la capa de persistencia debe comportarse como si estuviera minimizando datos.

## Estructura De Servicios

```text
backend/app/services/tlachia/
  synthetic_adapters.py
  synthetic_ingestion_service.py
  normalization.py
  sanitization.py
  risk_rules.py
  alert_service.py
```

Adaptadores esperados:

- `FacebookSyntheticAdapter`
- `InstagramSyntheticAdapter`
- `XSyntheticAdapter`
- `TikTokSyntheticAdapter`
- `RedditSyntheticAdapter`

Todos implementan:

```python
class SyntheticPlatformAdapter:
    platform: str

    def fetch_mentions(self, fixture_path: Path) -> list[SyntheticPlatformMention]:
        ...
```

## Modelo De Datos

Preferir nombres genericos de plataforma:

- `tlachia.sources`
- `tlachia.ingestion_runs`
- `tlachia.synthetic_items` o `tlachia.platform_items`
- `tlachia.alerts`
- `tlachia.alert_signals`
- `tlachia.sanitized_mentions`
- `audit.audit_log`

No crear tablas especificas como `reddit_items` para el MVP sintetico. Si despues se habilita una API real, se debe agregar una migracion nueva y un ADR nuevo.

## Endpoints

```text
GET  /api/v1/tlachia/sources
POST /api/v1/tlachia/sources
POST /api/v1/tlachia/ingest/synthetic
GET  /api/v1/tlachia/ingestion-runs
GET  /api/v1/tlachia/alerts
GET  /api/v1/tlachia/alerts/{id}
POST /api/v1/tlachia/alerts/{id}/review
POST /api/v1/tlachia/alerts/{id}/dismiss
POST /api/v1/tlachia/alerts/{id}/escalate
```

`POST /api/v1/tlachia/ingest/synthetic` acepta:

```json
{
  "platforms": ["facebook", "instagram", "x", "tiktok", "reddit"],
  "scenario": "campaign-burst-demo"
}
```

## Escenarios Sinteticos

Crear fixtures para al menos tres escenarios:

1. **Debate organico intenso**
   - Alto volumen.
   - Sin lenguaje de genero.
   - Debe generar `low` o descartarse.

2. **Rafaga coordinada con estereotipos**
   - Mensajes similares.
   - Ventana temporal corta.
   - Debe generar `medium` o `high`.

3. **Caso manual sin senales suficientes**
   - Pocas menciones.
   - Contexto ambiguo.
   - Debe quedar `unclassified` o `requires_human_review`.

## Criterios De Aceptacion

- No existe ninguna variable de Tlachia que requiera API key real.
- La ingesta funciona sin internet.
- Las pruebas son deterministas.
- Las alertas indican que provienen de datos sinteticos.
- El dashboard muestra plataforma, escenario, senales y estado de revision.
- Ningun resultado automatico usa `confirmed`.
- La documentacion declara que el MVP no monitorea plataformas reales.

## Camino A Futuro

Si despues se decide integrar APIs reales:

1. Crear ADR nuevo.
2. Revisar terminos oficiales de la plataforma.
3. Documentar base legal, fuente, minimizacion, retencion y eliminacion.
4. Agregar variables de entorno por plataforma.
5. Implementar adaptador real separado.
6. Mantener fixtures sinteticos para pruebas.
7. No activar en produccion sin aprobacion institucional.
