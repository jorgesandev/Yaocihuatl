"""Runner controlado para ingesta sintetica de Tlachia.

Uso:
    python -m app.services.tlachia.run_synthetic_ingestion --scenario campaign-burst-demo
    python -m app.services.tlachia.run_synthetic_ingestion --platform x --platform tiktok
"""

from __future__ import annotations

import argparse

from app.db.session import create_session
from app.services.tlachia.ingestion_service import IngestionError, IngestionService


def main() -> None:
    parser = argparse.ArgumentParser(description="Ejecutar ingesta sintetica controlada para Tlachia.")
    parser.add_argument("--scenario", default="campaign-burst-demo")
    parser.add_argument("--platform", action="append", dest="platforms")
    args = parser.parse_args()

    with create_session() as db:
        svc = IngestionService(db)
        try:
            runs = svc.run_synthetic_ingestion(platforms=args.platforms, scenario=args.scenario)
        except IngestionError as exc:
            raise SystemExit(f"Error de ingesta: {exc}") from exc
        for run in runs:
            print(
                f"run_id={run.id} platform={run.platform} status={run.status} "
                f"seen={run.items_seen} stored={run.items_stored} alerts={run.alerts_created}"
            )


if __name__ == "__main__":
    main()
