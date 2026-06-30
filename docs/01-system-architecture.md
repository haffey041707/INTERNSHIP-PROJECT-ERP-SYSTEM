# 01 — System Architecture

EduNexus is a **cloud-native, multi-tenant, microservices-ready** SaaS ERP. It starts as a well-modularized
**modular monolith** (fastest path to a coherent product) with clean service boundaries so individual modules
can be split into independent services as scale demands — without rewrites.

## 1.1 High-level architecture

```
                                   ┌──────────────────────────────────────────────┐
                                   │                  CLIENTS                       │
   Web (Next.js)   Mobile (Flutter)   Public Website   3rd-party API consumers      │
        │                │                  │                  │                     │
        └────────────────┴───────┬──────────┴──────────────────┘                     │
                                  ▼                                                   │
                      ┌───────────────────────┐   AWS CloudFront (CDN) + WAF + Shield │
                      │   API GATEWAY / BFF    │   Rate limiting · TLS · Tenant routing│
                      │  (NestJS + Apollo GW)  │                                       │
                      └───────────┬───────────┘                                       │
                                  ▼                                                   │
   ┌───────────────────────────────────────────────────────────────────────────────┐│
   │                       APPLICATION / DOMAIN SERVICES                              ││
   │  Identity & Auth │ Tenancy │ RBAC │ Students │ Academics │ Attendance │ Exams    ││
   │  LMS │ Finance │ HR/Payroll │ Library │ Transport │ Hostel │ Communication       ││
   │  Notifications │ Reporting/BI │ AI Gateway │ Files │ Audit │ Billing/Subscriptions││
   └───────┬───────────────┬──────────────┬───────────────┬──────────────┬──────────┘│
           ▼               ▼              ▼               ▼              ▼              │
   ┌────────────┐  ┌──────────────┐ ┌───────────┐ ┌──────────────┐ ┌─────────────┐    │
   │ PostgreSQL │  │   Redis 7    │ │ OpenSearch│ │   AWS S3      │ │  pgvector   │    │
   │ (RLS, RW + │  │ cache/queue/ │ │ search +  │ │ documents/    │ │ embeddings  │    │
   │  replicas) │  │ sessions     │ │ log index │ │ media         │ │ for RAG     │    │
   └────────────┘  └──────────────┘ └───────────┘ └──────────────┘ └─────────────┘    │
           ▲                                                                           │
           │  Async: BullMQ / SQS + EventBridge (domain events)                         │
   ┌───────┴──────────────────────────────────────────────────────────────────────┐  │
   │  WORKERS: notifications, grading, report-gen, AI inference, billing, imports    │  │
   └──────────────────────────────────────────────────────────────────────────────┘  │
                                                                                       │
   Observability: OpenTelemetry → Prometheus/Grafana, Loki, Tempo, Sentry             │
   Secrets: AWS Secrets Manager / KMS   |   IaC: Terraform   |   Orchestration: EKS    │
   └───────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Architectural style & rationale

| Decision | Choice | Why |
|----------|--------|-----|
| Service topology | **Modular monolith → microservices** | Ship a coherent product fast; extract hot services (Notifications, AI, Reporting, Exams) later behind the same contracts. |
| Tenancy model | **Shared DB + shared schema + `tenant_id` + Postgres RLS** | Best cost/scale for thousands of tenants; RLS gives DB-level isolation. Large/enterprise tenants can be promoted to a dedicated schema/DB (hybrid). See [doc 03](./03-multi-tenant-architecture.md). |
| Sync vs async | **Sync for reads/commands, async events for side-effects** | Keeps request latency low; notifications, grading, AI, reports run on workers. |
| API | **REST (primary) + GraphQL (aggregation/BFF) + WebSockets (realtime)** | REST for CRUD & integrations, GraphQL for dashboard data-fetching, WS for live attendance/chat. |
| Cache | **Redis** for hot reads, sessions, rate-limit, queues | Sub-ms reads, horizontal scale. |

## 1.3 Logical layers (per service / module)

```
Controller (REST) / Resolver (GraphQL)   ← transport, validation (DTOs/Zod)
        │
Application Service (use-cases)          ← orchestration, transactions, events
        │
Domain (entities, policies, RBAC checks) ← business rules, invariants
        │
Repository (Prisma)                      ← data access, tenant scoping
        │
PostgreSQL (RLS) · Redis · S3 · events
```

Every inbound request carries a **TenantContext** (`tenantId`, `userId`, `roles`, `permissions`, `locale`,
`requestId`) resolved by middleware and propagated through async-local-storage so repositories and the audit
trail are tenant-aware automatically.

## 1.4 Core cross-cutting subsystems

- **Tenancy** — resolves tenant from subdomain/custom-domain/`X-Institution-Id`/JWT; sets `app.tenant_id` GUC for RLS.
- **Identity & Auth** — multi-strategy login (Institution ID, email, username, OTP, Google, Microsoft), MFA, sessions, device mgmt. See [doc 09](./09-security-architecture.md).
- **RBAC/ABAC** — roles, granular permissions, scopes (campus/department), feature flags per plan.
- **Audit** — append-only audit log of every mutation (who/what/when/before/after/ip/device).
- **Notifications** — unified email/SMS/push/in-app with templating, throttling, per-tenant providers.
- **AI Gateway** — model-agnostic LLM access with per-tenant guardrails, RAG, cost metering. See [doc 12](./12-ai-architecture.md).
- **Billing** — subscription plans, metered usage, invoices, dunning (Stripe + regional gateways).
- **Reporting/BI** — read-replica + materialized views + OLAP exports.

## 1.5 Request lifecycle (example: mark attendance)

```
POST /api/v1/attendance  (X-Institution-Id: DEMO-001, Bearer <JWT>)
 1. WAF/CDN  → 2. API Gateway (rate limit, TLS)
 3. TenancyMiddleware resolves tenant → AsyncLocalStorage + SET app.tenant_id
 4. AuthGuard verifies JWT + session  → 5. RbacGuard checks `attendance:create`
 6. DTO validation (class-validator/Zod)
 7. AttendanceService.markBulk() in a tenant-scoped transaction
 8. Emit `attendance.recorded` event → BullMQ
 9. AuditInterceptor writes immutable record
10. Response 201
   Workers: notify parents of absentees · update analytics rollups · AI risk-flag chronic absentees
```

## 1.6 Quality attributes targeted

| Attribute | Target |
|-----------|--------|
| Availability | 99.95% (multi-AZ, rolling deploys, graceful drain) |
| p95 API latency | < 250 ms for reads, < 500 ms for writes |
| Tenant isolation | Zero cross-tenant data exposure (RLS + app guard + tests) |
| Scale | 10k+ tenants, 1M+ users, see [doc 14](./14-scalability.md) |
| RPO / RTO | RPO ≤ 5 min (PITR), RTO ≤ 30 min |
| Compliance | GDPR, FERPA, SOC 2-ready, data residency by region |
