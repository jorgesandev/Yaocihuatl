"""Seed Tlachia alerts with realistic synthetic data.

Run inside the backend container:
    docker compose exec backend python scripts/seed_tlachia_alerts.py
"""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

sys.path.insert(0, "/app")

from sqlalchemy import text
from app.db.session import create_session

ANALYST_ID_SQL = text("SELECT id FROM iam.users WHERE username = 'analista'")

ALERTS = [
    {
        "code": "TLA-2026-DEMO-002",
        "person": "Candidata a Diputación Local",
        "platform": "X",
        "risk": "high",
        "score": 85,
        "motive": "Ráfaga coordinada de 42 cuentas con mensajes difamatorios basados en estereotipos de género durante acto de campaña. Patrón detectado por Art. 20 Ter LGAMVLV conducta VIII.",
        "detected": "2026-05-15T22:15:00+00:00",
        "signals": [
            ("burst_activity", "Actividad en ráfaga", "42 menciones en ventana de 30 minutos durante acto de campaña.", 20),
            ("gendered_language", "Lenguaje de género", "Términos del glosario: ['solo es una mujer', 'puta']. Referencia a Art. 20 Ter conducta IX.", 25),
            ("template_similarity", "Similitud de plantilla", "15 textos con hash normalizado similar. Coordinación tipo astroturfing.", 20),
            ("high_reach_thread", "Hilo de alto alcance", "Score de engagement 78 indica alcance viral en plataforma X.", 10),
            ("mention_match", "Mención protegida", "Referencia a etiqueta protegida: Candidata a Diputación Local.", 20),
        ],
        "mentions": [
            ("TLM-DEMO-002A", "X", "Coordinated campaign posting gender-based slurs against the protected candidate during public rally. 42 accounts active in 30-minute window."),
            ("TLM-DEMO-002B", "X", "Template messages with identical structure attacking the candidate's political candidacy using gender stereotypes."),
        ],
    },
    {
        "code": "TLA-2026-DEMO-003",
        "person": "Regidora Municipal",
        "platform": "Facebook",
        "risk": "high",
        "score": 75,
        "motive": "Grupo de Facebook con 18 cuentas distribuyendo contenido denigrante contra regidora municipal. Difamación con estereotipos de género conforme Art. 20 Ter conducta IX LGAMVLV.",
        "detected": "2026-05-15T18:30:00+00:00",
        "signals": [
            ("gendered_language", "Lenguaje de género", "Términos: ['mujer de la casa', 'quédate en casa']. Violencia política en razón de género.", 25),
            ("burst_activity", "Actividad en ráfaga", "28 menciones en ventana de 45 minutos en grupo de Facebook.", 20),
            ("template_similarity", "Similitud de plantilla", "8 textos con estructura idéntica. Campaña coordinada contra la regidora.", 20),
            ("mention_match", "Mención protegida", "Referencia directa a la regidora municipal y su cargo público.", 20),
        ],
        "mentions": [
            ("TLM-DEMO-003A", "Facebook", "Post in local political group attacking the protected person's role as municipal councilwoman using gendered slurs and questioning her capability."),
        ],
    },
    {
        "code": "TLA-2026-DEMO-004",
        "person": "Candidata a Presidencia Municipal",
        "platform": "TikTok",
        "risk": "medium",
        "score": 55,
        "motive": "Comentarios en video de campaña con lenguaje sexista y descalificaciones basadas en estereotipos de género. Criterios TEPJF identifican este patrón como VPMRG digital.",
        "detected": "2026-05-14T16:45:00+00:00",
        "signals": [
            ("gendered_language", "Lenguaje de género", "Términos: ['cocina', 'solo es una mujer']. Patrón de minimización por género.", 25),
            ("burst_activity", "Actividad en ráfaga", "12 menciones en ventana de 2 horas en sección de comentarios.", 20),
            ("high_reach_thread", "Hilo de alto alcance", "Video con 5,200 vistas y comentarios activos. Engagement significativo.", 10),
        ],
        "mentions": [
            ("TLM-DEMO-004A", "TikTok", "Comments on campaign video using gendered language to dismiss the candidate's political aspirations. Multiple accounts repeating similar derogatory patterns."),
        ],
    },
    {
        "code": "TLA-2026-DEMO-005",
        "person": "Funcionaria del IEEBC",
        "platform": "Instagram",
        "risk": "medium",
        "score": 45,
        "motive": "Menciones repetidas en comentarios de publicación oficial con contenido que cuestiona la capacidad de la funcionaria por razones de género. Art. 6 fracc. VIII Ley de Acceso BC.",
        "detected": "2026-05-14T10:20:00+00:00",
        "signals": [
            ("gendered_language", "Lenguaje de género", "Términos: ['las mujeres no sirven']. Referencia directa a estereotipos de género.", 25),
            ("template_similarity", "Similitud de plantilla", "5 comentarios con estructura similar. Patrón de acoso coordinado.", 20),
        ],
        "mentions": [
            ("TLM-DEMO-005A", "Instagram", "Comments on official IEEBC post questioning the protected person's competence based on gender. Pattern suggests coordinated harassment."),
        ],
    },
    {
        "code": "TLA-2026-DEMO-006",
        "person": "Candidata a Diputación Federal",
        "platform": "Reddit",
        "risk": "low",
        "score": 30,
        "motive": "Menciones aisladas en subreddit local con lenguaje potencialmente basado en género. Nivel bajo pero requiere monitoreo. Contexto: 84 denuncias VPMRG en BC (2019-2026).",
        "detected": "2026-05-13T14:00:00+00:00",
        "signals": [
            ("gendered_language", "Lenguaje de género", "Término: ['feminazi']. Uso en contexto político-electoral.", 25),
        ],
        "mentions": [
            ("TLM-DEMO-006A", "Reddit", "Post in local subreddit discussing federal candidacy. One comment uses gendered slur in political context. Single occurrence, low engagement."),
        ],
    },
    {
        "code": "TLA-2026-DEMO-007",
        "person": "Concejala Municipal",
        "platform": "X",
        "risk": "high",
        "score": 90,
        "motive": "Campaña coordinada de 56 cuentas con mensajes difamatorios y amenazas implícitas durante sesión de cabildo. Art. 20 Ter conducta X. Criterios TEPJF 21/2020-VPMRG.",
        "detected": "2026-05-16T08:00:00+00:00",
        "signals": [
            ("burst_activity", "Actividad en ráfaga", "56 menciones en ventana de 20 minutos durante sesión de cabildo.", 20),
            ("gendered_language", "Lenguaje de género", "Términos: ['puta', 'zorra', 'solo es una mujer']. Múltiples violaciones al glosario.", 25),
            ("template_similarity", "Similitud de plantilla", "22 textos con hash normalizado similar. Campaña astroturfing documentada.", 20),
            ("high_reach_thread", "Hilo de alto alcance", "Score 92 indica alcance viral extremo. Múltiples hilos activos.", 10),
            ("mention_match", "Mención protegida", "Referencia directa a concejala y sesión de cabildo en curso.", 20),
            ("prior_alert_context", "Contexto de alerta previa", "La fuente/termino aparece en 2 alertas abiertas previas.", 10),
        ],
        "mentions": [
            ("TLM-DEMO-007A", "X", "Coordinated attack during city council session. 56 accounts posting gendered slurs and sharing personal information of the protected councilwoman."),
            ("TLM-DEMO-007B", "X", "Thread sharing private contact information of the protected person. Violation of Art. 20 Ter conducta X: disclosure of private information."),
        ],
    },
]


