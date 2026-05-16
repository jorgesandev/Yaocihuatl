from alembic import op


revision = "20260516_0003"
down_revision = "20260516_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE tlachia.sources
            ALTER COLUMN source_type SET DEFAULT 'synthetic',
            ALTER COLUMN query_terms SET DEFAULT '[]'::jsonb,
            ALTER COLUMN protected_labels SET DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS platform varchar(40),
            ADD COLUMN IF NOT EXISTS scenario varchar(120),
            ADD COLUMN IF NOT EXISTS fixture_file varchar(260);

        UPDATE tlachia.sources
        SET source_type = 'synthetic'
        WHERE source_type = 'reddit';

        UPDATE tlachia.sources
        SET query_terms = '[]'::jsonb
        WHERE query_terms = '{}'::jsonb;

        UPDATE tlachia.sources
        SET protected_labels = '[]'::jsonb
        WHERE protected_labels = '{}'::jsonb;

        ALTER TABLE tlachia.ingestion_runs
            ALTER COLUMN provider SET DEFAULT 'synthetic',
            ADD COLUMN IF NOT EXISTS platform varchar(40),
            ADD COLUMN IF NOT EXISTS scenario varchar(120);

        UPDATE tlachia.ingestion_runs
        SET provider = 'synthetic'
        WHERE provider = 'reddit';

        DROP INDEX IF EXISTS tlachia.ix_tlachia_reddit_items_source_id;
        DROP INDEX IF EXISTS tlachia.ix_tlachia_reddit_items_occurred_at;
        DROP INDEX IF EXISTS tlachia.ix_tlachia_reddit_items_fullname;

        ALTER TABLE IF EXISTS tlachia.reddit_items RENAME TO platform_items;

        ALTER TABLE tlachia.platform_items
            RENAME COLUMN reddit_fullname TO synthetic_id;
        ALTER TABLE tlachia.platform_items
            RENAME COLUMN permalink TO source_url;
        ALTER TABLE tlachia.platform_items
            RENAME COLUMN item_type TO source_kind;

        ALTER TABLE tlachia.platform_items
            ADD COLUMN IF NOT EXISTS platform varchar(40),
            DROP COLUMN IF EXISTS subreddit,
            DROP COLUMN IF EXISTS content_deleted_at;

        ALTER TABLE tlachia.platform_items
            ALTER COLUMN synthetic_id TYPE varchar(120);

        UPDATE tlachia.platform_items
        SET platform = COALESCE(platform, 'reddit');

        ALTER TABLE tlachia.platform_items
            ALTER COLUMN platform SET NOT NULL;

        ALTER TABLE tlachia.platform_items
            DROP CONSTRAINT IF EXISTS reddit_items_reddit_fullname_key;
        ALTER TABLE tlachia.platform_items
            DROP CONSTRAINT IF EXISTS platform_items_reddit_fullname_key;
        ALTER TABLE tlachia.platform_items
            DROP CONSTRAINT IF EXISTS platform_items_synthetic_id_key;

        CREATE UNIQUE INDEX IF NOT EXISTS ix_tlachia_platform_items_synthetic_id
            ON tlachia.platform_items (synthetic_id);
        CREATE INDEX IF NOT EXISTS ix_tlachia_platform_items_occurred_at
            ON tlachia.platform_items (occurred_at);
        CREATE INDEX IF NOT EXISTS ix_tlachia_platform_items_source_id
            ON tlachia.platform_items (source_id);
        CREATE INDEX IF NOT EXISTS ix_tlachia_sources_platform_status
            ON tlachia.sources (platform, status);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP INDEX IF EXISTS tlachia.ix_tlachia_sources_platform_status;
        DROP INDEX IF EXISTS tlachia.ix_tlachia_platform_items_source_id;
        DROP INDEX IF EXISTS tlachia.ix_tlachia_platform_items_occurred_at;
        DROP INDEX IF EXISTS tlachia.ix_tlachia_platform_items_synthetic_id;

        ALTER TABLE tlachia.platform_items
            ADD COLUMN IF NOT EXISTS subreddit varchar(120),
            ADD COLUMN IF NOT EXISTS content_deleted_at timestamptz;

        ALTER TABLE tlachia.platform_items
            RENAME COLUMN source_kind TO item_type;
        ALTER TABLE tlachia.platform_items
            RENAME COLUMN source_url TO permalink;
        ALTER TABLE tlachia.platform_items
            RENAME COLUMN synthetic_id TO reddit_fullname;

        ALTER TABLE IF EXISTS tlachia.platform_items RENAME TO reddit_items;

        ALTER TABLE tlachia.ingestion_runs
            DROP COLUMN IF EXISTS scenario,
            DROP COLUMN IF EXISTS platform,
            ALTER COLUMN provider SET DEFAULT 'reddit';

        ALTER TABLE tlachia.sources
            DROP COLUMN IF EXISTS fixture_file,
            DROP COLUMN IF EXISTS scenario,
            DROP COLUMN IF EXISTS platform,
            ALTER COLUMN protected_labels SET DEFAULT '{}'::jsonb,
            ALTER COLUMN query_terms SET DEFAULT '{}'::jsonb,
            ALTER COLUMN source_type SET DEFAULT 'reddit';

        CREATE UNIQUE INDEX IF NOT EXISTS ix_tlachia_reddit_items_fullname
            ON tlachia.reddit_items (reddit_fullname);
        CREATE INDEX IF NOT EXISTS ix_tlachia_reddit_items_occurred_at
            ON tlachia.reddit_items (occurred_at);
        CREATE INDEX IF NOT EXISTS ix_tlachia_reddit_items_source_id
            ON tlachia.reddit_items (source_id);
        """
    )
