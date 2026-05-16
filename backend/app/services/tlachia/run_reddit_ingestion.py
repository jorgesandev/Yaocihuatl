"""Runner controlado para ingesta Reddit.

Uso:
    python -m app.services.tlachia.run_reddit_ingestion --source-id <uuid>
    python -m app.services.tlachia.run_reddit_ingestion --help
"""

from __future__ import annotations

import argparse
import sys
from uuid import UUID

from app.db.session import create_session
from app.services.tlachia.ingestion_service import IngestionError, IngestionService


def main() -> int:
    parser = argparse.ArgumentParser(description="Ejecutar ingesta controlada de Reddit para Tlachia.")
    parser.add_argument("--source-id", required=True, type=UUID, help="UUID de la fuente Reddit")
    args = parser.parse_args()

    with create_session() as db:
        svc = IngestionService(db)
        try:
            run = svc.run_reddit_ingestion(source_id=args.source_id)
            print(f"Corrida finalizada: {run.id}")
            print(f"Estado: {run.status}")
            print(f"Items vistos: {run.items_seen}")
            print(f"Items guardados: {run.items_stored}")
            print(f"Alertas creadas: {run.alerts_created}")
            if run.error_message:
                print(f"Error: {run.error_message}")
                return 1
        except IngestionError as exc:
            print(f"Error: {exc}", file=sys.stderr)
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
