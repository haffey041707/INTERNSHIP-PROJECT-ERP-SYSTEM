# 03 — Multi-Tenant Architecture

The single most important property of EduNexus: **one institution can never read or write another
institution's data.** We achieve this with **defense in depth** — isolation enforced independently at three
layers, so a bug in any one layer cannot cause a leak.

## 3.1 Tenancy model: Hybrid (pooled by default, isolated on demand)

| Tier | Model | For |
|------|-------|-----|
| **Pooled** (default) | Shared DB · shared schema · `tenant_id` column on every table · Postgres **Row-Level Security** | The vast majority of schools/colleges. Cheapest, easiest to operate at thousands of tenants. |
| **Schema-isolated** | Shared DB · one Postgres schema per tenant | Large universities needing stronger isolation / custom indexes. |
| **Silo** (dedicated) | Dedicated DB / cluster (own region) | Enterprise, government, or strict data-residency contracts. |

A tenant can be **promoted** between tiers without an application rewrite because all data access goes through
the same `TenantContext` + repository layer. The `Tenant.isolationTier` field drives connection routing.

## 3.2 Defense in depth — the three isolation layers

```
            Request
              │
   ┌──────────▼───────────┐  LAYER 1 — Application context
   │ TenancyMiddleware     │  Resolve tenant, reject if missing/mismatched,
   │ + AsyncLocalStorage   │  store TenantContext for the whole request.
   └──────────┬───────────┘
              │
   ┌──────────▼───────────┐  LAYER 2 — ORM guard
   │ Prisma tenant         │  Every query auto-injects `where: { tenantId }`.
   │ extension/middleware  │  Writes auto-stamp tenantId. Cross-tenant id → throw.
   └──────────┬───────────┘
              │
   ┌──────────▼───────────┐  LAYER 3 — Database RLS (the backstop)
   │ Postgres Row-Level    │  `SET app.tenant_id`; policies allow rows only where
   │ Security policies      │  tenant_id = current_setting('app.tenant_id'). Even raw
   └──────────────────────┘  SQL or an ORM bug cannot escape the tenant.
```

### Layer 1 — Tenant resolution
Resolved in priority order:
1. **Custom domain** → `portal.harvard-demo.edu` (mapped in `TenantDomain` table)
2. **Subdomain** → `harvard-demo.edunexus.app`
3. **`X-Institution-Id` header** → `DEMO-001` (mobile/API clients)
4. **JWT claim** `tid` (already-authenticated requests)

If the tenant in the JWT ≠ the tenant in the URL/header → **401 + audit event** (tenant-confusion attempt).

### Layer 2 — Prisma client extension
A Prisma `$extends` query hook injects `tenantId` into every `where`, `create`, `update`, `delete`. Models
flagged `@@map` tenant-scoped are covered; global models (e.g. `Tenant`, `Plan`) are explicitly allow-listed.
See [`apps/api/src/core/prisma/tenant.extension.ts`](../apps/api/src/core/prisma/tenant.extension.ts).

### Layer 3 — Postgres Row-Level Security
```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE students FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON students
  USING      (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
```
The app sets the GUC per request/transaction:
```sql
SET LOCAL app.tenant_id = '....';   -- inside the request transaction
```
The application DB role is **non-superuser** and **cannot bypass RLS** (no `BYPASSRLS`). This is the backstop
that makes isolation provable.

## 3.3 Tenant lifecycle

```
Registration request ──► Super Admin review ──► Approved
        │                                          │
        ▼                                          ▼
  Provisioning job:                         Tenant ACTIVE
   - create Tenant row (status=PROVISIONING) - default roles seeded
   - allocate subdomain + ACM cert           - admin invite emailed
   - seed academic-year, roles, permissions   - branding defaults applied
   - create default fee heads, grading scale
        │
        ▼
  Suspended (non-payment) / Archived (offboarded, data export then purge per retention policy)
```

Provisioning is an **idempotent saga** (BullMQ) so partial failures can be safely retried.

## 3.4 Per-tenant configuration & white-label

Stored in `TenantSettings` (JSONB + typed accessors):
- Branding: logo, favicon, primary/secondary colors, login background → injected as CSS variables (see [doc 07](./07-design-system.md)).
- Locale & timezone, first-day-of-week, grading scheme (GPA/percentage/letter), currency.
- Enabled modules & feature flags (driven by subscription plan).
- Integration credentials (SMS/email/payment providers) stored encrypted in Secrets Manager, referenced by ARN.
- Custom domain + verified TLS cert.

## 3.5 Noisy-neighbor & fairness controls

- **Per-tenant rate limits & quotas** (Redis token bucket keyed by `tenantId`).
- **Connection pooling** via PgBouncer; per-tenant statement timeouts.
- **Queue fairness** — weighted queues so one tenant's bulk import can't starve others.
- **Usage metering** per tenant feeds billing and abuse detection.

## 3.6 Cross-tenant operations (the only legitimate ones)

Only the **Super Admin** service may operate across tenants, and only through a dedicated, heavily-audited
`PlatformService` running under a separate DB role with explicit, logged scope — never through the normal
tenant-scoped path. Examples: aggregate platform analytics, billing reconciliation, global announcements.

## 3.7 Testing isolation (CI gate)

A mandatory CI suite seeds two tenants and asserts:
- Tenant A's JWT cannot read/list/update/delete any Tenant B row (REST + GraphQL).
- Raw SQL under tenant A's role returns zero of tenant B's rows (RLS proof).
- Tenant-confusion (mismatched JWT vs header) is rejected and audited.

No build merges if any isolation test fails.
