-- LAYER 3 — Postgres Row-Level Security (the isolation backstop).
-- Run after `prisma migrate`. Applies a tenant_isolation policy to every
-- tenant-scoped table. The app connects as a NON-superuser role WITHOUT BYPASSRLS,
-- so even raw SQL or an ORM bug cannot read another tenant's rows.
--
-- The application sets the GUC per operation:  SET app.tenant_id = '<uuid>';

-- 1) Create a least-privilege application role (run once, as admin).
--    DO NOT grant BYPASSRLS or SUPERUSER.
-- CREATE ROLE edunexus_app LOGIN PASSWORD 'app_password';
-- GRANT CONNECT ON DATABASE edunexus TO edunexus_app;
-- GRANT USAGE ON SCHEMA public TO edunexus_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO edunexus_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO edunexus_app;

-- 2) Helper: apply RLS to a tenant-scoped table.
CREATE OR REPLACE FUNCTION apply_tenant_rls(tbl regclass) RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', tbl);
  EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %s', tbl);
  EXECUTE format($f$
    CREATE POLICY tenant_isolation ON %s
      USING      (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid)
  $f$, tbl);
END;
$$ LANGUAGE plpgsql;

-- 3) Apply to every tenant-scoped table.
SELECT apply_tenant_rls('tenant_settings');
SELECT apply_tenant_rls('tenant_domains');
SELECT apply_tenant_rls('users');
SELECT apply_tenant_rls('roles');
SELECT apply_tenant_rls('user_roles');
SELECT apply_tenant_rls('role_permissions');
SELECT apply_tenant_rls('sessions');
SELECT apply_tenant_rls('audit_logs');
SELECT apply_tenant_rls('sections');
SELECT apply_tenant_rls('students');
-- ... extend for each new tenant-scoped table created by feature modules.

-- audit_logs are append-only: block UPDATE/DELETE even for the app role.
REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;
