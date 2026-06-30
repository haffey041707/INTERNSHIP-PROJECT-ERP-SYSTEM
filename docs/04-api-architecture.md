# 04 — API Architecture

EduNexus exposes three complementary surfaces over the same domain services:

| Surface | Use | Tech |
|---------|-----|------|
| **REST v1** | CRUD, integrations, mobile, webhooks | NestJS controllers, OpenAPI 3.1 |
| **GraphQL** | Dashboard data-fetching / aggregation (BFF) | Apollo Server, code-first |
| **WebSocket** | Realtime: live attendance, chat, GPS, notifications | Socket.IO + Redis adapter |

## 4.1 Conventions (REST)

- Base path: `/api/v1`. Versioned by URL; breaking changes → `/api/v2`.
- **Tenant context required** on every call: subdomain/custom-domain or `X-Institution-Id` header, plus
  `Authorization: Bearer <JWT>` (JWT also carries `tid`). Mismatch → 401.
- Resource-oriented, plural nouns: `/students`, `/students/{id}`, `/students/{id}/documents`.
- **Pagination:** cursor-based — `?limit=50&cursor=...`; response `{ data, pageInfo:{ endCursor, hasNextPage } }`.
- **Filtering/sort:** `?filter[status]=ACTIVE&sort=-createdAt`.
- **Idempotency:** mutations accept `Idempotency-Key` header (stored in Redis 24h).
- **Errors:** RFC 9457 Problem Details.
  ```json
  { "type":"https://errors.edunexus.io/validation","title":"Validation failed",
    "status":422,"code":"STUDENT_DUPLICATE_ADMISSION_NO","traceId":"...",
    "errors":[{"field":"admissionNo","message":"already exists"}] }
  ```
- **Rate limits:** per-tenant + per-user token buckets; `429` with `Retry-After` and `RateLimit-*` headers.
- **Auth scopes** map to RBAC permission keys (`students:read`, `finance:invoice:create`).

## 4.2 Representative endpoint map (excerpt)

```
Auth
  POST   /api/v1/auth/login                 (institution_id + identifier + password)
  POST   /api/v1/auth/otp/request | /verify
  GET    /api/v1/auth/oauth/google | microsoft (+ /callback)
  POST   /api/v1/auth/mfa/verify
  POST   /api/v1/auth/refresh | /logout
  GET    /api/v1/auth/me

Tenancy (super-admin)
  POST   /api/v1/admin/tenants                 (register)
  PATCH  /api/v1/admin/tenants/{id}/approve|suspend
  GET    /api/v1/admin/analytics/overview

Students
  GET    /api/v1/students            ?filter,sort,cursor
  POST   /api/v1/students
  GET/PATCH/DELETE /api/v1/students/{id}
  POST   /api/v1/students/{id}/promote
  GET    /api/v1/students/{id}/timeline

Academics      /classes /sections /subjects /timetable /curricula /lesson-plans
Attendance     POST /attendance/bulk · GET /attendance/reports · /devices
Exams          /exams /exams/{id}/schedule /question-bank /results /transcripts/{studentId}
LMS            /lms/courses /assignments /assignments/{id}/submissions /quizzes
Finance        /fees/structures /fees/invoices /payments /payments/checkout /scholarships /reports
HR             /staff /leave-requests /payroll/runs /payslips
Library        /library/items /library/borrow /library/return /library/fines
Transport      /transport/routes /transport/vehicles/{id}/location (WS) /transport/allocations
Hostel         /hostels /hostel/allocations /hostel/visitors
Comms          /announcements /messages /notifications /events
AI             POST /ai/chat (SSE stream) · /ai/insights · /ai/reports/generate
Billing        /billing/subscription /billing/invoices /webhooks/stripe
Files          POST /files/presign  (returns S3 presigned PUT)
```

## 4.3 GraphQL (BFF for dashboards)

Used where a screen needs many related entities in one round trip (e.g. a student profile page pulling
profile + attendance summary + fees + results). Schema is **code-first** (NestJS `@nestjs/graphql`), guarded by
the same tenant + RBAC guards, with **DataLoader** to batch and avoid N+1.

```graphql
type Query {
  student(id: ID!): Student
  dashboardOverview: AdminDashboard!   # KPIs, charts, alerts in one call
}
type Student {
  id: ID! firstName: String! lastName: String!
  section: Section
  attendanceSummary(range: DateRange): AttendanceSummary!
  feeStatus: FeeStatus!
  results(term: String): [Result!]!
}
```

Query depth/complexity limits + persisted queries protect against abuse.

## 4.4 Realtime (WebSocket)

- Namespaces per concern: `/attendance`, `/chat`, `/transport`, `/notifications`.
- Rooms keyed by `tenantId:resourceId`; **Redis adapter** for multi-pod fan-out.
- Auth handshake validates JWT + tenant before joining any room.

## 4.5 Async & events

Domain events published to **BullMQ/SQS + EventBridge**:
`student.enrolled`, `attendance.recorded`, `invoice.paid`, `exam.published`, `ai.insight.created`.
Consumers: notifications, analytics rollups, AI risk detection, webhooks to tenant integrations.
**Outbox pattern** guarantees event delivery consistency with DB writes.

## 4.6 Public/partner API & webhooks

- Tenant-scoped **API keys** (hashed, scoped, rotatable) for SIS/LMS integrations.
- Outbound **webhooks** with HMAC signatures + retries + dead-letter.
- OpenAPI spec auto-published at `/api/docs` (Swagger UI) and as a downloadable SDK (TS/Python) generator target.

## 4.7 Versioning & deprecation

- Additive changes are non-breaking; breaking changes bump major version.
- Deprecations announced via `Deprecation`/`Sunset` headers + changelog, min 6-month window for tenants.

## 4.8 API gateway responsibilities

TLS termination, WAF, global + per-tenant rate limiting, request size limits, auth pre-check, request-id
injection, and routing to the correct service (and, for SILO tenants, the correct regional cluster).
