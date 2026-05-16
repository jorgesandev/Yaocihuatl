# Backend Modules

Documentacion de dominio para mantener limites claros entre modulos. La implementacion ejecutable vive por ahora en `backend/app`; estas carpetas describen responsabilidades, contratos esperados y restricciones por modulo.

| Modulo | Responsabilidad | Estado actual |
|---|---|---|
| `tlachia/` | Observacion, alertas, senales explicables y revision humana. | UI demo, tablas PostgreSQL y adaptadores sinteticos; sin API keys reales en el MVP. |
| `machiyotl/` | Evidencia, hash, custodia, verificacion y flujo forense. | UI demo, tablas PostgreSQL y evidencia sintetica; API/PWA real pendiente. |
| `chimalli/` | Asistencia legal, RAG, extraccion, test VPMRG asistivo y expediente borrador. | Backend MVP funcional en `/api/v1/chimalli`. |

Regla central: ningun modulo debe asumir decisiones sensibles de otro. Tlachia alerta, Machiyotl preserva, Chimalli orienta; la decision institucional siempre requiere revision humana.
