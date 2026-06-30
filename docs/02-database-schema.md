# 02 — Database Schema Design

PostgreSQL 16. Every tenant-scoped table carries `tenant_id uuid NOT NULL` (FK → `tenants.id`) and is protected
by Row-Level Security (see [doc 03](./03-multi-tenant-architecture.md)). The canonical, runnable schema lives in
[`prisma/schema.prisma`](../prisma/schema.prisma); this document explains the design.

## 2.1 Conventions

- **PKs:** `uuid` (v7, time-ordered for index locality).
- **Audit columns:** `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (soft delete).
- **Tenant column:** `tenant_id` on every tenant-scoped table; composite indexes always lead with `tenant_id`.
- **Money:** stored as integer **minor units** + `currency` (ISO 4217). Never floats.
- **Enums:** Postgres native enums for stable sets; lookup tables for tenant-customizable sets (e.g. grades).
- **JSONB:** for flexible/extensible attributes (settings, metadata) — but core queryable fields are columns.

## 2.2 Domain map (bounded contexts → key tables)

### A. Platform / Tenancy (global, not tenant-scoped)
| Table | Purpose |
|-------|---------|
| `tenants` | Institution record: `institution_code` (e.g. DEMO-001), name, type, status, isolation_tier, region |
| `tenant_domains` | custom/sub domains → tenant, TLS cert status |
| `tenant_settings` | branding, locale, currency, feature flags (JSONB + typed) |
| `plans` | subscription plans, limits, prices |
| `subscriptions` | tenant ↔ plan, status, period, seats |
| `invoices`, `payments` | platform billing |
| `support_tickets` | super-admin support desk |
| `platform_announcements` | global notices |
| `feature_flags` | per-plan / per-tenant toggles |

### B. Identity & Access (tenant-scoped, except super-admin)
`users`, `user_identities` (oauth/otp providers), `roles`, `permissions`, `role_permissions`,
`user_roles`, `sessions`, `devices`, `mfa_factors`, `audit_logs`, `password_resets`.

### C. Institution structure
`academic_years`, `campuses`, `buildings`, `rooms`, `faculties`, `departments`, `programs`.

### D. Students
`students`, `student_documents`, `student_medical_records`, `guardians`, `student_guardians`,
`admissions` (applications + workflow), `enrollments`, `promotions`, `transfers`, `disciplinary_records`,
`alumni`, `student_timeline_events`.

### E. Academics
`courses`, `subjects`, `classes`, `sections`, `class_subjects` (offering),
`curricula`, `lesson_plans`, `timetable_slots`, `learning_outcomes`, `academic_calendar_events`.

### F. Teachers / HR
`staff` (employees), `staff_qualifications`, `teacher_assignments` (workload), `staff_attendance`,
`leave_types`, `leave_requests`, `performance_reviews`, `recruitment_postings`, `applicants`,
`payroll_runs`, `payslips`, `salary_structures`.

### G. Attendance
`attendance_sessions`, `attendance_records` (status, method: QR/RFID/BIOMETRIC/FACE/GPS/MANUAL),
`attendance_devices`.

### H. Examinations & results
`exams`, `exam_schedules`, `question_bank`, `questions`, `exam_papers`, `exam_submissions`,
`marks`, `grades` (scale), `results`, `transcripts`, `gpa_records`, `rankings`.

### I. LMS
`lms_courses`, `lms_modules`, `lessons` (video/material), `assignments`, `assignment_submissions`,
`quizzes`, `quiz_attempts`, `discussion_threads`, `discussion_posts`, `engagement_events`.

### J. Finance
`fee_heads`, `fee_structures`, `fee_structure_items`, `student_fee_assignments`, `invoices_fee`,
`payments_fee`, `receipts`, `scholarships`, `discounts`, `expenses`, `budgets`, `ledger_entries`,
`payment_gateway_txns`.

### K. Library
`library_items` (books/e-books), `library_copies`, `borrow_transactions`, `library_fines`,
`reservations`, `reading_events`.

### L. Transport
`vehicles`, `drivers`, `routes`, `route_stops`, `vehicle_locations` (time-series), `transport_allocations`.

### M. Hostel
`hostels`, `hostel_rooms`, `hostel_allocations`, `hostel_visitors`, `hostel_attendance`, `hostel_fees`.

### N. Communication & Notifications
`message_threads`, `messages`, `announcements`, `notifications`, `notification_preferences`,
`events`, `event_rsvps`, `emergency_alerts`.

### O. AI
`ai_conversations`, `ai_messages`, `ai_insights` (predictions/risk flags), `ai_documents` (RAG sources),
`ai_embeddings` (pgvector), `ai_usage` (token metering).

## 2.3 Representative DDL (illustrative)

```sql
CREATE TABLE tenants (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  institution_code text UNIQUE NOT NULL,          -- "DEMO-001"
  name             text NOT NULL,
  type             text NOT NULL,                  -- SCHOOL | COLLEGE | UNIVERSITY | INSTITUTE
  status           text NOT NULL DEFAULT 'PROVISIONING',
  isolation_tier   text NOT NULL DEFAULT 'POOLED', -- POOLED | SCHEMA | SILO
  region           text NOT NULL DEFAULT 'us-east-1',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE students (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  admission_no     text NOT NULL,
  roll_no          text,
  first_name       text NOT NULL,
  last_name        text NOT NULL,
  date_of_birth    date,
  gender           text,
  status           text NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE|GRADUATED|TRANSFERRED|WITHDRAWN
  current_section_id uuid REFERENCES sections(id),
  metadata         jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,
  UNIQUE (tenant_id, admission_no)
);
CREATE INDEX idx_students_tenant_section ON students (tenant_id, current_section_id) WHERE deleted_at IS NULL;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE students FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON students
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE TABLE attendance_records (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  session_id    uuid NOT NULL REFERENCES attendance_sessions(id),
  student_id    uuid NOT NULL REFERENCES students(id),
  status        text NOT NULL,                    -- PRESENT|ABSENT|LATE|EXCUSED
  method        text NOT NULL DEFAULT 'MANUAL',   -- QR|RFID|BIOMETRIC|FACE|GPS|MANUAL
  marked_at     timestamptz NOT NULL DEFAULT now(),
  marked_by     uuid,
  UNIQUE (tenant_id, session_id, student_id)
);
```

## 2.4 Partitioning & time-series

- High-volume tables (`attendance_records`, `audit_logs`, `notifications`, `vehicle_locations`, `ai_usage`,
  `engagement_events`) are **range-partitioned by month** on `created_at`/`marked_at` and sub-indexed by
  `tenant_id`. Old partitions are detached → cold storage per retention policy.
- `vehicle_locations` uses **TimescaleDB hypertable** (or partitioned table) for GPS tracks.

## 2.5 Indexing strategy

- Always lead composite indexes with `tenant_id`.
- Partial indexes excluding `deleted_at IS NOT NULL`.
- Covering indexes for dashboard hot paths (e.g. `(tenant_id, status, current_section_id) INCLUDE (first_name,last_name)`).
- GIN indexes on JSONB `metadata` where tenant-defined filters are needed.
- `pgvector` IVFFlat/HNSW index on `ai_embeddings.embedding`.

## 2.6 Read scaling

- **Read replicas** for reporting/BI and heavy list endpoints (routed via Prisma datasource or PgBouncer).
- **Materialized views** for executive dashboards, refreshed by scheduled jobs.
- Search/aggregations offloaded to **OpenSearch** (CDC via Debezium → Kafka/Kinesis).

## 2.7 Data integrity & retention

- FKs enforced; `ON DELETE RESTRICT` for masters, soft-delete for records.
- GDPR/FERPA: per-tenant retention windows; `right-to-erasure` job anonymizes PII while preserving aggregates.
- PITR enabled (WAL archiving to S3); daily snapshots; cross-region replica for DR.
