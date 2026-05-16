from alembic import op


revision = "20260515_0002_chimalli"
down_revision = "20260515_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE chimalli.attachments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            chimalli_case_id uuid REFERENCES chimalli.cases(id) ON DELETE CASCADE,
            attachment_code varchar(40) NOT NULL UNIQUE,
            file_name varchar(240) NOT NULL,
            mime_type varchar(120) NOT NULL,
            size_bytes integer NOT NULL,
            sha256_hash varchar(128) NOT NULL,
            local_file_path text,
            extracted_text text,
            visual_summary text,
            visual_analysis_json jsonb NOT NULL DEFAULT '{}'::jsonb,
            status varchar(40) NOT NULL DEFAULT 'uploaded_unverified',
            warning text NOT NULL DEFAULT 'Adjunto no verificado; requiere revision humana.',
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE INDEX ix_chimalli_attachments_case ON chimalli.attachments (chimalli_case_id);
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS chimalli.attachments;")
