# 08 — ER Diagrams

Rendered with Mermaid (`erDiagram`). `tenant_id` is implicit on every tenant-scoped entity (omitted from
diagrams for readability). Diagrams are split by bounded context.

## 8.1 Tenancy & Billing

```mermaid
erDiagram
  TENANT ||--o{ TENANT_DOMAIN : has
  TENANT ||--|| TENANT_SETTINGS : configures
  TENANT ||--o{ SUBSCRIPTION : subscribes
  PLAN   ||--o{ SUBSCRIPTION : offered_as
  SUBSCRIPTION ||--o{ INVOICE : bills
  INVOICE ||--o{ PAYMENT : settled_by
  TENANT ||--o{ SUPPORT_TICKET : raises
  TENANT ||--o{ USER : owns

  TENANT { uuid id PK "institution_code, type, status, isolation_tier, region" }
  PLAN { uuid id PK "name, price, limits_jsonb" }
  SUBSCRIPTION { uuid id PK "status, period_start, period_end, seats" }
```

## 8.2 Identity & Access

```mermaid
erDiagram
  USER ||--o{ USER_IDENTITY : authenticates_with
  USER ||--o{ USER_ROLE : assigned
  ROLE ||--o{ USER_ROLE : grants
  ROLE ||--o{ ROLE_PERMISSION : includes
  PERMISSION ||--o{ ROLE_PERMISSION : in
  USER ||--o{ SESSION : opens
  USER ||--o{ DEVICE : registers
  USER ||--o{ MFA_FACTOR : secures
  USER ||--o{ AUDIT_LOG : actor_of

  USER { uuid id PK "email, username, phone, status" }
  ROLE { uuid id PK "key, name, is_system" }
  PERMISSION { uuid id PK "key e.g. students:create" }
```

## 8.3 Students & Guardians

```mermaid
erDiagram
  STUDENT ||--o{ STUDENT_DOCUMENT : has
  STUDENT ||--o{ STUDENT_MEDICAL_RECORD : has
  STUDENT ||--o{ STUDENT_GUARDIAN : linked
  GUARDIAN ||--o{ STUDENT_GUARDIAN : of
  STUDENT ||--o{ ENROLLMENT : enrolled
  STUDENT ||--o{ DISCIPLINARY_RECORD : has
  STUDENT ||--o{ STUDENT_TIMELINE_EVENT : timeline
  ADMISSION ||--o| STUDENT : becomes
  SECTION ||--o{ STUDENT : contains

  STUDENT { uuid id PK "admission_no, name, status, current_section_id" }
  GUARDIAN { uuid id PK "name, relation, phone, is_parent_portal_user" }
  ADMISSION { uuid id PK "application_no, stage, decision" }
```

## 8.4 Academics & Timetable

```mermaid
erDiagram
  ACADEMIC_YEAR ||--o{ CLASS : spans
  PROGRAM ||--o{ COURSE : contains
  COURSE ||--o{ SUBJECT : groups
  CLASS ||--o{ SECTION : divided_into
  SECTION ||--o{ CLASS_SUBJECT : offers
  SUBJECT ||--o{ CLASS_SUBJECT : taught_as
  STAFF ||--o{ CLASS_SUBJECT : teaches
  CLASS_SUBJECT ||--o{ TIMETABLE_SLOT : scheduled
  ROOM ||--o{ TIMETABLE_SLOT : in
  SUBJECT ||--o{ LESSON_PLAN : planned
  SUBJECT ||--o{ LEARNING_OUTCOME : targets

  SECTION { uuid id PK "name, capacity, class_id" }
  CLASS_SUBJECT { uuid id PK "section_id, subject_id, teacher_id" }
  TIMETABLE_SLOT { uuid id PK "day, period, start, end, room_id" }
```

## 8.5 Attendance

```mermaid
erDiagram
  SECTION ||--o{ ATTENDANCE_SESSION : for
  CLASS_SUBJECT ||--o{ ATTENDANCE_SESSION : during
  ATTENDANCE_SESSION ||--o{ ATTENDANCE_RECORD : produces
  STUDENT ||--o{ ATTENDANCE_RECORD : marked
  ATTENDANCE_DEVICE ||--o{ ATTENDANCE_RECORD : captured_by

  ATTENDANCE_SESSION { uuid id PK "date, period, taken_by" }
  ATTENDANCE_RECORD { uuid id PK "status, method, marked_at" }
  ATTENDANCE_DEVICE { uuid id PK "kind QR|RFID|BIOMETRIC|FACE|GPS" }
```

