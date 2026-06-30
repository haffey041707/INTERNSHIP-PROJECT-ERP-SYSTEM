# 15 — Enterprise-Grade Implementation Plan

How to actually build and operate EduNexus: team, standards, workflow, environments, and a module-by-module
build checklist. Pairs with the [roadmap](./13-roadmap.md).

## 15.1 Team & ownership

| Squad | Owns |
|-------|------|
| **Platform** | Tenancy, auth, RBAC, audit, billing, infra, observability, the `core/` package |
| **Academics** | Students, academics, timetable, exams, LMS |
| **Operations** | Finance, HR/payroll, library, transport, hostel |
| **Engagement** | Communication, notifications, parent/student portals, mobile |
| **Intelligence** | AI gateway, ML, analytics/BI |
| **Design Systems** | Nexus DS, accessibility, web+mobile consistency |
| **SRE/Security** | Reliability, security, compliance, on-call |

Each feature module has a DRI; the Platform squad guards the cross-cutting `core/` so isolation/RBAC stay
uniform.

## 15.2 Engineering standards

- **Language**: TypeScript end-to-end (strict mode); Dart for mobile.
- **Definition of Done**: code + tests (unit/integration, incl. isolation) + docs + Storybook (UI) + a11y pass +
  observability (logs/metrics/traces) + migration (expand/contract) + feature-flagged.
- **Branching**: trunk-based, short-lived branches, PRs require 1–2 reviews + green CI + no isolation-test
  failures.
- **Testing pyramid**: many unit, focused integration (with a real Postgres via testcontainers, RLS on), few
  e2e (Playwright). Mandatory **cross-tenant isolation tests** per module.
- **Quality gates**: lint, typecheck, coverage threshold, SAST (CodeQL/Semgrep), secret scan (gitleaks),
  dependency audit, container scan (Trivy), bundle-size budget, Lighthouse/a11y budget.
- **Code style**: shared eslint/prettier from `packages/config`; conventional commits; changesets for versioning.

## 15.3 Environments & data

| Env | Data | Access |
|-----|------|--------|
| dev (local) | synthetic seed (`pnpm seed`) | engineers |
| staging | anonymized/synthetic multi-tenant | team + design partners |
| prod | real | least-privilege, audited, break-glass only |

No real PII outside prod. Migrations run via CI with dry-run on staging first.

## 15.4 Module build checklist (apply to every feature module)

```
[ ] Domain model + Prisma models (tenant_id, RLS policy, indexes)
[ ] Migration (expand/contract, reversible)
[ ] Repository (tenant-scoped via PrismaService extension)
[ ] Service (use-cases, transactions, emits domain events)
[ ] REST controller + DTOs (class-validator) + OpenAPI annotations
[ ] GraphQL resolver + DataLoader (if dashboard needs it)
[ ] RBAC permissions defined + guard wired (@Permissions)
[ ] Audit on all mutations
[ ] Events + worker handlers (notifications/analytics/AI) if applicable
[ ] Web: feature folder (queries, components from packages/ui), wired to AppShell nav by role+flag
[ ] Mobile: feature (if in scope) with offline support
[ ] Tests: unit + integration + cross-tenant isolation + e2e happy path
[ ] Observability: structured logs, metrics, traces
[ ] Feature flag + plan gating
[ ] Docs + Storybook stories
```

## 15.5 Reference build order (dependencies)

```
core (tenancy, auth, rbac, audit, prisma)            ← everything depends on this
  └─ institution setup (academic years, campuses, classes/sections)
       └─ users & roles UI
            ├─ students (admissions → enrollment)
            │    ├─ attendance
            │    ├─ exams/results
            │    └─ lms
            ├─ finance (fees → payments)
            ├─ hr/payroll
            └─ library / transport / hostel
  communication & notifications (cross-cutting, built alongside)
  reporting/BI (reads from above)
  ai gateway + assistants (reads from above, last)
```

## 15.6 Operational readiness (per release)

- SLOs defined + dashboards + alerts wired (RED/USE, per-tenant).
- Runbooks: deploy, rollback, incident, DR, tenant provisioning/offboarding.
- Load test at expected peak + 2x; chaos test (pod/AZ kill) on staging.
- Backup restore tested; PITR verified.
- Security review + threat model updated; pen-test before major GA.
- On-call rotation + PagerDuty + escalation policy.

## 15.7 Governance & compliance workstream (parallel)

- Data classification + PII inventory maintained.
- DPA templates, sub-processor list, consent & retention config per tenant.
- GDPR/FERPA request handling (access/erasure/portability) automated + audited.
- SOC 2 controls evidenced continuously (access reviews, change mgmt, monitoring).
- Accessibility audit (WCAG 2.1 AA) before each portal GA.

## 15.8 Risk register (top items)

| Risk | Mitigation |
|------|-----------|
| Cross-tenant data leak | 3-layer isolation + mandatory CI isolation tests + RLS backstop |
| DB scale ceiling | Pooling, replicas, partitioning, **tenant sharding** (designed-in) |
| AI hallucination/misuse | RAG grounding, guardrails, human-in-the-loop, audit |
| Vendor lock-in | Model-agnostic AI gateway; standard Postgres/Redis/S3; IaC portable |
| Scope creep | Phased roadmap, feature flags, plan-gated modules |
| Compliance gaps | Compliance workstream from day 1, not bolted on |

## 15.9 What's in this repo vs. what's next

**Delivered now**: complete architecture (15 docs), monorepo skeleton, runnable multi-tenant **core**
(tenancy + RLS + auth + RBAC + audit), Prisma schema, web design-system foundation + sample dashboard, Docker
local stack, CI. **Next**: implement feature modules following §15.4 in the §15.5 order. The hard, get-it-wrong-once
parts (isolation, auth, RBAC, schema, design system) are done — feature work is now repeatable and parallelizable.