def seed(db):
    analyst = db.execute(ANALYST_ID_SQL).first()
    if not analyst:
        print("ERROR: analyst user not found")
        return
    created_by = analyst[0]

    for a in ALERTS:
        exists = db.execute(
            text("SELECT 1 FROM tlachia.alerts WHERE alert_code = :code"),
            {"code": a["code"]},
        ).first()
        if exists:
            print(f"SKIP: {a['code']} already exists")
            continue

        alert_id = uuid4()
        db.execute(
            text("""INSERT INTO tlachia.alerts
                (id, alert_code, protected_person_label, platform, risk_level, risk_score,
                 suggested_status, motive, detected_at, review_status, created_by_id, created_at)
                VALUES (:id, :code, :person, :platform, :risk, :score,
                        'requiere revision humana', :motive, :detected, 'pending_human_review',
                        :created_by, NOW())"""),
            {
                "id": str(alert_id),
                "code": a["code"],
                "person": a["person"],
                "platform": a["platform"],
                "risk": a["risk"],
                "score": a["score"],
                "motive": a["motive"],
                "detected": a["detected"],
                "created_by": str(created_by),
            },
        )

        for st, label, expl, weight in a["signals"]:
            db.execute(
                text("""INSERT INTO tlachia.alert_signals
                    (id, alert_id, signal_type, label, explanation, weight, created_at)
                    VALUES (:id, :alert_id, :stype, :label, :expl, :weight, NOW())"""),
                {
                    "id": str(uuid4()),
                    "alert_id": str(alert_id),
                    "stype": st,
                    "label": label,
                    "expl": expl,
                    "weight": weight,
                },
            )

        for mc, plat, excerpt in a["mentions"]:
            db.execute(
                text("""INSERT INTO tlachia.sanitized_mentions
                    (id, alert_id, mention_code, platform, sanitized_excerpt, occurred_at, metadata)
                    VALUES (:id, :alert_id, :code, :plat, :excerpt, :occurred, '{"synthetic": true}')"""),
                {
                    "id": str(uuid4()),
                    "alert_id": str(alert_id),
                    "code": mc,
                    "plat": plat,
                    "excerpt": excerpt,
                    "occurred": a["detected"],
                },
            )

        print(f"CREATED: {a['code']} ({a['risk']}) - {a['person']}")

    db.commit()
    count = db.execute(text("SELECT COUNT(*) FROM tlachia.alerts")).scalar()
    print(f"\nDone. Total alerts in DB: {count}")


if __name__ == "__main__":
    db = create_session()
    try:
        seed(db)
    finally:
        db.close()
