# Migrations

Alembic administra el esquema inicial de Yaocíhuatl para PostgreSQL/pgvector.

La migración base crea esquemas separados para `iam`, `core`, `tlachia`, `machiyotl`, `chimalli`, `observatory` y `audit`. Esta base permite trabajar con autenticación demo, auditoría, expedientes, evidencia, alertas, fuentes RAG y métricas públicas sintéticas sin tocar la lógica actual de Chimalli.

Comandos:

```bash
alembic upgrade head
alembic current
```
