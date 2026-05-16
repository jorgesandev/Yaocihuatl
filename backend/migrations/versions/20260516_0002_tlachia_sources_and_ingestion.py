from alembic import op


revision = "20260516_0002"
down_revision = "20260515_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE tlachia.sources (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            source_type varchar(40) NOT NULL DEFAULT 'reddit',
            name varchar(160) NOT NULL,
            subreddit varchar(120),
            query_terms jsonb NOT NULL DEFAULT '{}',
            protected_labels jsonb NOT NULL DEFAULT '{}',
            status varchar(40) NOT NULL DEFAULT 'active',
            polling_interval_minutes integer,
            last_ingested_at timestamptz,
            created_by_id uuid REFERENCES iam.users(id),
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE tlachia.ingestion_runs (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            source_id uuid REFERENCES tlachia.sources(id),
            provider varchar(40) NOT NULL DEFAULT 'reddit',
            status varchar(40) NOT NULL DEFAULT 'started',
            started_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            finished_at timestamptz,
            items_seen integer,
            items_stored integer,
            alerts_created integer,
            rate_limit_used numeric,
            rate_limit_remaining numeric,
            rate_limit_reset_seconds integer,
            error_message text,
            created_by_id uuid REFERENCES iam.users(id)
        );

        CREATE TABLE tlachia.reddit_items (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            source_id uuid REFERENCES tlachia.sources(id),
            reddit_fullname varchar(80) NOT NULL UNIQUE,
            subreddit varchar(120),
            permalink text,
            item_type varchar(40) NOT NULL,
            author_hash varchar(128),
            sanitized_excerpt text,
            occurred_at timestamptz,
            content_deleted_at timestamptz,
            metadata jsonb NOT NULL DEFAULT '{}',
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE INDEX ix_tlachia_sources_status ON tlachia.sources (status);
        CREATE INDEX ix_tlachia_reddit_items_fullname ON tlachia.reddit_items (reddit_fullname);
        CREATE INDEX ix_tlachia_reddit_items_occurred_at ON tlachia.reddit_items (occurred_at);
        CREATE INDEX ix_tlachia_reddit_items_source_id ON tlachia.reddit_items (source_id);
        CREATE INDEX ix_tlachia_ingestion_runs_source_status ON tlachia.ingestion_runs (source_id, status);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP INDEX IF EXISTS ix_tlachia_ingestion_runs_source_status;
        DROP INDEX IF EXISTS ix_tlachia_reddit_items_source_id;
        DROP INDEX IF EXISTS ix_tlachia_reddit_items_occurred_at;
        DROP INDEX IF EXISTS ix_tlachia_reddit_items_fullname;
        DROP INDEX IF EXISTS ix_tlachia_sources_status;

        DROP TABLE IF EXISTS tlachia.reddit_items;
        DROP TABLE IF EXISTS tlachia.ingestion_runs;
        DROP TABLE IF EXISTS tlachia.sources;
        """
    )