## 8.6 Examinations & Results

```mermaid
erDiagram
  EXAM ||--o{ EXAM_SCHEDULE : has
  EXAM_SCHEDULE ||--o{ EXAM_PAPER : uses
  QUESTION_BANK ||--o{ QUESTION : stores
  EXAM_PAPER ||--o{ QUESTION : contains
  STUDENT ||--o{ EXAM_SUBMISSION : submits
  EXAM_PAPER ||--o{ EXAM_SUBMISSION : answered_in
  EXAM_SUBMISSION ||--o{ MARK : graded_into
  STUDENT ||--o{ RESULT : receives
  RESULT ||--o| TRANSCRIPT : compiled_into
  STUDENT ||--o{ GPA_RECORD : computed
  RESULT ||--o{ RANKING : ranked

  EXAM { uuid id PK "name, term, type online|offline" }
  MARK { uuid id PK "score, max, grade" }
  RESULT { uuid id PK "total, percentage, gpa, status" }
```

## 8.7 Finance

```mermaid
erDiagram
  FEE_HEAD ||--o{ FEE_STRUCTURE_ITEM : part_of
  FEE_STRUCTURE ||--o{ FEE_STRUCTURE_ITEM : composed_of
  FEE_STRUCTURE ||--o{ STUDENT_FEE_ASSIGNMENT : assigned
  STUDENT ||--o{ STUDENT_FEE_ASSIGNMENT : owes
  STUDENT_FEE_ASSIGNMENT ||--o{ INVOICE_FEE : invoiced
  INVOICE_FEE ||--o{ PAYMENT_FEE : paid_by
  PAYMENT_FEE ||--o| RECEIPT : produces
  STUDENT ||--o{ SCHOLARSHIP : awarded
  PAYMENT_FEE ||--o| PAYMENT_GATEWAY_TXN : via

  FEE_STRUCTURE { uuid id PK "name, academic_year_id, currency" }
  INVOICE_FEE { uuid id PK "number, amount, due_date, status" }
  PAYMENT_FEE { uuid id PK "amount, method, status" }
```

## 8.8 Library / Transport / Hostel (condensed)

```mermaid
erDiagram
  LIBRARY_ITEM ||--o{ LIBRARY_COPY : has
  LIBRARY_COPY ||--o{ BORROW_TRANSACTION : borrowed
  STUDENT ||--o{ BORROW_TRANSACTION : by
  BORROW_TRANSACTION ||--o| LIBRARY_FINE : may_incur

  ROUTE ||--o{ ROUTE_STOP : has
  VEHICLE ||--o{ VEHICLE_LOCATION : tracks
  DRIVER ||--o{ VEHICLE : drives
  STUDENT ||--o{ TRANSPORT_ALLOCATION : assigned
  ROUTE ||--o{ TRANSPORT_ALLOCATION : on

  HOSTEL ||--o{ HOSTEL_ROOM : has
  HOSTEL_ROOM ||--o{ HOSTEL_ALLOCATION : assigned
  STUDENT ||--o{ HOSTEL_ALLOCATION : occupies
  HOSTEL ||--o{ HOSTEL_VISITOR : logs
```

## 8.9 AI

```mermaid
erDiagram
  USER ||--o{ AI_CONVERSATION : starts
  AI_CONVERSATION ||--o{ AI_MESSAGE : contains
  AI_DOCUMENT ||--o{ AI_EMBEDDING : vectorized_into
  STUDENT ||--o{ AI_INSIGHT : about
  AI_CONVERSATION ||--o{ AI_USAGE : meters

  AI_CONVERSATION { uuid id PK "assistant_kind, context" }
  AI_INSIGHT { uuid id PK "kind risk|prediction|recommendation, score" }
  AI_EMBEDDING { uuid id PK "vector(1536), source_ref" }
```

> Tip: paste any block into the Mermaid Live Editor (mermaid.live) or view inline in GitHub / VS Code.
