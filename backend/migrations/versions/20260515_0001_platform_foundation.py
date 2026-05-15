from alembic import op


revision = "20260515_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        CREATE EXTENSION IF NOT EXISTS vector;

        CREATE SCHEMA IF NOT EXISTS iam;
        CREATE SCHEMA IF NOT EXISTS core;
        CREATE SCHEMA IF NOT EXISTS tlachia;
        CREATE SCHEMA IF NOT EXISTS machiyotl;
        CREATE SCHEMA IF NOT EXISTS chimalli;
        CREATE SCHEMA IF NOT EXISTS observatory;
        CREATE SCHEMA IF NOT EXISTS audit;

        CREATE TABLE iam.organizations (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name varchar(160) NOT NULL,
            slug varchar(80) NOT NULL UNIQUE,
            org_type varchar(40) NOT NULL,
            is_demo boolean NOT NULL DEFAULT true,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE iam.roles (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            code varchar(40) NOT NULL UNIQUE,
            label varchar(120) NOT NULL,
            description text NOT NULL DEFAULT '',
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE iam.users (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id uuid REFERENCES iam.organizations(id),
            username varchar(80) NOT NULL UNIQUE,
            display_name varchar(160) NOT NULL,
            email varchar(240),
            password_hash text NOT NULL,
            status varchar(32) NOT NULL DEFAULT 'active',
            is_demo boolean NOT NULL DEFAULT true,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            last_login_at timestamptz
        );

        CREATE TABLE iam.user_roles (
            user_id uuid NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
            role_id uuid NOT NULL REFERENCES iam.roles(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, role_id)
        );

        CREATE TABLE iam.sessions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
            token_jti varchar(96) NOT NULL UNIQUE,
            issued_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            expires_at timestamptz NOT NULL,
            revoked_at timestamptz,
            ip_address varchar(80),
            user_agent text
        );

        CREATE TABLE iam.consents (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
            consent_type varchar(80) NOT NULL,
            status varchar(32) NOT NULL,
            version varchar(40) NOT NULL,
            accepted_at timestamptz,
            revoked_at timestamptz
        );

        CREATE TABLE iam.privacy_preferences (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL UNIQUE REFERENCES iam.users(id) ON DELETE CASCADE,
            notification_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
            retention_days integer NOT NULL DEFAULT 180,
            share_with_authority boolean NOT NULL DEFAULT false,
            allow_research_aggregation boolean NOT NULL DEFAULT true,
            updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE core.cases (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            case_code varchar(40) NOT NULL UNIQUE,
            protected_user_id uuid REFERENCES iam.users(id),
            current_owner_id uuid REFERENCES iam.users(id),
            status varchar(40) NOT NULL,
            priority varchar(20) NOT NULL,
            title varchar(180) NOT NULL,
            narrative_summary text NOT NULL,
            data_classification varchar(40) NOT NULL DEFAULT 'synthetic_demo',
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE core.case_assignments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            case_id uuid NOT NULL REFERENCES core.cases(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES iam.users(id),
            role_in_case varchar(40) NOT NULL,
            assigned_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            unassigned_at timestamptz,
            CONSTRAINT uq_case_assignment_role UNIQUE (case_id, user_id, role_in_case)
        );

        CREATE TABLE core.case_status_history (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            case_id uuid NOT NULL REFERENCES core.cases(id) ON DELETE CASCADE,
            from_status varchar(40),
            to_status varchar(40) NOT NULL,
            actor_user_id uuid REFERENCES iam.users(id),
            reason text NOT NULL DEFAULT '',
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE tlachia.alerts (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            case_id uuid REFERENCES core.cases(id),
            alert_code varchar(40) NOT NULL UNIQUE,
            protected_person_label varchar(120) NOT NULL,
            platform varchar(80) NOT NULL,
            risk_level varchar(20) NOT NULL,
            risk_score numeric(5,2) NOT NULL,
            suggested_status varchar(80) NOT NULL,
            motive text NOT NULL,
            detected_at timestamptz NOT NULL,
            review_status varchar(40) NOT NULL,
            created_by_id uuid REFERENCES iam.users(id),
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE tlachia.alert_signals (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            alert_id uuid NOT NULL REFERENCES tlachia.alerts(id) ON DELETE CASCADE,
            signal_type varchar(80) NOT NULL,
            label varchar(160) NOT NULL,
            explanation text NOT NULL,
            weight numeric(5,2) NOT NULL,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE tlachia.sanitized_mentions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            alert_id uuid NOT NULL REFERENCES tlachia.alerts(id) ON DELETE CASCADE,
            mention_code varchar(60) NOT NULL UNIQUE,
            platform varchar(80) NOT NULL,
            sanitized_excerpt text NOT NULL,
            occurred_at timestamptz NOT NULL,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb
        );

        CREATE TABLE tlachia.clusters (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            cluster_code varchar(40) NOT NULL UNIQUE,
            label varchar(160) NOT NULL,
            platform varchar(80) NOT NULL,
            coordination_pattern text NOT NULL,
            risk_level varchar(20) NOT NULL,
            account_count integer NOT NULL,
            message_count integer NOT NULL,
            detected_at timestamptz NOT NULL
        );

        CREATE TABLE tlachia.cluster_alerts (
            cluster_id uuid NOT NULL REFERENCES tlachia.clusters(id) ON DELETE CASCADE,
            alert_id uuid NOT NULL REFERENCES tlachia.alerts(id) ON DELETE CASCADE,
            PRIMARY KEY (cluster_id, alert_id)
        );

        CREATE TABLE machiyotl.evidence_items (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            case_id uuid REFERENCES core.cases(id),
            owner_user_id uuid REFERENCES iam.users(id),
            evidence_code varchar(40) NOT NULL UNIQUE,
            evidence_type varchar(60) NOT NULL,
            platform varchar(80),
            source_url text,
            local_file_path text,
            original_filename varchar(240),
            mime_type varchar(120),
            size_bytes integer,
            sha256_hash varchar(128) NOT NULL UNIQUE,
            short_hash varchar(24) NOT NULL,
            status varchar(40) NOT NULL,
            privacy_state varchar(40) NOT NULL,
            captured_at timestamptz NOT NULL,
            sealed_at timestamptz,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE machiyotl.evidence_notes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            evidence_id uuid NOT NULL REFERENCES machiyotl.evidence_items(id) ON DELETE CASCADE,
            author_user_id uuid REFERENCES iam.users(id),
            note text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE machiyotl.custody_events (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            evidence_id uuid NOT NULL REFERENCES machiyotl.evidence_items(id) ON DELETE CASCADE,
            actor_user_id uuid REFERENCES iam.users(id),
            event_type varchar(80) NOT NULL,
            event_label varchar(160) NOT NULL,
            event_hash varchar(128),
            occurred_at timestamptz NOT NULL,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb
        );

        CREATE TABLE machiyotl.hash_verifications (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            evidence_id uuid REFERENCES machiyotl.evidence_items(id),
            submitted_hash varchar(128) NOT NULL,
            result varchar(40) NOT NULL,
            verified_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE chimalli.cases (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            core_case_id uuid REFERENCES core.cases(id),
            chimalli_case_code varchar(40) NOT NULL UNIQUE,
            protected_user_id uuid REFERENCES iam.users(id),
            status varchar(40) NOT NULL,
            narrative text NOT NULL,
            human_review_notice text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE chimalli.messages (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            chimalli_case_id uuid NOT NULL REFERENCES chimalli.cases(id) ON DELETE CASCADE,
            sender_type varchar(40) NOT NULL,
            content text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE chimalli.extractions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            chimalli_case_id uuid NOT NULL REFERENCES chimalli.cases(id) ON DELETE CASCADE,
            extraction_type varchar(80) NOT NULL,
            payload jsonb NOT NULL DEFAULT '{}'::jsonb,
            confidence numeric(5,2),
            editable boolean NOT NULL DEFAULT true,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE chimalli.vpmrg_tests (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            chimalli_case_id uuid NOT NULL REFERENCES chimalli.cases(id) ON DELETE CASCADE,
            overall_result varchar(80) NOT NULL,
            confidence varchar(40) NOT NULL,
            elements jsonb NOT NULL DEFAULT '{}'::jsonb,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE chimalli.routing_suggestions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            chimalli_case_id uuid NOT NULL REFERENCES chimalli.cases(id) ON DELETE CASCADE,
            suggested_authority varchar(160) NOT NULL,
            procedure varchar(160) NOT NULL,
            reason text NOT NULL,
            alternatives jsonb NOT NULL DEFAULT '[]'::jsonb,
            status varchar(40) NOT NULL,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE chimalli.rag_sources (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            source_code varchar(80) NOT NULL UNIQUE,
            source_file varchar(260) NOT NULL,
            collection varchar(120) NOT NULL,
            document_type varchar(60) NOT NULL,
            jurisdiction varchar(120) NOT NULL,
            institution varchar(120) NOT NULL,
            page integer NOT NULL,
            excerpt text NOT NULL,
            score numeric(8,4) NOT NULL,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            embedding vector(1536),
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE chimalli.case_rag_sources (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            chimalli_case_id uuid NOT NULL REFERENCES chimalli.cases(id) ON DELETE CASCADE,
            rag_source_id uuid NOT NULL REFERENCES chimalli.rag_sources(id) ON DELETE CASCADE,
            ranking integer NOT NULL,
            CONSTRAINT uq_chimalli_case_rag_source UNIQUE (chimalli_case_id, rag_source_id)
        );

        CREATE TABLE chimalli.llm_interaction_logs (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            chimalli_case_id uuid REFERENCES chimalli.cases(id),
            provider varchar(80) NOT NULL,
            model varchar(160) NOT NULL,
            prompt_version varchar(80) NOT NULL,
            request_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            response_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            demo_mode boolean NOT NULL DEFAULT true,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE TABLE observatory.aggregate_metrics (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            metric_date date NOT NULL,
            metric_type varchar(80) NOT NULL,
            dimension varchar(80) NOT NULL,
            dimension_value varchar(120) NOT NULL,
            count_value integer NOT NULL,
            k_anonymity_threshold integer NOT NULL,
            is_publishable boolean NOT NULL,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
            CONSTRAINT uq_observatory_metric_dimension UNIQUE (metric_date, metric_type, dimension, dimension_value)
        );

        CREATE TABLE audit.audit_log (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            actor_user_id uuid REFERENCES iam.users(id),
            action varchar(120) NOT NULL,
            entity_schema varchar(80),
            entity_table varchar(80),
            entity_id varchar(120),
            outcome varchar(40) NOT NULL,
            ip_address varchar(80),
            user_agent text,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
        );

        CREATE INDEX ix_iam_users_status ON iam.users (status);
        CREATE INDEX ix_iam_sessions_user_active ON iam.sessions (user_id, expires_at) WHERE revoked_at IS NULL;
        CREATE INDEX ix_core_cases_status_priority ON core.cases (status, priority);
        CREATE INDEX ix_core_case_assignments_user ON core.case_assignments (user_id, unassigned_at);
        CREATE INDEX ix_tlachia_alerts_review_risk ON tlachia.alerts (review_status, risk_level, detected_at DESC);
        CREATE INDEX ix_tlachia_mentions_alert ON tlachia.sanitized_mentions (alert_id, occurred_at DESC);
        CREATE INDEX ix_machiyotl_evidence_case_status ON machiyotl.evidence_items (case_id, status);
        CREATE INDEX ix_machiyotl_custody_evidence_time ON machiyotl.custody_events (evidence_id, occurred_at);
        CREATE INDEX ix_chimalli_cases_core_status ON chimalli.cases (core_case_id, status);
        CREATE INDEX ix_chimalli_messages_case_time ON chimalli.messages (chimalli_case_id, created_at);
        CREATE INDEX ix_chimalli_rag_collection ON chimalli.rag_sources (collection, document_type);
        CREATE INDEX ix_observatory_metrics_publishable ON observatory.aggregate_metrics (metric_date, metric_type) WHERE is_publishable IS TRUE;
        CREATE INDEX ix_audit_log_actor_time ON audit.audit_log (actor_user_id, created_at DESC);
        CREATE INDEX ix_audit_log_action_time ON audit.audit_log (action, created_at DESC);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP SCHEMA IF EXISTS audit CASCADE;
        DROP SCHEMA IF EXISTS observatory CASCADE;
        DROP SCHEMA IF EXISTS chimalli CASCADE;
        DROP SCHEMA IF EXISTS machiyotl CASCADE;
        DROP SCHEMA IF EXISTS tlachia CASCADE;
        DROP SCHEMA IF EXISTS core CASCADE;
        DROP SCHEMA IF EXISTS iam CASCADE;
        """
    )
