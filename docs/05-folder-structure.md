# 05 — Folder Structure

A **pnpm + Turborepo** monorepo. Apps and shared packages live together so types and tokens are shared with zero
drift between backend, web, and mobile.

## 5.1 Top level

```
edunexus-erp/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # Next.js frontend
│   └── mobile/       # Flutter app (separate toolchain; see docs/11)
├── packages/
│   ├── design-tokens/  # colors/spacing/typography → JSON + TS + Tailwind preset
│   ├── ui/             # shared React component library (Nexus DS)
│   ├── types/          # shared API contracts / zod schemas
│   └── config/         # eslint, tsconfig, tailwind, prettier presets
├── prisma/             # schema.prisma + migrations + seed
├── infra/
│   ├── docker/         # docker-compose for local dev
│   ├── k8s/            # manifests / Helm
│   └── terraform/      # AWS IaC
├── docs/               # the 15 deliverables
├── scripts/
├── turbo.json          # task pipeline
├── pnpm-workspace.yaml
└── package.json        # workspace root
```

## 5.2 Backend — `apps/api` (NestJS, modular)

```
apps/api/src/
├── main.ts                      # bootstrap (helmet, cors, swagger, versioning)
├── app.module.ts
├── config/                      # typed config (env validation via zod)
├── core/                        # cross-cutting platform concerns
│   ├── tenancy/                 # tenant resolution, context (ALS), guard, decorator
│   ├── prisma/                  # PrismaService + tenant client extension + RLS GUC
│   ├── auth/                    # strategies (jwt, otp, oauth), guards, MFA, sessions
│   ├── rbac/                    # roles, permissions, guard, @Permissions decorator
│   ├── audit/                   # audit interceptor + service
│   ├── events/                  # event bus, outbox
│   └── ai/                      # AI gateway client
├── common/                      # dto base, pagination, filters, interceptors, pipes, errors
├── modules/                     # one folder per bounded context, identical shape:
│   ├── students/
│   │   ├── students.module.ts
│   │   ├── students.controller.ts      # REST
│   │   ├── students.resolver.ts        # GraphQL
│   │   ├── students.service.ts         # use-cases / transactions
│   │   ├── students.repository.ts      # Prisma access (tenant-scoped)
│   │   ├── dto/                         # create/update/query DTOs (validated)
│   │   └── students.spec.ts            # tests (incl. isolation)
│   ├── academics/  attendance/  exams/  lms/  finance/  hr/  library/
│   ├── transport/  hostel/  communication/  notifications/  reporting/
│   ├── admissions/ timetable/ billing/  platform/ (super-admin, cross-tenant)
│   └── files/
├── workers/                     # BullMQ processors (notifications, grading, reports, ai, imports)
└── graphql/                     # schema composition, dataloaders
```

**Module rule:** every feature module has the same 6-file shape (module, controller, resolver, service,
repository, dto) so a new engineer can navigate any module instantly.

## 5.3 Frontend — `apps/web` (Next.js App Router)

```
apps/web/src/
├── app/
│   ├── (marketing)/             # public site, pricing, tenant registration
│   ├── (auth)/login, /otp, /oauth-callback
│   ├── (super-admin)/           # platform portal route group
│   ├── (app)/                   # tenant app shell (role-aware)
│   │   ├── dashboard/
│   │   ├── students/            # list, [id], new (wizard)
│   │   ├── academics/ attendance/ exams/ lms/ finance/ hr/
│   │   ├── library/ transport/ hostel/ communication/ reports/ settings/
│   │   └── layout.tsx           # AppShell + tenant theme provider
│   └── api/                     # route handlers (BFF proxies, webhooks) if needed
├── components/                  # app-specific compositions (use packages/ui primitives)
├── features/                    # feature-scoped hooks/queries/state (mirrors api modules)
├── lib/                         # api client, auth, query client, i18n, utils
├── styles/                      # globals.css, tailwind layer, theme variables
└── middleware.ts                # tenant resolution (subdomain/custom domain) + auth gate
```

- **Data fetching**: TanStack Query (server-state) + React Server Components for initial loads; mutations via
  typed client generated from OpenAPI (`packages/types`).
- **State**: Zustand for ephemeral UI state; URL state for filters.
- **Routing**: route groups per portal; middleware resolves tenant + guards auth/role.

## 5.4 Shared packages

| Package | Contents |
|---------|----------|
| `@edunexus/design-tokens` | `tokens.json` → generated `tokens.ts`, Tailwind preset, Flutter export |
| `@edunexus/ui` | Nexus DS components (Button, DataTable, Card, Charts, AIChatPanel…) + Storybook |
| `@edunexus/types` | Zod schemas + inferred TS types shared by api & web; OpenAPI-generated client |
| `@edunexus/config` | `eslint-config`, `tsconfig`, `tailwind-config`, `prettier-config` |

## 5.5 Turborepo pipeline (`turbo.json`)

```jsonc
{
  "pipeline": {
    "build":     { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev":       { "cache": false, "persistent": true },
    "lint":      {},
    "typecheck": { "dependsOn": ["^build"] },
    "test":      { "dependsOn": ["^build"] }
  }
}
```

This structure keeps **tenant isolation, RBAC, and audit in `core/`** (write once, used everywhere) while
feature teams own self-contained `modules/` — the key to scaling the codebase across many engineers.
