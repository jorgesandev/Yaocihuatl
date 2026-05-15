CREATE EXTENSION IF NOT EXISTS vector;

ALTER SYSTEM SET max_connections = '100';
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET idle_session_timeout = '10min';
