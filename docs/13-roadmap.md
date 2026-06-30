# 13 — Development Roadmap

Phased delivery from foundation to global scale. Durations assume a focused team (~8–14 engineers across
backend, frontend, mobile, DevOps, design, QA). Each phase ships a usable increment.

## Phase 0 — Foundation (Weeks 1–4) ✅ scaffolded in this repo
- Monorepo (pnpm + Turborepo), CI/CD, Docker local stack, env/config.
- **Core platform**: tenancy (resolution + context + RLS), auth (JWT + sessions), RBAC, audit, Prisma schema.
- Design system foundation (tokens, AppShell, primitives) + Storybook.
- Tenant-isolation test suite (CI gate).
- **Exit**: a tenant can be created, an admin can log in, isolation is proven.

## Phase 1 — MVP core (Weeks 5–12)
- Super Admin portal: tenant registration/approval, plans, basic billing.
- Institution setup: profile, branding, academic years, campuses, departments, classes/sections.
- Student Management: admissions → enrollment → profiles → documents → ID generation.
- Teacher/Staff basics; user/role management UI.
- Attendance (manual + QR) + reports.
- Notifications (email + in-app).
- **Exit**: a school can onboard, enroll students, and take attendance end-to-end.

## Phase 2 — Academic & Finance (Weeks 13–22)
- Academics: subjects, curriculum, timetable, lesson plans, academic calendar.
- Examinations: scheduling, marks entry, grading, results, transcripts, GPA, ranking.
- Finance: fee structures, invoices, online payments (Stripe + 1 regional gateway), receipts, scholarships,
  expense tracking, financial reports.
- Parent portal v1 (progress, attendance, fee payment).
- **Exit**: full academic + fee lifecycle for a term.

## Phase 3 — LMS, Communication & Mobile (Weeks 23–32)
- LMS: course materials, video lessons, assignments, quizzes, discussions, engagement tracking.
- Communication: SMS + push, announcements, messaging, events, emergency alerts.
- **Flutter mobile apps** (Student, Parent, Teacher) with offline + biometric + push.
- Reporting/BI v1: executive dashboards, exports (PDF/Excel).
- **Exit**: blended learning + mobile-first engagement live.

## Phase 4 — Operations modules (Weeks 33–42)
- Library (catalog, barcode, borrow/return, fines, digital library).
- Transport (routes, GPS live tracking, allocations, pickup alerts).
- Hostel (rooms, allocations, visitors, attendance).
- HR & Payroll (employees, leave, payroll runs, performance reviews, recruitment).
- Advanced attendance methods (RFID, biometric, face, GPS geofence).
- **Exit**: full institutional operations covered.

## Phase 5 — AI & Intelligence (Weeks 43–52)
- AI Gateway + RAG; assistants (Student, Teacher, Parent, Admin) + chatbot.
- Predictive: performance prediction, dropout/risk detection, attendance anomalies.
- AI report generation, timetable optimization, financial insights, recommendation engine.
- **Exit**: AI features GA with guardrails, metering, human-in-the-loop.

## Phase 6 — Enterprise, scale & global (Weeks 53–64+)
- White-label + custom domains GA; SSO/SAML; advanced RBAC.
- GraphQL BFF GA; public/partner API + webhooks + SDKs.
- Postgres sharding, multi-region, regional silos, ClickHouse analytics.
- Compliance certifications (SOC 2 Type II), accessibility audit (WCAG 2.1 AA).
- Marketplace/integrations (Zoom, Google Classroom, payment providers, SIS importers).
- **Exit**: ready for thousands of tenants and 1M+ users globally.

## Continuous (every phase)
- Security reviews, dependency/SAST/DAST scans, isolation tests.
- Performance budgets + load tests before each GA.
- Documentation, Storybook, API docs kept current.
- Beta program with design-partner institutions for feedback.

## Milestone summary

| Milestone | When | Outcome |
|-----------|------|---------|
| M0 Foundation | Wk 4 | Multi-tenant core proven |
| M1 MVP | Wk 12 | First real school onboarded |
| M2 Academic+Finance | Wk 22 | Full term lifecycle |
| M3 LMS+Mobile | Wk 32 | Mobile apps in stores |
| M4 Operations | Wk 42 | All ops modules |
| M5 AI | Wk 52 | Intelligence layer GA |
| M6 Enterprise/Scale | Wk 64+ | Global, certified, sharded |
